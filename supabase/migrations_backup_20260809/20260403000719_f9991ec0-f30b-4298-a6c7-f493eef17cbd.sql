ALTER TABLE public.subjects ADD COLUMN subscription_tier text NOT NULL DEFAULT 'free';

-- Update existing subjects based on current logic
UPDATE public.subjects SET subscription_tier = 'pro' WHERE name NOT IN ('Mathematics', 'ICT');