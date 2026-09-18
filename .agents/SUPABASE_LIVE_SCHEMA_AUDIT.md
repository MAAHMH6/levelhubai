# Supabase Live Schema & Data Audit

**Project URL**: `https://yqvqdellxgazgkpzsxpo.supabase.co`
**Audit Timestamp**: 2026-09-18T15:51:01.348Z
**Total Defined Tables**: 60

| Table Name | Status | Live Row Count | Columns Detected |
|---|---|---|---|
| `ai_lesson_practice` | ✅ Accessible | 0 | 0 columns |
| `ai_lesson_quiz` | ✅ Accessible | 0 | 0 columns |
| `ai_notes` | ✅ Accessible | 0 | 0 columns |
| `app_branding` | ✅ Accessible | 1 | 10 columns |
| `app_settings` | ✅ Accessible | 4 | 4 columns |
| `badges` | ✅ Accessible | 23 | 10 columns |
| `billing_audit_logs` | ✅ Accessible | 0 | 0 columns |
| `blog_articles` | ✅ Accessible | 16 | 23 columns |
| `challenges` | ✅ Accessible | 0 | 0 columns |
| `child_linking_codes` | ✅ Accessible | 0 | 0 columns |
| `class_students` | 🔒 RLS Restricted / Empty | 0 | 0 columns |
| `classes` | 🔒 RLS Restricted / Empty | 0 | 0 columns |
| `comeback_bonuses` | ✅ Accessible | 0 | 0 columns |
| `commissions` | 🔒 RLS Restricted / Empty | 0 | 0 columns |
| `countries` | ✅ Accessible | 6 | 10 columns |
| `country_pricing` | ✅ Accessible | 6 | 11 columns |
| `curriculum_chunks` | ✅ Accessible | 0 | 0 columns |
| `curriculum_documents` | ✅ Accessible | 0 | 0 columns |
| `daily_goals` | ✅ Accessible | 0 | 0 columns |
| `daily_quiz_usage` | ✅ Accessible | 0 | 0 columns |
| `exam_blueprints` | ✅ Accessible | 3 | 7 columns |
| `feedback` | ✅ Accessible | 0 | 0 columns |
| `friendships` | ✅ Accessible | 0 | 0 columns |
| `lesson_progress` | ✅ Accessible | 0 | 0 columns |
| `lessons` | ✅ Accessible | 840 | 13 columns |
| `mock_exams` | ✅ Accessible | 0 | 0 columns |
| `notifications` | ✅ Accessible | 0 | 0 columns |
| `parent_children` | ✅ Accessible | 0 | 0 columns |
| `past_paper_attempts` | ✅ Accessible | 0 | 0 columns |
| `past_papers` | ✅ Accessible | 88 | 16 columns |
| `payments` | ✅ Accessible | 0 | 0 columns |
| `pricing_settings` | ✅ Accessible | 5 | 4 columns |
| `profile_private` | ✅ Accessible | 0 | 0 columns |
| `profiles` | ✅ Accessible | 0 | 0 columns |
| `quiz_attempts` | ✅ Accessible | 0 | 0 columns |
| `quiz_questions` | ✅ Accessible | 0 | 0 columns |
| `quiz_sessions` | ✅ Accessible | 0 | 0 columns |
| `referrals` | 🔒 RLS Restricted / Empty | 0 | 0 columns |
| `school_invites` | 🔒 RLS Restricted / Empty | 0 | 0 columns |
| `schools` | 🔒 RLS Restricted / Empty | 0 | 0 columns |
| `social_links` | ✅ Accessible | 10 | 6 columns |
| `student_assessments` | ✅ Accessible | 0 | 0 columns |
| `student_referrals` | 🔒 RLS Restricted / Empty | 0 | 0 columns |
| `student_topic_progress` | ✅ Accessible | 0 | 0 columns |
| `student_vocabulary` | ✅ Accessible | 0 | 0 columns |
| `subject_badges` | ✅ Accessible | 50 | 10 columns |
| `subject_progress` | ✅ Accessible | 0 | 0 columns |
| `subjects` | ✅ Accessible | 30 | 14 columns |
| `subscriptions` | ✅ Accessible | 0 | 0 columns |
| `teacher_profiles` | 🔒 RLS Restricted / Empty | 0 | 0 columns |
| `topics` | ✅ Accessible | 511 | 6 columns |
| `unit_progress` | ✅ Accessible | 0 | 0 columns |
| `units` | ✅ Accessible | 217 | 10 columns |
| `usage_counters` | ✅ Accessible | 0 | 0 columns |
| `user_badges` | ✅ Accessible | 0 | 0 columns |
| `user_roles` | 🔒 RLS Restricted / Empty | 0 | 0 columns |
| `user_subject_badges` | ✅ Accessible | 0 | 0 columns |
| `weak_topics` | ✅ Accessible | 0 | 0 columns |
| `withdrawals` | 🔒 RLS Restricted / Empty | 0 | 0 columns |
| `writing_history` | ✅ Accessible | 0 | 0 columns |

