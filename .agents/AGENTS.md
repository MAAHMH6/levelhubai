# Agent Instructions: Production Platform

You are acting as a Senior Software Architect, Researcher, and SaaS Serial Entrepreneur. You are operating within a **Production Platform** environment. 

## 🚨 Core Directives

1. **Zero Unrelated Code Changes**: 
   - DO NOT make any changes to the codebase directly without explicit authorization.
   - This is a production system. Never modify or touch code that is unrelated to the specific feature you are actively building.
   - Scope all changes strictly to the feature at hand.
   - **NEVER run a DELETE query against the production database without explicit authorization from the user.**

2. **Use GSD for All Workflows**: 
   - All new features, modifications, and updates MUST be planned and executed using the GSD workflow (e.g., `gsd-mvp-phase`, `gsd-plan-phase`, `gsd-execute-phase`, etc.). 
   - Do not bypass GSD to make manual, ad-hoc edits.

3. **Application Development Best Practices**: 
   - Write clean, maintainable, modular, and well-documented code.
   - Follow SOLID principles, appropriate design patterns, and ensure high testability.
   - Design for scale, performance, and fault tolerance.

4. **Strict Security (OWASP) Compliance**:
   - Validate and sanitize all user inputs to prevent Injection attacks (SQLi, NoSQLi, Command Injection).
   - Defend against Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF).
   - Ensure secure authentication, robust session management, and proper access controls (Principle of Least Privilege).
   - Never hardcode secrets or credentials; always use environment variables or secret managers.
   - Avoid exposing sensitive data in logs or error messages.

---

# LevelHubAI — Full Database & Feature Audit

> **Rules for all agents**: Never add mock/hardcoded data. All numbers shown to students must come from Supabase tables. Empty states must display a helpful prompt, not fake data.

---

## Supabase Project

- **Project ID**: yqvqdellxgazgkpzsxpo
- **URL**: https://yqvqdellxgazgkpzsxpo.supabase.co
- **Access**: Read-only from student/teacher/parent frontend. Admin panel has write access via RLS policies.

---

## Why Lessons Were Not Syncing from Admin

When a student navigates via slug (e.g. /subjects-hub/mathematics) instead of UUID,
the workspace sets subject.id = "mathematics" (a string, not a UUID).
The query units.eq('subject_id', 'mathematics') finds nothing because the DB stores UUIDs.

FIX APPLIED in StudentSubjectWorkspace.tsx:
- Detect non-UUID subject.id using regex
- If slug: resolve canonical UUID from subjects table first
- Then query units and lessons using the UUID

---

## Agent Rules (MUST FOLLOW)

1. NEVER hardcode numbers: quiz counts, percentages, streak days, exam countdowns
   Always read from Supabase or profile context.

2. Empty states over fake data:
   If a user has no quiz history show 0 or a 'Get started' prompt. Never fake it.

3. Admin tables are READ-ONLY from student frontend:
   Never write to subjects, units, lessons, quiz_questions from student pages.

4. Subscription check:
   isPro = true ONLY when:
   - profiles.subscription_plan = 'pro'
   - OR subscriptions.plan = 'pro' (active, not expired)
   - OR localStorage.pro_override = 'true'
   A 'free' row in subscriptions table MUST NOT grant Pro access.

5. Lessons sync fix:
   Always resolve subject.id to a real UUID before querying units/lessons.
   Slug-based routes give string IDs, not UUIDs.

6. Pricing: Pro plan is Rs 5,000/month.
   All upgrade buttons route to /billing.
   'View All Plans' opens https://olevel.com.pk/#pricing in a new tab.

7. Do not touch admin data: Do not modify, delete or restructure any admin
   database tables, components, or data. Admin functionality must remain intact.

---

## Database Table to Feature Mapping

