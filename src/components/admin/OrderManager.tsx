import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatVND, formatDate } from '../../lib/utils';
import { 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Zap, 
  Search, 
  Copy, 
  Check, 
  RefreshCw,
  ExternalLink 
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';

export const OrderManager: React.FC = () => {
  const { orders, updateOrderStatus, deliverOrder } = useStore();
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch =
      o.order_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customer_email && o.customer_email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleManualApprove = async (order: Order) => {
    if (window.confirm(`Duyệt và tự động trả tài khoản cho đơn hàng ${order.order_code}?`)) {
      await deliverOrder(order.order_code);
    }
  };

  const handleSetStatus = async (orderId: string, status: OrderStatus) => {
    await updateOrderStatus(orderId, status);
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
            Quản Lý Đơn Hàng & Bảo Hành ({orders.length} Đơn)
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Duyệt đơn thủ công, kiểm tra tài khoản đã trả và xử lý bảo hành cho khách.
          </p>
        </div>

        {/* Search */}
        <div className="w-full sm:w-64 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" strokeWidth={1.5} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã đơn, email..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setStatusFilter('all')}
          style={statusFilter === 'all' ? { backgroundColor: 'var(--accent-color, #0071E3)', color: '#fff' } : {}}
          className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
            statusFilter === 'all'
              ? 'bg-accent text-white shadow-sm'
              : 'bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-300'
          }`}
        >
          Tất Cả ({orders.length})
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
            statusFilter === 'pending'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-black/5 dark:bg-white/5 text-amber-600 dark:text-amber-400'
          }`}
        >
          Chờ Thanh Toán ({orders.filter((o) => o.status === 'pending').length})
        </button>
        <button
          onClick={() => setStatusFilter('completed')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
            statusFilter === 'completed'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-black/5 dark:bg-white/5 text-emerald-600 dark:text-emerald-400'
          }`}
        >
          Đã Giao Tự Động ({orders.filter((o) => o.status === 'completed').length})
        </button>
        <button
          onClick={() => setStatusFilter('refunded')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
            statusFilter === 'refunded'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-black/5 dark:bg-white/5 text-purple-600 dark:text-purple-400'
          }`}
        >
          Bảo Hành ({orders.filter((o) => o.status === 'refunded').length})
        </button>
      </div>

      {/* Orders Table */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center glass-card rounded-2xl text-xs text-gray-500">
            Không tìm thấy đơn hàng nào phù hợp.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="glass-card rounded-2xl p-4 sm:p-5 border border-black/5 dark:border-white/10 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-xs bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded">
                    {order.order_code}
                  </span>
                  <span className="text-xs text-gray-500">{formatDate(order.created_at)}</span>
                  {order.customer_email && (
                    <span className="text-xs text-gray-400">({order.customer_email})</span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {formatVND(order.amount)}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      order.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : order.status === 'pending'
                        ? 'bg-amber-500/10 text-amber-600'
                        : 'bg-purple-500/10 text-purple-600'
                    }`}
                  >
                    {order.status === 'completed'
                      ? 'Đã Hoàn Thành'
                      : order.status === 'pending'
                      ? 'Chờ Duyệt'
                      : 'Bảo Hành'}
                  </span>
                </div>
              </div>

              {/* Order Content */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-xs text-gray-800 dark:text-gray-200">
                    {order.product_name}
                  </h4>
                </div>

                {/* Status Quick Action Buttons */}
                <div className="flex items-center space-x-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleManualApprove(order)}
                      className="px-3 py-1.5 rounded-xl btn-accent text-xs font-medium flex items-center space-x-1 shadow-sm"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Duyệt & Trả Hàng Tức Thì</span>
                    </button>
                  )}

                  {order.status === 'completed' && (
                    <button
                      onClick={() => handleSetStatus(order.id, 'refunded')}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-medium hover:bg-purple-500/20 transition-colors"
                      title="Chuyển sang trạng thái xử lý bảo hành"
                    >
                      Chuyển Bảo Hành
                    </button>
                  )}

                  {order.status === 'refunded' && (
                    <button
                      onClick={() => handleSetStatus(order.id, 'completed')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
                      title="Khôi phục trạng thái hoàn thành"
                    >
                      Đã Đổi Mới / Xong
                    </button>
                  )}
                </div>
              </div>

              {/* Delivered Credential Preview */}
              {order.delivered_credential && (
                <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 flex items-center justify-between text-xs">
                  <div className="font-mono text-[11px] text-gray-700 dark:text-gray-300 truncate max-w-xl">
                    <strong className="text-emerald-600">Đã giao:</strong> {order.delivered_credential}
                  </div>
                  <button
                    onClick={() => copyText(order.delivered_credential!, order.id)}
                    className="p-1 rounded-md text-gray-400 hover:text-black dark:hover:text-white"
                    title="Copy thông tin"
                  >
                    {copiedId === order.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

