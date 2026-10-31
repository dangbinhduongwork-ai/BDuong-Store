import React, { useState } from 'react';
import { MessageSquare, X, Send, ShieldCheck, PhoneCall, ExternalLink, HelpCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const FloatingSupport: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { settings } = useStore();

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Popover Card */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 glass-modal rounded-3xl p-5 shadow-2xl border border-black/10 dark:border-white/10 animate-scale-in text-[#1D1D1F] dark:text-[#F5F5F7]">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-sm font-semibold">Trung Tâm Hỗ Trợ 24/7</h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Bảo hành 1 đổi 1 & Kích hoạt tức thì</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Quick Notice */}
          <div className="my-3 p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] text-xs space-y-1">
            <p className="font-medium text-gray-700 dark:text-gray-300">
              Cần bảo hành tài khoản hoặc hỗ trợ nạp?
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
              Vui lòng gửi kèm <span className="font-semibold text-accent">Mã đơn hàng</span> khi nhắn tin để Admin kiểm tra và đổi mới trong 5 phút.
            </p>
          </div>

          {/* Contact Channels */}
          <div className="space-y-2">
            {settings.support_zalo && (
              <a
                href={settings.support_zalo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/15 text-blue-600 dark:text-blue-400 transition-all font-medium text-xs group"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    Z
                  </span>
                  <div>
                    <p className="font-semibold text-xs text-gray-900 dark:text-white">Chat qua Zalo CSKH</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Phản hồi tức thì & xử lý bảo hành</p>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
              </a>
            )}

            {settings.support_telegram && (
              <a
                href={settings.support_telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500/15 text-sky-600 dark:text-sky-400 transition-all font-medium text-xs group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center">
                    <Send className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-gray-900 dark:text-white">Telegram Hỗ Trợ 24/7</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Kênh giải đáp thắc mắc tự động</p>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
              </a>
            )}

            <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] text-[11px] text-gray-500 dark:text-gray-400 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <PhoneCall className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Hotline/Zalo: <strong>{settings.bank_account || '2222226062005'}</strong></span>
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Floating Pill Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-3 rounded-full btn-accent shadow-apple-card hover:shadow-apple-hover transition-all duration-300 group"
      >
        <MessageSquare className="w-4 h-4 transition-transform group-hover:scale-110" strokeWidth={1.5} />
        <span className="text-xs font-semibold tracking-wide">Hỗ Trợ & Bảo Hành</span>
      </button>
    </div>
  );
};

