import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getAIConfig } from "../_shared/AIConfig.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};


const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { blueprint_id, user_id, title } = await req.json();

    if (!blueprint_id || !user_id) {
      throw new Error("Missing required fields: blueprint_id, user_id");
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const aiConfig = await getAIConfig(supabase);

    if (!aiConfig.apiKey) {
      throw new Error("AI provider API key is not configured");
    }

    const baseURL = aiConfig.baseURL || "https://openrouter.ai/api/v1";
    const sanitizedBaseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;

    // 1. Fetch Blueprint
    const { data: blueprint, error: bpError } = await supabase
      .from("exam_blueprints")
      .select("*")
      .eq("id", blueprint_id)
      .single();

    if (bpError || !blueprint) throw new Error("Blueprint not found");
    const structuralData = blueprint.structural_metadata;

    // 2. Create the Mock Exam Record
    const { data: mockExam, error: mockErr } = await supabase
      .from("mock_exams")
      .insert({
        blueprint_id,
        subject_id: blueprint.subject_id,
        user_id,
        mode: "practice",
        status: "generating",
        time_limit_minutes: parseInt(structuralData?.metadata?.time_allowed) || 120,
        total_marks: structuralData?.metadata?.total_marks || 100
      })
      .select()
      .single();

    if (mockErr) throw mockErr;

    // 3. Generate content via AI
    // The user explicitly wants a clean-room generation using the blueprint.
    const systemPrompt = `You are a Cambridge Examiner writing a brand-new, original O-Level Exam Paper.
Here is the structural blueprint you MUST follow:

${JSON.stringify(structuralData, null, 2)}

For each question in the blueprint, write a completely original question that matches the topics, subtopics, command words, marks, and difficulty specified. 
DO NOT USE ANY ACTUAL QUESTIONS FROM PREVIOUS EXAMS. Create entirely new scenarios, new names, new data, and new contexts.

Format your output as a JSON object with a "questions" array.
Each question MUST follow this schema:
{
  "question_number": <int, matching blueprint>,
  "question_text": "<string, the actual exam question text>",
  "marks": <int, matching blueprint>,
  "options": [<array of 4 strings, if this is multiple choice, otherwise null>],
  "correct_answer": "<string, the correct option or expected short answer>",
  "explanation": "<string, marking scheme or explanation>"
}

Output ONLY valid JSON. No markdown formatting.`;

    const res = await fetch(`${sanitizedBaseURL}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${aiConfig.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: aiConfig.textModel, 
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate the mock exam questions based on the blueprint." }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7 
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`AI generation failed: ${res.status} ${errText}`);
    }

    const json = await res.json();
    let content = json?.choices?.[0]?.message?.content;
    if (!content) throw new Error("AI returned empty content");
    
    const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) content = match[1];
    
    let generatedData;
    try {
      generatedData = JSON.parse(content);
    } catch (e: any) {
      throw new Error(`Failed to parse AI output as JSON: ${e?.message}`);
    }

    const questionsToInsert = generatedData.questions.map((q: any) => ({
      mock_exam_id: mockExam.id,
      subject_id: blueprint.subject_id,
      question_number: q.question_number,
      question_text: q.question_text,
      options: q.options || [],
      correct_answer: q.correct_answer || "",
      explanation: q.explanation || "",
      marks: q.marks || 1,
      difficulty: 3
    }));

    // 4. Save Questions to `quiz_questions`
    const { error: insertErr } = await supabase
      .from("quiz_questions")
      .insert(questionsToInsert);

    if (insertErr) {
      // rollback mock exam
      await supabase.from("mock_exams").delete().eq("id", mockExam.id);
      throw insertErr;
    }

    // 5. Update Mock Exam Status
    await supabase.from("mock_exams").update({ status: "ready" }).eq("id", mockExam.id);

    return new Response(
      JSON.stringify({ ok: true, mock_exam_id: mockExam.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("generate-mock-exam error", e);
    return new Response(
      JSON.stringify({ error: String((e as Error)?.message || e) }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
