-- Add subscription_plan to profiles for free/pro distinction
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'free';

-- Create friendships table for friend system
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  friend_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, rejected
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- Create challenges table
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenger_id UUID NOT NULL,
  challenged_id UUID NOT NULL,
  subject_id UUID REFERENCES public.subjects(id),
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, in_progress, completed, declined, expired
  question_count INTEGER NOT NULL DEFAULT 10,
  challenger_score INTEGER DEFAULT 0,
  challenged_score INTEGER DEFAULT 0,
  challenger_completed_at TIMESTAMP WITH TIME ZONE,
  challenged_completed_at TIMESTAMP WITH TIME ZONE,
  winner_id UUID,
  winner_xp INTEGER DEFAULT 50,
  loser_xp INTEGER DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- challenge_request, challenge_accepted, challenge_completed, badge_earned, etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subject_badges for subject-specific badges
CREATE TABLE IF NOT EXISTS public.subject_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES public.subjects(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common', -- common, rare, epic, legendary
  requirement_type TEXT NOT NULL, -- lessons_completed, quiz_score, xp_earned, units_completed
  requirement_value INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 25,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_subject_badges
CREATE TABLE IF NOT EXISTS public.user_subject_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject_badge_id UUID NOT NULL REFERENCES public.subject_badges(id),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, subject_badge_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subject_badges ENABLE ROW LEVEL SECURITY;

-- RLS policies for friendships
CREATE POLICY "Users can view their own friendships"
ON public.friendships FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendships"
ON public.friendships FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own friendships"
ON public.friendships FOR UPDATE
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- RLS policies for challenges
CREATE POLICY "Users can view their own challenges"
ON public.challenges FOR SELECT
USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

CREATE POLICY "Users can create challenges"
ON public.challenges FOR INSERT
WITH CHECK (auth.uid() = challenger_id);

CREATE POLICY "Users can update their own challenges"
ON public.challenges FOR UPDATE
USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert notifications for others (system)"
ON public.notifications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- RLS policies for subject_badges (public read)
CREATE POLICY "Anyone can view subject badges"
ON public.subject_badges FOR SELECT
USING (true);

-- RLS policies for user_subject_badges
CREATE POLICY "Users can view their own subject badges"
ON public.user_subject_badges FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can earn subject badges"
ON public.user_subject_badges FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_friendships_updated_at
BEFORE UPDATE ON public.friendships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert subject-specific badges for each subject
INSERT INTO public.subject_badges (subject_id, name, description, icon, rarity, requirement_type, requirement_value, xp_reward)
SELECT 
  s.id,
  'First ' || s.name || ' Lesson',
  'Complete your first lesson in ' || s.name,
  'BookOpen',
  'common',
  'lessons_completed',
  1,
  25
FROM public.subjects s
ON CONFLICT DO NOTHING;

INSERT INTO public.subject_badges (subject_id, name, description, icon, rarity, requirement_type, requirement_value, xp_reward)
SELECT 
  s.id,
  s.name || ' Explorer',
  'Complete 5 lessons in ' || s.name,
  'Compass',
  'common',
  'lessons_completed',
  5,
  50
FROM public.subjects s
ON CONFLICT DO NOTHING;

INSERT INTO public.subject_badges (subject_id, name, description, icon, rarity, requirement_type, requirement_value, xp_reward)
SELECT 
  s.id,
  s.name || ' Scholar',
  'Complete 10 lessons in ' || s.name,
  'GraduationCap',
  'rare',
  'lessons_completed',
  10,
  100
FROM public.subjects s
ON CONFLICT DO NOTHING;

INSERT INTO public.subject_badges (subject_id, name, description, icon, rarity, requirement_type, requirement_value, xp_reward)
SELECT 
  s.id,
  s.name || ' Master',
  'Complete 25 lessons in ' || s.name,
  'Crown',
  'epic',
  'lessons_completed',
  25,
  250
FROM public.subjects s
ON CONFLICT DO NOTHING;

INSERT INTO public.subject_badges (subject_id, name, description, icon, rarity, requirement_type, requirement_value, xp_reward)
SELECT 
  s.id,
  s.name || ' Quiz Ace',
  'Score 90%+ on 5 quizzes in ' || s.name,
  'Target',
  'rare',
  'quiz_score',
  5,
  100
FROM public.subjects s
ON CONFLICT DO NOTHING;