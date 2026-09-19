-- ==============================================================================
-- PHASE 2A: Cambridge O Level Canonical Subjects Reconciliation (21 Subjects)
-- Non-destructive, idempotent migration to align public.subjects for Cambridge O Level.
-- Preserves all existing UUIDs, foreign keys, units, lessons, quizzes, and past papers.
-- Includes Psychology (2090) and matches the exact IGCSE subject roster.
-- ==============================================================================

BEGIN;

-- 1. In-place UPDATE of existing O Level subjects
UPDATE public.subjects
SET 
  name = 'Mathematics',
  subject_code = '4024',
  qualification = 'o_level',
  color = '#0D9488',
  icon = 'Calculator',
  display_order = 1,
  enabled = true,
  is_premium = false,
  subscription_tier = 'free',
  description = COALESCE(description, 'Cambridge O Level Mathematics Syllabus D (4024)')
WHERE id = '22c9be77-9ec7-44d3-9c20-04cad5f895e6';

UPDATE public.subjects
SET 
  name = 'Physics',
  subject_code = '5054',
  qualification = 'o_level',
  color = '#8B5CF6',
  icon = 'Atom',
  display_order = 3,
  enabled = true,
  is_premium = false,
  subscription_tier = 'free',
  description = COALESCE(description, 'Cambridge O Level Physics (5054)')
WHERE id = '04b0e4e8-5cb2-4692-93e8-9250a3f9f4b3';

UPDATE public.subjects
SET 
  name = 'Chemistry',
  subject_code = '5070',
  qualification = 'o_level',
  color = '#06B6D4',
  icon = 'FlaskConical',
  display_order = 4,
  enabled = true,
  is_premium = true,
  subscription_tier = 'pro',
  description = COALESCE(description, 'Cambridge O Level Chemistry (5070)')
WHERE id = '5f1acad5-c73c-4156-b56e-b99997e52b35';

UPDATE public.subjects
SET 
  name = 'Biology',
  subject_code = '5090',
  qualification = 'o_level',
  color = '#16A34A',
  icon = 'Dna',
  display_order = 5,
  enabled = true,
  is_premium = true,
  subscription_tier = 'pro',
  description = COALESCE(description, 'Cambridge O Level Biology (5090)')
WHERE id = 'f291da7d-59d4-470d-8437-f2117f026ee4';

UPDATE public.subjects
SET 
  name = 'Computer Science',
  subject_code = '2210',
  qualification = 'o_level',
  color = '#4F46E5',
  icon = 'Code2',
  display_order = 7,
  enabled = true,
  is_premium = true,
  subscription_tier = 'pro',
  description = COALESCE(description, 'Cambridge O Level Computer Science (2210)')
WHERE id = 'f249052a-6c35-4d36-b9f7-0e1f5bf213a7';

UPDATE public.subjects
SET 
  name = 'English – First Language',
  subject_code = '1123',
  qualification = 'o_level',
  color = '#2563EB',
  icon = 'BookOpen',
  display_order = 8,
  enabled = true,
  is_premium = true,
  subscription_tier = 'pro',
  description = COALESCE(description, 'Cambridge O Level English Language (1123)')
WHERE id = '8082b9e0-36d3-440b-9ca2-6bab67473da6';

UPDATE public.subjects
SET 
  name = 'Accounting',
  subject_code = '7707',
  qualification = 'o_level',
  color = '#E11D48',
  icon = 'ReceiptText',
  display_order = 11,
  enabled = true,
  is_premium = true,
  subscription_tier = 'pro',
  description = COALESCE(description, 'Cambridge O Level Accounting (7707)')
WHERE id = 'ccbb2c24-2412-4261-8f55-016e33b0909f';

UPDATE public.subjects
SET 
  name = 'Islamiyat',
  subject_code = '2058',
  qualification = 'o_level',
  color = '#059669',
  icon = 'Moon',
  display_order = 14,
  enabled = true,
  is_premium = true,
  subscription_tier = 'pro',
  description = COALESCE(description, 'Cambridge O Level Islamiyat (2058)')
WHERE id = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';

