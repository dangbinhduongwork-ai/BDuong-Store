import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatVND } from '../../lib/utils';
import { isSupabaseConfigured } from '../../lib/supabase';
import { ProductManager } from './ProductManager';
import { StockManager } from './StockManager';
import { OrderManager } from './OrderManager';
import { StoreSettingsManager } from './StoreSettingsManager';
import { 
  Package, 
  Layers, 
  ShoppingBag, 
  Settings, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowLeft 
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToHome: () => void;
}

type AdminTab = 'products' | 'stock' | 'orders' | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToHome }) => {
  const { products, orders } = useStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('products');

  // Stats
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const totalRevenue = completedOrders.reduce((acc, curr) => acc + curr.amount, 0);
  const totalStockItems = products.reduce((acc, curr) => acc + (curr.stock_data?.length || 0), 0);

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'products', label: 'Quản Lý Sản Phẩm', icon: <Package className="w-4 h-4" strokeWidth={1.5} />, badge: products.length },
    { id: 'stock', label: 'Quản Lý Kho Hàng', icon: <Layers className="w-4 h-4" strokeWidth={1.5} />, badge: totalStockItems },
    { id: 'orders', label: 'Quản Lý Đơn Hàng', icon: <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />, badge: pendingOrders.length > 0 ? pendingOrders.length : undefined },
    { id: 'settings', label: 'Cài Đặt Cửa Hàng & Theme', icon: <Settings className="w-4 h-4" strokeWidth={1.5} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-[#1D1D1F] dark:text-[#F5F5F7]">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-black/5 dark:border-white/10 gap-4 mb-8">
        <div>
          <button
            onClick={onBackToHome}
            className="inline-flex items-center space-x-1.5 text-xs text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Quay lại trang bán hàng</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Trang Quản Trị Hệ Thống (Admin Control)
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Kiểm soát sản phẩm, kho tài khoản tự động, đơn hàng VietQR và giao diện cửa hàng.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isSupabaseConfigured ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Supabase Cloud Kết Nối Thực Tế</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold" title="Đang chạy fallback LocalStorage. Hãy thêm VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY trên Vercel và bấm Redeploy.">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>LocalStorage Demo (Chưa nối Supabase)</span>
            </span>
          )}
        </div>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-medium">Doanh Thu Đã Thu</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
            {formatVND(totalRevenue)}
          </p>
          <span className="text-[10px] text-gray-400 mt-1 block">Từ {completedOrders.length} đơn hoàn thành</span>
        </div>

        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-medium">Đơn Giao Tự Động</span>
            <CheckCircle2 className="w-4 h-4 text-accent" strokeWidth={1.5} />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
            {completedOrders.length} Đơn
          </p>
          <span className="text-[10px] text-emerald-500 mt-1 block font-medium">Tỷ lệ thành công 100%</span>
        </div>

        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-medium">Kho Tài Khoản Sẵn</span>
            <Layers className="w-4 h-4 text-purple-500" strokeWidth={1.5} />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
            {totalStockItems} Slot
          </p>
          <span className="text-[10px] text-gray-400 mt-1 block">Sẵn sàng trả hàng ngay</span>
        </div>

        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-medium">Đơn Chờ Xử Lý</span>
            <Clock className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
            {pendingOrders.length} Đơn
          </p>
          <span className="text-[10px] text-gray-400 mt-1 block">Chờ xác nhận hoặc test</span>
        </div>
      </div>

      {/* 4 Tabs Navigation (Apple Segmented Style) */}
      <div className="flex items-center overflow-x-auto no-scrollbar p-1.5 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/5 dark:border-white/5 space-x-1.5 mb-8">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[160px] py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                isActive
                  ? 'bg-white dark:bg-[#2C2C2E] text-black dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <span className={isActive ? 'text-accent' : ''}>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-accent text-white'
                      : 'bg-black/10 dark:bg-white/10 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'products' && <ProductManager />}
        {activeTab === 'stock' && <StockManager />}
        {activeTab === 'orders' && <OrderManager />}
        {activeTab === 'settings' && <StoreSettingsManager />}
      </div>
    </div>
  );
};