---

## Table Schemas & Samples

### `ai_lesson_practice` (0 rows)
**Columns**: 

### `ai_lesson_quiz` (0 rows)
**Columns**: 

### `ai_notes` (0 rows)
**Columns**: 

### `app_branding` (1 rows)
**Columns**: `id`, `brand_name`, `short_name`, `logo_url`, `favicon_url`, `footer_copyright`, `site_title`, `seo_title`, `seo_description`, `updated_at`

```json
{
  "id": 1,
  "brand_name": "LevelHubAI",
  "short_name": "LevelHubAI",
  "logo_url": "",
  "favicon_url": "",
  "footer_copyright": "© LevelHubAI. All rights reserved.",
  "site_title": "LevelHubAI — O Level & IGCSE AI Learning Platform",
  "seo_title": "LevelHubAI — Cambridge O Level & IGCSE Exam Prep with AI",
  "seo_description": "AI-powered Cambridge O Level & IGCSE exam preparation: notes, quizzes, past papers, and an AI tutor across every core subject.",
  "updated_at": "2026-08-07T16:28:01.749479+00:00"
}
```

### `app_settings` (4 rows)
**Columns**: `key`, `value`, `updated_at`, `updated_by`

```json
{
  "key": "teacher_commission_percent",
  "value": 10,
  "updated_at": "2026-08-01T13:31:21.094876+00:00",
  "updated_by": null
}
```

### `badges` (23 rows)
**Columns**: `id`, `name`, `description`, `icon`, `category`, `requirement_type`, `requirement_value`, `xp_reward`, `rarity`, `created_at`

```json
{
  "id": "acd8ef90-8af3-4875-8dd9-f416e1573bd5",
  "name": "First Flame",
  "description": "Complete your first day streak",
  "icon": "Flame",
  "category": "streak",
  "requirement_type": "streak_days",
  "requirement_value": 1,
  "xp_reward": 25,
  "rarity": "common",
  "created_at": "2026-01-11T20:15:39.179609+00:00"
}
```

### `billing_audit_logs` (0 rows)
**Columns**: 

### `blog_articles` (16 rows)
**Columns**: `id`, `slug`, `title`, `meta_title`, `meta_description`, `excerpt`, `content`, `category`, `read_time`, `featured`, `image`, `keywords`, `published`, `published_at`, `updated_at`, `created_at`, `program`, `subject`, `topic`, `author`, `image_url`, `image_alt`, `featured_on_subject_page`

