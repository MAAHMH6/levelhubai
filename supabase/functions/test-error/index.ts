import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let supabase: any;
  let document_id: string = "";

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const reqData = await req.json();
    document_id = reqData.document_id;
    if (!document_id) throw new Error("Missing document_id");

    const { data: doc, error: docErr } = await supabase
      .from("curriculum_documents")
      .select("*")
      .eq("id", document_id)
      .single();
    if (docErr || !doc) throw new Error(docErr?.message || "doc not found");

    return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
  } catch (e: any) {
    if (document_id && supabase) {
      // This line is EXACTLY what is in index-curriculum-doc:
      await supabase.from("index_job_logs").insert({ document_id, step: "error", message: "err", status: "error" }).catch(() => {});
      await supabase.from("curriculum_documents").update({ index_error: e.message }).eq("id", document_id);
    }
    return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 200, headers: corsHeaders });
  }
});
