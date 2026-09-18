
-- 1) Move parent_email to a private owner-only table
CREATE TABLE IF NOT EXISTS public.profile_private (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profile_private ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own private profile"
  ON public.profile_private FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own private profile"
  ON public.profile_private FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own private profile"
  ON public.profile_private FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Migrate existing parent_email values
INSERT INTO public.profile_private (user_id, parent_email)
  SELECT id, parent_email FROM public.profiles WHERE parent_email IS NOT NULL
  ON CONFLICT (user_id) DO NOTHING;

ALTER TABLE public.profiles DROP COLUMN IF EXISTS parent_email;

-- 2) Tighten notifications INSERT
DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;

CREATE POLICY "Users can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      auth.uid() = user_id
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
      OR EXISTS (
        SELECT 1 FROM public.friendships f
        WHERE ((f.user_id = auth.uid() AND f.friend_id = notifications.user_id)
            OR (f.friend_id = auth.uid() AND f.user_id = notifications.user_id))
      )
      OR EXISTS (
        SELECT 1 FROM public.challenges c
        WHERE (c.challenger_id = auth.uid() AND c.challenged_id = notifications.user_id)
           OR (c.challenged_id = auth.uid() AND c.challenger_id = notifications.user_id)
      )
    )
  );

-- 3) Restrict school_invites UPDATE to status-only changes by recipient
DROP POLICY IF EXISTS "Users can update received invites" ON public.school_invites;

CREATE POLICY "Recipients can update invite status"
  ON public.school_invites FOR UPDATE
  USING (auth.email() = invited_email)
  WITH CHECK (auth.email() = invited_email);

CREATE OR REPLACE FUNCTION public.school_invites_prevent_field_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.invited_email IS DISTINCT FROM OLD.invited_email
     OR NEW.school_id IS DISTINCT FROM OLD.school_id
     OR NEW.invited_by IS DISTINCT FROM OLD.invited_by
     OR NEW.id IS DISTINCT FROM OLD.id THEN
    -- Allow admins to bypass
    IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
      RAISE EXCEPTION 'Only the status field can be updated on school invites';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS school_invites_protect_fields ON public.school_invites;
CREATE TRIGGER school_invites_protect_fields
  BEFORE UPDATE ON public.school_invites
  FOR EACH ROW EXECUTE FUNCTION public.school_invites_prevent_field_changes();

-- 4) Restrict quiz_questions SELECT to authenticated users
DROP POLICY IF EXISTS "Questions are viewable by everyone" ON public.quiz_questions;

CREATE POLICY "Authenticated users can view quiz questions"
  ON public.quiz_questions FOR SELECT
  TO authenticated
  USING (true);

-- 5) Lock down SECURITY DEFINER functions from public/anon API surface
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
