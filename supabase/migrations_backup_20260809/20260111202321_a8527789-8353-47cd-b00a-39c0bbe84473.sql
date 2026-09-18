-- Create a view for leaderboard data (limited public info only)
CREATE VIEW public.leaderboard_profiles AS
SELECT 
  id,
  display_name,
  avatar_url,
  xp_points,
  level,
  streak_days
FROM public.profiles
ORDER BY xp_points DESC;

-- Allow everyone to read the leaderboard view
GRANT SELECT ON public.leaderboard_profiles TO anon, authenticated;