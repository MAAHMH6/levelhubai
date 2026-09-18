-- =============================================
-- PHASE 1: Mathematics Learning System Schema
-- =============================================

-- 1. UNITS TABLE (16 units per subject)
CREATE TABLE public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  unit_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  icon_emoji TEXT NOT NULL DEFAULT '📘',
  description TEXT,
  duration_weeks TEXT, -- e.g., "3-4 weeks"
  total_xp INTEGER NOT NULL DEFAULT 0,
  prerequisite_unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(subject_id, unit_number)
);

-- 2. LESSONS TABLE (130 lessons across units)
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  lesson_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  video_url TEXT,
  video_duration_seconds INTEGER, -- duration in seconds
  video_duration_display TEXT, -- e.g., "53:44"
  xp_reward INTEGER NOT NULL DEFAULT 100,
  quiz_question_count INTEGER NOT NULL DEFAULT 15,
  practice_question_count INTEGER NOT NULL DEFAULT 25,
  topic_name TEXT, -- e.g., "Topic 1.1: Number Operations"
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(unit_id, lesson_number)
);

-- 3. LESSON PROGRESS TABLE (per user, per lesson tracking)
CREATE TABLE public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  
  -- Video tracking
  video_watch_percentage INTEGER NOT NULL DEFAULT 0,
  video_last_position_seconds INTEGER NOT NULL DEFAULT 0,
  video_completed BOOLEAN NOT NULL DEFAULT false,
  video_completed_at TIMESTAMP WITH TIME ZONE,
  video_xp_awarded BOOLEAN NOT NULL DEFAULT false,
  
  -- Quiz tracking
  quiz_status TEXT NOT NULL DEFAULT 'not_started', -- not_started, in_progress, passed, failed
  quiz_score INTEGER, -- percentage 0-100
  quiz_attempts INTEGER NOT NULL DEFAULT 0,
  quiz_best_score INTEGER,
  quiz_completed_at TIMESTAMP WITH TIME ZONE,
  quiz_xp_earned INTEGER NOT NULL DEFAULT 0,
  
  -- Practice tracking
  practice_status TEXT NOT NULL DEFAULT 'locked', -- locked, available, in_progress, completed
  practice_questions_attempted INTEGER NOT NULL DEFAULT 0,
  practice_questions_correct INTEGER NOT NULL DEFAULT 0,
  practice_xp_earned INTEGER NOT NULL DEFAULT 0,
  
  -- AI content status
  notes_generated BOOLEAN NOT NULL DEFAULT false,
  quiz_generated BOOLEAN NOT NULL DEFAULT false,
  practice_generated BOOLEAN NOT NULL DEFAULT false,
  
  -- Overall
  lesson_completed BOOLEAN NOT NULL DEFAULT false,
  lesson_completed_at TIMESTAMP WITH TIME ZONE,
  total_time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  first_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- 4. UNIT PROGRESS TABLE (aggregate per user, per unit)
CREATE TABLE public.unit_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  
  lessons_completed INTEGER NOT NULL DEFAULT 0,
  total_lessons INTEGER NOT NULL DEFAULT 0,
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  total_xp_earned INTEGER NOT NULL DEFAULT 0,
  average_quiz_score INTEGER,
  
  is_unlocked BOOLEAN NOT NULL DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  
  unit_quiz_available BOOLEAN NOT NULL DEFAULT false,
  unit_quiz_score INTEGER,
  unit_quiz_completed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, unit_id)
);

-- 5. AI NOTES TABLE (per user, per lesson)
CREATE TABLE public.ai_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  
  ai_generated_content TEXT, -- AI-generated notes in markdown
  user_personal_notes TEXT, -- User's own notes
  
  generated_at TIMESTAMP WITH TIME ZONE,
  last_edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- 6. AI QUIZ QUESTIONS TABLE (per user, per lesson - unique questions)
