
-- Feedback system table
CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  admin_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own feedback" ON public.feedback
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback" ON public.feedback
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback" ON public.feedback
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update feedback" ON public.feedback
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete feedback" ON public.feedback
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Comeback bonus tracking table
CREATE TABLE public.comeback_bonuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  days_inactive integer NOT NULL DEFAULT 0,
  xp_awarded integer NOT NULL DEFAULT 50,
  claimed_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.comeback_bonuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own comeback bonus" ON public.comeback_bonuses
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own comeback bonuses" ON public.comeback_bonuses
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Blog articles table for admin-managed blog
CREATE TABLE public.blog_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  meta_title text,
  meta_description text,
  excerpt text,
  content text,
  category text DEFAULT 'Guide',
  read_time text DEFAULT '5 min read',
  featured boolean DEFAULT false,
  image text,
  keywords text[] DEFAULT '{}',
  published boolean DEFAULT true,
  published_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published blog articles" ON public.blog_articles
  FOR SELECT USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert blog articles" ON public.blog_articles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update blog articles" ON public.blog_articles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete blog articles" ON public.blog_articles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
