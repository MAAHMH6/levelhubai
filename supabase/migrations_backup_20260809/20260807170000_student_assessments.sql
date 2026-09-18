-- Create student_assessments table
CREATE TABLE IF NOT EXISTS public.student_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Cognitive Domain Scores (0-100)
    logical_score INTEGER NOT NULL DEFAULT 0,
    verbal_score INTEGER NOT NULL DEFAULT 0,
    quantitative_score INTEGER NOT NULL DEFAULT 0,
    problem_solving_score INTEGER NOT NULL DEFAULT 0,
    processing_speed_score INTEGER NOT NULL DEFAULT 0,
    
    -- Learner Profile
    learning_style TEXT,
    study_time TEXT,
    study_frequency TEXT,
    favorite_subjects TEXT[],
    interests TEXT[],
    
    -- Motivation & Confidence (1-5)
    motivation_score INTEGER,
    confidence_score INTEGER,
    biggest_challenge TEXT,
    academic_goal TEXT,
    
    -- AI Report Storage
    ai_report_summary TEXT,
    ai_strengths JSONB,
    ai_weaknesses JSONB,
    ai_study_plan JSONB,
    ai_areas_to_explore JSONB,
    
    -- Logic triggers
    needs_ai_refresh BOOLEAN DEFAULT TRUE,
    
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.student_assessments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Students can view their own assessment" 
    ON public.student_assessments 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Students can insert their own assessment" 
    ON public.student_assessments 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update their own assessment" 
    ON public.student_assessments 
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_student_assessments_updated_at') THEN
        CREATE TRIGGER update_student_assessments_updated_at
            BEFORE UPDATE ON public.student_assessments
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
