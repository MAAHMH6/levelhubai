-- Migration: Create daily_quiz_usage table for tracking quiz generation limits

CREATE TABLE IF NOT EXISTS public.daily_quiz_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    lesson_quizzes_used INTEGER NOT NULL DEFAULT 0,
    unit_quizzes_used INTEGER NOT NULL DEFAULT 0,
    subject_quizzes_used INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, usage_date)
);

-- RLS Policies
ALTER TABLE public.daily_quiz_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily quiz usage"
    ON public.daily_quiz_usage FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily quiz usage"
    ON public.daily_quiz_usage FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily quiz usage"
    ON public.daily_quiz_usage FOR UPDATE
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_daily_quiz_usage_updated_at ON public.daily_quiz_usage;
CREATE TRIGGER set_daily_quiz_usage_updated_at
    BEFORE UPDATE ON public.daily_quiz_usage
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
