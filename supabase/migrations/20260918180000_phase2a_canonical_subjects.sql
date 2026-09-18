-- ==============================================================================
-- PHASE 2A: CANONICAL SUBJECT RECONCILIATION & O-LEVEL CONTAINER STANDARDIZATION
-- Non-destructive in-place updates preserving all existing curriculum UUIDs.
-- Zero units, lessons, videos, or past papers deleted.
-- ==============================================================================

-- 1. Ensure canonical metadata columns exist on public.subjects
ALTER TABLE "public"."subjects" ADD COLUMN IF NOT EXISTS "qualification_variant" text;
ALTER TABLE "public"."subjects" ADD COLUMN IF NOT EXISTS "exam_board" text DEFAULT 'Cambridge';
ALTER TABLE "public"."subjects" ADD COLUMN IF NOT EXISTS "short_name" text;
ALTER TABLE "public"."subjects" ADD COLUMN IF NOT EXISTS "slug" text;

-- 2. RECONCILE EXISTING SUBJECTS IN-PLACE (PRESERVING UUIDS & ALL DEPENDENT DATA)

-- English Language (1123) - O Level
UPDATE "public"."subjects"
SET
  "name" = 'English Language',
  "subject_code" = '1123',
  "qualification" = 'o_level',
  "qualification_variant" = 'O Level',
  "exam_board" = 'Cambridge',
  "short_name" = 'English',
  "slug" = 'english-language',
  "is_premium" = true,
  "subscription_tier" = 'pro',
  "enabled" = true,
  "display_order" = 10,
  "description" = COALESCE("description", 'Cambridge O Level English Language (1123)')
WHERE "id" = '8082b9e0-36d3-440b-9ca2-6bab67473da6';

-- Mathematics (4024) - O Level (FREE CORE SUBJECT)
UPDATE "public"."subjects"
SET
  "name" = 'Mathematics',
  "subject_code" = '4024',
  "qualification" = 'o_level',
  "qualification_variant" = 'Syllabus D',
  "exam_board" = 'Cambridge',
  "short_name" = 'Maths D',
  "slug" = 'mathematics-syllabus-d',
  "is_premium" = false,
  "subscription_tier" = 'free',
  "enabled" = true,
  "display_order" = 20,
  "description" = COALESCE("description", 'Cambridge O Level Mathematics Syllabus D (4024)')
WHERE "id" = '22c9be77-9ec7-44d3-9c20-04cad5f895e6';

-- Urdu – First Language (3247) - O Level
UPDATE "public"."subjects"
SET
  "name" = 'Urdu – First Language',
  "subject_code" = '3247',
  "qualification" = 'o_level',
  "qualification_variant" = 'First Language',
  "exam_board" = 'Cambridge',
  "short_name" = 'Urdu 1st',
  "slug" = 'urdu-first-language',
  "is_premium" = true,
  "subscription_tier" = 'pro',
  "enabled" = true,
  "display_order" = 30,
  "description" = COALESCE("description", 'Cambridge O Level Urdu – First Language (3247)')
WHERE "id" = 'ccb3187a-65fa-4071-8408-43da8034b90f';

-- Urdu – Second Language (3248) - O Level
UPDATE "public"."subjects"
SET
  "name" = 'Urdu – Second Language',
  "subject_code" = '3248',
  "qualification" = 'o_level',
  "qualification_variant" = 'Second Language',
  "exam_board" = 'Cambridge',
  "short_name" = 'Urdu 2nd',
  "slug" = 'urdu-second-language',
  "is_premium" = true,
  "subscription_tier" = 'pro',
  "enabled" = true,
  "display_order" = 40,
  "description" = COALESCE("description", 'Cambridge O Level Urdu – Second Language (3248)')
WHERE "id" = 'c3d4e5f6-a7b8-9012-cdef-123456789012';

-- Islamiyat (2058) - O Level
UPDATE "public"."subjects"
SET
  "name" = 'Islamiyat',
  "subject_code" = '2058',
  "qualification" = 'o_level',
  "qualification_variant" = 'O Level',
  "exam_board" = 'Cambridge',
  "short_name" = 'Islamiyat',
  "slug" = 'islamiyat',
  "is_premium" = true,
  "subscription_tier" = 'pro',
  "enabled" = true,
  "display_order" = 50,
  "description" = COALESCE("description", 'Cambridge O Level Islamiyat (2058)')
WHERE "id" = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';

