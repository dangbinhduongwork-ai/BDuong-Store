import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { getSupabaseDiagnostics } from '../../lib/supabase';
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
  ChevronUp,
  Database,
  AlertTriangle,
  Sparkles
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
    support_phone: settings.support_phone || '0865.087.784',
    sepay_api_token: settings.sepay_api_token || import.meta.env.VITE_SEPAY_API_TOKEN || '',
    auto_check_payment: settings.auto_check_payment ?? true,
    hero_badge: settings.hero_badge || 'Bản Quyền Số • Kích Hoạt Tự Động',
    hero_title: settings.hero_title || 'Tài khoản số chính hãng.',
    hero_highlight: settings.hero_highlight || 'Giao ngay tức thì trong 10 giây.',
    hero_description: settings.hero_description || 'Giải trí YouTube Premium, AI Gemini / Muse Pro và khóa học chuyên sâu với chính sách Bảo hành 1 đổi 1 trọn thời gian.',
    hero_cta_primary: settings.hero_cta_primary || 'Khám Phá Sản Phẩm',
    hero_cta_secondary: settings.hero_cta_secondary || 'Tư Vấn Zalo',
    hero_chip1_title: settings.hero_chip1_title || 'Giao Tự Động',
    hero_chip1_sub: settings.hero_chip1_sub || 'Trả tài khoản 24/7',
    hero_chip2_title: settings.hero_chip2_title || 'Bảo Hành 1 Đổi 1',
    hero_chip2_sub: settings.hero_chip2_sub || 'Trọn thời gian gói',
    hero_chip3_title: settings.hero_chip3_title || 'VietQR MBBank',
    hero_chip3_sub: settings.hero_chip3_sub || 'Khớp lệnh tự động',
    hero_chip4_title: settings.hero_chip4_title || 'Hỗ Trợ 24/7',
    hero_chip4_sub: settings.hero_chip4_sub || 'Zalo & Telegram',
  });

  useEffect(() => {
    setFormData({
      ...settings,
      bank_id: settings.bank_id || 'MBBank',
      bank_account: settings.bank_account || '2222226062005',
      bank_owner: settings.bank_owner || 'DANG BINH DUONG',
      support_phone: settings.support_phone || '0865.087.784',
      sepay_api_token: settings.sepay_api_token || import.meta.env.VITE_SEPAY_API_TOKEN || '',
      auto_check_payment: settings.auto_check_payment ?? true,
      hero_badge: settings.hero_badge || 'Bản Quyền Số • Kích Hoạt Tự Động',
      hero_title: settings.hero_title || 'Tài khoản số chính hãng.',
      hero_highlight: settings.hero_highlight || 'Giao ngay tức thì trong 10 giây.',
      hero_description: settings.hero_description || 'Giải trí YouTube Premium, AI Gemini / Muse Pro và khóa học chuyên sâu với chính sách Bảo hành 1 đổi 1 trọn thời gian.',
      hero_cta_primary: settings.hero_cta_primary || 'Khám Phá Sản Phẩm',
      hero_cta_secondary: settings.hero_cta_secondary || 'Tư Vấn Zalo',
      hero_chip1_title: settings.hero_chip1_title || 'Giao Tự Động',
      hero_chip1_sub: settings.hero_chip1_sub || 'Trả tài khoản 24/7',
      hero_chip2_title: settings.hero_chip2_title || 'Bảo Hành 1 Đổi 1',
      hero_chip2_sub: settings.hero_chip2_sub || 'Trọn thời gian gói',
      hero_chip3_title: settings.hero_chip3_title || 'VietQR MBBank',
      hero_chip3_sub: settings.hero_chip3_sub || 'Khớp lệnh tự động',
      hero_chip4_title: settings.hero_chip4_title || 'Hỗ Trợ 24/7',
      hero_chip4_sub: settings.hero_chip4_sub || 'Zalo & Telegram',
    });
  }, [settings]);
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-gray-500 mb-1 font-medium">Hotline / Zalo (Số điện thoại)</label>
                <input
                  type="text"
                  value={formData.support_phone || ''}
                  onChange={(e) => setFormData({ ...formData, support_phone: e.target.value })}
                  placeholder="0865.087.784"
                  className="w-full px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1 font-medium">Link Zalo Hỗ Trợ</label>
                <input
                  type="text"
                  value={formData.support_zalo}
                  onChange={(e) => setFormData({ ...formData, support_zalo: e.target.value })}
                  placeholder="https://zalo.me/0865087784"
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

        {/* CARD: HERO BANNER & HOMEPAGE CONTENT CMS */}
        <div className="glass-card rounded-3xl p-6 border border-black/5 dark:border-white/10 space-y-5 md:col-span-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-black/5 dark:border-white/5 gap-2">
            <div className="flex items-center space-x-2 font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-accent" strokeWidth={1.5} />
              <span>Nội Dung Banner Trang Chủ (Hero Section CMS)</span>
            </div>
            <span className="text-[11px] text-gray-500">Tùy biến tiêu đề, câu slogan, nút bấm và 4 thẻ tính năng</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-500 mb-1 font-medium">1. Huy Hiệu Nhỏ (Hero Pill Badge)</label>
              <input
                type="text"
                value={formData.hero_badge || ''}
                onChange={(e) => setFormData({ ...formData, hero_badge: e.target.value })}
                placeholder="Bản Quyền Số • Kích Hoạt Tự Động"
                className="w-full px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-accent font-medium"
              />
            </div>

            <div>
              <label className="block text-gray-500 mb-1 font-medium">2. Tiêu Đề Chính Dòng 1</label>
              <input
                type="text"
                value={formData.hero_title || ''}
                onChange={(e) => setFormData({ ...formData, hero_title: e.target.value })}
                placeholder="Tài khoản số chính hãng."
                className="w-full px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-accent font-bold"
              />
            </div>

            <div>
              <label className="block text-gray-500 mb-1 font-medium text-accent">3. Tiêu Đề Nổi Bật Dòng 2 (Màu Xanh)</label>
              <input
                type="text"
                value={formData.hero_highlight || ''}
                onChange={(e) => setFormData({ ...formData, hero_highlight: e.target.value })}
                placeholder="Giao ngay tức thì trong 10 giây."
                className="w-full px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-accent/40 text-xs focus:outline-none focus:ring-2 focus:ring-accent font-extrabold text-accent"
              />
            </div>
          </div>

          {/* Description & Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-gray-500 mb-1 font-medium">4. Đoạn Giới Thiệu Ngắn (Description)</label>
              <textarea
                rows={2}
                value={formData.hero_description || ''}
                onChange={(e) => setFormData({ ...formData, hero_description: e.target.value })}
                placeholder="Giải trí YouTube Premium, AI Gemini / Muse Pro và khóa học chuyên sâu với chính sách Bảo hành 1 đổi 1 trọn thời gian."
                className="w-full px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-accent leading-relaxed"
              />
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-gray-500 mb-1 font-medium">5. Nút Bấm Chính (Primary CTA)</label>
                <input
                  type="text"
                  value={formData.hero_cta_primary || ''}
                  onChange={(e) => setFormData({ ...formData, hero_cta_primary: e.target.value })}
                  placeholder="Khám Phá Sản Phẩm"
                  className="w-full px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-accent font-semibold"
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1 font-medium">6. Nút Bấm Phụ (Secondary CTA)</label>
                <input
                  type="text"
                  value={formData.hero_cta_secondary || ''}
                  onChange={(e) => setFormData({ ...formData, hero_cta_secondary: e.target.value })}
                  placeholder="Tư Vấn Zalo"
                  className="w-full px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
          </div>

          {/* 4 Feature Chips */}
          <div className="pt-3 border-t border-black/5 dark:border-white/5 space-y-2">
            <label className="block text-gray-600 dark:text-gray-300 font-semibold">
              7. 4 Thẻ Tính Năng Nổi Bật Dưới Banner (4 Feature Chips):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Chip 1 */}
              <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-2">
                <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> Thẻ 1 (Sấm Sét)
                </span>
                <input
                  type="text"
                  value={formData.hero_chip1_title || ''}
                  onChange={(e) => setFormData({ ...formData, hero_chip1_title: e.target.value })}
                  placeholder="Giao Tự Động"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs font-semibold"
                />
                <input
                  type="text"
                  value={formData.hero_chip1_sub || ''}
                  onChange={(e) => setFormData({ ...formData, hero_chip1_sub: e.target.value })}
                  placeholder="Trả tài khoản 24/7"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-[11px] text-gray-500"
                />
              </div>

              {/* Chip 2 */}
              <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-2">
                <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Thẻ 2 (Bảo Hành)
                </span>
                <input
                  type="text"
                  value={formData.hero_chip2_title || ''}
                  onChange={(e) => setFormData({ ...formData, hero_chip2_title: e.target.value })}
                  placeholder="Bảo Hành 1 Đổi 1"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs font-semibold"
                />
                <input
                  type="text"
                  value={formData.hero_chip2_sub || ''}
                  onChange={(e) => setFormData({ ...formData, hero_chip2_sub: e.target.value })}
                  placeholder="Trọn thời gian gói"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-[11px] text-gray-500"
                />
              </div>

              {/* Chip 3 */}
              <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-2">
                <span className="text-[11px] font-bold text-blue-500 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" /> Thẻ 3 (VietQR)
                </span>
                <input
                  type="text"
                  value={formData.hero_chip3_title || ''}
                  onChange={(e) => setFormData({ ...formData, hero_chip3_title: e.target.value })}
                  placeholder="VietQR MBBank"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs font-semibold"
                />
                <input
                  type="text"
                  value={formData.hero_chip3_sub || ''}
                  onChange={(e) => setFormData({ ...formData, hero_chip3_sub: e.target.value })}
                  placeholder="Khớp lệnh tự động"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-[11px] text-gray-500"
                />
              </div>

              {/* Chip 4 */}
              <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-2">
                <span className="text-[11px] font-bold text-purple-500 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Thẻ 4 (Hỗ Trợ)
                </span>
                <input
                  type="text"
                  value={formData.hero_chip4_title || ''}
                  onChange={(e) => setFormData({ ...formData, hero_chip4_title: e.target.value })}
                  placeholder="Hỗ Trợ 24/7"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs font-semibold"
                />
                <input
                  type="text"
                  value={formData.hero_chip4_sub || ''}
                  onChange={(e) => setFormData({ ...formData, hero_chip4_sub: e.target.value })}
                  placeholder="Zalo & Telegram"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-[11px] text-gray-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 3: SUPABASE DATABASE HEALTH & DIAGNOSTICS */}
      {(() => {
        const diag = getSupabaseDiagnostics();
        return (
          <div className="glass-card rounded-3xl p-6 border border-black/5 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center space-x-2 font-semibold text-sm">
                <Database className="w-4 h-4 text-accent" strokeWidth={1.5} />
                <span>Trạng Thái Kết Nối Supabase Cloud (Database Health)</span>
              </div>
              <div>
                {diag.isConfigured ? (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Đã Kết Nối Thực Tế (Cloud Active)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>LocalStorage Fallback (Chưa Nối Supabase)</span>
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-1">
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">VITE_SUPABASE_URL</span>
                <p className="font-mono text-xs text-gray-800 dark:text-gray-200">
                  {diag.maskedUrl}
                </p>
                <span className={`text-[10px] ${diag.urlValid ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {diag.urlValid ? '✓ Định dạng URL hợp lệ' : '✗ Chưa cấu hình hoặc URL không hợp lệ'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-1">
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">VITE_SUPABASE_ANON_KEY</span>
                <p className="font-mono text-xs text-gray-800 dark:text-gray-200">
                  {diag.maskedKey}
                </p>
                <span className={`text-[10px] ${diag.keyValid ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {diag.keyValid ? '✓ Public Key hợp lệ' : '✗ Chưa cấu hình hoặc Key không hợp lệ'}
                </span>
              </div>
            </div>

            {!diag.isConfigured && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2 text-amber-900 dark:text-amber-200">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Cách kích hoạt kết nối Supabase Cloud trên Vercel:</span>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                  <li>Truy cập <strong>Vercel Dashboard</strong> &rarr; Chọn dự án <strong>BDuong Store</strong> &rarr; Vào tab <strong>Settings</strong> &rarr; <strong>Environment Variables</strong>.</li>
                  <li>Thêm 2 biến: <code>VITE_SUPABASE_URL</code> và <code>VITE_SUPABASE_ANON_KEY</code> lấy từ Supabase (Project Settings &rarr; API).</li>
                  <li><strong>BƯỚC QUAN TRỌNG NHẤT:</strong> Vào tab <strong>Deployments</strong> trên Vercel &rarr; Bấm vào dấu <strong>...</strong> của bản deploy mới nhất &rarr; Chọn <strong>Redeploy</strong> (Vite cần build lại để nhúng biến môi trường vào code).</li>
                  <li>Vào Supabase SQL Editor và chạy toàn bộ nội dung file <code>supabase_schema.sql</code>.</li>
                </ol>
              </div>
            )}
          </div>
        );
      })()}
    </form>
  );
};
