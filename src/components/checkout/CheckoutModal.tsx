import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { formatVND, generateOrderCode, getVietQRUrl, triggerConfetti } from '../../lib/utils';
import { verifyPaymentWithSepay } from '../../services/paymentVerification';
import { AppStore } from '../../lib/store';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { 
  X, 
  Copy, 
  Check, 
  Clock, 
  ShieldCheck, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  QrCode,
  Radio,
  Sparkles,
  Download,
  Mail
} from 'lucide-react';

interface CheckoutModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onViewOrders: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  product,
  isOpen,
  onClose,
  onViewOrders,
}) => {
  const { settings, user, createOrder, deliverOrder } = useStore();

  const [orderCode, setOrderCode] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAutoChecking, setIsAutoChecking] = useState(false);
  const [checkCount, setCheckCount] = useState(0);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [deliveredCredential, setDeliveredCredential] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins countdown
  const isDeliveredRef = useRef(false);

  // Initialize new order code when modal opens with a product
  useEffect(() => {
    if (isOpen && product) {
      const code = generateOrderCode();
      const initialEmail = user?.email || '';
      setOrderCode(code);
      setBuyerEmail(initialEmail);
      setDeliveredCredential(null);
      setPaymentError(null);
      setIsProcessing(false);
      setIsAutoChecking(true);
      setCheckCount(0);
      setTimeLeft(900);
      isDeliveredRef.current = false;

      // Create initial pending order
      createOrder({
        order_code: code,
        user_id: user?.id,
        customer_email: initialEmail || 'guest@bduongstore.com',
        product_id: product.id,
        product_name: product.name,
        amount: product.price,
        status: 'pending',
      });

      // Save order code to browser history so guest or user can track
      try {
        const localCodes: string[] = JSON.parse(localStorage.getItem('bduong_my_order_codes') || '[]');
        if (!localCodes.includes(code)) {
          localCodes.unshift(code);
          localStorage.setItem('bduong_my_order_codes', JSON.stringify(localCodes.slice(0, 30)));
        }
      } catch {
        // ignore
      }
    }
  }, [isOpen, product]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || deliveredCredential || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, deliveredCredential, timeLeft]);

  // AUTOMATED REAL-TIME PAYMENT CHECKING LOOP
  useEffect(() => {
    if (!isOpen || !product || !orderCode || deliveredCredential) return;

    const interval = setInterval(async () => {
      if (isDeliveredRef.current) return;
      setCheckCount((prev) => prev + 1);

      // 1. Check if SePay API Token is provided
      const sepayToken = 
        settings.sepay_api_token || 
        import.meta.env.VITE_SEPAY_API_TOKEN || 
        'NWWB8YFASXJODRPTTLPCDJYEIA95VZCFSPZYXSKGB1UOORHLEZMGBGXJ9WD3AZQ2';

      try {
        const res = await verifyPaymentWithSepay(sepayToken, orderCode, product.price);
        if (res.paid && !isDeliveredRef.current) {
          isDeliveredRef.current = true;
          setIsProcessing(true);
          const delivery = await deliverOrder(orderCode);
          setIsProcessing(false);
          if (delivery.success && delivery.credential) {
            setDeliveredCredential(delivery.credential);
            triggerConfetti();
          }
          return;
        }
      } catch (e) {
        console.debug('Error in auto payment check loop:', e);
      }

      // 2. Also check if order was completed via Webhook in Supabase / Local storage
      try {
        const orders = await AppStore.getOrders();
        const currentOrder = orders.find((o) => o.order_code === orderCode);
        if (currentOrder && currentOrder.status === 'completed' && !isDeliveredRef.current) {
          isDeliveredRef.current = true;
          setDeliveredCredential(currentOrder.delivered_credential || 'Đã kích hoạt thành công!');
          triggerConfetti();
        }
      } catch (e) {
        console.debug('Error checking order status:', e);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isOpen, product, orderCode, deliveredCredential, settings.sepay_api_token]);

  // SUPABASE REALTIME WEBHOOK LISTENER (Instant trigger within 100ms)
  useEffect(() => {
    if (!isOpen || !orderCode || !isSupabaseConfigured || !supabase || deliveredCredential) return;
    const client = supabase;

    const channel = client
      .channel(`realtime-order-${orderCode}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `order_code=eq.${orderCode}`,
        },
        (payload: any) => {
          if (payload.new && payload.new.status === 'completed' && !isDeliveredRef.current) {
            isDeliveredRef.current = true;
            setDeliveredCredential(payload.new.delivered_credential || 'Đã kích hoạt thành công!');
            triggerConfetti();
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [isOpen, orderCode, deliveredCredential]);

  if (!isOpen || !product) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleManualConfirm = async () => {
    setIsProcessing(true);
    setPaymentError(null);

    const sepayToken = 
      settings.sepay_api_token || 
      import.meta.env.VITE_SEPAY_API_TOKEN || 
      'NWWB8YFASXJODRPTTLPCDJYEIA95VZCFSPZYXSKGB1UOORHLEZMGBGXJ9WD3AZQ2';

    try {
      // 🔒 ĐỐI SOÁT SEPAY THẬT - BẢO MẬT TUYỆT ĐỐI KHÔNG GIAO BỪA KHI CHƯA NHẬN ĐƯỢC TIỀN
      const res = await verifyPaymentWithSepay(sepayToken, orderCode, product.price);
      if (res.paid) {
        isDeliveredRef.current = true;
        const delivery = await deliverOrder(orderCode);
        setIsProcessing(false);
        if (delivery.success && delivery.credential) {
          setDeliveredCredential(delivery.credential);
          triggerConfetti();
        } else {
          setDeliveredCredential(delivery.message || 'Đơn hàng đã được xác nhận thành công!');
          triggerConfetti();
        }
        return;
      }

      // NẾU CHƯA NHẬN ĐƯỢC TIỀN TỪ MBBANK: BÁO LỖI VÀ CHẶN LẠI!
      setIsProcessing(false);
      setPaymentError(
        `Hệ thống MBBank chưa nhận được biến động số dư cho mã đơn "${orderCode}" (${formatVND(product.price)}). Vui lòng đảm bảo bạn đã chuyển khoản đúng số tiền và nội dung, hoặc đợi 10-20 giây để ngân hàng gửi sao kê!`
      );
    } catch {
      setIsProcessing(false);
      setPaymentError(
        'Đang đối soát giao dịch với SePay. Nếu bạn đã chuyển khoản thành công, hệ thống sẽ tự động mở khóa sau vài giây!'
      );
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const bankId = settings.bank_id || 'MBBank';
  const bankAccount = settings.bank_account || '2222226062005';
  const bankOwner = settings.bank_owner || 'DANG BINH DUONG';

  const qrUrl = getVietQRUrl(
    bankId,
    bankAccount,
    product.price,
    orderCode,
    bankOwner
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl sm:max-w-3xl bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-black/5 dark:border-white/10 z-10 animate-scale-in text-[#1D1D1F] dark:text-[#F5F5F7] max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white transition-colors"
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>

        {!deliveredCredential ? (
          /* STEP 1: VIETQR PAYMENT */
          <div>
            {/* Header */}
            <div className="text-center mb-6">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-accent-subtle text-accent text-xs font-semibold mb-2">
                <QrCode className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Thanh Toán VietQR & Giao Hàng Tự Động</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                Quét Mã QR Nhận Tài Khoản Tức Thì
              </h3>
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Mã QR có hiệu lực trong: <strong className="text-red-500 font-mono">{formatTimer(timeLeft)}</strong></span>
              </div>
            </div>

            {/* REAL-TIME SCANNING RADAR STATUS BAR */}
            <div className="mb-5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <div className="relative flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative" />
                </div>
                <div>
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300 text-xs">
                    Cổng tự động quét biến động số dư MBBank 24/7
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                    Hệ thống tự động kích hoạt tài khoản ngay khi ngân hàng nhận tiền.
                  </p>
                </div>
              </div>

              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
                Lần quét: {checkCount}
              </span>
            </div>

            {/* QR Code and Bank Details */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mb-6">
              {/* Left: Extra Large VietQR Image Container (col-span-6) */}
              <div className="md:col-span-6 flex flex-col items-center justify-center p-4 sm:p-5 rounded-3xl bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 shadow-apple-card">
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 bg-white rounded-2xl p-2 shadow-inner flex items-center justify-center overflow-hidden border border-black/5">
                  <img
                    src={qrUrl}
                    alt={`VietQR ${orderCode}`}
                    className="w-full h-full object-contain select-none"
                    loading="eager"
                  />
                </div>

                <div className="mt-3 flex items-center justify-center space-x-2 w-full">
                  <a
                    href={qrUrl}
                    download={`VietQR-${orderCode}.png`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 text-gray-700 dark:text-gray-300 text-[11px] font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Lưu ảnh QR về máy</span>
                  </a>
                </div>

                <p className="text-[11px] text-gray-400 mt-2 text-center flex items-center justify-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                  Mở App ngân hàng bất kỳ quét mã chuẩn VietQR
                </p>
              </div>

              {/* Right: Transfer details (col-span-6) */}
              <div className="md:col-span-6 space-y-2.5 text-xs">
                {/* Bank Name */}
                <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/5 dark:border-white/5">
                  <span className="text-[10px] text-gray-400 uppercase font-medium block">Ngân hàng thụ hưởng</span>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{bankId}</p>
                </div>

                {/* Account Number */}
                <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/5 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-medium block">Số tài khoản</span>
                    <p className="font-bold text-gray-900 dark:text-white font-mono text-sm mt-0.5 tracking-wider">{bankAccount}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(bankAccount, 'account')}
                    className="p-1.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 text-gray-600 dark:text-gray-300 transition-colors"
                    title="Sao chép số tài khoản"
                  >
                    {copiedField === 'account' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Account Owner */}
                <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/5 dark:border-white/5">
                  <span className="text-[10px] text-gray-400 uppercase font-medium block">Chủ tài khoản</span>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{bankOwner}</p>
                </div>

                {/* Amount */}
                <div className="p-2.5 rounded-xl bg-accent-subtle/50 border border-accent/20 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-accent uppercase font-semibold block">Số tiền chính xác</span>
                    <p className="font-bold text-base text-accent mt-0.5">{formatVND(product.price)}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(product.price.toString(), 'amount')}
                    className="p-1.5 rounded-lg bg-accent/20 text-accent transition-colors"
                    title="Sao chép số tiền"
                  >
                    {copiedField === 'amount' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Transfer Content / Order Code */}
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-bold block">Nội dung chuyển khoản (Bắt buộc)</span>
                    <p className="font-bold text-amber-800 dark:text-amber-300 font-mono text-sm mt-0.5">{orderCode}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(orderCode, 'code')}
                    className="p-1.5 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 transition-colors"
                    title="Sao chép nội dung"
                  >
                    {copiedField === 'code' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Buyer Email Input (Optional for Warranty) */}
                <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/5 dark:border-white/5">
                  <span className="text-[10px] text-gray-400 uppercase font-medium flex items-center gap-1">
                    <Mail className="w-3 h-3 text-accent" />
                    <span>Email nhận thông tin bảo hành</span>
                  </span>
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="email.cua.ban@gmail.com"
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-black/40 border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:ring-1 focus:ring-accent font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="mb-6 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 flex items-start space-x-2 text-[11px] text-gray-500 dark:text-gray-400">
              <AlertCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" strokeWidth={1.5} />
              <span>
                Khi chuyển khoản đúng <strong>Mã đơn {orderCode}</strong>, hệ thống MBBank sẽ tự động kích hoạt tài khoản và mở khóa màn hình nhận tài khoản trong 5 - 10 giây.
              </span>
            </div>

            {/* Payment Check Error Notification */}
            {paymentError && (
              <div className="mb-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start space-x-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{paymentError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleManualConfirm}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl btn-accent font-semibold text-sm flex items-center justify-center space-x-2 shadow-apple-card disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang đối soát biến động số dư MBBank...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
                    <span>Tôi Đã Chuyển Khoản (Kiểm Tra Giao Dịch MBBank)</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-gray-400 text-center">
                🔒 Hệ thống đối soát trực tiếp sao kê MBBank 2222226062005. Đơn hàng chỉ được giao khi ngân hàng ghi nhận đúng số tiền.
              </p>
            </div>
          </div>
        ) : (
          /* STEP 2: ORDER COMPLETED - DELIVERED CREDENTIAL REVEAL */
          <div className="text-center py-2 animate-scale-in">
            {/* Success Icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10" strokeWidth={1.5} />
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Đã Nhận Thanh Toán Thành Công!
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-6">
              Mã đơn hàng: <strong className="text-accent font-mono">{orderCode}</strong> • {product.name}
            </p>

            {/* Credential Delivery Box */}
            <div className="text-left p-4 sm:p-5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-emerald-500/30 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
                  Thông tin tài khoản / Link kích hoạt
                </span>
                <button
                  onClick={() => copyToClipboard(deliveredCredential, 'cred')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium flex items-center space-x-1 transition-colors"
                >
                  {copiedField === 'cred' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã chép!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép nhanh</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-black/40 border border-black/5 dark:border-white/10 font-mono text-xs sm:text-sm text-gray-800 dark:text-gray-200 break-all select-all leading-relaxed">
                {deliveredCredential}
              </div>

              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-3 flex items-center gap-1">
                <span>🛡️ Cam kết bảo hành 1 đổi 1 trong suốt thời gian gói ({product.duration}).</span>
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  onClose();
                  onViewOrders();
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl btn-accent font-semibold text-xs shadow-sm flex items-center justify-center space-x-2"
              >
                <span>Xem Trong Đơn Hàng Của Tôi</span>
                <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-black/[0.04] dark:bg-white/[0.08] text-gray-700 dark:text-gray-300 font-semibold text-xs hover:bg-black/[0.08] dark:hover:bg-white/[0.12] transition-colors"
              >
                Hoàn Tất & Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
