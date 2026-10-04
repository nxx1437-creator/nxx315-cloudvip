export const SUPABASE_URL = "https://rwglwovohbyqmbbzdvdj.supabase.co";
const STORAGE_BUCKET = "game_logos";

export const getImageUrl = (fileName) =>
  `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${fileName}`;

export const locale = (lang) => (lang === "en" ? "en-US" : "vi-VN");

// ============= BANNER =============
export const BANNERS = [
  { image: "store-banner-1.png", path: "/store/free-fire" },
  { image: "store-banner-2.png", path: "/store/play-together" },
  { image: "store-banner-3.png", path: "/store/lien-quan" },
  { image: "store-banner-4.png", path: "/store/roblox" },
  { image: "store-banner-5.png", path: "/store/pubg-mobile" },
];

export const BANNER_INTERVAL = 5000;

// ============= GAMES =============
export const GAMES = [
  { id: 1, name: "Roblox", category: "pc", logo: "roblox.png", path: "/store/roblox", hot: true },
  { id: 2, name: "Play Together VNG", category: "mobile", logo: "play-together-vng.png", path: "/store/play-together", hot: true },
  { id: 3, name: "Liên Quân Mobile", category: "mobile", logo: "lien-quan-mobile.png", path: "/store/lien-quan", hot: true },
  { id: 4, name: "Free Fire", category: "mobile", logo: "free-fire.png", path: "/store/free-fire", hot: true },
  { id: 5, name: "PUBG Mobile VN", category: "mobile", logo: "pubg-mobile-vn.png", path: "/store/pubg-mobile", hot: true },
  { id: 6, name: "VALORANT", category: "pc", logo: "valorant.png", path: "/store/valorant" },
  { id: 8, name: "Delta Force", category: "mobile", logo: "Delta.png", path: "/store/Delta-Force", hot: true },
  { id: 10, name: "FC Mobile VN", category: "mobile", logo: "fc-mobile.png", path: "/store/fc-mobile" },
];

// ============= TRACKING (gợi ý "Dành cho bạn") =============
const VIEW_STORAGE_KEY = "nxx315_viewed_games";

