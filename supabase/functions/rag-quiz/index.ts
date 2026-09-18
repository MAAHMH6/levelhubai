import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { QuestionEngine, QuestionEngineConfig, QuestionScope } from "../_shared/QuestionEngine.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const {
      scope, // "lesson", "unit", "subject"
      subject_id,
      unit_id,
      lesson_id,
      topic_id,
      question_count = 10,
      difficulty = 3,
    } = body || {};

    if (!scope) throw new Error("scope required");
    if (scope !== "mixed" && !subject_id) throw new Error("subject_id required");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");
    
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Auth client to verify user
    const supabaseAuth = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY") || "", {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const today = new Date().toISOString().split("T")[0];

    // Check Limits
    if (scope === "lesson" || scope === "unit" || scope === "subject") {
      const { data: usage } = await supabase
        .from("daily_quiz_usage")
        .select("*")
        .eq("user_id", user.id)
        .eq("usage_date", today)
        .maybeSingle();
        
      const limit = 5;
      const used = usage ? usage[`${scope}_quizzes_used`] || 0 : 0;
      
      if (used >= limit) {
        return new Response(
          JSON.stringify({
            error: `You've reached today's ${scope} Quiz limit. Your daily limit will reset tomorrow.`,
            empty: true
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Resolve titles for prompt scope
    let subjectName = "Subject";
    let unitTitle = undefined;
    let lessonTitle = undefined;

    const { data: sub } = await supabase.from("subjects").select("name").eq("id", subject_id).single();
    if (sub) subjectName = sub.name;

    if (unit_id) {
      const { data: un } = await supabase.from("units").select("title").eq("id", unit_id).single();
      if (un) unitTitle = un.title;
    }

    if (lesson_id) {
      const { data: les } = await supabase.from("lessons").select("title").eq("id", lesson_id).single();
      if (les) lessonTitle = les.title;
    }

    const engineConfig: QuestionEngineConfig = {
      supabase,
      openRouterKey: "",
      scope: {
        subjectId: subject_id,
        subjectName,
        unitId: unit_id,
        unitTitle,
        lessonId: lesson_id,
        lessonTitle
      },
      request: {
        count: question_count,
        userId: user.id
      }
    };

    let mappedQuestions: any[] = [];

    if (scope === "mixed") {
      // 1. Mixed Quick Quiz - Fetch randomly across all cached questions
      const { data: randomQs, error: randomErr } = await supabase
        .from("quiz_questions")
        .select("id, question_text, options, correct_answer, explanation")
        .eq("is_rejected", false)
        .limit(200);

      if (randomErr) throw randomErr;
      
      let allQs = randomQs || [];
      // Exclude attempted questions
      if (user.id) {
        const { data: attempts } = await supabase.from("quiz_attempts").select("question_id").eq("user_id", user.id);
        if (attempts && attempts.length > 0) {
          const attemptedIds = new Set(attempts.map(a => a.question_id));
          allQs = allQs.filter(q => !attemptedIds.has(q.id));
        }
      }
      
      // Shuffle and pick
      const shuffled = allQs.sort(() => 0.5 - Math.random()).slice(0, question_count);
      mappedQuestions = shuffled.map(q => ({
        type: "mcq",
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        marks: 1
      }));
    } else {
      // 2. Standard Subject/Unit/Lesson Quiz - Use QuestionEngine (Cache + RAG)
      const questions = await QuestionEngine.generate(engineConfig);
      mappedQuestions = questions.map(q => ({
        type: "mcq",
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        marks: 1
      }));
    }

    // Increment Usage if successful
    if (mappedQuestions.length > 0 && (scope === "lesson" || scope === "unit" || scope === "subject")) {
      const { data: usage } = await supabase
        .from("daily_quiz_usage")
        .select("*")
        .eq("user_id", user.id)
        .eq("usage_date", today)
        .maybeSingle();

      const colName = `${scope}_quizzes_used`;
      
      if (usage) {
        await supabase
          .from("daily_quiz_usage")
          .update({ [colName]: (usage[colName] || 0) + 1 })
          .eq("id", usage.id);
      } else {
        await supabase
          .from("daily_quiz_usage")
          .insert({
            user_id: user.id,
            usage_date: today,
            [colName]: 1
          });
      }
    }

    return new Response(
      JSON.stringify({
        questions: mappedQuestions,
        model: null,
        chunks_used: 0
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("rag-quiz error", e);
    return new Response(
      JSON.stringify({ error: String((e as Error)?.message || e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
