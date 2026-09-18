import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function run() {
  const { data: lessons, error } = await supabase
    .from('lessons')
    .select('id, title, order_index, unit_id')
    .eq('unit_id', '01a6585c-0856-4409-944d-486843c5a363')
    .order('order_index');
  console.log('Error:', error);
  console.log('ICT Unit 1 Lessons:', lessons);
}
run();
