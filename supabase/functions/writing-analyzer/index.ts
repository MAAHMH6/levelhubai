import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
      temperature: 0.2,
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
    const { text, mode, writingType } = body;

    if (!text || text.trim().length === 0) {
      throw new Error("Text is required for analysis");
    }

    const isIGCSE = mode === 'IGCSE' || mode === 'O Level';
    
    let systemPrompt = `You are an expert English teacher and examiner. Your task is to analyze the student's writing and provide detailed feedback, corrections, and scores.

IMPORTANT RULES:
- Preserve the student's original meaning. Do NOT silently rewrite their ideas.
- Distinguish actual errors from optional style improvements.
- Use age-appropriate explanations (target: high school).
- Return valid JSON strictly matching the shape requested below.
- Do NOT fabricate scores. Base them solely on the quality of the provided text.

`;

    if (isIGCSE) {
      systemPrompt += `IGCSE / O LEVEL MODE (9th & 10th Grade Standard):
- Evaluate strictly against Cambridge expectations.
- Check for advanced grammar: conditional clauses, passive voice, advanced tenses, subject-verb agreement.
- Vocabulary must be precise, formal, and appropriate for academic writing. Penalize overly simplistic or repeated words.
- Evaluate coherence, paragraphing, register/formality, and sentence variety.
- The writing type is: ${writingType || 'General Writing'}. Adjust your tone and register expectations accordingly.
`;
    } else {
      systemPrompt += `GENERAL ENGLISH MODE:
- Focus on basic to intermediate grammar, clear sentence structure, spelling, and everyday vocabulary.
- The writing type is: ${writingType || 'General Writing'}.
`;
    }

    systemPrompt += `
Return JSON with this exact shape:
{
  "scores": {
    "overall": number (0-100),
    "grammar": number (0-100),
    "punctuation": number (0-100),
    "spelling": number (0-100),
    "vocabulary": number (0-100),
    "clarity": number (0-100)
  },
  "errors": [
    {
      "type": "grammar" | "punctuation" | "spelling" | "vocabulary" | "style",
      "original": "the exact snippet of text containing the error",
      "correction": "the suggested fix",
      "explanation": "Why this is wrong and how to fix it (simple rule)"
    }
  ],
  "improved_text": "The full text with all errors corrected, preserving the original meaning.",
  "feedback": {
    "strengths": ["point 1", "point 2"],
    "improvements": ["point 1", "point 2"]
  },
  "vocabulary_suggestions": [
    {
      "original": "simple_word",
      "better_options": ["precise1", "precise2", "precise3"]
    }
  ]
}`;

    const userPrompt = `Please analyze the following text:\n\n"${text}"`;

    const result = await llmJson(systemPrompt, userPrompt);
    
    // Save to writing history
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const { error: insertError } = await supabase.from('writing_history').insert({
      user_id: user.id,
      writing_type: writingType || 'General',
      original_text: text,
      improved_text: result.improved_text || text,
      overall_score: result.scores?.overall || 0,
      grammar_score: result.scores?.grammar || 0,
      vocabulary_score: result.scores?.vocabulary || 0,
      punctuation_score: result.scores?.punctuation || 0,
      spelling_score: result.scores?.spelling || 0,
      clarity_score: result.scores?.clarity || 0
    });

    if (insertError) {
      console.error("Failed to log writing history:", insertError);
    }

    return new Response(JSON.stringify(result), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (e: any) {
    console.error("writing-analyzer error", e);
    return new Response(JSON.stringify({ error: String(e.message || e) }), { 
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
