import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("Webhook payload received:", payload);

    // Support both direct payload testing and Supabase Database Webhooks
    const record = payload.record || payload;
    const oldRecord = payload.old_record;
    
    // If triggered by a database webhook on auth.users, ensure we only send once when verified
    if (payload.type === 'UPDATE') {
      if (oldRecord?.email_confirmed_at || !record?.email_confirmed_at) {
        console.log("Email not newly verified, skipping.");
        return new Response(JSON.stringify({ message: "Not newly verified, skipped." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    const email = record.email;
    const displayName = record.raw_user_meta_data?.full_name || record.display_name || "Student";

    if (!email) {
      throw new Error("Missing email in payload");
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not set");
    }

    console.log(`Sending Resend event for user: ${email} (${displayName})`);

    // Call the Resend Automation Events endpoint
    const res = await fetch("https://api.resend.com/events/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        event: "user.verified",
        email: email,
        payload: {
          "user.email": email,
          "user.display_name": displayName,
          // Nested object structure (most template engines expect this for dot-notation)
          user: {
            email: email,
            display_name: displayName,
          }
        },
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Resend API error:", errorText);
      throw new Error(`Failed to send event: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log("Resend event sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
