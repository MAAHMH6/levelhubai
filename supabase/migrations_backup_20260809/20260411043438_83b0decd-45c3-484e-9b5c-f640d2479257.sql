
-- Add questions_data column to past_papers for storing real questions/answers
ALTER TABLE public.past_papers 
ADD COLUMN IF NOT EXISTS questions_data JSONB DEFAULT '[]'::jsonb;

-- Add challenge_questions to challenges for live battle questions
ALTER TABLE public.challenges
ADD COLUMN IF NOT EXISTS challenge_questions JSONB DEFAULT '[]'::jsonb;

-- Add status tracking for challenge progress  
ALTER TABLE public.challenges
ADD COLUMN IF NOT EXISTS challenger_time_seconds INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS challenged_time_seconds INTEGER DEFAULT NULL;
