# CloudVIP Landing Page

Trang giới thiệu cho nền tảng kiếm Coin đổi Robux chính hãng (nạp qua tài khoản VNG).

## Cấu trúc file (đặt đúng tên khi tạo trên GitHub)

```
cloudvip-landing/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── CloudVIPLanding.jsx
    └── index.css
```

## Cấu hình hệ thống Nhiệm vụ (Token-based Validation)

1. Chạy `supabase/schema.sql` trước (nếu chưa chạy).
2. Chạy tiếp `supabase/schema_tasks.sql` trong SQL Editor — tạo bảng `tasks`, `task_tokens`, `task_completions` và 2 hàm `start_task()` / `consume_task_token()` xử lý toàn bộ luồng Token (sinh token TTL 15 phút → xác thực → khóa token → cộng Coin), có sẵn 3 nhiệm vụ mẫu (LAYMA, LINK4M, TRAFFIC68).
3. Sửa lại dữ liệu mẫu trong bảng `tasks` (Table Editor) cho đúng nhiệm vụ thật của bạn: `reward_coins`, `daily_limit`, `logo_url`...

### ⚠️ Về bước "vượt link" — cần bạn hoàn thiện thêm

Hiện tại `src/lib/taskProviders.js` đang ở **chế độ test**: bấm "Làm nhiệm vụ" sẽ bỏ qua bước quảng cáo và nhận thưởng ngay, để bạn kiểm tra luồng Token hoạt động đúng trước.

Để bắt buộc người dùng thật sự đi qua quảng cáo của Layma/Link4m/Traffic68 trước khi nhận thưởng, bạn cần:
1. Đăng ký làm publisher (CTV) trên từng dịch vụ, lấy API Key từ trang "Developers API" của họ.
2. **Không được gọi API đó thẳng từ trình duyệt** (lộ API Key cho bất kỳ ai xem Network tab). Cần tạo 1 Supabase Edge Function nhỏ giữ API Key ở phía server, nhận `{ provider, longUrl }` và trả về link rút gọn.
3. Sửa `buildTaskUrl()` trong `taskProviders.js` để gọi Edge Function đó thay vì trả thẳng `callbackUrl`.

Nếu muốn, nhắn để được hướng dẫn viết Edge Function này khi bạn đã có API Key thật trong tay.

## Cấu hình Supabase (bắt buộc để Đăng nhập/Đăng ký hoạt động)

1. Tạo project miễn phí tại https://supabase.com
2. Vào **Project Settings → API**, copy `Project URL` và `anon public key`
3. Tạo file `.env` ở thư mục gốc (copy từ `.env.example`), điền 2 giá trị trên:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJxxxx...
   ```
4. Bật đăng nhập Google/Discord: vào **Authentication → Providers**, bật `Google` và `Discord`, điền Client ID/Secret lấy từ Google Cloud Console và Discord Developer Portal.
5. Vào **Authentication → URL Configuration**, thêm domain thật của bạn (ví dụ `https://nxx315-cloudvip.vercel.app`) vào `Redirect URLs`.
6. Nếu muốn test nhanh không cần xác nhận email: **Authentication → Providers → Email**, tắt `Confirm email` (nhớ bật lại khi lên production).

**Trên Vercel:** vào Project Settings → Environment Variables, thêm `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` (file `.env` không được đẩy lên GitHub vì đã có trong `.gitignore`).

## Chạy thử ở máy local

```bash
npm install
npm run dev
```

Mở http://localhost:5173

## Đưa lên GitHub

```bash
git init
git add .
git commit -m "CloudVIP landing page"
git branch -M main
git remote add origin <URL_repo_cua_ban>
git push -u origin main
```

## Build production

```bash
npm run build
```

File build nằm trong thư mục `dist/`, có thể deploy lên Vercel, Netlify, hoặc GitHub Pages.
