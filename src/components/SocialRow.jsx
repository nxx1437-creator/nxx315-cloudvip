import React from "react";

/**
 * SocialRow.jsx
 * -----------------------------------------------------------------
 * Hàng 4 icon đăng nhập nhanh: Facebook, Google, TikTok, Discord —
 * giống đúng bố cục ảnh mẫu. Facebook/Google/Discord gọi thật qua
 * Supabase OAuth (onSelect prop). TikTok Supabase KHÔNG hỗ trợ sẵn
 * (không có trong danh sách provider chuẩn) nên tạm để placeholder,
 * báo "sắp có" khi bấm — khi nào cần dùng thật phải tự cấu hình
 * Custom OAuth provider phía Supabase.
 * -----------------------------------------------------------------
 */
export default function SocialRow({ onSelect }) {
  const items = [
    {
      key: "facebook",
      label: "Facebook",
      supported: true,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
        </svg>
      ),
    },
    {
      key: "google",
      label: "Google",
      supported: true,
      icon: (
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
          <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.5 16 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.6 0-14.1 4.3-17.7 10.7z" />
          <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.1-5.1l-6.5-5.5C29.5 35.1 26.9 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.6 5.1C9.8 39.6 16.3 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.5 5.5C40.9 36.5 44 30.9 44 24c0-1.3-.1-2.7-.4-3.5z" />
        </svg>
      ),
    },
    {
      key: "tiktok",
      label: "TikTok",
      supported: false,
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
          <path d="M16.6 5.82c-1.02-.9-1.6-2.2-1.6-3.62h-3.2v13.3c0 1.6-1.3 2.9-2.9 2.9s-2.9-1.3-2.9-2.9 1.3-2.9 2.9-2.9c.3 0 .58.05.85.13V9.4a6.1 6.1 0 0 0-.85-.06c-3.4 0-6.1 2.76-6.1 6.16S6.35 21.66 9.8 21.66s6.1-2.76 6.1-6.16V8.9c1.27.9 2.83 1.43 4.5 1.43V7.1c-1.4 0-2.68-.5-3.8-1.28Z" />
        </svg>
      ),
    },
    {
      key: "discord",
      label: "Discord",
      supported: true,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#5865F2">
          <path d="M20.3 5.4A18 18 0 0 0 15.9 4l-.24.47a13 13 0 0 1 3.86 1.5 15.3 15.3 0 0 0-13 0 13 13 0 0 1 3.9-1.5L10.1 4a18 18 0 0 0-4.4 1.4C3 9 2.2 12.5 2.5 16a18.4 18.4 0 0 0 5.5 2.7l.7-1.1a11.6 11.6 0 0 1-1.9-.9c.16-.1.3-.24.46-.35a13 13 0 0 0 11.5 0c.16.1.3.24.46.35-.6.35-1.24.65-1.9.9l.7 1.1A18.3 18.3 0 0 0 21.5 16c.4-4-.7-7.5-1.2-10.6ZM9.1 14.1c-.8 0-1.44-.75-1.44-1.67 0-.93.63-1.68 1.44-1.68.82 0 1.46.76 1.44 1.68 0 .92-.62 1.67-1.44 1.67Zm5.8 0c-.8 0-1.44-.75-1.44-1.67 0-.93.63-1.68 1.44-1.68.82 0 1.46.76 1.44 1.68 0 .92-.62 1.67-1.44 1.67Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex items-center justify-center gap-3">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onSelect(item.key, item.supported)}
          aria-label={item.label}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] transition hover:bg-white/[0.12]"
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
}
