-- Drop the flawed policy that crashes for anonymous users
DROP POLICY IF EXISTS "Anyone can view published blog articles" ON public.blog_articles;

-- Create a safe policy for public users (no function calls)
CREATE POLICY "Public can view published blog articles" ON public.blog_articles
  FOR SELECT USING (published = true);

-- Create a separate policy for admins (only applies to authenticated users)
CREATE POLICY "Admins can view all blog articles" ON public.blog_articles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