CREATE TABLE public.ai_lesson_quiz (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  
  questions JSONB NOT NULL DEFAULT '[]', -- Array of {question, options, correct_answer, explanation, difficulty}
  is_ready BOOLEAN NOT NULL DEFAULT false,
  
  generated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- 7. AI PRACTICE QUESTIONS TABLE (per user, per lesson)
CREATE TABLE public.ai_lesson_practice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  
  questions JSONB NOT NULL DEFAULT '[]', -- Array of {question, solution_steps, correct_answer, marks, difficulty}
  is_ready BOOLEAN NOT NULL DEFAULT false,
  weak_topics TEXT[], -- Topics to focus on based on quiz performance
  
  generated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- 8. PAST PAPERS TABLE
CREATE TABLE public.past_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  exam_board TEXT NOT NULL, -- 'IGCSE 0580' or 'O-Level 4024'
  year INTEGER NOT NULL,
  session TEXT NOT NULL, -- 'May/June' or 'Oct/Nov'
  paper_number INTEGER NOT NULL,
  variant INTEGER,
  pdf_url TEXT,
  marking_scheme_url TEXT,
  total_marks INTEGER,
  duration_minutes INTEGER,
  xp_reward INTEGER NOT NULL DEFAULT 250,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. PAST PAPER ATTEMPTS TABLE
CREATE TABLE public.past_paper_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  paper_id UUID NOT NULL REFERENCES public.past_papers(id) ON DELETE CASCADE,
  
  mode TEXT NOT NULL, -- 'practice' or 'mock_exam'
  score INTEGER,
  total_marks INTEGER,
  percentage INTEGER,
  time_taken_seconds INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_lesson_quiz ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_lesson_practice ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.past_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.past_paper_attempts ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Units: Public read access
CREATE POLICY "Units are viewable by everyone" ON public.units
  FOR SELECT USING (true);

-- Lessons: Public read access
CREATE POLICY "Lessons are viewable by everyone" ON public.lessons
  FOR SELECT USING (true);

-- Lesson Progress: User-specific access
CREATE POLICY "Users can view their own lesson progress" ON public.lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lesson progress" ON public.lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson progress" ON public.lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Unit Progress: User-specific access
CREATE POLICY "Users can view their own unit progress" ON public.unit_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own unit progress" ON public.unit_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own unit progress" ON public.unit_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- AI Notes: User-specific access
CREATE POLICY "Users can view their own notes" ON public.ai_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes" ON public.ai_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON public.ai_notes
  FOR UPDATE USING (auth.uid() = user_id);

-- AI Lesson Quiz: User-specific access
CREATE POLICY "Users can view their own quiz questions" ON public.ai_lesson_quiz
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz questions" ON public.ai_lesson_quiz
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz questions" ON public.ai_lesson_quiz
  FOR UPDATE USING (auth.uid() = user_id);

-- AI Lesson Practice: User-specific access
CREATE POLICY "Users can view their own practice questions" ON public.ai_lesson_practice
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own practice questions" ON public.ai_lesson_practice
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own practice questions" ON public.ai_lesson_practice
  FOR UPDATE USING (auth.uid() = user_id);

-- Past Papers: Public read access
CREATE POLICY "Past papers are viewable by everyone" ON public.past_papers
  FOR SELECT USING (true);

-- Past Paper Attempts: User-specific access
CREATE POLICY "Users can view their own paper attempts" ON public.past_paper_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own paper attempts" ON public.past_paper_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own paper attempts" ON public.past_paper_attempts
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE TRIGGER update_lesson_progress_updated_at
  BEFORE UPDATE ON public.lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_unit_progress_updated_at
  BEFORE UPDATE ON public.unit_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_notes_updated_at
  BEFORE UPDATE ON public.ai_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_units_subject_id ON public.units(subject_id);
CREATE INDEX idx_lessons_unit_id ON public.lessons(unit_id);
CREATE INDEX idx_lesson_progress_user_id ON public.lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson_id ON public.lesson_progress(lesson_id);
CREATE INDEX idx_unit_progress_user_id ON public.unit_progress(user_id);
CREATE INDEX idx_unit_progress_unit_id ON public.unit_progress(unit_id);
CREATE INDEX idx_ai_notes_user_lesson ON public.ai_notes(user_id, lesson_id);
CREATE INDEX idx_ai_lesson_quiz_user_lesson ON public.ai_lesson_quiz(user_id, lesson_id);
CREATE INDEX idx_ai_lesson_practice_user_lesson ON public.ai_lesson_practice(user_id, lesson_id);
CREATE INDEX idx_past_papers_subject_id ON public.past_papers(subject_id);
CREATE INDEX idx_past_paper_attempts_user_id ON public.past_paper_attempts(user_id);