import React from 'react';
import { Sparkles, Shield, Zap, ArrowDown, CheckCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface HeroSectionProps {
  onExploreClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick }) => {
  const { settings } = useStore();

  return (
    <div className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
      {/* Background Subtle Gradient Blobs (Apple Style) */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[120px] opacity-20 pointer-events-none -z-10"
        style={{ backgroundColor: settings.accent_color }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Apple Pill Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] border border-black/5 dark:border-white/10 text-xs font-medium text-gray-700 dark:text-gray-300 mb-6 shadow-apple-sm">
          <Sparkles className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
          <span>Bản Quyền Số • Kích Hoạt Tự Động</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-[1.1] mb-6">
          Tài khoản số chính hãng.{' '}
          <span className="block text-accent font-extrabold mt-1">
            Giao ngay tức thì trong 10 giây.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-600 dark:text-gray-400 font-normal leading-relaxed mb-8">
          Giải trí YouTube Premium, AI Gemini / Muse Pro và khóa học chuyên sâu với chính sách <strong className="text-gray-900 dark:text-gray-100 font-semibold">Bảo hành 1 đổi 1 trọn thời gian</strong>.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onExploreClick}
            className="px-7 py-3.5 rounded-full btn-accent font-semibold text-sm shadow-apple-card hover:shadow-apple-hover flex items-center space-x-2 group"
          >
            <span>Khám Phá Sản Phẩm</span>
            <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" strokeWidth={1.5} />
          </button>
          
          <a
            href={settings.support_zalo}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-gray-800 dark:text-gray-200 font-medium text-sm transition-all border border-black/5 dark:border-white/5"
          >
            Tư Vấn Zalo
          </a>
        </div>

        {/* Streamlined Apple Minimal Feature Chips */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
          <div className="glass-card p-3.5 rounded-2xl shadow-apple-sm flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div className="text-left min-w-0">
              <p className="font-semibold text-xs text-gray-900 dark:text-white truncate">Giao Tự Động</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Trả tài khoản 24/7</p>
            </div>
          </div>

          <div className="glass-card p-3.5 rounded-2xl shadow-apple-sm flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div className="text-left min-w-0">
              <p className="font-semibold text-xs text-gray-900 dark:text-white truncate">Bảo Hành 1 Đổi 1</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Trọn thời gian gói</p>
            </div>
          </div>

          <div className="glass-card p-3.5 rounded-2xl shadow-apple-sm flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div className="text-left min-w-0">
              <p className="font-semibold text-xs text-gray-900 dark:text-white truncate">VietQR MBBank</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Khớp lệnh tự động</p>
            </div>
          </div>

          <div className="glass-card p-3.5 rounded-2xl shadow-apple-sm flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div className="text-left min-w-0">
              <p className="font-semibold text-xs text-gray-900 dark:text-white truncate">Hỗ Trợ 24/7</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Zalo & Telegram</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

