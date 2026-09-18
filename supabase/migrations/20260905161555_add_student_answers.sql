-- Add student_answers column to mock_exams table
ALTER TABLE public.mock_exams
ADD COLUMN IF NOT EXISTS student_answers JSONB DEFAULT '{}'::jsonb;