function getViewedGames() {
  try {
    const raw = localStorage.getItem(VIEW_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function trackGameView(gameId) {
  try {
    const viewed = getViewedGames();
    viewed[gameId] = (viewed[gameId] || 0) + 1;
    const entries = Object.entries(viewed)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
    localStorage.setItem(
      VIEW_STORAGE_KEY,
      JSON.stringify(Object.fromEntries(entries))
    );
  } catch {}
}

export function getRecommendedGames(limit = 4) {
  const viewed = getViewedGames();
  if (Object.keys(viewed).length === 0) {
    return GAMES.filter((g) => g.hot).slice(0, limit);
  }
  return GAMES.map((game) => ({
    game,
    score: (viewed[game.id] || 0) * 10 + (game.hot ? 5 : 0),
  }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.game);
}

// ============= LỊCH SỬ ĐƠN HÀNG =============
export function formatHistoryDate(value, lang) {
  if (!value) return "—";
  return new Date(value).toLocaleString(locale(lang), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Trả về { key, cls }: dịch nhãn bằng t(key)
export function getHistoryStatus(status) {
  switch (String(status || "").toLowerCase()) {
    case "pending":
      return { key: "st.s.pending", cls: "text-slate-500", bg: "bg-slate-50" };
    case "paid":
      return { key: "st.s.paid", cls: "text-sky-600", bg: "bg-sky-50" };
    case "processing":
      return { key: "st.s.processing", cls: "text-teal-600", bg: "bg-teal-50" };
    case "delivered":
      return { key: "st.s.delivered", cls: "text-emerald-600", bg: "bg-emerald-50" };
    case "rejected":
      return { key: "st.s.rejected", cls: "text-rose-600", bg: "bg-rose-50" };
    case "cancelled":
    case "canceled":
      return { key: "st.s.cancelled", cls: "text-slate-500", bg: "bg-slate-50" };
    case "failed":
      return { key: "st.s.failed", cls: "text-rose-600", bg: "bg-rose-50" };
    default:
      return { key: "st.s.processing", cls: "text-teal-600", bg: "bg-teal-50" };
  }
}

export function getHistoryAmount(order, lang, coinLabel) {
  const coins =
    order?.coin_cost ??
    order?.coins ??
    order?.coin_amount ??
    order?.amount_coins ??
    order?.price_coins;
  if (coins != null)
    return `${Number(coins).toLocaleString(locale(lang))} ${coinLabel}`;

  const money =
    order?.price_vnd ?? order?.amount_vnd ?? order?.amount ?? order?.amount_money;
  if (money != null) return `${Number(money).toLocaleString(locale(lang))}đ`;

  return "—";
}

function detectHistoryGame(packageId) {
  const pid = String(packageId || "").toLowerCase();

  if (
    pid.startsWith("vng-") ||
    pid.startsWith("card-") ||
    pid.includes("roblox") ||
    pid.includes("robux")
  )
    return "roblox";
  if (pid.startsWith("lq-") || pid.includes("lienquan")) return "lienquan";
  if (pid.startsWith("pt-") || pid.includes("playtogether")) return "playtogether";
  if (pid.startsWith("ff-") || pid.includes("freefire")) return "freefire";
  if (pid.startsWith("pubg-") || pid.includes("pubg")) return "pubg";
  if (pid.startsWith("fco-") || pid.includes("fco") || pid.includes("fcmobile"))
    return "fco";
  if (pid.startsWith("vp-") || pid.includes("valorant") || pid.includes("vp"))
    return "valorant";
  return null;
}

const GAME_NAMES = {
  roblox: "Roblox",
  lienquan: "Liên Quân Mobile",
  playtogether: "Play Together",
  freefire: "Free Fire",
  pubg: "PUBG Mobile VN",
  fco: "FC Mobile VN",
  valorant: "VALORANT",
};

export const getGameNameByPackage = (packageId) =>
  GAME_NAMES[detectHistoryGame(packageId)] || null;

export function getHistoryName(order, lang, t) {
  const g = detectHistoryGame(order?.package_id);
  const n = (v) => Number(v).toLocaleString(locale(lang));

  if (g === "playtogether" && order?.pt_gold != null) return `${n(order.pt_gold)} Thỏi Vàng`;
  if (g === "lienquan" && order?.quanhuy != null) return `${n(order.quanhuy)} Quân Huy`;
  if (g === "roblox" && order?.robux != null) return `${n(order.robux)} Robux`;
  if (g === "freefire" && order?.ff_diamond != null) return `${n(order.ff_diamond)} Kim Cương`;
  if (g === "pubg" && order?.pubg_uc != null) {
    const bonus = Number(order.pubg_bonus || 0);
    return bonus > 0
      ? `${n(order.pubg_uc)} UC + ${n(bonus)} Bonus`
      : `${n(order.pubg_uc)} UC`;
  }
  if (g === "fco" && order?.fco_fc != null) return `${n(order.fco_fc)} FC`;
  if (g === "valorant" && order?.vp != null) return `${n(order.vp)} VP`;

  return t("st.hOrder");
}

export function getHistoryImage(order) {
  const id = String(order?.package_id || "").toLowerCase();

  if (id.startsWith("pubg-") || id.includes("pubg")) return getImageUrl("pubg-mobile-vn.png");
  if (id.startsWith("ff-") || id.includes("freefire")) return getImageUrl("free-fire.png");
  if (id.startsWith("lq-") || id.includes("lienquan")) return getImageUrl("lien-quan-mobile.png");
  if (id.startsWith("pt-") || id.includes("playtogether")) return getImageUrl("play-together-vng.png");
  if (id.startsWith("vng-") || id.includes("roblox")) return getImageUrl("roblox.png");
  if (id.startsWith("fco-") || id.includes("fcmobile")) return getImageUrl("fc-mobile.png");
  if (id.startsWith("vp-") || id.includes("valorant")) return getImageUrl("valorant.png");

  return getImageUrl("store-cute.png");
    }
