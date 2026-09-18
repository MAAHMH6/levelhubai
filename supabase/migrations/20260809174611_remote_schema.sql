


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "public";






CREATE TYPE "public"."app_role" AS ENUM (
    'admin',
    'moderator',
    'user'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


CREATE TYPE "public"."payment_status" AS ENUM (
    'succeeded',
    'failed',
    'refunded',
    'pending'
);


ALTER TYPE "public"."payment_status" OWNER TO "postgres";


CREATE TYPE "public"."question_type" AS ENUM (
    'mcq',
    'true_false'
);


ALTER TYPE "public"."question_type" OWNER TO "postgres";


CREATE TYPE "public"."subscription_plan" AS ENUM (
    'free',
    'pro',
    'school'
);


ALTER TYPE "public"."subscription_plan" OWNER TO "postgres";


CREATE TYPE "public"."subscription_status" AS ENUM (
    'active',
    'trialing',
    'past_due',
    'cancelled',
    'expired',
    'pending'
);


ALTER TYPE "public"."subscription_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_search_users"("search_term" "text") RETURNS TABLE("id" "uuid", "display_name" "text", "email" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT p.id, p.display_name, u.email::text
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE (p.display_name ILIKE '%' || search_term || '%' OR u.email ILIKE '%' || search_term || '%')
  AND public.has_role(auth.uid(), 'admin') = true
  LIMIT 10;
$$;


ALTER FUNCTION "public"."admin_search_users"("search_term" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."apply_referral_code"("code_input" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."apply_referral_code"("code_input" "text") OWNER TO "postgres";


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

      -- Check if they hit a milestone (1 or 3) and haven't been rewarded for this specific referral
      -- Wait, if it's their 1st, we reward 7 days. If 3rd, we reward 30 days.
      IF v_active_count = 1 THEN
        -- Grant 7 Days Pro
        PERFORM public.grant_pro_access(v_referrer_id, 7);
        
        -- Mark as rewarded
        UPDATE public.student_referrals SET reward_status = 'rewarded' WHERE referred_id = NEW.id;

        -- Notify user
        INSERT INTO public.notifications (user_id, type, title, message)
        VALUES (v_referrer_id, 'referral_reward', 'Referral Milestone Reached!', 'Congratulations! Your friend joined LevelHubAI and became active. You have earned 7 Days of Pro.');

      ELSIF v_active_count = 3 THEN
        -- Grant 30 Days Pro
        PERFORM public.grant_pro_access(v_referrer_id, 30);
        
        -- Mark as rewarded
        UPDATE public.student_referrals SET reward_status = 'rewarded' WHERE referred_id = NEW.id;

        -- Notify user
        INSERT INTO public.notifications (user_id, type, title, message)
        VALUES (v_referrer_id, 'referral_reward', 'Referral Milestone Reached!', 'Congratulations! You referred 3 active students and unlocked 1 Month of Pro.');
      END IF;

    END IF;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_student_activation"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_child_linking_code"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."generate_child_linking_code"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_plan"("_user_id" "uuid") RETURNS "public"."subscription_plan"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT COALESCE(
    (SELECT plan FROM public.subscriptions
      WHERE user_id=_user_id
        AND status IN ('active','trialing')
        AND (current_period_end IS NULL OR current_period_end > now())
      LIMIT 1),
    'free'::public.subscription_plan
  )
$$;


ALTER FUNCTION "public"."get_user_plan"("_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."grant_pro_access"("_user_id" "uuid", "_days" integer) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_sub_id UUID;
  v_current_end TIMESTAMPTZ;
BEGIN
  -- Get active subscription if any
  SELECT id, current_period_end INTO v_sub_id, v_current_end 
  FROM public.subscriptions
  WHERE user_id = _user_id 
    AND status IN ('active', 'trialing') 
    AND (current_period_end IS NULL OR current_period_end > now())
  LIMIT 1;

  IF v_sub_id IS NOT NULL THEN
    -- Extend current period
    IF v_current_end IS NULL THEN
      v_current_end := now();
    END IF;
    UPDATE public.subscriptions 
    SET current_period_end = v_current_end + (_days || ' days')::INTERVAL,
        plan = 'pro'
    WHERE id = v_sub_id;
  ELSE
    -- Create new subscription
    INSERT INTO public.subscriptions (user_id, plan, status, started_at, current_period_end)
    VALUES (_user_id, 'pro', 'active', now(), now() + (_days || ' days')::INTERVAL);
  END IF;
  
  -- Update profile plan as a fallback
  UPDATE public.profiles SET subscription_plan = 'pro' WHERE id = _user_id;
END;
$$;


ALTER FUNCTION "public"."grant_pro_access"("_user_id" "uuid", "_days" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  assigned_role TEXT;
  referral_code_input TEXT;
  teacher_id_matched UUID;
  student_id_matched UUID;
  new_teacher_ref_code TEXT;
  new_student_ref_code TEXT;
BEGIN
  -- Determine role
  assigned_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'student');
  -- ADDED 'parent' to allowed roles
  IF assigned_role NOT IN ('student', 'teacher', 'admin', 'parent') THEN
    assigned_role := 'student';
  END IF;

  -- Generate student referral code for everyone just in case
  new_student_ref_code := 'LH-' || UPPER(SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 6));

  -- Create Profile
  INSERT INTO public.profiles (id, display_name, avatar_url, role, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.raw_user_meta_data ->> 'avatar_url',
    assigned_role,
    new_student_ref_code
  );

  -- If user is a teacher, generate referral code and insert into teacher_profiles
  IF assigned_role = 'teacher' THEN
    -- generate a simple referral code based on their name or email prefix + random string
    new_teacher_ref_code := UPPER(SUBSTRING(REGEXP_REPLACE(COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email), '[^a-zA-Z]', '', 'g'), 1, 5)) || SUBSTRING(MD5(RANDOM()::TEXT), 1, 4);
    
    INSERT INTO public.teacher_profiles (id, referral_code)
    VALUES (NEW.id, new_teacher_ref_code);
  END IF;

  -- If user provided a referral code
  referral_code_input := NEW.raw_user_meta_data ->> 'referral_code';
  IF referral_code_input IS NOT NULL THEN
    -- First check if it's a teacher referral
    SELECT id INTO teacher_id_matched FROM public.teacher_profiles WHERE UPPER(referral_code) = UPPER(referral_code_input) AND status = 'active';
    
    IF teacher_id_matched IS NOT NULL THEN
      INSERT INTO public.referrals (student_id, teacher_id, referral_code)
      VALUES (NEW.id, teacher_id_matched, UPPER(referral_code_input));
    ELSE
      -- Check if it's a student referral
      SELECT id INTO student_id_matched FROM public.profiles WHERE UPPER(referral_code) = UPPER(referral_code_input);
      
      IF student_id_matched IS NOT NULL AND student_id_matched != NEW.id THEN
        INSERT INTO public.student_referrals (referrer_id, referred_id)
        VALUES (student_id_matched, NEW.id);
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_teacher_commission"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_referral_id UUID;
  v_teacher_id UUID;
  v_commission_percent TEXT;
  v_commission_amount INT;
BEGIN
  -- Only process successful payments that are not already handled
  IF NEW.status = 'succeeded' AND (OLD IS NULL OR OLD.status != 'succeeded') THEN
    
    -- Check if student was referred by a teacher and the referral is active
    SELECT id, teacher_id INTO v_referral_id, v_teacher_id
    FROM public.referrals
    WHERE student_id = NEW.user_id
    LIMIT 1;
    
    IF v_referral_id IS NOT NULL THEN
      -- Get commission percentage from settings
      SELECT value#>>'{}' INTO v_commission_percent
      FROM public.app_settings
      WHERE key = 'teacher_commission_percent';
      
      -- Default to 10% if not found
      IF v_commission_percent IS NULL THEN
        v_commission_percent := '10';
      END IF;
      
      -- Calculate commission (amount_cents / 100 * percent / 100)
      v_commission_amount := (NEW.amount_cents / 100) * (v_commission_percent::numeric / 100.0);
      
      -- Insert commission (ignore if payment_id already exists due to unique constraint)
      INSERT INTO public.commissions (teacher_id, referral_id, payment_id, amount, status)
      VALUES (v_teacher_id, v_referral_id, NEW.id, v_commission_amount, 'pending')
      ON CONFLICT (payment_id) DO NOTHING;
      
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_teacher_commission"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_user_verification"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."handle_user_verification"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


ALTER FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_quiz_usage"("_user_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  new_count INT;
BEGIN
  INSERT INTO public.usage_counters(user_id, day, quizzes_started)
  VALUES (_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, day)
  DO UPDATE SET quizzes_started = public.usage_counters.quizzes_started + 1,
                updated_at = now()
  RETURNING quizzes_started INTO new_count;
  RETURN new_count;
END;
$$;


ALTER FUNCTION "public"."increment_quiz_usage"("_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_parent_of"("_child_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.parent_children 
    WHERE parent_id = auth.uid() AND child_id = _child_id
  )
$$;


ALTER FUNCTION "public"."is_parent_of"("_child_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."link_child_account"("_code" "text") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."link_child_account"("_code" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."match_curriculum_chunks"("query_embedding" "public"."vector", "match_count" integer DEFAULT 12, "filter_subject_id" "uuid" DEFAULT NULL::"uuid", "filter_unit_id" "uuid" DEFAULT NULL::"uuid", "filter_topic_id" "uuid" DEFAULT NULL::"uuid", "filter_lesson_id" "uuid" DEFAULT NULL::"uuid", "filter_doc_type" "text" DEFAULT NULL::"text", "filter_year" integer DEFAULT NULL::integer, "filter_paper_number" integer DEFAULT NULL::integer) RETURNS TABLE("id" "uuid", "document_id" "uuid", "chunk_text" "text", "page_number" integer, "metadata" "jsonb", "similarity" double precision)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  select
    c.id,
    c.document_id,
    c.chunk_text,
    c.page_number,
    c.metadata,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.curriculum_chunks c
  join public.curriculum_documents d on d.id = c.document_id
  where c.embedding is not null
    and (filter_subject_id is null or c.subject_id = filter_subject_id)
    and (filter_unit_id is null or c.unit_id = filter_unit_id)
    and (filter_topic_id is null or c.topic_id = filter_topic_id)
    and (filter_lesson_id is null or c.lesson_id = filter_lesson_id)
    and (filter_doc_type is null or d.doc_type = filter_doc_type)
    and (filter_year is null or d.year = filter_year)
    and (filter_paper_number is null or d.paper_number = filter_paper_number)
  order by c.embedding <=> query_embedding
  limit match_count
$$;


ALTER FUNCTION "public"."match_curriculum_chunks"("query_embedding" "public"."vector", "match_count" integer, "filter_subject_id" "uuid", "filter_unit_id" "uuid", "filter_topic_id" "uuid", "filter_lesson_id" "uuid", "filter_doc_type" "text", "filter_year" integer, "filter_paper_number" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."school_invites_prevent_field_changes"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."school_invites_prevent_field_changes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_students"("search_term" "text") RETURNS TABLE("id" "uuid", "display_name" "text", "avatar_url" "text", "xp_points" integer, "level" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, 
    p.display_name, 
    p.avatar_url, 
    p.xp_points, 
    p.level
  FROM public.profiles p
  LEFT JOIN public.referrals r ON r.referrer_id = p.id
  WHERE 
    p.id != auth.uid() -- Don't return self
    AND (
      p.display_name ILIKE '%' || search_term || '%'
      OR r.student_code ILIKE '%' || search_term || '%'
    )
  LIMIT 20;
END;
$$;


ALTER FUNCTION "public"."search_students"("search_term" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_can_access_subject"("_user" "uuid", "_subject_name" "text") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM public.subjects WHERE lower(name)=lower(_subject_name) AND is_premium=false AND enabled=true) THEN true
    WHEN _user IS NULL THEN false
    WHEN public.has_role(_user, 'admin'::public.app_role) THEN true
    ELSE public.get_user_plan(_user) IN ('pro','school')
  END
$$;


ALTER FUNCTION "public"."user_can_access_subject"("_user" "uuid", "_subject_name" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."ai_lesson_practice" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "lesson_id" "uuid" NOT NULL,
    "questions" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "is_ready" boolean DEFAULT false NOT NULL,
    "weak_topics" "text"[],
    "generated_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ai_lesson_practice" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_lesson_quiz" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "lesson_id" "uuid" NOT NULL,
    "questions" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "is_ready" boolean DEFAULT false NOT NULL,
    "generated_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ai_lesson_quiz" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_notes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "lesson_id" "uuid" NOT NULL,
    "ai_generated_content" "text",
    "user_personal_notes" "text",
    "generated_at" timestamp with time zone,
    "last_edited_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ai_notes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."app_branding" (
    "id" smallint DEFAULT 1 NOT NULL,
    "brand_name" "text" DEFAULT 'Level Hub AI'::"text" NOT NULL,
    "short_name" "text" DEFAULT 'LevelHub AI'::"text" NOT NULL,
    "logo_url" "text",
    "favicon_url" "text",
    "footer_copyright" "text" DEFAULT '© Level Hub AI. All rights reserved.'::"text" NOT NULL,
    "site_title" "text" DEFAULT 'Level Hub AI — O Level & IGCSE AI Learning Platform'::"text" NOT NULL,
    "seo_title" "text" DEFAULT 'Level Hub AI — Cambridge O Level & IGCSE Exam Prep with AI'::"text" NOT NULL,
    "seo_description" "text" DEFAULT 'AI-powered Cambridge O Level & IGCSE exam preparation: notes, quizzes, past papers, and an AI tutor across every core subject.'::"text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "app_branding_singleton" CHECK (("id" = 1))
);


ALTER TABLE "public"."app_branding" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."app_settings" (
    "key" "text" NOT NULL,
    "value" "jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_by" "uuid"
);


ALTER TABLE "public"."app_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."badges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "icon" "text" NOT NULL,
    "category" "text" DEFAULT 'achievement'::"text" NOT NULL,
    "requirement_type" "text" NOT NULL,
    "requirement_value" integer NOT NULL,
    "xp_reward" integer DEFAULT 50 NOT NULL,
    "rarity" "text" DEFAULT 'common'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."badges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."billing_audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event" "text" NOT NULL,
    "actor_user_id" "uuid",
    "target_user_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."billing_audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."blog_articles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "title" "text" NOT NULL,
    "meta_title" "text",
    "meta_description" "text",
    "excerpt" "text",
    "content" "text",
    "category" "text" DEFAULT 'Guide'::"text",
    "read_time" "text" DEFAULT '5 min read'::"text",
    "featured" boolean DEFAULT false,
    "image" "text",
    "keywords" "text"[] DEFAULT '{}'::"text"[],
    "published" boolean DEFAULT true,
    "published_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "program" "text" DEFAULT 'O Level'::"text",
    "subject" "text",
    "topic" "text",
    "author" "text" DEFAULT 'Admin'::"text",
    CONSTRAINT "blog_articles_program_check" CHECK (("program" = ANY (ARRAY['O Level'::"text", 'IGCSE'::"text", 'Both'::"text"])))
);


ALTER TABLE "public"."blog_articles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."challenges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "challenger_id" "uuid" NOT NULL,
    "challenged_id" "uuid" NOT NULL,
    "subject_id" "uuid",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "question_count" integer DEFAULT 10 NOT NULL,
    "challenger_score" integer DEFAULT 0,
    "challenged_score" integer DEFAULT 0,
    "challenger_completed_at" timestamp with time zone,
    "challenged_completed_at" timestamp with time zone,
    "winner_id" "uuid",
    "winner_xp" integer DEFAULT 50,
    "loser_xp" integer DEFAULT 20,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone DEFAULT ("now"() + '24:00:00'::interval) NOT NULL,
    "completed_at" timestamp with time zone,
    "challenge_questions" "jsonb" DEFAULT '[]'::"jsonb",
    "challenger_time_seconds" integer,
    "challenged_time_seconds" integer,
    "unit_id" "uuid",
    "topic_id" "uuid",
    "difficulty" "text" DEFAULT 'mixed'::"text",
    "time_limit_seconds" integer,
    "questions" "jsonb",
    "challenger_answers" "jsonb",
    "challenged_answers" "jsonb",
    "challenger_time_used" integer,
    "challenged_time_used" integer,
    CONSTRAINT "challenges_difficulty_check" CHECK (("difficulty" = ANY (ARRAY['easy'::"text", 'medium'::"text", 'hard'::"text", 'mixed'::"text"])))
);


ALTER TABLE "public"."challenges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."child_linking_codes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "child_id" "uuid" NOT NULL,
    "code" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."child_linking_codes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."class_students" (
    "class_id" "uuid" NOT NULL,
    "student_id" "uuid" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."class_students" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."classes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "teacher_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "join_code" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."classes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."comeback_bonuses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "days_inactive" integer DEFAULT 0 NOT NULL,
    "xp_awarded" integer DEFAULT 50 NOT NULL,
    "claimed_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."comeback_bonuses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."commissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "teacher_id" "uuid" NOT NULL,
    "referral_id" "uuid" NOT NULL,
    "payment_id" "uuid" NOT NULL,
    "amount" integer NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "commissions_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'paid'::"text", 'rejected'::"text", 'refunded'::"text"])))
);


ALTER TABLE "public"."commissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."countries" (
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "currency" "text" DEFAULT 'USD'::"text" NOT NULL,
    "flag_emoji" "text",
    "timezone" "text",
    "enabled" boolean DEFAULT true NOT NULL,
    "is_default" boolean DEFAULT false NOT NULL,
    "display_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."countries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."country_pricing" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "country_code" "text" NOT NULL,
    "plan" "text" NOT NULL,
    "currency" "text" NOT NULL,
    "monthly_price" numeric,
    "yearly_price" numeric,
    "lifetime_price" numeric,
    "paddle_price_id" "text",
    "enabled" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."country_pricing" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."curriculum_chunks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "document_id" "uuid" NOT NULL,
    "subject_id" "uuid",
    "unit_id" "uuid",
    "topic_id" "uuid",
    "lesson_id" "uuid",
    "chunk_index" integer NOT NULL,
    "page_number" integer,
    "chunk_text" "text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "embedding" "public"."vector"(1536),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."curriculum_chunks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."curriculum_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subject_id" "uuid",
    "doc_type" "text" NOT NULL,
    "source_name" "text" NOT NULL,
    "year" integer,
    "paper_number" integer,
    "variant" integer,
    "topic_tags" "text"[] DEFAULT '{}'::"text"[],
    "pdf_url" "text",
    "storage_path" "text",
    "total_pages" integer,
    "total_chunks" integer DEFAULT 0,
    "index_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "index_error" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "structured_index" "jsonb",
    "subject_code" "text",
    "provider" "text",
    "exam_board" "text",
    "edition" "text",
    CONSTRAINT "curriculum_documents_doc_type_check" CHECK (("doc_type" = ANY (ARRAY['syllabus'::"text", 'past_paper'::"text", 'curriculum'::"text", 'notes'::"text"]))),
    CONSTRAINT "curriculum_documents_index_status_check" CHECK (("index_status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'indexed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."curriculum_documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."daily_goals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "goal_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "target_xp" integer DEFAULT 100 NOT NULL,
    "earned_xp" integer DEFAULT 0 NOT NULL,
    "target_questions" integer DEFAULT 20 NOT NULL,
    "completed_questions" integer DEFAULT 0 NOT NULL,
    "target_streak_maintained" boolean DEFAULT false NOT NULL,
    "streak_maintained" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."daily_goals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."daily_quiz_usage" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "usage_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "lesson_quizzes_used" integer DEFAULT 0 NOT NULL,
    "unit_quizzes_used" integer DEFAULT 0 NOT NULL,
    "subject_quizzes_used" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."daily_quiz_usage" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."feedback" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "message" "text" NOT NULL,
    "status" "text" DEFAULT 'new'::"text" NOT NULL,
    "admin_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."feedback" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."friendships" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "friend_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."friendships" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lesson_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "lesson_id" "uuid" NOT NULL,
    "video_watch_percentage" integer DEFAULT 0 NOT NULL,
    "video_last_position_seconds" integer DEFAULT 0 NOT NULL,
    "video_completed" boolean DEFAULT false NOT NULL,
    "video_completed_at" timestamp with time zone,
    "video_xp_awarded" boolean DEFAULT false NOT NULL,
    "quiz_status" "text" DEFAULT 'not_started'::"text" NOT NULL,
    "quiz_score" integer,
    "quiz_attempts" integer DEFAULT 0 NOT NULL,
    "quiz_best_score" integer,
    "quiz_completed_at" timestamp with time zone,
    "quiz_xp_earned" integer DEFAULT 0 NOT NULL,
    "practice_status" "text" DEFAULT 'locked'::"text" NOT NULL,
    "practice_questions_attempted" integer DEFAULT 0 NOT NULL,
    "practice_questions_correct" integer DEFAULT 0 NOT NULL,
    "practice_xp_earned" integer DEFAULT 0 NOT NULL,
    "notes_generated" boolean DEFAULT false NOT NULL,
    "quiz_generated" boolean DEFAULT false NOT NULL,
    "practice_generated" boolean DEFAULT false NOT NULL,
    "lesson_completed" boolean DEFAULT false NOT NULL,
    "lesson_completed_at" timestamp with time zone,
    "total_time_spent_seconds" integer DEFAULT 0 NOT NULL,
    "first_accessed_at" timestamp with time zone DEFAULT "now"(),
    "last_accessed_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."lesson_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lessons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "unit_id" "uuid" NOT NULL,
    "lesson_number" integer NOT NULL,
    "title" "text" NOT NULL,
    "video_url" "text",
    "video_duration_seconds" integer,
    "video_duration_display" "text",
    "xp_reward" integer DEFAULT 100 NOT NULL,
    "quiz_question_count" integer DEFAULT 15 NOT NULL,
    "practice_question_count" integer DEFAULT 25 NOT NULL,
    "topic_name" "text",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."lessons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "data" "jsonb" DEFAULT '{}'::"jsonb",
    "is_read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."parent_children" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "parent_id" "uuid" NOT NULL,
    "child_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."parent_children" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."past_paper_attempts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "paper_id" "uuid" NOT NULL,
    "mode" "text" NOT NULL,
    "score" integer,
    "total_marks" integer,
    "percentage" integer,
    "time_taken_seconds" integer,
    "completed_at" timestamp with time zone,
    "xp_earned" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."past_paper_attempts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."past_papers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subject_id" "uuid" NOT NULL,
    "exam_board" "text" NOT NULL,
    "year" integer NOT NULL,
    "session" "text" NOT NULL,
    "paper_number" integer NOT NULL,
    "variant" integer,
    "pdf_url" "text",
    "marking_scheme_url" "text",
    "total_marks" integer,
    "duration_minutes" integer,
    "xp_reward" integer DEFAULT 250 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "questions_data" "jsonb" DEFAULT '[]'::"jsonb"
);


ALTER TABLE "public"."past_papers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "subscription_id" "uuid",
    "provider" "text" DEFAULT 'paddle'::"text" NOT NULL,
    "provider_transaction_id" "text" NOT NULL,
    "invoice_number" "text",
    "amount_cents" bigint DEFAULT 0 NOT NULL,
    "currency" "text" DEFAULT 'PKR'::"text" NOT NULL,
    "status" "public"."payment_status" DEFAULT 'pending'::"public"."payment_status" NOT NULL,
    "receipt_url" "text",
    "paid_at" timestamp with time zone,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pricing_settings" (
    "key" "text" NOT NULL,
    "value" "jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_by" "uuid"
);


ALTER TABLE "public"."pricing_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profile_private" (
    "user_id" "uuid" NOT NULL,
    "parent_email" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profile_private" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "display_name" "text",
    "avatar_url" "text",
    "grade_level" "text",
    "school" "text",
    "subjects" "text"[],
    "xp_points" integer DEFAULT 0 NOT NULL,
    "level" integer DEFAULT 1 NOT NULL,
    "streak_days" integer DEFAULT 0 NOT NULL,
    "coins" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "subscription_plan" "text" DEFAULT 'free'::"text",
    "school_id" "uuid",
    "country_code" "text" DEFAULT 'PK'::"text",
    "role" "text" DEFAULT 'student'::"text" NOT NULL,
    "referral_code" "text",
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['student'::"text", 'teacher'::"text", 'admin'::"text", 'parent'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quiz_attempts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "question_id" "uuid" NOT NULL,
    "selected_answer" "text",
    "is_correct" boolean NOT NULL,
    "time_taken_seconds" integer,
    "xp_earned" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."quiz_attempts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quiz_questions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "topic_id" "uuid" NOT NULL,
    "question_type" "public"."question_type" DEFAULT 'mcq'::"public"."question_type" NOT NULL,
    "question_text" "text" NOT NULL,
    "options" "jsonb",
    "correct_answer" "text" NOT NULL,
    "explanation" "text",
    "difficulty" integer DEFAULT 1 NOT NULL,
    "xp_reward" integer DEFAULT 10 NOT NULL,
    "time_limit_seconds" integer DEFAULT 30 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "source" "text" DEFAULT 'manual'::"text",
    "learning_objective" "text",
    "bloom_level" "text",
    "unit_hint" "text",
    "topic_hint" "text",
    CONSTRAINT "quiz_questions_difficulty_check" CHECK ((("difficulty" >= 1) AND ("difficulty" <= 5)))
);


ALTER TABLE "public"."quiz_questions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quiz_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "scope" "text" NOT NULL,
    "subject_id" "uuid",
    "unit_id" "uuid",
    "lesson_id" "uuid",
    "topic_ids" "uuid"[] DEFAULT '{}'::"uuid"[],
    "year" integer,
    "paper_number" integer,
    "question_count" integer DEFAULT 10 NOT NULL,
    "questions" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "answers" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "retrieved_chunk_ids" "uuid"[] DEFAULT '{}'::"uuid"[],
    "score" integer,
    "total" integer,
    "percentage" integer,
    "xp_earned" integer DEFAULT 0 NOT NULL,
    "status" "text" DEFAULT 'in_progress'::"text" NOT NULL,
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "quiz_type" "text" DEFAULT 'quick'::"text",
    "time_limit_seconds" integer,
    "difficulty" "text" DEFAULT 'mixed'::"text",
    CONSTRAINT "quiz_sessions_difficulty_check" CHECK (("difficulty" = ANY (ARRAY['easy'::"text", 'medium'::"text", 'hard'::"text", 'mixed'::"text"]))),
    CONSTRAINT "quiz_sessions_quiz_type_check" CHECK (("quiz_type" = ANY (ARRAY['quick'::"text", 'timed'::"text"]))),
    CONSTRAINT "quiz_sessions_scope_check" CHECK (("scope" = ANY (ARRAY['subject'::"text", 'unit'::"text", 'lesson'::"text", 'past_paper'::"text"]))),
    CONSTRAINT "quiz_sessions_status_check" CHECK (("status" = ANY (ARRAY['in_progress'::"text", 'completed'::"text", 'abandoned'::"text"])))
);


ALTER TABLE "public"."quiz_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."referrals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_id" "uuid" NOT NULL,
    "teacher_id" "uuid" NOT NULL,
    "referral_code" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."referrals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."school_invites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "school_id" "uuid" NOT NULL,
    "invited_by" "uuid" NOT NULL,
    "invited_email" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."school_invites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."schools" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "city" "text",
    "is_verified" boolean DEFAULT false NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."schools" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."social_links" (
    "key" "text" NOT NULL,
    "label" "text" NOT NULL,
    "url" "text",
    "enabled" boolean DEFAULT false NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."social_links" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."student_assessments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "logical_score" integer DEFAULT 0 NOT NULL,
    "verbal_score" integer DEFAULT 0 NOT NULL,
    "quantitative_score" integer DEFAULT 0 NOT NULL,
    "problem_solving_score" integer DEFAULT 0 NOT NULL,
    "processing_speed_score" integer DEFAULT 0 NOT NULL,
    "learning_style" "text",
    "study_time" "text",
    "study_frequency" "text",
    "favorite_subjects" "text"[],
    "interests" "text"[],
    "motivation_score" integer,
    "confidence_score" integer,
    "biggest_challenge" "text",
    "academic_goal" "text",
    "ai_report_summary" "text",
    "ai_strengths" "jsonb",
    "ai_weaknesses" "jsonb",
    "ai_study_plan" "jsonb",
    "ai_areas_to_explore" "jsonb",
    "needs_ai_refresh" boolean DEFAULT true
);


ALTER TABLE "public"."student_assessments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."student_referrals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "referrer_id" "uuid" NOT NULL,
    "referred_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "reward_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "student_referrals_reward_status_check" CHECK (("reward_status" = ANY (ARRAY['pending'::"text", 'rewarded'::"text"]))),
    CONSTRAINT "student_referrals_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'active'::"text"])))
);


ALTER TABLE "public"."student_referrals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."student_vocabulary" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "word" "text" NOT NULL,
    "meaning" "text" NOT NULL,
    "example_sentence" "text",
    "synonyms" "jsonb" DEFAULT '[]'::"jsonb",
    "difficulty" "text",
    "practice_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."student_vocabulary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subject_badges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subject_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "icon" "text" NOT NULL,
    "rarity" "text" DEFAULT 'common'::"text" NOT NULL,
    "requirement_type" "text" NOT NULL,
    "requirement_value" integer NOT NULL,
    "xp_reward" integer DEFAULT 25 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."subject_badges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subject_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "subject_id" "uuid" NOT NULL,
    "questions_attempted" integer DEFAULT 0 NOT NULL,
    "questions_correct" integer DEFAULT 0 NOT NULL,
    "total_xp_earned" integer DEFAULT 0 NOT NULL,
    "last_practiced_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."subject_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subjects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "icon" "text",
    "color" "text",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "subject_code" "text",
    "subscription_tier" "text" DEFAULT 'free'::"text" NOT NULL,
    "is_premium" boolean DEFAULT true NOT NULL,
    "icon_url" "text",
    "banner_url" "text",
    "qualification" "text" DEFAULT 'o_level'::"text" NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL,
    "display_order" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."subjects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "plan" "public"."subscription_plan" DEFAULT 'free'::"public"."subscription_plan" NOT NULL,
    "status" "public"."subscription_status" DEFAULT 'active'::"public"."subscription_status" NOT NULL,
    "billing_cycle" "text" DEFAULT 'monthly'::"text",
    "provider" "text" DEFAULT 'paddle'::"text",
    "provider_subscription_id" "text",
    "provider_customer_id" "text",
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "current_period_end" timestamp with time zone,
    "cancel_at" timestamp with time zone,
    "cancelled_at" timestamp with time zone,
    "trial_end" timestamp with time zone,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teacher_profiles" (
    "id" "uuid" NOT NULL,
    "referral_code" "text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "total_earned" integer DEFAULT 0 NOT NULL,
    "available_balance" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "teacher_profiles_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'suspended'::"text"])))
);


ALTER TABLE "public"."teacher_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."topics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subject_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "order_index" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."topics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."unit_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "unit_id" "uuid" NOT NULL,
    "lessons_completed" integer DEFAULT 0 NOT NULL,
    "total_lessons" integer DEFAULT 0 NOT NULL,
    "progress_percentage" integer DEFAULT 0 NOT NULL,
    "total_xp_earned" integer DEFAULT 0 NOT NULL,
    "average_quiz_score" integer,
    "is_unlocked" boolean DEFAULT false NOT NULL,
    "unlocked_at" timestamp with time zone,
    "unit_quiz_available" boolean DEFAULT false NOT NULL,
    "unit_quiz_score" integer,
    "unit_quiz_completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."unit_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."units" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subject_id" "uuid" NOT NULL,
    "unit_number" integer NOT NULL,
    "title" "text" NOT NULL,
    "icon_emoji" "text" DEFAULT '📘'::"text" NOT NULL,
    "description" "text",
    "duration_weeks" "text",
    "total_xp" integer DEFAULT 0 NOT NULL,
    "prerequisite_unit_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."units" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."usage_counters" (
    "user_id" "uuid" NOT NULL,
    "day" "date" DEFAULT CURRENT_DATE NOT NULL,
    "quizzes_started" integer DEFAULT 0 NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."usage_counters" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_badges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "badge_id" "uuid" NOT NULL,
    "earned_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_badges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."app_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_subject_badges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "subject_badge_id" "uuid" NOT NULL,
    "earned_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_subject_badges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."weak_topics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "topic_id" "uuid" NOT NULL,
    "subject_id" "uuid",
    "correct_count" integer DEFAULT 0 NOT NULL,
    "incorrect_count" integer DEFAULT 0 NOT NULL,
    "priority_score" integer DEFAULT 0 NOT NULL,
    "last_attempted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."weak_topics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."withdrawals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "teacher_id" "uuid" NOT NULL,
    "amount" integer NOT NULL,
    "payment_method" "text" NOT NULL,
    "payment_details" "jsonb" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "admin_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "withdrawals_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'paid'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."withdrawals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."writing_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "writing_type" "text" NOT NULL,
    "original_text" "text" NOT NULL,
    "improved_text" "text" NOT NULL,
    "overall_score" integer NOT NULL,
    "grammar_score" integer NOT NULL,
    "vocabulary_score" integer NOT NULL,
    "punctuation_score" integer NOT NULL,
    "spelling_score" integer NOT NULL,
    "clarity_score" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."writing_history" OWNER TO "postgres";


ALTER TABLE ONLY "public"."ai_lesson_practice"
    ADD CONSTRAINT "ai_lesson_practice_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_lesson_practice"
    ADD CONSTRAINT "ai_lesson_practice_user_id_lesson_id_key" UNIQUE ("user_id", "lesson_id");



ALTER TABLE ONLY "public"."ai_lesson_quiz"
    ADD CONSTRAINT "ai_lesson_quiz_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_lesson_quiz"
    ADD CONSTRAINT "ai_lesson_quiz_user_id_lesson_id_key" UNIQUE ("user_id", "lesson_id");



ALTER TABLE ONLY "public"."ai_notes"
    ADD CONSTRAINT "ai_notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_notes"
    ADD CONSTRAINT "ai_notes_user_id_lesson_id_key" UNIQUE ("user_id", "lesson_id");



ALTER TABLE ONLY "public"."app_branding"
    ADD CONSTRAINT "app_branding_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."app_settings"
    ADD CONSTRAINT "app_settings_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."badges"
    ADD CONSTRAINT "badges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."billing_audit_logs"
    ADD CONSTRAINT "billing_audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_articles"
    ADD CONSTRAINT "blog_articles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_articles"
    ADD CONSTRAINT "blog_articles_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."challenges"
    ADD CONSTRAINT "challenges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."child_linking_codes"
    ADD CONSTRAINT "child_linking_codes_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."child_linking_codes"
    ADD CONSTRAINT "child_linking_codes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."class_students"
    ADD CONSTRAINT "class_students_pkey" PRIMARY KEY ("class_id", "student_id");



ALTER TABLE ONLY "public"."classes"
    ADD CONSTRAINT "classes_join_code_key" UNIQUE ("join_code");



ALTER TABLE ONLY "public"."classes"
    ADD CONSTRAINT "classes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."comeback_bonuses"
    ADD CONSTRAINT "comeback_bonuses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."commissions"
    ADD CONSTRAINT "commissions_payment_id_key" UNIQUE ("payment_id");



ALTER TABLE ONLY "public"."commissions"
    ADD CONSTRAINT "commissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."countries"
    ADD CONSTRAINT "countries_pkey" PRIMARY KEY ("code");



ALTER TABLE ONLY "public"."country_pricing"
    ADD CONSTRAINT "country_pricing_country_code_plan_key" UNIQUE ("country_code", "plan");



ALTER TABLE ONLY "public"."country_pricing"
    ADD CONSTRAINT "country_pricing_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."curriculum_chunks"
    ADD CONSTRAINT "curriculum_chunks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."curriculum_documents"
    ADD CONSTRAINT "curriculum_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."daily_goals"
    ADD CONSTRAINT "daily_goals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."daily_goals"
    ADD CONSTRAINT "daily_goals_user_id_goal_date_key" UNIQUE ("user_id", "goal_date");



ALTER TABLE ONLY "public"."daily_quiz_usage"
    ADD CONSTRAINT "daily_quiz_usage_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."daily_quiz_usage"
    ADD CONSTRAINT "daily_quiz_usage_user_id_usage_date_key" UNIQUE ("user_id", "usage_date");



ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_user_id_friend_id_key" UNIQUE ("user_id", "friend_id");



ALTER TABLE ONLY "public"."lesson_progress"
    ADD CONSTRAINT "lesson_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lesson_progress"
    ADD CONSTRAINT "lesson_progress_user_id_lesson_id_key" UNIQUE ("user_id", "lesson_id");



ALTER TABLE ONLY "public"."lessons"
    ADD CONSTRAINT "lessons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lessons"
    ADD CONSTRAINT "lessons_unit_id_lesson_number_key" UNIQUE ("unit_id", "lesson_number");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."parent_children"
    ADD CONSTRAINT "parent_children_parent_id_child_id_key" UNIQUE ("parent_id", "child_id");



ALTER TABLE ONLY "public"."parent_children"
    ADD CONSTRAINT "parent_children_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."past_paper_attempts"
    ADD CONSTRAINT "past_paper_attempts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."past_papers"
    ADD CONSTRAINT "past_papers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_provider_transaction_id_key" UNIQUE ("provider_transaction_id");



ALTER TABLE ONLY "public"."pricing_settings"
    ADD CONSTRAINT "pricing_settings_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."profile_private"
    ADD CONSTRAINT "profile_private_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_referral_code_key" UNIQUE ("referral_code");



ALTER TABLE ONLY "public"."quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quiz_questions"
    ADD CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quiz_sessions"
    ADD CONSTRAINT "quiz_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_student_id_key" UNIQUE ("student_id");



ALTER TABLE ONLY "public"."school_invites"
    ADD CONSTRAINT "school_invites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."schools"
    ADD CONSTRAINT "schools_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."schools"
    ADD CONSTRAINT "schools_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."social_links"
    ADD CONSTRAINT "social_links_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."student_assessments"
    ADD CONSTRAINT "student_assessments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."student_assessments"
    ADD CONSTRAINT "student_assessments_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."student_referrals"
    ADD CONSTRAINT "student_referrals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."student_referrals"
    ADD CONSTRAINT "student_referrals_referred_id_key" UNIQUE ("referred_id");



ALTER TABLE ONLY "public"."student_vocabulary"
    ADD CONSTRAINT "student_vocabulary_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."student_vocabulary"
    ADD CONSTRAINT "student_vocabulary_user_id_word_key" UNIQUE ("user_id", "word");



ALTER TABLE ONLY "public"."subject_badges"
    ADD CONSTRAINT "subject_badges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subject_progress"
    ADD CONSTRAINT "subject_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subject_progress"
    ADD CONSTRAINT "subject_progress_user_id_subject_id_key" UNIQUE ("user_id", "subject_id");



ALTER TABLE ONLY "public"."subjects"
    ADD CONSTRAINT "subjects_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."subjects"
    ADD CONSTRAINT "subjects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_user_unique" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."teacher_profiles"
    ADD CONSTRAINT "teacher_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."teacher_profiles"
    ADD CONSTRAINT "teacher_profiles_referral_code_key" UNIQUE ("referral_code");



ALTER TABLE ONLY "public"."topics"
    ADD CONSTRAINT "topics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."unit_progress"
    ADD CONSTRAINT "unit_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."unit_progress"
    ADD CONSTRAINT "unit_progress_user_id_unit_id_key" UNIQUE ("user_id", "unit_id");



ALTER TABLE ONLY "public"."units"
    ADD CONSTRAINT "units_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."units"
    ADD CONSTRAINT "units_subject_id_unit_number_key" UNIQUE ("subject_id", "unit_number");



ALTER TABLE ONLY "public"."usage_counters"
    ADD CONSTRAINT "usage_counters_pkey" PRIMARY KEY ("user_id", "day");



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_user_id_badge_id_key" UNIQUE ("user_id", "badge_id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_role_key" UNIQUE ("user_id", "role");



ALTER TABLE ONLY "public"."user_subject_badges"
    ADD CONSTRAINT "user_subject_badges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_subject_badges"
    ADD CONSTRAINT "user_subject_badges_user_id_subject_badge_id_key" UNIQUE ("user_id", "subject_badge_id");



ALTER TABLE ONLY "public"."weak_topics"
    ADD CONSTRAINT "weak_topics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."weak_topics"
    ADD CONSTRAINT "weak_topics_user_id_topic_id_key" UNIQUE ("user_id", "topic_id");



ALTER TABLE ONLY "public"."withdrawals"
    ADD CONSTRAINT "withdrawals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."writing_history"
    ADD CONSTRAINT "writing_history_pkey" PRIMARY KEY ("id");



CREATE INDEX "curriculum_chunks_document_idx" ON "public"."curriculum_chunks" USING "btree" ("document_id");



CREATE INDEX "curriculum_chunks_embedding_idx" ON "public"."curriculum_chunks" USING "hnsw" ("embedding" "public"."vector_cosine_ops");



CREATE INDEX "curriculum_chunks_subject_idx" ON "public"."curriculum_chunks" USING "btree" ("subject_id");



CREATE INDEX "idx_ai_lesson_practice_user_lesson" ON "public"."ai_lesson_practice" USING "btree" ("user_id", "lesson_id");



CREATE INDEX "idx_ai_lesson_quiz_user_lesson" ON "public"."ai_lesson_quiz" USING "btree" ("user_id", "lesson_id");



CREATE INDEX "idx_ai_notes_user_lesson" ON "public"."ai_notes" USING "btree" ("user_id", "lesson_id");



CREATE INDEX "idx_lesson_progress_lesson_id" ON "public"."lesson_progress" USING "btree" ("lesson_id");



CREATE INDEX "idx_lesson_progress_user_id" ON "public"."lesson_progress" USING "btree" ("user_id");



CREATE INDEX "idx_lessons_unit_id" ON "public"."lessons" USING "btree" ("unit_id");



CREATE INDEX "idx_past_paper_attempts_user_id" ON "public"."past_paper_attempts" USING "btree" ("user_id");



CREATE INDEX "idx_past_papers_subject_id" ON "public"."past_papers" USING "btree" ("subject_id");



CREATE INDEX "idx_payments_paid_at" ON "public"."payments" USING "btree" ("paid_at");



CREATE INDEX "idx_payments_user" ON "public"."payments" USING "btree" ("user_id");



CREATE INDEX "idx_subs_provider_sub" ON "public"."subscriptions" USING "btree" ("provider_subscription_id");



CREATE INDEX "idx_unit_progress_unit_id" ON "public"."unit_progress" USING "btree" ("unit_id");



CREATE INDEX "idx_unit_progress_user_id" ON "public"."unit_progress" USING "btree" ("user_id");



CREATE INDEX "idx_units_subject_id" ON "public"."units" USING "btree" ("subject_id");



CREATE INDEX "quiz_questions_source_idx" ON "public"."quiz_questions" USING "btree" ("source");



CREATE INDEX "quiz_sessions_user_idx" ON "public"."quiz_sessions" USING "btree" ("user_id");



CREATE INDEX "weak_topics_user_idx" ON "public"."weak_topics" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "app_branding_updated_at" BEFORE UPDATE ON "public"."app_branding" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "check_student_activation_trigger" AFTER INSERT OR UPDATE OF "xp_points" ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."check_student_activation"();



CREATE OR REPLACE TRIGGER "school_invites_protect_fields" BEFORE UPDATE ON "public"."school_invites" FOR EACH ROW EXECUTE FUNCTION "public"."school_invites_prevent_field_changes"();



CREATE OR REPLACE TRIGGER "set_daily_quiz_usage_updated_at" BEFORE UPDATE ON "public"."daily_quiz_usage" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "social_links_updated_at" BEFORE UPDATE ON "public"."social_links" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "subs_updated_at" BEFORE UPDATE ON "public"."subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trg_countries_updated" BEFORE UPDATE ON "public"."countries" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trg_country_pricing_updated" BEFORE UPDATE ON "public"."country_pricing" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trg_curriculum_documents_updated" BEFORE UPDATE ON "public"."curriculum_documents" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trg_weak_topics_updated" BEFORE UPDATE ON "public"."weak_topics" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_teacher_commission_on_payment" AFTER INSERT OR UPDATE ON "public"."payments" FOR EACH ROW EXECUTE FUNCTION "public"."handle_teacher_commission"();



CREATE OR REPLACE TRIGGER "update_ai_notes_updated_at" BEFORE UPDATE ON "public"."ai_notes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_app_settings_updated_at" BEFORE UPDATE ON "public"."app_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_friendships_updated_at" BEFORE UPDATE ON "public"."friendships" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_lesson_progress_updated_at" BEFORE UPDATE ON "public"."lesson_progress" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_student_assessments_updated_at" BEFORE UPDATE ON "public"."student_assessments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_subject_progress_updated_at" BEFORE UPDATE ON "public"."subject_progress" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_unit_progress_updated_at" BEFORE UPDATE ON "public"."unit_progress" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."ai_lesson_practice"
    ADD CONSTRAINT "ai_lesson_practice_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_lesson_practice"
    ADD CONSTRAINT "ai_lesson_practice_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_lesson_quiz"
    ADD CONSTRAINT "ai_lesson_quiz_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_lesson_quiz"
    ADD CONSTRAINT "ai_lesson_quiz_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_notes"
    ADD CONSTRAINT "ai_notes_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_notes"
    ADD CONSTRAINT "ai_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."billing_audit_logs"
    ADD CONSTRAINT "billing_audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."billing_audit_logs"
    ADD CONSTRAINT "billing_audit_logs_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."challenges"
    ADD CONSTRAINT "challenges_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id");



ALTER TABLE ONLY "public"."challenges"
    ADD CONSTRAINT "challenges_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id");



