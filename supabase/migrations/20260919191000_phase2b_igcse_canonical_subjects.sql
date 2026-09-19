-- ==============================================================================
-- PHASE 2B: Cambridge IGCSE Canonical Subjects Reconciliation
-- Non-destructive, idempotent migration to align public.subjects for Cambridge IGCSE.
-- Preserves all existing UUIDs, foreign keys, units, lessons, quizzes, and past papers.
-- ==============================================================================

BEGIN;

-- 1. In-place UPDATE of existing IGCSE subjects to ensure canonical names, codes, colors, orders, and icons
UPDATE public.subjects
SET 
  name = 'Mathematics',
  subject_code = '0580',
  qualification = 'igcse',
  color = '#0D9488',
  icon = 'Calculator',
  display_order = 1,
  enabled = true,
  is_premium = false,
  subscription_tier = 'free',
  description = COALESCE(description, 'Cambridge IGCSE Mathematics (0580)')
WHERE id = 'f8899927-c4b4-4b0f-bc0c-87220b75df16';

UPDATE public.subjects
SET 
  name = 'Physics',
  subject_code = '0625',
  qualification = 'igcse',
  color = '#8B5CF6',
  icon = 'Atom',
  display_order = 2,
  enabled = true,
  is_premium = false,
  subscription_tier = 'free',
  description = COALESCE(description, 'Cambridge IGCSE Physics (0625)')
WHERE id = 'c2f640a2-f25b-4cc9-8f95-144913b51254';

UPDATE public.subjects
SET 
  name = 'Chemistry',
  subject_code = '0620',
  qualification = 'igcse',
  color = '#06B6D4',
  icon = 'FlaskConical',
  display_order = 3,
  enabled = true,
  is_premium = true,
  subscription_tier = 'pro',
  description = COALESCE(description, 'Cambridge IGCSE Chemistry (0620)')
WHERE id = '51ab1b5d-e371-487d-a795-b8e7a4915eb7';

UPDATE public.subjects
SET 
  name = 'Biology',
  subject_code = '0610',
  qualification = 'igcse',
  color = '#16A34A',
  icon = 'Dna',
  display_order = 4,
  enabled = true,
  is_premium = true,
  subscription_tier = 'pro',
  description = COALESCE(description, 'Cambridge IGCSE Biology (0610)')
WHERE id = '454404df-eaf0-4405-9555-0981813d14a1';

UPDATE public.subjects
SET 
  name = 'Information and Communication Technology',
  subject_code = '0417',
  qualification = 'igcse',
  color = '#0284C7',
  icon = 'Monitor',
  display_order = 5,
  enabled = true,
  is_premium = false,
  subscription_tier = 'free',
  description = COALESCE(description, 'Cambridge IGCSE ICT (0417)')
WHERE id = '5f97d9a6-f176-4d79-8a4c-2a859881a6a1';

UPDATE public.subjects
SET 
  name = 'English – First Language',
  subject_code = '0500',
  qualification = 'igcse',
  color = '#2563EB',
  icon = 'BookOpen',
  display_order = 7,
  enabled = true,
  is_premium = true,
  subscription_tier = 'pro',
  description = COALESCE(description, 'Cambridge IGCSE English – First Language (0500)')
WHERE id = '665ca56f-3f48-4b97-83bb-0dbaf926f712';

UPDATE public.subjects
SET 
  name = 'English – Second Language',
  subject_code = '0510',
  qualification = 'igcse',
  color = '#38BDF8',
  icon = 'BookOpen',
  display_order = 8,
  enabled = true,
  is_premium = true,
  subscription_tier = 'pro',
  description = COALESCE(description, 'Cambridge IGCSE English – Second Language (0510)')
WHERE id = '1e9c3949-21d7-479a-8cce-e692d19ac2f8';

UPDATE public.subjects
SET 
  name = 'Literature in English',
  subject_code = '0475',
  qualification = 'igcse',
  color = '#BE185D',
  icon = 'BookText',
  display_order = 9,
  enabled = true,
  is_premium = true,
  subscription_tier = 'pro',
  description = COALESCE(description, 'Cambridge IGCSE Literature in English (0475)')
