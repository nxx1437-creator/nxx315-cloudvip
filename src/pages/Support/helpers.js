// src/pages/Support/helpers.js

import {
  GREETING_BY_CATEGORY,
  SUGGESTIONS_BY_CATEGORY,
} from "./constants.js";

export function getGreeting(category) {
  return (
    GREETING_BY_CATEGORY[category] ||
    `Chào bạn 🌸 Mình là NXX, trợ lý của NXX315 Studio.\n\nMình có thể giúp gì cho bạn hôm nay?`
  );
}

export function getSuggestions(category) {
  return (
    SUGGESTIONS_BY_CATEGORY[category] || SUGGESTIONS_BY_CATEGORY.other
  );
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMin = Math.floor((now - date) / 60000);
  const diffHour = Math.floor((now - date) / 3600000);
  const diffDay = Math.floor((now - date) / 86400000);

  if (diffMin < 1) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}

export function shouldShowLoginButton(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return (
    lower.includes("mật khẩu") ||
    lower.includes("đăng nhập") ||
    lower.includes("đăng ký") ||
    lower.includes("xác minh")
  );
}
