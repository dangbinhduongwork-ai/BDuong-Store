export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { orderCode, expectedAmount } = req.query;
  const token = 
    process.env.VITE_SEPAY_API_TOKEN || 
    process.env.SEPAY_API_TOKEN || 
    req.headers.authorization?.replace(/^(Bearer|Apikey)\s+/i, '');

  if (!token) {
    return res.status(400).json({ paid: false, message: 'Missing SePay API Token' });
  }

  try {
    const response = await fetch('https://my.sepay.vn/userapi/transactions/list?limit=20', {
      headers: {
        'Authorization': `Bearer ${token.trim()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ paid: false, message: 'SePay response error' });
    }

    const data = await response.json();
    const transactions = Array.isArray(data?.transactions) ? data.transactions : (data?.messages || []);
    const targetCode = String(orderCode || '').toUpperCase().replace(/\s+/g, '');
    const amount = parseFloat(String(expectedAmount || '0')) || 0;

    for (const tx of transactions) {
      const content = String(tx.transaction_content || '').toUpperCase().replace(/\s+/g, '');
      const txAmount = parseFloat(String(tx.amount_in || '0').replace(/,/g, '')) || 0;

      const hasCode = 
        content.includes(targetCode) || 
        (tx.code && String(tx.code).toUpperCase().includes(targetCode));
        
      const hasAmount = txAmount >= (amount - 1000);

      if (hasCode && hasAmount) {
        return res.status(200).json({
          paid: true,
          transactionId: tx.reference_number || String(tx.id),
          amount: txAmount,
          message: 'Đã nhận được tiền chuyển khoản thành công từ MBBank!',
        });
      }
    }

    return res.status(200).json({ paid: false, message: 'Đang tiếp tục chờ biến động số dư...' });
  } catch (err) {
    return res.status(500).json({ paid: false, error: err.message });
  }
}
