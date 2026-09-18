-- Add image columns to blog_articles if they don't already exist
ALTER TABLE public.blog_articles 
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS image_alt text;
