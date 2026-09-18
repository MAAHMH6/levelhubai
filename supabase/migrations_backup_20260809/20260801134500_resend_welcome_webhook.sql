-- Enable the pg_net extension to make HTTP requests from the database
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create the function that will call the Edge Function
CREATE OR REPLACE FUNCTION public.handle_user_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the user's email was just verified (email_confirmed_at changed from NULL to a timestamp)
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    -- Make an asynchronous HTTP POST request to your deployed Edge Function
    PERFORM net.http_post(
      url := 'https://yqvqdellxgazgkpzsxpo.supabase.co/functions/v1/resend-welcome',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := jsonb_build_object(
        'type', 'UPDATE',
        'table', 'users',
        'schema', 'auth',
        'record', row_to_json(NEW),
        'old_record', row_to_json(OLD)
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach the trigger to the auth.users table
DROP TRIGGER IF EXISTS on_auth_user_verified ON auth.users;
CREATE TRIGGER on_auth_user_verified
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_verification();
