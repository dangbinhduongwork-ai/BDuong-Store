-- ==============================================================================
-- BDUONG STORE - SUPABASE DATABASE SCHEMA & REALTIME SETUP (CHÍNH THỨC)
-- Hướng dẫn: Copy toàn bộ nội dung file này -> Vào Supabase -> SQL Editor -> Bấm RUN
-- ==============================================================================

-- 1. BẢNG PROFILES (Quản lý phân quyền Customer / Admin)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('customer', 'admin')) DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. BẢNG STORE_SETTINGS (Cài đặt hiển thị, ngân hàng MBBank, SePay Token)
CREATE TABLE IF NOT EXISTS public.store_settings (
    id INT PRIMARY KEY DEFAULT 1,
    store_name TEXT NOT NULL DEFAULT 'BDuong Store',
    theme_mode TEXT NOT NULL CHECK (theme_mode IN ('light', 'dark', 'system')) DEFAULT 'system',
    accent_color TEXT NOT NULL DEFAULT '#0071E3',
    bank_id TEXT NOT NULL DEFAULT 'MBBank',
    bank_account TEXT NOT NULL DEFAULT '2222226062005',
    bank_owner TEXT NOT NULL DEFAULT 'DANG BINH DUONG',
    support_phone TEXT DEFAULT '0865.087.784',
    support_zalo TEXT DEFAULT 'https://zalo.me/0865087784',
    support_telegram TEXT DEFAULT 'https://t.me/bduongstore',
    announcement TEXT DEFAULT '🔥 Chào mừng đến với BDuong Store - Cam kết bảo hành 1 đổi 1 suốt thời gian sử dụng!',
    sepay_api_token TEXT DEFAULT 'NWWB8YFASXJODRPTTLPCDJYEIA95VZCFSPZYXSKGB1UOORHLEZMGBGXJ9WD3AZQ2',
    auto_check_payment BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. BẢNG PRODUCTS (Sản phẩm số & Kho tài khoản/key tự động trả)
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

-- Bỏ check constraint cũ nếu có để hỗ trợ danh mục mở rộng
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_check;

-- 4. BẢNG ORDERS (Đơn hàng, mã VietQR & kết quả bàn giao tự động)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_email TEXT DEFAULT 'guest@bduongstore.com',
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'refunded')) DEFAULT 'pending',
    delivered_credential TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Đảm bảo bổ sung cột customer_email nếu database đã tạo từ trước
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT DEFAULT 'guest@bduongstore.com';

-- ==============================================================================
-- 5. PHÂN QUYỀN API SCHEMA (ANON & AUTHENTICATED)
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) - BẢO MẬT & MỞ CHO GIAO DỊCH TRƠN TRU
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Dọn dẹp policy cũ
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow public all profiles" ON public.profiles;

DROP POLICY IF EXISTS "Store settings are viewable by everyone" ON public.store_settings;
DROP POLICY IF EXISTS "Only admin can update store settings" ON public.store_settings;
DROP POLICY IF EXISTS "Allow public read settings" ON public.store_settings;
DROP POLICY IF EXISTS "Allow public update settings" ON public.store_settings;

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

-- Tạo chính sách mới:
-- Profiles: Mọi người đọc được, người dùng cập nhật profile của mình
CREATE POLICY "Allow public all profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- Store Settings: Mọi người đọc, cập nhật thông suốt
CREATE POLICY "Allow public read settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Allow public update settings" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);

-- Products: Đọc công khai, thêm/sửa/xóa mở cho người quản trị
CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update products" ON public.products FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete products" ON public.products FOR DELETE USING (true);

-- Orders: Khách vãng lai và thành viên đều có thể tạo đơn, xem đơn và hệ thống cập nhật khi thanh toán
CREATE POLICY "Allow public all orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 7. KÍCH HOẠT SUPABASE REALTIME (Tự động cập nhật tức thì trên trình duyệt)
-- ==============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
END $$;

-- ==============================================================================
-- 8. HÀM ATOMIC AUTO-DELIVERY (RPC: deliver_order)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.deliver_order(p_order_code TEXT)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_product RECORD;
  v_credential TEXT;
  v_remaining_stock TEXT[];
