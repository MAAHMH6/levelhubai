// Sends bulk notification emails to all users via Resend gateway.
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { subject, html, unit_id, subject_id } = await req.json();
    if (!subject || !html) {
      return new Response(JSON.stringify({ error: 'subject and html required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Auth: verify caller is admin
    const authHeader = req.headers.get('Authorization') ?? '';
    const anon = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await anon.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: isAdmin } = await admin.rpc('has_role', {
      _user_id: userData.user.id, _role: 'admin',
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const RESEND = Deno.env.get('RESEND_API_KEY');
    if (!RESEND) {
      return new Response(JSON.stringify({ error: 'Resend not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // List all users (paginate)
    const emails: string[] = [];
    let page = 1;
    const perPage = 1000;
    while (true) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) throw error;
      for (const u of data.users) if (u.email) emails.push(u.email);
      if (data.users.length < perPage) break;
      page++;
      if (page > 20) break; // safety
    }

    if (emails.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: 'no users' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Resend accepts up to 50 recipients per request when using BCC.
    // Send in batches via bcc so recipients don't see each other.
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];
    const batchSize = 50;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND}`,
        },
        body: JSON.stringify({
          from: 'LevelHubAI <onboarding@resend.dev>',
          to: ['onboarding@resend.dev'],
          bcc: batch,
          subject,
          html,
        }),
      });
      if (r.ok) {
        sent += batch.length;
      } else {
        failed += batch.length;
        errors.push(`Batch ${i}: ${r.status} ${await r.text()}`);
      }
    }

    return new Response(JSON.stringify({ sent, failed, total: emails.length, errors }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
