-- Add lesson_id to topics table to support hierarchical curriculum mapping
ALTER TABLE public.topics ADD COLUMN lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE;

-- Create an index to speed up filtering topics by lesson
CREATE INDEX idx_topics_lesson_id ON public.topics(lesson_id);
