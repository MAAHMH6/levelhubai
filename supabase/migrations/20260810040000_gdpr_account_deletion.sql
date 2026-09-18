CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID;
BEGIN
  -- Get the current authenticated user ID
  v_uid := auth.uid();
  
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Since this is SECURITY DEFINER, we have permission to delete from auth.users.
  -- Supabase handles cascading deletes for auth.users if foreign keys are set correctly.
  
  DELETE FROM auth.users WHERE id = v_uid;
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;