-- Pakistan Studies (2059) - O Level
UPDATE "public"."subjects"
SET
  "name" = 'Pakistan Studies',
  "subject_code" = '2059',
  "qualification" = 'o_level',
  "qualification_variant" = 'O Level',
  "exam_board" = 'Cambridge',
  "short_name" = 'Pak Studies',
  "slug" = 'pakistan-studies',
  "is_premium" = true,
  "subscription_tier" = 'pro',
  "enabled" = true,
  "display_order" = 60,
  "description" = COALESCE("description", 'Cambridge O Level Pakistan Studies (2059)')
WHERE "id" = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- Chemistry (5070) - O Level
UPDATE "public"."subjects"
SET
  "name" = 'Chemistry',
  "subject_code" = '5070',
  "qualification" = 'o_level',
  "qualification_variant" = 'O Level',
  "exam_board" = 'Cambridge',
  "short_name" = 'Chemistry',
  "slug" = 'chemistry',
  "is_premium" = true,
  "subscription_tier" = 'pro',
  "enabled" = true,
  "display_order" = 70,
  "description" = COALESCE("description", 'Cambridge O Level Chemistry (5070)')
WHERE "id" = '5f1acad5-c73c-4156-b56e-b99997e52b35';

-- Physics (5054) - O Level (FREE CORE SUBJECT)
UPDATE "public"."subjects"
SET
  "name" = 'Physics',
  "subject_code" = '5054',
  "qualification" = 'o_level',
  "qualification_variant" = 'O Level',
  "exam_board" = 'Cambridge',
  "short_name" = 'Physics',
  "slug" = 'physics',
  "is_premium" = false,
  "subscription_tier" = 'free',
  "enabled" = true,
  "display_order" = 80,
  "description" = COALESCE("description", 'Cambridge O Level Physics (5054)')
WHERE "id" = '04b0e4e8-5cb2-4692-93e8-9250a3f9f4b3';

-- Biology (5090) - O Level
UPDATE "public"."subjects"
SET
  "name" = 'Biology',
  "subject_code" = '5090',
  "qualification" = 'o_level',
  "qualification_variant" = 'O Level',
  "exam_board" = 'Cambridge',
  "short_name" = 'Biology',
  "slug" = 'biology',
  "is_premium" = true,
  "subscription_tier" = 'pro',
  "enabled" = true,
  "display_order" = 90,
  "description" = COALESCE("description", 'Cambridge O Level Biology (5090)')
WHERE "id" = 'f291da7d-59d4-470d-8437-f2117f026ee4';

-- Accounting (7707) - O Level
UPDATE "public"."subjects"
SET
  "name" = 'Accounting',
  "subject_code" = '7707',
  "qualification" = 'o_level',
  "qualification_variant" = 'O Level',
  "exam_board" = 'Cambridge',
  "short_name" = 'Accounting',
  "slug" = 'accounting',
  "is_premium" = true,
  "subscription_tier" = 'pro',
  "enabled" = true,
  "display_order" = 100,
  "description" = COALESCE("description", 'Cambridge O Level Accounting (7707)')
WHERE "id" = 'ccbb2c24-2412-4261-8f55-016e33b0909f';

-- Computer Science (2210) - O Level
-- Reconciling existing UUID f249052a-6c35-4d36-b9f7-0e1f5bf213a7 which holds 10 CS units, 120 lessons, 68 videos
UPDATE "public"."subjects"
SET
  "name" = 'Computer Science',
  "subject_code" = '2210',
  "qualification" = 'o_level',
  "qualification_variant" = 'O Level',
  "exam_board" = 'Cambridge',
  "short_name" = 'Computer Science',
  "slug" = 'computer-science',
  "is_premium" = true,
  "subscription_tier" = 'pro',
  "enabled" = true,
  "display_order" = 110,
  "description" = 'Cambridge O Level Computer Science (2210)'
WHERE "id" = 'f249052a-6c35-4d36-b9f7-0e1f5bf213a7';

-- 3. INSERT MISSING CANONICAL O LEVEL CONTAINERS
-- These are clean subject containers with NO invented units, lessons, or videos.

