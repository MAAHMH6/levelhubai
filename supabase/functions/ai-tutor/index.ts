import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getAIConfig } from "../_shared/AIConfig.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context, lessonId, subjectId, subjectName, qualification } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const aiConfig = await getAIConfig(supabase);
    
    if (!aiConfig.apiKey) {
      throw new Error("AI provider API key is not configured");
    }

    const baseURL = aiConfig.baseURL || "https://openrouter.ai/api/v1";
    const sanitizedBaseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;

    // 1. Fetch Authoritative Academic Lineage (Curriculum Tree + Approved Questions)
    let academicContext = "";
    let approvedQnA = "";

    if (lessonId) {
      try {
        const { data: lesson } = await supabase
          .from("lessons")
          .select("id, title, lesson_number, topic_name, description, unit_id, video_url")
          .eq("id", lessonId)
          .maybeSingle();

        if (lesson) {
          const { data: unit } = await supabase
            .from("units")
            .select("id, title, unit_number, subject_id")
            .eq("id", lesson.unit_id)
            .maybeSingle();

          const subId = unit?.subject_id || subjectId;
          let subData = null;
          if (subId) {
            const { data: s } = await supabase
              .from("subjects")
              .select("id, name, subject_code, qualification")
              .eq("id", subId)
              .maybeSingle();
            subData = s;
          }

          academicContext = `Authoritative Curriculum Context:
- Programme: ${subData?.qualification?.toUpperCase() || qualification?.toUpperCase() || "CAMBRIDGE"}
- Subject: ${subData?.name || subjectName || "General"} (Code: ${subData?.subject_code || "N/A"})
- Unit ${unit?.unit_number || "1"}: ${unit?.title || "Core Unit"}
- Lesson ${lesson.lesson_number}: ${lesson.title}
- Topic: ${lesson.topic_name || "Syllabus Core"}
${lesson.description ? `- Syllabus Scope: ${lesson.description}` : ""}`;

          // Fetch Approved Quiz Questions for this lesson (excluding rejected)
          const { data: approvedQuestions } = await supabase
            .from("quiz_questions")
            .select("question_text, correct_answer, explanation")
            .eq("lesson_id", lessonId)
            .eq("is_rejected", false)
            .limit(3);

          if (approvedQuestions && approvedQuestions.length > 0) {
            approvedQnA = "Approved Cambridge Q&A Knowledge:\n" + approvedQuestions.map((q, idx) => 
              `[Q${idx+1}] ${q.question_text}\nAnswer: ${q.correct_answer}\nRationale: ${q.explanation || "Verified mark scheme standard."}`
            ).join("\n\n");
          }
        }
      } catch (e) {
        console.warn("Curriculum lineage lookup bypassed:", e);
      }
    }

    // 2. RAG Semantic Chunk Retrieval
    let retrievedChunks = "";
    if ((lessonId || subjectId) && messages && messages.length > 0) {
      try {
        const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
        if (lastUserMsg) {
          const res = await fetch(`${sanitizedBaseURL}/embeddings`, {
            method: "POST",
            headers: { Authorization: `Bearer ${aiConfig.apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: aiConfig.embeddingsModel || "text-embedding-3-small",
              input: lastUserMsg.content,
              dimensions: 1536,
            }),
          });
          if (res.ok) {
            const j = await res.json();
            const qEmb = j.data[0].embedding;
            const { data: chunks } = await supabase.rpc("match_curriculum_chunks", {
              query_embedding: qEmb,
              match_count: 4,
              filter_lesson_id: lessonId || null,
              filter_subject_id: (!lessonId && subjectId) ? subjectId : null,
            });
            if (chunks && chunks.length > 0) {
              retrievedChunks = "Relevant Syllabus Document Chunks:\n\n" + (chunks as any[]).map(c => c.chunk_text).join("\n\n---\n\n");
            }
          }
        }
      } catch (e) {
        console.warn("RAG search bypassed:", e);
      }
    }

    const tutorSubject = subjectName || "Cambridge Assessment";
    
    // 3. System Prompt with Pydantic Structured Output Requirement & Answer Priority
    const systemPrompt = `You are the authoritative Cambridge LevelHubAI Academic Tutor for ${tutorSubject}.

${academicContext ? academicContext + "\n\n" : ""}
${approvedQnA ? approvedQnA + "\n\n" : ""}
${retrievedChunks ? retrievedChunks + "\n\n" : ""}

ANSWER PRIORITY:
1. Verified Curriculum Tree & Syllabus Context
2. Approved Curriculum-linked Knowledge and Mark Schemes
3. Approved Quiz Questions and Explanations
4. Clear step-by-step mathematical/conceptual reasoning

MANDATORY STRUCTURED OUTPUT FORMAT:
You MUST respond with a valid JSON object matching the LevelHubAI TutorResponse schema below:
{
  "direct_answer": "Clear, concise direct answer to the student's question.",
  "explanation": "Friendly, encouraging person-to-person pedagogical explanation connecting to the Cambridge syllabus.",
  "steps": [
    {
      "step_number": 1,
      "instruction": "Explain the concept or formula applied.",
      "working": "Mathematical step, calculation or definition"
    }
  ],
  "example": "A relevant worked exemplar if helpful, or null.",
  "common_mistake": "A frequent Cambridge candidate pitfall from Examiner Reports for this topic, or null.",
  "quick_check": "A short, engaging question for the student to test their understanding, or null.",
  "next_step": "Suggested next learning step in this unit/lesson, or null."
}

Do NOT output conversational preamble before or after the JSON. Return only the valid JSON object.`;

    const response = await fetch(`${sanitizedBaseURL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${aiConfig.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: aiConfig.chatModel || aiConfig.textModel || "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI Tutor error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
