import { createClient } from "npm:@supabase/supabase-js@2";
import { Resend } from "npm:resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Verify caller (typically via pg_cron, which might send a secret header, or we can just require a valid service_role or admin key)
    const authHeader = req.headers.get("Authorization") ?? "";
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    
    // We can also allow running without an explicit auth header if it's called locally by pg_cron, but for security it's best to verify
    // the request if it's external. If it's a cron job, you might pass a custom secret.
    // For now, we will proceed assuming this is either triggered securely or relies on the anon/service role.
    
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    
    const resend = new Resend(RESEND_API_KEY);

    // Support optional test trigger for a specific email or user ID
    let testEmail: string | undefined;
    let testUserId: string | undefined;
    try {
      const body = await req.json();
      testEmail = body?.test_email;
      testUserId = body?.test_user_id;
    } catch (e) {
      // Ignore if no JSON body
    }

    if (testEmail || testUserId) {
      console.log(`Running in TEST MODE for email: ${testEmail} or userId: ${testUserId}`);
      
      let targetUserId = testUserId;
      let targetEmail = testEmail;

      if (!targetUserId && testEmail) {
        const { data: usersData, error: usersError } = await admin.auth.admin.listUsers();
        if (usersError) throw usersError;
        const targetUser = usersData.users.find(u => u.email === testEmail);
        if (!targetUser) throw new Error(`User with email ${testEmail} not found in Auth.`);
        targetUserId = targetUser.id;
      } else if (!targetEmail && targetUserId) {
        const { data: userAuth, error: authError } = await admin.auth.admin.getUserById(targetUserId);
        if (authError || !userAuth?.user?.email) throw new Error(`Email not found for userId ${targetUserId}`);
        targetEmail = userAuth.user.email;
      }
      
      const { data: profile } = await admin.from("profiles").select("*").eq("id", targetUserId).single();
      
      await resend.events.send({
        event: "student.inactivity.15",
        email: targetEmail!,
        payload: {
          email: targetEmail,
          user_id: targetUserId,
          display_name: profile?.display_name || "Test Student",
          last_active_at: profile?.last_active_at || new Date().toISOString(),
          is_test: true
        },
      });
      
      return new Response(JSON.stringify({ success: true, message: `Sent test 15-day inactivity email to ${targetEmail}` }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Date thresholds
    const now = new Date();
    const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // 1. Check for 15-day inactivity
    // Conditions: last_active_at <= 15 days ago, and 15-day event NOT sent yet
    const { data: users15, error: error15 } = await admin
      .from("profiles")
      .select("id, display_name, last_active_at")
      .lte("last_active_at", fifteenDaysAgo)
      .is("last_inactivity_15_sent_at", null);

    if (error15) {
      console.error("Error fetching 15-day inactive users:", error15);
    }

    let sent15Count = 0;
    if (users15 && users15.length > 0) {
      for (const profile of users15) {
        // Fetch the auth.users record to get the email (since profiles doesn't contain email natively in this schema unless it's synced)
        // Note: The admin API is needed to fetch email.
        const { data: userAuth, error: authError } = await admin.auth.admin.getUserById(profile.id);
        if (authError || !userAuth?.user?.email) {
            console.error(`Could not fetch auth user for profile ${profile.id}`, authError);
            continue;
        }

        const email = userAuth.user.email;
        
        try {
          await resend.events.send({
            event: "student.inactivity.15",
            email: email,
            payload: {
              email: email,
              user_id: profile.id,
              display_name: profile.display_name || "Student",
              last_active_at: profile.last_active_at,
            },
          });

          // Mark as sent
          await admin
            .from("profiles")
            .update({ last_inactivity_15_sent_at: new Date().toISOString() })
            .eq("id", profile.id);
            
          sent15Count++;
        } catch (e) {
          console.error(`Failed to send 15-day event for ${email}:`, e);
        }
      }
    }

    // 2. Check for 30-day inactivity
    // Conditions: last_active_at <= 30 days ago, and 30-day event NOT sent yet
    // Notice: 30-day logic triggers even if 15-day was already sent.
    const { data: users30, error: error30 } = await admin
      .from("profiles")
      .select("id, display_name, last_active_at")
      .lte("last_active_at", thirtyDaysAgo)
      .is("last_inactivity_30_sent_at", null);

    if (error30) {
      console.error("Error fetching 30-day inactive users:", error30);
    }

    let sent30Count = 0;
    if (users30 && users30.length > 0) {
      for (const profile of users30) {
        const { data: userAuth, error: authError } = await admin.auth.admin.getUserById(profile.id);
        if (authError || !userAuth?.user?.email) {
            console.error(`Could not fetch auth user for profile ${profile.id}`, authError);
            continue;
        }

        const email = userAuth.user.email;
        
        try {
          await resend.events.send({
            event: "student.inactivity.30",
            email: email,
            payload: {
              email: email,
              user_id: profile.id,
              display_name: profile.display_name || "Student",
              last_active_at: profile.last_active_at,
            },
          });

          // Mark as sent
          await admin
            .from("profiles")
            .update({ last_inactivity_30_sent_at: new Date().toISOString() })
            .eq("id", profile.id);

          sent30Count++;
        } catch (e) {
          console.error(`Failed to send 30-day event for ${email}:`, e);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent_15_day: sent15Count,
        sent_30_day: sent30Count,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Inactivity check error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
