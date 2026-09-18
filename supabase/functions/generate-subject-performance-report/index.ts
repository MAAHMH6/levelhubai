import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function llmJson(system: string, user: string): Promise<any> {
  const url = "https://openrouter.ai/api/v1/chat/completions";
  const model = "google/gemini-2.5-flash";
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    }),
  });
  if (!res.ok) throw new Error(`llm ${res.status}: ${await res.text()}`);
  const j = await res.json();
  let content = j.choices?.[0]?.message?.content || "{}";
  const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) content = match[1];
  return JSON.parse(content);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing auth header");

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) throw new Error("Unauthorized");

    const body = await req.json();
    const { subject_id, target_audience = "student", student_id: requested_student_id } = body;

    if (!subject_id) throw new Error("Missing subject_id");

    // If parent is calling, they will pass requested_student_id. Verify they are actually the parent (or just use service key).
    const targetUserId = requested_student_id || user.id;

    // Fetch Subject Name
    const { data: subjectData } = await supabase.from('subjects').select('name').eq('id', subject_id).single();
    const subjectName = subjectData?.name || 'Unknown Subject';

    // 1. Cognitive Baselines
    const { data: assessment } = await supabase.from("student_assessments").select("*").eq("user_id", targetUserId).maybeSingle();

    // 2. Quiz Sessions (Mastery & Time Management)
    const { data: quizzes } = await supabase
      .from("quiz_sessions")
      .select("score, total, percentage, status, created_at, quiz_type, time_limit_seconds, question_count, topic_ids, unit_id")
      .eq("user_id", targetUserId)
      .eq("subject_id", subject_id)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(20); // Get last 20

    // 3. Syllabus Coverage
    const { data: topicProgress } = await supabase
      .from("student_topic_progress")
      .select("topic_id, is_completed, topics!inner(subject_id)")
      .eq("student_id", targetUserId)
      .eq("topics.subject_id", subject_id)
      .eq("is_completed", true);

    // 4. Lesson Engagement
    const { data: lessonProgress } = await supabase
      .from("lesson_progress")
      .select("lesson_completed, notes_generated, lessons!inner(subject_id)")
      .eq("user_id", targetUserId)
      .eq("lessons.subject_id", subject_id);

    // 5. Study Consistency (Profile Last Active)
    const { data: profile } = await supabase.from("profiles").select("last_active_at, created_at").eq("id", targetUserId).single();

    const systemPrompt = `You are a professional educational data analyst for LevelHubAI, an O-Level exam prep platform.
You are generating a highly personalized "Subject-Specific Progress Report" for ${subjectName}.
The target audience reading this report is a: ${target_audience.toUpperCase()}.
If the audience is "STUDENT", speak directly to them (e.g. "You have shown...").
If the audience is "PARENT", speak about the student in the third person (e.g. "Alex has shown...").

You must synthesize 5 holistic data points into a clear picture of their academic trajectory:
1. Academic Mastery (Quiz scores, mock exams)
2. Syllabus Coverage (Topics completed)
3. Lesson Engagement (Are they reading theory?)
4. Time Management (Are they rushing quizzes?)
5. Cognitive Baseline (To explain behavioral traits)

You must return a JSON object exactly matching this schema:
{
  "summary": "A 2-3 paragraph summary synthesizing their mastery, coverage, pacing, and engagement. Tailor tone to the ${target_audience}.",
  "predicted_grade": "A predicted Cambridge O-Level grade based on their data (A*, A, B, C, D, E, U) or 'Insufficient Data'.",
  "strengths": ["Strength 1 (e.g. Consistently strong in Multiple Choice)", "Strength 2"],
  "weaknesses": ["Weakness 1 (e.g. Rushing through timed mocks)", "Weakness 2"],
  "recommended_actions": ["Action 1 (e.g. Read the lesson for Unit 2)", "Action 2"]
}

IMPORTANT RULES:
- If data is sparse, state that more practice is needed to form a confident prediction.
- Return raw JSON only. Do not wrap in markdown or backticks.`;

    const userPrompt = `Student Data Profile:
- Target Subject: ${subjectName}
- Target Audience: ${target_audience}

1. Cognitive Baseline:
- Logical: ${assessment?.logical_score || 'N/A'}, Verbal: ${assessment?.verbal_score || 'N/A'}, Quantitative: ${assessment?.quantitative_score || 'N/A'}

2. Mastery (Recent Quizzes):
Total Quizzes Taken: ${quizzes?.length || 0}
${JSON.stringify(quizzes?.slice(0, 5) || [])} // (Showing up to 5 most recent for context)

3. Syllabus Coverage:
Total Topics Marked Completed: ${topicProgress?.length || 0}

4. Lesson Engagement:
Lessons Accessed: ${lessonProgress?.length || 0}
Lessons Actually Completed: ${lessonProgress?.filter(l => l.lesson_completed)?.length || 0}
Notes Generated: ${lessonProgress?.filter(l => l.notes_generated)?.length || 0}

5. Consistency:
Account Created: ${profile?.created_at || 'Unknown'}
Last Active: ${profile?.last_active_at || 'Unknown'}`;

    const reportJson = await llmJson(systemPrompt, userPrompt);

    return new Response(JSON.stringify({ success: true, data: reportJson }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