```json
{
  "id": "651b2516-caec-4199-b353-41c5c0a5fd01",
  "slug": "olevel-mathematics-tips",
  "title": "O-Level Mathematics: Complete Topic Guide & Scoring Tips",
  "meta_title": "O-Level Mathematics Tips | Score A* in Cambridge Math",
  "meta_description": "Master O-Level Mathematics with topic-by-topic study tips, formula sheets, and practice strategies. Ace algebra, geometry, trigonometry and statistics.",
  "excerpt": "Mathematics is one of the most scoring O-Level subjects if you approach it right. This guide covers every major topic with practical tips to boost your math grade.",
  "content": "<p>O-Level <strong>Mathematics</strong> rewards consistent, methodical practice more than any other subject on the syllabus. Because topics build on each other, gaps early in the course tend to resurface repeatedly. Here's a complete topic guide and strategy for scoring higher.</p>\n\n<h2>Why Mathematics Topics Build on Each Other</h2>\n<p><strong>Algebra</strong> underpins later topics like functions and calculus-adjacent content, while basic number skills support everything from ratio to statistics. A weak foundation in early topics doesn't just affect those specific questions — it quietly undermines performance across the whole paper.</p>\n\n<h2>Core Topic Areas to Prioritize</h2>\n<p>Focus revision around these four core areas:</p>\n<ul>\n<li><strong>Number and Algebra</strong> — the foundation for nearly every other topic.</li>\n<li><strong>Geometry and Mensuration</strong> — shapes, area, volume, and angle properties.</li>\n<li><strong>Trigonometry</strong> — sine rule, cosine rule, and right-angle triangle ratios.</li>\n<li><strong>Statistics and Probability</strong> — data interpretation and careful reading of question wording.</li>\n</ul>\n<p>Within each, identify the specific question types that appear repeatedly across past papers, since exam boards tend to reuse structural patterns even as specific numbers change.</p>\n\n<h2>Algebra: The Skill That Appears Everywhere</h2>\n<ul>\n<li><strong>Practice simplifying, factorizing, and solving equations</strong> — until these steps become automatic rather than effortful.</li>\n<li><strong>Work through word problems specifically</strong> — translating language into equations is often the harder skill, not the algebra itself.</li>\n<li><strong>Revisit algebraic manipulation regularly</strong> — it appears embedded within geometry and trigonometry questions too.</li>\n</ul>\n\n<h2>Geometry and Trigonometry: Diagrams Matter</h2>\n<p>Always sketch or annotate diagrams when they aren't fully labeled in the question — this often reveals relationships that aren't obvious from the text alone. For trigonometry, be precise about which rule applies (sine rule, cosine rule, or basic ratios) rather than guessing based on which numbers are given.</p>\n\n<h2>Statistics and Probability: Read Carefully</h2>\n<p>These topics are less about complex calculation and more about careful reading — many marks are lost through misreading what a question is actually asking, such as confusing \"at least\" with \"exactly,\" or misidentifying which data set a question refers to.</p>\n\n<h2>Building Speed and Accuracy Together</h2>\n<ol>\n<li><strong>Build accuracy first</strong> — through untimed topic practice.</li>\n<li><strong>Introduce time pressure gradually</strong> — through full past papers as your confidence grows.</li>\n</ol>\n<p>Timed practice is essential, but accuracy should never be sacrificed purely for speed early in your revision.</p>\n\n<h2>Frequently Asked Questions</h2>\n<p><strong>Which Mathematics topics are worth the most marks overall?</strong> This varies by paper, but algebra, geometry, and trigonometry consistently make up a large share of total marks across most O-Level Mathematics syllabuses.</p>\n<p><strong>Is a calculator allowed for all Mathematics papers?</strong> This depends on your specific paper — many syllabuses include both calculator and non-calculator papers, so check your exact paper requirements in advance.</p>\n<p><strong>How do I stop making careless mistakes under time pressure?</strong> Build in a habit of quickly checking units, signs, and whether your answer makes logical sense before moving to the next question — this catches many careless errors without costing significant time.</p>\n\n<h2>Conclusion</h2>\n<p>Mathematics success comes from strong foundational skills, careful reading, and consistent timed practice. Use LevelHubAI's topic-wise quizzes to strengthen weak areas before moving on to full past paper simulations.</p>",
  "category": "Subject Guide",
  "read_time": "14 min read",
  "featured": false,
  "image": "/og-image.png",
  "keywords": [
    "O Level mathematics",
    "O Level math tips",
    "Cambridge math",
    "O Level algebra",
    "O Level trigonometry"
  ],
  "published": true,
  "published_at": "2026-03-01T00:00:00+00:00",
  "updated_at": "2026-08-10T12:36:39.365+00:00",
  "created_at": "2026-08-07T17:51:43.167926+00:00",
  "program": "O Level",
  "subject": null,
  "topic": null,
  "author": "Admin",
  "image_url": null,
  "image_alt": null,
  "featured_on_subject_page": false
}
```

