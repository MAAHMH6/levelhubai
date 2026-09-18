CREATE OR REPLACE FUNCTION "public"."apply_referral_code"("code_input" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_teacher_id UUID;
  v_student_id UUID;
  v_existing_ref UUID;
  v_student_referrer_id UUID;
BEGIN
  v_student_id := auth.uid();
  
  IF v_student_id IS NULL THEN
    RETURN '{"success": false, "message": "Not authenticated"}'::JSONB;
  END IF;
  
  -- Check if already has a teacher referral
  SELECT id INTO v_existing_ref FROM public.referrals WHERE student_id = v_student_id;
  IF v_existing_ref IS NOT NULL THEN
    RETURN '{"success": false, "message": "You have already applied a referral code."}'::JSONB;
  END IF;

  -- Check if already has a student referral
  SELECT id INTO v_existing_ref FROM public.student_referrals WHERE referred_id = v_student_id;
  IF v_existing_ref IS NOT NULL THEN
    RETURN '{"success": false, "message": "You have already applied a referral code."}'::JSONB;
  END IF;

  -- Check if it's a teacher referral code
  SELECT id INTO v_teacher_id FROM public.teacher_profiles 
  WHERE UPPER(referral_code) = UPPER(code_input) AND status = 'active';

  IF v_teacher_id IS NOT NULL THEN
    IF v_teacher_id = v_student_id THEN
      RETURN '{"success": false, "message": "You cannot refer yourself."}'::JSONB;
    END IF;

    INSERT INTO public.referrals (student_id, teacher_id, referral_code)
    VALUES (v_student_id, v_teacher_id, UPPER(code_input));

    RETURN '{"success": true, "message": "Teacher referral code applied successfully!"}'::JSONB;
  END IF;

  -- Check if it's a student referral code
  SELECT id INTO v_student_referrer_id FROM public.profiles 
  WHERE UPPER(referral_code) = UPPER(code_input);

  IF v_student_referrer_id IS NOT NULL THEN
    IF v_student_referrer_id = v_student_id THEN
      RETURN '{"success": false, "message": "You cannot refer yourself."}'::JSONB;
    END IF;

    INSERT INTO public.student_referrals (referrer_id, referred_id)
    VALUES (v_student_referrer_id, v_student_id);

    RETURN '{"success": true, "message": "Student referral code applied successfully!"}'::JSONB;
  END IF;

  RETURN '{"success": false, "message": "Invalid or inactive referral code."}'::JSONB;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;
