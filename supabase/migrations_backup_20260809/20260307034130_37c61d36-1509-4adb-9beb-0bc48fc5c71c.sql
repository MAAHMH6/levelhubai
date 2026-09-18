-- Allow admins to update lessons (for video URL management)
CREATE POLICY "Admins can update lessons"
ON public.lessons
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert lessons
CREATE POLICY "Admins can insert lessons"
ON public.lessons
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update units
CREATE POLICY "Admins can update units"
ON public.units
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert units
CREATE POLICY "Admins can insert units"
ON public.units
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert/update subjects
CREATE POLICY "Admins can update subjects"
ON public.subjects
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert subjects"
ON public.subjects
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));