ALTER TABLE ONLY "public"."challenges"
    ADD CONSTRAINT "challenges_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id");



ALTER TABLE ONLY "public"."child_linking_codes"
    ADD CONSTRAINT "child_linking_codes_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."class_students"
    ADD CONSTRAINT "class_students_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."class_students"
    ADD CONSTRAINT "class_students_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."classes"
    ADD CONSTRAINT "classes_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."commissions"
    ADD CONSTRAINT "commissions_referral_id_fkey" FOREIGN KEY ("referral_id") REFERENCES "public"."referrals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."commissions"
    ADD CONSTRAINT "commissions_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."country_pricing"
    ADD CONSTRAINT "country_pricing_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "public"."countries"("code") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."curriculum_chunks"
    ADD CONSTRAINT "curriculum_chunks_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."curriculum_documents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."curriculum_chunks"
    ADD CONSTRAINT "curriculum_chunks_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."curriculum_chunks"
    ADD CONSTRAINT "curriculum_chunks_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."curriculum_chunks"
    ADD CONSTRAINT "curriculum_chunks_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."curriculum_chunks"
    ADD CONSTRAINT "curriculum_chunks_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."curriculum_documents"
    ADD CONSTRAINT "curriculum_documents_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."daily_goals"
    ADD CONSTRAINT "daily_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."daily_quiz_usage"
    ADD CONSTRAINT "daily_quiz_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lesson_progress"
    ADD CONSTRAINT "lesson_progress_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lesson_progress"
    ADD CONSTRAINT "lesson_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lessons"
    ADD CONSTRAINT "lessons_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."parent_children"
    ADD CONSTRAINT "parent_children_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."parent_children"
    ADD CONSTRAINT "parent_children_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."past_paper_attempts"
    ADD CONSTRAINT "past_paper_attempts_paper_id_fkey" FOREIGN KEY ("paper_id") REFERENCES "public"."past_papers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."past_paper_attempts"
    ADD CONSTRAINT "past_paper_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."past_papers"
    ADD CONSTRAINT "past_papers_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pricing_settings"
    ADD CONSTRAINT "pricing_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."profile_private"
    ADD CONSTRAINT "profile_private_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id");



