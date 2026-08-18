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
