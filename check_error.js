import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://yqvqdellxgazgkpzsxpo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxdnFkZWxseGdhemdrcHpzeHBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1MTk3OTcsImV4cCI6MjA4MzA5NTc5N30.c8N_37h5M6ao-NLKKMSZn3AbOI2O7_R1kO4tJ4cnT-Y'
)

async function run() {
  const { data, error } = await supabase
    .from('curriculum_documents')
    .select('id, title, index_status, index_error')
    .order('created_at', { ascending: false })
    .limit(5)
  console.log("Documents:", JSON.stringify(data, null, 2))
}

run()
