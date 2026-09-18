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

async function deepAudit() {
  console.log('Connecting to Main Supabase DB:', env.VITE_SUPABASE_URL);

  // 1. Fetch all subjects
  const { data: subjects, error: sErr } = await supabase
    .from('subjects')
    .select('*')
    .order('name');

  if (sErr) {
    console.error('Error fetching subjects:', sErr);
    return;
  }

  console.log(`Total subjects found: ${subjects.length}\n`);

  const results = [];

  for (const s of subjects) {
    // Units
    const { data: units } = await supabase
      .from('units')
      .select('id, unit_number, title')
      .eq('subject_id', s.id);
    const unitCount = units ? units.length : 0;
    const unitIds = (units || []).map(u => u.id);

    // Lessons and Videos
    let lessonCount = 0;
    let videoCount = 0;
    if (unitIds.length > 0) {
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id, video_url')
        .in('unit_id', unitIds);
      if (lessons) {
        lessonCount = lessons.length;
        videoCount = lessons.filter(l => l.video_url && l.video_url.trim().length > 0).length;
      }
    }

    // Topics
    const { count: topicCount } = await supabase
      .from('topics')
      .select('*', { count: 'exact', head: true })
      .eq('subject_id', s.id);

    // Past Papers
    const { count: pastPaperCount } = await supabase
      .from('past_papers')
      .select('*', { count: 'exact', head: true })
      .eq('subject_id', s.id);

    // Exam Blueprints
    const { count: blueprintCount } = await supabase
      .from('exam_blueprints')
      .select('*', { count: 'exact', head: true })
      .eq('subject_id', s.id);

    // Mock Exams
    const { count: mockExamCount } = await supabase
      .from('mock_exams')
      .select('*', { count: 'exact', head: true })
      .eq('subject_id', s.id);

    // Quiz Questions (directly with subject_id)
    const { count: questionCount } = await supabase
      .from('quiz_questions')
      .select('*', { count: 'exact', head: true })
      .eq('subject_id', s.id);

    // Curriculum Documents
    const { count: docCount } = await supabase
      .from('curriculum_documents')
      .select('*', { count: 'exact', head: true })
      .eq('subject_id', s.id);

    // Curriculum Chunks
    const { count: chunkCount } = await supabase
      .from('curriculum_chunks')
      .select('*', { count: 'exact', head: true })
      .eq('subject_id', s.id);

    // Quiz Sessions
    const { count: sessionCount } = await supabase
      .from('quiz_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('subject_id', s.id);

    // Subject Progress
    const { count: subProgressCount } = await supabase
      .from('subject_progress')
      .select('*', { count: 'exact', head: true })
      .eq('subject_id', s.id);

    results.push({
      id: s.id,
      name: s.name,
      subject_code: s.subject_code,
      qualification: s.qualification,
      subscription_tier: s.subscription_tier,
      is_premium: s.is_premium,
      enabled: s.enabled,
      display_order: s.display_order,
      icon: s.icon,
      color: s.color,
      description: s.description,
      counts: {
        units: unitCount,
        lessons: lessonCount,
        videos: videoCount,
        topics: topicCount || 0,
        past_papers: pastPaperCount || 0,
        exam_blueprints: blueprintCount || 0,
        mock_exams: mockExamCount || 0,
        quiz_questions: questionCount || 0,
        curriculum_documents: docCount || 0,
        curriculum_chunks: chunkCount || 0,
        quiz_sessions: sessionCount || 0,
        subject_progress: subProgressCount || 0
      },
      sampleUnits: (units || []).slice(0, 3).map(u => `U${u.unit_number}: ${u.title}`)
    });
  }

  fs.writeFileSync('audit_deep_subjects_output.json', JSON.stringify(results, null, 2), 'utf8');
  console.log('Saved results to audit_deep_subjects_output.json');
}

deepAudit().catch(console.error);
