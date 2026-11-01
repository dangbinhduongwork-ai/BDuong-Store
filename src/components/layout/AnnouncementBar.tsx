import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AnnouncementBar: React.FC = () => {
  const { settings } = useStore();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !settings.announcement) return null;

  // Ensure solid contrast even if accent color is set very bright/white
  const accentColor = 
    settings.accent_color && settings.accent_color.toLowerCase() !== '#ffffff' && settings.accent_color.toLowerCase() !== '#fff'
      ? settings.accent_color
      : '#0071E3';

  return (
    <div 
      className="text-white text-[11px] sm:text-xs py-1.5 px-3 sm:px-4 transition-all duration-300 relative z-50 font-medium shadow-sm"
      style={{
        background: `linear-gradient(90deg, ${accentColor} 0%, #004da3 100%)`,
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 flex items-center justify-center space-x-1.5 sm:space-x-2 text-center overflow-hidden">
          <Sparkles className="w-3.5 h-3.5 shrink-0 animate-pulse text-amber-200" strokeWidth={2} />
          <span className="font-semibold truncate tracking-wide text-white drop-shadow-sm">
            {settings.announcement}
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="ml-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors p-1 rounded-full shrink-0"
          title="Đóng thông báo"
        >
          <X className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

