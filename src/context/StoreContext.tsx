import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, StoreSettings, Order, UserProfile, UserRole } from '../types';
import { AppStore } from '../lib/store';
import { hexToRgb } from '../lib/utils';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Helper format lỗi Auth từ Supabase sang Tiếng Việt thân thiện
function formatAuthError(msg: string): string {
  const lower = (msg || '').toLowerCase();
  if (lower.includes('invalid login credentials') || lower.includes('invalid_grant')) {
    return 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!';
  }
  if (lower.includes('user already registered') || lower.includes('already exists')) {
    return 'Email này đã được đăng ký tài khoản. Vui lòng chuyển sang Đăng Nhập!';
  }
  if (lower.includes('password should be at least 6 characters')) {
    return 'Mật khẩu phải chứa tối thiểu 6 ký tự!';
  }
  if (lower.includes('email not confirmed')) {
    return 'Email chưa được kích hoạt. Vui lòng kiểm tra hộp thư đến (hoặc tắt Confirm Email trên Supabase)!';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests') || lower.includes('over_email_send_rate_limit')) {
    return 'Hệ thống giới hạn tạo tài khoản liên tiếp để chống spam. Vui lòng đăng nhập tài khoản đã tạo hoặc chờ ít phút!';
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Lỗi kết nối mạng đến máy chủ Supabase. Vui lòng thử lại sau giây lát!';
  }
  return msg;
}

