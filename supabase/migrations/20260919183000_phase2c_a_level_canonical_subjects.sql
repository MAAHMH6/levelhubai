-- ==============================================================================
-- PHASE 2C: CANONICAL A LEVEL SUBJECT RECONCILIATION & CONTAINER SETUP
-- Non-destructive in-place updates preserving all existing curriculum UUIDs.
-- Exactly 18 Canonical Cambridge A Level Subjects:
-- 1. English Language (9093) - #2563EB - BookOpen
-- 2. Mathematics (9709) - #7C3AED - Calculator
-- 3. Urdu (9686) - #EA580C - Languages
-- 4. Chemistry (9701) - #DB2777 - FlaskConical
-- 5. Physics (9702) - #0891B2 - Atom
-- 6. Biology (9700) - #16A34A - Dna
-- 7. Further Mathematics (9231) - #9333EA - Sigma
-- 8. Economics (9708) - #92400E - TrendingUp
-- 9. Business (9609) - #4F46E5 - BriefcaseBusiness
-- 10. Literature in English (9695) - #E11D48 - BookText
-- 11. Sociology (9699) - #475569 - Users
-- 12. Information Technology (9626) - #0F766E - Monitor
-- 13. Computer Science (9618) - #334155 - Code2
-- 14. Accounting (9706) - #65A30D - ReceiptText
-- 15. Psychology (9990) - #C026D3 - Brain
-- 16. Geography (9696) - #CA8A04 - Globe2
-- 17. History (9489) - #64748B - Landmark
-- 18. Global Perspectives & Research (9239) - #0D9488 - Globe
-- ==============================================================================

-- 1. UPDATE EXISTING 9 A LEVEL SUBJECTS IN-PLACE (PRESERVES EXISTING CURRICULUM & UUIDS)

-- 1. English Language (9093)
UPDATE "public"."subjects"
SET
  "name" = 'English Language',
  "subject_code" = '9093',
  "qualification" = 'a_level',
  "color" = '#2563EB',
  "icon" = 'BookOpen',
  "display_order" = 1,
  "enabled" = true,
  "description" = COALESCE("description", 'Cambridge International AS and A Level English Language (9093)')
WHERE "id" = 'd203f997-be7c-4ad7-9047-dcc4fa72e77c'
   OR ("subject_code" = '9093' AND "qualification" = 'a_level');

-- 2. Mathematics (9709)
UPDATE "public"."subjects"
SET
  "name" = 'Mathematics',
  "subject_code" = '9709',
  "qualification" = 'a_level',
  "color" = '#7C3AED',
  "icon" = 'Calculator',
  "display_order" = 2,
  "enabled" = true,
  "description" = COALESCE("description", 'Cambridge International AS and A Level Mathematics (9709)')
WHERE "id" = '9d2b51bd-9c97-4417-9043-cdb30d0b6f5d'
   OR ("subject_code" = '9709' AND "qualification" = 'a_level');

-- 4. Chemistry (9701)
UPDATE "public"."subjects"
SET
  "name" = 'Chemistry',
  "subject_code" = '9701',
  "qualification" = 'a_level',
  "color" = '#DB2777',
  "icon" = 'FlaskConical',
  "display_order" = 4,
  "enabled" = true,
  "description" = COALESCE("description", 'Cambridge International AS and A Level Chemistry (9701)')
WHERE "id" = 'f478bfd2-4cf0-4149-998e-ef75db3e96e0'
   OR ("subject_code" = '9701' AND "qualification" = 'a_level');

-- 6. Biology (9700)
UPDATE "public"."subjects"
SET
  "name" = 'Biology',
  "subject_code" = '9700',
  "qualification" = 'a_level',
  "color" = '#16A34A',
  "icon" = 'Dna',
  "display_order" = 6,
  "enabled" = true,
  "description" = COALESCE("description", 'Cambridge International AS and A Level Biology (9700)')
