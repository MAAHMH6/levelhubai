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

    // Fetch assessment data
    const { data: assessment, error: assessmentError } = await supabase
      .from("student_assessments")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (assessmentError) throw assessmentError;
    if (!assessment) throw new Error("No assessment profile found");

    // Fetch quiz stats
    const { data: quizzes, error: quizzesError } = await supabase
      .from("quiz_sessions")
      .select("score, total, percentage, status, created_at, scope, subject_id, unit_id, topic_ids")
      .eq("user_id", user.id)
      .eq("status", "completed");

    if (quizzesError) throw quizzesError;

    // Aggregate subjects to get meaningful names instead of UUIDs
    const subjectIds = [...new Set(quizzes.map((q) => q.subject_id).filter(Boolean))];
    let subjectsMap: Record<string, string> = {};
    if (subjectIds.length > 0) {
      const { data: subjectsData } = await supabase
        .from("subjects")
        .select("id, name")
        .in("id", subjectIds);
      subjectsData?.forEach((s) => (subjectsMap[s.id] = s.name));
    }

    const formattedQuizzes = quizzes.map(q => ({
      ...q,
      subject_name: q.subject_id ? subjectsMap[q.subject_id] : "Unknown",
    }));

    const systemPrompt = `You are a professional educational data analyst for LevelHubAI, an O-Level exam prep platform.
You are generating a highly personalized "Student Performance & Assessment Report".
You must return a JSON object exactly matching this schema:
{
  "ai_report_summary": "A 2-3 paragraph summary of their overall performance, addressing both cognitive scores and quiz history. Talk directly to the student ('You have shown...').",
  "ai_strengths": ["Strength 1 (e.g. Strong verbal ability)", "Strength 2", ...],
  "ai_weaknesses": [{"area": "Problem Solving", "action": "Practice 3 Lesson Quizzes"}],
  "ai_study_plan": [
    {"subject": "Mathematics", "topic": "Geometry", "action": "Watch lesson"},
    {"subject": "Physics", "topic": "Electricity", "action": "Complete Lesson Quiz"}
  ],
  "ai_areas_to_explore": ["Computer Science", "Engineering"] // Based on interests and high scores
}

IMPORTANT RULES:
- Do NOT make clinical or standardized psychology claims. Call them "Cognitive Skill Indicators".
- If quiz history is empty, focus heavily on their cognitive assessment preferences and encourage them to take quizzes.
- Action items in the study plan MUST be actionable within LevelHubAI (e.g. "Watch lesson", "Generate notes", "Complete Lesson Quiz", "Start Timed Quiz").
- Return raw JSON only.`;

    const userPrompt = `Student Data:
Cognitive Scores (0-100):
- Logical Reasoning: ${assessment.logical_score}
- Verbal Ability: ${assessment.verbal_score}
- Quantitative Skills: ${assessment.quantitative_score}
- Problem Solving: ${assessment.problem_solving_score}
- Processing Speed: ${assessment.processing_speed_score}

Learner Profile:
- Learning Style: ${assessment.learning_style || "Not provided"}
- Favorite Subjects: ${(assessment.favorite_subjects || []).join(", ") || "Not provided"}
- Interests: ${(assessment.interests || []).join(", ") || "Not provided"}
- Biggest Challenge: ${assessment.biggest_challenge || "Not provided"}
- Academic Goal: ${assessment.academic_goal || "Not provided"}
- Motivation (1-5): ${assessment.motivation_score}
- Confidence (1-5): ${assessment.confidence_score}

Quiz History (Total Completed: ${formattedQuizzes.length}):
${JSON.stringify(formattedQuizzes, null, 2)}`;

    const reportJson = await llmJson(systemPrompt, userPrompt);

    // Save back to database
    const { error: updateError } = await supabase
      .from("student_assessments")
      .update({
        ai_report_summary: reportJson.ai_report_summary,
        ai_strengths: reportJson.ai_strengths,
        ai_weaknesses: reportJson.ai_weaknesses,
        ai_study_plan: reportJson.ai_study_plan,
        ai_areas_to_explore: reportJson.ai_areas_to_explore,
        needs_ai_refresh: false,
        updated_at: new Date().toISOString()
      })
      .eq("id", assessment.id);

    if (updateError) throw updateError;

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
