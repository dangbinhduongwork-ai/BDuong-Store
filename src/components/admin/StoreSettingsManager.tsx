import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Palette, 
  CreditCard, 
  Headphones, 
  Megaphone, 
  Check, 
  Save, 
  Sun, 
  Moon, 
  Monitor,
  Zap,
  ShieldCheck,
  ExternalLink,
  Key,
  Webhook,
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const ACCENT_PRESETS = [
  { name: 'Apple Blue', hex: '#0071E3' },
  { name: 'Midnight Purple', hex: '#8E44AD' },
  { name: 'Emerald Green', hex: '#10B981' },
  { name: 'Titanium Orange', hex: '#F56300' },
  { name: 'Rose Red', hex: '#E11D48' },
  { name: 'Space Gray', hex: '#4B5563' },
];

export const StoreSettingsManager: React.FC = () => {
  const { settings, updateSettings, setAccentColor, setThemeMode, orders, deliverOrder } = useStore();
  const [formData, setFormData] = useState({ 
    ...settings,
    bank_id: settings.bank_id || 'MBBank',
    bank_account: settings.bank_account || '2222226062005',
    bank_owner: settings.bank_owner || 'DANG BINH DUONG',
    sepay_api_token: settings.sepay_api_token || '',
    auto_check_payment: settings.auto_check_payment ?? true,
  });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [showAdvancedWebhook, setShowAdvancedWebhook] = useState(false);

  const handleAccentChange = (hex: string) => {
    setFormData((prev) => ({ ...prev, accent_color: hex }));
    setAccentColor(hex);
  };

  const handleThemeModeChange = (mode: 'light' | 'dark' | 'system') => {
    setFormData((prev) => ({ ...prev, theme_mode: mode }));
    setThemeMode(mode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
  const webhookUrl = `${supabaseUrl}/functions/v1/sepay-webhook`;

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in text-xs">
      {/* Header & Save Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
            Cài Đặt Giao Diện & Cửa Hàng
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Thay đổi màu thương hiệu, tài khoản VietQR và kết nối tự động xác nhận MBBank.
          </p>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl btn-accent font-semibold text-xs flex items-center space-x-2 shadow-sm"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Đã Lưu Cài Đặt!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" strokeWidth={1.5} />
              <span>Lưu Toàn Bộ Cài Đặt</span>
            </>
          )}
        </button>
      </div>

      {/* Grid: Theme Settings & Bank Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1: THEME & BRANDING */}
        <div className="glass-card rounded-3xl p-6 border border-black/5 dark:border-white/10 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-black/5 dark:border-white/5 font-semibold text-sm">
            <Palette className="w-4 h-4 text-accent" strokeWidth={1.5} />
            <span>Màu Chủ Đạo & Giao Diện Chuẩn Apple</span>
          </div>

          <div>
            <label className="block text-gray-500 mb-1 font-medium">Tên Cửa Hàng (Store Name)</label>
            <input
              type="text"
              required
              value={formData.store_name}
              onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Theme Mode Segmented */}
          <div>
            <label className="block text-gray-500 mb-1 font-medium">Chế Độ Mặc Định (Theme Mode)</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleThemeModeChange('light')}
                className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                  formData.theme_mode === 'light'
                    ? 'border-accent bg-accent-subtle text-accent font-bold'
                    : 'border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.03]'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Sáng (Apple #F5F5F7)</span>
              </button>
              <button
                type="button"
                onClick={() => handleThemeModeChange('dark')}
                className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                  formData.theme_mode === 'dark'
                    ? 'border-accent bg-accent-subtle text-accent font-bold'
                    : 'border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.03]'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Tối (Apple Black)</span>
              </button>
              <button
                type="button"
                onClick={() => handleThemeModeChange('system')}
                className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                  formData.theme_mode === 'system'
                    ? 'border-accent bg-accent-subtle text-accent font-bold'
                    : 'border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.03]'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>Theo Thiết Bị</span>
              </button>
            </div>
          </div>

          {/* Accent Color Palette */}
          <div>
            <label className="block text-gray-500 mb-2 font-medium">
              Màu Nhấn (Accent Color): <span className="font-mono text-accent">{formData.accent_color}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ACCENT_PRESETS.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => handleAccentChange(preset.hex)}
                  className={`p-2 rounded-xl border flex items-center space-x-2 transition-all ${
                    formData.accent_color.toLowerCase() === preset.hex.toLowerCase()
                      ? 'border-accent ring-1 ring-accent bg-black/[0.03] dark:bg-white/[0.06]'
                      : 'border-black/5 dark:border-white/5 hover:bg-black/[0.02]'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full shadow-sm shrink-0"
                    style={{ backgroundColor: preset.hex }}
                  />
                  <span className="text-[11px] font-medium truncate">{preset.name}</span>
                </button>
              ))}
            </div>

            {/* Custom hex input */}
            <div className="mt-2 flex items-center space-x-2">
              <input
                type="color"
                value={formData.accent_color}
                onChange={(e) => handleAccentChange(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
              />
              <input
                type="text"
                value={formData.accent_color}
                onChange={(e) => handleAccentChange(e.target.value)}
                placeholder="#0071E3"
                className="flex-1 px-3 py-1.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs font-mono"
              />
            </div>
          </div>

          {/* Announcement Bar */}
          <div>
            <label className="block text-gray-500 mb-1 font-medium flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-accent" />
              <span>Thanh Thông Báo Trên Đầu Trang (Announcement Bar)</span>
            </label>
            <textarea
              rows={2}
              value={formData.announcement}
              onChange={(e) => setFormData({ ...formData, announcement: e.target.value })}
              placeholder="VD: 🔥 Chào mừng đến với BDuong Store - Cam kết bảo hành 1 đổi 1..."
              className="w-full px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {/* CARD 2: BANK & AUTO CONFIRMATION GATEWAY */}
        <div className="glass-card rounded-3xl p-6 border border-black/5 dark:border-white/10 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-black/5 dark:border-white/5 font-semibold text-sm">
            <CreditCard className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
            <span>Thông Tin Ngân Hàng Tạo VietQR</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-500 mb-1 font-medium">Ngân Hàng (Bank ID)</label>
              <input
                type="text"
                required
                value={formData.bank_id}
                onChange={(e) => setFormData({ ...formData, bank_id: e.target.value })}
                placeholder="MBBank"
                className="w-full px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-gray-500 mb-1 font-medium">Số Tài Khoản</label>
              <input
                type="text"
                required
                value={formData.bank_account}
                onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                placeholder="2222226062005"
                className="w-full px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-accent text-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-500 mb-1 font-medium">Tên Chủ Tài Khoản (In hoa không dấu)</label>
            <input
              type="text"
              required
              value={formData.bank_owner}
              onChange={(e) => setFormData({ ...formData, bank_owner: e.target.value })}
              placeholder="DANG BINH DUONG"
              className="w-full px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent uppercase"
            />
          </div>

          {/* THE EASIEST AUTO PAYMENT VERIFICATION (SEPAY API TOKEN - 1 STEP ONLY) */}
          <div className="pt-3 border-t border-black/5 dark:border-white/5 space-y-3">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-accent/10 to-transparent border border-emerald-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                  <Zap className="w-4 h-4 text-emerald-600 fill-current" />
                  <span>Cách Dễ Nhất: Dán SePay API Key (Không Cần Webhook)</span>
                </span>
                <span className="text-[10px] bg-emerald-500 text-white font-semibold px-2 py-0.5 rounded-full">
                  Khuyên Dùng
                </span>
              </div>

              <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
                Bạn <strong>không cần cài Webhook phức tạp</strong>! Chỉ cần lấy mã API Token từ tài khoản SePay của bạn và dán vào ô bên dưới. Website sẽ tự động kết nối và nhận diện tiền vào MBBank <strong>{formData.bank_account || '2222226062005'}</strong> ngay khi khách chuyển khoản!
              </p>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-semibold text-gray-700 dark:text-gray-200">
                    SePay API Token của bạn:
                  </label>
                  <a
                    href="https://my.sepay.vn/user/api-key"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-accent hover:underline flex items-center gap-0.5 font-bold"
                  >
                    <span>Lấy mã Token tại đây</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="password"
                    value={formData.sepay_api_token || ''}
                    onChange={(e) => setFormData({ ...formData, sepay_api_token: e.target.value })}
                    placeholder="Dán mã Token (VD: SEPAY_ABCXYZ123456...)"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-black/60 border border-emerald-500/30 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
            </div>

            {/* OPTIONAL ADVANCED: WEBHOOK URL (COLLAPSIBLE) */}
            <div className="border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAdvancedWebhook(!showAdvancedWebhook)}
                className="w-full p-2.5 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] text-[11px] font-medium text-gray-500 flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Webhook className="w-3 h-3" />
                  <span>Webhook URL (Dành cho SePay Webhook)</span>
                </span>
                {showAdvancedWebhook ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showAdvancedWebhook && (
                <div className="p-3 bg-black/[0.01] dark:bg-white/[0.01] space-y-2 text-[10px] text-gray-500">
                  <p>Nếu bạn muốn SePay gửi Webhook trực tiếp tới máy chủ, hãy dán URL này vào SePay:</p>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="text"
                      readOnly
                      value={webhookUrl}
                      className="w-full px-2 py-1 rounded bg-white dark:bg-black/40 border border-black/10 font-mono text-[9px] text-accent select-all"
                    />
                    <button
                      type="button"
                      onClick={copyWebhookUrl}
                      className="px-2 py-1 rounded bg-black/5 text-gray-700 font-medium shrink-0"
                    >
                      {copiedWebhook ? 'Đã chép' : 'Chép'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Support Channels */}
          <div className="pt-3 border-t border-black/5 dark:border-white/5 space-y-3">
            <div className="flex items-center space-x-2 font-semibold text-sm">
              <Headphones className="w-4 h-4 text-purple-500" strokeWidth={1.5} />
              <span>Kênh Hỗ Trợ Khách Hàng (Support Center)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-500 mb-1 font-medium">Link Zalo Hỗ Trợ</label>
                <input
                  type="text"
                  value={formData.support_zalo}
                  onChange={(e) => setFormData({ ...formData, support_zalo: e.target.value })}
                  placeholder="https://zalo.me/2222226062005"
                  className="w-full px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1 font-medium">Link Telegram CSKH</label>
                <input
                  type="text"
                  value={formData.support_telegram}
                  onChange={(e) => setFormData({ ...formData, support_telegram: e.target.value })}
                  placeholder="https://t.me/bduongstore"
                  className="w-full px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
