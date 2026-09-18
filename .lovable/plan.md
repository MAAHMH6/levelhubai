
# Level Hub AI — Platform Upgrade Plan

This is a large multi-system change. I'll ship it in reviewable waves so we can validate each before moving on. Each wave lands as one or a few coordinated changes with a DB migration + code updates.

## Wave 1 — Rebrand + IGCSE wording + SEO (text only, no schema)
- Global rename **Level Hub → Level Hub AI**: `index.html` (title, meta desc, OG, twitter, JSON-LD), `Navbar`, `Footer`, `Hero`, landing sections, auth pages, `PremiumModal`, emails (`send-billing-email`, `send-bulk-notification-email`, `school-contact`), notifications copy, `README.md`, `public/llms.txt`, `public/robots.txt` sitemap directive, `sitemap.xml`.
- Replace "O Level"–only phrasing with **"O Level & IGCSE"** across landing (Hero, Subjects, Features, Pricing), dashboard headers, blog list, meta descriptions. Keep single mentions of "Cambridge O Level" where accurate.
- SEO: target keywords (IGCSE, Cambridge IGCSE, O Level, IGCSE Notes/Quizzes/Past Papers, AI Learning Platform, Cambridge Exam Preparation) in title + meta + OG + JSON-LD `Organization`/`WebSite`. Update per-route Helmet on blog + subject pages. Update `sitemap.xml` base URL and canonical.

## Wave 2 — Premium access control (fix the leak)
- Client: create `<RequirePlan subject="…">` wrapper. Wrap `Lesson`, `UnitDetail`, `SubjectOverview`, `Quiz`, `TopicQuestions`, `PastPapers`, AI tutor pages. If subject slug not in free list and `plan !== 'pro'|'school'` → render subscription-required screen with pricing CTA; guests get login prompt.
- Server: add `SECURITY DEFINER` function `public.user_can_access_subject(_user uuid, _subject_slug text)` checking `get_user_plan` + `subjects.is_premium`. RLS on `lessons`, `lesson_progress`, `quiz_sessions`, `ai_notes`, `ai_lesson_practice`, `ai_lesson_quiz` filtered through it. Edge functions (`ai-tutor`, `generate-quiz`, `generate-notes`, `generate-practice`, `rag-quiz`) call this before serving.
- Add `subjects.is_premium boolean default true` + backfill `ict`, `mathematics`, `physics` to `false`.

## Wave 3 — Admin: Brand Settings + Social Links + Subject Management
- New table `app_branding` (single row): brand_name, short_name, logo_url, favicon_url, footer_copyright, site_title, seo_title, seo_description.
- New table `social_links` (key, url, enabled, sort_order) with fixed keys facebook/instagram/linkedin/youtube/tiktok/x/whatsapp/discord/email/website.
- Add columns to `subjects`: `icon_url`, `banner_url`, `color`, `description`, `subject_code`, `qualification` (`o_level`|`igcse`|`both`), `is_premium`, `enabled`, `display_order`.
- Admin UI:
  - `BrandSettingsManager` (Settings tab): edit brand fields, upload logo/favicon to new `brand-assets` storage bucket.
  - `SocialLinksManager`: table CRUD.
  - Extend `SubjectsManager`: icon/banner upload, color picker, qualification select, free/premium toggle, enable/disable, drag-to-reorder.
- Frontend consumers: `Navbar`/`Footer`/`Hero`/`index.html` read from `useBranding()` hook (falls back to hardcoded defaults for SSR/crawlers). `<Footer>` reads socials from `useSocialLinks()`.

## Wave 4 — Multi-country + multi-currency pricing
- New table `countries` (code ISO2, name, currency, flag_emoji, timezone, enabled, is_default, display_order).
- New table `country_pricing` (country_code, plan, currency, monthly_price, yearly_price, lifetime_price, enabled).
- Extend `profiles.country_code text default 'PK'`.
- Admin `CountriesManager`: full CRUD, set default, per-country pricing editor.
- Signup + Profile: country dropdown.
- `Pricing.tsx` reads `useCountryPricing(country)`, currency selector in header, format via `Intl.NumberFormat`. Persist selection in `profiles.country_code` for logged-in users, `localStorage` otherwise.
- `paddle-checkout` accepts `currency`, passes to Paddle price mapping (per-country `paddle_price_id` in `country_pricing`).

## Wave 5 — Curriculum indexing v2 + AI quiz auto-generation
- Extend `curriculum_documents` with `structured_index jsonb` capturing: qualification, subject_code, overview, learning_objectives[], assessment_objectives[], syllabus_aims[], units[{title, topics[{title, subtopics[], key_concepts[], learning_outcomes[], skills[], practical_components[], definitions{}, exam_focus[], command_words[]}]}], glossary{}, recommended_sequence[].
- Rewrite `index-curriculum-doc` to (a) chunk + embed as today, (b) additionally call `openai/gpt-5.5` with structured output (Zod schema above) to produce `structured_index`, save to row.
- New edge fn `generate-curriculum-quizzes`: for each unit/topic/lesson/objective, generate MCQ/TF/FiTB/Match/Short/Scenario with correct answer, explanation, difficulty, Bloom level, links. Store in `quiz_questions` tagged `source='curriculum_index'` + `learning_objective`, `bloom_level`, `question_type`.
- Uploaded knowledge file (`Olevel_Physics_Knowledge_Base_File.pdf`) — I'll parse and pre-seed the Physics `structured_index` so quiz gen has grounded content on day 1.
- Past-papers indexing pipeline is left untouched.

## Technical details

**Schema summary (new tables)**
```
app_branding          singleton row keyed on id=1
social_links          key text pk, url, enabled, sort_order
countries             code text pk, name, currency, flag, timezone, enabled, is_default
country_pricing       (country_code, plan) pk, currency, monthly/yearly/lifetime, paddle_price_id
```

**Subjects additions**
```
alter table subjects add column icon_url text, banner_url text, color text,
  description text, subject_code text, qualification text default 'o_level',
  is_premium boolean default true, enabled boolean default true,
  display_order int default 0;
update subjects set is_premium=false where slug in ('ict','mathematics','physics');
```

**Access control function**
```
create function public.user_can_access_subject(_user uuid, _slug text)
returns boolean language sql stable security definer set search_path=public as $$
  select case
    when exists(select 1 from subjects where slug=_slug and is_premium=false) then true
    when _user is null then false
    else public.get_user_plan(_user) in ('pro','school')
  end
$$;
```

**Grants** applied on every new public-schema table per platform rules.

## What I'll deliver in this pass

Given the size, I'll land **Wave 1 + Wave 2 + Wave 3 schema/admin** in this pass. Waves 4 and 5 will follow immediately after in the next turn once you confirm Wave 1–3 looks right, because they each need their own migration + UI review cycle. Trying to jam all five into one edit batch would produce a huge un-reviewable diff and risk breaking existing student flows.

Approve to proceed and I'll start with the migration for Waves 2–3, then the code edits.
