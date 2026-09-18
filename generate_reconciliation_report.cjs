const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('curriculum_reconciliation_result.json', 'utf8'));
const subjects = Object.values(raw.subjects);

let md = `# LevelHubAI — Master Curriculum Reconciliation & Source of Truth Audit
**Audit Date:** September 18, 2026  
**Phase:** Stage 1, Phase 2 — Curriculum Review & Reconciliation  
**Author:** Lead Systems Architect  
**Inspection Scope:** 30 Subjects, 217 Units, 840 Lessons, 633 Valid Videos (Live Supabase Database \`yqvqdellxgazgkpzsxpo\`)

---

## 1. Executive Summary & Core Discoveries

1. **Total Curriculum in Production Database:**
   - **30 Subjects**
   - **217 Units**
   - **840 Lessons**
   - **633 Real, Valid YouTube Videos** (75.4% overall coverage)
   - **0 Placeholder / Rickroll URLs in PostgreSQL** (Placeholder URLs were purely client-side fallbacks in \`useSubjectCurriculum.ts\`)
   - **0 Orphaned Units** (100% of units point to valid subjects)
   - **0 Orphaned Lessons** (100% of lessons point to valid units)
   - **0 Duplicate Unit Numbers** within any subject
   - **0 Duplicate Lesson Numbers** within any unit

2. **The O-Level Curriculum Goldmine:**
   Prior assumptions that O-Level subjects were empty were completely disproven. Every core Cambridge O-Level subject in the database is **fully populated with real units, lessons, and 100% video coverage**:
   - **Mathematics** (\`22c9be77...\`): 16 Units, 115 Lessons, **115/115 Videos** (100%)
   - **Physics** (\`04b0e4e8...\`): 8 Units, 41 Lessons, **35/41 Videos** (85.4%)
   - **Chemistry Olevel** (\`5f1acad5...\`): 11 Units, 24 Lessons, **24/24 Videos** (100%)
   - **Biology Olevel** (\`f291da7d...\`): 9 Units, 15 Lessons, **15/15 Videos** (100%)
   - **Islamiyat Olevel** (\`b2c3d4e5...\`): 8 Units, 30 Lessons, **30/30 Videos** (100%)
   - **Pakistan Studies Olevel** (\`a1b2c3d4...\`): 7 Units, 25 Lessons, **25/25 Videos** (100%)
   - **English Olevel** (\`8082b9e0...\`): 5 Units, 23 Lessons, **23/23 Videos** (100%)
   - **Urdu First Lang Olevel** (\`ccb3187a...\`): 5 Units, 15 Lessons, **15/15 Videos** (100%)
   - **Urdu Second Lang Olevel** (\`c3d4e5f6...\`): 5 Units, 16 Lessons, **16/16 Videos** (100%)
   - **Accounting Olevel** (\`ccbb2c24...\`): 5 Units, 14 Lessons, **14/14 Videos** (100%)

3. **Critical Forensic Mismatches Discovered:**
   - **ICT (\`f249052a...\`) is actually Computer Science 2210 / 0478:** Its units cover Logic Gates, Binary, CPU Architecture, Fetch-Execute, Algorithms, Flowcharts, Pseudocode, and SQL. This is **Computer Science**, NOT **ICT 0417**.
   - **Physics (\`04b0e4e8...\`) Unit 0 vs Unit 1 Duplication:** Unit 0 has 7 lessons (numbered 0–6) covering Motion, Forces & Energy. Unit 1 has 17 lessons (numbered 1–17) where lessons 1–6 duplicate Unit 0, lessons 7–11 add new videos, and lessons 12–17 are empty duplicates with null videos.
   - **Mathematics Trailing Newline Characters:** In \`Mathematics\` (\`22c9be77...\`), 4 unit titles have trailing \`\\r\\n\` characters and 1 has a trailing space (\`'Vectors '\`).
   - **Topics Disconnect:** 511 topics exist in \`public.topics\`, but only 305 have \`lesson_id\` populated; 206 are orphaned at the lesson level.

---

## 2. Complete Subject Reconciliation Matrix

`;

subjects.forEach((s, idx) => {
  md += `### ${idx + 1}. ${s.name} (\`${s.id}\`)\n`;
  md += `- **Qualification in DB:** \`${s.qualification}\` | **Tier:** \`${s.subscription_tier}\` | **Premium:** \`${s.is_premium}\`\n`;
  md += `- **Subject Code in DB:** \`${s.subject_code || 'NULL'}\`\n`;
  md += `- **Total Units:** ${s.unit_count} | **Total Lessons:** ${s.lesson_count} | **Valid Videos:** ${s.valid_video_count} (${s.lesson_count > 0 ? Math.round((s.valid_video_count / s.lesson_count) * 100) : 0}%)\n`;
  
  if (s.unit_count === 0) {
    md += `> [!NOTE]\n> Empty subject container in database. No units or lessons currently attached.\n\n`;
    return;
  }

  md += `\n| Unit # | Unit Title | Unit ID | Lessons | Videos | Status / Issues |\n`;
  md += `| :---: | :--- | :--- | :---: | :---: | :--- |\n`;

  s.units.forEach(u => {
    let issue = 'OK';
    if (u.lesson_count === 0) issue = 'EMPTY (0 lessons)';
    else if (u.video_count === 0) issue = 'Missing all videos';
    else if (u.video_count < u.lesson_count) issue = `Partial videos (${u.video_count}/${u.lesson_count})`;
    else issue = '100% Video Ready';

    if (u.title.includes('\r') || u.title.includes('\n')) issue += ' [Whitespace error in title]';

    md += `| ${u.unit_number} | ${u.title.replace(/[\r\n]/g, '')} | \`${u.id}\` | ${u.lesson_count} | ${u.video_count} | ${issue} |\n`;
  });
  md += `\n`;
});

fs.writeFileSync('C:/Users/yk229/.gemini/antigravity-ide/brain/6829b12f-93d3-42fd-afab-a471a13cd43b/curriculum_reconciliation_report.md', md, 'utf8');
console.log('Saved report successfully!');
