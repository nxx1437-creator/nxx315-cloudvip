// src/pages/help/helpData.js
export const ZALO_URL = "https://zalo.me/0865245988";
export const ATTACH_BUCKET = "support-attachments";

// Avatar và tên của CSKH trong khung chat.
// Cách đổi avatar: bỏ ảnh vuông vào thư mục public/ (ví dụ public/cskh-avatar.png) rồi điền "/cskh-avatar.png".
// Để trống thì hiện chữ cái đầu của tên.
export const CSKH_AVATAR = "https://i.postimg.cc/Gt0FVBZf/IMG-20261104-130308.png";
export const CSKH_NAME = "CSKH";

export const CATEGORIES = [
  { key: "order", label: "Đơn hàng", icon: "box", desc: "Theo dõi đơn đổi thưởng, đơn chưa nhận hoặc bị từ chối." },
  { key: "payment", label: "Thanh toán", icon: "card", desc: "Xu, nạp xu, trừ xu và các vấn đề về giao dịch." },
  { key: "account", label: "Tài khoản & bảo mật", icon: "shield", desc: "Đăng nhập, liên kết Google, email và bảo vệ tài khoản." },
  { key: "bug", label: "Báo lỗi", icon: "bug", desc: "Trang bị lỗi, nút không bấm được hoặc hiển thị sai." },
  { key: "other", label: "Khác", icon: "help", desc: "Những vấn đề chưa thuộc chủ đề nào ở trên." },
];

export const REQUEST_TYPES = [
  { key: "support", title: "Cần hỗ trợ", sub: "Chọn chủ đề và mô tả vấn đề, đội ngũ NXX315 sẽ xử lý nhanh nhất có thể." },
  { key: "idea", title: "Góp ý ý tưởng", sub: "Chia sẻ ý tưởng hoặc đề xuất thay đổi để NXX315 tốt hơn cho bạn." },
];

export const ORDER_STATUS = {
  pending: { dot: "bg-amber-500", label: "Chờ xử lý", cls: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300" },
  processing: { dot: "bg-sky-500", label: "Đang xử lý", cls: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300" },
  delivered: { dot: "bg-emerald-500", label: "Thành công", cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" },
  rejected: { dot: "bg-rose-500", label: "Bị từ chối", cls: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300" },
  cancelled: { dot: "bg-slate-400", label: "Đã huỷ", cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" },
};

export const TICKET_STATUS = {
  open: { dot: "bg-amber-500", label: "Đã gửi", cls: "bg-amber-100 text-amber-700" },
  in_progress: { dot: "bg-sky-500", label: "Đang xử lý", cls: "bg-sky-100 text-sky-700" },
  resolved: { dot: "bg-emerald-500", label: "Đã giải quyết", cls: "bg-emerald-100 text-emerald-700" },
  closed: { dot: "bg-emerald-500", label: "Đã giải quyết", cls: "bg-emerald-100 text-emerald-700" },
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

