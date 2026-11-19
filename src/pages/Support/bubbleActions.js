// src/pages/Support/bubbleActions.js — nút chuyển trang tự nhận diện trong tin nhắn AI
const ICON_BASE = "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/icons";

function getIconForPath(path) {
  if (path.startsWith("/store")) return `${ICON_BASE}/icon-rocket.png`;
  if (path.startsWith("/tasks") || path.startsWith("/shop-earn")) return `${ICON_BASE}/icon-task.png`;
  if (path.startsWith("/wallet")) return `${ICON_BASE}/icon-coin.png`;
  if (path.startsWith("/history") || path.startsWith("/profile") || path.startsWith("/community")) return `${ICON_BASE}/icon-link.png`;
  if (path.startsWith("/help") || path.startsWith("/contact")) return `${ICON_BASE}/icon-chat.png`;
  if (path.startsWith("https://zalo.me/")) return `${ICON_BASE}/icon-chat.png`;
  return `${ICON_BASE}/icon-rocket.png`;
}

const LABEL_MAP = {
  "/store": "Xem cửa hàng",
  "/store/roblox": "Đổi Robux",
  "/store/lien-quan": "Đổi Liên Quân",
  "/store/pubg-mobile": "Đổi PUBG",
  "/store/free-fire": "Đổi Free Fire",
  "/store/fc-mobile": "Đổi FC Mobile",
  "/store/valorant": "Đổi Valorant",
  "/store/play-together": "Đổi Play Together",
  "/tasks": "Làm nhiệm vụ",
  "/shop-earn": "Kiếm Coin",
  "/community": "Cộng đồng",
  "/wallet": "Xem ví",
  "/history": "Lịch sử đơn",
  "/profile": "Trang cá nhân",
  "/help": "Trung tâm trợ giúp",
  "/contact": "Liên hệ hỗ trợ",
  "https://zalo.me/0865245988": "Chat Zalo",
};

export function parseActionsFromText(text) {
  if (!text) return [];
  const found = [];
  const seen = new Set();
  const pathRegex = /(?:\/[a-z0-9\-]+(?:\/[a-z0-9\-]+)*|https:\/\/zalo\.me\/\d+)/gi;
  const VALID = ["/store", "/tasks", "/shop-earn", "/community", "/wallet", "/history", "/profile", "/help", "/contact"];
  let match;
  while ((match = pathRegex.exec(text)) !== null) {
    const path = match[0];
    if (seen.has(path)) continue;
    seen.add(path);
    const isValid = VALID.some((p) => path === p || path.startsWith(p + "/")) || path.startsWith("https://zalo.me/");
    if (!isValid) continue;
    found.push({
      label: LABEL_MAP[path] || path.replace(/^\/store\//, "Đổi ").replace(/^\//, ""),
      path,
      icon: getIconForPath(path),
    });
    if (found.length >= 4) break;
  }
  return found;
}