ALTER TABLE ONLY "public"."quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."quiz_questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quiz_questions"
    ADD CONSTRAINT "quiz_questions_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quiz_sessions"
    ADD CONSTRAINT "quiz_sessions_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."quiz_sessions"
    ADD CONSTRAINT "quiz_sessions_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."quiz_sessions"
    ADD CONSTRAINT "quiz_sessions_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."school_invites"
    ADD CONSTRAINT "school_invites_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."school_invites"
    ADD CONSTRAINT "school_invites_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."schools"
    ADD CONSTRAINT "schools_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."student_assessments"
    ADD CONSTRAINT "student_assessments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."student_referrals"
    ADD CONSTRAINT "student_referrals_referred_id_fkey" FOREIGN KEY ("referred_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."student_referrals"
    ADD CONSTRAINT "student_referrals_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."student_vocabulary"
    ADD CONSTRAINT "student_vocabulary_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subject_badges"
    ADD CONSTRAINT "subject_badges_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id");



ALTER TABLE ONLY "public"."subject_progress"
    ADD CONSTRAINT "subject_progress_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subject_progress"
    ADD CONSTRAINT "subject_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."teacher_profiles"
    ADD CONSTRAINT "teacher_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."topics"
    ADD CONSTRAINT "topics_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."unit_progress"
    ADD CONSTRAINT "unit_progress_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."unit_progress"
    ADD CONSTRAINT "unit_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."units"
    ADD CONSTRAINT "units_prerequisite_unit_id_fkey" FOREIGN KEY ("prerequisite_unit_id") REFERENCES "public"."units"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."units"
    ADD CONSTRAINT "units_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."usage_counters"
    ADD CONSTRAINT "usage_counters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_subject_badges"
    ADD CONSTRAINT "user_subject_badges_subject_badge_id_fkey" FOREIGN KEY ("subject_badge_id") REFERENCES "public"."subject_badges"("id");



