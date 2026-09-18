
-- Wave 5: curriculum_documents.structured_index
ALTER TABLE public.curriculum_documents
  ADD COLUMN IF NOT EXISTS structured_index jsonb;

-- Wave 5: quiz_questions tagging for curriculum-derived questions
ALTER TABLE public.quiz_questions
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS learning_objective text,
  ADD COLUMN IF NOT EXISTS bloom_level text,
  ADD COLUMN IF NOT EXISTS unit_hint text,
  ADD COLUMN IF NOT EXISTS topic_hint text;

CREATE INDEX IF NOT EXISTS quiz_questions_source_idx ON public.quiz_questions(source);

-- Wave 4: countries
CREATE TABLE IF NOT EXISTS public.countries (
  code text PRIMARY KEY,
  name text NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  flag_emoji text,
  timezone text,
  enabled boolean NOT NULL DEFAULT true,
  is_default boolean NOT NULL DEFAULT false,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.countries TO anon;
GRANT SELECT ON public.countries TO authenticated;
GRANT ALL ON public.countries TO service_role;

ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Countries readable by everyone" ON public.countries
  FOR SELECT USING (true);

CREATE POLICY "Admins manage countries" ON public.countries
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Wave 4: country_pricing
CREATE TABLE IF NOT EXISTS public.country_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL REFERENCES public.countries(code) ON DELETE CASCADE,
  plan text NOT NULL,
  currency text NOT NULL,
  monthly_price numeric,
  yearly_price numeric,
  lifetime_price numeric,
  paddle_price_id text,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(country_code, plan)
);

GRANT SELECT ON public.country_pricing TO anon;
GRANT SELECT ON public.country_pricing TO authenticated;
GRANT ALL ON public.country_pricing TO service_role;

ALTER TABLE public.country_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Country pricing readable by everyone" ON public.country_pricing
  FOR SELECT USING (true);

CREATE POLICY "Admins manage country pricing" ON public.country_pricing
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- profiles.country_code
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country_code text DEFAULT 'PK';

-- Seed default countries
INSERT INTO public.countries (code, name, currency, flag_emoji, timezone, enabled, is_default, display_order)
VALUES
  ('PK', 'Pakistan',       'PKR', '🇵🇰', 'Asia/Karachi',  true, true,  1),
  ('US', 'United States',  'USD', '🇺🇸', 'America/New_York', true, false, 2),
  ('GB', 'United Kingdom', 'GBP', '🇬🇧', 'Europe/London', true, false, 3),
  ('AE', 'United Arab Emirates', 'AED', '🇦🇪', 'Asia/Dubai', true, false, 4),
  ('SA', 'Saudi Arabia',   'SAR', '🇸🇦', 'Asia/Riyadh', true, false, 5),
  ('IN', 'India',          'INR', '🇮🇳', 'Asia/Kolkata', true, false, 6)
ON CONFLICT (code) DO NOTHING;

-- Seed default country_pricing (rough defaults; admin will refine)
INSERT INTO public.country_pricing (country_code, plan, currency, monthly_price, yearly_price, lifetime_price)
VALUES
  ('PK','pro','PKR', 5000, 45000, 120000),
  ('US','pro','USD',   18,  180,   400),
  ('GB','pro','GBP',   15,  150,   340),
  ('AE','pro','AED',   65,  650,  1400),
  ('SA','pro','SAR',   65,  650,  1400),
  ('IN','pro','INR', 1499, 14990, 34990)
ON CONFLICT (country_code, plan) DO NOTHING;

-- update_updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_countries_updated ON public.countries;
CREATE TRIGGER trg_countries_updated BEFORE UPDATE ON public.countries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_country_pricing_updated ON public.country_pricing;
CREATE TRIGGER trg_country_pricing_updated BEFORE UPDATE ON public.country_pricing
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
