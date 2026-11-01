import React, { useState } from 'react';
import { Product } from '../../types';
import { DynamicIcon } from '../common/DynamicIcon';
import { formatVND } from '../../lib/utils';
import { X, ShieldCheck, FileText, Clock, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onBuyNow: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onBuyNow,
}) => {
  const [activeTab, setActiveTab] = useState<'desc' | 'warranty'>('desc');

  if (!product) return null;

  const stockCount = product.stock_data ? product.stock_data.length : 0;
  const isOutOfStock = stockCount === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog / Bottom Sheet on Mobile */}
      <div className="relative w-full max-w-2xl bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl rounded-t-[32px] sm:rounded-3xl p-5 sm:p-8 shadow-2xl border border-black/5 dark:border-white/10 z-10 animate-sheet-up sm:animate-scale-in text-[#1D1D1F] dark:text-[#F5F5F7] max-h-[88vh] sm:max-h-[90vh] flex flex-col">
        {/* Mobile Drag Indicator Handle */}
        <div className="w-12 h-1 bg-black/15 dark:bg-white/20 rounded-full mx-auto mb-3 sm:hidden shrink-0" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white transition-colors z-10"
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 pr-1 pb-2">
          {/* Product Header */}
          <div className="flex items-start space-x-3 sm:space-x-4 mb-5 sm:mb-6">
            <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-accent-subtle text-accent flex items-center justify-center shrink-0 border border-black/5 dark:border-white/10 p-2.5">
              <DynamicIcon name={product.icon_name} size={28} strokeWidth={1.5} />
            </div>
            <div className="min-w-0 pr-6 sm:pr-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                  {product.category === 'entertainment' ? 'Giải Trí' : product.category === 'ai' ? 'Trí Tuệ Nhân Tạo' : 'Khóa Học'}
                </span>
                <span className="text-[10px] sm:text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 sm:w-3.5 h-3 sm:h-3.5" strokeWidth={1.5} />
                  Bản quyền chính hãng
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mt-1 line-clamp-2">
                {product.name}
              </h2>
              <div className="flex items-center space-x-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Gói: <strong>{product.duration}</strong></span>
                </span>
                <span>•</span>
                <span>Kho: <strong className={stockCount > 0 ? 'text-emerald-500' : 'text-red-500'}>
                  {stockCount > 0 ? `Còn ${stockCount} slot` : 'Hết hàng'}
                </strong></span>
              </div>
            </div>
          </div>

          {/* 2 Tabs Segmented Control */}
          <div className="flex items-center p-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-2xl border border-black/5 dark:border-white/5 mb-5">
            <button
              onClick={() => setActiveTab('desc')}
              className={`flex-1 py-1.5 sm:py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                activeTab === 'desc'
                  ? 'bg-white dark:bg-[#2C2C2E] text-black dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Mô Tả Sản Phẩm</span>
            </button>

            <button
              onClick={() => setActiveTab('warranty')}
              className={`flex-1 py-1.5 sm:py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                activeTab === 'warranty'
                  ? 'bg-white dark:bg-[#2C2C2E] text-accent shadow-sm'
                  : 'text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Chính Sách Bảo Hành</span>
            </button>
          </div>

          {/* Tab 1: Description Content */}
          {activeTab === 'desc' && (
            <div className="space-y-3.5 sm:space-y-4 animate-fade-in text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                <h4 className="font-semibold text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Thông tin chi tiết & Hình thức cấp quyền
                </h4>
                <p className="whitespace-pre-line text-xs sm:text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 flex items-start space-x-2.5">
                  <Zap className="w-4 h-4 text-accent shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Giao Tự Động 24/7</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Trả thông tin / link kích hoạt ngay trên màn hình</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 flex items-start space-x-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Bảo Mật 100%</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Tài khoản riêng tư, bảo vệ quyền lợi người dùng</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Warranty Content */}
          {activeTab === 'warranty' && (
            <div className="space-y-3.5 sm:space-y-4 animate-fade-in text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                <div className="flex items-center space-x-2 mb-1.5 font-semibold text-xs sm:text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={1.5} />
                  <span>Cam Kết Bảo Hành 1 Đổi 1 Toàn Thời Gian</span>
                </div>
                <p className="text-xs leading-relaxed">
                  BDuong Store chịu trách nhiệm hoàn toàn về tính ổn định của gói dịch vụ. Bất cứ khi nào tài khoản gặp sự cố trong thời hạn, chúng tôi xử lý đổi mới hoặc bảo hành ngay trong 5 phút.
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                <h4 className="font-semibold text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Điều kiện áp dụng & Hướng dẫn nhận bảo hành
                </h4>
                <p className="whitespace-pre-line text-xs sm:text-sm leading-relaxed">
                  {product.warranty_policy}
                </p>
              </div>

              <div className="flex items-center space-x-2 text-[11px] text-gray-500 dark:text-gray-400 p-1">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" strokeWidth={1.5} />
                <span>Chỉ cần lưu lại Mã Đơn Hàng (Order Code) để được kích hoạt bảo hành nhanh chóng.</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Footer / Checkout Action */}
        <div className="mt-3 pt-3.5 sm:pt-4 border-t border-black/5 dark:border-white/10 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-semibold tracking-wider block">Thanh toán</span>
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              {formatVND(product.price)}
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onClose}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={() => {
                onClose();
                onBuyNow(product);
              }}
              disabled={isOutOfStock}
              className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl btn-accent font-semibold text-xs shadow-md disabled:opacity-40 flex items-center space-x-1.5 sm:space-x-2 active:scale-95 transition-transform"
            >
              <Zap className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-current" strokeWidth={1.5} />
              <span>{isOutOfStock ? 'Hết hàng' : 'Tiến Hành Mua Ngay'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
