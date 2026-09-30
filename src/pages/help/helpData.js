// src/pages/help/helpData.js
export const ZALO_URL = "https://zalo.me/0865245988";

export const CATEGORIES = [
  { key: "order", label: "Đơn hàng", icon: "box" },
  { key: "payment", label: "Thanh toán", icon: "card" },
  { key: "account", label: "Tài khoản & bảo mật", icon: "shield" },
  { key: "bug", label: "Báo lỗi", icon: "bug" },
  { key: "other", label: "Khác", icon: "help" },
];

export const ORDER_STATUS = {
  pending: { label: "Chờ xử lý", cls: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300" },
  processing: { label: "Đang xử lý", cls: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300" },
  delivered: { label: "Thành công", cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" },
  rejected: { label: "Bị từ chối", cls: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300" },
  cancelled: { label: "Đã huỷ", cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" },
};

export const TICKET_STATUS = {
  open: { label: "Đã gửi", cls: "bg-amber-50 text-amber-700" },
  in_progress: { label: "Đang xử lý", cls: "bg-sky-50 text-sky-700" },
  resolved: { label: "Đã giải quyết", cls: "bg-emerald-50 text-emerald-700" },
  closed: { label: "Đã giải quyết", cls: "bg-emerald-50 text-emerald-700" },
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