UPDATE public.subjects
SET 
  name = 'Pakistan Studies',
  subject_code = '2059',
  qualification = 'o_level',
  color = '#047857',
  icon = 'Map',
  display_order = 15,
  enabled = true,
  is_premium = true,
  subscription_tier = 'pro',
  description = COALESCE(description, 'Cambridge O Level Pakistan Studies (2059)')
WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

UPDATE public.subjects
SET 
  name = 'Urdu – First Language',
  subject_code = '3247',
  qualification = 'o_level',
  color = '#EA580C',
  icon = 'Languages',
  display_order = 16,
  enabled = true,
  is_premium = true,
  subscription_tier = 'pro',
  description = COALESCE(description, 'Cambridge O Level Urdu – First Language (3247)')
WHERE id = 'ccb3187a-65fa-4071-8408-43da8034b90f';

UPDATE public.subjects
SET 
  name = 'Urdu – Second Language',
  subject_code = '3248',
  qualification = 'o_level',
  color = '#D97706',
  icon = 'Languages',
  display_order = 17,
  enabled = true,
  is_premium = true,
  subscription_tier = 'pro',
  description = COALESCE(description, 'Cambridge O Level Urdu – Second Language (3248)')
WHERE id = 'c3d4e5f6-a7b8-9012-cdef-123456789012';

-- 2. Insert missing canonical O Level subject containers (10 containers)
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
    'b0014037-0000-4000-8000-000000004037',
    'Additional Mathematics',
    '4037',
    'o_level',
    '#7C3AED',
    'Sigma',
    2,
    true,
    true,
    'pro',
    'Cambridge O Level Additional Mathematics (4037)'
  ),
  (
    'b0060417-0000-4000-8000-000000000417',
    'Information and Communication Technology',
    '0417',
    'o_level',
    '#0284C7',
    'Monitor',
    6,
    true,
    false,
    'free',
    'Cambridge O Level Information & Communication Technology (0417)'
  ),
  (
    'b0071128-0000-4000-8000-000000001128',
    'English – Second Language',
    '1128',
    'o_level',
    '#38BDF8',
    'BookOpen',
    9,
    true,
    true,
    'pro',
    'Cambridge O Level English – Second Language (1128)'
  ),
  (
    'b0042010-0000-4000-8000-000000002010',
    'Literature in English',
    '2010',
    'o_level',
    '#BE185D',
    'BookText',
    10,
    true,
    true,
    'pro',
    'Cambridge O Level Literature in English (2010)'
  ),
  (
    'b0022281-0000-4000-8000-000000002281',
    'Economics',
    '2281',
    'o_level',
    '#92400E',
    'TrendingUp',
    12,
    true,
    true,
    'pro',
    'Cambridge O Level Economics (2281)'
  ),
  (
    'b0037115-0000-4000-8000-000000007115',
    'Business Studies',
    '7115',
    'o_level',
    '#B45309',
    'BriefcaseBusiness',
    13,
    true,
    true,
    'pro',
    'Cambridge O Level Business Studies (7115)'
  ),
  (
    'b0052251-0000-4000-8000-000000002251',
    'Sociology',
    '2251',
    'o_level',
    '#475569',
    'Users',
    18,
    true,
    true,
    'pro',
    'Cambridge O Level Sociology (2251)'
  ),
  (
    'b0082217-0000-4000-8000-000000002217',
    'Geography',
    '2217',
    'o_level',
    '#CA8A04',
    'Globe2',
    19,
    true,
    true,
    'pro',
    'Cambridge O Level Geography (2217)'
  ),
  (
    'b0092147-0000-4000-8000-000000002147',
    'History',
    '2147',
    'o_level',
    '#64748B',
    'Landmark',
    20,
    true,
    true,
    'pro',
    'Cambridge O Level History (2147)'
  ),
  (
    'b0102090-0000-4000-8000-000000002090',
    'Psychology',
    '2090',
    'o_level',
    '#C026D3',
    'Brain',
    21,
    true,
    true,
    'pro',
    'Cambridge O Level Psychology (2090)'
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
