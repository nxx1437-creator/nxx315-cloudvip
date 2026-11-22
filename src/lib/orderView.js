import {
  CheckCircle2,
  Clock3,
  CreditCard,
  RefreshCw,
  XCircle,
} from "lucide-react";

export const STORAGE_URL =
  "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos";

// Đổi số này thì nhớ đổi luôn "interval '23 hours'" trong hàm reply_to_order
export const REPLY_WINDOW_HOURS = 23;

const img = (file) => `${STORAGE_URL}/${file}`;

const PACKAGE_IMAGES = {
  "card-400": img("roblox-400.png"),
  "vng-40": img("roblox-40.png"),
  "vng-80": img("roblox-80.png"),
  "vng-500": img("roblox-500.png"),
};

const addAll = (prefix, values, file) =>
  values.forEach((v) => {
    PACKAGE_IMAGES[`${prefix}-${v}`] = img(file);
  });

addAll("ff", [25, 51, 113, 283, 566, 1132, 2830, 5750, 11500], "free-fire.png");
addAll("lq", [5, 10, 20, 50, 100, 200, 500, 1000, 2000], "lien-quan-mobile.png");
addAll("pubg", [30, 60, 140, 300, 600, 1500, 3000, 6000, 12000, 18000], "uc.png");
addAll("fco", [50, 100, 250, 500, 1200, 2500, 5000, 10000], "fc.png");
[9, 18, 45].forEach((v) => {
  PACKAGE_IMAGES[`pt-${v}`] = img(`play-together-${v}.png`);
});
[52, 110, 275, 610, 1220, 3040, 6550, 13250].forEach((v) => {
  PACKAGE_IMAGES[`vp-${v}`] = img(`vp-${v}.png`);
});

// Nếu logo game nào bị lỗi ảnh thì sửa tên file ở đây
const GAME_FALLBACK = {
  roblox: img("roblox.png"),
  lienquan: img("lien-quan-mobile.png"),
  playtogether: img("play-together.png"),
  freefire: img("free-fire.png"),
  topup: img("card-default.png"),
  pubg: img("pubg.png"),
  fco: img("fc-mobile.png"),
  valorant: img("valorant.png"),
};

const GAME_NAMES = {
  roblox: "Roblox",
  lienquan: "Liên Quân Mobile",
  playtogether: "Play Together",
  freefire: "Free Fire",
  topup: "Nạp thẻ cào",
  pubg: "PUBG Mobile VN",
  fco: "FC Mobile VN",
  valorant: "VALORANT",
};

const num = (v) => Number(v).toLocaleString("vi-VN");

export function detectGame(order) {
  const pid = String(order?.package_id || "").toLowerCase();
  const method = String(order?.payment_method || "").toLowerCase();

  if (method === "card" && pid.startsWith("card-")) return "topup";

  if (
    pid.startsWith("vng-") ||
    pid.startsWith("card-") ||
    pid.startsWith("rbx-") ||
    pid.includes("roblox") ||
    pid.includes("robux")
  )
    return "roblox";

  if (pid.startsWith("lq-") || pid.includes("lienquan")) return "lienquan";

  if (
    pid.startsWith("pt-") ||
    pid.includes("playtogether") ||
    pid.includes("play-together")
  )
    return "playtogether";

  if (
    pid.startsWith("ff-") ||
    pid.includes("freefire") ||
    pid.includes("free-fire")
  )
    return "freefire";

  if (
    pid.startsWith("pubg-") ||
    pid.includes("pubg") ||
    order?.pubg_uid != null ||
    order?.game === "pubg"
  )
    return "pubg";

  if (
    pid.startsWith("vp-") ||
    pid.includes("valorant") ||
    order?.riot_id != null ||
    order?.game === "valorant"
  )
    return "valorant";

  if (
    pid.startsWith("fco-") ||
    pid.includes("fco") ||
    pid.includes("fcmobile") ||
    pid.includes("fc-mobile") ||
    order?.fco_character_id != null ||
    order?.fco_fc != null ||
    order?.game === "fco"
  )
    return "fco";

  return null;
}

export const getGameName = (order) => GAME_NAMES[detectGame(order)] || null;

export function getOrderImage(order) {
  const gameKey = detectGame(order);
  return (
    order?.image ||
    order?.image_url ||
    order?.package_image ||
    order?.product_image ||
    order?.logo_url ||
    PACKAGE_IMAGES[order?.package_id] ||
    (gameKey ? GAME_FALLBACK[gameKey] : null) ||
    null
  );
}

const ITEM_FIELDS = [
  ["robux", "Robux"],
  ["quanhuy", "Quân Huy"],
  ["ff_diamond", "Kim Cương"],
  ["pt_gold", "Thỏi Vàng"],
  ["fco_fc", "FC"],
  ["vp", "VP"],
];

