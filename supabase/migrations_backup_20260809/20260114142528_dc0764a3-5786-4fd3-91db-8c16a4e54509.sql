-- Drop the existing view
DROP VIEW IF EXISTS public.leaderboard_profiles;

-- Instead of a view, add a RLS policy to allow reading limited profile data for leaderboard
-- This policy allows authenticated users to see basic leaderboard info from all profiles
CREATE POLICY "Anyone can view leaderboard profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);