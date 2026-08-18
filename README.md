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
