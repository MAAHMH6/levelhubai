-- ==============================================================================
-- MASTER CANONICAL RECONCILIATION FOR ALL PROGRAMMES (ALL-AT-ONCE)
-- (Cambridge O Level 21 Subjects, Cambridge IGCSE 21 Subjects, Cambridge A Level 18 Subjects)
--
-- Features:
-- 1. Non-destructive: In-place UPDATE on all existing subjects preserving foreign keys,
--    UUIDs, curriculum, lessons, quizzes, and past papers.
-- 2. Safe container creation for missing syllabus codes (ON CONFLICT DO UPDATE).
-- 3. Professional color palettes with ZERO duplicate colors within any programme.
-- 4. O Level & IGCSE have the exact same roster of 21 subjects with different Cambridge codes.
-- 5. Includes Psychology in O Level (2090), IGCSE (0990), and A Level (9990).
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- 1. CAMBRIDGE O LEVEL (21 CANONICAL SUBJECTS)
-- ==============================================================================

-- In-place update on existing O Level subjects
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

-- Insert missing canonical O Level containers (10 containers)
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


-- ==============================================================================
-- 2. CAMBRIDGE IGCSE (21 CANONICAL SUBJECTS)
-- ==============================================================================

-- In-place update on existing IGCSE subjects
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
  display_order = 3,
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
  display_order = 4,
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
  display_order = 5,
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
  display_order = 6,
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
  display_order = 8,
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
  display_order = 9,
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
  display_order = 10,
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
  display_order = 11,
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
  display_order = 17,
  enabled = true,
  is_premium = true,
  subscription_tier = 'pro',
  description = COALESCE(description, 'Cambridge IGCSE Urdu – Second Language (0539)')
WHERE id = '8e378b20-ced7-4b89-9b85-d5e34ed012a7';