ALTER TABLE ONLY "public"."weak_topics"
    ADD CONSTRAINT "weak_topics_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."weak_topics"
    ADD CONSTRAINT "weak_topics_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."withdrawals"
    ADD CONSTRAINT "withdrawals_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."writing_history"
    ADD CONSTRAINT "writing_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can delete app settings" ON "public"."app_settings" FOR DELETE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete badges" ON "public"."badges" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete blog articles" ON "public"."blog_articles" FOR DELETE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete chunks" ON "public"."curriculum_chunks" FOR DELETE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete curriculum docs" ON "public"."curriculum_documents" FOR DELETE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete feedback" ON "public"."feedback" FOR DELETE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete lessons" ON "public"."lessons" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete past_papers" ON "public"."past_papers" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete quiz_questions" ON "public"."quiz_questions" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete roles" ON "public"."user_roles" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete schools" ON "public"."schools" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete subjects" ON "public"."subjects" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete topics" ON "public"."topics" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete units" ON "public"."units" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert app settings" ON "public"."app_settings" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert badges" ON "public"."badges" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert blog articles" ON "public"."blog_articles" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert chunks" ON "public"."curriculum_chunks" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert curriculum docs" ON "public"."curriculum_documents" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert lessons" ON "public"."lessons" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert past_papers" ON "public"."past_papers" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert quiz_questions" ON "public"."quiz_questions" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert roles" ON "public"."user_roles" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert subjects" ON "public"."subjects" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert topics" ON "public"."topics" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert units" ON "public"."units" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage classes" ON "public"."classes" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage commissions" ON "public"."commissions" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage referrals" ON "public"."referrals" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage student referrals" ON "public"."student_referrals" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage withdrawals" ON "public"."withdrawals" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can read all teacher profiles" ON "public"."teacher_profiles" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update app settings" ON "public"."app_settings" FOR UPDATE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")) WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update badges" ON "public"."badges" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update blog articles" ON "public"."blog_articles" FOR UPDATE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update chunks" ON "public"."curriculum_chunks" FOR UPDATE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update curriculum docs" ON "public"."curriculum_documents" FOR UPDATE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update feedback" ON "public"."feedback" FOR UPDATE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update lessons" ON "public"."lessons" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update past_papers" ON "public"."past_papers" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update quiz_questions" ON "public"."quiz_questions" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update schools" ON "public"."schools" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update subjects" ON "public"."subjects" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update teacher profiles" ON "public"."teacher_profiles" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update topics" ON "public"."topics" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update units" ON "public"."units" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all blog articles" ON "public"."blog_articles" FOR SELECT TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all feedback" ON "public"."feedback" FOR SELECT TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all invites" ON "public"."school_invites" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all roles" ON "public"."user_roles" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins manage branding" ON "public"."app_branding" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")) WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins manage countries" ON "public"."countries" TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")) WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins manage country pricing" ON "public"."country_pricing" TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")) WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins manage pricing" ON "public"."pricing_settings" TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")) WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins manage social links" ON "public"."social_links" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")) WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins manage subscriptions" ON "public"."subscriptions" TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")) WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins read all payments" ON "public"."payments" FOR SELECT TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins read all subscriptions" ON "public"."subscriptions" FOR SELECT TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins read audit" ON "public"."billing_audit_logs" FOR SELECT TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins read usage" ON "public"."usage_counters" FOR SELECT TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Anyone authenticated can view chunks" ON "public"."curriculum_chunks" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Anyone authenticated can view curriculum docs" ON "public"."curriculum_documents" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Anyone can read app settings" ON "public"."app_settings" FOR SELECT USING (true);



