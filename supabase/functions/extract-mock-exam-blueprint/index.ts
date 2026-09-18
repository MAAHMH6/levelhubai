
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { extractText, getDocumentProxy } from "https://esm.sh/unpdf@0.12.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { file_path, subject_id, title } = await req.json();

    if (!file_path || !subject_id || !title) {
      throw new Error("Missing required fields: file_path, subject_id, title");
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) throw new Error("Unauthorized");

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Verify Admin
    const { data: userRes } = await supabase.auth.getUser(token);
    const uid = userRes?.user?.id;
    if (!uid) throw new Error("Unauthorized");
    
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", uid).maybeSingle();
    const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle();
    
    if (profile?.role !== 'admin' && !roleRow) {
      throw new Error("Forbidden: Only admins can extract blueprints");
    }

    // 1. Download PDF from Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("curriculum-docs")
      .download(file_path);

    if (downloadError || !fileData) {
      throw new Error("Failed to download PDF: " + downloadError?.message);
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const pdfData = new Uint8Array(arrayBuffer);
    const pdf = await getDocumentProxy(pdfData);
    const { text } = await extractText(pdf, { mergePages: true });

    if (!text || text.trim().length < 50) {
      throw new Error("Could not extract enough text from the PDF. It might be scanned or image-based.");
    }

    // 2. Call AI with Step 1 Prompt (Structural Extraction)
    const systemPrompt = `You are analyzing the STRUCTURE of an exam paper, not its content.
Extract ONLY the following as JSON. Do not include any verbatim question text, numbers used in scenarios, or diagram descriptions.

For each question, output:
{
  "question_number": int,
  "marks": int,
  "topic": string (e.g. "circle theorems", "algebraic fractions"),
  "subtopic": string,
  "command_words": [list, e.g. "calculate", "show that"],
  "num_parts": int,
  "has_diagram": bool,
  "diagram_type": string or null (e.g. "coordinate grid", "circle with tangent"),
  "estimated_difficulty": 1-5,
  "position_in_paper": int
}

Also output paper-level metadata:
{
  "total_marks": int,
  "total_questions": int,
  "time_allowed": string,
  "topic_distribution": {topic: total_marks},
  "difficulty_curve": [list of difficulty per question in order]
}

Return valid JSON only containing the root object with keys "questions" (array) and "metadata" (object). No markdown.`;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash", 
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Extract the structural blueprint for this past paper:\n\n${text.substring(0, 50000)}` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1, // Low temp for highly deterministic extraction
        max_tokens: 4000
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`AI extraction failed: ${res.status} ${errText}`);
    }

    const json = await res.json();
    let content = json?.choices?.[0]?.message?.content;
    if (!content) throw new Error("AI returned empty content");
    
    const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) content = match[1];
    
    let blueprint;
    try {
      blueprint = JSON.parse(content);
    } catch (e: any) {
      throw new Error(`Failed to parse AI output as JSON: ${e?.message}`);
    }

    // 3. Save to database (discard text!)
    const { data: inserted, error: insertError } = await supabase
      .from("exam_blueprints")
      .insert({
        subject_id,
        title,
        source_filename: file_path,
        structural_metadata: blueprint
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ ok: true, blueprint: inserted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("extract-mock-exam-blueprint error", e);
    return new Response(
      JSON.stringify({ ok: false, error: String((e as Error)?.message || e) }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
