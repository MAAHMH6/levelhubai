
-- Admin policies for topics (currently no insert/update/delete)
CREATE POLICY "Admins can insert topics" ON public.topics FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update topics" ON public.topics FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete topics" ON public.topics FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for past_papers (currently no insert/update/delete)
CREATE POLICY "Admins can insert past_papers" ON public.past_papers FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update past_papers" ON public.past_papers FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete past_papers" ON public.past_papers FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for quiz_questions (currently no insert/update/delete)
CREATE POLICY "Admins can insert quiz_questions" ON public.quiz_questions FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update quiz_questions" ON public.quiz_questions FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete quiz_questions" ON public.quiz_questions FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Admin delete policies for subjects, units, lessons (currently missing)
CREATE POLICY "Admins can delete subjects" ON public.subjects FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete units" ON public.units FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete lessons" ON public.lessons FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for badges
CREATE POLICY "Admins can insert badges" ON public.badges FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update badges" ON public.badges FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete badges" ON public.badges FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
