import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  
  try {
    // APG sends the IPN as a POST request, but the documentation states it includes a 'url' parameter
    // "www.sample.com/listener?url=https://sandbox.bankalfalah.com/HS/api/IPN/OrderStatus/123/000456/A10"
    const reqUrl = new URL(req.url);
    const targetUrl = reqUrl.searchParams.get('url');

    if (!targetUrl) {
      console.error("Missing 'url' parameter in IPN call.");
      return new Response('Missing url parameter', { status: 400 });
    }

    // Step 1: Make a GET call to the APG URL to inquire the transaction status
    const inquiryResp = await fetch(targetUrl, { method: 'GET' });
    if (!inquiryResp.ok) {
      console.error("Failed to inquire APG order status:", inquiryResp.status);
      return new Response('Failed to inquire status', { status: 500 });
    }

    const orderData = await inquiryResp.json();
    
    /* 
      orderData expected format:
      {
        "ResponseCode": "00", 
        "Description": "Success", 
        "MerchantId": "123",
        "StoreId": "000456",
        "TransactionTypeId": "1", 
        "TransactionReferenceNumber": "ALFA_xyz_12345",
        "OrderDateTime": "09-10-2019 12:55:39 AM", 
        "TransactionId": "1263781929", 
        "TransactionDateTime": "09-10-2019 12:55:57 AM", 
        "AccountNumber": "930003331234567", 
        "TransactionAmount": "10", 
        "MobileNumber": "03331234567", 
        "TransactionStatus": "Paid"
      }
    */

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Save the audit log
    await supabase.from('billing_audit_logs').insert({
      event: `alfa.ipn.${orderData.TransactionStatus}`,
      target_user_id: null,
      metadata: orderData,
    });

    if (orderData.TransactionStatus !== "Paid") {
      console.log("Transaction not paid, status:", orderData.TransactionStatus);
      return new Response('ok', { headers: corsHeaders });
    }

    // Extract user ID from TransactionReferenceNumber (e.g. ALFA_userId_timestamp)
    const ref = orderData.TransactionReferenceNumber || "";
    const parts = ref.split('_');
    let userId = null;
    if (parts.length >= 3 && parts[0] === 'ALFA') {
      userId = parts[1];
    }

    if (!userId) {
      console.error("Could not extract user_id from TransactionReferenceNumber:", ref);
      return new Response('ok', { headers: corsHeaders }); // Return OK so APG stops retrying
    }

    // Since Alfalah is a one-time payment, we set the period end to +30 days
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

    // Upsert subscription
    await supabase.from('subscriptions').upsert({
      user_id: userId,
      plan: 'pro',
      status: 'active',
      provider: 'alfa',
      provider_subscription_id: orderData.TransactionId, // Using the APG transaction ID as the sub ID
      billing_cycle: 'monthly',
      started_at: new Date().toISOString(),
      current_period_end: currentPeriodEnd.toISOString(),
      cancelled_at: null,
      cancel_at: null,
      metadata: { last_event: 'alfa.ipn.Paid' },
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    const { data: paymentRow } = await supabase.from('payments').upsert({
      user_id: userId,
      provider: 'alfa',
      provider_transaction_id: orderData.TransactionId,
      amount_cents: Number(orderData.TransactionAmount) * 100, 
      currency: 'PKR',
      status: 'succeeded',
      paid_at: new Date().toISOString(),
      metadata: { last_event: 'alfa.ipn.Paid' },
    }, { onConflict: 'provider_transaction_id' }).select('id').single();

    // Handle Commissions for Teacher Partners
    if (paymentRow) {
      const { data: referral } = await supabase.from('referrals').select('id, teacher_id').eq('student_id', userId).maybeSingle();
      
      if (referral) {
        const { data: setting } = await supabase.from('app_settings').select('value').eq('id', 'teacher_commission_percent').maybeSingle();
        const percent = setting ? Number(setting.value) : 10;
        const totalAmount = Number(orderData.TransactionAmount) * 100; // in cents
        const commissionAmount = Math.floor(totalAmount * (percent / 100));

        await supabase.from('commissions').upsert({
          teacher_id: referral.teacher_id,
          referral_id: referral.id,
          payment_id: paymentRow.id,
          amount: commissionAmount,
          status: 'pending'
        }, { onConflict: 'payment_id' });
      }
    }

    // Fire-and-forget email
    const emailUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-billing-email`;
    fetch(emailUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({ template: 'welcome-pro', user_id: userId, data: orderData }),
    }).catch(e => console.error('email failed', e));

    return new Response('ok', { headers: corsHeaders });

  } catch (e) {
    console.error('webhook handler error', e);
    return new Response('error', { status: 500 });
  }
});
