import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

async function llmJson(system: string, user: string): Promise<any> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
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
    if (!authHeader) throw new Error("Missing Authorization header");

    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    const body = await req.json();
    const { errorData, mode } = body;

    if (!errorData) {
      throw new Error("Error data is required");
    }

    const { type, original, correction, explanation } = errorData;
    
    const isIGCSE = mode === 'IGCSE' || mode === 'O Level';
    const gradeLevelText = isIGCSE ? "Cambridge IGCSE / 10th-grade level" : "middle to high school level";

    let systemPrompt = `You are a helpful AI English Tutor. A student has made a writing mistake. Your job is to create a mini-lesson and a 5-question practice quiz to help them learn from it.

Rules:
- The target difficulty is ${gradeLevelText}.
- The questions must be multiple-choice (MCQ) with exactly 4 options.
- The questions should specifically target the grammatical, punctuation, spelling, or vocabulary rule broken in the student's mistake.
- Ensure the questions are clear and have only one unquestionably correct answer.

Return JSON with this exact shape:
{
  "lesson": {
    "rule": "The simple, easy-to-understand grammar/punctuation/vocabulary rule.",
    "examples_correct": ["correct example 1", "correct example 2"],
    "examples_incorrect": ["incorrect example 1", "incorrect example 2"]
  },
  "questions": [
    {
      "type": "mcq",
      "question_text": "The practice question focusing on the specific rule.",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "The exact text of the correct option",
      "explanation": "Why this answer is correct."
    }
  ]
}`;

    const userPrompt = `Student's Mistake:
Category: ${type}
Original Text: "${original}"
Correction: "${correction}"
AI's Initial Explanation: "${explanation}"

Please generate the mini-lesson and 5 practice questions based on this specific error type.`;

    const result = await llmJson(systemPrompt, userPrompt);
    
    // Ensure we return exactly 5 questions if possible, though LLM handles this via prompt
    const questions = Array.isArray(result.questions) ? result.questions : [];

    return new Response(JSON.stringify({ lesson: result.lesson, questions }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (e: any) {
    console.error("mistakes-practice-generator error", e);
    return new Response(JSON.stringify({ error: String(e.message || e) }), { 
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
