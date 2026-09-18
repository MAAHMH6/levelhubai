-- Migration: Create writing_history and student_vocabulary tables

CREATE TABLE IF NOT EXISTS public.writing_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    writing_type TEXT NOT NULL,
    original_text TEXT NOT NULL,
    improved_text TEXT NOT NULL,
    overall_score INTEGER NOT NULL,
    grammar_score INTEGER NOT NULL,
    vocabulary_score INTEGER NOT NULL,
    punctuation_score INTEGER NOT NULL,
    spelling_score INTEGER NOT NULL,
    clarity_score INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.student_vocabulary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    word TEXT NOT NULL,
    meaning TEXT NOT NULL,
    example_sentence TEXT,
    synonyms JSONB DEFAULT '[]'::jsonb,
    difficulty TEXT,
    practice_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, word)
);

-- RLS Policies for writing_history
ALTER TABLE public.writing_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own writing history"
    ON public.writing_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own writing history"
    ON public.writing_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for student_vocabulary
ALTER TABLE public.student_vocabulary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vocabulary"
    ON public.student_vocabulary FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vocabulary"
    ON public.student_vocabulary FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vocabulary"
    ON public.student_vocabulary FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vocabulary"
    ON public.student_vocabulary FOR DELETE
    USING (auth.uid() = user_id);