### `challenges` (0 rows)
**Columns**: 

### `child_linking_codes` (0 rows)
**Columns**: 

### `comeback_bonuses` (0 rows)
**Columns**: 

### `countries` (6 rows)
**Columns**: `code`, `name`, `currency`, `flag_emoji`, `timezone`, `enabled`, `is_default`, `display_order`, `created_at`, `updated_at`

```json
{
  "code": "GB",
  "name": "United Kingdom",
  "currency": "GBP",
  "flag_emoji": "🇬🇧",
  "timezone": "Europe/London",
  "enabled": true,
  "is_default": false,
  "display_order": 3,
  "created_at": "2026-07-15T04:05:12.387056+00:00",
  "updated_at": "2026-07-15T04:05:12.387056+00:00"
}
```

### `country_pricing` (6 rows)
**Columns**: `id`, `country_code`, `plan`, `currency`, `monthly_price`, `yearly_price`, `lifetime_price`, `paddle_price_id`, `enabled`, `created_at`, `updated_at`

```json
{
  "id": "9680cb08-a29f-4860-a53d-66b61a74c9e8",
  "country_code": "GB",
  "plan": "pro",
  "currency": "GBP",
  "monthly_price": 15,
  "yearly_price": 150,
  "lifetime_price": 340,
  "paddle_price_id": null,
  "enabled": true,
  "created_at": "2026-07-15T04:05:12.387056+00:00",
  "updated_at": "2026-07-15T04:05:12.387056+00:00"
}
```

### `curriculum_chunks` (0 rows)
**Columns**: 

### `curriculum_documents` (0 rows)
**Columns**: 

### `daily_goals` (0 rows)
**Columns**: 

### `daily_quiz_usage` (0 rows)
**Columns**: 

### `exam_blueprints` (3 rows)
**Columns**: `id`, `subject_id`, `title`, `source_filename`, `structural_metadata`, `created_at`, `updated_at`

