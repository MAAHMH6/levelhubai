import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lessonId, lessonTitle, userId } = await req.json();

    if (!lessonId || !lessonTitle || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if notes already exist
    const { data: existingNotes } = await supabase
      .from("ai_notes")
      .select("id")
      .eq("lesson_id", lessonId)
      .eq("user_id", userId)
      .maybeSingle();

    const systemPrompt = `You are an expert mathematics tutor creating comprehensive study notes. 
Generate detailed, well-structured notes for the lesson titled "${lessonTitle}".

Your notes should:
1. Start with a clear learning objective
2. Break down key concepts with clear explanations
3. Include relevant formulas (use simple text notation like x^2 for powers)
4. Provide worked examples where appropriate
5. Include memory tips or mnemonics when helpful
6. End with key takeaways

Format using Markdown with proper headings (##, ###), bullet points, and bold text for emphasis.
Keep the language accessible for high school students.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Create comprehensive study notes for the mathematics lesson: "${lessonTitle}"` },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("Failed to generate notes");
    }

    const aiResponse = await response.json();
    const generatedContent = aiResponse.choices?.[0]?.message?.content || "";

    if (existingNotes) {
      await supabase
        .from("ai_notes")
        .update({
          ai_generated_content: generatedContent,
          generated_at: new Date().toISOString(),
        })
        .eq("id", existingNotes.id);
    } else {
      await supabase.from("ai_notes").insert({
        lesson_id: lessonId,
        user_id: userId,
        ai_generated_content: generatedContent,
        generated_at: new Date().toISOString(),
      });
    }

    // Mark notes as generated in lesson_progress
    await supabase
      .from("lesson_progress")
      .update({ notes_generated: true })
      .eq("lesson_id", lessonId)
      .eq("user_id", userId);

    return new Response(
      JSON.stringify({ success: true, content: generatedContent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating notes:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
