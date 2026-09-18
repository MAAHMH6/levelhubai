const fs = require('fs');
const { createClient } = require('./node_modules/@supabase/supabase-js');

// Parse .env
const content = fs.readFileSync('.env', 'utf8');
const env = {};
content.split(/\r?\n/).forEach(line => {
  const clean = line.trim();
  if (clean && !clean.startsWith('#')) {
    const idx = clean.indexOf('=');
    if (idx > 0) {
      const k = clean.slice(0, idx).trim();
      let v = clean.slice(idx + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      env[k] = v;
    }
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);

function checkVideoStatus(url) {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return { status: 'MISSING', videoId: null };
  }
  const cleanUrl = url.trim();
  if (cleanUrl.includes('dQw4w9WgXcQ')) {
    return { status: 'PLACEHOLDER_RICKROLL', videoId: 'dQw4w9WgXcQ' };
  }
  // Extract YouTube ID
  const ytRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = cleanUrl.match(ytRegex);
  if (match) {
    return { status: 'VALID_YOUTUBE', videoId: match[1] };
  }
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return { status: 'NON_YOUTUBE_URL', url: cleanUrl };
  }
  return { status: 'INVALID_FORMAT', url: cleanUrl };
}

async function reconcile() {
  console.log('Connecting to Supabase at:', env.VITE_SUPABASE_URL);

  // 1. All subjects
  const { data: subjects, error: sErr } = await supabase
    .from('subjects')
    .select('id, name, subject_code, qualification, is_premium, subscription_tier, display_order, enabled, icon, color, description')
    .order('name');

  if (sErr) throw sErr;
  console.log(`Fetched ${subjects.length} subjects.`);

  // 2. All units
  const { data: allUnits, error: uErr } = await supabase
    .from('units')
    .select('id, subject_id, unit_number, title, icon_emoji, description, duration_weeks, total_xp, prerequisite_unit_id')
    .order('unit_number');

  if (uErr) throw uErr;
  console.log(`Fetched ${allUnits.length} units.`);

  // 3. All lessons
  const { data: allLessons, error: lErr } = await supabase
    .from('lessons')
    .select('id, unit_id, lesson_number, title, topic_name, video_url, video_duration_seconds, video_duration_display, xp_reward, quiz_question_count, practice_question_count, description')
    .order('lesson_number');

  if (lErr) throw lErr;
  console.log(`Fetched ${allLessons.length} lessons.`);

  // 4. Map and Analyze
  const subjectsMap = {};
  const orphanedUnits = [];
  const orphanedLessons = [];
  const subjectIds = new Set(subjects.map(s => s.id));
  const unitIds = new Set(allUnits.map(u => u.id));

  // Check unit orphans
  for (const u of allUnits) {
    if (!subjectIds.has(u.subject_id)) {
      orphanedUnits.push(u);
    }
  }

  // Check lesson orphans
  for (const l of allLessons) {
    if (!unitIds.has(l.unit_id)) {
      orphanedLessons.push(l);
    }
  }

  // Build hierarchy
  for (const s of subjects) {
    const sUnits = allUnits.filter(u => u.subject_id === s.id).sort((a, b) => a.unit_number - b.unit_number);

    // Check duplicate unit numbers
    const unitNumbers = sUnits.map(u => u.unit_number);
    const dupUnitNumbers = unitNumbers.filter((item, index) => unitNumbers.indexOf(item) !== index);

    let totalLessonsForSubject = 0;
    let totalVideosForSubject = 0;
    let placeholderVideosCount = 0;

    const unitsReport = sUnits.map(u => {
      const uLessons = allLessons.filter(l => l.unit_id === u.id).sort((a, b) => a.lesson_number - b.lesson_number);
      totalLessonsForSubject += uLessons.length;

      // Check duplicate lesson numbers
      const lessonNumbers = uLessons.map(l => l.lesson_number);
      const dupLessonNumbers = lessonNumbers.filter((item, index) => lessonNumbers.indexOf(item) !== index);

      const lessonsReport = uLessons.map(l => {
        const vCheck = checkVideoStatus(l.video_url);
        if (vCheck.status === 'VALID_YOUTUBE') totalVideosForSubject++;
        if (vCheck.status === 'PLACEHOLDER_RICKROLL') placeholderVideosCount++;

        return {
          id: l.id,
          lesson_number: l.lesson_number,
          title: l.title,
          topic_name: l.topic_name,
          video_url: l.video_url,
          video_status: vCheck.status,
          video_id: vCheck.videoId || null,
          xp_reward: l.xp_reward
        };
      });

      return {
        id: u.id,
        unit_number: u.unit_number,
        title: u.title,
        lesson_count: uLessons.length,
        video_count: lessonsReport.filter(l => l.video_status === 'VALID_YOUTUBE').length,
        duplicate_lesson_numbers: dupLessonNumbers,
        lessons: lessonsReport
      };
    });

    subjectsMap[s.id] = {
      id: s.id,
      name: s.name,
      subject_code: s.subject_code,
      qualification: s.qualification,
      is_premium: s.is_premium,
      subscription_tier: s.subscription_tier,
      unit_count: sUnits.length,
      lesson_count: totalLessonsForSubject,
      valid_video_count: totalVideosForSubject,
      placeholder_video_count: placeholderVideosCount,
      duplicate_unit_numbers: dupUnitNumbers,
      units: unitsReport
    };
  }

  const output = {
    summary: {
      total_subjects: subjects.length,
      total_units: allUnits.length,
      total_lessons: allLessons.length,
      orphaned_units_count: orphanedUnits.length,
      orphaned_lessons_count: orphanedLessons.length
    },
    orphaned_units: orphanedUnits,
    orphaned_lessons: orphanedLessons,
    subjects: subjectsMap
  };

  fs.writeFileSync('curriculum_reconciliation_result.json', JSON.stringify(output, null, 2), 'utf8');
  console.log('Saved reconciliation to curriculum_reconciliation_result.json successfully!');
}

reconcile().catch(console.error);
