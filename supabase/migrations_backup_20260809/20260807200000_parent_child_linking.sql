-- 1. Create parent_children table to securely link parents and students
CREATE TABLE IF NOT EXISTS public.parent_children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(parent_id, child_id)
);

-- RLS for parent_children
ALTER TABLE public.parent_children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their own children links"
  ON public.parent_children
  FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Children can view their own parent links"
  ON public.parent_children
  FOR SELECT
  USING (auth.uid() = child_id);

CREATE POLICY "Children can delete their own parent links"
  ON public.parent_children
  FOR DELETE
  USING (auth.uid() = child_id);

CREATE POLICY "Parents can delete their own children links"
  ON public.parent_children
  FOR DELETE
  USING (auth.uid() = parent_id);


-- 2. Create child_linking_codes table for secure generation
CREATE TABLE IF NOT EXISTS public.child_linking_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.child_linking_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children can view their own linking codes"
  ON public.child_linking_codes
  FOR SELECT
  USING (auth.uid() = child_id);

CREATE POLICY "Children can create their own linking codes"
  ON public.child_linking_codes
  FOR INSERT
  WITH CHECK (auth.uid() = child_id);

CREATE POLICY "Children can delete their own linking codes"
  ON public.child_linking_codes
  FOR DELETE
  USING (auth.uid() = child_id);


-- 3. Secure RPC to generate a 6-digit linking code
CREATE OR REPLACE FUNCTION public.generate_child_linking_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _child_id uuid := auth.uid();
  _code text;
  _attempts int := 0;
BEGIN
  IF _child_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete any existing unexpired codes for this child to keep it clean
  DELETE FROM public.child_linking_codes WHERE child_id = _child_id;

  LOOP
    -- Generate 6 digit uppercase code
    _code := upper(substring(md5(random()::text) from 1 for 6));
    
    BEGIN
      INSERT INTO public.child_linking_codes (child_id, code, expires_at)
      VALUES (_child_id, _code, now() + interval '24 hours');
      
      RETURN _code;
    EXCEPTION WHEN unique_violation THEN
      _attempts := _attempts + 1;
      IF _attempts > 10 THEN
        RAISE EXCEPTION 'Could not generate a unique code';
      END IF;
    END;
  END LOOP;
END;
$$;


-- 4. Secure RPC to link a child account
CREATE OR REPLACE FUNCTION public.link_child_account(_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _parent_id uuid := auth.uid();
  _child_id uuid;
  _child_name text;
BEGIN
  IF _parent_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Find valid code
  SELECT child_id INTO _child_id
  FROM public.child_linking_codes
  WHERE code = upper(_code) AND expires_at > now();

  IF _child_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired code';
  END IF;

  IF _child_id = _parent_id THEN
    RAISE EXCEPTION 'You cannot link your own account as a child';
  END IF;

  -- Link
  INSERT INTO public.parent_children (parent_id, child_id)
  VALUES (_parent_id, _child_id)
  ON CONFLICT DO NOTHING;

  -- Consume code
  DELETE FROM public.child_linking_codes WHERE code = upper(_code);

  -- Get child name for confirmation
  SELECT display_name INTO _child_name
  FROM public.profiles
  WHERE id = _child_id;

  RETURN json_build_object(
    'success', true,
    'child_id', _child_id,
    'child_name', COALESCE(_child_name, 'Student')
  );
END;
$$;


-- 5. Extend RLS on existing performance tables to allow Parents to view their linked children's data
-- We will use a helper function to keep policies clean
CREATE OR REPLACE FUNCTION public.is_parent_of(_child_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.parent_children 
    WHERE parent_id = auth.uid() AND child_id = _child_id
  )
$$;

-- Apply to profiles
CREATE POLICY "Parents can view linked children profiles"
  ON public.profiles
  FOR SELECT
  USING (public.is_parent_of(id));

-- Apply to subject_progress
CREATE POLICY "Parents can view linked children subject progress"
  ON public.subject_progress
  FOR SELECT
  USING (public.is_parent_of(user_id));

-- Apply to unit_progress
CREATE POLICY "Parents can view linked children unit progress"
  ON public.unit_progress
  FOR SELECT
  USING (public.is_parent_of(user_id));

-- Apply to lesson_progress
CREATE POLICY "Parents can view linked children lesson progress"
  ON public.lesson_progress
  FOR SELECT
  USING (public.is_parent_of(user_id));

-- Apply to quiz_sessions
CREATE POLICY "Parents can view linked children quiz sessions"
  ON public.quiz_sessions
  FOR SELECT
  USING (public.is_parent_of(user_id));

-- Apply to quiz_attempts
CREATE POLICY "Parents can view linked children quiz attempts"
  ON public.quiz_attempts
  FOR SELECT
  USING (public.is_parent_of(user_id));

-- Apply to student_assessments
CREATE POLICY "Parents can view linked children assessments"
  ON public.student_assessments
  FOR SELECT
  USING (public.is_parent_of(user_id));

-- Apply to writing_history
CREATE POLICY "Parents can view linked children writing history"
  ON public.writing_history
  FOR SELECT
  USING (public.is_parent_of(user_id));