CREATE POLICY "Anyone can read branding" ON "public"."app_branding" FOR SELECT USING (true);



CREATE POLICY "Anyone can view leaderboard profiles" ON "public"."profiles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Anyone can view subject badges" ON "public"."subject_badges" FOR SELECT USING (true);



CREATE POLICY "Anyone can view verified schools" ON "public"."schools" FOR SELECT USING ((("is_verified" = true) OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")));



CREATE POLICY "Anyone reads pricing" ON "public"."pricing_settings" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Anyone reads social links" ON "public"."social_links" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can view quiz questions" ON "public"."quiz_questions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Badges are viewable by everyone" ON "public"."badges" FOR SELECT USING (true);



CREATE POLICY "Children can create their own linking codes" ON "public"."child_linking_codes" FOR INSERT WITH CHECK (("auth"."uid"() = "child_id"));



CREATE POLICY "Children can delete their own linking codes" ON "public"."child_linking_codes" FOR DELETE USING (("auth"."uid"() = "child_id"));



CREATE POLICY "Children can delete their own parent links" ON "public"."parent_children" FOR DELETE USING (("auth"."uid"() = "child_id"));



CREATE POLICY "Children can view their own linking codes" ON "public"."child_linking_codes" FOR SELECT USING (("auth"."uid"() = "child_id"));



CREATE POLICY "Children can view their own parent links" ON "public"."parent_children" FOR SELECT USING (("auth"."uid"() = "child_id"));



CREATE POLICY "Countries readable by everyone" ON "public"."countries" FOR SELECT USING (true);



CREATE POLICY "Country pricing readable by everyone" ON "public"."country_pricing" FOR SELECT USING (true);



CREATE POLICY "Lessons are viewable by everyone" ON "public"."lessons" FOR SELECT USING (true);



CREATE POLICY "Parents can delete their own children links" ON "public"."parent_children" FOR DELETE USING (("auth"."uid"() = "parent_id"));



CREATE POLICY "Parents can view linked children assessments" ON "public"."student_assessments" FOR SELECT USING ("public"."is_parent_of"("user_id"));



CREATE POLICY "Parents can view linked children lesson progress" ON "public"."lesson_progress" FOR SELECT USING ("public"."is_parent_of"("user_id"));



CREATE POLICY "Parents can view linked children profiles" ON "public"."profiles" FOR SELECT USING ("public"."is_parent_of"("id"));



CREATE POLICY "Parents can view linked children quiz attempts" ON "public"."quiz_attempts" FOR SELECT USING ("public"."is_parent_of"("user_id"));



CREATE POLICY "Parents can view linked children quiz sessions" ON "public"."quiz_sessions" FOR SELECT USING ("public"."is_parent_of"("user_id"));



CREATE POLICY "Parents can view linked children subject progress" ON "public"."subject_progress" FOR SELECT USING ("public"."is_parent_of"("user_id"));



CREATE POLICY "Parents can view linked children unit progress" ON "public"."unit_progress" FOR SELECT USING ("public"."is_parent_of"("user_id"));



CREATE POLICY "Parents can view linked children writing history" ON "public"."writing_history" FOR SELECT USING ("public"."is_parent_of"("user_id"));



CREATE POLICY "Parents can view their own children links" ON "public"."parent_children" FOR SELECT USING (("auth"."uid"() = "parent_id"));



CREATE POLICY "Past papers are viewable by everyone" ON "public"."past_papers" FOR SELECT USING (true);



CREATE POLICY "Public can view published blog articles" ON "public"."blog_articles" FOR SELECT USING (("published" = true));



CREATE POLICY "Recipients can update invite status" ON "public"."school_invites" FOR UPDATE USING (("auth"."email"() = "invited_email")) WITH CHECK (("auth"."email"() = "invited_email"));



CREATE POLICY "Students can insert their own assessment" ON "public"."student_assessments" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Students can update their own assessment" ON "public"."student_assessments" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Students can view joined classes" ON "public"."classes" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."class_students"
  WHERE (("class_students"."class_id" = "classes"."id") AND ("class_students"."student_id" = "auth"."uid"())))));



