import React from 'react';
import { ShieldCheck, Zap, Heart, Lock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const Footer: React.FC = () => {
  const { settings } = useStore();

  return (
    <footer className="mt-20 border-t border-black/5 dark:border-white/10 bg-[#F5F5F7] dark:bg-[#000000] text-gray-500 dark:text-gray-400 text-xs py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Propositions Bento Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10 border-b border-black/5 dark:border-white/5 text-center md:text-left">
          <div className="flex items-center space-x-3.5 p-4 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
            <div className="w-10 h-10 rounded-xl bg-accent-subtle text-accent flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Giao Hàng Tự Động</h5>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Nhận tài khoản ngay sau khi chuyển khoản VietQR</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 p-4 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Bảo Hành 1 Đổi 1</h5>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Hỗ trợ kỹ thuật và đổi mới suốt thời gian sử dụng</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 p-4 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Bảo Mật & Tin Cậy</h5>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Mã hóa dữ liệu đơn hàng và đối soát an toàn</p>
            </div>
          </div>
        </div>

        {/* Footer Details */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-center md:text-left">
          <p className="w-full md:w-auto leading-relaxed text-gray-500 dark:text-gray-400 break-words">
            © {new Date().getFullYear()} <span className="font-semibold text-gray-800 dark:text-gray-200">{settings.store_name}</span>. Thiết kế theo phong cách Apple Human Interface Guidelines.
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-4 gap-y-2 text-gray-500 dark:text-gray-400">
            <span>Thanh toán VietQR 24/7</span>
            <span className="hidden sm:inline">•</span>
            <span>Hỗ trợ kỹ thuật Zalo / Telegram</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1 text-accent font-medium">
              Made with <Heart className="w-3 h-3 fill-rose-500 text-rose-500" /> by BDuong
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

