-- 1. Add referral_code to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Backfill referral_code for existing profiles
UPDATE public.profiles
SET referral_code = 'LH-' || UPPER(SUBSTRING(MD5(id::text) FROM 1 FOR 6))
WHERE referral_code IS NULL;

-- 2. Create student_referrals
CREATE TABLE IF NOT EXISTS public.student_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active')),
  reward_status TEXT NOT NULL DEFAULT 'pending' CHECK (reward_status IN ('pending', 'rewarded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(referred_id)
);

-- RLS for student_referrals
ALTER TABLE public.student_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own referrals" 
ON public.student_referrals FOR SELECT 
USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Admins can manage student referrals" 
ON public.student_referrals FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Update handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  assigned_role TEXT;
  referral_code_input TEXT;
  teacher_id_matched UUID;
  student_id_matched UUID;
  new_teacher_ref_code TEXT;
  new_student_ref_code TEXT;
BEGIN
  -- Determine role
  assigned_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'student');
  IF assigned_role NOT IN ('student', 'teacher', 'admin') THEN
    assigned_role := 'student';
  END IF;

  -- Generate student referral code for everyone just in case
  new_student_ref_code := 'LH-' || UPPER(SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 6));

  -- Create Profile
  INSERT INTO public.profiles (id, display_name, avatar_url, role, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.raw_user_meta_data ->> 'avatar_url',
    assigned_role,
    new_student_ref_code
  );

  -- If user is a teacher, generate referral code and insert into teacher_profiles
  IF assigned_role = 'teacher' THEN
    -- generate a simple referral code based on their name or email prefix + random string
    new_teacher_ref_code := UPPER(SUBSTRING(REGEXP_REPLACE(COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email), '[^a-zA-Z]', '', 'g'), 1, 5)) || SUBSTRING(MD5(RANDOM()::TEXT), 1, 4);
    
    INSERT INTO public.teacher_profiles (id, referral_code)
    VALUES (NEW.id, new_teacher_ref_code);
  END IF;

  -- If user provided a referral code
  referral_code_input := NEW.raw_user_meta_data ->> 'referral_code';
  IF referral_code_input IS NOT NULL THEN
    -- First check if it's a teacher referral
    SELECT id INTO teacher_id_matched FROM public.teacher_profiles WHERE UPPER(referral_code) = UPPER(referral_code_input) AND status = 'active';
    
    IF teacher_id_matched IS NOT NULL THEN
      INSERT INTO public.referrals (student_id, teacher_id, referral_code)
      VALUES (NEW.id, teacher_id_matched, UPPER(referral_code_input));
    ELSE
      -- Check if it's a student referral
      SELECT id INTO student_id_matched FROM public.profiles WHERE UPPER(referral_code) = UPPER(referral_code_input);
      
      IF student_id_matched IS NOT NULL AND student_id_matched != NEW.id THEN
        INSERT INTO public.student_referrals (referrer_id, referred_id)
        VALUES (student_id_matched, NEW.id);
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 5. Helper function to grant pro access
CREATE OR REPLACE FUNCTION public.grant_pro_access(_user_id UUID, _days INT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_sub_id UUID;
  v_current_end TIMESTAMPTZ;
BEGIN
  -- Get active subscription if any
  SELECT id, current_period_end INTO v_sub_id, v_current_end 
  FROM public.subscriptions
  WHERE user_id = _user_id 
    AND status IN ('active', 'trialing') 
    AND (current_period_end IS NULL OR current_period_end > now())
  LIMIT 1;

  IF v_sub_id IS NOT NULL THEN
    -- Extend current period
    IF v_current_end IS NULL THEN
      v_current_end := now();
    END IF;
    UPDATE public.subscriptions 
    SET current_period_end = v_current_end + (_days || ' days')::INTERVAL,
        plan = 'pro'
    WHERE id = v_sub_id;
  ELSE
    -- Create new subscription
    INSERT INTO public.subscriptions (user_id, plan, status, started_at, current_period_end)
    VALUES (_user_id, 'pro', 'active', now(), now() + (_days || ' days')::INTERVAL);
  END IF;
  
  -- Update profile plan as a fallback
  UPDATE public.profiles SET subscription_plan = 'pro' WHERE id = _user_id;
END;
$$;

-- 4. Create trigger to mark student referral as active when XP > 0
CREATE OR REPLACE FUNCTION public.check_student_activation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_referrer_id UUID;
  v_active_count INT;
BEGIN
  -- If XP just went from 0 to >0, the student is now active
  IF (TG_OP = 'UPDATE' AND NEW.xp_points > 0 AND OLD.xp_points = 0) OR (TG_OP = 'INSERT' AND NEW.xp_points > 0) THEN
    -- Check if this student was referred by another student
    SELECT referrer_id INTO v_referrer_id 
    FROM public.student_referrals 
    WHERE referred_id = NEW.id AND status = 'pending';

    IF v_referrer_id IS NOT NULL THEN
      -- Mark referral as active
      UPDATE public.student_referrals 
      SET status = 'active', updated_at = now()
      WHERE referred_id = NEW.id;

      -- Count how many active referrals this referrer has
      SELECT COUNT(*) INTO v_active_count 
      FROM public.student_referrals 
      WHERE referrer_id = v_referrer_id AND status = 'active';

      -- Check if they hit a milestone (1 or 3) and haven't been rewarded for this specific referral
      -- Wait, if it's their 1st, we reward 7 days. If 3rd, we reward 30 days.
      IF v_active_count = 1 THEN
        -- Grant 7 Days Pro
        PERFORM public.grant_pro_access(v_referrer_id, 7);
        
        -- Mark as rewarded
        UPDATE public.student_referrals SET reward_status = 'rewarded' WHERE referred_id = NEW.id;

        -- Notify user
        INSERT INTO public.notifications (user_id, type, title, message)
        VALUES (v_referrer_id, 'referral_reward', 'Referral Milestone Reached!', 'Congratulations! Your friend joined LevelHubAI and became active. You have earned 7 Days of Pro.');

      ELSIF v_active_count = 3 THEN
        -- Grant 30 Days Pro
        PERFORM public.grant_pro_access(v_referrer_id, 30);
        
        -- Mark as rewarded
        UPDATE public.student_referrals SET reward_status = 'rewarded' WHERE referred_id = NEW.id;

        -- Notify user
        INSERT INTO public.notifications (user_id, type, title, message)
        VALUES (v_referrer_id, 'referral_reward', 'Referral Milestone Reached!', 'Congratulations! You referred 3 active students and unlocked 1 Month of Pro.');
      END IF;

    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_student_activation_trigger ON public.profiles;
CREATE TRIGGER check_student_activation_trigger
AFTER INSERT OR UPDATE OF xp_points ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.check_student_activation();
