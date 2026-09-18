// Admin billing actions + stats.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return j({ error: 'Unauthorized' }, 401);
  const anon = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authError } = await anon.auth.getUser(authHeader.replace('Bearer ', ''));
  if (authError || !user) return j({ error: 'Unauthorized' }, 401);
  const actorId = user.id;

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: isAdmin } = await admin.rpc('has_role', { _user_id: actorId, _role: 'admin' });
  if (!isAdmin) return j({ error: 'Forbidden' }, 403);

  const { action, user_id, plan, days, started_at, current_period_end, status } = await req.json().catch(() => ({}));
  if (!action) return j({ error: 'Missing action' }, 400);

  if (action !== 'stats') {
    if (!user_id || typeof user_id !== 'string') return j({ error: 'Invalid user_id' }, 400);
  }

  switch (action) {
    case 'upsert_custom': {
      if (!plan || !['free', 'pro', 'school'].includes(plan)) return j({ error: 'Invalid plan' }, 400);
      if (!status || !['active', 'cancelled', 'past_due'].includes(status)) return j({ error: 'Invalid status' }, 400);
      const st = started_at ? new Date(started_at).toISOString() : new Date().toISOString();
      const ed = current_period_end ? new Date(current_period_end).toISOString() : null;
      const { error: upsertErr } = await admin.from('subscriptions').upsert({
        user_id, plan, status, provider: 'admin',
        started_at: st, current_period_end: ed,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      if (upsertErr) return j({ error: upsertErr.message }, 500);
      break;
    }
    case 'upgrade': {
      if (plan && !['free', 'pro', 'school'].includes(plan)) return j({ error: 'Invalid plan' }, 400);
      const p = plan ?? 'pro';
      const st = 'active';
      const period = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
      const { error: upgErr } = await admin.from('subscriptions').upsert({
        user_id, plan: p, status: st, provider: 'admin',
        started_at: new Date().toISOString(), current_period_end: period,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      if (upgErr) return j({ error: upgErr.message }, 500);
      break;
    }
    case 'downgrade': {
      const { error: downErr } = await admin.from('subscriptions').upsert({
        user_id, plan: 'free', status: 'active', provider: 'admin',
        started_at: new Date().toISOString(), current_period_end: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      if (downErr) return j({ error: downErr.message }, 500);
      break;
    }
    case 'extend': {
      const d = Number(days) || 30;
      if (d <= 0) return j({ error: 'Invalid days' }, 400);
      const { data: sub } = await admin.from('subscriptions').select('*').eq('user_id', user_id).maybeSingle();
      const base = sub?.current_period_end ? new Date(sub.current_period_end) : new Date();
      const next = new Date(base.getTime() + d * 24 * 3600 * 1000).toISOString();
      const { error: extErr } = await admin.from('subscriptions').update({
        current_period_end: next, status: 'active', updated_at: new Date().toISOString(),
      }).eq('user_id', user_id);
      if (extErr) return j({ error: extErr.message }, 500);
      break;
    }
    case 'cancel': {
      const { error: cancelErr } = await admin.from('subscriptions').update({
        status: 'cancelled', cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('user_id', user_id);
      if (cancelErr) return j({ error: cancelErr.message }, 500);
      break;
    }
    case 'stats': {
      // Manual stats calculation to avoid relying on unpushed RPC
      const { data: payments } = await admin.from('payments').select('amount_cents, paid_at').eq('status', 'succeeded');
      let totalRevenueCents = 0;
      let mrrCents = 0;
      const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
      
      for (const p of (payments || [])) {
        totalRevenueCents += p.amount_cents;
        if (new Date(p.paid_at).getTime() >= thisMonth) {
          mrrCents += p.amount_cents;
        }
      }

      const { count: free } = await admin.from('subscriptions').select('*', { count: 'exact', head: true }).eq('plan', 'free');
      const { count: pro } = await admin.from('subscriptions').select('*', { count: 'exact', head: true }).eq('plan', 'pro');
      const { count: school } = await admin.from('subscriptions').select('*', { count: 'exact', head: true }).eq('plan', 'school');
      const { count: active } = await admin.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active');

      return j({
        totalRevenueCents,
        mrrCents,
        counts: { free: free || 0, pro: pro || 0, school: school || 0, active: active || 0 }
      });
    }
    default:
      return j({ error: 'Unknown action' }, 400);
  }

  await admin.from('billing_audit_logs').insert({
    event: `admin.${action}`, actor_user_id: actorId, target_user_id: user_id,
    metadata: { plan, days },
  });
  return j({ ok: true });
});

function j(o: unknown, s = 200) {
  // Always return 200 so Supabase JS parses the JSON and we can read the actual error in the UI
  return new Response(JSON.stringify(o), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