CREATE POLICY "Students can view own class memberships" ON "public"."class_students" FOR SELECT USING (("auth"."uid"() = "student_id"));



CREATE POLICY "Students can view their own assessment" ON "public"."student_assessments" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Students can view their own referral" ON "public"."referrals" FOR SELECT USING (("auth"."uid"() = "student_id"));



CREATE POLICY "Students can view their own referrals" ON "public"."student_referrals" FOR SELECT USING ((("auth"."uid"() = "referrer_id") OR ("auth"."uid"() = "referred_id")));



CREATE POLICY "Subjects are viewable by everyone" ON "public"."subjects" FOR SELECT USING (true);



CREATE POLICY "Teachers can insert their withdrawals" ON "public"."withdrawals" FOR INSERT WITH CHECK (("auth"."uid"() = "teacher_id"));



CREATE POLICY "Teachers can manage their classes" ON "public"."classes" USING (("auth"."uid"() = "teacher_id"));



CREATE POLICY "Teachers can read own profile" ON "public"."teacher_profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Teachers can view class students" ON "public"."class_students" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."classes"
  WHERE (("classes"."id" = "class_students"."class_id") AND ("classes"."teacher_id" = "auth"."uid"())))));



CREATE POLICY "Teachers can view their commissions" ON "public"."commissions" FOR SELECT USING (("auth"."uid"() = "teacher_id"));



CREATE POLICY "Teachers can view their referrals" ON "public"."referrals" FOR SELECT USING (("auth"."uid"() = "teacher_id"));



CREATE POLICY "Teachers can view their withdrawals" ON "public"."withdrawals" FOR SELECT USING (("auth"."uid"() = "teacher_id"));



