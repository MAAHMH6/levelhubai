-- Migration: Add student inactivity tracking fields and update function
-- Add fields to track last active time and when inactivity reminders were sent
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS last_inactivity_15_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_inactivity_30_sent_at TIMESTAMP WITH TIME ZONE;

-- Create an RPC to update the last_active_at and reset the inactivity cycles
CREATE OR REPLACE FUNCTION public.update_last_active()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET 
    last_active_at = NOW(),
    last_inactivity_15_sent_at = NULL,
    last_inactivity_30_sent_at = NULL
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.update_last_active TO authenticated;

-- Ensure pg_cron and pg_net are enabled (typically available in Supabase by default)
CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "public";
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "public";

-- Schedule the edge function to run once per day (e.g. at 00:00 UTC)
-- Note: Replace [PROJECT_REF] and [SERVICE_ROLE_KEY] with actual values in the Dashboard or leave it to be configured via the Supabase UI.
-- For a secure setup, it's recommended to schedule Edge Functions via the Supabase Dashboard's Edge Functions -> Cron scheduler,
-- rather than hardcoding credentials into pg_cron directly in version control.
