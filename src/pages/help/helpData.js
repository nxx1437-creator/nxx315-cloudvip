// src/pages/help/helpData.js
export const ZALO_URL = "https://zalo.me/0865245988";

export const CATEGORIES = [
  { key: "order", label: "Đơn hàng", icon: "box", grad: "from-pink-400 to-rose-500" },
  { key: "payment", label: "Thanh toán", icon: "card", grad: "from-fuchsia-400 to-pink-500" },
  { key: "account", label: "Tài khoản & bảo mật", icon: "shield", grad: "from-violet-400 to-fuchsia-500" },
  { key: "bug", label: "Báo lỗi", icon: "bug", grad: "from-orange-400 to-rose-500" },
  { key: "other", label: "Khác", icon: "help", grad: "from-sky-400 to-indigo-500" },
];

export const ORDER_STATUS = {
  pending: { label: "Chờ xử lý", cls: "bg-amber-50 text-amber-600 dark:bg-amber-500/10" },
  processing: { label: "Đang xử lý", cls: "bg-sky-50 text-sky-600 dark:bg-sky-500/10" },
  delivered: { label: "Thành công", cls: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10" },
  rejected: { label: "Bị từ chối", cls: "bg-rose-50 text-rose-600 dark:bg-rose-500/10" },
  cancelled: { label: "Đã huỷ", cls: "bg-slate-100 text-slate-500 dark:bg-slate-800" },
};

export const TICKET_STATUS = {
  open: { label: "Đã gửi", cls: "bg-amber-50 text-amber-600" },
  in_progress: { label: "Đang xử lý", cls: "bg-sky-50 text-sky-600" },
  resolved: { label: "Đã giải quyết", cls: "bg-emerald-50 text-emerald-600" },
  closed: { label: "Đã giải quyết", cls: "bg-emerald-50 text-emerald-600" },
};

export function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())} - ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function fmtCoins(n) {
  return `-${Number(n || 0).toLocaleString("vi-VN")} xu`;
}

export function makeTicketCode() {
  const t = Date.now().toString(36).toUpperCase().slice(-5);
  const r = Math.random().toString(36).toUpperCase().slice(2, 4);
  return `TK${t}${r}`;
}

// Bỏ dấu tiếng Việt, giữ nguyên độ dài chuỗi (để tô sáng từ khoá đúng vị trí)
export function fold(s = "") {
  return s
    .split("")
    .map((c) => {
      const f = c.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
      return f[0] || c;
    })
    .join("");
}
