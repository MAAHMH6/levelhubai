import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://yqvqdellxgazgkpzsxpo.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxdnFkZWxseGdhemdrcHpzeHBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1MTk3OTcsImV4cCI6MjA4MzA5NTc5N30.c8N_37h5M6ao-NLKKMSZn3AbOI2O7_R1kO4tJ4cnT-Y";
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from("blog_articles")
    .select("slug, updated_at, published_at, program")
    .eq("published", true)
    .order("published_at", { ascending: false });

  console.log("Data:", data);
  console.log("Error:", error);
}

run();
