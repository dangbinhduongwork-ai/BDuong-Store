// Supabase Edge Function: sepay-webhook
// Nhận Webhook từ SePay khi tài khoản MBBank nhận tiền và tự động trả hàng
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = await req.json();

    // SePay payload format:
    // {
    //   "id": 12345,
    //   "gateway": "MBBank",
    //   "transactionDate": "2026-10-31 22:30:00",
    //   "accountNumber": "2222226062005",
    //   "code": null,
    //   "content": "BDUONG1024 thanh toan",
    //   "transferType": "in",
    //   "transferAmount": 29000,
    //   "referenceCode": "MB123456"
    // }

    const content = (body.content || '').toUpperCase();
    const transferAmount = Number(body.transferAmount || 0);

    // Extract Order Code: BDUONG followed by alphanumeric characters
    const match = content.match(/BDUONG[A-Z0-9]+/);
    if (!match) {
      return new Response(JSON.stringify({ success: false, message: 'No BDuong order code found' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const orderCode = match[0];

    // Find pending order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_code', orderCode)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ success: false, message: 'Order not found' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (order.status === 'completed') {
      return new Response(JSON.stringify({ success: true, message: 'Already completed' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Call atomic RPC delivery
    const { data: deliveryResult, error: deliverError } = await supabase.rpc('deliver_order', {
      p_order_code: orderCode,
    });

    return new Response(JSON.stringify({ success: true, result: deliveryResult }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