CREATE POLICY "Topics are viewable by everyone" ON "public"."topics" FOR SELECT USING (true);



CREATE POLICY "Units are viewable by everyone" ON "public"."units" FOR SELECT USING (true);



CREATE POLICY "Users can create challenges" ON "public"."challenges" FOR INSERT WITH CHECK (("auth"."uid"() = "challenger_id"));



CREATE POLICY "Users can create friendships" ON "public"."friendships" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create invites" ON "public"."school_invites" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "invited_by"));



CREATE POLICY "Users can create schools" ON "public"."schools" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can delete their own vocabulary" ON "public"."student_vocabulary" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can earn badges" ON "public"."user_badges" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can earn subject badges" ON "public"."user_subject_badges" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert notifications" ON "public"."notifications" FOR INSERT WITH CHECK ((("auth"."uid"() IS NOT NULL) AND (("auth"."uid"() = "user_id") OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role") OR (EXISTS ( SELECT 1
   FROM "public"."friendships" "f"
  WHERE ((("f"."user_id" = "auth"."uid"()) AND ("f"."friend_id" = "notifications"."user_id")) OR (("f"."friend_id" = "auth"."uid"()) AND ("f"."user_id" = "notifications"."user_id"))))) OR (EXISTS ( SELECT 1
   FROM "public"."challenges" "c"
  WHERE ((("c"."challenger_id" = "auth"."uid"()) AND ("c"."challenged_id" = "notifications"."user_id")) OR (("c"."challenged_id" = "auth"."uid"()) AND ("c"."challenger_id" = "notifications"."user_id"))))))));



CREATE POLICY "Users can insert their own attempts" ON "public"."quiz_attempts" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own comeback bonus" ON "public"."comeback_bonuses" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own daily quiz usage" ON "public"."daily_quiz_usage" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own feedback" ON "public"."feedback" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own goals" ON "public"."daily_goals" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own lesson progress" ON "public"."lesson_progress" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own notes" ON "public"."ai_notes" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own paper attempts" ON "public"."past_paper_attempts" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own practice questions" ON "public"."ai_lesson_practice" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own private profile" ON "public"."profile_private" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert their own progress" ON "public"."subject_progress" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own quiz questions" ON "public"."ai_lesson_quiz" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own unit progress" ON "public"."unit_progress" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own vocabulary" ON "public"."student_vocabulary" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own writing history" ON "public"."writing_history" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own challenges" ON "public"."challenges" FOR UPDATE USING ((("auth"."uid"() = "challenger_id") OR ("auth"."uid"() = "challenged_id")));



CREATE POLICY "Users can update their own daily quiz usage" ON "public"."daily_quiz_usage" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own friendships" ON "public"."friendships" FOR UPDATE USING ((("auth"."uid"() = "user_id") OR ("auth"."uid"() = "friend_id")));



CREATE POLICY "Users can update their own goals" ON "public"."daily_goals" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own lesson progress" ON "public"."lesson_progress" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own notes" ON "public"."ai_notes" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own notifications" ON "public"."notifications" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own paper attempts" ON "public"."past_paper_attempts" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own practice questions" ON "public"."ai_lesson_practice" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own private profile" ON "public"."profile_private" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own progress" ON "public"."subject_progress" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own quiz questions" ON "public"."ai_lesson_quiz" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own unit progress" ON "public"."unit_progress" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own vocabulary" ON "public"."student_vocabulary" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their invites" ON "public"."school_invites" FOR SELECT USING ((("auth"."uid"() = "invited_by") OR ("auth"."email"() = "invited_email")));



CREATE POLICY "Users can view their own attempts" ON "public"."quiz_attempts" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own badges" ON "public"."user_badges" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own challenges" ON "public"."challenges" FOR SELECT USING ((("auth"."uid"() = "challenger_id") OR ("auth"."uid"() = "challenged_id")));



CREATE POLICY "Users can view their own comeback bonuses" ON "public"."comeback_bonuses" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own daily quiz usage" ON "public"."daily_quiz_usage" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own feedback" ON "public"."feedback" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own friendships" ON "public"."friendships" FOR SELECT USING ((("auth"."uid"() = "user_id") OR ("auth"."uid"() = "friend_id")));



