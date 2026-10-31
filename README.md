# 🍏 BDuong Store - Nền Tảng Bán Sản Phẩm Số Tự Động (Apple Minimalist Design)

BDuong Store là một Web Application phân phối bản quyền và sản phẩm số tự động (YouTube Premium, Tài khoản AI Gemini Pro, Muse AI, Khóa học) được thiết kế tuân thủ nghiêm ngặt theo **Apple Human Interface Guidelines**:
- Giao diện kính mờ (Glassmorphism / `backdrop-blur-md`), bo góc cong mềm mại (`rounded-2xl`, `rounded-3xl`), Bento Grid layout.
- Icon tối giản đơn sắc từ `lucide-react` với nét mảnh (`strokeWidth={1.5}`).
- Hệ thống Dynamic Accent Color và Dark/Light mode do Admin điều khiển theo thời gian thực.
- Cổng thanh toán VietQR động tự tạo mã và cơ chế **Giao Hàng Tự Động (Auto-Delivery)** trả tài khoản/key ngay trên màn hình trong 10 giây.
- **Tài khoản ngân hàng tích hợp sẵn:** **MBBank 2222226062005 - DANG BINH DUONG**.
- **Tự động quét biến động số dư và xác nhận chuyển khoản** theo thời gian thực (hỗ trợ SePay Open API & Supabase Webhook).
- Chế độ **Smart Fallback (LocalStorage)**: Ứng dụng chạy mượt mà ngay cả khi chưa kết nối Supabase, có sẵn nút chuyển đổi quyền Demo Admin / Khách hàng 1-click.

---

## ⚡ Hướng Dẫn Kích Hoạt Tự Động Xác Nhận Chuyển Khoản (MBBank)

Khi khách hàng quét mã VietQR, hệ thống sẽ tự động quét biến động số dư tài khoản MBBank **2222226062005** mỗi 3.5 giây. Khi phát hiện tiền đã vào tài khoản khớp với Mã Đơn Hàng (VD: `BDUONG8492`), hệ thống sẽ:
1. Tự động chuyển đơn sang `Đã Hoàn Thành`.
2. Tự động bốc tài khoản/key từ kho trả cho khách hàng ngay trên màn hình.
3. Bắn pháo hoa chúc mừng (`confetti`).

### Cách kích hoạt kiểm tra tự động qua SePay (Miễn phí 100%):
1. Đăng ký tài khoản miễn phí tại **[sepay.vn](https://sepay.vn)** (nền tảng kết nối thông báo biến động số dư ngân hàng hàng đầu tại Việt Nam).
2. Thêm số tài khoản ngân hàng của bạn: **MBBank** - **`2222226062005`** - **`DANG BINH DUONG`**.
3. Vào mục **API Key** trên SePay -> Sao chép API Token.
4. Mở BDuong Store -> Chuyển sang quyền **Admin** -> Vào tab **"Cài đặt Cửa hàng & Theme"** -> Dán Token vào ô **"SePay API Token"** -> Bấm **Lưu Toàn Bộ Cài Đặt**.
5. Hoàn tất! Kể từ lúc này, mọi khách hàng chuyển khoản thành công sẽ được kích hoạt đơn tự động 100% mà không cần Admin phải duyệt thủ công.

*(Nếu bạn chưa nhập Token SePay, khách hàng và Admin vẫn có thể bấm nút "Tôi đã chuyển khoản" hoặc Admin bấm "Duyệt đơn" trong trang quản trị để trải nghiệm ngay lập tức).*

---

## 🚀 Hướng Dẫn Khởi Chạy Dự Án (Local Development)

### 1. Cài đặt và chạy thử nghiệm ngay:
```bash
# 1. Cài đặt các thư viện phụ thuộc (nếu chưa cài)
npm install

# 2. Khởi động môi trường phát triển Vite
npm run dev
```
Trình duyệt sẽ mở tại `http://localhost:5173`. Bạn có thể trải nghiệm ngay lập tức các tính năng:
- Mua hàng -> Quét VietQR MBBank `2222226062005` -> Nhận tài khoản tức thì & pháo hoa chúc mừng.
- Bấm vào biểu tượng quyền ở góc phải Navbar (hoặc nút Đăng Nhập) để chuyển đổi giữa **Admin Demo** (vào trang quản trị, đổi màu theme, nạp kho) và **Khách Hàng**.

---

## 🗄️ Hướng Dẫn Kết Nối Supabase (Backend & Database)

Dự án đã chuẩn bị sẵn file `supabase_schema.sql` đầy đủ bảng, RLS, hàm RPC trả hàng tự động và Seed Data.

### Bước 1: Tạo dự án Supabase miễn phí
1. Truy cập [supabase.com](https://supabase.com) và tạo một Project mới (miễn phí).
2. Vào mục **SQL Editor** ở thanh menu bên trái.
3. Mở file `supabase_schema.sql` trong mã nguồn này, sao chép toàn bộ nội dung và dán vào SQL Editor, sau đó bấm **Run**.

### Bước 2: Cấu hình biến môi trường
1. Trong Supabase, vào **Project Settings** -> **API**.
2. Sao chép **Project URL** và **Project API anon key**.
3. Tạo file `.env` ở thư mục gốc của dự án (hoặc sao chép từ `.env.example`):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
4. Khởi động lại `npm run dev`. Lúc này ứng dụng sẽ tự động đồng bộ hóa với Supabase Database và Supabase Auth!

---

## 🌐 Hướng Dẫn Deploy Miễn Phí Lên Cloudflare Pages / Vercel

### Cách 1: Cloudflare Pages (Khuyên Dùng - Tốc độ nhanh nhất tại VN)
1. Đẩy mã nguồn lên kho chứa GitHub hoặc GitLab của bạn.
2. Truy cập [dash.cloudflare.com](https://dash.cloudflare.com) -> Chọn **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
3. Chọn Repository `BDuong-Store`:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. (Tùy chọn) Thêm 2 biến môi trường `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` trong phần **Environment variables**.
5. Bấm **Save and Deploy**. Website của bạn sẽ hoạt động toàn cầu với tên miền `*.pages.dev` miễn phí trọn đời!
