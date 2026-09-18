// Paddle Billing webhook. Verifies HMAC-SHA256 signature and upserts subscription/payment rows.
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const raw = await req.text();
  const sigHeader = req.headers.get('paddle-signature') ?? '';
  const secret = Deno.env.get('PADDLE_WEBHOOK_SECRET');
  if (!secret) return new Response('missing secret', { status: 500 });

  const ok = await verify(sigHeader, raw, secret);
  if (!ok) {
    console.error('Invalid Paddle signature');
    return new Response('bad signature', { status: 401 });
  }

  const evt = JSON.parse(raw);
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    const type = evt.event_type as string;
    const data = evt.data ?? {};
    const userId = data?.custom_data?.user_id
      ?? evt?.data?.subscription?.custom_data?.user_id
      ?? null;

    if (type.startsWith('subscription.')) {
      await handleSubscription(supabase, type, data, userId);
    } else if (type.startsWith('transaction.')) {
      await handleTransaction(supabase, type, data, userId);
    }

    await supabase.from('billing_audit_logs').insert({
      event: type,
      target_user_id: userId,
      metadata: { paddle_event_id: evt.event_id ?? null },
    });

    // Fire-and-forget email
    fireEmail(supabase, type, data, userId).catch((e) => console.error('email', e));

    return new Response('ok', { headers: cors });
  } catch (e) {
    console.error('webhook handler error', e);
    return new Response('error', { status: 500 });
  }
});

async function handleSubscription(sb: any, type: string, d: any, userId: string | null) {
  const custom = d?.custom_data ?? {};
  const uid = userId ?? custom.user_id;
  if (!uid) return;

  const status = mapSubStatus(d?.status, type);
  const currentPeriodEnd = d?.current_billing_period?.ends_at ?? d?.next_billed_at ?? null;

  await sb.from('subscriptions').upsert({
    user_id: uid,
    plan: 'pro',
    status,
    provider: 'paddle',
    provider_subscription_id: d?.id,
    provider_customer_id: d?.customer_id,
    billing_cycle: d?.billing_cycle?.interval ?? 'monthly',
    started_at: d?.started_at ?? new Date().toISOString(),
    current_period_end: currentPeriodEnd,
    cancelled_at: d?.canceled_at ?? null,
    cancel_at: d?.scheduled_change?.effective_at ?? null,
    metadata: { last_event: type },
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
}

function mapSubStatus(paddleStatus: string | undefined, type: string): string {
  if (type === 'subscription.canceled') return 'cancelled';
  if (type === 'subscription.paused') return 'past_due';
  switch (paddleStatus) {
    case 'active': return 'active';
    case 'trialing': return 'trialing';
    case 'past_due': return 'past_due';
    case 'paused': return 'past_due';
    case 'canceled': return 'cancelled';
    default: return 'active';
  }
}

async function handleTransaction(sb: any, type: string, d: any, userId: string | null) {
  const uid = userId ?? d?.custom_data?.user_id;
  if (!uid) return;
  const status = type === 'transaction.completed'
    ? 'succeeded'
    : type === 'transaction.payment_failed'
      ? 'failed'
      : 'pending';
  const total = d?.details?.totals?.total ?? d?.details?.totals?.grand_total ?? '0';
  const currency = d?.currency_code ?? 'PKR';

  // Look up local subscription id (best-effort)
  let subId: string | null = null;
  if (d?.subscription_id) {
    const { data: sub } = await sb.from('subscriptions')
      .select('id')
      .eq('provider_subscription_id', d.subscription_id)
      .maybeSingle();
    subId = sub?.id ?? null;
  }

  await sb.from('payments').upsert({
    user_id: uid,
    subscription_id: subId,
    provider: 'paddle',
    provider_transaction_id: d?.id,
    invoice_number: d?.invoice_number ?? null,
    amount_cents: Number(total) || 0,
    currency,
    status,
    receipt_url: d?.checkout?.url ?? null,
    paid_at: d?.billed_at ?? d?.updated_at ?? new Date().toISOString(),
    metadata: { last_event: type },
  }, { onConflict: 'provider_transaction_id' });

  // Handle Commissions for Teacher Partners
  if (status === 'succeeded' && Number(total) > 0) {
    const { data: paymentRow } = await sb.from('payments').select('id').eq('provider_transaction_id', d?.id).maybeSingle();
    
    if (paymentRow) {
      // Check if user was referred
      const { data: referral } = await sb.from('referrals').select('id, teacher_id').eq('student_id', uid).maybeSingle();
      
      if (referral) {
        // Fetch commission percentage
        const { data: setting } = await sb.from('app_settings').select('value').eq('id', 'teacher_commission_percent').maybeSingle();
        const percent = setting ? Number(setting.value) : 10;
        const commissionAmount = Math.floor(Number(total) * (percent / 100));

        // Insert commission if it doesn't already exist for this payment
        await sb.from('commissions').upsert({
          teacher_id: referral.teacher_id,
          referral_id: referral.id,
          payment_id: paymentRow.id,
          amount: commissionAmount,
          status: 'pending' // Admin must approve later
        }, { onConflict: 'payment_id' });
      }
    }
  }
}

async function fireEmail(sb: any, type: string, d: any, userId: string | null) {
  const tmpl = ({
    'subscription.created': 'welcome-pro',
    'subscription.canceled': 'cancelled',
    'transaction.completed': 'payment-succeeded',
    'transaction.payment_failed': 'payment-failed',
  } as Record<string, string>)[type];
  if (!tmpl || !userId) return;
  const url = `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-billing-email`;
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
    },
    body: JSON.stringify({ template: tmpl, user_id: userId, data: d }),
  });
}

async function verify(header: string, body: string, secret: string): Promise<boolean> {
  // Paddle signature format: ts=xxx;h1=hex
  const parts = Object.fromEntries(header.split(';').map((p) => p.split('=') as [string, string]));
  const ts = parts.ts;
  const h1 = parts.h1;
  if (!ts || !h1) return false;
  const signed = `${ts}:${body}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signed));
  const hex = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
  return timingSafeEqual(hex, h1);
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
