import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getAIConfig } from "../_shared/AIConfig.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // 1. Verify user is admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !user) throw new Error('Unauthorized');

    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || roleData?.role !== 'admin') {
      throw new Error('Forbidden: Admins only');
    }

    // 2. Parse request
    const { baseURL } = await req.json();

    // 3. Fetch secure AI config (which uses SERVICE_KEY internally to bypass RLS)
    const aiConfig = await getAIConfig(supabase);
    
    // Override base URL if provided in request, otherwise use config
    const targetBaseURL = baseURL || aiConfig.baseURL || "https://openrouter.ai/api/v1";
    
    // Ensure no trailing slash
    const sanitizedBaseURL = targetBaseURL.endsWith('/') ? targetBaseURL.slice(0, -1) : targetBaseURL;

    // 4. Fetch models from provider
    const res = await fetch(`${sanitizedBaseURL}/models`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${aiConfig.apiKey}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "Unknown error");
      throw new Error(`Provider returned ${res.status}: ${errText}`);
    }

    const data = await res.json();

    // Standardize output for UI
    return new Response(
      JSON.stringify({ ok: true, data: data.data || data }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (e: any) {
    console.error("get-ai-models error:", e);
    return new Response(
      JSON.stringify({ error: String(e.message || e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
