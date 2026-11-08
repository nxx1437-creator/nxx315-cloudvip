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

// ==================================================
// Làm sạch text AI: bỏ các dòng gọi tool (suggest_action(...), lookup_order(...)...)
// Dùng chung cho MarkdownText (hiển thị) và nút Sao chép.
// GIỮ LẠI path như "/store/roblox" để MessageBubble parse thành nút.
// ==================================================
const TOOL_NAMES = [
  "suggest_action",
  "lookup_order",
  "list_recent_orders",
  "send_guide_image",
];

export function cleanAIText(text) {
  if (!text) return "";
  let cleaned = text;

  for (const toolName of TOOL_NAMES) {
    const regex = new RegExp(
      `${toolName}\\s*\\([\\s\\S]*?\\)\\s*(?=\\n|$)`,
      "gi"
    );
    cleaned = cleaned.replace(regex, "");
  }

  cleaned = cleaned
    .split("\n")
    .filter(
      (line) =>
        !/suggest_action|lookup_order|list_recent_orders|send_guide_image/i.test(
          line
        )
    )
    .join("\n");

  return cleaned.replace(/\n{3,}/g, "\n\n").trim();
}
