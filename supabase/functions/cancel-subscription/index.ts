// User-initiated cancel at period end.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const PADDLE_ENV = Deno.env.get('PADDLE_ENVIRONMENT') ?? 'sandbox';
const PADDLE_API = PADDLE_ENV === 'production'
  ? 'https://api.paddle.com'
  : 'https://sandbox-api.paddle.com';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return j({ error: 'Unauthorized' }, 401);
  const anon = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: claims } = await anon.auth.getClaims(authHeader.replace('Bearer ', ''));
  if (!claims?.claims) return j({ error: 'Unauthorized' }, 401);
  const userId = claims.claims.sub;

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: sub } = await admin.from('subscriptions').select('*').eq('user_id', userId).maybeSingle();
  if (!sub?.provider_subscription_id) return j({ error: 'No active subscription' }, 400);

  const apiKey = Deno.env.get('PADDLE_API_KEY');
  if (!apiKey) return j({ error: 'Paddle not configured' }, 500);

  const r = await fetch(`${PADDLE_API}/subscriptions/${sub.provider_subscription_id}/cancel`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ effective_from: 'next_billing_period' }),
  });
  const body = await r.json();
  if (!r.ok) return j({ error: 'Cancel failed', details: body }, 500);

  await admin.from('subscriptions').update({
    cancel_at: body?.data?.scheduled_change?.effective_at ?? sub.current_period_end,
    updated_at: new Date().toISOString(),
  }).eq('id', sub.id);

  await admin.from('billing_audit_logs').insert({
    event: 'user.cancel_requested', actor_user_id: userId, target_user_id: userId,
  });

  return j({ ok: true });
});

function j(o: unknown, s = 200) {
  return new Response(JSON.stringify(o), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
