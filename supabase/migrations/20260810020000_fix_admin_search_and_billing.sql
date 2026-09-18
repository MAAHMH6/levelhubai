-- 1. Fix admin_search_users to use LEFT JOIN so users without profiles can be found by email
CREATE OR REPLACE FUNCTION public.admin_search_users(search_term text)
RETURNS TABLE (id uuid, display_name text, email text)
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT u.id, p.display_name, u.email::text
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  WHERE (p.display_name ILIKE '%' || search_term || '%' OR u.email ILIKE '%' || search_term || '%')
  AND public.has_role(auth.uid(), 'admin') = true
  LIMIT 10;
$$;
ALTER FUNCTION "public"."admin_search_users"("search_term" "text") OWNER TO "postgres";
GRANT ALL ON FUNCTION "public"."admin_search_users"("search_term" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_search_users"("search_term" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_search_users"("search_term" "text") TO "service_role";

-- 2. Restore get_billing_dashboard_stats
CREATE OR REPLACE FUNCTION public.get_billing_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  total_revenue_cents BIGINT;
  mrr_cents BIGINT;
  free_count INT;
  pro_count INT;
  school_count INT;
  active_count INT;
BEGIN
  -- Total revenue (sum of all succeeded payments)
  SELECT COALESCE(SUM(amount_cents), 0) INTO total_revenue_cents
  FROM public.payments
  WHERE status = 'succeeded';

  -- MRR (sum of succeeded payments this month)
  SELECT COALESCE(SUM(amount_cents), 0) INTO mrr_cents
  FROM public.payments
  WHERE status = 'succeeded' 
  AND paid_at >= date_trunc('month', CURRENT_DATE);

  -- Active counts by plan
  SELECT 
    COUNT(*) FILTER (WHERE plan = 'free'),
    COUNT(*) FILTER (WHERE plan = 'pro'),
    COUNT(*) FILTER (WHERE plan = 'school'),
    COUNT(*) FILTER (WHERE status = 'active')
  INTO free_count, pro_count, school_count, active_count
  FROM public.subscriptions;

  RETURN json_build_object(
    'totalRevenueCents', total_revenue_cents,
    'mrrCents', mrr_cents,
    'counts', json_build_object(
      'free', free_count,
      'pro', pro_count,
      'school', school_count,
      'active', active_count
    )
  );
END;
$$;
ALTER FUNCTION "public"."get_billing_dashboard_stats"() OWNER TO "postgres";
GRANT ALL ON FUNCTION "public"."get_billing_dashboard_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_billing_dashboard_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_billing_dashboard_stats"() TO "service_role";

-- 3. Enable realtime for subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;
