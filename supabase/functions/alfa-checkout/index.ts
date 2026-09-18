import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { crypto } from "https://deno.land/std@0.208.0/crypto/mod.ts";

const ALFA_ENV = Deno.env.get('ALFA_ENVIRONMENT') ?? 'sandbox';
const ALFA_API_URL = ALFA_ENV === 'production'
  ? 'https://payments.bankalfalah.com/HS/HS/HS'
  : 'https://sandbox.bankalfalah.com/HS/HS/HS';

function json(o: unknown, status = 200) {
  return new Response(JSON.stringify(o), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Simple PKCS7 padding implementation
function padPKCS7(data: Uint8Array): Uint8Array {
  const blockSize = 16;
  const paddingLength = blockSize - (data.length % blockSize);
  const padded = new Uint8Array(data.length + paddingLength);
  padded.set(data);
  padded.fill(paddingLength, data.length);
  return padded;
}

// APG AES-128-CBC encryption logic as described in their documentation
async function encryptRequestHash(mapString: string, key1: string, key2: string): Promise<string> {
  // Convert strings to UTF-8
  const encoder = new TextEncoder();
  const data = encoder.encode(mapString);
  const key = encoder.encode(key1);
  const iv = encoder.encode(key2);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'AES-CBC', length: 128 },
    false,
    ['encrypt']
  );

  const paddedData = padPKCS7(data);

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
    cryptoKey,
    paddedData
  );

  // Convert to Base64
  // The documentation shows Base64 encoding implicitly in their JS implementation of CryptoJS.AES.encrypt 
  // which by default outputs Base64.
  const encryptedArray = new Uint8Array(encryptedBuffer);
  let binary = '';
  for (let i = 0; i < encryptedArray.byteLength; i++) {
    binary += String.fromCharCode(encryptedArray[i]);
  }
  return btoa(binary);
}

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
      { global: { headers: { Authorization: authHeader } } }
    );
    
    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: cErr } = await supabase.auth.getClaims(token);
    if (cErr || !claims?.claims) return json({ error: 'Unauthorized' }, 401);
    const userId = claims.claims.sub;

    const channelId = "1001";
    const merchantId = Deno.env.get('ALFA_MERCHANT_ID');
    const storeId = Deno.env.get('ALFA_STORE_ID');
    const merchantHash = Deno.env.get('ALFA_MERCHANT_HASH');
    const merchantUsername = Deno.env.get('ALFA_USERNAME');
    const merchantPassword = Deno.env.get('ALFA_PASSWORD');
    const key1 = Deno.env.get('ALFA_KEY1');
    const key2 = Deno.env.get('ALFA_KEY2');

    if (!merchantId || !storeId || !merchantHash || !merchantUsername || !merchantPassword || !key1 || !key2) {
      return json({ error: 'Alfa Payment Gateway is not configured.' }, 500);
    }

    const origin = req.headers.get('origin') ?? Deno.env.get('PRIMARY_SITE_URL') ?? 'https://olevel.com.pk';
    const returnUrl = `${origin}/alfa-return`;

    // Fetch the PK pricing from country_pricing table
    const { data: pricingRow } = await supabase
      .from('country_pricing')
      .select('monthly_price')
      .eq('country_code', 'PK')
      .eq('enabled', true)
      .maybeSingle();

    const price = pricingRow?.monthly_price ?? 5000;

    // Generate unique transaction reference (max 100 chars, usually alphanumeric)
    const transactionRef = `ALFA_${userId}_${Date.now()}`;

    // Create the map string exactly as specified in APG documentation Step 3
    // Note: Documentation has "MerchantHasho" typo in step 3 but it should be HS_MerchantHash based on parameters table.
    const mapString = `HS_ChannelId=${channelId}&HS_MerchantId=${merchantId}&HS_StoreId=${storeId}&HS_ReturnURL=${returnUrl}&HS_MerchantHash=${merchantHash}&HS_MerchantUsername=${merchantUsername}&HS_MerchantPassword=${merchantPassword}&HS_TransactionReferenceNumber=${transactionRef}`;

    // Encrypt it
    const requestHash = await encryptRequestHash(mapString, key1, key2);

    // Form body to POST to Alfalah
    const formBody = new URLSearchParams({
      HS_RequestHash: requestHash,
      HS_IsRedirectionRequest: "1", // 1 means handle auth token on the same page/process
      HS_ChannelId: channelId,
      HS_ReturnURL: returnUrl,
      HS_MerchantId: merchantId,
      HS_StoreId: storeId,
      HS_MerchantHash: merchantHash,
      HS_MerchantUsername: merchantUsername,
      HS_MerchantPassword: merchantPassword,
      HS_TransactionReferenceNumber: transactionRef
    });

    const resp = await fetch(ALFA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody,
    });

    const respText = await resp.text();
    let respData;
    try {
      respData = JSON.parse(respText);
    } catch (err) {
      console.error("APG Handshake failed (not JSON):", resp.status, respText);
      return json({ error: 'Failed to initiate Alfalah checkout (invalid response format).' }, 500);
    }

    if (respData.success !== "true" || !respData.AuthToken) {
      console.error("APG Handshake failed:", respData);
      return json({ error: 'Failed to initiate Alfalah checkout: ' + (respData.ErrorMessage || "Unknown") }, 500);
    }

    const authToken = respData.AuthToken;

    // Check for active referral discount
    let discountPercent = 0;
    const { data: referral } = await supabase.from('referrals').select('id').eq('student_id', userId).maybeSingle();
    if (referral) {
      const { data: setting } = await supabase.from('app_settings').select('value').eq('id', 'student_referral_discount_percent').maybeSingle();
      if (setting?.value) discountPercent = Number(setting.value);
    }
    
    const discountedPrice = Math.floor(price * (1 - discountPercent / 100));

    // Prepare Step 2 Parameters (without HS_ prefix)
    const fields: Record<string, string> = {
      AuthToken: authToken,
      ReturnURL: returnUrl,
      ChannelId: channelId,
      MerchantId: merchantId,
      StoreId: storeId,
      MerchantHash: merchantHash,
      MerchantUsername: merchantUsername,
      MerchantPassword: merchantPassword,
      TransactionTypeId: "3", // 3 is Credit/Debit Card
      TransactionReferenceNumber: transactionRef,
      TransactionAmount: discountedPrice.toString(),
      Currency: "PKR",
    };

    let step2MapString = "";
    for (const [k, v] of Object.entries(fields)) {
      step2MapString += `${k}=${v}&`;
    }
    step2MapString = step2MapString.substring(0, step2MapString.length - 1); // remove trailing &

    const requestHash2 = await encryptRequestHash(step2MapString, key1, key2);

    const ssoUrl = ALFA_ENV === 'production'
      ? 'https://payments.bankalfalah.com/SSO/SSO/SSO'
      : 'https://sandbox.bankalfalah.com/SSO/SSO/SSO';

    const alfaForm = {
      action: ssoUrl,
      fields: {
        ...fields,
        RequestHash: requestHash2,
      }
    };

    return json({ alfaForm });

  } catch (e) {
    console.error(e);
    return json({ error: String(e) }, 500);
  }
});
