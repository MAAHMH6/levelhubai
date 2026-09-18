-- Update profiles table check constraint to allow 'parent' role
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'teacher', 'admin', 'parent'));
