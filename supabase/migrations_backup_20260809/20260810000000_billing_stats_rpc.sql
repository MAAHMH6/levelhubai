-- Create RPC function to get billing stats accurately (without 1000 row limits)
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
