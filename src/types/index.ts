export type ProductCategory = 'all' | 'entertainment' | 'ai' | 'course';

export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  created_at?: string;
}

export interface StoreSettings {
  id?: number;
  store_name: string;
  theme_mode: 'light' | 'dark' | 'system';
  accent_color: string;
  bank_id: string;
  bank_account: string;
  bank_owner: string;
  support_phone?: string;
  support_zalo: string;
  support_telegram: string;
  announcement: string;
  sepay_api_token?: string;
  auto_check_payment?: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: 'entertainment' | 'ai' | 'course';
  price: number;
  duration: string;
  description: string;
  warranty_policy: string;
  icon_name: string;
  stock_data: string[]; // List of credentials/links ready for auto-delivery
  is_active: boolean;
  created_at?: string;
}

export type OrderStatus = 'pending' | 'completed' | 'refunded';

export interface Order {
  id: string;
  order_code: string;
  user_id?: string;
  customer_email?: string;
  product_id: string;
  product_name: string;
  amount: number;
  status: OrderStatus;
  delivered_credential?: string;
  created_at: string;
}
