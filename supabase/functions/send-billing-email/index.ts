// Internal: sends templated billing emails via Resend gateway.
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const { template, user_id, data } = await req.json().catch(() => ({}));
  if (!template || !user_id) return new Response('bad', { status: 400 });

  const RESEND = Deno.env.get('RESEND_API_KEY');
  if (!RESEND) {
    console.log('Email skipped (no key):', template, user_id);
    return new Response('ok');
  }

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: userInfo } = await admin.auth.admin.getUserById(user_id);
  const email = userInfo?.user?.email;
  if (!email) return new Response('no email');

  const t = TEMPLATES[template as keyof typeof TEMPLATES];
  if (!t) return new Response('unknown template');
  const rendered = t(data ?? {});

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND}`,
    },
    body: JSON.stringify({
      from: 'LevelHubAI <onboarding@resend.dev>',
      to: [email], subject: rendered.subject, html: rendered.html,
    }),
  });
  return new Response(await r.text(), { status: r.status });
});

const SITE_URL = Deno.env.get('PRIMARY_SITE_URL') || 'https://igcse.co';

const TEMPLATES = {
  'welcome-pro': (_d: any) => ({
    subject: '🎉 Welcome to LevelHubAI Pro',
    html: `<h1>Welcome to Pro!</h1><p>All subjects, AI tutor and past papers are now unlocked. Time to dominate your O Levels.</p><p><a href="${SITE_URL}/dashboard">Open your dashboard</a></p>`,
  }),
  'payment-succeeded': (d: any) => ({
    subject: 'Payment received — thank you',
    html: `<h2>Payment received</h2><p>Amount: ${d?.currency_code ?? 'PKR'} ${d?.details?.totals?.total ?? ''}</p><p>Your subscription is active.</p>`,
  }),
  'payment-failed': (_d: any) => ({
    subject: '⚠️ Payment failed',
    html: `<h2>We couldn't process your payment</h2><p>Please update your payment method to keep Pro active.</p><p><a href="${SITE_URL}/billing">Manage billing</a></p>`,
  }),
  'cancelled': (_d: any) => ({
    subject: 'Subscription cancellation confirmed',
    html: `<h2>You're set</h2><p>Your Pro access remains until the end of the current period. Come back any time.</p>`,
  }),
} as const;
