
-- Wave 2: Subject premium flag + access-control function
ALTER TABLE public.subjects
  ADD COLUMN IF NOT EXISTS is_premium boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS icon_url text,
  ADD COLUMN IF NOT EXISTS banner_url text,
  ADD COLUMN IF NOT EXISTS color text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS qualification text NOT NULL DEFAULT 'o_level',
  ADD COLUMN IF NOT EXISTS enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;

UPDATE public.subjects
   SET is_premium = false
 WHERE lower(name) IN ('ict','mathematics','physics','math','maths');

CREATE OR REPLACE FUNCTION public.user_can_access_subject(_user uuid, _subject_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM public.subjects WHERE lower(name)=lower(_subject_name) AND is_premium=false AND enabled=true) THEN true
    WHEN _user IS NULL THEN false
    WHEN public.has_role(_user, 'admin'::public.app_role) THEN true
    ELSE public.get_user_plan(_user) IN ('pro','school')
  END
$$;

GRANT EXECUTE ON FUNCTION public.user_can_access_subject(uuid, text) TO anon, authenticated, service_role;

-- Wave 3: Brand settings (singleton)
CREATE TABLE IF NOT EXISTS public.app_branding (
  id smallint PRIMARY KEY DEFAULT 1,
  brand_name text NOT NULL DEFAULT 'Level Hub AI',
  short_name text NOT NULL DEFAULT 'LevelHub AI',
  logo_url text,
  favicon_url text,
  footer_copyright text NOT NULL DEFAULT '© Level Hub AI. All rights reserved.',
  site_title text NOT NULL DEFAULT 'Level Hub AI — O Level & IGCSE AI Learning Platform',
  seo_title text NOT NULL DEFAULT 'Level Hub AI — Cambridge O Level & IGCSE Exam Prep with AI',
  seo_description text NOT NULL DEFAULT 'AI-powered Cambridge O Level & IGCSE exam preparation: notes, quizzes, past papers, and an AI tutor across every core subject.',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_branding_singleton CHECK (id = 1)
);

GRANT SELECT ON public.app_branding TO anon, authenticated;
GRANT ALL ON public.app_branding TO service_role;

ALTER TABLE public.app_branding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read branding" ON public.app_branding FOR SELECT USING (true);
CREATE POLICY "Admins manage branding" ON public.app_branding FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER app_branding_updated_at BEFORE UPDATE ON public.app_branding
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.app_branding (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Wave 3: Social links
CREATE TABLE IF NOT EXISTS public.social_links (
  key text PRIMARY KEY,
  label text NOT NULL,
  url text,
  enabled boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.social_links TO anon, authenticated;
GRANT ALL ON public.social_links TO service_role;

ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads social links" ON public.social_links FOR SELECT USING (true);
CREATE POLICY "Admins manage social links" ON public.social_links FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER social_links_updated_at BEFORE UPDATE ON public.social_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.social_links (key, label, sort_order) VALUES
  ('facebook','Facebook',1),
  ('instagram','Instagram',2),
  ('linkedin','LinkedIn',3),
  ('youtube','YouTube',4),
  ('tiktok','TikTok',5),
  ('x','X (Twitter)',6),
  ('whatsapp','WhatsApp',7),
  ('discord','Discord',8),
  ('email','Email',9),
  ('website','Website',10)
ON CONFLICT (key) DO NOTHING;

UPDATE public.social_links
   SET url = 'https://wa.me/923098444501', enabled = true
 WHERE key = 'whatsapp' AND url IS NULL;
