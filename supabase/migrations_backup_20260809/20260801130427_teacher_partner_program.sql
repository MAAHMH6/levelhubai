-- 1. Modify Profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'student';
-- Validate role
DO $$ BEGIN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'teacher', 'admin'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Seed defaults for Teacher Partner Program (assuming app_settings already exists with 'key' column)
INSERT INTO public.app_settings (key, value) VALUES
('teacher_commission_percent', '10'::jsonb),
('student_referral_discount_percent', '10'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 3. Create teacher_profiles
CREATE TABLE IF NOT EXISTS public.teacher_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  total_earned INTEGER NOT NULL DEFAULT 0,
  available_balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Create referrals
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.teacher_profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(student_id)
);

-- 5. Create commissions
CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.teacher_profiles(id) ON DELETE CASCADE,
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  payment_id UUID NOT NULL, 
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(payment_id)
);

-- 6. Create withdrawals
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.teacher_profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  payment_method TEXT NOT NULL,
  payment_details JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Create classes & class_students
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.teacher_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  join_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.class_students (
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (class_id, student_id)
);

-- 8. Setup RLS
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;

-- App Settings RLS is already managed in a previous migration

-- Teacher Profiles: Teachers read their own, students read none, admins read all
CREATE POLICY "Teachers can read own profile" ON public.teacher_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can read all teacher profiles" ON public.teacher_profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update teacher profiles" ON public.teacher_profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Referrals: Teachers read their own students, admins read all
CREATE POLICY "Teachers can view their referrals" ON public.referrals FOR SELECT USING (auth.uid() = teacher_id);
CREATE POLICY "Students can view their own referral" ON public.referrals FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Admins can manage referrals" ON public.referrals FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Commissions: Teachers read their own, admins manage all
CREATE POLICY "Teachers can view their commissions" ON public.commissions FOR SELECT USING (auth.uid() = teacher_id);
CREATE POLICY "Admins can manage commissions" ON public.commissions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Withdrawals: Teachers read/insert their own, admins manage all
CREATE POLICY "Teachers can view their withdrawals" ON public.withdrawals FOR SELECT USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can insert their withdrawals" ON public.withdrawals FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Admins can manage withdrawals" ON public.withdrawals FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Classes: Teachers manage their own, students view their own, admins manage all
CREATE POLICY "Teachers can manage their classes" ON public.classes FOR ALL USING (auth.uid() = teacher_id);
CREATE POLICY "Students can view joined classes" ON public.classes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.class_students WHERE class_id = public.classes.id AND student_id = auth.uid())
);
CREATE POLICY "Admins can manage classes" ON public.classes FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view class students" ON public.class_students FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.classes WHERE id = public.class_students.class_id AND teacher_id = auth.uid())
);
CREATE POLICY "Students can view own class memberships" ON public.class_students FOR SELECT USING (auth.uid() = student_id);

-- 9. Update handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  assigned_role TEXT;
  referral_code_input TEXT;
  teacher_id_matched UUID;
  new_teacher_ref_code TEXT;
BEGIN
  -- Determine role
  assigned_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'student');
  IF assigned_role NOT IN ('student', 'teacher', 'admin') THEN
    assigned_role := 'student';
  END IF;

  -- Create Profile
  INSERT INTO public.profiles (id, display_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.raw_user_meta_data ->> 'avatar_url',
    assigned_role
  );

  -- If user is a teacher, generate referral code and insert into teacher_profiles
  IF assigned_role = 'teacher' THEN
    -- generate a simple referral code based on their name or email prefix + random string
    new_teacher_ref_code := UPPER(SUBSTRING(REGEXP_REPLACE(COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email), '[^a-zA-Z]', '', 'g'), 1, 5)) || SUBSTRING(MD5(RANDOM()::TEXT), 1, 4);
    
    INSERT INTO public.teacher_profiles (id, referral_code)
    VALUES (NEW.id, new_teacher_ref_code);
  END IF;

  -- If user is a student and provided a referral code, map it
  IF assigned_role = 'student' THEN
    referral_code_input := NEW.raw_user_meta_data ->> 'referral_code';
    IF referral_code_input IS NOT NULL THEN
      -- find teacher
      SELECT id INTO teacher_id_matched FROM public.teacher_profiles WHERE UPPER(referral_code) = UPPER(referral_code_input) AND status = 'active';
      
      IF teacher_id_matched IS NOT NULL THEN
        INSERT INTO public.referrals (student_id, teacher_id, referral_code)
        VALUES (NEW.id, teacher_id_matched, UPPER(referral_code_input));
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