interface StoreContextType {
  user: UserProfile | null;
  settings: StoreSettings;
  products: Product[];
  orders: Order[];
  loading: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  setAccentColor: (hex: string) => void;
  refreshData: () => Promise<void>;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
  saveProduct: (product: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<boolean>;
  createOrder: (order: Omit<Order, 'id' | 'created_at'>) => Promise<Order>;
  deliverOrder: (orderCode: string) => Promise<{ success: boolean; credential?: string; message?: string }>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<boolean>;
  loginWithSupabase: (email: string, pass: string) => Promise<{ error?: string }>;
  registerWithSupabase: (email: string, pass: string) => Promise<{ error?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string; message?: string }>;
  changePassword: (newPass: string) => Promise<{ error?: string; message?: string }>;
  users: UserProfile[];
  fetchUsers: () => Promise<UserProfile[]>;
  updateUserRole: (userId: string, role: UserRole) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => AppStore.getCurrentUser());
  const [settings, setSettings] = useState<StoreSettings>({
    store_name: 'BDuong Store',
    theme_mode: 'light',
    accent_color: '#0071E3',
    bank_id: 'MBBank',
    bank_account: '2222226062005',
    bank_owner: 'DANG BINH DUONG',
    support_phone: '0865.087.784',
    support_zalo: 'https://zalo.me/0865087784',
    support_telegram: 'https://t.me/bduongstore',
    announcement: '🔥 Chào mừng đến với BDuong Store - Cam kết bảo hành 1 đổi 1 suốt thời gian sử dụng!',
    sepay_api_token: import.meta.env.VITE_SEPAY_API_TOKEN || '',
    auto_check_payment: true,
    hero_badge: 'Bản Quyền Số • Kích Hoạt Tự Động',
    hero_title: 'Tài khoản số chính hãng.',
    hero_highlight: 'Giao ngay tức thì trong 10 giây.',
    hero_description: 'Giải trí YouTube Premium, AI Gemini / Muse Pro và khóa học chuyên sâu với chính sách Bảo hành 1 đổi 1 trọn thời gian.',
    hero_cta_primary: 'Khám Phá Sản Phẩm',
    hero_cta_secondary: 'Tư Vấn Zalo',
    hero_chip1_title: 'Giao Tự Động',
    hero_chip1_sub: 'Trả tài khoản 24/7',
    hero_chip2_title: 'Bảo Hành 1 Đổi 1',
    hero_chip2_sub: 'Trọn thời gian gói',
    hero_chip3_title: 'VietQR MBBank',
    hero_chip3_sub: 'Khớp lệnh tự động',
    hero_chip4_title: 'Hỗ Trợ 24/7',
    hero_chip4_sub: 'Zalo & Telegram',
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Apply theme & accent color to DOM
  const applyTheme = (mode: 'light' | 'dark' | 'system', accent: string) => {
    let shouldDark = false;
    if (mode === 'dark') {
      shouldDark = true;
    } else if (mode === 'system') {
      shouldDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      shouldDark = false;
    }

    setIsDarkMode(shouldDark);
    if (shouldDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply accent color
    const root = document.documentElement;
    root.style.setProperty('--accent-color', accent);
    root.style.setProperty('--accent-rgb', hexToRgb(accent));
  };

  // Initial load
  const refreshData = async () => {
    setLoading(true);
    try {
      const [fetchedSettings, fetchedProducts, fetchedOrders] = await Promise.all([
        AppStore.getSettings(),
        AppStore.getProducts(),
        AppStore.getOrders(),
      ]);

      setSettings(fetchedSettings);
      setProducts(fetchedProducts);
      setOrders(fetchedOrders);
      applyTheme(fetchedSettings.theme_mode, fetchedSettings.accent_color);
    } catch (e) {
      console.error('Error loading store data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();

    // If Supabase is connected, maintain session and listen to Auth state changes
    if (isSupabaseConfigured && supabase) {
      const client = supabase;

      // 1. Recover active session immediately on page load
      const initSession = async () => {
        try {
          const { data: { session } } = await client.auth.getSession();
          if (session?.user) {
            let role: UserRole = 'customer';
            try {
              const { data: profile } = await client
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              if (profile?.role) {
                role = profile.role as UserRole;
              } else if (session.user.email?.toLowerCase().includes('admin') || session.user.email?.toLowerCase().includes('bduong')) {
                role = 'admin';
              }
            } catch {
              if (session.user.email?.toLowerCase().includes('admin') || session.user.email?.toLowerCase().includes('bduong')) {
                role = 'admin';
              }
            }

            const userProfile: UserProfile = {
              id: session.user.id,
              email: session.user.email || '',
              role,
            };
            setUser(userProfile);
            AppStore.setCurrentUser(userProfile);
          }
        } catch (e) {
          console.debug('Error getting initial session:', e);
        }
      };
      initSession();

      // 2. Real-time auth state listener
      const { data: authListener } = client.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          setUser(null);
          AppStore.setCurrentUser(null);
        } else if (session?.user) {
          try {
            const { data: profile } = await client
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            const role = (profile?.role as UserRole) || 'customer';
            const userProfile: UserProfile = {
              id: session.user.id,
              email: session.user.email || '',
              role,
            };
            setUser(userProfile);
            AppStore.setCurrentUser(userProfile);
          } catch (e) {
            console.debug('Error updating user profile in auth listener:', e);
          }
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const toggleDarkMode = () => {
    const nextMode = isDarkMode ? 'light' : 'dark';
    applyTheme(nextMode, settings.accent_color);
    updateSettings({ theme_mode: nextMode });
  };

  const setThemeMode = (mode: 'light' | 'dark' | 'system') => {
    applyTheme(mode, settings.accent_color);
    updateSettings({ theme_mode: mode });
  };

  const setAccentColor = (hex: string) => {
    applyTheme(settings.theme_mode, hex);
    updateSettings({ accent_color: hex });
  };

  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    const updated = await AppStore.updateSettings(newSettings);
    setSettings(updated);
    if (newSettings.theme_mode || newSettings.accent_color) {
      applyTheme(updated.theme_mode, updated.accent_color);
    }
  };

  const saveProduct = async (product: Partial<Product>) => {
    const saved = await AppStore.saveProduct(product);
    await refreshData();
    return saved;
  };

  const deleteProduct = async (id: string) => {
    const result = await AppStore.deleteProduct(id);
    await refreshData();
    return result;
  };

  const createOrder = async (orderData: Omit<Order, 'id' | 'created_at'>) => {
    const created = await AppStore.createOrder(orderData);
    await refreshData();
    return created;
  };

  const deliverOrder = async (orderCode: string) => {
    const result = await AppStore.deliverOrder(orderCode);
    await refreshData();
    return result;
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const ok = await AppStore.updateOrderStatus(orderId, status);
    await refreshData();
    return ok;
  };

  const loginWithSupabase = async (email: string, pass: string): Promise<{ error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!isSupabaseConfigured || !supabase) {
      const customUser: UserProfile = {
        id: 'usr-' + Date.now(),
        email: cleanEmail,
        role: cleanEmail.includes('admin') || cleanEmail.includes('bduong') ? 'admin' : 'customer',
      };
      setUser(customUser);
      AppStore.setCurrentUser(customUser);
      return {};
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: pass,
    });
    if (error) return { error: formatAuthError(error.message) };

    if (data.user) {
      let role: UserRole = 'customer';
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        if (profile?.role) {
          role = profile.role as UserRole;
        } else if (cleanEmail.includes('admin') || cleanEmail.includes('bduong')) {
          role = 'admin';
        }
      } catch {
        if (cleanEmail.includes('admin') || cleanEmail.includes('bduong')) {
          role = 'admin';
        }
      }

      const userProfile: UserProfile = {
        id: data.user.id,
        email: data.user.email || cleanEmail,
        role,
      };
      setUser(userProfile);
      AppStore.setCurrentUser(userProfile);
    }
    return {};
  };

  const registerWithSupabase = async (email: string, pass: string): Promise<{ error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!isSupabaseConfigured || !supabase) {
      const customUser: UserProfile = {
        id: 'usr-' + Date.now(),
        email: cleanEmail,
        role: cleanEmail.includes('admin') || cleanEmail.includes('bduong') ? 'admin' : 'customer',
      };
      setUser(customUser);
      AppStore.setCurrentUser(customUser);
      return {};
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: pass,
    });
    if (error) return { error: formatAuthError(error.message) };

    if (data.user) {
      let role: UserRole = 'customer';
      try {
        // Wait 300ms for trigger on_auth_user_created to populate public.profiles
        await new Promise((r) => setTimeout(r, 350));
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        if (profile?.role) {
          role = profile.role as UserRole;
        } else if (cleanEmail.includes('admin') || cleanEmail.includes('bduong')) {
          role = 'admin';
        }
      } catch {
        if (cleanEmail.includes('admin') || cleanEmail.includes('bduong')) {
          role = 'admin';
        }
      }

      const userProfile: UserProfile = {
        id: data.user.id,
        email: data.user.email || cleanEmail,
        role,
      };
      setUser(userProfile);
      AppStore.setCurrentUser(userProfile);
    }
    return {};
  };

  const resetPassword = async (email: string): Promise<{ error?: string; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!isSupabaseConfigured || !supabase) {
      return { message: 'Đã gửi liên kết khôi phục mật khẩu vào email của bạn!' };
    }
    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}` : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: redirectUrl,
    });
    if (error) return { error: formatAuthError(error.message) };
    return { message: 'Đã gửi liên kết khôi phục mật khẩu vào email! Vui lòng kiểm tra hộp thư đến (inbox/spam).' };
  };

  const changePassword = async (newPass: string): Promise<{ error?: string; message?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { message: 'Đã cập nhật mật khẩu mới thành công!' };
    }
    const { error } = await supabase.auth.updateUser({
      password: newPass,
    });
    if (error) return { error: formatAuthError(error.message) };
    return { message: 'Đã đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới của bạn.' };
  };

  const fetchUsers = async (): Promise<UserProfile[]> => {
    try {
      const fetched = await AppStore.getUsers();
      setUsers(fetched);
      return fetched;
    } catch (e) {
      console.error('Error fetching users:', e);
      return [];
    }
  };

  const updateUserRole = async (userId: string, role: UserRole): Promise<boolean> => {
    const success = await AppStore.updateUserRole(userId, role);
    if (success) {
      await fetchUsers();
      // If updating current user role
      if (user && user.id === userId) {
        const updated = { ...user, role };
        setUser(updated);
        AppStore.setCurrentUser(updated);
      }
    }
    return success;
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    const success = await AppStore.deleteUser(userId);
    if (success) {
      await fetchUsers();
    }
    return success;
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error(e);
      }
    }
    setUser(null);
    AppStore.setCurrentUser(null);
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        settings,
        products,
        orders,
        loading,
        isDarkMode,
        toggleDarkMode,
        setThemeMode,
        setAccentColor,
        refreshData,
        updateSettings,
        saveProduct,
        deleteProduct,
        createOrder,
        deliverOrder,
        updateOrderStatus,
        loginWithSupabase,
        registerWithSupabase,
        resetPassword,
        changePassword,
        users,
        fetchUsers,
        updateUserRole,
        deleteUser,
        logout,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