```json
{
  "id": "b8401324-182e-45c4-892c-d527224cfad4",
  "subject_id": "f249052a-6c35-4d36-b9f7-0e1f5bf213a7",
  "title": "ICT Oct to Nov QP",
  "source_filename": "f249052a-6c35-4d36-b9f7-0e1f5bf213a7/1783106003576-0417_w25_qp_12.pdf",
  "structural_metadata": {
    "metadata": {
      "total_marks": 80,
      "time_allowed": "1 hour 30 minutes",
      "total_questions": 14,
      "difficulty_curve": [
        2,
        3,
        4,
        3,
        4,
        2,
        4,
        3,
        2,
        4,
        3,
        4,
        3,
        2
      ],
      "topic_distribution": {
        "Security": 12,
        "Input Devices": 6,
        "Control Systems": 2,
        "Web Development": 5,
        "Memory and Storage": 4,
        "Types of Computers": 2,
        "Input/Output Devices": 4,
        "Emerging Technologies": 6,
        "Networking and Storage": 8,
        "Data Capture and Processing": 12,
        "Data Capture and Online Systems": 10,
        "Emerging Technologies and Control Systems": 7
      }
    },
    "questions": [
      {
        "marks": 2,
        "topic": "Web Development",
        "subtopic": "Web Development Layers",
        "num_parts": 1,
        "has_diagram": false,
        "diagram_type": null,
        "command_words": [
          "circle"
        ],
        "question_number": 1,
        "position_in_paper": 1,
        "estimated_difficulty": 2
      },
      {
        "marks": 4,
        "topic": "Input/Output Devices",
        "subtopic": "ADC and DAC",
        "num_parts": 4,
        "has_diagram": false,
        "diagram_type": null,
        "command_words": [
          "state"
        ],
        "question_number": 2,
        "position_in_paper": 2,
        "estimated_difficulty": 3
      },
      {
        "marks": 6,
        "topic": "Input Devices",
        "subtopic": "Touch Screen vs Keyboard/Mouse",
        "num_parts": 1,
        "has_diagram": false,
        "diagram_type": null,
        "command_words": [
          "discuss"
        ],
        "question_number": 3,
        "position_in_paper": 3,
        "estimated_difficulty": 4
      },
      {
        "marks": 4,
        "topic": "Memory and Storage",
        "subtopic": "Internal Memory vs Backing Storage",
        "num_parts": 1,
        "has_diagram": false,
        "diagram_type": null,
        "command_words": [
          "compare"
        ],
        "question_number": 4,
        "position_in_paper": 4,
        "estimated_difficulty": 3
      },
      {
        "marks": 12,
        "topic": "Data Capture and Processing",
        "subtopic": "Online Data Capture Forms and Robotics",
        "num_parts": 5,
        "has_diagram": false,
        "diagram_type": null,
        "command_words": [
          "state",
          "explain",
          "discuss"
        ],
        "question_number": 5,
        "position_in_paper": 5,
        "estimated_difficulty": 4
      },
      {
        "marks": 2,
        "topic": "Types of Computers",
        "subtopic": "Mobile Computers",
        "num_parts": 1,
        "has_diagram": false,
        "diagram_type": null,
        "command_words": [
          "state"
        ],
        "question_number": 6,
        "position_in_paper": 6,
        "estimated_difficulty": 2
      },
      {
        "marks": 10,
        "topic": "Data Capture and Online Systems",
        "subtopic": "RFID vs Barcode, Online Booking Systems",
        "num_parts": 2,
        "has_diagram": false,
        "diagram_type": null,
        "command_words": [
          "describe"
        ],
        "question_number": 7,
        "position_in_paper": 7,
        "estimated_difficulty": 4
      },
      {
        "marks": 6,
        "topic": "Security",
        "subtopic": "Pharming Attacks",
        "num_parts": 2,
        "has_diagram": false,
        "diagram_type": null,
        "command_words": [
          "describe",
          "state"
        ],
        "question_number": 8,
        "position_in_paper": 8,
        "estimated_difficulty": 3
      },
      {
        "marks": 3,
        "topic": "Web Development",
        "subtopic": "HTML Structure",
        "num_parts": 1,
        "has_diagram": false,
        "diagram_type": null,
        "command_words": [
          "state"
        ],
        "question_number": 9,
        "position_in_paper": 9,
        "estimated_difficulty": 2
      },
      {
        "marks": 8,
        "topic": "Networking and Storage",
        "subtopic": "Magnetic Tape Backups, Bluetooth",
        "num_parts": 2,
        "has_diagram": false,
        "diagram_type": null,
        "command_words": [
          "describe",
          "explain"
        ],
        "question_number": 10,
        "position_in_paper": 10,
        "estimated_difficulty": 4
      },
      {
        "marks": 6,
        "topic": "Security",
        "subtopic": "Encryption",
        "num_parts": 2,
        "has_diagram": false,
        "diagram_type": null,
        "command_words": [
          "describe",
          "state"
        ],
        "question_number": 11,
        "position_in_paper": 11,
        "estimated_difficulty": 3
      },
      {
        "marks": 7,
        "topic": "Emerging Technologies and Control Systems",
        "subtopic": "Smart CCTV, Microprocessor Control",
        "num_parts": 2,
        "has_diagram": false,
        "diagram_type": null,
        "command_words": [
          "describe",
          "identify"
        ],
        "question_number": 12,
        "position_in_paper": 12,
        "estimated_difficulty": 4
      },
      {
        "marks": 6,
        "topic": "Emerging Technologies",
        "subtopic": "3D Printing",
        "num_parts": 2,
        "has_diagram": false,
        "diagram_type": null,
        "command_words": [
          "state"
        ],
        "question_number": 13,
        "position_in_paper": 13,
        "estimated_difficulty": 3
      },
      {
        "marks": 2,
        "topic": "Control Systems",
        "subtopic": "Output Devices",
        "num_parts": 1,
        "has_diagram": false,
        "diagram_type": null,
        "command_words": [
          "identify"
        ],
        "question_number": 14,
        "position_in_paper": 14,
        "estimated_difficulty": 2
      }
    ]
  },
  "created_at": "2026-08-25T23:23:30.393396+00:00",
  "updated_at": "2026-08-25T23:23:30.393396+00:00"
}
```