WHERE "id" = 'f93edc3c-182a-4b5b-b7f1-390e9cd284e5'
   OR ("subject_code" = '9700' AND "qualification" = 'a_level');

-- 8. Economics (9708)
UPDATE "public"."subjects"
SET
  "name" = 'Economics',
  "subject_code" = '9708',
  "qualification" = 'a_level',
  "color" = '#92400E',
  "icon" = 'TrendingUp',
  "display_order" = 8,
  "enabled" = true,
  "description" = COALESCE("description", 'Cambridge International AS and A Level Economics (9708)')
WHERE "id" = '14f9c0c5-3110-4387-8702-8e6eed4b7d06'
   OR ("subject_code" = '9708' AND "qualification" = 'a_level');

-- 9. Business (9609)
UPDATE "public"."subjects"
SET
  "name" = 'Business',
  "subject_code" = '9609',
  "qualification" = 'a_level',
  "color" = '#4F46E5',
  "icon" = 'BriefcaseBusiness',
  "display_order" = 9,
  "enabled" = true,
  "description" = COALESCE("description", 'Cambridge International AS and A Level Business (9609)')
WHERE "id" = '3266c995-2e38-4fff-a404-79e00482d656'
   OR ("subject_code" = '9609' AND "qualification" = 'a_level');

-- 13. Computer Science (9618)
UPDATE "public"."subjects"
SET
  "name" = 'Computer Science',
  "subject_code" = '9618',
  "qualification" = 'a_level',
  "color" = '#334155',
  "icon" = 'Code2',
  "display_order" = 13,
  "enabled" = true,
  "description" = COALESCE("description", 'Cambridge International AS and A Level Computer Science (9618)')
WHERE "id" = '795b7c8e-1a5f-4032-baca-52ee79fc89b8'
   OR ("subject_code" = '9618' AND "qualification" = 'a_level');

-- 14. Accounting (9706)
UPDATE "public"."subjects"
SET
  "name" = 'Accounting',
  "subject_code" = '9706',
  "qualification" = 'a_level',
  "color" = '#65A30D',
  "icon" = 'ReceiptText',
  "display_order" = 14,
  "enabled" = true,
  "description" = COALESCE("description", 'Cambridge International AS and A Level Accounting (9706)')
WHERE "id" = '2cd03c2d-ab10-4472-a8d3-1b7ed2159bda'
   OR ("subject_code" = '9706' AND "qualification" = 'a_level');

-- 15. Psychology (9990)
UPDATE "public"."subjects"
SET
  "name" = 'Psychology',
  "subject_code" = '9990',
  "qualification" = 'a_level',
  "color" = '#C026D3',
  "icon" = 'Brain',
  "display_order" = 15,
  "enabled" = true,
  "description" = COALESCE("description", 'Cambridge International AS and A Level Psychology (9990)')
WHERE "id" = '6f6f7168-3169-45e5-9cd0-1903901e7bbd'
   OR ("subject_code" = '9990' AND "qualification" = 'a_level');


-- 2. INSERT 9 MISSING CANONICAL A LEVEL SUBJECTS

INSERT INTO "public"."subjects" (
  "id",
  "name",
  "subject_code",
  "qualification",
  "color",
  "icon",
  "display_order",
  "is_premium",
  "subscription_tier",
  "enabled",
  "description"
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
    'free',
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
    'free',
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
    'free',
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
    'free',
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
    'free',
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
    'free',
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
    'free',
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
    'free',
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
    'free',
    true,
    'Cambridge International AS and A Level Global Perspectives & Research (9239)'
  )
ON CONFLICT ("id") DO UPDATE
SET
  "name" = EXCLUDED."name",
  "subject_code" = EXCLUDED."subject_code",
  "qualification" = EXCLUDED."qualification",
  "color" = EXCLUDED."color",
  "icon" = EXCLUDED."icon",
  "display_order" = EXCLUDED."display_order",
  "enabled" = EXCLUDED."enabled";
