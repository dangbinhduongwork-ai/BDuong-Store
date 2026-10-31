import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, StoreSettings, Order, UserProfile } from '../types';
import { AppStore } from '../lib/store';
import { hexToRgb } from '../lib/utils';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
    support_zalo: 'https://zalo.me/2222226062005',
    support_telegram: 'https://t.me/bduongstore',
    announcement: '🔥 Chào mừng đến với BDuong Store - Cam kết bảo hành 1 đổi 1 suốt thời gian sử dụng!',
    sepay_api_token: import.meta.env.VITE_SEPAY_API_TOKEN || '',
    auto_check_payment: true,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
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

    // If Supabase is connected, listen to Auth state changes
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      const { data: authListener } = client.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          try {
            const { data: profile } = await client
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            const role = profile?.role || 'customer';
            const userProfile: UserProfile = {
              id: session.user.id,
              email: session.user.email || '',
              role,
            };
            setUser(userProfile);
            AppStore.setCurrentUser(userProfile);
          } catch (e) {
            console.error('Error fetching profile from Supabase:', e);
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

  const loginWithSupabase = async (email: string, pass: string) => {
    if (!isSupabaseConfigured || !supabase) {
      const customUser: UserProfile = {
        id: 'usr-' + Date.now(),
        email,
        role: email.toLowerCase().includes('admin') ? 'admin' : 'customer',
      };
      setUser(customUser);
      AppStore.setCurrentUser(customUser);
      return {};
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) return { error: error.message };
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      const userProfile: UserProfile = {
        id: data.user.id,
        email: data.user.email || '',
        role: profile?.role || 'customer',
      };
      setUser(userProfile);
      AppStore.setCurrentUser(userProfile);
    }
    return {};
  };

  const registerWithSupabase = async (email: string, pass: string) => {
    if (!isSupabaseConfigured || !supabase) {
      const customUser: UserProfile = {
        id: 'usr-' + Date.now(),
        email,
        role: 'customer',
      };
      setUser(customUser);
      AppStore.setCurrentUser(customUser);
      return {};
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
    });
    if (error) return { error: error.message };
    if (data.user) {
      const userProfile: UserProfile = {
        id: data.user.id,
        email: data.user.email || '',
        role: 'customer',
      };
      setUser(userProfile);
      AppStore.setCurrentUser(userProfile);
    }
    return {};
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
