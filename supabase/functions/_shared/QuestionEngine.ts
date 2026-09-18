import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getAIConfig, AIConfiguration } from "./AIConfig.ts";

export interface QuestionScope {
  subjectId: string;
  subjectName: string;
  unitId?: string;
  unitTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
  topicId?: string;
}

export interface QuestionRequest {
  count: number;
  difficulty?: number;
  userId?: string; // To filter out questions they've already answered
  weakTopics?: string[];
  blueprintSpec?: any; // For Mock Exams Step 2
  topicOutline?: string; // For bulk curriculum generation
  forceGenerate?: boolean; // Bypass cache for forced new generation
}

export interface QuestionEngineConfig {
  supabase: SupabaseClient;
  openRouterKey: string;
  openAiKey?: string;
  scope: QuestionScope;
  request: QuestionRequest;
}

export interface GeneratedQuestion {
  id?: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: number;
  bloom_level?: string;
  learning_objective?: string;
  subject_id: string;
  unit_id?: string;
  lesson_id?: string;
  source: string;
}

export class QuestionEngine {
  
  static async generate(config: QuestionEngineConfig): Promise<GeneratedQuestion[]> {
    const { supabase, scope, request } = config;
    const aiConfig = await getAIConfig(supabase);
    
    let validCached: GeneratedQuestion[] = [];
    
    if (!request.forceGenerate) {
      // 1. Coverage Engine: Fetch existing unused questions
      let query = supabase.from("quiz_questions")
        .select("id, question_text, options, correct_answer, explanation, difficulty, bloom_level, learning_objective, subject_id, unit_id, lesson_id, source")
        .eq("subject_id", scope.subjectId)
        .eq("is_rejected", false);
        
      if (scope.lessonId) query = query.eq("lesson_id", scope.lessonId);
      else if (scope.unitId) query = query.eq("unit_id", scope.unitId);

      // If userId provided, exclude questions they've attempted
      if (request.userId) {
        const { data: attempts } = await supabase.from("quiz_attempts")
          .select("question_id")
          .eq("user_id", request.userId);
        if (attempts && attempts.length > 0) {
          const attemptedIds = attempts.map(a => a.question_id);
          query = query.not("id", "in", `(${attemptedIds.join(",")})`);
        }
      }

      // Limit to the requested count
      query = query.limit(request.count);
      
      const { data: cachedQuestions, error: cacheErr } = await query;
      if (cacheErr) console.error("Cache error:", cacheErr);
      
      validCached = (cachedQuestions || []) as GeneratedQuestion[];
    }
    
    const deltaCount = request.count - validCached.length;
    
    if (deltaCount <= 0) {
      console.log(`[QuestionEngine] Fully satisfied from cache (${validCached.length})`);
      return validCached;
    }
    
    console.log(`[QuestionEngine] Cache hit: ${validCached.length}. Generating delta: ${deltaCount}`);

    // 2. RAG Context Retrieval (Context Minimization)
    let chunkContext = "";
    if (config.openRouterKey && (scope.lessonTitle || scope.unitTitle)) {
      try {
        const qEmb = await this.embed(scope.lessonTitle || scope.unitTitle || scope.subjectName, config.openRouterKey, aiConfig);
        // Minimizing tokens: only fetch 2 chunks per requested question, max 15
        const matchCount = Math.min(deltaCount * 2, 15);
        const { data: chunks } = await supabase.rpc("match_curriculum_chunks", {
          query_embedding: qEmb,
          match_count: matchCount,
          filter_lesson_id: scope.lessonId || null,
        });
        if (chunks && chunks.length > 0) {
          chunkContext = chunks.map((c: any, i: number) => `[Chunk ${i+1}]\n${c.chunk_text}`).join("\n\n");
        }
      } catch (e) {
        console.error("RAG error:", e);
      }
    }

    // 3. AI Generation (Validation Layer Baked into Prompt)
    const newQuestions = await this.callAI(config, deltaCount, chunkContext, aiConfig);
    
    // 4. Cache new questions to database
    if (newQuestions.length > 0) {
      const inserts = newQuestions.map(q => ({
        ...q,
        subject_id: scope.subjectId,
        unit_id: scope.unitId || null,
        lesson_id: scope.lessonId || null,
        source: "ai_generated_engine",
        is_rejected: false,
        question_type: "multiple_choice"
      }));
      const { data: inserted, error: insertErr } = await supabase.from("quiz_questions").insert(inserts).select();
      if (insertErr) console.error("Insert error:", insertErr);
      if (inserted) return [...validCached, ...inserted];
    }

    return [...validCached, ...newQuestions];
  }

