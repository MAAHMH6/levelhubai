// Index a curriculum PDF: extract text, chunk, embed, and store in curriculum_chunks
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { extractText, getDocumentProxy } from "https://esm.sh/unpdf@0.12.1";
import { getAIConfig, AIConfiguration } from "../_shared/AIConfig.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};


const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CHUNK_SIZE = 900;
const CHUNK_OVERLAP = 120;

function chunkText(text: string): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const out: string[] = [];
  let i = 0;
  while (i < clean.length) {
    out.push(clean.slice(i, i + CHUNK_SIZE));
    i += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return out;
}

// Rubric / instruction phrases commonly found on Cambridge past-paper cover
// and instruction pages. Any line/segment containing these is dropped so the
// index only stores actual exam questions.
const RUBRIC_PATTERNS: RegExp[] = [
  /read these instructions first/i,
  /write your (name|centre number|candidate number)/i,
  /do not (use|write|open)/i,
  /you (must|may|will) (not )?(use|need|answer)/i,
  /answer all questions/i,
  /the (total )?(number of )?marks? (for this paper|is)/i,
  /calculator/i,
  /the insert contains/i,
  /at the end of the examination/i,
  /electronic calculator/i,
  /cambridge (assessment|international|igcse|o level)/i,
  /this document (has|consists of)/i,
  /dynamicpapers|papacambridge|xtremepape|pastpapers/i,
  /\[?turn over\]?/i,
  /blank page/i,
  /permission to reproduce/i,
  /general certificate/i,
  /soft clean eraser|soft pencil/i,
  /shade the correct/i,
  /rough working/i,
  /use black ink/i,
  /hb pencil/i,
];

function isRubric(text: string): boolean {
  const t = text.trim();
  if (t.length < 20) return true;
  return RUBRIC_PATTERNS.some((r) => r.test(t));
}

