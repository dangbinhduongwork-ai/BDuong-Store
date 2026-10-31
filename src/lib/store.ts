import { Product, StoreSettings, Order, UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';
import { INITIAL_SETTINGS, INITIAL_PRODUCTS, INITIAL_ORDERS } from './initialData';

const SETTINGS_KEY = 'bduong_store_settings';
const PRODUCTS_KEY = 'bduong_store_products';
const ORDERS_KEY = 'bduong_store_orders';
const USER_KEY = 'bduong_store_user';

const isUuid = (val?: string) => 
  Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

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
        if (data && !error) {
          const settings = data as StoreSettings;
          if (!settings.sepay_api_token && import.meta.env.VITE_SEPAY_API_TOKEN) {
            settings.sepay_api_token = import.meta.env.VITE_SEPAY_API_TOKEN;
          }
          return settings;
        }
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
        if (data && !error) {
          localStorage.setItem(PRODUCTS_KEY, JSON.stringify(data));
          return data as Product[];
        }
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
    const generateFallbackId = () => 
      (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'prod-' + Date.now();

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
      // Create new
      savedProduct = {
        id: generateFallbackId(),
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

    // Sync to Supabase
    if (this.isRealBackend() && supabase) {
      try {
        if (product.id && isUuid(product.id)) {
          // Update existing UUID product in Supabase
          const { data, error } = await supabase
            .from('products')
            .upsert(savedProduct)
            .select()
            .single();
          if (data && !error) savedProduct = data as Product;
          if (error) console.error('Supabase upsert error:', error);
        } else {
          // Insert new product: omit fake id so PostgreSQL generates a genuine UUID
          const { id: _ignore, ...newProductData } = savedProduct;
          const { data, error } = await supabase
            .from('products')
            .insert(newProductData)
            .select()
            .single();
          if (data && !error) {
            savedProduct = data as Product;
            products[0] = savedProduct;
          }
          if (error) console.error('Supabase insert error:', error);
        }
      } catch (e) {
        console.error('Failed to save product in Supabase:', e);
      }
    }

    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    return savedProduct;
  }

  static async deleteProduct(id: string): Promise<boolean> {
    let products = await this.getProducts();
    products = products.filter((p) => p.id !== id);

    if (this.isRealBackend() && supabase && isUuid(id)) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) console.error('Supabase delete error:', error);
      } catch (e) {
        console.error('Failed to delete product in Supabase:', e);
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
    const newId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'ord-' + Date.now();
    let newOrder: Order = {
      ...orderData,
      id: newId,
      created_at: new Date().toISOString(),
    };

    if (this.isRealBackend() && supabase) {
      try {
        const { id: _ignore, ...supabasePayload } = newOrder;
        // If product_id is not a valid UUID, omit it to avoid foreign key violation
        if (!isUuid(supabasePayload.product_id)) {
          delete (supabasePayload as any).product_id;
        }
        if (!isUuid(supabasePayload.user_id)) {
          delete (supabasePayload as any).user_id;
        }

        const { data, error } = await supabase
          .from('orders')
          .insert(supabasePayload)
          .select()
          .single();
        if (data && !error) newOrder = data as Order;
        if (error) console.warn('Supabase order insert warning:', error);
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
        credential = stock.shift() || '';
        prod.stock_data = stock;
        products[productIndex] = prod;
        await this.saveProduct(prod);
      } else {
        credential = `Hệ thống đang chuẩn bị kho bổ sung cho sản phẩm "${order.product_name}". Vui lòng liên hệ Admin qua Zalo/Telegram với mã đơn ${order.order_code} để được cấp ngay lập tức!`;
      }
    } else {
      credential = `Đơn hàng ${order.order_code} đã kích hoạt thành công. Vui lòng liên hệ Admin để nhận thông tin đăng nhập!`;
    }

    order.status = 'completed';
    order.delivered_credential = credential;
    orders[orderIndex] = order;

    if (this.isRealBackend() && supabase) {
      try {
        await supabase
          .from('orders')
          .update({ status: 'completed', delivered_credential: credential })
          .eq('order_code', orderCode);
      } catch (e) {
        console.warn('Failed to update order status in Supabase:', e);
      }
    }

    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    return { success: true, credential };
  }

  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
    const orders = await this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index >= 0) {
      orders[index].status = status;
      if (this.isRealBackend() && supabase && isUuid(orderId)) {
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
