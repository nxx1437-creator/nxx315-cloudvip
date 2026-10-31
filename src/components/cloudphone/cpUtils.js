// Cấu hình và hàm dùng chung cho trang Cloud Phone
export const EARN_PATH = "/tasks";
export const VMOS_URL = "https://www.vmoscloud.com";
export const REGION_LABEL = "Hồng Kông"; // đổi thành "Việt Nam" nếu đặt VMOS_COUNTRY_CODE=VN

export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const BUY_ERRORS = {
  NOT_AUTHENTICATED: "Bạn chưa đăng nhập.",
  INVALID_ACCOUNT: "Email tài khoản VMOS không hợp lệ.",
  PACKAGE_NOT_FOUND: "Gói này hiện không còn bán.",
  PACKAGE_UNAVAILABLE: "Gói này đang tạm hết hàng.",
  PROFILE_NOT_FOUND: "Không tìm thấy tài khoản của bạn.",
  ACCOUNT_BANNED: "Tài khoản của bạn đang bị khóa.",
  ACCOUNT_RESTRICTED: "Tài khoản bị hạn chế, vui lòng liên hệ admin.",
  ALREADY_HAVE_ACTIVE: "Bạn đang có một máy còn hạn hoặc đang được giao.",
  INSUFFICIENT_COINS: "Không đủ Coin để thuê máy.",
};

export const fmt = (n) => new Intl.NumberFormat("vi-VN").format(Number(n || 0));

export const hoursLabel = (h) =>
  Number(h) % 24 === 0 ? `${Number(h) / 24} ngày` : `${h} giờ`;

export const fmtDate = (v) =>
  v
    ? new Date(v).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export const remainText = (ms) => {
  if (ms <= 0) return "Đã hết hạn";
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  return h > 0 ? `${h} tiếng ${m % 60} phút` : `${m} phút`;
};

// Giá gốc theo giờ của gói ngắn nhất, dùng để tính % giảm của các gói dài
export function withDiscount(pkgs) {
  if (!pkgs.length) return [];
  const base = [...pkgs].sort((a, b) => a.duration_hours - b.duration_hours)[0];
  const rate = base.price_coins / base.duration_hours;
  return pkgs.map((p) => {
    const original = Math.round(rate * p.duration_hours);
    const pct =
      p.id !== base.id && original > p.price_coins
        ? Math.round((1 - p.price_coins / original) * 100)
        : 0;
    return { ...p, original, discountPct: pct };
  });
}
