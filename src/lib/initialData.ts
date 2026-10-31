import { Product, StoreSettings, UserProfile, Order } from '../types';

export const INITIAL_SETTINGS: StoreSettings = {
  id: 1,
  store_name: 'BDuong Store',
  theme_mode: 'light',
  accent_color: '#0071E3', // Apple Blue
  bank_id: 'MBBank',
  bank_account: '2222226062005',
  bank_owner: 'DANG BINH DUONG',
  support_zalo: 'https://zalo.me/2222226062005',
  support_telegram: 'https://t.me/bduongstore',
  announcement: '🔥 Chào mừng đến với BDuong Store - Cam kết bảo hành 1 đổi 1 suốt thời gian sử dụng!',
  sepay_api_token: import.meta.env.VITE_SEPAY_API_TOKEN || '',
  auto_check_payment: true,
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-ytb-1m',
    name: 'YouTube Premium (Chính Chủ)',
    category: 'entertainment',
    price: 29000,
    duration: '1 Tháng',
    description: `Nâng cấp trực tiếp trên tài khoản Gmail cá nhân của bạn, không ảnh hưởng đến lịch sử xem và danh sách bài hát yêu thích.
• Xem video hoàn toàn không bị quảng cáo làm phiền trên mọi thiết bị: Smart TV, iPhone, iPad, Android, Mac, PC.
• Phát trong nền (Background Play) và nghe nhạc khi tắt màn hình điện thoại cực kỳ mượt mà.
• Đi kèm quyền lợi YouTube Music Premium chất lượng âm thanh cao.
• Hỗ trợ tải video và danh sách bài hát nghe offline khi đi máy bay hoặc không có mạng.`,
    warranty_policy: `• Cam kết bảo hành 1 đổi 1 trọn vẹn 30 ngày sử dụng.
• Nếu nhóm gia đình phát sinh lỗi kỹ thuật, hỗ trợ cấp link nhóm mới trong vòng 5 phút.
• Hoàn tiền tương ứng thời gian chưa sử dụng nếu lỗi từ phía nhà cung cấp mà không thể khắc phục.
• Không yêu cầu mật khẩu Gmail của khách, đảm bảo an toàn bảo mật tuyệt đối 100%.`,
    icon_name: 'Youtube',
    stock_data: [
      'Tài khoản Google Family Invite Link: https://youtube.com/invite/family-bduong-sample-1',
      'Tài khoản Google Family Invite Link: https://youtube.com/invite/family-bduong-sample-2',
      'Tài khoản Google Family Invite Link: https://youtube.com/invite/family-bduong-sample-3',
      'Tài khoản Google Family Invite Link: https://youtube.com/invite/family-bduong-sample-4',
    ],
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-ytb-1y',
    name: 'YouTube Premium Gói 1 Năm',
    category: 'entertainment',
    price: 289000,
    duration: '1 Năm (12 Tháng)',
    description: `Gói cước dài hạn siêu tiết kiệm dành cho người dùng yêu thích sự ổn định.
• Tiết kiệm hơn 60% so với mua trực tiếp qua Apple App Store.
• Kích hoạt vào nhóm gia đình uy tín, hạn chế tối đa việc phải đổi nhóm.
• Toàn bộ tính năng cao cấp nhất của YouTube Premium & YouTube Music.
• Hỗ trợ gia hạn liên tục không gián đoạn sau khi hết hạn 1 năm.`,
    warranty_policy: `• Cam kết bảo hành trọn vẹn 365 ngày (1 năm).
• Đội ngũ kỹ thuật hỗ trợ 24/7 qua Zalo/Telegram.
• Xử lý sự cố kích hoạt trong vòng 5 - 15 phút.
• Cam kết hoàn tiền nếu không duy trì đủ thời gian cam kết.`,
    icon_name: 'PlaySquare',
    stock_data: [
      'Tài khoản Google Family 1Y Link: https://youtube.com/invite/family-1year-bduong-sample-1',
      'Tài khoản Google Family 1Y Link: https://youtube.com/invite/family-1year-bduong-sample-2',
    ],
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-gemini-pro',
    name: 'Google Gemini Advanced / Pro',
    category: 'ai',
    price: 79000,
    duration: '1 Tháng',
    description: `Trải nghiệm mô hình trí tuệ nhân tạo thế hệ mới tân tiến nhất từ Google (Gemini 1.5 Pro & Ultra).
• Cửa sổ ngữ cảnh (Context Window) lên tới 1 triệu tokens: đọc hiểu toàn bộ tài liệu PDF hàng ngàn trang, phân tích video dài 1 tiếng, review toàn bộ codebase lớn.
• Tích hợp trực tiếp 2TB dung lượng lưu trữ Google Drive, Google Photos tốc độ cao.
• Hỗ trợ phân tích dữ liệu, viết code lập trình, tạo dàn ý, soạn thảo email chuyên nghiệp.
• Sử dụng trực tiếp tại giao diện gemini.google.com mà không cần fake IP phức tạp.`,
    warranty_policy: `• Bảo hành 1 đổi 1 trong suốt 30 ngày sử dụng.
• Nếu tài khoản gặp lỗi giới hạn hoặc mất gói Pro, hệ thống tự động đổi tài khoản mới trong 10 phút.
• Đảm bảo tài khoản riêng tư, không chia sẻ chung với người lạ.`,
    icon_name: 'Sparkles',
    stock_data: [
      'Email: gemini.vip.user1@gmail.com | Pass: BDuongStore@2026! | 2FA: JBSWY3DPEHPK3PXP',
      'Email: gemini.vip.user2@gmail.com | Pass: BDuongStore@2026! | 2FA: KRCWY3DPEHPK3PXP',
      'Email: gemini.vip.user3@gmail.com | Pass: BDuongStore@2026! | 2FA: MRCWY3DPEHPK3PXP',
    ],
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-muse-ai',
    name: 'Muse AI Pro (Creative Suite)',
    category: 'ai',
    price: 69000,
    duration: '1 Tháng',
    description: `Nền tảng lưu trữ và tìm kiếm video bằng AI thông minh nhất hiện nay.
• Tự động tạo phụ đề (Auto-transcribe) đa ngôn ngữ cực chuẩn xác bằng mô hình nhận diện giọng nói AI.
• Tìm kiếm nội dung bên trong video bằng văn bản hoặc từ khóa trực quan.
• Trình phát video chuẩn 4K siêu mượt, không logo, hỗ trợ nhúng vào Website hoặc bài giảng trực tuyến.
• Cấp tài khoản đăng nhập trực tiếp sử dụng ngay lập tức sau khi hoàn tất mua hàng.`,
    warranty_policy: `• Bảo hành 1 đổi 1 đủ 30 ngày kể từ ngày kích hoạt.
• Cấp lại tài khoản mới tức thì nếu có sự cố mật khẩu hoặc đăng nhập.
• Hướng dẫn chi tiết cách bảo quản và tối ưu tài khoản sáng tạo.`,
    icon_name: 'Cpu',
    stock_data: [
      'Email: muse.pro.ai.1@creative.net | Pass: MusePro2026!Secure',
      'Email: muse.pro.ai.2@creative.net | Pass: MusePro2026!Secure',
    ],
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-course-vibe',
    name: 'Khóa Học Vibe Coding & AI Automation',
    category: 'course',
    price: 199000,
    duration: 'Trọn Đời (Lifetime)',
    description: `Khóa học thực chiến tư duy lập trình hiện đại thời đại AI: "Vibe Coding" và Tự động hóa quy trình.
• Làm chủ công cụ AI Coding hàng đầu: Cursor, Claude 3.5 Sonnet, Antigravity, GitHub Copilot.
• Quy trình xây dựng Full-stack Web App từ con số 0 trong vài giờ mà không cần nhớ cú pháp phức tạp.
• Tự động hóa công việc với n8n, Supabase Webhook và VietQR Payment Gateway.
• Nhận trọn bộ source code mẫu các dự án SaaS thực tế đã kiếm ra doanh thu.
• Trả link Notion Workspace & Google Drive tự động ngay sau khi thanh toán thành công.`,
    warranty_policy: `• Quyền truy cập trọn đời (Lifetime Access).
• Cập nhật các module bài học mới và prompt AI mới hàng tháng miễn phí.
• Cam kết link truy cập luôn luôn hoạt động 24/7/365.`,
    icon_name: 'GraduationCap',
    stock_data: [
      'Notion Workspace & Drive Link: https://bduong.notion.site/vibe-coding-ai-automation-masterclass-key-849202 (Mật khẩu tài liệu: bduong2026)',
      'Notion Workspace & Drive Link: https://bduong.notion.site/vibe-coding-ai-automation-masterclass-key-849203 (Mật khẩu tài liệu: bduong2026)',
    ],
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const DEMO_ADMIN: UserProfile = {
  id: 'usr-admin-demo',
  email: 'admin@bduongstore.com',
  role: 'admin',
  created_at: new Date().toISOString(),
};

export const DEMO_CUSTOMER: UserProfile = {
  id: 'usr-customer-demo',
  email: 'khachhang@gmail.com',
  role: 'customer',
  created_at: new Date().toISOString(),
};

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    order_code: 'BDUONG9821',
    user_id: 'usr-customer-demo',
    customer_email: 'khachhang@gmail.com',
    product_id: 'prod-ytb-1m',
    product_name: 'YouTube Premium (Chính Chủ)',
    amount: 29000,
    status: 'completed',
    delivered_credential: 'Tài khoản Google Family Invite Link: https://youtube.com/invite/family-bduong-sample-active (Nhấp vào link để vào nhóm gia đình)',
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    id: 'ord-1002',
    order_code: 'BDUONG9822',
    user_id: 'usr-customer-demo',
    customer_email: 'khachhang@gmail.com',
    product_id: 'prod-gemini-pro',
    product_name: 'Google Gemini Advanced / Pro',
    amount: 79000,
    status: 'completed',
    delivered_credential: 'Email: gemini.vip.user0@gmail.com | Pass: BDuongStore@2026! | 2FA: JBSWY3DPEHPK3PXP (Đăng nhập tại gemini.google.com)',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

