-- Create the student_topic_progress table
CREATE TABLE IF NOT EXISTS public.student_topic_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(student_id, topic_id)
);

-- Enable RLS
ALTER TABLE public.student_topic_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own progress" 
ON public.student_topic_progress 
FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Users can insert their own progress" 
ON public.student_topic_progress 
FOR INSERT 
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own progress" 
ON public.student_topic_progress 
FOR UPDATE 
USING (auth.uid() = student_id);

-- Add indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_student_topic_progress_student ON public.student_topic_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_topic_progress_topic ON public.student_topic_progress(topic_id);
