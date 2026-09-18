import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const ABSTRACT_EMAIL_KEY = Deno.env.get("ABSTRACT_EMAIL_KEY");
const ABSTRACT_IP_KEY = Deno.env.get("ABSTRACT_IP_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    // Only process INSERT webhooks (or manual invocations structured like them)
    if (payload.type !== "INSERT" || payload.table !== "student_referrals") {
      return new Response("Not an INSERT on student_referrals", { status: 200, headers: corsHeaders });
    }

    const record = payload.record;
    if (!record.referred_id) {
      return new Response("Missing referred_id", { status: 200, headers: corsHeaders });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Fetch user's email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(record.referred_id);
    if (userError || !userData.user) {
      console.error("Failed to fetch user email", userError);
      return new Response("User not found", { status: 404, headers: corsHeaders });
    }

    const email = userData.user.email;
    const ip = record.referred_ip;

    let riskScore = 0;
    const riskDetails: string[] = [];

    // 2. Validate Email
    if (ABSTRACT_EMAIL_KEY && email) {
      try {
        const emailRes = await fetch(`https://emailvalidation.abstractapi.com/v1/?api_key=${ABSTRACT_EMAIL_KEY}&email=${email}`);
        const emailData = await emailRes.json();
        
        if (emailData.is_disposable_email?.value === true) {
          riskScore += 50;
          riskDetails.push("Disposable email detected");
        }
        if (emailData.deliverability === "UNDELIVERABLE") {
          riskScore += 20;
          riskDetails.push("Undeliverable email");
        }
        if (emailData.is_free_email?.value === true) {
          // A bit of risk for free emails, maybe 5
          riskScore += 5;
          riskDetails.push("Free email provider");
        }
      } catch (e) {
        console.error("Email validation failed:", e);
      }
    } else if (!ABSTRACT_EMAIL_KEY) {
      console.log("Skipping email validation: ABSTRACT_EMAIL_KEY not set.");
    }

    // 3. Validate IP
    if (ABSTRACT_IP_KEY && ip) {
      try {
        // sometimes x-forwarded-for has multiple IPs, take the first one
        const cleanIp = ip.split(',')[0].trim();
        const ipRes = await fetch(`https://ipgeolocation.abstractapi.com/v1/?api_key=${ABSTRACT_IP_KEY}&ip_address=${cleanIp}`);
        const ipData = await ipRes.json();
        
        if (ipData.security?.is_vpn === true) {
          riskScore += 40;
          riskDetails.push("VPN or Proxy detected");
        }
      } catch (e) {
        console.error("IP validation failed:", e);
      }
    } else if (!ABSTRACT_IP_KEY) {
      console.log("Skipping IP validation: ABSTRACT_IP_KEY not set.");
    }

    // 4. Cap risk score at 100
    riskScore = Math.min(riskScore, 100);

    // 5. Update the referral record
    const { error: updateError } = await supabase
      .from("student_referrals")
      .update({
        risk_score: riskScore,
        risk_details: riskDetails
      })
      .eq("id", record.id);

    if (updateError) {
      console.error("Failed to update risk score", updateError);
      return new Response("Update failed", { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: true, riskScore }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error evaluating referral risk:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
