-- Create enum for question types
CREATE TYPE question_type AS ENUM ('mcq', 'true_false');

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  color TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create topics table
CREATE TABLE public.topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz questions table
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  question_type question_type NOT NULL DEFAULT 'mcq',
  question_text TEXT NOT NULL,
  options JSONB, -- For MCQ: ["Option A", "Option B", "Option C", "Option D"]
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty INTEGER NOT NULL DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
  xp_reward INTEGER NOT NULL DEFAULT 10,
  time_limit_seconds INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz attempts table
CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  selected_answer TEXT,
  is_correct BOOLEAN NOT NULL,
  time_taken_seconds INTEGER,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subject progress table
CREATE TABLE public.subject_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  questions_attempted INTEGER NOT NULL DEFAULT 0,
  questions_correct INTEGER NOT NULL DEFAULT 0,
  total_xp_earned INTEGER NOT NULL DEFAULT 0,
  last_practiced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, subject_id)
);

-- Create daily goals table
CREATE TABLE public.daily_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  goal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_xp INTEGER NOT NULL DEFAULT 100,
  earned_xp INTEGER NOT NULL DEFAULT 0,
  target_questions INTEGER NOT NULL DEFAULT 20,
  completed_questions INTEGER NOT NULL DEFAULT 0,
  target_streak_maintained BOOLEAN NOT NULL DEFAULT false,
  streak_maintained BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, goal_date)
);

-- Enable RLS on all tables
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_goals ENABLE ROW LEVEL SECURITY;

-- Subjects and topics are publicly readable
CREATE POLICY "Subjects are viewable by everyone" 
ON public.subjects FOR SELECT USING (true);

CREATE POLICY "Topics are viewable by everyone" 
ON public.topics FOR SELECT USING (true);

CREATE POLICY "Questions are viewable by everyone" 
ON public.quiz_questions FOR SELECT USING (true);

-- Quiz attempts policies
CREATE POLICY "Users can view their own attempts" 
ON public.quiz_attempts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attempts" 
ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subject progress policies
CREATE POLICY "Users can view their own progress" 
ON public.subject_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" 
ON public.subject_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
ON public.subject_progress FOR UPDATE USING (auth.uid() = user_id);

-- Daily goals policies
CREATE POLICY "Users can view their own goals" 
ON public.daily_goals FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" 
ON public.daily_goals FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" 
ON public.daily_goals FOR UPDATE USING (auth.uid() = user_id);

-- Add trigger for subject_progress updated_at
CREATE TRIGGER update_subject_progress_updated_at
BEFORE UPDATE ON public.subject_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample subjects
INSERT INTO public.subjects (name, icon, color, description) VALUES
('Mathematics', 'Calculator', 'hsl(210, 100%, 50%)', 'Numbers, algebra, geometry and more'),
('Physics', 'Atom', 'hsl(280, 100%, 60%)', 'Motion, forces, energy and waves'),
('Chemistry', 'FlaskConical', 'hsl(150, 100%, 40%)', 'Elements, reactions and compounds'),
('Biology', 'Dna', 'hsl(120, 100%, 35%)', 'Living organisms and life processes'),
('English', 'BookOpen', 'hsl(30, 100%, 50%)', 'Language, literature and comprehension'),
('Accounting', 'Receipt', 'hsl(0, 100%, 50%)', 'Financial records and business studies'),
('ICT', 'Monitor', 'hsl(200, 100%, 45%)', 'Information and communication technology');

-- Insert sample topics for each subject
INSERT INTO public.topics (subject_id, name, order_index) 
SELECT s.id, t.name, t.order_index
FROM public.subjects s
CROSS JOIN (VALUES 
  ('Number Systems', 1),
  ('Algebra', 2),
  ('Geometry', 3),
  ('Statistics', 4)
) AS t(name, order_index)
WHERE s.name = 'Mathematics';

INSERT INTO public.topics (subject_id, name, order_index) 
SELECT s.id, t.name, t.order_index
FROM public.subjects s
CROSS JOIN (VALUES 
  ('Motion & Forces', 1),
  ('Energy', 2),
  ('Waves', 3),
  ('Electricity', 4)
) AS t(name, order_index)
WHERE s.name = 'Physics';

-- Insert sample quiz questions for Mathematics
INSERT INTO public.quiz_questions (topic_id, question_type, question_text, options, correct_answer, explanation, difficulty, xp_reward, time_limit_seconds)
SELECT t.id, 'mcq'::question_type, q.question_text, q.options::jsonb, q.correct_answer, q.explanation, q.difficulty, q.xp_reward, q.time_limit
FROM public.topics t
CROSS JOIN (VALUES 
  ('What is 15% of 200?', '["20", "25", "30", "35"]', '30', '15% of 200 = (15/100) × 200 = 30', 1, 10, 30),
  ('Solve for x: 2x + 5 = 17', '["4", "5", "6", "7"]', '6', '2x = 17 - 5 = 12, so x = 6', 2, 15, 45),
  ('What is the value of √144?', '["10", "11", "12", "13"]', '12', '12 × 12 = 144, so √144 = 12', 1, 10, 30),
  ('If a triangle has angles 60° and 70°, what is the third angle?', '["40°", "50°", "60°", "70°"]', '50°', 'Sum of angles = 180°, so third = 180 - 60 - 70 = 50°', 2, 15, 45)
) AS q(question_text, options, correct_answer, explanation, difficulty, xp_reward, time_limit)
WHERE t.name = 'Number Systems'
LIMIT 4;

-- Insert true/false questions
INSERT INTO public.quiz_questions (topic_id, question_type, question_text, options, correct_answer, explanation, difficulty, xp_reward, time_limit_seconds)
SELECT t.id, 'true_false'::question_type, q.question_text, '["True", "False"]'::jsonb, q.correct_answer, q.explanation, q.difficulty, q.xp_reward, q.time_limit
FROM public.topics t
CROSS JOIN (VALUES 
  ('Zero is a positive number.', 'False', 'Zero is neither positive nor negative.', 1, 8, 20),
  ('The square of any negative number is positive.', 'True', 'Negative × Negative = Positive', 1, 8, 20),
  ('All prime numbers are odd.', 'False', '2 is a prime number and it is even.', 2, 12, 25)
) AS q(question_text, correct_answer, explanation, difficulty, xp_reward, time_limit)
WHERE t.name = 'Number Systems';

-- Insert sample questions for Physics
INSERT INTO public.quiz_questions (topic_id, question_type, question_text, options, correct_answer, explanation, difficulty, xp_reward, time_limit_seconds)
SELECT t.id, 'mcq'::question_type, q.question_text, q.options::jsonb, q.correct_answer, q.explanation, q.difficulty, q.xp_reward, q.time_limit
FROM public.topics t
CROSS JOIN (VALUES 
  ('What is the SI unit of force?', '["Joule", "Newton", "Watt", "Pascal"]', 'Newton', 'Force is measured in Newtons (N)', 1, 10, 30),
  ('If a car travels 100km in 2 hours, what is its average speed?', '["25 km/h", "50 km/h", "75 km/h", "100 km/h"]', '50 km/h', 'Speed = Distance/Time = 100/2 = 50 km/h', 1, 10, 30),
  ('What is the acceleration due to gravity on Earth?', '["8.9 m/s²", "9.8 m/s²", "10.8 m/s²", "11.8 m/s²"]', '9.8 m/s²', 'Standard value is approximately 9.8 m/s²', 2, 15, 45)
) AS q(question_text, options, correct_answer, explanation, difficulty, xp_reward, time_limit)
WHERE t.name = 'Motion & Forces';