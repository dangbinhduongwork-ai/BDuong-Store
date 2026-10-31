-- ==============================================================================
-- BDUONG STORE - KÍCH HOẠT ĐẦY ĐỦ QUYỀN VÀ KẾT NỐI SUPABASE + SEPAY
-- HƯỚNG DẪN: Copy toàn bộ nội dung file này -> Dán vào Supabase SQL Editor -> Nhấn RUN
-- ==============================================================================

-- 1. ĐẢM BẢO CÁC CỘT VÀ BẢNG ĐẦY ĐỦ
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('customer', 'admin')) DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.store_settings (
    id SERIAL PRIMARY KEY,
    store_name TEXT NOT NULL DEFAULT 'BDuong Store',
    theme_mode TEXT NOT NULL DEFAULT 'system',
    accent_color TEXT NOT NULL DEFAULT '#0071E3',
    bank_id TEXT NOT NULL DEFAULT 'MBBank',
    bank_account TEXT NOT NULL DEFAULT '2222226062005',
    bank_owner TEXT NOT NULL DEFAULT 'DANG BINH DUONG',
    support_zalo TEXT DEFAULT 'https://zalo.me/2222226062005',
    support_telegram TEXT DEFAULT 'https://t.me/bduongstore',
    announcement TEXT DEFAULT '🔥 Chào mừng đến với BDuong Store - Cam kết bảo hành 1 đổi 1 suốt thời gian sử dụng!',
    sepay_api_token TEXT DEFAULT 'NWWB8YFASXJODRPTTLPCDJYEIA95VZCFSPZYXSKGB1UOORHLEZMGBGXJ9WD3AZQ2',
    auto_check_payment BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'entertainment',
    price NUMERIC NOT NULL CHECK (price >= 0),
    duration TEXT NOT NULL,
    description TEXT,
    warranty_policy TEXT,
    icon_name TEXT DEFAULT 'Sparkles',
    stock_data TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_email TEXT,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'refunded')) DEFAULT 'pending',
    delivered_credential TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Thêm cột nếu bảng đã tồn tại từ trước nhưng thiếu
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_check;

-- 2. CẤP QUYỀN TRUY CẬP TẤT CẢ BẢNG CHO API (ANON & AUTHENTICATED)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 3. BẬT RLS VÀ TẠO CHÍNH SÁCH MỞ (CHO PHÉP THÊM/SỬA/XÓA TỪ GIAO DIỆN)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Xóa các policy cũ để tránh xung đột
DROP POLICY IF EXISTS "Active products viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Only admin can insert/update/delete products" ON public.products;
DROP POLICY IF EXISTS "Allow public read products" ON public.products;
DROP POLICY IF EXISTS "Allow public insert products" ON public.products;
DROP POLICY IF EXISTS "Allow public update products" ON public.products;
DROP POLICY IF EXISTS "Allow public delete products" ON public.products;

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admin or system can update orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public all orders" ON public.orders;

DROP POLICY IF EXISTS "Store settings are viewable by everyone" ON public.store_settings;
DROP POLICY IF EXISTS "Only admin can update store settings" ON public.store_settings;
DROP POLICY IF EXISTS "Allow public read settings" ON public.store_settings;
DROP POLICY IF EXISTS "Allow public update settings" ON public.store_settings;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow public all profiles" ON public.profiles;

-- Tạo policy mới mở hoàn toàn cho Store hoạt động trơn tru
CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update products" ON public.products FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete products" ON public.products FOR DELETE USING (true);

CREATE POLICY "Allow public all orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Allow public update settings" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- 4. HÀM TỰ ĐỘNG PHÁT HÀNG KHI THANH TOÁN (DELIVER_ORDER RPC)
CREATE OR REPLACE FUNCTION public.deliver_order(p_order_code TEXT)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_product RECORD;
  v_credential TEXT;
  v_remaining_stock TEXT[];
BEGIN
  -- 1. Lấy đơn hàng
  SELECT * INTO v_order FROM public.orders WHERE order_code = p_order_code;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Không tìm thấy đơn hàng');
  END IF;

  IF v_order.status = 'completed' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Đơn đã hoàn thành từ trước', 'credential', v_order.delivered_credential);
  END IF;

  -- 2. Lấy sản phẩm và lock row
  SELECT * INTO v_product FROM public.products WHERE id = v_order.product_id FOR UPDATE;
  
  -- 3. Kiểm tra kho thẻ/link
  IF v_product IS NOT NULL AND array_length(v_product.stock_data, 1) > 0 THEN
    v_credential := v_product.stock_data[1];
    v_remaining_stock := v_product.stock_data[2:array_length(v_product.stock_data, 1)];
    
    UPDATE public.products 
    SET stock_data = COALESCE(v_remaining_stock, '{}')
    WHERE id = v_product.id;
  ELSE
    v_credential := 'Hệ thống đang chuẩn bị gói. Vui lòng liên hệ Admin qua Zalo/Telegram với mã đơn ' || p_order_code || ' để nhận hỗ trợ ngay!';
  END IF;

  -- 4. Cập nhật đơn hàng thành công
  UPDATE public.orders 
  SET status = 'completed', delivered_credential = v_credential
  WHERE id = v_order.id;

  RETURN jsonb_build_object('success', true, 'credential', v_credential);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.deliver_order(TEXT) TO anon, authenticated, service_role;

-- 5. CẬP NHẬT CẤU HÌNH CỬA HÀNG & SEPAY TOKEN CHÍNH XÁC
INSERT INTO public.store_settings (
    id, store_name, theme_mode, accent_color, bank_id, bank_account, bank_owner, support_zalo, support_telegram, announcement, sepay_api_token, auto_check_payment
)
VALUES (
    1,
    'BDuong Store',
    'system',
    '#0071E3',
    'MBBank',
    '2222226062005',
    'DANG BINH DUONG',
    'https://zalo.me/2222226062005',
    'https://t.me/bduongstore',
    '🔥 Chào mừng đến với BDuong Store - Cam kết bảo hành 1 đổi 1 suốt thời gian sử dụng!',
    'NWWB8YFASXJODRPTTLPCDJYEIA95VZCFSPZYXSKGB1UOORHLEZMGBGXJ9WD3AZQ2',
    true
)
ON CONFLICT (id) DO UPDATE SET
    bank_id = 'MBBank',
    bank_account = '2222226062005',
    bank_owner = 'DANG BINH DUONG',
    sepay_api_token = 'NWWB8YFASXJODRPTTLPCDJYEIA95VZCFSPZYXSKGB1UOORHLEZMGBGXJ9WD3AZQ2',
    auto_check_payment = true;
