// src/pages/Support/bubbleActions.js — nút chuyển trang tự nhận diện trong tin nhắn AI

const ICON_BASE = "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/icons";

function getIconForPath(path) {
  if (path.startsWith("/store")) return `${ICON_BASE}/icon-rocket.png`;
  if (path.startsWith("/tasks") || path.startsWith("/shop-earn")) return `${ICON_BASE}/icon-task.png`;
  if (path.startsWith("/wallet")) return `${ICON_BASE}/icon-coin.png`;
  if (path.startsWith("/history") || path.startsWith("/profile") || path.startsWith("/community"))
    return `${ICON_BASE}/icon-link.png`;
  if (path.startsWith("/help") || path.startsWith("/contact")) return `${ICON_BASE}/icon-chat.png`;
  if (/^https?:\/\/zalo\.me\//.test(path)) return `${ICON_BASE}/icon-chat.png`;
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

const VALID_PREFIXES = [
  "/store",
  "/tasks",
  "/shop-earn",
  "/community",
  "/wallet",
  "/history",
  "/profile",
  "/help",
  "/contact",
];

const MAX_ACTIONS = 4;

function isValidInternalPath(path) {
  return VALID_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));
}

function isZaloPath(path) {
  return /^https:\/\/zalo\.me\/\d+/.test(path);
}

// Label fallback: dùng label của prefix gần nhất trong LABEL_MAP
function resolveLabel(path) {
  if (LABEL_MAP[path]) return LABEL_MAP[path];

  if (path.startsWith("/store/")) {
    const slug = path.slice("/store/".length);
    // Nếu slug chỉ là 1 segment và không có trong map, vẫn tạo "Đổi X"
    if (slug && !slug.includes("/")) {
      return `Đổi ${slug.replace(/-/g, " ")}`;
    }
    return "Xem cửa hàng";
  }

  // Fallback: dùng label của prefix
  const prefix = VALID_PREFIXES.find((p) => path === p || path.startsWith(p + "/"));
  return prefix && LABEL_MAP[prefix] ? LABEL_MAP[prefix] : path;
}

export function parseActionsFromText(text) {
  if (!text) return [];

  // 1. Loại bỏ code block (```...``` và `...`) để không match path trong code
  const cleaned = String(text)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ");

  // 2. Loại bỏ URL có scheme để không match path nằm trong URL ngoài
  //    (giữ lại zalo.me vì đây là action hợp lệ)
  const withoutExternalUrls = cleaned.replace(
    /https?:\/\/(?!zalo\.me\/)\S+/gi,
    " "
  );

  const found = [];
  const seen = new Set();

  // Regex: path nội bộ (bắt đầu bằng /) hoặc link Zalo
  // Không match nếu đứng ngay sau ký tự word (tránh match trong "abc/store")
  const pathRegex = /(?<![\w/])(\/(?:[a-z0-9-]+)(?:\/[a-z0-9-]+)*)|(https:\/\/zalo\.me\/\d+)/gi;

  let match;
  while ((match = pathRegex.exec(withoutExternalUrls)) !== null) {
    const path = match[1] || match[2];
    if (!path) continue;
    if (seen.has(path)) continue;
    seen.add(path);

    const valid = isZaloPath(path) || isValidInternalPath(path);
    if (!valid) continue;

    found.push({
      label: resolveLabel(path),
      path,
      icon: getIconForPath(path),
    });

    if (found.length >= MAX_ACTIONS) break;
  }

  return found;
}
