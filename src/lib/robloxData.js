const STORAGE = "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos";

export const ROBLOX_BANNER_URL = `${STORAGE}/Roblox-banner.png`;
export const ROBLOX_BANNER_FALLBACK = `${STORAGE}/roblox-banner.png`;
export const ROBLOX_GUIDE_URL = `${STORAGE}/roblox-guide.png`;

export const GAME_INFO = {
  name: "Roblox",
  server: "Server 1",
  icon: `${STORAGE}/roblox.png`,
};

// Giá chỉ để HIỂN THỊ. Giá thật do máy chủ (create-roblox-order) quyết định.
export const PACKAGES = [
  {
    id: "card-400",
    robux: 400,
    price: 153000,
    originalPrice: 200000,
    discount: 24,
    image: `${STORAGE}/roblox-400.png`,
    method: "Card Robux",
  },
  {
    id: "vng-40",
    robux: 40,
    price: 13050,
    originalPrice: 20000,
    discount: 35,
    image: `${STORAGE}/roblox-40.png`,
    method: "VNG",
  },
  {
    id: "vng-80",
    robux: 80,
    price: 25650,
    originalPrice: 40000,
    discount: 36,
    image: `${STORAGE}/roblox-80.png`,
    method: "VNG",
  },
  {
    id: "vng-500",
    robux: 500,
    price: 126450,
    originalPrice: 175000,
    discount: 28,
    image: `${STORAGE}/roblox-500.png`,
    method: "VNG",
  },
];

export const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN").format(value) + "đ";

// Hiển thị giá theo Coin (tránh nhầm với tiền đồng)
export const formatCoin = (value) =>
  new Intl.NumberFormat("vi-VN").format(value) + " Coin";

export const DRAFT_KEY = "nxx315_roblox_draft";
export const LAST_USERNAME_KEY = "nxx315_roblox_username";
