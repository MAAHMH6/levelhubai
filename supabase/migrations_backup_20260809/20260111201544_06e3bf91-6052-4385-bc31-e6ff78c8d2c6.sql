-- Create badges table with milestone definitions
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'achievement',
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  rarity TEXT NOT NULL DEFAULT 'common',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_badges table to track earned badges
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Badges are viewable by everyone
CREATE POLICY "Badges are viewable by everyone"
ON public.badges FOR SELECT
USING (true);

-- Users can view their own earned badges
CREATE POLICY "Users can view their own badges"
ON public.user_badges FOR SELECT
USING (auth.uid() = user_id);

-- Users can earn badges
CREATE POLICY "Users can earn badges"
ON public.user_badges FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Insert sample badges
INSERT INTO public.badges (name, description, icon, category, requirement_type, requirement_value, xp_reward, rarity) VALUES
-- Streak badges
('First Flame', 'Complete your first day streak', 'Flame', 'streak', 'streak_days', 1, 25, 'common'),
('Week Warrior', 'Maintain a 7-day streak', 'Flame', 'streak', 'streak_days', 7, 100, 'uncommon'),
('Streak Master', 'Maintain a 30-day streak', 'Flame', 'streak', 'streak_days', 30, 500, 'rare'),
('Legendary Streak', 'Maintain a 100-day streak', 'Flame', 'streak', 'streak_days', 100, 2000, 'legendary'),

-- XP badges
('Rising Star', 'Earn 100 XP', 'Star', 'xp', 'total_xp', 100, 25, 'common'),
('XP Hunter', 'Earn 500 XP', 'Star', 'xp', 'total_xp', 500, 75, 'common'),
('Knowledge Seeker', 'Earn 1000 XP', 'Trophy', 'xp', 'total_xp', 1000, 150, 'uncommon'),
('XP Champion', 'Earn 5000 XP', 'Trophy', 'xp', 'total_xp', 5000, 400, 'rare'),
('XP Legend', 'Earn 10000 XP', 'Crown', 'xp', 'total_xp', 10000, 1000, 'legendary'),

-- Quiz badges
('First Answer', 'Answer your first quiz question', 'CheckCircle', 'quiz', 'questions_answered', 1, 10, 'common'),
('Quiz Taker', 'Answer 25 quiz questions', 'CheckCircle', 'quiz', 'questions_answered', 25, 50, 'common'),
('Quiz Expert', 'Answer 100 quiz questions', 'Brain', 'quiz', 'questions_answered', 100, 150, 'uncommon'),
('Quiz Master', 'Answer 500 quiz questions', 'Brain', 'quiz', 'questions_answered', 500, 400, 'rare'),

-- Accuracy badges
('Sharp Mind', 'Get 10 correct answers', 'Target', 'accuracy', 'correct_answers', 10, 50, 'common'),
('Precision Pro', 'Get 50 correct answers', 'Target', 'accuracy', 'correct_answers', 50, 150, 'uncommon'),
('Perfect Aim', 'Get 200 correct answers', 'Zap', 'accuracy', 'correct_answers', 200, 400, 'rare'),

-- Subject mastery badges
('Math Explorer', 'Complete 20 math questions', 'Calculator', 'subject', 'math_questions', 20, 100, 'uncommon'),
('Science Enthusiast', 'Complete 20 science questions', 'Microscope', 'subject', 'science_questions', 20, 100, 'uncommon'),
('English Pro', 'Complete 20 English questions', 'BookOpen', 'subject', 'english_questions', 20, 100, 'uncommon'),

-- Level badges
('Level Up!', 'Reach Level 5', 'TrendingUp', 'level', 'level', 5, 100, 'common'),
('Rising Champion', 'Reach Level 10', 'TrendingUp', 'level', 'level', 10, 250, 'uncommon'),
('Elite Student', 'Reach Level 25', 'Award', 'level', 'level', 25, 750, 'rare'),
('Grand Master', 'Reach Level 50', 'Crown', 'level', 'level', 50, 2000, 'legendary');