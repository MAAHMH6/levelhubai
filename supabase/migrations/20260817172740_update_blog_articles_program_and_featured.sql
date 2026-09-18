-- Add featured_on_subject_page column
ALTER TABLE public.blog_articles 
ADD COLUMN IF NOT EXISTS featured_on_subject_page BOOLEAN DEFAULT false;

-- Drop the old constraint to allow A Level
ALTER TABLE public.blog_articles 
DROP CONSTRAINT IF EXISTS blog_articles_program_check;

-- Add updated constraint
ALTER TABLE public.blog_articles 
ADD CONSTRAINT blog_articles_program_check CHECK (program = ANY (ARRAY['O Level'::text, 'IGCSE'::text, 'A Level'::text, 'Both'::text, 'All'::text]));
