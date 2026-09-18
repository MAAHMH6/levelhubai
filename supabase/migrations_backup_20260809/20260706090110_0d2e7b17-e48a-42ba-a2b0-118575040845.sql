
-- Enums
CREATE TYPE public.subscription_plan AS ENUM ('free','pro','school');
CREATE TYPE public.subscription_status AS ENUM ('active','trialing','past_due','cancelled','expired','pending');
CREATE TYPE public.payment_status AS ENUM ('succeeded','failed','refunded','pending');

-- Subscriptions (one active per user)
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan public.subscription_plan NOT NULL DEFAULT 'free',
  status public.subscription_status NOT NULL DEFAULT 'active',
  billing_cycle TEXT DEFAULT 'monthly',
  provider TEXT DEFAULT 'paddle',
  provider_subscription_id TEXT,
  provider_customer_id TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_user_unique UNIQUE (user_id)
);
CREATE INDEX idx_subs_provider_sub ON public.subscriptions(provider_subscription_id);
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own subscription" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read all subscriptions" ON public.subscriptions FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage subscriptions" ON public.subscriptions FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER subs_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  provider TEXT NOT NULL DEFAULT 'paddle',
  provider_transaction_id TEXT NOT NULL UNIQUE,
  invoice_number TEXT,
  amount_cents BIGINT NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'PKR',
  status public.payment_status NOT NULL DEFAULT 'pending',
  receipt_url TEXT,
  paid_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_user ON public.payments(user_id);
CREATE INDEX idx_payments_paid_at ON public.payments(paid_at);
GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own payments" ON public.payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read all payments" ON public.payments FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Pricing settings (key-value)
CREATE TABLE public.pricing_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);
GRANT SELECT ON public.pricing_settings TO anon, authenticated;
GRANT ALL ON public.pricing_settings TO service_role;
ALTER TABLE public.pricing_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads pricing" ON public.pricing_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage pricing" ON public.pricing_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.pricing_settings(key,value) VALUES
  ('pro_monthly_price_pkr', '5000'::jsonb),
  ('trial_days','0'::jsonb),
  ('free_daily_quiz_limit','20'::jsonb),
  ('free_allowed_subjects','["mathematics","physics","ict"]'::jsonb),
  ('school_contact_email','"sales@olevel.com.pk"'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Audit log
CREATE TABLE public.billing_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.billing_audit_logs TO authenticated;
GRANT ALL ON public.billing_audit_logs TO service_role;
ALTER TABLE public.billing_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read audit" ON public.billing_audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Usage counters (daily quiz starts)
CREATE TABLE public.usage_counters (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day DATE NOT NULL DEFAULT CURRENT_DATE,
  quizzes_started INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id, day)
);
GRANT SELECT, INSERT, UPDATE ON public.usage_counters TO authenticated;
GRANT ALL ON public.usage_counters TO service_role;
ALTER TABLE public.usage_counters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own usage" ON public.usage_counters FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
CREATE POLICY "Admins read usage" ON public.usage_counters FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Helper: get current effective plan (defaults free)
CREATE OR REPLACE FUNCTION public.get_user_plan(_user_id UUID)
RETURNS public.subscription_plan
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT COALESCE(
    (SELECT plan FROM public.subscriptions
      WHERE user_id=_user_id
        AND status IN ('active','trialing')
        AND (current_period_end IS NULL OR current_period_end > now())
      LIMIT 1),
    'free'::public.subscription_plan
  )
$$;

-- Increment quiz usage (atomic)
CREATE OR REPLACE FUNCTION public.increment_quiz_usage(_user_id UUID)
RETURNS INT
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
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