-- Additional Mathematics (4037)
INSERT INTO "public"."subjects" (
  "name", "subject_code", "qualification", "qualification_variant", "exam_board",
  "short_name", "slug", "icon", "color", "description", "subscription_tier", "is_premium", "enabled", "display_order"
)
SELECT
  'Additional Mathematics', '4037', 'o_level', 'O Level', 'Cambridge',
  'Add Maths', 'additional-mathematics', 'Calculator', 'hsl(262, 83%, 58%)',
  'Cambridge O Level Additional Mathematics (4037)', 'pro', true, true, 120
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."subjects" WHERE "subject_code" = '4037' AND "qualification" = 'o_level'
);

-- Economics (2281)
INSERT INTO "public"."subjects" (
  "name", "subject_code", "qualification", "qualification_variant", "exam_board",
  "short_name", "slug", "icon", "color", "description", "subscription_tier", "is_premium", "enabled", "display_order"
)
SELECT
  'Economics', '2281', 'o_level', 'O Level', 'Cambridge',
  'Economics', 'economics', 'TrendingUp', 'hsl(142, 71%, 45%)',
  'Cambridge O Level Economics (2281)', 'pro', true, true, 130
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."subjects" WHERE "subject_code" = '2281' AND "qualification" = 'o_level'
);

-- Business Studies (7115)
INSERT INTO "public"."subjects" (
  "name", "subject_code", "qualification", "qualification_variant", "exam_board",
  "short_name", "slug", "icon", "color", "description", "subscription_tier", "is_premium", "enabled", "display_order"
)
SELECT
  'Business Studies', '7115', 'o_level', 'O Level', 'Cambridge',
  'Business', 'business-studies', 'Briefcase', 'hsl(38, 92%, 50%)',
  'Cambridge O Level Business Studies (7115)', 'pro', true, true, 140
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."subjects" WHERE "subject_code" = '7115' AND "qualification" = 'o_level'
);

-- Literature in English (2010)
INSERT INTO "public"."subjects" (
  "name", "subject_code", "qualification", "qualification_variant", "exam_board",
  "short_name", "slug", "icon", "color", "description", "subscription_tier", "is_premium", "enabled", "display_order"
)
SELECT
  'Literature in English', '2010', 'o_level', 'O Level', 'Cambridge',
  'Literature', 'literature-in-english', 'BookMarked', 'hsl(330, 81%, 60%)',
  'Cambridge O Level Literature in English (2010)', 'pro', true, true, 150
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."subjects" WHERE "subject_code" = '2010' AND "qualification" = 'o_level'
);

-- Sociology (2251)
INSERT INTO "public"."subjects" (
  "name", "subject_code", "qualification", "qualification_variant", "exam_board",
  "short_name", "slug", "icon", "color", "description", "subscription_tier", "is_premium", "enabled", "display_order"
)
SELECT
  'Sociology', '2251', 'o_level', 'O Level', 'Cambridge',
  'Sociology', 'sociology', 'Users', 'hsl(200, 95%, 45%)',
  'Cambridge O Level Sociology (2251)', 'pro', true, true, 160
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."subjects" WHERE "subject_code" = '2251' AND "qualification" = 'o_level'
);

-- Information and Communication Technology (0417) - CLEAN CONTAINER, FREE TIER
INSERT INTO "public"."subjects" (
  "name", "subject_code", "qualification", "qualification_variant", "exam_board",
  "short_name", "slug", "icon", "color", "description", "subscription_tier", "is_premium", "enabled", "display_order"
)
SELECT
  'Information and Communication Technology', '0417', 'o_level', 'O Level', 'Cambridge',
  'ICT', 'ict', 'Laptop', 'hsl(180, 85%, 42%)',
  'Cambridge O Level Information and Communication Technology (0417)', 'free', false, true, 170
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."subjects" WHERE "subject_code" = '0417' AND "qualification" = 'o_level'
);

-- 4. MATHEMATICS METADATA CLEANUP
-- Safely trim whitespace and line breaks from unit titles for subject 22c9be77-9ec7-44d3-9c20-04cad5f895e6
UPDATE "public"."units"
SET "title" = TRIM(REPLACE(REPLACE("title", E'\r', ''), E'\n', ''))
WHERE "subject_id" = '22c9be77-9ec7-44d3-9c20-04cad5f895e6'
  AND ("title" LIKE '%' || E'\r' || '%' OR "title" LIKE '%' || E'\n' || '%' OR "title" LIKE '% ');

-- 5. VERIFICATION NOTICE
-- Physics Unit 0 and Unit 1 are intentionally preserved unchanged for Phase 2B.
-- Zero curriculum rows (units, lessons, videos) were deleted.
