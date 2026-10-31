import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatVND, formatDate } from '../../lib/utils';
import { 
  ShoppingBag, 
  Copy, 
  Check, 
  ShieldAlert, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  ArrowRight
} from 'lucide-react';
import { Order } from '../../types';

interface OrdersViewProps {
  onGoShopping: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onGoShopping }) => {
  const { orders, user, settings } = useStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  // Filter orders: If logged in, show user orders or all if demo
  const displayOrders = user?.role === 'admin'
    ? orders
    : user
    ? orders.filter((o) => !o.user_id || o.user_id === user.id || o.customer_email === user.email)
    : orders;

  const copyCredential = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openWarrantyRequest = (order: Order) => {
    const text = encodeURIComponent(
      `Chào BDuong Store, tôi cần hỗ trợ/bảo hành đơn hàng:
- Mã đơn: ${order.order_code}
- Sản phẩm: ${order.product_name}
- Ngày mua: ${formatDate(order.created_at)}
- Mô tả sự cố: `
    );
    const url = settings.support_zalo 
      ? `${settings.support_zalo}?text=${text}`
      : `https://zalo.me/${settings.bank_account}?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-black/5 dark:border-white/10 gap-4 mb-8">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent-subtle text-accent text-xs font-semibold mb-2">
            <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Lịch Sử Mua Hàng</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            Đơn Hàng Của Tôi
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Xem lại thông tin tài khoản, link kích hoạt và yêu cầu bảo hành nhanh chóng.
          </p>
        </div>

        <button
          onClick={onGoShopping}
          className="px-4 py-2 rounded-xl btn-accent text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
        >
          <span>Mua thêm sản phẩm</span>
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Orders List */}
      {displayOrders.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-3xl glass-card border border-black/5 dark:border-white/10">
          <div className="w-14 h-14 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] text-gray-400 mx-auto flex items-center justify-center mb-4">
            <ShoppingBag className="w-7 h-7" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Bạn chưa có đơn hàng nào
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1 mb-6">
            Khám phá các sản phẩm giải trí YouTube Premium và tài khoản AI kích hoạt tự động với bảo hành 1 đổi 1.
          </p>
          <button
            onClick={onGoShopping}
            className="px-6 py-2.5 rounded-xl btn-accent font-semibold text-xs shadow-sm"
          >
            Khám Phá Cửa Hàng Ngay
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {displayOrders.map((order) => {
            const isCompleted = order.status === 'completed';
            const isRevealed = revealedIds[order.id];

            return (
              <div
                key={order.id}
                className="glass-card rounded-3xl p-5 sm:p-6 border border-black/5 dark:border-white/10 shadow-apple-sm transition-all hover:shadow-apple-card"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-black/5 dark:border-white/5">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-sm text-accent bg-accent-subtle px-2.5 py-1 rounded-lg">
                      {order.order_code}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(order.created_at)}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isCompleted ? (
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>Đã Hoàn Thành</span>
                      </span>
                    ) : order.status === 'refunded' ? (
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold">
                        <ShieldAlert className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>Bảo Hành / Đã Đổi</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>Chờ Thanh Toán</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Name & Amount */}
                <div className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-base text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {order.product_name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Đơn giá: <strong className="text-gray-800 dark:text-gray-200">{formatVND(order.amount)}</strong>
                    </p>
                  </div>

                  {/* Warranty Button */}
                  <button
                    onClick={() => openWarrantyRequest(order)}
                    className="px-3.5 py-1.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] hover:bg-red-500/10 hover:text-red-600 text-xs font-medium text-gray-600 dark:text-gray-300 transition-colors flex items-center space-x-1.5 border border-black/5 dark:border-white/5"
                    title="Nhắn tin với Admin để yêu cầu bảo hành"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Báo Lỗi / Bảo Hành</span>
                  </button>
                </div>

                {/* Credential Box (If Completed) */}
                {isCompleted && order.delivered_credential && (
                  <div className="mt-2 p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/5 dark:border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                        Thông tin tài khoản / Link kích hoạt
                      </span>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => toggleReveal(order.id)}
                          className="p-1.5 rounded-lg bg-black/5 dark:bg-white/10 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                          title={isRevealed ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => copyCredential(order.delivered_credential!, order.id)}
                          className="px-2.5 py-1 rounded-lg bg-accent-subtle text-accent hover:bg-accent/20 text-xs font-semibold flex items-center space-x-1 transition-colors"
                        >
                          {copiedId === order.id ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Đã chép!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy nhanh</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-black/50 border border-black/5 dark:border-white/10 font-mono text-xs text-gray-800 dark:text-gray-200 break-all select-all">
                      {isRevealed
                        ? order.delivered_credential
                        : order.delivered_credential.replace(/Pass: [^|]+/, 'Pass: ••••••••••••')}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

