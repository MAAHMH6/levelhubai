-- Create a function to allow users to apply a referral code from the frontend
CREATE OR REPLACE FUNCTION public.apply_referral_code(code_input TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_teacher_id UUID;
  v_student_id UUID;
  v_existing_ref UUID;
BEGIN
  v_student_id := auth.uid();
  
  IF v_student_id IS NULL THEN
    RETURN '{"success": false, "message": "Not authenticated"}'::JSONB;
  END IF;
  
  -- Check if already has a referral
  SELECT id INTO v_existing_ref FROM public.referrals WHERE student_id = v_student_id;
  IF v_existing_ref IS NOT NULL THEN
    RETURN '{"success": false, "message": "You have already applied a referral code."}'::JSONB;
  END IF;

  -- Find teacher with the code
  SELECT id INTO v_teacher_id FROM public.teacher_profiles 
  WHERE UPPER(referral_code) = UPPER(code_input) AND status = 'active';

  IF v_teacher_id IS NULL THEN
    RETURN '{"success": false, "message": "Invalid or inactive referral code."}'::JSONB;
  END IF;

  IF v_teacher_id = v_student_id THEN
    RETURN '{"success": false, "message": "You cannot refer yourself."}'::JSONB;
  END IF;

  -- Insert referral
  INSERT INTO public.referrals (student_id, teacher_id, referral_code)
  VALUES (v_student_id, v_teacher_id, UPPER(code_input));

  RETURN '{"success": true, "message": "Referral code applied successfully!"}'::JSONB;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;
