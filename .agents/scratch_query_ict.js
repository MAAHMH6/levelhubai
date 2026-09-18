import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function run() {
  const { data: subjects, error: sErr } = await supabase.from('subjects').select('*');
  if (sErr) {
    console.error('Subjects error:', sErr);
    return;
  }
  const ictList = subjects.filter(s => s.name.toLowerCase().includes('ict') || s.slug?.includes('ict') || s.name.toLowerCase().includes('computer'));
  for (const ict of ictList) {
    console.log(`=== SUBJECT: ${ict.name} (${ict.id}) ===`);
    const { data: units } = await supabase.from('units').select('*').eq('subject_id', ict.id).order('unit_number');
    for (const u of units || []) {
      console.log(`  Unit ${u.unit_number}: ${u.title} (${u.id})`);
      const { data: lessons } = await supabase.from('lessons').select('*').eq('unit_id', u.id).order('order_index');
      for (const l of lessons || []) {
        console.log(`    Lesson [${l.order_index}]: "${l.title}" (${l.id})`);
      }
    }
  }
}
run();
