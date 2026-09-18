-- Add new columns to blog_articles for O Level / IGCSE support
ALTER TABLE public.blog_articles
ADD COLUMN IF NOT EXISTS program TEXT DEFAULT 'O Level' CHECK (program IN ('O Level', 'IGCSE', 'Both')),
ADD COLUMN IF NOT EXISTS subject TEXT,
ADD COLUMN IF NOT EXISTS topic TEXT,
ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'Admin';

-- Update existing articles based on their category or keywords if possible
UPDATE public.blog_articles 
SET program = 'IGCSE' 
WHERE category = 'IGCSE' OR 'IGCSE' = ANY(keywords);
