-- =========================================================================
-- LevelHubAI: New Features Schema (Strictly Additive)
-- Safe for new Supabase project (jqscjbaondlknhrcbkuh)
-- ZERO breaking changes to original tables
-- =========================================================================

-- 1. Study Plans Table (For AI Planner and Manual Tasks)
CREATE TABLE IF NOT EXISTS public.study_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    programme TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    topic_id TEXT,
    topic_title TEXT,
    scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
    duration_minutes INTEGER DEFAULT 30,
    activity_type TEXT NOT NULL, -- 'notes', 'video', 'quiz', 'flashcards', 'past_paper', 'ai_tutor', 'mock_exam'
    completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_study_plans_user_date ON public.study_plans (user_id, scheduled_date);

-- 2. Student Mistakes Table (For Mistake Book & Retry Engine)
CREATE TABLE IF NOT EXISTS public.student_mistakes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    programme TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    unit_title TEXT,
    topic_title TEXT,
    question_text TEXT NOT NULL,
    student_answer TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    marks_lost INTEGER DEFAULT 1,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_mistakes_user_subj ON public.student_mistakes (user_id, subject_id);

-- 3. Subject AI Context Table (Isolated Per Subject AI Memory)
CREATE TABLE IF NOT EXISTS public.subject_ai_contexts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    programme TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    weak_topics TEXT[] DEFAULT '{}',
    strong_topics TEXT[] DEFAULT '{}',
    recent_accuracy NUMERIC(5,2) DEFAULT 0.0,
    study_notes_summary TEXT,
    last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, subject_id)
);

-- 4. Daily Usage Limits Table
CREATE TABLE IF NOT EXISTS public.daily_usage_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    usage_date DATE DEFAULT CURRENT_DATE,
    ai_tutor_used INTEGER DEFAULT 0,
    quiz_gen_used INTEGER DEFAULT 0,
    mock_exam_used INTEGER DEFAULT 0,
    UNIQUE(user_id, usage_date)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_ai_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_usage_limits ENABLE ROW LEVEL SECURITY;

-- Permissive policies for authenticated users
CREATE POLICY "Users can manage their study plans" ON public.study_plans
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their mistakes" ON public.student_mistakes
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their subject ai context" ON public.subject_ai_contexts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their usage limits" ON public.daily_usage_limits
    FOR ALL USING (auth.uid() = user_id);
