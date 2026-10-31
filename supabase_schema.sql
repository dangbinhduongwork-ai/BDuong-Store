-- ==============================================================================
-- BDUONG STORE - SUPABASE DATABASE SCHEMA & SEED DATA
-- Apple Minimalist Digital Products Store
-- ==============================================================================

-- 1. PROFILES TABLE (Auth & RBAC)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('customer', 'admin')) DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. STORE_SETTINGS TABLE (Theme & Configuration controlled by Admin)
CREATE TABLE IF NOT EXISTS public.store_settings (
    id INT PRIMARY KEY DEFAULT 1,
    store_name TEXT NOT NULL DEFAULT 'BDuong Store',
    theme_mode TEXT NOT NULL CHECK (theme_mode IN ('light', 'dark', 'system')) DEFAULT 'system',
    accent_color TEXT NOT NULL DEFAULT '#0071E3',
    bank_id TEXT NOT NULL DEFAULT 'MBBank',
    bank_account TEXT NOT NULL DEFAULT '2222226062005',
    bank_owner TEXT NOT NULL DEFAULT 'DANG BINH DUONG',
    support_zalo TEXT DEFAULT 'https://zalo.me/2222226062005',
    support_telegram TEXT DEFAULT 'https://t.me/bduongstore',
    announcement TEXT DEFAULT '🔥 Chào mừng đến với BDuong Store - Cam kết bảo hành 1 đổi 1 suốt thời gian sử dụng!',
    sepay_api_token TEXT DEFAULT '',
    auto_check_payment BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. PRODUCTS TABLE (Digital Products & Auto-Delivery Stock)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('entertainment', 'ai', 'course')),
    price NUMERIC NOT NULL CHECK (price >= 0),
    duration TEXT NOT NULL,
    description TEXT,
    warranty_policy TEXT,
    icon_name TEXT DEFAULT 'Sparkles',
    stock_data TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. ORDERS TABLE (Order Transactions & Auto Delivery)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'refunded')) DEFAULT 'pending',
    delivered_credential TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Grant schema & table permissions to anon, authenticated & service_role API roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Store Settings Policies
CREATE POLICY "Store settings are viewable by everyone" 
ON public.store_settings FOR SELECT USING (true);

CREATE POLICY "Only admin can update store settings" 
ON public.store_settings FOR ALL 
USING (public.is_admin());

-- Products Policies
CREATE POLICY "Active products viewable by everyone" 
ON public.products FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Only admin can insert/update/delete products" 
ON public.products FOR ALL 
USING (public.is_admin());

-- Orders Policies
CREATE POLICY "Users can view own orders" 
ON public.orders FOR SELECT 
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can create orders" 
ON public.orders FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admin or system can update orders" 
ON public.orders FOR UPDATE 
USING (auth.uid() = user_id OR public.is_admin());

-- ==============================================================================
-- AUTO PROFILE TRIGGER (when new user registers in Supabase Auth)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    -- First registered user or specific email becomes admin, others customer
    CASE WHEN (SELECT count(*) FROM public.profiles) = 0 THEN 'admin' ELSE 'customer' END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- ATOMIC AUTO-DELIVERY FUNCTION (RPC)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.deliver_order(p_order_code TEXT)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_product RECORD;
  v_credential TEXT;
  v_remaining_stock TEXT[];
BEGIN
  -- 1. Fetch order
  SELECT * INTO v_order FROM public.orders WHERE order_code = p_order_code;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Order not found');
  END IF;

  IF v_order.status = 'completed' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Already completed', 'credential', v_order.delivered_credential);
  END IF;

  -- 2. Fetch product and lock row
  SELECT * INTO v_product FROM public.products WHERE id = v_order.product_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Product not found');
  END IF;

  -- 3. Check stock
  IF array_length(v_product.stock_data, 1) IS NULL OR array_length(v_product.stock_data, 1) = 0 THEN
    v_credential := 'Hệ thống đang chuẩn bị kho bổ sung. Vui lòng liên hệ Admin qua Zalo/Telegram với mã đơn ' || p_order_code || ' để được cấp ngay trong 5 phút!';
  ELSE
    -- Pop first item
    v_credential := v_product.stock_data[1];
    v_remaining_stock := v_product.stock_data[2:array_length(v_product.stock_data, 1)];
    
    -- Update product stock
    UPDATE public.products 
    SET stock_data = COALESCE(v_remaining_stock, '{}')
    WHERE id = v_product.id;
  END IF;

  -- 4. Mark order completed
  UPDATE public.orders 
  SET status = 'completed', delivered_credential = v_credential
  WHERE id = v_order.id;

  RETURN jsonb_build_object('success', true, 'credential', v_credential);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

-- 1. Settings
INSERT INTO public.store_settings (id, store_name, theme_mode, accent_color, bank_id, bank_account, bank_owner, support_zalo, support_telegram, announcement, sepay_api_token, auto_check_payment)
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
    '',
    true
) ON CONFLICT (id) DO UPDATE SET
    bank_id = EXCLUDED.bank_id,
    bank_account = EXCLUDED.bank_account,
    bank_owner = EXCLUDED.bank_owner,
    support_zalo = EXCLUDED.support_zalo;

-- 2. Seed Products
INSERT INTO public.products (name, category, price, duration, description, warranty_policy, icon_name, stock_data, is_active)
VALUES
(
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
),
(
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
),
(
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
),
(
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
),
(
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
);