CREATE POLICY "Users can view their own goals" ON "public"."daily_goals" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own lesson progress" ON "public"."lesson_progress" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own notes" ON "public"."ai_notes" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own notifications" ON "public"."notifications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own paper attempts" ON "public"."past_paper_attempts" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own practice questions" ON "public"."ai_lesson_practice" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own private profile" ON "public"."profile_private" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own progress" ON "public"."subject_progress" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own quiz questions" ON "public"."ai_lesson_quiz" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own roles" ON "public"."user_roles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own subject badges" ON "public"."user_subject_badges" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own unit progress" ON "public"."unit_progress" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own vocabulary" ON "public"."student_vocabulary" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own writing history" ON "public"."writing_history" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users insert own sessions" ON "public"."quiz_sessions" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users insert own weak topics" ON "public"."weak_topics" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users manage own usage" ON "public"."usage_counters" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users read own payments" ON "public"."payments" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users read own subscription" ON "public"."subscriptions" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users update own sessions" ON "public"."quiz_sessions" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users update own weak topics" ON "public"."weak_topics" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users view own sessions" ON "public"."quiz_sessions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users view own weak topics" ON "public"."weak_topics" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."ai_lesson_practice" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_lesson_quiz" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_notes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."app_branding" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."app_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."badges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."billing_audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."blog_articles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."challenges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."child_linking_codes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."class_students" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."classes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."comeback_bonuses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."commissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."countries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."country_pricing" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."curriculum_chunks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."curriculum_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."daily_goals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."daily_quiz_usage" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."feedback" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."friendships" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lesson_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lessons" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."parent_children" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."past_paper_attempts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."past_papers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pricing_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profile_private" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quiz_attempts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quiz_questions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quiz_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."referrals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."school_invites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."schools" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."social_links" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."student_assessments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."student_referrals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."student_vocabulary" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subject_badges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subject_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subjects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."teacher_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."topics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."unit_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."units" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."usage_counters" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_badges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_subject_badges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."weak_topics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."withdrawals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."writing_history" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."admin_search_users"("search_term" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_search_users"("search_term" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_search_users"("search_term" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."apply_referral_code"("code_input" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."apply_referral_code"("code_input" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."apply_referral_code"("code_input" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_student_activation"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_student_activation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_student_activation"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_child_linking_code"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_child_linking_code"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_child_linking_code"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_user_plan"("_user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_user_plan"("_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_plan"("_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."grant_pro_access"("_user_id" "uuid", "_days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."grant_pro_access"("_user_id" "uuid", "_days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."grant_pro_access"("_user_id" "uuid", "_days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "postgres";
GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "anon";
GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "authenticated";
GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "service_role";



REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_teacher_commission"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_teacher_commission"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_teacher_commission"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_user_verification"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_user_verification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_user_verification"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "service_role";



REVOKE ALL ON FUNCTION "public"."increment_quiz_usage"("_user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."increment_quiz_usage"("_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_parent_of"("_child_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_parent_of"("_child_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_parent_of"("_child_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "postgres";
GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "anon";
GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "authenticated";
GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "service_role";



GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."link_child_account"("_code" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."link_child_account"("_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."link_child_account"("_code" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."match_curriculum_chunks"("query_embedding" "public"."vector", "match_count" integer, "filter_subject_id" "uuid", "filter_unit_id" "uuid", "filter_topic_id" "uuid", "filter_lesson_id" "uuid", "filter_doc_type" "text", "filter_year" integer, "filter_paper_number" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."match_curriculum_chunks"("query_embedding" "public"."vector", "match_count" integer, "filter_subject_id" "uuid", "filter_unit_id" "uuid", "filter_topic_id" "uuid", "filter_lesson_id" "uuid", "filter_doc_type" "text", "filter_year" integer, "filter_paper_number" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."match_curriculum_chunks"("query_embedding" "public"."vector", "match_count" integer, "filter_subject_id" "uuid", "filter_unit_id" "uuid", "filter_topic_id" "uuid", "filter_lesson_id" "uuid", "filter_doc_type" "text", "filter_year" integer, "filter_paper_number" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."school_invites_prevent_field_changes"() TO "anon";
GRANT ALL ON FUNCTION "public"."school_invites_prevent_field_changes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."school_invites_prevent_field_changes"() TO "service_role";



GRANT ALL ON FUNCTION "public"."search_students"("search_term" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."search_students"("search_term" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_students"("search_term" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_can_access_subject"("_user" "uuid", "_subject_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."user_can_access_subject"("_user" "uuid", "_subject_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_can_access_subject"("_user" "uuid", "_subject_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "service_role";












GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "service_role";









GRANT ALL ON TABLE "public"."ai_lesson_practice" TO "anon";
GRANT ALL ON TABLE "public"."ai_lesson_practice" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_lesson_practice" TO "service_role";



GRANT ALL ON TABLE "public"."ai_lesson_quiz" TO "anon";
GRANT ALL ON TABLE "public"."ai_lesson_quiz" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_lesson_quiz" TO "service_role";



GRANT ALL ON TABLE "public"."ai_notes" TO "anon";
GRANT ALL ON TABLE "public"."ai_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_notes" TO "service_role";



GRANT ALL ON TABLE "public"."app_branding" TO "anon";
GRANT ALL ON TABLE "public"."app_branding" TO "authenticated";
GRANT ALL ON TABLE "public"."app_branding" TO "service_role";



GRANT ALL ON TABLE "public"."app_settings" TO "anon";
GRANT ALL ON TABLE "public"."app_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."app_settings" TO "service_role";



GRANT ALL ON TABLE "public"."badges" TO "anon";
GRANT ALL ON TABLE "public"."badges" TO "authenticated";
GRANT ALL ON TABLE "public"."badges" TO "service_role";



GRANT ALL ON TABLE "public"."billing_audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."billing_audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."billing_audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."blog_articles" TO "anon";
GRANT ALL ON TABLE "public"."blog_articles" TO "authenticated";
GRANT ALL ON TABLE "public"."blog_articles" TO "service_role";



GRANT ALL ON TABLE "public"."challenges" TO "anon";
GRANT ALL ON TABLE "public"."challenges" TO "authenticated";
GRANT ALL ON TABLE "public"."challenges" TO "service_role";



GRANT ALL ON TABLE "public"."child_linking_codes" TO "anon";
GRANT ALL ON TABLE "public"."child_linking_codes" TO "authenticated";
GRANT ALL ON TABLE "public"."child_linking_codes" TO "service_role";



GRANT ALL ON TABLE "public"."class_students" TO "anon";
GRANT ALL ON TABLE "public"."class_students" TO "authenticated";
GRANT ALL ON TABLE "public"."class_students" TO "service_role";



GRANT ALL ON TABLE "public"."classes" TO "anon";
GRANT ALL ON TABLE "public"."classes" TO "authenticated";
GRANT ALL ON TABLE "public"."classes" TO "service_role";



GRANT ALL ON TABLE "public"."comeback_bonuses" TO "anon";
GRANT ALL ON TABLE "public"."comeback_bonuses" TO "authenticated";
GRANT ALL ON TABLE "public"."comeback_bonuses" TO "service_role";



GRANT ALL ON TABLE "public"."commissions" TO "anon";
GRANT ALL ON TABLE "public"."commissions" TO "authenticated";
GRANT ALL ON TABLE "public"."commissions" TO "service_role";



GRANT ALL ON TABLE "public"."countries" TO "anon";
GRANT ALL ON TABLE "public"."countries" TO "authenticated";
GRANT ALL ON TABLE "public"."countries" TO "service_role";



GRANT ALL ON TABLE "public"."country_pricing" TO "anon";
GRANT ALL ON TABLE "public"."country_pricing" TO "authenticated";
GRANT ALL ON TABLE "public"."country_pricing" TO "service_role";



GRANT ALL ON TABLE "public"."curriculum_chunks" TO "anon";
GRANT ALL ON TABLE "public"."curriculum_chunks" TO "authenticated";
GRANT ALL ON TABLE "public"."curriculum_chunks" TO "service_role";



GRANT ALL ON TABLE "public"."curriculum_documents" TO "anon";
GRANT ALL ON TABLE "public"."curriculum_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."curriculum_documents" TO "service_role";



GRANT ALL ON TABLE "public"."daily_goals" TO "anon";
GRANT ALL ON TABLE "public"."daily_goals" TO "authenticated";
GRANT ALL ON TABLE "public"."daily_goals" TO "service_role";



GRANT ALL ON TABLE "public"."daily_quiz_usage" TO "anon";
GRANT ALL ON TABLE "public"."daily_quiz_usage" TO "authenticated";
GRANT ALL ON TABLE "public"."daily_quiz_usage" TO "service_role";



GRANT ALL ON TABLE "public"."feedback" TO "anon";
GRANT ALL ON TABLE "public"."feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."feedback" TO "service_role";



GRANT ALL ON TABLE "public"."friendships" TO "anon";
GRANT ALL ON TABLE "public"."friendships" TO "authenticated";
GRANT ALL ON TABLE "public"."friendships" TO "service_role";



GRANT ALL ON TABLE "public"."lesson_progress" TO "anon";
GRANT ALL ON TABLE "public"."lesson_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."lesson_progress" TO "service_role";



GRANT ALL ON TABLE "public"."lessons" TO "anon";
GRANT ALL ON TABLE "public"."lessons" TO "authenticated";
GRANT ALL ON TABLE "public"."lessons" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."parent_children" TO "anon";
GRANT ALL ON TABLE "public"."parent_children" TO "authenticated";
GRANT ALL ON TABLE "public"."parent_children" TO "service_role";



GRANT ALL ON TABLE "public"."past_paper_attempts" TO "anon";
GRANT ALL ON TABLE "public"."past_paper_attempts" TO "authenticated";
GRANT ALL ON TABLE "public"."past_paper_attempts" TO "service_role";



GRANT ALL ON TABLE "public"."past_papers" TO "anon";
GRANT ALL ON TABLE "public"."past_papers" TO "authenticated";
GRANT ALL ON TABLE "public"."past_papers" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON TABLE "public"."pricing_settings" TO "anon";
GRANT ALL ON TABLE "public"."pricing_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."pricing_settings" TO "service_role";



GRANT ALL ON TABLE "public"."profile_private" TO "anon";
GRANT ALL ON TABLE "public"."profile_private" TO "authenticated";
GRANT ALL ON TABLE "public"."profile_private" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."quiz_attempts" TO "anon";
GRANT ALL ON TABLE "public"."quiz_attempts" TO "authenticated";
GRANT ALL ON TABLE "public"."quiz_attempts" TO "service_role";



GRANT ALL ON TABLE "public"."quiz_questions" TO "anon";
GRANT ALL ON TABLE "public"."quiz_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."quiz_questions" TO "service_role";



GRANT ALL ON TABLE "public"."quiz_sessions" TO "anon";
GRANT ALL ON TABLE "public"."quiz_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."quiz_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."referrals" TO "anon";
GRANT ALL ON TABLE "public"."referrals" TO "authenticated";
GRANT ALL ON TABLE "public"."referrals" TO "service_role";



GRANT ALL ON TABLE "public"."school_invites" TO "anon";
GRANT ALL ON TABLE "public"."school_invites" TO "authenticated";
GRANT ALL ON TABLE "public"."school_invites" TO "service_role";



GRANT ALL ON TABLE "public"."schools" TO "anon";
GRANT ALL ON TABLE "public"."schools" TO "authenticated";
GRANT ALL ON TABLE "public"."schools" TO "service_role";



GRANT ALL ON TABLE "public"."social_links" TO "anon";
GRANT ALL ON TABLE "public"."social_links" TO "authenticated";
GRANT ALL ON TABLE "public"."social_links" TO "service_role";



GRANT ALL ON TABLE "public"."student_assessments" TO "anon";
GRANT ALL ON TABLE "public"."student_assessments" TO "authenticated";
GRANT ALL ON TABLE "public"."student_assessments" TO "service_role";



GRANT ALL ON TABLE "public"."student_referrals" TO "anon";
GRANT ALL ON TABLE "public"."student_referrals" TO "authenticated";
GRANT ALL ON TABLE "public"."student_referrals" TO "service_role";



GRANT ALL ON TABLE "public"."student_vocabulary" TO "anon";
GRANT ALL ON TABLE "public"."student_vocabulary" TO "authenticated";
GRANT ALL ON TABLE "public"."student_vocabulary" TO "service_role";



GRANT ALL ON TABLE "public"."subject_badges" TO "anon";
GRANT ALL ON TABLE "public"."subject_badges" TO "authenticated";
GRANT ALL ON TABLE "public"."subject_badges" TO "service_role";



GRANT ALL ON TABLE "public"."subject_progress" TO "anon";
GRANT ALL ON TABLE "public"."subject_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."subject_progress" TO "service_role";



GRANT ALL ON TABLE "public"."subjects" TO "anon";
GRANT ALL ON TABLE "public"."subjects" TO "authenticated";
GRANT ALL ON TABLE "public"."subjects" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."teacher_profiles" TO "anon";
GRANT ALL ON TABLE "public"."teacher_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."teacher_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."topics" TO "anon";
GRANT ALL ON TABLE "public"."topics" TO "authenticated";
GRANT ALL ON TABLE "public"."topics" TO "service_role";



GRANT ALL ON TABLE "public"."unit_progress" TO "anon";
GRANT ALL ON TABLE "public"."unit_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."unit_progress" TO "service_role";



GRANT ALL ON TABLE "public"."units" TO "anon";
GRANT ALL ON TABLE "public"."units" TO "authenticated";
GRANT ALL ON TABLE "public"."units" TO "service_role";



GRANT ALL ON TABLE "public"."usage_counters" TO "anon";
GRANT ALL ON TABLE "public"."usage_counters" TO "authenticated";
GRANT ALL ON TABLE "public"."usage_counters" TO "service_role";



GRANT ALL ON TABLE "public"."user_badges" TO "anon";
GRANT ALL ON TABLE "public"."user_badges" TO "authenticated";
GRANT ALL ON TABLE "public"."user_badges" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."user_subject_badges" TO "anon";
GRANT ALL ON TABLE "public"."user_subject_badges" TO "authenticated";
GRANT ALL ON TABLE "public"."user_subject_badges" TO "service_role";



GRANT ALL ON TABLE "public"."weak_topics" TO "anon";
GRANT ALL ON TABLE "public"."weak_topics" TO "authenticated";
GRANT ALL ON TABLE "public"."weak_topics" TO "service_role";



GRANT ALL ON TABLE "public"."withdrawals" TO "anon";
GRANT ALL ON TABLE "public"."withdrawals" TO "authenticated";
GRANT ALL ON TABLE "public"."withdrawals" TO "service_role";



GRANT ALL ON TABLE "public"."writing_history" TO "anon";
GRANT ALL ON TABLE "public"."writing_history" TO "authenticated";
GRANT ALL ON TABLE "public"."writing_history" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

create extension if not exists "pg_net" with schema "public";

drop policy "Anyone reads pricing" on "public"."pricing_settings";


  create policy "Anyone reads pricing"
  on "public"."pricing_settings"
  as permissive
  for select
  to anon, authenticated
using (true);


CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_verified AFTER UPDATE OF email_confirmed_at ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_user_verification();


  create policy "Admins can delete curriculum docs"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'curriculum-docs'::text) AND public.has_role(auth.uid(), 'admin'::public.app_role)));



  create policy "Admins can update curriculum docs"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'curriculum-docs'::text) AND public.has_role(auth.uid(), 'admin'::public.app_role)));



  create policy "Admins can upload curriculum docs"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'curriculum-docs'::text) AND public.has_role(auth.uid(), 'admin'::public.app_role)));



  create policy "Authenticated can read curriculum docs"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'curriculum-docs'::text));