WHERE id = '9e8f8d13-8678-4fac-9ed2-e99470ed57d2';

UPDATE public.subjects
SET 
  name = 'Accounting',
  subject_code = '0452',
  qualification = 'igcse',
  color = '#E11D48',
  icon = 'ReceiptText',
  display_order = 10,
  enabled = true,
  is_premium = true,
  subscription_tier = 'pro',
  description = COALESCE(description, 'Cambridge IGCSE Accounting (0452)')
WHERE id = '00580068-5b7f-4b63-b338-3f44020820ff';

UPDATE public.subjects
SET 
  name = 'Urdu – Second Language',
  subject_code = '0539',
  qualification = 'igcse',
  color = '#D97706',
  icon = 'Languages',
  display_order = 13,
  enabled = true,
  is_premium = true,
  subscription_tier = 'pro',
  description = COALESCE(description, 'Cambridge IGCSE Urdu – Second Language (0539)')
WHERE id = '8e378b20-ced7-4b89-9b85-d5e34ed012a7';

-- 2. Insert missing canonical IGCSE subject containers (idempotent ON CONFLICT DO UPDATE)
INSERT INTO public.subjects (
  id,
  name,
  subject_code,
  qualification,
  color,
  icon,
  display_order,
  enabled,
  is_premium,
  subscription_tier,
  description
) VALUES
  (
    'c0010478-0000-4000-8000-000000000478',
    'Computer Science',
    '0478',
    'igcse',
    '#4F46E5',
    'Code2',
    6,
    true,
    true,
    'pro',
    'Cambridge IGCSE Computer Science (0478)'
  ),
  (
    'c0020455-0000-4000-8000-000000000455',
    'Economics',
    '0455',
    'igcse',
    '#92400E',
    'TrendingUp',
    11,
    true,
    true,
    'pro',
    'Cambridge IGCSE Economics (0455)'
  ),
  (
    'c0030450-0000-4000-8000-000000000450',
    'Business Studies',
    '0450',
    'igcse',
    '#B45309',
    'BriefcaseBusiness',
    12,
    true,
    true,
    'pro',
    'Cambridge IGCSE Business Studies (0450)'
  ),
  (
    'c0040606-0000-4000-8000-000000000606',
    'Additional Mathematics',
    '0606',
    'igcse',
    '#7C3AED',
    'Sigma',
    14,
    true,
    true,
    'pro',
    'Cambridge IGCSE Additional Mathematics (0606)'
  ),
  (
    'c0050495-0000-4000-8000-000000000495',
    'Sociology',
    '0495',
    'igcse',
    '#475569',
    'Users',
    15,
    true,
    true,
    'pro',
    'Cambridge IGCSE Sociology (0495)'
  ),
  (
    'c0060493-0000-4000-8000-000000000493',
    'Islamiyat',
    '0493',
    'igcse',
    '#059669',
    'Moon',
    16,
    true,
    true,
    'pro',
    'Cambridge IGCSE Islamiyat (0493)'
  ),
  (
    'c0070448-0000-4000-8000-000000000448',
    'Pakistan Studies',
    '0448',
    'igcse',
    '#047857',
    'Map',
    17,
    true,
    true,
    'pro',
    'Cambridge IGCSE Pakistan Studies (0448)'
  ),
  (
    'c0080460-0000-4000-8000-000000000460',
    'Geography',
    '0460',
    'igcse',
    '#CA8A04',
    'Globe2',
    18,
    true,
    true,
    'pro',
    'Cambridge IGCSE Geography (0460)'
  ),
  (
    'c0090470-0000-4000-8000-000000000470',
    'History',
    '0470',
    'igcse',
    '#64748B',
    'Landmark',
    19,
    true,
    true,
    'pro',
    'Cambridge IGCSE History (0470)'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  subject_code = EXCLUDED.subject_code,
  qualification = EXCLUDED.qualification,
  color = EXCLUDED.color,
  icon = EXCLUDED.icon,
  display_order = EXCLUDED.display_order,
  enabled = EXCLUDED.enabled,
  is_premium = EXCLUDED.is_premium,
  subscription_tier = EXCLUDED.subscription_tier,
  description = EXCLUDED.description;

COMMIT;
