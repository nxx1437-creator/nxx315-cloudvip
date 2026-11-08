export const SUPABASE_STORAGE =
  "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos";

export const FREEFIRE_BANNER = `${SUPABASE_STORAGE}/freefire-banner1.png`;
export const FREEFIRE_LOGO = `${SUPABASE_STORAGE}/free-fire.png`;

const IMG = `${SUPABASE_STORAGE}/kimcuong.png`;

export const PACKAGES = [
  { id: "ff-25", amount: 5000, diamond: 25, image: IMG },
  { id: "ff-51", amount: 10000, diamond: 51, image: IMG },
  { id: "ff-113", amount: 20000, diamond: 113, image: IMG },
  { id: "ff-283", amount: 50000, diamond: 283, image: IMG },
  { id: "ff-566", amount: 100000, diamond: 566, image: IMG },
  { id: "ff-1132", amount: 200000, diamond: 1132, image: IMG },
  { id: "ff-2830", amount: 500000, diamond: 2830, image: IMG },
  { id: "ff-5750", amount: 1000000, diamond: 5750, image: IMG },
  { id: "ff-11500", amount: 2000000, diamond: 11500, image: IMG },
];

export const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN").format(Number(value || 0)) + "đ";
