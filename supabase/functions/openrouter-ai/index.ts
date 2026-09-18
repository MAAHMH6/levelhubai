import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY")!;
    if (!OPENROUTER_API_KEY) {
      throw new Error("No AI API key configured (OPENROUTER_API_KEY)");
    }

    const { type, subject, curriculum, lessonTitle, unitTitle, questionCount, paperText, previousQuestions } = await req.json();

    if (!type) {
      return new Response(
        JSON.stringify({ error: "Missing 'type' field. Use 'quiz', 'paper', or 'summary'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let systemPrompt = "";
    let userPrompt = "";

    const prevQContext = previousQuestions?.length
      ? `\n\nIMPORTANT: Do NOT repeat any of these previously asked questions:\n${previousQuestions.join("\n")}`
      : "";

    if (type === "quiz") {
      const count = questionCount || 5;
      const topicContext = lessonTitle ? `for the lesson "${lessonTitle}"` : unitTitle ? `for the unit "${unitTitle}"` : `for ${subject}`;

      systemPrompt = `You are an expert Cambridge O-Level ${subject} teacher creating quiz questions. You MUST generate questions ONLY from the provided curriculum content. Follow the Cambridge O-Level examination pattern strictly.

IMPORTANT: Return ONLY valid JSON, no other text. Use this exact format:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why the answer is correct"
    }
  ]
}

Rules:
- Generate exactly ${count} questions
- correctAnswer is the 0-based index (0, 1, 2, or 3)
- Each question must have exactly 4 options
- Mix difficulty levels (easy, medium, hard)
- Follow Cambridge O-Level pattern and style
- Include computational and conceptual questions
- Questions must be based STRICTLY on the curriculum provided
- No repeated questions${prevQContext}`;

      userPrompt = `Generate ${count} O-Level ${subject} quiz questions ${topicContext} based ONLY on this curriculum:\n\n${curriculum}`;

    } else if (type === "paper") {
      systemPrompt = `You are an expert Cambridge O-Level ${subject} examiner creating a full exam paper. Generate a complete paper based STRICTLY on the provided curriculum.

Return the paper in clean formatted text with:
- Paper header with subject name and instructions
- Section A: Multiple Choice Questions (10 questions, 1 mark each)
- Section B: Structured/Short Answer Questions (5 questions, varying marks)
- Section C: Extended Response Questions (2 questions, higher marks)
- Total marks clearly shown
- Time allocation suggestion
- Answers section at the end

Follow the real Cambridge O-Level format exactly. Do NOT include topics outside the curriculum.${prevQContext}`;

      userPrompt = `Generate a full O-Level ${subject} exam paper based ONLY on this curriculum:\n\n${curriculum}`;

    } else if (type === "summary") {
      systemPrompt = `You are an expert O-Level exam analyst. Analyze the provided paper and extract key information for students.

Provide a structured analysis with:
1. **Important Topics Covered** - List all topics in the paper
2. **Key Concepts** - Core concepts students must understand
3. **Question Patterns** - Types of questions and their frequency
4. **What Students Should Focus On** - Study priorities based on this paper
5. **Difficulty Analysis** - Overall difficulty and breakdown

IMPORTANT: Do NOT summarize the full subject. ONLY analyze this specific paper.`;

      userPrompt = `Analyze this O-Level paper:\n\n${paperText}`;

    } else {
      return new Response(
        JSON.stringify({ error: "Invalid type. Use 'quiz', 'paper', or 'summary'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "API credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";

    if (type === "quiz") {
      // Parse JSON for quiz responses
      let cleanContent = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        cleanContent = jsonMatch[1];
      }

      try {
        const parsed = JSON.parse(cleanContent.trim());
        const questions = parsed.questions || parsed;
        return new Response(
          JSON.stringify({ success: true, questions, content: null }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch {
        console.error("Failed to parse quiz JSON:", cleanContent);
        return new Response(
          JSON.stringify({ success: true, questions: [], content }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // For paper and summary, return raw text content
    return new Response(
      JSON.stringify({ success: true, content, questions: null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in openrouter-ai:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