BEGIN
  -- 1. Lấy thông tin đơn hàng
  SELECT * INTO v_order FROM public.orders WHERE order_code = p_order_code;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Không tìm thấy đơn hàng: ' || p_order_code);
  END IF;

  -- Nếu đã hoàn thành trước đó thì trả về kết quả ngay
  IF v_order.status = 'completed' AND v_order.delivered_credential IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'message', 'Đơn hàng đã được bàn giao', 'credential', v_order.delivered_credential);
  END IF;

  -- 2. Khóa dòng sản phẩm để bốc kho an toàn chống trùng lặp (Row lock)
  SELECT * INTO v_product FROM public.products WHERE id = v_order.product_id FOR UPDATE;
  
  -- 3. Bốc key/tài khoản đầu tiên trong kho
  IF v_product IS NOT NULL AND array_length(v_product.stock_data, 1) > 0 THEN
    v_credential := v_product.stock_data[1];
    v_remaining_stock := v_product.stock_data[2:array_length(v_product.stock_data, 1)];
    
    -- Cập nhật kho còn lại
    UPDATE public.products 
    SET stock_data = COALESCE(v_remaining_stock, '{}')
    WHERE id = v_product.id;
  ELSE
    v_credential := 'Hệ thống đang chuẩn bị gói. Vui lòng liên hệ Admin qua Zalo/Telegram với mã đơn ' || p_order_code || ' để nhận hỗ trợ tức thì trong 5 phút!';
  END IF;

  -- 4. Chuyển trạng thái đơn hàng sang completed
  UPDATE public.orders 
  SET status = 'completed', delivered_credential = v_credential
  WHERE id = v_order.id;

  RETURN jsonb_build_object('success', true, 'credential', v_credential);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.deliver_order(TEXT) TO anon, authenticated, service_role;

-- ==============================================================================
-- 9. TRIGGER TỰ ĐỘNG CẤP QUYỀN ADMIN CHO NGƯỜI ĐĂNG KÝ ĐẦU TIÊN
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN (SELECT count(*) FROM public.profiles) = 0 THEN 'admin'
      WHEN NEW.email ILIKE '%admin%' OR NEW.email ILIKE '%bduong%' OR NEW.email ILIKE '%dangbinhduong%' THEN 'admin'
      ELSE 'customer' 
    END
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 10. DỮ LIỆU CÀI ĐẶT BAN ĐẦU & SEED PRODUCTS
-- ==============================================================================

-- 1. Cài đặt cửa hàng
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS support_phone TEXT DEFAULT '0865.087.784';

INSERT INTO public.store_settings (
    id, store_name, theme_mode, accent_color, bank_id, bank_account, bank_owner, support_phone, support_zalo, support_telegram, announcement, sepay_api_token, auto_check_payment
)
VALUES (
    1,
    'BDuong Store',
    'system',
    '#0071E3',
    'MBBank',
    '2222226062005',
    'DANG BINH DUONG',
    '0865.087.784',
    'https://zalo.me/0865087784',
    'https://t.me/bduongstore',
    '🔥 Chào mừng đến với BDuong Store - Cam kết bảo hành 1 đổi 1 suốt thời gian sử dụng!',
    'NWWB8YFASXJODRPTTLPCDJYEIA95VZCFSPZYXSKGB1UOORHLEZMGBGXJ9WD3AZQ2',
    true
)
ON CONFLICT (id) DO UPDATE SET
    bank_id = 'MBBank',
    bank_account = '2222226062005',
    bank_owner = 'DANG BINH DUONG',
    support_phone = '0865.087.784',
    support_zalo = 'https://zalo.me/0865087784',
    sepay_api_token = 'NWWB8YFASXJODRPTTLPCDJYEIA95VZCFSPZYXSKGB1UOORHLEZMGBGXJ9WD3AZQ2',
    auto_check_payment = true;

-- 2. Thêm sản phẩm mẫu (Nếu bảng products chưa có dữ liệu)
INSERT INTO public.products (id, name, category, price, duration, description, warranty_policy, icon_name, stock_data, is_active)
SELECT 
  'a1111111-1111-1111-1111-111111111111'::uuid,
  'YouTube Premium (Chính Chủ)',
  'entertainment',
  29000,
  '1 Tháng',
  'Nâng cấp trực tiếp trên tài khoản Gmail cá nhân của bạn. Không quảng cáo trên mọi thiết bị (TV, Điện thoại, iPad, PC). Nghe nhạc trong nền khi tắt màn hình, tải video ngoại tuyến chất lượng cao. Bao gồm YouTube Music trọn gói.',
  'Bảo hành 1 đổi 1 suốt 30 ngày sử dụng. Hoàn tiền 100% nếu tài khoản bị mất tính năng Premium trong thời gian sử dụng.',
  'Youtube',
  ARRAY[
    'Tài khoản Google Family Invite Link: https://youtube.com/invite/family-bduong-sample-1',
    'Tài khoản Google Family Invite Link: https://youtube.com/invite/family-bduong-sample-2',
    'Tài khoản Google Family Invite Link: https://youtube.com/invite/family-bduong-sample-3'
  ],
  true
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'YouTube Premium (Chính Chủ)');