### `feedback` (0 rows)
**Columns**: 

### `friendships` (0 rows)
**Columns**: 

### `lesson_progress` (0 rows)
**Columns**: 

### `lessons` (840 rows)
**Columns**: `id`, `unit_id`, `lesson_number`, `title`, `video_url`, `video_duration_seconds`, `video_duration_display`, `xp_reward`, `quiz_question_count`, `practice_question_count`, `topic_name`, `description`, `created_at`

```json
{
  "id": "415235aa-34a4-46af-8f4f-5e6f969c4882",
  "unit_id": "ae43ba34-9be9-45db-8ef8-7042ff0fd9ac",
  "lesson_number": 1,
  "title": "Understanding Explicit Meaning",
  "video_url": "https://youtu.be/PL9jH19tS_I",
  "video_duration_seconds": null,
  "video_duration_display": null,
  "xp_reward": 150,
  "quiz_question_count": 15,
  "practice_question_count": 25,
  "topic_name": null,
  "description": null,
  "created_at": "2026-05-11T16:45:54.838845+00:00"
}
```

### `mock_exams` (0 rows)
**Columns**: 

### `notifications` (0 rows)
**Columns**: 

### `parent_children` (0 rows)
**Columns**: 

### `past_paper_attempts` (0 rows)
**Columns**: 

### `past_papers` (88 rows)
**Columns**: `id`, `subject_id`, `exam_board`, `year`, `session`, `paper_number`, `variant`, `pdf_url`, `marking_scheme_url`, `total_marks`, `duration_minutes`, `xp_reward`, `created_at`, `questions_data`, `is_proprietary`, `external_url`

```json
{
  "id": "c1258430-7206-402b-9de0-b6d59ac6fac6",
  "subject_id": "22c9be77-9ec7-44d3-9c20-04cad5f895e6",
  "exam_board": "CAIE",
  "year": 2024,
  "session": "May/June",
  "paper_number": 1,
  "variant": 1,
  "pdf_url": null,
  "marking_scheme_url": null,
  "total_marks": 40,
  "duration_minutes": 60,
  "xp_reward": 250,
  "created_at": "2026-01-16T10:38:49.231897+00:00",
  "questions_data": [],
  "is_proprietary": true,
  "external_url": null
}
```

### `payments` (0 rows)
**Columns**: 

### `pricing_settings` (5 rows)
**Columns**: `key`, `value`, `updated_at`, `updated_by`

```json
{
  "key": "pro_monthly_price_pkr",
  "value": 5000,
  "updated_at": "2026-07-06T09:01:17.582155+00:00",
  "updated_by": null
}
```

### `profile_private` (0 rows)
**Columns**: 

### `profiles` (0 rows)
**Columns**: 

### `quiz_attempts` (0 rows)
**Columns**: 

### `quiz_questions` (0 rows)
**Columns**: 