export function getItemRow(order) {
  if (order?.pubg_uc != null) {
    const bonus = Number(order.pubg_bonus || 0);
    return {
      label: "UC nhận được",
      value: `${num(order.pubg_uc)} UC${bonus > 0 ? ` + ${num(bonus)} Bonus` : ""}`,
    };
  }

  for (const [key, unit] of ITEM_FIELDS) {
    if (order?.[key] != null) {
      return { label: `${unit} nhận được`, value: `${num(order[key])} ${unit}` };
    }
  }
  return null;
}

export const getItemText = (order) => getItemRow(order)?.value || null;

export function getOrderTitle(order) {
  if (order?.package_name) return order.package_name;
  if (order?.product_name) return order.product_name;
  if (order?.name) return order.name;
  if (order?.title) return order.title;
  if (order?.game_name) return order.game_name;

  if (detectGame(order) === "topup" && order?.note) {
    return order.note.split(" - ")[0];
  }

  const item = getItemText(order);
  if (item) return item;

  if (order?.type === "redemption") return "Đổi thưởng";
  return "Đơn hàng";
}

export function getAccountRows(order) {
  const rows = [];
  const add = (label, value, copy = true) => {
    if (value !== null && value !== undefined && value !== "") {
      rows.push({ label, value, copy });
    }
  };

  add("Roblox", order?.roblox_username ? `@${order.roblox_username}` : null, false);
  add("Roblox ID", order?.roblox_user_id);
  if (
    order?.roblox_display_name &&
    order.roblox_display_name !== order.roblox_username
  ) {
    add("Display Name", order.roblox_display_name, false);
  }
  add("UID", order?.uid && !order?.pt_uid ? order.uid : null);
  add("UID Play Together", order?.pt_uid);
  add("UID Free Fire", order?.ff_uid);
  add("Character ID PUBG", order?.pubg_uid);
  add("Character Name FC Mobile", order?.fco_character_id);
  add("Riot ID", order?.riot_id);
  return rows;
}

export function statusInfo(status) {
  const key = String(status || "").toLowerCase();

  if (["delivered", "success", "completed", "done"].includes(key)) {
    return {
      key,
      group: "done",
      label: key === "delivered" ? "Đã giao" : "Hoàn thành",
      icon: CheckCircle2,
      className: "bg-emerald-50 text-emerald-600",
    };
  }
  if (key === "rejected") {
    return { key, group: "failed", label: "Đã từ chối", icon: XCircle, className: "bg-rose-50 text-rose-600" };
  }
  if (["cancelled", "canceled"].includes(key)) {
    return { key, group: "failed", label: "Đã hủy", icon: XCircle, className: "bg-gray-100 text-gray-600" };
  }
  if (key === "failed") {
    return { key, group: "failed", label: "Thất bại", icon: XCircle, className: "bg-rose-50 text-rose-600" };
  }
  if (key === "paid") {
    return { key, group: "active", label: "Đang kiểm tra", icon: CreditCard, className: "bg-blue-50 text-blue-600" };
  }
  if (key === "pending") {
    return { key, group: "active", label: "Chờ thanh toán", icon: Clock3, className: "bg-amber-50 text-amber-600" };
  }
  return { key, group: "active", label: "Đang xử lý", icon: RefreshCw, className: "bg-indigo-50 text-indigo-600" };
}

export function isCoinPayment(order) {
  const method = String(order?.payment_method || "").toLowerCase();
  if (["coin", "coins"].includes(method)) return true;
  // Đơn đổi thưởng không ghi phương thức nhưng luôn trả bằng xu
  return !method && order?.coins_charged != null;
}

export function getAmountText(order, pkg) {
  if (isCoinPayment(order)) {
    const coin =
      order?.coin_cost ??
      order?.coins_charged ??
      order?.coins ??
      order?.coin_amount ??
      order?.amount_coins ??
      order?.price_coins ??
      order?.amount ??
      0;
    return `${num(coin)} xu`;
  }

  const money =
    order?.amount_vnd ??
    order?.price_vnd ??
    order?.amount ??
    order?.total_amount ??
    order?.price ??
    pkg?.price_vnd ??
    order?.coin_cost ??
    0;
  return `${num(money)}đ`;
}

export function getPayLabel(order) {
  const method = String(order?.payment_method || "").toLowerCase();
  if (method === "bank" || method === "banking") return "Chuyển khoản ngân hàng";
  if (["coin", "coins"].includes(method)) return "Thanh toán bằng xu";
  if (method === "card") return "Thẻ cào";
  if (method) return order.payment_method;
  return isCoinPayment(order) ? "Thanh toán bằng xu" : null;
}

export function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getReplyDeadline(order) {
  if (!order?.progress_msg_at) return null;
  const t = new Date(order.progress_msg_at).getTime();
  return Number.isNaN(t) ? null : t + REPLY_WINDOW_HOURS * 3600 * 1000;
}

export function canReply(order, now = Date.now()) {
  const deadline = getReplyDeadline(order);
  return !!deadline && !order?.user_reply && now < deadline;
       }