subjects      -> SubjectsManager (admin), SubjectsPage (public), SubjectProgressMap, StudentSubjectsCatalogue
units         -> UnitsManager (admin), StudentSubjectWorkspace units view
lessons       -> LessonsManager (admin), StudentSubjectWorkspace lessons per unit
lessons.video_url -> VideoLinksManager (admin), VideoPlayer in workspace
quiz_questions -> QuizQuestionsManager (admin), TopicQuestions, workspace practice tab
quiz_attempts  -> Progress page accuracy, Workspace stats, Gamification badges
mock_exam_attempts -> MockExams page, Workspace exam count
lesson_progress -> Progress page lesson count
student_assessments -> Spider Web Radar Chart
study_plans   -> Planner page, Today's Mission on Home
profiles      -> useStudentProgramme, header stats, leaderboard, XP/streak/level/coins
subscriptions -> useSubscription hook (plan must be 'pro'/'school' to grant access)
payments      -> StudentBillingPage payment history
notifications -> NotificationBell component
ai_tutor_messages -> AI Tutor chat history
writing_submissions -> Writing Checker history

---

## Mock Data Removed (History)

StudentHome.tsx - "68 Days" hardcoded -> now computed from profile.examYear + examSession
StudentHome.tsx - fake default study tasks -> empty state with Plan with AI button
StudentHome.tsx & Dashboard.tsx - "Resume [subject]" button -> replaced with "Go to Subjects" -> /subjects-hub
StudentGamificationPage.tsx - hardcoded badge array -> derived from real profile stats
StudentSubjectWorkspace.tsx - stats (5, 2, 78, 82) -> fetched from quiz_attempts/mock_exam_attempts
StudentAccountPage.tsx - "Pro Plan" badge for all users -> reads useSubscription().isPro
Leaderboard - fake users (Zayd K etc) -> real profiles ordered by xp_points
StudentProgrammeContext.tsx - DEFAULT_PROFILE reset to 0 streak, 0 XP, level 1, 0 coins
StudentProgrammeContext.tsx - Deterministic hash formulas removed; real progress synced from lesson_progress and quiz_attempts (0% for new users)
SubjectProgressMap.tsx - Progress and attempts queried from real quiz_attempts and lesson_progress (0 for new users)
StudentProgressPage.tsx - Empty state placeholders added for uncompleted cognitive radar and strengths/weaknesses
StudentSubjectInterestModal.tsx - First-time student modal asks for interest subjects, highlights free subjects, and provides instant free resume
App.tsx - FloatingWhatsAppButton mounted globally across the entire website at all times
Dashboard.tsx - Added missing useAuth + supabase imports (user was undefined, causing silent stat load failure)
Dashboard.tsx - Real academic stats bar (Quizzes Done, Quiz Accuracy %, Lessons Done, Mock Exams) shown after hero banner - hidden for brand-new users with zero activity
StudentHome.tsx - Same real stats bar added after hero banner with same zero-activity guard
StudentHome.tsx - Added useAuth + supabase imports for real stats loading
WeeklyReportContent.tsx - Fetches real quiz_attempts + quiz_sessions + student_assessments per student ID (supports parent childId override)
StudentProgressPage.tsx - Spider web radar shows 0 values and empty state CTA when no student_assessments row exists

---

## Feature DB Audit (which DB each feature reads from)

| Feature | DB Table(s) | Status |
|---|---|---|
| Home Dashboard stats bar | quiz_attempts, quiz_sessions, lesson_progress, mock_exam_attempts, profiles | Real Supabase |
| Student Progress/Performance page | quiz_attempts, lesson_progress, mock_exam_attempts, student_assessments | Real Supabase |
| Spider Web Radar Chart | student_assessments | Real Supabase - empty state if no row |
| Study Planner / Daily Missions | study_plans (Supabase via featureClient) | Real Supabase |
| AI Tutor Chat | Local synthetic AI (no DB write) | Could sync to ai_tutor_messages |
| Weekly Report PDF | quiz_attempts, quiz_sessions, student_assessments, profiles | Real Supabase |
| Mock Exams | mock_exams, mock_exam_attempts, exam_blueprints | Real Supabase |
| Smart Quizzes | quiz_questions, quiz_attempts, quiz_sessions | Real Supabase |
| Subject Workspace | units, lessons, lesson_progress, quiz_questions, quiz_attempts | Real Supabase |
| Gamification badges | profiles (xp_points, streak_days, level) | Real Supabase |
| Leaderboard | profiles (xp_points, streak_days) | Real Supabase |
| Writing Checker | writing_submissions | Real Supabase |
| Subscription/Billing | subscriptions, payments, profiles.subscription_plan | Real Supabase |
