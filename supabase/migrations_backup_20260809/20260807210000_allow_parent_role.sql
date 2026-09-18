-- 1. Update handle_new_user trigger to allow 'parent' role
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
  -- ADDED 'parent' to allowed roles
  IF assigned_role NOT IN ('student', 'teacher', 'admin', 'parent') THEN
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
