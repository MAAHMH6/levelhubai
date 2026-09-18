// Creates a Paddle transaction and returns the checkout URL for the Pro plan.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const PADDLE_ENV = Deno.env.get('PADDLE_ENVIRONMENT') ?? 'sandbox';
const PADDLE_API = PADDLE_ENV === 'production'
  ? 'https://api.paddle.com'
  : 'https://sandbox-api.paddle.com';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401);
    }
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: cErr } = await supabase.auth.getClaims(token);
    if (cErr || !claims?.claims) return json({ error: 'Unauthorized' }, 401);
    const userId = claims.claims.sub;
    const email = claims.claims.email as string | undefined;

    const apiKey = Deno.env.get('PADDLE_API_KEY');
    const reqBody = await req.json().catch(() => ({}));
    const requestedPriceId = reqBody.price_id;

    let priceId = Deno.env.get('PADDLE_PRO_PRICE_ID');
    
    // Validate requested dynamic price_id against the database
    if (requestedPriceId && requestedPriceId !== priceId) {
      const { data: pricingRow } = await supabase
        .from('country_pricing')
        .select('paddle_price_id')
        .eq('paddle_price_id', requestedPriceId)
        .eq('enabled', true)
        .maybeSingle();
        
      if (pricingRow?.paddle_price_id) {
        priceId = pricingRow.paddle_price_id;
      } else {
        return json({ error: 'Invalid or disabled price_id provided.' }, 400);
      }
    }

    if (!apiKey || !priceId) {
      return json({ error: 'Paddle not configured. Set PADDLE_API_KEY and PADDLE_PRO_PRICE_ID.' }, 500);
    }

    const origin = req.headers.get('origin') ?? Deno.env.get('PRIMARY_SITE_URL') ?? 'https://igcse.co';

    // Check for active referral
    let discountId = undefined;
    const { data: referral } = await supabase.from('referrals').select('id').eq('student_id', userId).maybeSingle();
    if (referral) {
      const { data: setting } = await supabase.from('app_settings').select('value').eq('id', 'paddle_student_discount_id').maybeSingle();
      if (setting?.value) discountId = setting.value;
    }

    // Create a transaction — Paddle returns a hosted checkout URL.
    const resp = await fetch(`${PADDLE_API}/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [{ price_id: priceId, quantity: 1 }],
        customer: email ? { email } : undefined,
        custom_data: { user_id: userId },
        discount_id: discountId,
        checkout: { url: `${origin}/billing?checkout=success` },
      }),
    });
    const body = await resp.json();
    if (!resp.ok) {
      console.error('Paddle create tx failed', resp.status, body);
      return json({ error: 'Failed to create checkout', details: body }, 500);
    }
    const checkoutUrl = body?.data?.checkout?.url;
    return json({ url: checkoutUrl, transaction_id: body?.data?.id });
  } catch (e) {
    console.error(e);
    return json({ error: String(e) }, 500);
  }
});

function json(o: unknown, status = 200) {
  return new Response(JSON.stringify(o), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