// For past papers: extract only the numbered questions from the joined text,
// dropping everything before question 1 (cover/instructions) and filtering
// out rubric-only segments. Returns array of { text, pageStart }.
function extractPastPaperQuestions(
  pages: string[],
): Array<{ text: string; page: number }> {
  const parts: Array<{ text: string; start: number }> = [];
  let joined = "";
  pages.forEach((p, idx) => {
    const t = (p || "").replace(/\r/g, "");
    parts.push({ text: t, start: joined.length });
    joined += t + "\n\n";
  });

  const pageForOffset = (off: number): number => {
    for (let i = parts.length - 1; i >= 0; i--) {
      if (off >= parts[i].start) return i + 1;
    }
    return 1;
  };

  const qRegex = /(^|\n)\s{0,4}(\d{1,2})[\.\)]?\s+(?=[A-Z(\[\"'])/g;

  const matches: Array<{ num: number; index: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = qRegex.exec(joined)) !== null) {
    matches.push({ num: parseInt(m[2], 10), index: m.index + m[1].length });
  }

  const kept: Array<{ num: number; index: number }> = [];
  let expected = 1;
  for (const mm of matches) {
    if (mm.num === expected || (kept.length > 0 && mm.num === kept[kept.length - 1].num + 1)) {
      kept.push(mm);
      expected = mm.num + 1;
    } else if (kept.length === 0 && mm.num === 1) {
      kept.push(mm);
      expected = 2;
    }
  }

  if (kept.length === 0) return [];

  const segments: Array<{ text: string; page: number }> = [];
  for (let i = 0; i < kept.length; i++) {
    const start = kept[i].index;
    const end = i + 1 < kept.length ? kept[i + 1].index : joined.length;
    const raw = joined.slice(start, end).trim();
    const filtered = raw
      .split("\n")
      .filter((ln) => {
        const t = ln.trim();
        if (!t) return false;
        return !RUBRIC_PATTERNS.some((r) => r.test(t));
      })
      .join("\n")
      .trim();
    if (filtered && filtered.length > 25 && !isRubric(filtered)) {
      segments.push({ text: filtered, page: pageForOffset(start) });
    }
  }
  return segments;
}

async function embedBatch(inputs: string[], aiConfig: AIConfiguration): Promise<number[][]> {
  const isDirectOpenAI = aiConfig.provider === "openai" || (aiConfig.openaiApiKey && !aiConfig.baseURL?.includes("openrouter"));
  
  const baseURL = isDirectOpenAI ? "https://api.openai.com/v1" : (aiConfig.baseURL || "https://openrouter.ai/api/v1");
  const sanitizedBaseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
  
  // Use openaiApiKey if it's an OpenAI model and the key is available, otherwise fallback to the primary apiKey
  const apiKey = isDirectOpenAI ? (aiConfig.openaiApiKey || aiConfig.apiKey) : aiConfig.apiKey;
  
  try {
    const res = await fetch(`${sanitizedBaseURL}/embeddings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: isDirectOpenAI ? aiConfig.embeddingsModel.replace("openai/", "") : aiConfig.embeddingsModel,
        input: inputs,
        dimensions: 1536,
      })
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(`Embedding API returned ${res.status}: ${t}`);
    }
    const json = await res.json();
    if (!json.data || !Array.isArray(json.data)) {
      throw new Error(`Invalid embedding response: ${JSON.stringify(json).slice(0, 200)}`);
    }
    return json.data.map((d: any) => d.embedding);
  } catch (error: any) {
    throw error;
  }
}

// Ask Lovable AI to produce a rich structured outline of a curriculum/syllabus
// document.
async function extractStructuredIndex(pages: string[], subjectHint: string | null, existingStructureHint: string | null, aiConfig: AIConfiguration): Promise<any | null> {
  // Syllabus outline is usually in the first few pages. Sending > 20 pages can cause 60s edge function timeouts.
  const pagesToUse = pages.length > 20 ? pages.slice(0, 20) : pages;
  const joined = pagesToUse.map((text, i) => `[PAGE ${i + 1}]\n${text}`).join("\n\n");

  // Gemini 2.0 Flash has a 1M token context window, so we can send the whole document.
  const MAX_CHARS = 3_000_000;
  const excerpt = joined.length > MAX_CHARS
    ? joined.slice(0, MAX_CHARS / 2) + "\n\n[...middle truncated...]\n\n" + joined.slice(-MAX_CHARS / 2)
    : joined;

  const prompt = `You are a Cambridge O-Level and IGCSE curriculum indexer.
Given the following syllabus / curriculum document text${subjectHint ? ` for the subject "${subjectHint}"` : ""},
extract a strictly grounded structured outline. NEVER invent content that is not present in the text.
The text contains markers like [PAGE 1]. Use these to accurately determine the start_page and end_page for each lesson.

${existingStructureHint ? `CRITICAL: An existing structure for this subject already exists in the database.
You MUST strictly use these exact Unit titles and Lesson titles whenever possible to avoid creating duplicates.
Existing Structure:
${existingStructureHint}` : ""}

Return JSON matching this TypeScript type exactly:

type StructuredIndex = {
  qualification: "o_level" | "igcse" | "both" | "unknown";
  subject_code: string | null;
  overview: string;
  units: Array<{
    title: string;
    lessons: Array<{
      title: string;
      start_page: number | null;
      end_page: number | null;
      topics: Array<{
        title: string;
        subtopics: string[];
      }>;
    }>;
  }>;
};

Rules:
- CRITICAL: You MUST return a valid JSON object matching the schema. NEVER return null.
- Base every item on the provided text. If a section is not present, use an empty array or empty string.
- Keep titles short and canonical (e.g. "Kinematics", not "Chapter 3 — kinematics of motion").
- CRITICAL: If the document appears to be a knowledge base, study guide, or question bank rather than a formal syllabus, DO YOUR BEST to group the content logically into "Units" and "Lessons" based on headers or themes.
- CRITICAL: If a Lesson contains learning objectives, concepts, or facts but does not have explicit "Topics", you MUST create a single default Topic inside that Lesson (e.g., named after the Lesson) and place the subtopics inside it. Do not leave the topics array empty if there is content in the lesson!
- Ensure page numbers are correct based on the [PAGE X] markers.
- STRICT RULE: Always use the exact existing Unit/Lesson titles provided in the Existing Structure if the content matches.

Document text:
"""
${excerpt}
"""`;

  const baseURL = aiConfig.baseURL || "https://openrouter.ai/api/v1";
  const sanitizedBaseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;

  const signal = AbortSignal.timeout(60000); // 45s timeout to allow paid models enough time but prevent edge function death (60s hard limit)

  let res: Response;
  try {
    res = await fetch(`${sanitizedBaseURL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${aiConfig.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: aiConfig.textModel,
        messages: [
          { role: "system", content: "You return only valid JSON. No markdown, no commentary." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
      }),
      signal,
    });
  } catch (error: any) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw new Error("AI call timed out. The model is too slow for this document size.");
    }
    throw error;
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`structured_index AI call failed: ${res.status} ${errText}`);
  }
  const json = await res.json();
  let content = json?.choices?.[0]?.message?.content;
  if (!content) throw new Error("structured_index AI returned empty content");
  const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) content = match[1];
  
  // Postgres JSONB rejects null characters (\u0000). Scrub them out before parsing.
  content = content.replace(/\u0000/g, "").replace(/\\u0000/g, "");

  try {
    const parsed = JSON.parse(content);
    if (!parsed || typeof parsed !== 'object') {
      console.warn("AI returned falsy or non-object structured_index, defaulting to empty structure");
      return { qualification: "unknown", subject_code: null, overview: "Fallback structure", units: [] };
    }
    if (!Array.isArray(parsed.units)) {
      parsed.units = [];
    }
    return parsed;
  } catch (e: any) {
    throw new Error(`structured_index JSON parse failed: ${e?.message}`);
  }
}


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let supabase: any;
  let document_id: string = "";

  try {
    const authHeader = req.headers.get("Authorization");
    // Use service role for admin tasks, but pass user token for RLS if needed.
    // We stick to SERVICE_KEY to ensure background updates (like structured_index) bypass RLS.
    supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
      global: { headers: { Authorization: authHeader || "" } },
    });

    const reqData = await req.json();
    document_id = reqData.document_id;
    const action = reqData.action || "full"; // "extract_structure", "embed_pages", "finalize", "full"
    const start_page = reqData.start_page || 1;
    const end_page = reqData.end_page || null; // if null, process all

    if (!document_id) throw new Error("Missing document_id");

    const aiConfig = await getAIConfig(supabase);

    const { data: doc, error: docErr } = await supabase
      .from("curriculum_documents")
      .select("*")
      .eq("id", document_id)
      .single();
    if (docErr || !doc) throw new Error(docErr?.message || "doc not found");

    const logProgress = async (step: string, message: string, status: string = 'info') => {
      console.log(`[${step}] ${message}`);
      try {
        await supabase.from("index_job_logs").insert({ document_id: document_id, step, message, status });
      } catch (e) {
        console.error("Failed to log progress", e);
      }
    };

    if (action === "extract_structure" || action === "full") {
      await supabase.from("index_job_logs").delete().eq("document_id", document_id);
      await supabase.from("curriculum_documents").update({ index_status: "processing", index_error: null }).eq("id", document_id);
      await logProgress("start", "Started indexing job...");
    }

    // Download PDF from storage
    if (!doc.storage_path) throw new Error("storage_path missing");
    let fileBytes: ArrayBuffer | null = null;
    
    // Small optimization: If action is "finalize", no need to download the PDF.
    if (action !== "finalize") {
      await logProgress("download", "Downloading PDF from storage...");
      const { data: file, error: dlErr } = await supabase.storage.from("curriculum-docs").download(doc.storage_path);
      if (dlErr || !file) throw new Error(dlErr?.message || "download failed");
      fileBytes = await file.arrayBuffer();
    }

    let pages: string[] = [];
    let totalPages: number | undefined;
    
    if (fileBytes) {
      const buffer = new Uint8Array(fileBytes);
      if (doc.storage_path.endsWith(".md") || doc.storage_path.endsWith(".txt") || doc.content_type?.includes("text")) {
        const text = new TextDecoder().decode(buffer);
        pages = text.split(/(?=\n#{1,2} )/);
        if (pages.length === 0 || (pages.length === 1 && !pages[0].trim())) {
          pages = [text];
        }
      } else {
        const pdf = await getDocumentProxy(buffer);
        const res = await extractText(pdf, { mergePages: false });
        totalPages = res.totalPages;
        pages = Array.isArray(res.text) ? res.text : [String(res.text)];
      }
    }

    const isPastPaper = doc.doc_type === "past_paper";
    const mapping_resolution = doc.mapping_resolution;
    
    let structuredIndex: any | null = doc.structured_index;

    // Load existing units and lessons first
    let existingUnits: any[] = [];
    let existingLessons: any[] = [];
    let existingTopics: any[] = [];

    function slugify(str: string) {
      return (str || "").toLowerCase().replace(/[^a-z0-9]+/g, '');
    }

    if (doc.subject_id) {
      const { data: eu } = await supabase.from("units").select("id, unit_number, title").eq("subject_id", doc.subject_id);
      existingUnits = eu || [];
      if (existingUnits.length > 0) {
        const { data: el } = await supabase.from("lessons").select("id, unit_id, lesson_number, title").in("unit_id", existingUnits.map(u => u.id));
        existingLessons = el || [];
        const { data: et } = await supabase.from("topics").select("id, lesson_id, name").eq("subject_id", doc.subject_id);
        existingTopics = et || [];
      }
    }

    let existingStructureHint: string | null = null;
    if (existingUnits.length > 0) {
      const hintLines = [];
      for (const u of existingUnits) {
        hintLines.push(`Unit: ${u.title}`);
        const uLessons = existingLessons.filter(l => l.unit_id === u.id);
        for (const l of uLessons) {
          hintLines.push(`  - Lesson: ${l.title}`);
        }
      }
      existingStructureHint = hintLines.join("\n");
    }

    // --- PHASE 1: EXTRACT STRUCTURE ---
    if (action === "extract_structure" || action === "full") {
      if (!isPastPaper && doc.subject_id) {
        const { data: subj } = await supabase.from("subjects").select("name").eq("id", doc.subject_id).maybeSingle();
        
        if (!structuredIndex && doc.allowed_external_ai === true) {
          await logProgress("ai_extract", `Requesting AI structured index...`);
          try {
            structuredIndex = await extractStructuredIndex(pages, subj?.name ?? null, existingStructureHint, aiConfig);
            await logProgress("ai_extract", `AI structured index extraction complete.`);
          } catch (aiErr: any) {
            await logProgress("ai_extract_error", `AI structured index failed: ${aiErr.message}`, "error");
            structuredIndex = null;
          }
        }

        // Post-process structured index to guarantee topics exist
        if (structuredIndex && Array.isArray(structuredIndex.units)) {
          for (const unit of structuredIndex.units) {
            if (Array.isArray(unit.lessons)) {
              for (const lesson of unit.lessons) {
                if (!lesson.topics || !Array.isArray(lesson.topics) || lesson.topics.length === 0) {
                  lesson.topics = [{ title: lesson.title || "Overview", subtopics: lesson.subtopics || [] }];
                }
              }
            }
          }
        }

        // Insert into DB (Units, Lessons, Topics)
        // (Existing units/lessons were already fetched above)
        if (structuredIndex && structuredIndex.units && Array.isArray(structuredIndex.units)) {
          // DRY RUN skipped. Auto-insertion mode active as per user request.

          // ACTUAL INSERTION
          let unitOrder = 0;
          for (const unit of structuredIndex.units) {
            let unitId = null;
            const unitRes = mapping_resolution?.units?.[unit.title];
            const match = existingUnits.find(u => slugify(u.title) === slugify(unit.title));
            if (match) unitId = match.id;
            else if (unitRes && unitRes !== "create") unitId = unitRes;

            if (!unitId) {
              const maxOrder = existingUnits.reduce((max, u) => Math.max(max, u.unit_number), -1);
              const { data: uData, error: uErr } = await supabase.from("units").insert({ subject_id: doc.subject_id, title: unit.title || "Untitled Unit", unit_number: maxOrder + 1 }).select("id").single();
              if (uErr) throw new Error(`Unit insert failed: ${uErr.message}`);
              unitId = uData.id;
              existingUnits.push({ id: unitId, unit_number: maxOrder + 1, title: unit.title || "Untitled Unit" });
            }
            unitOrder++;

            let lessonOrder = 0;
            if (Array.isArray(unit.lessons)) {
              for (const lesson of unit.lessons) {
                let lessonId = null;
                const lessonRes = mapping_resolution?.lessons?.[lesson.title];
                const lMatch = existingLessons.find(l => l.unit_id === unitId && slugify(l.title) === slugify(lesson.title));
                if (lMatch) lessonId = lMatch.id;
                else if (lessonRes && lessonRes !== "create") lessonId = lessonRes;

                if (!lessonId) {
                  const unitLessons = existingLessons.filter(l => l.unit_id === unitId);
                  const maxOrder = unitLessons.reduce((max, l) => Math.max(max, l.lesson_number), -1);
                  const { data: lData, error: lErr } = await supabase.from("lessons").insert({ unit_id: unitId, title: lesson.title || "Untitled Lesson", lesson_number: maxOrder + 1 }).select("id").single();
                  if (lErr) throw new Error(`Lesson append failed: ${lErr.message}`);
                  lessonId = lData.id;
                  existingLessons.push({ id: lessonId, unit_id: unitId, lesson_number: maxOrder + 1, title: lesson.title || "Untitled Lesson" });
                }
                lessonOrder++;

                let topicOrder = 0;
                if (Array.isArray(lesson.topics)) {
                  for (const topic of lesson.topics) {
                    const match = existingTopics.find(t => t.lesson_id === lessonId && slugify(t.name) === slugify(topic.title));
                    if (!match) {
                      const { data: tData, error: tErr } = await supabase.from("topics").insert({ subject_id: doc.subject_id, lesson_id: lessonId, name: topic.title || "Untitled Topic", order_index: topicOrder++ }).select("id").single();
                      if (tErr) throw new Error(`Topic insert failed: ${tErr.message}`);
                      existingTopics.push({ id: tData.id, lesson_id: lessonId, name: topic.title || "Untitled Topic" });
                    } else {
                      topicOrder++;
                    }
                  }
                }
              }
            }
          }
        }
      }

      await supabase.from("curriculum_chunks").delete().eq("document_id", document_id);
      
      await supabase.from("curriculum_documents").update({
        total_pages: totalPages ?? pages.length,
        ...(structuredIndex ? { structured_index: structuredIndex } : {}),
      }).eq("id", document_id);

      if (action === "extract_structure") {
        return new Response(JSON.stringify({ ok: true, total_pages: totalPages ?? pages.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // --- PHASE 2: EMBED PAGES ---
    if (action === "embed_pages" || action === "full") {
      let pageToLessonMap = new Map<number, { unit_id: string, lesson_id: string }>();
      
      // Re-fetch existing lessons and units for mapping pages if we just jumped into embed_pages
      let existingUnits: any[] = [];
      let existingLessons: any[] = [];
      if (!isPastPaper && doc.subject_id && structuredIndex) {
        function slugify(str: string) { return (str || "").toLowerCase().replace(/[^a-z0-9]+/g, ''); }
        const { data: eu } = await supabase.from("units").select("id, unit_number, title").eq("subject_id", doc.subject_id);
        existingUnits = eu || [];
        const { data: el } = await supabase.from("lessons").select("id, unit_id, lesson_number, title").in("unit_id", existingUnits.map(u => u.id));
        existingLessons = el || [];

        if (Array.isArray(structuredIndex.units)) {
          for (const unit of structuredIndex.units) {
             let unitId = null;
             const unitRes = mapping_resolution?.units?.[unit.title];
             const match = existingUnits.find(u => slugify(u.title) === slugify(unit.title));
             if (match) unitId = match.id;
             else if (unitRes && unitRes !== "create") unitId = unitRes;

             if (Array.isArray(unit.lessons) && unitId) {
               for (const lesson of unit.lessons) {
                 let lessonId = null;
                 const lessonRes = mapping_resolution?.lessons?.[lesson.title];
                 const lMatch = existingLessons.find(l => l.unit_id === unitId && slugify(l.title) === slugify(lesson.title));
                 if (lMatch) lessonId = lMatch.id;
                 else if (lessonRes && lessonRes !== "create") lessonId = lessonRes;

                 if (lessonId && unitId) {
                    const start = lesson.start_page ?? 1;
                    const end = lesson.end_page ?? pages.length;
                    for (let p = start; p <= end; p++) {
                      if (!pageToLessonMap.has(p)) pageToLessonMap.set(p, { unit_id: unitId, lesson_id: lessonId });
                    }
                 }
               }
             }
          }
        }
      }

      await logProgress("chunking", `Chunking pages ${start_page} to ${end_page || pages.length}...`);
      const records: Array<any> = [];
      let chunkIdx = 0; // note: across batches this resets to 0, which is fine since chunk_index isn't strictly unique across the whole doc unless needed. (wait, it's not a unique constraint).

      const ep = end_page || pages.length;
      const pagesToProcess = isPastPaper ? pages : pages.slice(start_page - 1, ep);

      if (isPastPaper) {
        const questions = extractPastPaperQuestions(pages);
        questions.forEach((q, qIdx) => {
          if (q.page < start_page || q.page > ep) return;
          const chunks = chunkText(q.text);
          chunks.forEach((c, partIdx) => {
            if (isRubric(c)) return;
            records.push({
              document_id, subject_id: doc.subject_id, chunk_index: chunkIdx++, page_number: q.page, chunk_text: c.replace(/\u0000/g, ""),
              metadata: { doc_type: doc.doc_type, year: doc.year, paper_number: doc.paper_number, source: doc.source_name, question_number: qIdx + 1, part_index: partIdx }
            });
          });
        });
      } else {
        pagesToProcess.forEach((pageText, pIdx) => {
          const pageNum = start_page + pIdx;
          const mapped = pageToLessonMap.get(pageNum);
          const chunks = chunkText(pageText);
          chunks.forEach((c) => {
            records.push({
              document_id, subject_id: doc.subject_id, unit_id: mapped?.unit_id || null, lesson_id: mapped?.lesson_id || null,
              chunk_index: chunkIdx++, page_number: pageNum, chunk_text: c.replace(/\u0000/g, ""),
              metadata: { doc_type: doc.doc_type, year: doc.year, paper_number: doc.paper_number, source: doc.source_name }
            });
          });
        });
      }

      if (records.length > 0) {
        await logProgress("embed", `Embedding ${records.length} chunks (pages ${start_page}-${ep})...`);
        let embeddings: number[][] | null = null;
        if (doc.allowed_external_ai === true) {
          embeddings = await embedBatch(records.map((r) => r.chunk_text), aiConfig);
        }

        const rows = records.map((r, j) => ({
          ...r,
          embedding: embeddings ? embeddings[j] : null,
          content_type: doc.content_type,
          allowed_external_ai: doc.allowed_external_ai ?? false,
          allowed_quiz_generation: doc.allowed_quiz_generation ?? false
        }));
        
        const { error: insErr } = await supabase.from("curriculum_chunks").insert(rows);
        if (insErr) throw new Error(`insert failed: ${insErr.message}`);
      }

      if (action === "embed_pages") {
        return new Response(JSON.stringify({ ok: true, chunks_inserted: records.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // --- PHASE 3: FINALIZE ---
    if (action === "finalize" || action === "full") {
      const { count } = await supabase.from("curriculum_chunks").select("*", { count: 'exact', head: true }).eq("document_id", document_id);
      
      await supabase.from("curriculum_documents").update({
        index_status: "indexed",
        total_chunks: count || 0
      }).eq("id", document_id);

      await logProgress("complete", `Finished indexing successfully (${count} chunks).`, "success");

      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e: any) {
    console.error("index-curriculum-doc error", e);
    if (document_id && supabase) {
      await supabase.from("index_job_logs").insert({ document_id, step: "error", message: String(e?.stack || e?.message || e), status: "error" }).then(() => {}).catch(() => {});
      await supabase.from("curriculum_documents").update({ index_status: "failed", index_error: String(e?.message || e) }).eq("id", document_id);
    }
    return new Response(
      JSON.stringify({ ok: false, error: String(e?.message || e), stack: String(e?.stack || "") }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
