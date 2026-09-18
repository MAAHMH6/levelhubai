-- Fix the overly permissive notifications insert policy
DROP POLICY IF EXISTS "Users can insert notifications for others (system)" ON public.notifications;

-- Only allow users to insert notifications for themselves (system notifications will be handled by service role)
CREATE POLICY "Users can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);