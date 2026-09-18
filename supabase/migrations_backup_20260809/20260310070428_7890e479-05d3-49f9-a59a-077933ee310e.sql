-- Schools table (user-created, admin-verified)
CREATE TABLE public.schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  city text,
  is_verified boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- Everyone can view verified schools
CREATE POLICY "Anyone can view verified schools" ON public.schools
  FOR SELECT USING (is_verified = true OR has_role(auth.uid(), 'admin'::app_role));

-- Authenticated users can create schools
CREATE POLICY "Users can create schools" ON public.schools
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- Admins can update schools (verify/reject)
CREATE POLICY "Admins can update schools" ON public.schools
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete schools
CREATE POLICY "Admins can delete schools" ON public.schools
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Add school_id to profiles
ALTER TABLE public.profiles ADD COLUMN school_id uuid REFERENCES public.schools(id) DEFAULT NULL;

-- School invites table
CREATE TABLE public.school_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  invited_by uuid REFERENCES auth.users(id) NOT NULL,
  invited_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.school_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their invites" ON public.school_invites
  FOR SELECT USING (auth.uid() = invited_by OR auth.email() = invited_email);

CREATE POLICY "Users can create invites" ON public.school_invites
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = invited_by);

CREATE POLICY "Users can update received invites" ON public.school_invites
  FOR UPDATE USING (auth.email() = invited_email);

-- Admins can view all invites
CREATE POLICY "Admins can view all invites" ON public.school_invites
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
