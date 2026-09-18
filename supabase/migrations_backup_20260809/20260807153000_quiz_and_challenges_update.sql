-- 1. Update quiz_sessions table
ALTER TABLE public.quiz_sessions
ADD COLUMN IF NOT EXISTS quiz_type TEXT DEFAULT 'quick' CHECK (quiz_type IN ('quick', 'timed')),
ADD COLUMN IF NOT EXISTS time_limit_seconds INTEGER,
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'mixed' CHECK (difficulty IN ('easy', 'medium', 'hard', 'mixed'));

-- 2. Update challenges table
ALTER TABLE public.challenges
ADD COLUMN IF NOT EXISTS unit_id UUID REFERENCES public.units(id),
ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES public.topics(id),
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'mixed' CHECK (difficulty IN ('easy', 'medium', 'hard', 'mixed')),
ADD COLUMN IF NOT EXISTS time_limit_seconds INTEGER,
ADD COLUMN IF NOT EXISTS questions JSONB,
ADD COLUMN IF NOT EXISTS challenger_answers JSONB,
ADD COLUMN IF NOT EXISTS challenged_answers JSONB,
ADD COLUMN IF NOT EXISTS challenger_time_used INTEGER,
ADD COLUMN IF NOT EXISTS challenged_time_used INTEGER;

-- 3. Create RPC for secure student search
-- Searches both display_name in profiles and student_code in referrals (if available)
CREATE OR REPLACE FUNCTION public.search_students(search_term TEXT)
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  avatar_url TEXT,
  xp_points INTEGER,
  level INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, 
    p.display_name, 
    p.avatar_url, 
    p.xp_points, 
    p.level
  FROM public.profiles p
  LEFT JOIN public.referrals r ON r.referrer_id = p.id
  WHERE 
    p.id != auth.uid() -- Don't return self
    AND (
      p.display_name ILIKE '%' || search_term || '%'
      OR r.student_code ILIKE '%' || search_term || '%'
    )
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
