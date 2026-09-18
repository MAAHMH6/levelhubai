import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://yqvqdellxgazgkpzsxpo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxdnFkZWxseGdhemdrcHpzeHBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1MTk3OTcsImV4cCI6MjA4MzA5NTc5N30.c8N_37h5M6ao-NLKKMSZn3AbOI2O7_R1kO4tJ4cnT-Y";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log("Fetching a referral...");
  const { data: referrals, error: fetchError } = await supabase
    .from('student_referrals')
    .select('*')
    .limit(1);
    
  if (fetchError || !referrals || referrals.length === 0) {
    console.error("Error or no referrals found:", fetchError || "No data");
    return;
  }
  
  const targetId = referrals[0].id;
  console.log(`Setting referral ${targetId} to pending_approval...`);
  
  const { error: updateError } = await supabase
    .from('student_referrals')
    .update({ reward_status: 'pending_approval' })
    .eq('id', targetId);
    
  if (updateError) {
    console.error("Update failed:", updateError);
  } else {
    console.log("Success! You can now check your UI.");
  }
}

run();
