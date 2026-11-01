import React from 'react';
import { Sparkles, Shield, Zap, ArrowDown, CheckCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface HeroSectionProps {
  onExploreClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick }) => {
  const { settings } = useStore();

  return (
    <div className="relative pt-8 pb-12 sm:pt-14 sm:pb-20 md:pt-20 md:pb-24 overflow-hidden">
      {/* Background Subtle Gradient Blobs (Apple Style) */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[250px] sm:h-[300px] rounded-full blur-[100px] sm:blur-[120px] opacity-20 pointer-events-none -z-10"
        style={{ backgroundColor: settings.accent_color }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Apple Pill Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] border border-black/5 dark:border-white/10 text-[11px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 mb-4 sm:mb-6 shadow-apple-sm">
          <Sparkles className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
          <span>{settings.hero_badge || 'Bản Quyền Số • Kích Hoạt Tự Động'}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-[1.15] mb-3 sm:mb-6">
          {settings.hero_title || 'Tài khoản số chính hãng.'}{' '}
          <span className="block text-accent font-extrabold mt-1">
            {settings.hero_highlight || 'Giao ngay tức thì trong 10 giây.'}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-xs sm:text-base md:text-lg text-gray-600 dark:text-gray-400 font-normal leading-relaxed mb-6 sm:mb-8 px-2">
          {settings.hero_description || 'Giải trí YouTube Premium, AI Gemini / Muse Pro và khóa học chuyên sâu với chính sách Bảo hành 1 đổi 1 trọn thời gian.'}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 w-full sm:w-auto max-w-xs sm:max-w-none mx-auto">
          <button
            onClick={onExploreClick}
            className="w-full sm:w-auto px-7 py-3 sm:py-3.5 rounded-full btn-accent font-semibold text-xs sm:text-sm shadow-apple-card hover:shadow-apple-hover flex items-center justify-center space-x-2 group"
          >
            <span>{settings.hero_cta_primary || 'Khám Phá Sản Phẩm'}</span>
            <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" strokeWidth={1.5} />
          </button>
          
          <a
            href={settings.support_zalo}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 sm:py-3.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-gray-800 dark:text-gray-200 font-medium text-xs sm:text-sm transition-all border border-black/5 dark:border-white/5 text-center"
          >
            {settings.hero_cta_secondary || 'Tư Vấn Zalo'}
          </a>
        </div>

        {/* Streamlined Apple Minimal Feature Chips */}
        <div className="mt-8 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-3xl mx-auto">
          <div className="glass-card p-2.5 sm:p-3.5 rounded-2xl shadow-apple-sm flex items-center space-x-2 sm:space-x-2.5 text-left">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-xs text-gray-900 dark:text-white truncate">
                {settings.hero_chip1_title || 'Giao Tự Động'}
              </p>
              <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 truncate">
                {settings.hero_chip1_sub || 'Trả tài khoản 24/7'}
              </p>
            </div>
          </div>

          <div className="glass-card p-2.5 sm:p-3.5 rounded-2xl shadow-apple-sm flex items-center space-x-2 sm:space-x-2.5 text-left">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-xs text-gray-900 dark:text-white truncate">
                {settings.hero_chip2_title || 'Bảo Hành 1 Đổi 1'}
              </p>
              <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 truncate">
                {settings.hero_chip2_sub || 'Trọn thời gian gói'}
              </p>
            </div>
          </div>

          <div className="glass-card p-2.5 sm:p-3.5 rounded-2xl shadow-apple-sm flex items-center space-x-2 sm:space-x-2.5 text-left">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-xs text-gray-900 dark:text-white truncate">
                {settings.hero_chip3_title || 'VietQR MBBank'}
              </p>
              <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 truncate">
                {settings.hero_chip3_sub || 'Khớp lệnh tự động'}
              </p>
            </div>
          </div>

          <div className="glass-card p-2.5 sm:p-3.5 rounded-2xl shadow-apple-sm flex items-center space-x-2 sm:space-x-2.5 text-left">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-xs text-gray-900 dark:text-white truncate">
                {settings.hero_chip4_title || 'Hỗ Trợ 24/7'}
              </p>
              <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 truncate">
                {settings.hero_chip4_sub || 'Zalo & Telegram'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
