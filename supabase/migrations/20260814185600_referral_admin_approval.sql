-- 1. Update reward_status constraint
ALTER TABLE "public"."student_referrals" DROP CONSTRAINT IF EXISTS "student_referrals_reward_status_check";
ALTER TABLE "public"."student_referrals" ADD CONSTRAINT "student_referrals_reward_status_check" CHECK (("reward_status" = ANY (ARRAY['pending'::"text", 'pending_approval'::text, 'rewarded'::"text", 'rejected'::text])));

-- 2. Update Trigger for check_student_activation
CREATE OR REPLACE FUNCTION "public"."check_student_activation"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_referrer_id UUID;
  v_active_count INT;
BEGIN
  -- If XP just went from 0 to >0, the student is now active
  IF (TG_OP = 'UPDATE' AND NEW.xp_points > 0 AND OLD.xp_points = 0) OR (TG_OP = 'INSERT' AND NEW.xp_points > 0) THEN
    -- Check if this student was referred by another student
    SELECT referrer_id INTO v_referrer_id 
    FROM public.student_referrals 
    WHERE referred_id = NEW.id AND status = 'pending';

    IF v_referrer_id IS NOT NULL THEN
      -- Mark referral as active
      UPDATE public.student_referrals 
      SET status = 'active', updated_at = now()
      WHERE referred_id = NEW.id;

      -- Count how many active referrals this referrer has
      SELECT COUNT(*) INTO v_active_count 
      FROM public.student_referrals 
      WHERE referrer_id = v_referrer_id AND status = 'active';

      -- Request Admin Approval instead of auto-granting Pro
      IF v_active_count = 1 THEN
        -- Mark as pending_approval
        UPDATE public.student_referrals SET reward_status = 'pending_approval' WHERE referred_id = NEW.id;

        -- Notify user
        INSERT INTO public.notifications (user_id, type, title, message)
        VALUES (v_referrer_id, 'referral_reward', 'Verification Pending', 'Your friend joined LevelHubAI and became active! Your 7 Days Pro reward is pending admin verification.');
      ELSIF v_active_count = 3 THEN
        -- Mark as pending_approval
        UPDATE public.student_referrals SET reward_status = 'pending_approval' WHERE referred_id = NEW.id;

        -- Notify user
        INSERT INTO public.notifications (user_id, type, title, message)
        VALUES (v_referrer_id, 'referral_reward', 'Verification Pending', 'You referred 3 active students! Your 1 Month Pro reward is pending admin verification.');
      END IF;

    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- 3. Create RPC to Approve Milestone
CREATE OR REPLACE FUNCTION "public"."approve_referral_milestone"(p_referral_id uuid) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_referrer_id UUID;
  v_active_count INT;
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN '{"success": false, "message": "Unauthorized"}'::JSONB;
  END IF;

  SELECT referrer_id INTO v_referrer_id 
  FROM public.student_referrals 
  WHERE id = p_referral_id AND reward_status = 'pending_approval';

  IF v_referrer_id IS NULL THEN
    RETURN '{"success": false, "message": "Referral not found or not pending approval"}'::JSONB;
  END IF;

  -- Count how many active referrals this referrer has so we know which reward to grant
  SELECT COUNT(*) INTO v_active_count 
  FROM public.student_referrals 
  WHERE referrer_id = v_referrer_id AND status = 'active';

  -- Grant Pro depending on milestone logic
  -- Note: We use v_active_count to roughly determine if they get 7 or 30 days. 
  -- If they have >= 3 active referrals, it's the 30 day milestone (or subsequent ones).
  -- Wait, what if they get approved out of order? We can just check the active count.
  -- Alternatively, grant based on how many they have.
  IF v_active_count >= 3 THEN
    PERFORM public.grant_pro_access(v_referrer_id, 30);
    INSERT INTO public.notifications (user_id, type, title, message)
    VALUES (v_referrer_id, 'referral_reward', 'Milestone Approved!', 'Your 3-referral milestone was approved. Enjoy your 1 Month of Pro!');
  ELSE
    PERFORM public.grant_pro_access(v_referrer_id, 7);
    INSERT INTO public.notifications (user_id, type, title, message)
    VALUES (v_referrer_id, 'referral_reward', 'Milestone Approved!', 'Your referral milestone was approved. Enjoy your 7 Days of Pro!');
  END IF;

  -- Update status
  UPDATE public.student_referrals SET reward_status = 'rewarded' WHERE id = p_referral_id;

  RETURN '{"success": true, "message": "Milestone approved successfully"}'::JSONB;
END;
$$;

-- 4. Create RPC to Reject Milestone
CREATE OR REPLACE FUNCTION "public"."reject_referral_milestone"(p_referral_id uuid, p_reason text DEFAULT 'Violation of referral terms') RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_referrer_id UUID;
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN '{"success": false, "message": "Unauthorized"}'::JSONB;
  END IF;

  SELECT referrer_id INTO v_referrer_id 
  FROM public.student_referrals 
  WHERE id = p_referral_id AND reward_status = 'pending_approval';

  IF v_referrer_id IS NULL THEN
    RETURN '{"success": false, "message": "Referral not found or not pending approval"}'::JSONB;
  END IF;

  -- Update status
  UPDATE public.student_referrals SET reward_status = 'rejected' WHERE id = p_referral_id;

  -- Notify user
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES (v_referrer_id, 'referral_reward', 'Milestone Rejected', 'Your referral milestone was rejected by an admin. Reason: ' || p_reason);

  RETURN '{"success": true, "message": "Milestone rejected successfully"}'::JSONB;
END;
$$;
