import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

async function llmString(system: string, user: string): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.1,
    }),
  });
  if (!res.ok) throw new Error(`llm ${res.status}: ${await res.text()}`);
  const j = await res.json();
  return j.choices?.[0]?.message?.content || "";
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
    const { text } = body;

    if (!text || text.trim().length === 0) {
      throw new Error("Text is required");
    }

    const systemPrompt = `You are a transcription formatting assistant.
Your task is to take a raw voice transcription string and output ONLY the cleanly punctuated and capitalized version of it.

RULES:
- Add full stops, commas, question marks, and exclamation marks where appropriate.
- Capitalize the beginnings of sentences and proper nouns.
- Automatically insert paragraph breaks for natural pauses or topic shifts.
- Listen for explicit spoken punctuation commands. If the user says "comma", insert a comma (","). If they say "full stop" or "period", insert a full stop ("."). If they say "question mark", insert "?". If they say "exclamation mark", insert "!". If they say "new paragraph", insert a double line break.
- Do NOT alter the student's actual words or grammar beyond capitalization and punctuation. The grammar analyzer will handle grammar mistakes later.
- Do NOT add any extra conversational text (e.g., "Here is the punctuated text:"). Output ONLY the final text.`;

    const userPrompt = text;

    const result = await llmString(systemPrompt, userPrompt);

    return new Response(JSON.stringify({ text: result.trim() }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (e: any) {
    console.error("voice-punctuator error", e);
    return new Response(JSON.stringify({ error: String(e.message || e) }), { 
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
