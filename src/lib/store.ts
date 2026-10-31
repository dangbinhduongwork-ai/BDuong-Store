import { Product, StoreSettings, Order, UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';
import { INITIAL_SETTINGS, INITIAL_PRODUCTS, INITIAL_ORDERS, DEMO_ADMIN, DEMO_CUSTOMER } from './initialData';

const SETTINGS_KEY = 'bduong_store_settings';
const PRODUCTS_KEY = 'bduong_store_products';
const ORDERS_KEY = 'bduong_store_orders';
const USER_KEY = 'bduong_store_user';

export class AppStore {
  // Check if we are using real Supabase or fallback
  static isRealBackend(): boolean {
    return isSupabaseConfigured && supabase !== null;
  }

  // --- SETTINGS ---
  static async getSettings(): Promise<StoreSettings> {
    if (this.isRealBackend() && supabase) {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('*')
          .single();
        if (data && !error) return data as StoreSettings;
      } catch (e) {
        console.warn('Failed to fetch settings from Supabase, using local fallback:', e);
      }
    }
    const local = localStorage.getItem(SETTINGS_KEY);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.bank_account === '0987654321') {
          parsed.bank_account = INITIAL_SETTINGS.bank_account;
          parsed.bank_owner = INITIAL_SETTINGS.bank_owner;
          parsed.bank_id = INITIAL_SETTINGS.bank_id;
          parsed.support_zalo = INITIAL_SETTINGS.support_zalo;
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(parsed));
        }
        if (!parsed.sepay_api_token && INITIAL_SETTINGS.sepay_api_token) {
          parsed.sepay_api_token = INITIAL_SETTINGS.sepay_api_token;
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(parsed));
        }
        return { ...INITIAL_SETTINGS, ...parsed };
      } catch {
        // fallback
      }
    }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(INITIAL_SETTINGS));
    return INITIAL_SETTINGS;
  }

  static async updateSettings(newSettings: Partial<StoreSettings>): Promise<StoreSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...newSettings };

    if (this.isRealBackend() && supabase) {
      try {
        await supabase
          .from('store_settings')
          .update(updated)
          .eq('id', updated.id || 1);
      } catch (e) {
        console.warn('Failed to update settings in Supabase:', e);
      }
    }

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  }

  // --- PRODUCTS ---
  static async getProducts(): Promise<Product[]> {
    if (this.isRealBackend() && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        if (data && !error && data.length > 0) return data as Product[];
      } catch (e) {
        console.warn('Failed to fetch products from Supabase, using local fallback:', e);
      }
    }
    const local = localStorage.getItem(PRODUCTS_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        // fallback
      }
    }
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }

  static async saveProduct(product: Partial<Product>): Promise<Product> {
    const products = await this.getProducts();
    let savedProduct: Product;

    if (product.id) {
      // Update
      const index = products.findIndex((p) => p.id === product.id);
      if (index >= 0) {
        savedProduct = { ...products[index], ...product } as Product;
        products[index] = savedProduct;
      } else {
        savedProduct = {
          ...product,
          id: product.id,
          name: product.name || 'Sản phẩm mới',
          category: product.category || 'entertainment',
          price: product.price || 0,
          duration: product.duration || '1 Tháng',
          description: product.description || '',
          warranty_policy: product.warranty_policy || '',
          icon_name: product.icon_name || 'Sparkles',
          stock_data: product.stock_data || [],
          is_active: product.is_active ?? true,
          created_at: new Date().toISOString(),
        } as Product;
        products.unshift(savedProduct);
      }
    } else {
      // Create
      savedProduct = {
        id: 'prod-' + Date.now(),
        name: product.name || 'Sản phẩm mới',
        category: product.category || 'entertainment',
        price: product.price || 0,
        duration: product.duration || '1 Tháng',
        description: product.description || '',
        warranty_policy: product.warranty_policy || '',
        icon_name: product.icon_name || 'Sparkles',
        stock_data: product.stock_data || [],
        is_active: product.is_active ?? true,
        created_at: new Date().toISOString(),
      };
      products.unshift(savedProduct);
    }

    if (this.isRealBackend() && supabase) {
      try {
        await supabase.from('products').upsert(savedProduct);
      } catch (e) {
        console.warn('Failed to save product in Supabase:', e);
      }
    }

    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    return savedProduct;
  }

  static async deleteProduct(id: string): Promise<boolean> {
    let products = await this.getProducts();
    products = products.filter((p) => p.id !== id);

    if (this.isRealBackend() && supabase) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (e) {
        console.warn('Failed to delete product in Supabase:', e);
      }
    }

    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    return true;
  }

  // --- ORDERS & AUTO-DELIVERY ---
  static async getOrders(): Promise<Order[]> {
    if (this.isRealBackend() && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        if (data && !error) return data as Order[];
      } catch (e) {
        console.warn('Failed to fetch orders from Supabase, using local fallback:', e);
      }
    }
    const local = localStorage.getItem(ORDERS_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        // fallback
      }
    }
    localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  }

  static async createOrder(orderData: Omit<Order, 'id' | 'created_at'>): Promise<Order> {
    const orders = await this.getOrders();
    const newOrder: Order = {
      ...orderData,
      id: 'ord-' + Date.now(),
      created_at: new Date().toISOString(),
    };

    if (this.isRealBackend() && supabase) {
      try {
        const { data } = await supabase
          .from('orders')
          .insert(newOrder)
          .select()
          .single();
        if (data) return data as Order;
      } catch (e) {
        console.warn('Failed to insert order in Supabase:', e);
      }
    }

    orders.unshift(newOrder);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    return newOrder;
  }

  static async deliverOrder(orderCode: string): Promise<{ success: boolean; credential?: string; message?: string }> {
    // 1. If Supabase configured, try RPC deliver_order
    if (this.isRealBackend() && supabase) {
      try {
        const { data, error } = await supabase.rpc('deliver_order', {
          p_order_code: orderCode,
        });
        if (!error && data && data.success) {
          return { success: true, credential: data.credential };
        }
      } catch (e) {
        console.warn('RPC deliver_order failed, proceeding with local fallback logic:', e);
      }
    }

    // 2. Local fallback logic (Atomically pops from product stock and attaches to order)
    const orders = await this.getOrders();
    const orderIndex = orders.findIndex((o) => o.order_code === orderCode);
    if (orderIndex === -1) {
      return { success: false, message: 'Không tìm thấy đơn hàng' };
    }

    const order = orders[orderIndex];
    if (order.status === 'completed' && order.delivered_credential) {
      return { success: true, credential: order.delivered_credential };
    }

    const products = await this.getProducts();
    const productIndex = products.findIndex((p) => p.id === order.product_id);
    let credential = '';

    if (productIndex >= 0) {
      const prod = products[productIndex];
      const stock = [...(prod.stock_data || [])];
      if (stock.length > 0) {
        // Pop first account
        credential = stock.shift() || '';
        prod.stock_data = stock;
        products[productIndex] = prod;
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
      } else {
        credential = `Hệ thống đang chuẩn bị kho bổ sung cho sản phẩm "${order.product_name}". Vui lòng liên hệ Admin qua Zalo/Telegram với mã đơn ${order.order_code} để được cấp ngay lập tức!`;
      }
    } else {
      credential = `Đơn hàng ${order.order_code} đã kích hoạt thành công. Vui lòng liên hệ Admin để nhận thông tin đăng nhập!`;
    }

    order.status = 'completed';
    order.delivered_credential = credential;
    orders[orderIndex] = order;
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

    return { success: true, credential };
  }

  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
    const orders = await this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index >= 0) {
      orders[index].status = status;
      if (this.isRealBackend() && supabase) {
        try {
          await supabase.from('orders').update({ status }).eq('id', orderId);
        } catch (e) {
          console.warn('Failed to update order status in Supabase:', e);
        }
      }
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      return true;
    }
    return false;
  }

  // --- USER PROFILE & AUTH ---
  static getCurrentUser(): UserProfile | null {
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // fallback
      }
    }
    return null;
  }

  static setCurrentUser(user: UserProfile | null): void {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }
}