-- Insert missing canonical IGCSE containers (11 containers)
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
    'c0040606-0000-4000-8000-000000000606',
    'Additional Mathematics',
    '0606',
    'igcse',
    '#7C3AED',
    'Sigma',
    2,
    true,
    true,
    'pro',
    'Cambridge IGCSE Additional Mathematics (0606)'
  ),
  (
    'c0010478-0000-4000-8000-000000000478',
    'Computer Science',
    '0478',
    'igcse',
    '#4F46E5',
    'Code2',
    7,
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
    12,
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
    13,
    true,
    true,
    'pro',
    'Cambridge IGCSE Business Studies (0450)'
  ),
  (
    'c0060493-0000-4000-8000-000000000493',
    'Islamiyat',
    '0493',
    'igcse',
    '#059669',
    'Moon',
    14,
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
    15,
    true,
    true,
    'pro',
    'Cambridge IGCSE Pakistan Studies (0448)'
  ),
  (
    'c0100538-0000-4000-8000-000000000538',
    'Urdu – First Language',
    '0538',
    'igcse',
    '#EA580C',
    'Languages',
    16,
    true,
    true,
    'pro',
    'Cambridge IGCSE Urdu – First Language (0538)'
  ),
  (
    'c0050495-0000-4000-8000-000000000495',
    'Sociology',
    '0495',
    'igcse',
    '#475569',
    'Users',
    18,
    true,
    true,
    'pro',
    'Cambridge IGCSE Sociology (0495)'
  ),
  (
    'c0080460-0000-4000-8000-000000000460',
    'Geography',
    '0460',
    'igcse',
    '#CA8A04',
    'Globe2',
    19,
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
    20,
    true,
    true,
    'pro',
    'Cambridge IGCSE History (0470)'
  ),
  (
    'c0110990-0000-4000-8000-000000000990',
    'Psychology',
    '0990',
    'igcse',
    '#C026D3',
    'Brain',
    21,
    true,
    true,
    'pro',
    'Cambridge IGCSE Psychology (0990)'
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


-- ==============================================================================
-- 3. CAMBRIDGE A LEVEL (18 CANONICAL SUBJECTS)
-- ==============================================================================

-- In-place update on existing A Level subjects
UPDATE public.subjects
SET
  name = 'English Language',
  subject_code = '9093',
  qualification = 'a_level',
  color = '#2563EB',
  icon = 'BookOpen',
  display_order = 1,
  enabled = true,
  description = COALESCE(description, 'Cambridge International AS and A Level English Language (9093)')
WHERE id = 'd203f997-be7c-4ad7-9047-dcc4fa72e77c'
   OR (subject_code = '9093' AND qualification = 'a_level');

UPDATE public.subjects
SET
  name = 'Mathematics',
  subject_code = '9709',
  qualification = 'a_level',
  color = '#7C3AED',
  icon = 'Calculator',
  display_order = 2,
  enabled = true,
  description = COALESCE(description, 'Cambridge International AS and A Level Mathematics (9709)')
WHERE id = '9d2b51bd-9c97-4417-9043-cdb30d0b6f5d'
   OR (subject_code = '9709' AND qualification = 'a_level');

UPDATE public.subjects
SET
  name = 'Chemistry',
  subject_code = '9701',
  qualification = 'a_level',
  color = '#DB2777',
  icon = 'FlaskConical',
  display_order = 4,
  enabled = true,
  description = COALESCE(description, 'Cambridge International AS and A Level Chemistry (9701)')
WHERE id = 'f478bfd2-4cf0-4149-998e-ef75db3e96e0'
   OR (subject_code = '9701' AND qualification = 'a_level');

UPDATE public.subjects
SET
  name = 'Biology',
  subject_code = '9700',
  qualification = 'a_level',
  color = '#16A34A',
  icon = 'Dna',
  display_order = 6,
  enabled = true,
  description = COALESCE(description, 'Cambridge International AS and A Level Biology (9700)')
WHERE id = 'f93edc3c-182a-4b5b-b7f1-390e9cd284e5'
   OR (subject_code = '9700' AND qualification = 'a_level');

UPDATE public.subjects
SET
  name = 'Economics',
  subject_code = '9708',
  qualification = 'a_level',
  color = '#92400E',
  icon = 'TrendingUp',
  display_order = 8,
  enabled = true,
  description = COALESCE(description, 'Cambridge International AS and A Level Economics (9708)')
WHERE id = '14f9c0c5-3110-4387-8702-8e6eed4b7d06'
   OR (subject_code = '9708' AND qualification = 'a_level');

UPDATE public.subjects
SET
  name = 'Business',
  subject_code = '9609',
  qualification = 'a_level',
  color = '#4F46E5',
  icon = 'BriefcaseBusiness',
  display_order = 9,
  enabled = true,
  description = COALESCE(description, 'Cambridge International AS and A Level Business (9609)')
WHERE id = '3266c995-2e38-4fff-a404-79e00482d656'
   OR (subject_code = '9609' AND qualification = 'a_level');

UPDATE public.subjects
SET
  name = 'Computer Science',
  subject_code = '9618',
  qualification = 'a_level',
  color = '#334155',
  icon = 'Code2',
  display_order = 13,
  enabled = true,
  description = COALESCE(description, 'Cambridge International AS and A Level Computer Science (9618)')
WHERE id = '795b7c8e-1a5f-4032-baca-52ee79fc89b8'
   OR (subject_code = '9618' AND qualification = 'a_level');

UPDATE public.subjects
SET
  name = 'Accounting',
  subject_code = '9706',
  qualification = 'a_level',
  color = '#65A30D',
  icon = 'ReceiptText',
  display_order = 14,
  enabled = true,
  description = COALESCE(description, 'Cambridge International AS and A Level Accounting (9706)')
WHERE id = '2cd03c2d-ab10-4472-a8d3-1b7ed2159bda'
   OR (subject_code = '9706' AND qualification = 'a_level');

UPDATE public.subjects
SET
  name = 'Psychology',
  subject_code = '9990',
  qualification = 'a_level',
  color = '#C026D3',
  icon = 'Brain',
  display_order = 15,
  enabled = true,
  description = COALESCE(description, 'Cambridge International AS and A Level Psychology (9990)')
WHERE id = '6f6f7168-3169-45e5-9cd0-1903901e7bbd'
   OR (subject_code = '9990' AND qualification = 'a_level');

-- Insert missing canonical A Level containers (9 containers)
INSERT INTO public.subjects (
  id,
  name,
  subject_code,
  qualification,
  color,
  icon,
  display_order,
  is_premium,
  subscription_tier,
  enabled,
  description
)
VALUES
  (
    'a0019686-0000-4000-8000-000000009686',
    'Urdu',
    '9686',
    'a_level',
    '#EA580C',
    'Languages',
    3,
    true,
    'pro',
    true,
    'Cambridge International A Level Urdu (9686)'
  ),
  (
    'a0029702-0000-4000-8000-000000009702',
    'Physics',
    '9702',
    'a_level',
    '#0891B2',
    'Atom',
    5,
    true,
    'pro',
    true,
    'Cambridge International AS and A Level Physics (9702)'
  ),
  (
    'a0039231-0000-4000-8000-000000009231',
    'Further Mathematics',
    '9231',
    'a_level',
    '#9333EA',
    'Sigma',
    7,
    true,
    'pro',
    true,
    'Cambridge International AS and A Level Further Mathematics (9231)'
  ),
  (
    'a0049695-0000-4000-8000-000000009695',
    'Literature in English',
    '9695',
    'a_level',
    '#E11D48',
    'BookText',
    10,
    true,
    'pro',
    true,
    'Cambridge International AS and A Level Literature in English (9695)'
  ),
  (
    'a0059699-0000-4000-8000-000000009699',
    'Sociology',
    '9699',
    'a_level',
    '#475569',
    'Users',
    11,
    true,
    'pro',
    true,
    'Cambridge International AS and A Level Sociology (9699)'
  ),
  (
    'a0069626-0000-4000-8000-000000009626',
    'Information Technology',
    '9626',
    'a_level',
    '#0F766E',
    'Monitor',
    12,
    true,
    'pro',
    true,
    'Cambridge International AS and A Level Information Technology (9626)'
  ),
  (
    'a0079696-0000-4000-8000-000000009696',
    'Geography',
    '9696',
    'a_level',
    '#CA8A04',
    'Globe2',
    16,
    true,
    'pro',
    true,
    'Cambridge International AS and A Level Geography (9696)'
  ),
  (
    'a0089489-0000-4000-8000-000000009489',
    'History',
    '9489',
    'a_level',
    '#64748B',
    'Landmark',
    17,
    true,
    'pro',
    true,
    'Cambridge International AS and A Level History (9489)'
  ),
  (
    'a0099239-0000-4000-8000-000000009239',
    'Global Perspectives & Research',
    '9239',
    'a_level',
    '#0D9488',
    'Globe',
    18,
    true,
    'pro',
    true,
    'Cambridge International AS and A Level Global Perspectives & Research (9239)'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  subject_code = EXCLUDED.subject_code,
  qualification = EXCLUDED.qualification,
  color = EXCLUDED.color,
  icon = EXCLUDED.icon,
  display_order = EXCLUDED.display_order,
  is_premium = EXCLUDED.is_premium,
  subscription_tier = EXCLUDED.subscription_tier,
  enabled = EXCLUDED.enabled,
  description = EXCLUDED.description;

COMMIT;
