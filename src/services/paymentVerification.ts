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
 * Check payment status directly against SePay Open API.
 * KHÔNG CẦN CÀI ĐẶT WEBHOOK, KHÔNG CẦN DEPLOY SERVER!
 * Tự động quét SePay qua Authorization: Bearer <TOKEN>
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

  try {
    const response = await fetch('https://my.sepay.vn/userapi/transactions/list?limit=20', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return { paid: false, message: `Lỗi kết nối SePay (${response.status})` };
    }

    const data = await response.json();
    const transactions: SepayTransaction[] = 
      (Array.isArray(data?.transactions) ? data.transactions : []) ||
      (Array.isArray(data?.messages) ? data.messages : []);

    const targetCode = orderCode.trim().toUpperCase().replace(/\s+/g, '');

    // Check each recent transaction
    for (const tx of transactions) {
      const rawContent = (tx.transaction_content || '').toUpperCase();
      const cleanContent = rawContent.replace(/\s+/g, '');
      const rawAmount = String(tx.amount_in || 0).replace(/,/g, '');
      const amountNumber = parseFloat(rawAmount) || 0;

      // Check if order code appears in the transfer message or code field
      const hasCode =
        cleanContent.includes(targetCode) ||
        (tx.code && tx.code.toUpperCase().includes(targetCode));

      // Check if received amount is at least expected amount
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
  } catch (error) {
    console.debug('Lỗi kết nối SePay:', error);
    return { paid: false, message: 'Không thể kết nối đến máy chủ SePay' };
  }
}
