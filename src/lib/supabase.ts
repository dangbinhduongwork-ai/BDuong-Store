import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawAnonKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  ''
).trim();

// Verify valid URL and key
const isValidUrl = Boolean(
  rawUrl &&
  rawUrl.startsWith('https://') &&
  !rawUrl.includes('your-project-id') &&
  !rawUrl.includes('your-project')
);

const isValidKey = Boolean(
  rawAnonKey &&
  rawAnonKey.length > 20 &&
  !rawAnonKey.includes('your-anon-key') &&
  !rawAnonKey.includes('your_supabase')
);

export const isSupabaseConfigured = isValidUrl && isValidKey;

export const supabase = isSupabaseConfigured
  ? createClient(rawUrl, rawAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Diagnostics helper for UI & Debugging
export function getSupabaseDiagnostics() {
  return {
    isConfigured: isSupabaseConfigured,
    urlSet: Boolean(rawUrl),
    urlValid: isValidUrl,
    maskedUrl: rawUrl ? rawUrl.replace(/(https:\/\/[^.]+).*/, '$1.supabase.co') : 'Chưa cấu hình',
    keySet: Boolean(rawAnonKey),
    keyValid: isValidKey,
    maskedKey: rawAnonKey ? `${rawAnonKey.slice(0, 10)}...${rawAnonKey.slice(-6)}` : 'Chưa cấu hình',
  };
}

// Log status to browser console
if (typeof window !== 'undefined') {
  if (isSupabaseConfigured) {
    console.info(
      `%c[BDuong Store] 🟢 Supabase đã kết nối thành công tới: ${rawUrl}`,
      'color: #10B981; font-weight: bold; font-size: 12px;'
    );
  } else {
    console.warn(
      '%c[BDuong Store] 🟠 Đang chạy chế độ LocalStorage Fallback (Chưa kết nối Supabase)',
      'color: #F59E0B; font-weight: bold; font-size: 12px;'
    );
    console.info(
      '👉 Để kết nối Database thực tế trên Vercel/Local, vui lòng khai báo:\n' +
      '  - VITE_SUPABASE_URL=https://[project-id].supabase.co\n' +
      '  - VITE_SUPABASE_ANON_KEY=[anon_public_key]\n' +
      'Sau đó hãy Redeploy lại trên Vercel (không dùng cache).'
    );
  }
}
