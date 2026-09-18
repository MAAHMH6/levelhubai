
REVOKE ALL ON FUNCTION public.get_user_plan(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_plan(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.increment_quiz_usage(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_quiz_usage(uuid) TO service_role;