### `quiz_sessions` (0 rows)
**Columns**: 

### `social_links` (10 rows)
**Columns**: `key`, `label`, `url`, `enabled`, `sort_order`, `updated_at`

```json
{
  "key": "facebook",
  "label": "Facebook",
  "url": "https://www.facebook.com/people/Level-Hub-AI/61575424775768/",
  "enabled": true,
  "sort_order": 1,
  "updated_at": "2026-08-14T10:55:15.557485+00:00"
}
```

### `student_assessments` (0 rows)
**Columns**: 

### `student_topic_progress` (0 rows)
**Columns**: 

### `student_vocabulary` (0 rows)
**Columns**: 

### `subject_badges` (50 rows)
**Columns**: `id`, `subject_id`, `name`, `description`, `icon`, `rarity`, `requirement_type`, `requirement_value`, `xp_reward`, `created_at`

```json
{
  "id": "7616567f-7f5f-48fb-8561-f20a80a88707",
  "subject_id": "22c9be77-9ec7-44d3-9c20-04cad5f895e6",
  "name": "First Mathematics Lesson",
  "description": "Complete your first lesson in Mathematics",
  "icon": "BookOpen",
  "rarity": "common",
  "requirement_type": "lessons_completed",
  "requirement_value": 1,
  "xp_reward": 25,
  "created_at": "2026-02-02T13:21:06.83654+00:00"
}
```

### `subject_progress` (0 rows)
**Columns**: 

### `subjects` (30 rows)
**Columns**: `id`, `name`, `icon`, `color`, `description`, `created_at`, `subject_code`, `subscription_tier`, `is_premium`, `icon_url`, `banner_url`, `qualification`, `enabled`, `display_order`

```json
{
  "id": "00580068-5b7f-4b63-b338-3f44020820ff",
  "name": "Accounting IGCSE",
  "icon": "Receipt",
  "color": "hsl(0, 100%, 50%)",
  "description": null,
  "created_at": "2026-07-13T17:09:25.259235+00:00",
  "subject_code": "IGCSE 0452 ",
  "subscription_tier": "pro",
  "is_premium": true,
  "icon_url": null,
  "banner_url": null,
  "qualification": "igcse",
  "enabled": true,
  "display_order": 0
}
```

### `subscriptions` (0 rows)
**Columns**: 

### `topics` (511 rows)
**Columns**: `id`, `subject_id`, `name`, `order_index`, `created_at`, `lesson_id`

```json
{
  "id": "72c9a56a-2efe-4645-99b2-56edbe018f69",
  "subject_id": "04b0e4e8-5cb2-4692-93e8-9250a3f9f4b3",
  "name": "Measurement & Physical Quantities",
  "order_index": 0,
  "created_at": "2026-08-01T19:15:43.81726+00:00",
  "lesson_id": null
}
```

### `unit_progress` (0 rows)
**Columns**: 

### `units` (217 rows)
**Columns**: `id`, `subject_id`, `unit_number`, `title`, `icon_emoji`, `description`, `duration_weeks`, `total_xp`, `prerequisite_unit_id`, `created_at`

```json
{
  "id": "11111111-0001-0001-0001-000000000005",
  "subject_id": "22c9be77-9ec7-44d3-9c20-04cad5f895e6",
  "unit_number": 5,
  "title": "Functions & Graphs\r\n",
  "icon_emoji": "📊",
  "description": "Explore function notation, graph types, and transformations.",
  "duration_weeks": "3 weeks",
  "total_xp": 3200,
  "prerequisite_unit_id": null,
  "created_at": "2026-01-16T10:02:43.832159+00:00"
}
```

### `usage_counters` (0 rows)
**Columns**: 

### `user_badges` (0 rows)
**Columns**: 

### `user_subject_badges` (0 rows)
**Columns**: 

### `weak_topics` (0 rows)
**Columns**: 

### `writing_history` (0 rows)
**Columns**: 

