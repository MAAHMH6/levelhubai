-- Additive Migration: Unified Mock Exam Architecture & SOLID Question Scoping

-- 1. Create exam_blueprints table (Admin extracted past paper structures)
CREATE TABLE IF NOT EXISTS public.exam_blueprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    source_filename TEXT,
    structural_metadata JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on exam_blueprints
ALTER TABLE public.exam_blueprints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exam_blueprints_select_all" ON public.exam_blueprints FOR SELECT USING (true);
CREATE POLICY "exam_blueprints_all_admin" ON public.exam_blueprints FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- 2. Create mock_exams table (Generated instances for students)
CREATE TABLE IF NOT EXISTS public.mock_exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blueprint_id UUID REFERENCES public.exam_blueprints(id) ON DELETE SET NULL,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mode TEXT NOT NULL CHECK (mode IN ('practice', 'timed')),
    status TEXT NOT NULL DEFAULT 'in_progress',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    score INTEGER,
    total_marks INTEGER NOT NULL,
    time_limit_minutes INTEGER
);

-- Enable RLS on mock_exams
ALTER TABLE public.mock_exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mock_exams_select_own" ON public.mock_exams FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "mock_exams_insert_own" ON public.mock_exams FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "mock_exams_update_own" ON public.mock_exams FOR UPDATE USING (auth.uid() = user_id);

-- 3. Alter quiz_questions to support structural scoping and Mock Exams
ALTER TABLE public.quiz_questions 
    -- Make topic_id nullable
    ALTER COLUMN topic_id DROP NOT NULL,
    
    -- Add structural scope links
    ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    
    -- Add Mock Exam metadata
    ADD COLUMN IF NOT EXISTS mock_exam_id UUID REFERENCES public.mock_exams(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS assessment_objective TEXT,
    ADD COLUMN IF NOT EXISTS section TEXT,
    ADD COLUMN IF NOT EXISTS question_number INTEGER,
    ADD COLUMN IF NOT EXISTS marks INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS command_words TEXT[],
    
    -- Add Admin Curation flag
    ADD COLUMN IF NOT EXISTS is_rejected BOOLEAN DEFAULT false NOT NULL;

-- Automatically link existing questions to subject/unit if they have a topic_id
UPDATE public.quiz_questions qq
SET subject_id = t.subject_id
FROM public.topics t
WHERE qq.topic_id = t.id AND qq.subject_id IS NULL;

-- 4. Create trigger to update updated_at on exam_blueprints
CREATE OR REPLACE FUNCTION update_exam_blueprints_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_exam_blueprints_timestamp ON public.exam_blueprints;
CREATE TRIGGER update_exam_blueprints_timestamp
    BEFORE UPDATE ON public.exam_blueprints
    FOR EACH ROW
    EXECUTE FUNCTION update_exam_blueprints_updated_at();
