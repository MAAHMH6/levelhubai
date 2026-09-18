// Sends a School plan sales enquiry via Resend.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const body = await req.json().catch(() => ({}));
  const { name, school, email, phone, message } = body ?? {};
  if (!name || !email || !school) return j({ error: 'Missing fields' }, 400);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: setting } = await admin.from('pricing_settings').select('value').eq('key', 'school_contact_email').maybeSingle();
  const to = (setting?.value as string) || 'sales@olevel.com.pk';

  const RESEND = Deno.env.get('RESEND_API_KEY');
  if (!RESEND) {
    console.log('School enquiry (no email configured):', body);
    return j({ ok: true, delivered: false });
  }

  const html = `
    <h2>New School Plan Enquiry</h2>
    <p><b>Name:</b> ${escape(name)}</p>
    <p><b>School:</b> ${escape(school)}</p>
    <p><b>Email:</b> ${escape(email)}</p>
    <p><b>Phone:</b> ${escape(phone ?? '')}</p>
    <p><b>Message:</b><br/>${escape(message ?? '')}</p>
  `;

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND}`,
    },
    body: JSON.stringify({
      from: 'LevelHubAI Sales <onboarding@resend.dev>',
      to: [to], reply_to: email,
      subject: `School plan enquiry — ${school}`, html,
    }),
  });
  const out = await r.json();
  return j({ ok: r.ok, resend: out });
});

function escape(s: string) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
function j(o: unknown, s = 200) {
  return new Response(JSON.stringify(o), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