  private static async embed(text: string, apiKey: string, aiConfig: AIConfiguration): Promise<number[]> {
    const isOpenAIEmbed = aiConfig.embeddingsModel.startsWith("text-embedding-") || aiConfig.embeddingsModel.startsWith("openai/");
    
    const baseURL = isOpenAIEmbed ? "https://api.openai.com/v1" : (aiConfig.baseURL || "https://openrouter.ai/api/v1");
    const sanitizedBaseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    const resolvedKey = isOpenAIEmbed ? (aiConfig.openaiApiKey || aiConfig.apiKey || apiKey) : (aiConfig.apiKey || apiKey);

    const res = await fetch(`${sanitizedBaseURL}/embeddings`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${resolvedKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: aiConfig.embeddingsModel.replace("openai/", ""), input: text, dimensions: 1536 }),
    });
    if (!res.ok) throw new Error("Embedding failed");
    const j = await res.json();
    return j.data[0].embedding;
  }

  private static async callAI(config: QuestionEngineConfig, count: number, context: string, aiConfig: AIConfiguration): Promise<GeneratedQuestion[]> {
    const scopeStr = [config.scope.subjectName, config.scope.unitTitle, config.scope.lessonTitle].filter(Boolean).join(" > ");
    
    let blueprintInstruction = "";
    if (config.request.blueprintSpec) {
      blueprintInstruction = `\n\nSTRUCTURAL SPECIFICATION (CLEAN ROOM MOCK EXAM MODE):\nMust strictly follow: ${JSON.stringify(config.request.blueprintSpec)}\nGenerate brand new scenarios and numbers. Do not copy past papers verbatim.`;
    }

    const systemPrompt = `You are a strict Cambridge Examiner writing exactly ${count} original multiple-choice questions for the syllabus scope: ${scopeStr}.

${context ? `CURRICULUM KNOWLEDGE SOURCE:\n${context}` : ""}
${config.request.topicOutline ? `TOPIC OUTLINE:\n${config.request.topicOutline}` : ""}
${blueprintInstruction}

VALIDATION LAYER RULES (CRITICAL):
1. Scope Relevance: Questions MUST ONLY cover the specified lesson/unit (${scopeStr}). Do not pull in unrelated topics.
2. Learning Focus: Base questions strictly on academic learning objectives and skills.
3. Excluded Topics: NEVER ask about "Cambridge", exam rules, or general knowledge.
4. No Meta-Language: Do not use phrases like "as mentioned in the text" or "according to the syllabus". Act like a real exam paper.
5. Distractor Quality: Incorrect options must represent common, plausible student misconceptions. There must be exactly ONE unambiguously correct answer.
6. Self-Contained: The question must not reference missing diagrams or texts.

JSON OUTPUT FORMAT:
You must output a raw JSON object (no markdown formatting) exactly matching this schema:
{
  "questions": [
    {
      "q": "The question text",
      "o": ["Option A", "Option B", "Option C", "Option D"],
      "a": "Option A", // The exact string of the correct option
      "e": "Step by step explanation of why this is correct and others are wrong",
      "d": 3, // Difficulty 1-5
      "b": "Application", // Bloom's Taxonomy Level
      "l": "Calculate the area of a circle" // The learning objective tested
    }
  ]
}`;

    const baseURL = aiConfig.baseURL || "https://openrouter.ai/api/v1";
    const sanitizedBaseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    const resolvedKey = aiConfig.apiKey || config.openRouterKey;

    const res = await fetch(`${sanitizedBaseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resolvedKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: aiConfig.quizModel || aiConfig.textModel,
        messages: [{ role: "system", content: systemPrompt }],
        response_format: { type: "json_object" }
      })
    });

    if (!res.ok) {
      console.error("OpenRouter Error:", await res.text());
      return [];
    }

    const j = await res.json();
    try {
      let content = j.choices[0].message.content;
      const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) content = match[1];
      const parsed = JSON.parse(content);
      return (parsed.questions || []).map((q: any) => ({
        question_text: q.q,
        options: q.o,
        correct_answer: q.a,
        explanation: q.e,
        difficulty: q.d || 3,
        bloom_level: q.b,
        learning_objective: q.l,
        subject_id: config.scope.subjectId,
        unit_id: config.scope.unitId,
        lesson_id: config.scope.lessonId,
        topic_id: config.scope.topicId,
        source: "ai_generated_engine"
      }));
    } catch(e) {
      console.error("Failed to parse AI output:", e);
      return [];
    }
  }
}
