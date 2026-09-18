// Generate a batch of AI-authored quiz questions from a curriculum document's
// structured_index and store them in quiz_questions tagged source='curriculum_index'.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { QuestionEngine, QuestionEngineConfig } from "../_shared/QuestionEngine.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

type Topic = {
  title: string;
  subtopics?: string[];
  key_concepts?: string[];
  learning_outcomes?: string[];
  skills?: string[];
  exam_focus?: string[];
  command_words?: string[];
};

type Lesson = { title: string; topics?: Topic[] };
type Unit = { title: string; lessons?: Lesson[]; topics?: Topic[] };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { document_id, per_topic = 5, max_topics = 30, topics_chunk } = await req.json();
    if (!document_id) throw new Error("document_id required");

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Auth: only admins may run
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: corsHeaders });
    const { data: userRes } = await supabase.auth.getUser(token);
    const uid = userRes?.user?.id;
    if (!uid) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: corsHeaders });
    const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle();
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", uid).maybeSingle();
    
    if (!roleRow && profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: "forbidden" }), { status: 200, headers: corsHeaders });
    }

    const { data: doc, error: docErr } = await supabase
      .from("curriculum_documents")
      .select("id, subject_id, structured_index")
      .eq("id", document_id)
      .single();
    if (docErr || !doc) throw new Error(docErr?.message || "doc not found");
    const struct: any = (doc as any).structured_index;
    if (!struct || !Array.isArray(struct.units)) throw new Error("document has no structured_index yet — run indexing first");

    // Resolve subject name
    let subjectName = "General";
    let subjectId = doc.subject_id;
    if (doc.subject_id) {
      const { data: subj } = await supabase.from("subjects").select("name").eq("id", doc.subject_id).maybeSingle();
      subjectName = (subj as any)?.name ?? subjectName;
    }

    const qualification = struct.qualification || "o_level";

    // Flatten units→lessons→topics up to max_topics
    const flatTopics: Array<{ unitTitle: string; topic: Topic }> = topics_chunk || [];
    if (!topics_chunk || flatTopics.length === 0) {
      for (const u of (struct.units || []) as Unit[]) {
        if (u.lessons && u.lessons.length > 0) {
          for (const l of u.lessons) {
            if (l.topics && l.topics.length > 0) {
              for (const tp of l.topics) {
                flatTopics.push({ unitTitle: u.title, topic: tp });
                if (flatTopics.length >= max_topics) break;
              }
            } else {
              // If no topics mapped, treat the lesson as the topic for generation
              flatTopics.push({ unitTitle: u.title, topic: { title: l.title } as Topic });
            }
            if (flatTopics.length >= max_topics) break;
          }
        }
        if (u.topics && flatTopics.length < max_topics) {
          for (const tp of u.topics) {
            flatTopics.push({ unitTitle: u.title, topic: tp });
            if (flatTopics.length >= max_topics) break;
          }
        }
        if (flatTopics.length >= max_topics) break;
      }
    }

    const promises = flatTopics.map(async ({ unitTitle, topic }) => {
      let resolvedUnitId = null;
      let resolvedTopicId = null;
      if (subjectId) {
        const { data: unitData } = await supabase.from("units").select("id").eq("subject_id", subjectId).ilike("title", `%${unitTitle}%`).limit(1).maybeSingle();
        if (unitData) {
          resolvedUnitId = unitData.id;
          const { data: topicData } = await supabase.from("topics").select("id").eq("unit_id", resolvedUnitId).ilike("title", `%${topic.title}%`).limit(1).maybeSingle();
          if (topicData) resolvedTopicId = topicData.id;
        }
      }

      // Check for existing questions if topic is resolved
      if (resolvedTopicId) {
        const { count } = await supabase.from("quiz_questions")
          .select("id", { count: "exact", head: true })
          .eq("topic_id", resolvedTopicId)
          .eq("is_rejected", false);
        
        if (count && count >= per_topic) {
          console.log(`Topic ${topic.title} already has ${count} questions. Skipping.`);
          return 0; // Skip generating if already sufficient questions
        }
      }

      const topicOutline = `
- Unit: ${unitTitle}
- Topic: ${topic.title}
- Subtopics: ${(topic.subtopics ?? []).join("; ")}
- Key concepts: ${(topic.key_concepts ?? []).join("; ")}
- Learning outcomes: ${(topic.learning_outcomes ?? []).join("; ")}
- Skills: ${(topic.skills ?? []).join("; ")}
`;

      const config: QuestionEngineConfig = {
        supabase,
        openRouterKey: OPENROUTER_API_KEY,
        openAiKey: OPENAI_API_KEY,
        scope: {
          subjectId: subjectId,
          subjectName: subjectName,
          unitId: resolvedUnitId || undefined,
          unitTitle: unitTitle,
          topicId: resolvedTopicId || undefined,
        },
        request: {
          count: per_topic,
          topicOutline,
          forceGenerate: true
        }
      };

      try {
        const qs = await QuestionEngine.generate(config);
        if (qs.length > 0) {
          const { error } = await supabase.from("quiz_questions").insert(qs);
          if (error) {
            console.error("Failed to insert questions for topic", topic.title, error);
            return 0;
          }
        }
        return qs.length;
      } catch (err) {
        console.error("QuestionEngine failed for topic", topic.title, err);
        return 0;
      }
    });

    const results = await Promise.all(promises);
    const totalInserted = results.reduce((a, b) => a + b, 0);

    return new Response(
      JSON.stringify({ ok: true, topics: flatTopics.length, inserted: totalInserted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("generate-curriculum-quizzes error", e);
    return new Response(
      JSON.stringify({ error: String((e as Error)?.message || e) }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
