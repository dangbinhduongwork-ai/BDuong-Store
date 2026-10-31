export interface SepayTransaction {
  id: number | string;
  bank_brand_name: string;
  account_number: string;
  transaction_date: string;
  amount_in: number | string;
  amount_out: number | string;
  accumulated: number | string;
  transaction_content: string;
  reference_number: string;
  code?: string;
}

export interface VerificationResult {
  paid: boolean;
  transactionId?: string;
  amount?: number;
  message?: string;
}

/**
 * Check payment status against SePay.
 * Hỗ trợ đa kênh tránh lỗi CORS tuyệt đối:
 * 1. Gọi qua Vercel API Route /api/check-payment
 * 2. Gọi qua Proxy /api/sepay/transactions/list
 * 3. Gọi trực tiếp https://my.sepay.vn/userapi/transactions/list
 */
export async function verifyPaymentWithSepay(
  apiToken: string,
  orderCode: string,
  expectedAmount: number
): Promise<VerificationResult> {
  const cleanToken = (apiToken || '').replace(/^(Apikey|Bearer)\s+/i, '').trim();
  if (!cleanToken) {
    return { paid: false, message: 'Chưa cấu hình SePay API Token' };
  }

  const targetCode = orderCode.trim().toUpperCase().replace(/\s+/g, '');

  // 1. First attempt: call local/serverless endpoint /api/check-payment (Zero CORS)
  try {
    const res = await fetch(`/api/check-payment?orderCode=${encodeURIComponent(targetCode)}&expectedAmount=${expectedAmount}`, {
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.paid) {
        return data as VerificationResult;
      }
    }
  } catch (e) {
    // If not on Vercel, fallback to proxy or direct
  }

  // 2. Second attempt: call via proxy /api/sepay/transactions/list or direct SePay API
  const endpoints = [
    '/api/sepay/transactions/list?limit=20',
    'https://my.sepay.vn/userapi/transactions/list?limit=20',
  ];

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cleanToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) continue;

      const data = await response.json();
      const transactions: SepayTransaction[] = 
        (Array.isArray(data?.transactions) ? data.transactions : []) ||
        (Array.isArray(data?.messages) ? data.messages : []);

      for (const tx of transactions) {
        const rawContent = (tx.transaction_content || '').toUpperCase();
        const cleanContent = rawContent.replace(/\s+/g, '');
        const rawAmount = String(tx.amount_in || 0).replace(/,/g, '');
        const amountNumber = parseFloat(rawAmount) || 0;

        const hasCode =
          cleanContent.includes(targetCode) ||
          (tx.code && tx.code.toUpperCase().includes(targetCode));

        const hasAmount = amountNumber >= (expectedAmount - 1000);

        if (hasCode && hasAmount) {
          return {
            paid: true,
            transactionId: tx.reference_number || String(tx.id),
            amount: amountNumber,
            message: 'Đã nhận được tiền chuyển khoản thành công từ MBBank!',
          };
        }
      }

      return { paid: false, message: 'Đang tiếp tục chờ biến động số dư...' };
    } catch {
      // Continue to next endpoint
    }
  }

  return { paid: false, message: 'Đang kiểm tra biến động số dư MBBank...' };
}
