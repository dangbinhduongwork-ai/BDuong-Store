import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AnnouncementBar: React.FC = () => {
  const { settings } = useStore();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !settings.announcement) return null;

  return (
    <div className="bg-gradient-to-r from-accent to-blue-600 text-white text-xs py-2 px-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 flex items-center justify-center space-x-2 text-center overflow-hidden">
          <Sparkles className="w-3.5 h-3.5 shrink-0 animate-pulse text-amber-200" strokeWidth={1.5} />
          <span className="font-medium truncate tracking-wide">
            {settings.announcement}
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="ml-2 text-white/70 hover:text-white transition-colors p-0.5 rounded-full"
          title="Đóng thông báo"
        >
          <X className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