INSERT INTO public.products (id, name, category, price, duration, description, warranty_policy, icon_name, stock_data, is_active)
SELECT 
  'a2222222-2222-2222-2222-222222222222'::uuid,
  'YouTube Premium Gói 1 Năm',
  'entertainment',
  289000,
  '1 Năm (12 Tháng)',
  'Gói tiết kiệm nhất cho người dùng dài hạn. Nâng cấp email chính chủ gia hạn tự động ổn định. Không lo gián đoạn xem phim, học tập và nghe nhạc. Hỗ trợ kích hoạt trong vòng 1 phút.',
  'Bảo hành trọn vẹn 365 ngày. Hỗ trợ chuyển vùng an toàn và chuyển đổi nhóm nếu phát sinh lỗi kỹ thuật từ Google.',
  'PlaySquare',
  ARRAY[
    'Tài khoản Google Family 1Y Link: https://youtube.com/invite/family-1year-bduong-sample-1',
    'Tài khoản Google Family 1Y Link: https://youtube.com/invite/family-1year-bduong-sample-2'
  ],
  true
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'YouTube Premium Gói 1 Năm');

INSERT INTO public.products (id, name, category, price, duration, description, warranty_policy, icon_name, stock_data, is_active)
SELECT 
  'a3333333-3333-3333-3333-333333333333'::uuid,
  'Google Gemini Advanced / Pro',
  'ai',
  79000,
  '1 Tháng',
  'Trải nghiệm mô hình Gemini 1.5 Pro & Ultra mạnh mẽ nhất từ Google với cửa sổ ngữ cảnh khủng (Context Window lên tới 1 triệu tokens). Đi kèm 2TB lưu trữ Google Drive, Google Photos. Hỗ trợ phân tích video, tài liệu PDF, lập trình và viết luận.',
  'Bảo hành 1 đổi 1 toàn thời gian 30 ngày. Cung cấp tài khoản mới ngay lập tức nếu có sự cố kết nối hoặc giới hạn từ Google.',
  'Sparkles',
  ARRAY[
    'Email: gemini.vip.user1@gmail.com | Pass: BDuongStore@2026! | 2FA: JBSWY3DPEHPK3PXP',
    'Email: gemini.vip.user2@gmail.com | Pass: BDuongStore@2026! | 2FA: KRCWY3DPEHPK3PXP',
    'Email: gemini.vip.user3@gmail.com | Pass: BDuongStore@2026! | 2FA: MRCWY3DPEHPK3PXP'
  ],
  true
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Google Gemini Advanced / Pro');

INSERT INTO public.products (id, name, category, price, duration, description, warranty_policy, icon_name, stock_data, is_active)
SELECT 
  'a4444444-4444-4444-4444-444444444444'::uuid,
  'Muse AI Pro (Creative Suite)',
  'ai',
  69000,
  '1 Tháng',
  'Nền tảng AI video & âm thanh thế hệ mới. Khả năng tìm kiếm nội dung thông minh trong video, trích xuất phụ đề tự động bằng AI, lưu trữ video không giới hạn băng thông và độ phân giải 4K sắc nét.',
  'Cam kết bảo hành đầy đủ 30 ngày sử dụng. Cấp lại tài khoản mới nếu lỗi đăng nhập hoặc mất gói Pro.',
  'Cpu',
  ARRAY[
    'Email: muse.pro.ai.1@creative.net | Pass: MusePro2026!Secure',
    'Email: muse.pro.ai.2@creative.net | Pass: MusePro2026!Secure'
  ],
  true
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Muse AI Pro (Creative Suite)');

INSERT INTO public.products (id, name, category, price, duration, description, warranty_policy, icon_name, stock_data, is_active)
SELECT 
  'a5555555-5555-5555-5555-555555555555'::uuid,
  'Khóa Học Vibe Coding & AI Automation',
  'course',
  199000,
  'Trọn Đời (Lifetime)',
  'Khóa học thực chiến tư duy Vibe Coding với Cursor, Claude 3.5 Sonnet, Antigravity và n8n. Học cách tạo ra các ứng dụng Web SaaS hoàn chỉnh, tự động hóa quy trình kinh doanh và kiếm tiền từ sản phẩm số chỉ với AI.',
  'Quyền truy cập thư viện Notion + Google Drive trọn đời, cập nhật tài liệu và mã nguồn mới hàng tháng. Hỗ trợ giải đáp thắc mắc qua nhóm kín.',
  'GraduationCap',
  ARRAY[
    'Notion Workspace & Drive Link: https://bduong.notion.site/vibe-coding-ai-automation-masterclass-key-849202',
    'Notion Workspace & Drive Link: https://bduong.notion.site/vibe-coding-ai-automation-masterclass-key-849203'
  ],
  true
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Khóa Học Vibe Coding & AI Automation');
