// src/pages/Support/constants.js

export const SUPPORT = {
  zalo: "0865245988",
  zaloUrl: "https://zalo.me/0865245988",
  email: "nxx315hub@gmail.com",
  hours: "12:00 - 13:00 (T2 - CN)",
};

export const AI_ENDPOINT =
  import.meta.env.VITE_AI_SUPPORT_URL ||
  "https://rwglwovohbyqmbbzdvdj.supabase.co/functions/v1/ai-support-reply";

export const SYSTEM_BANNER = {
  enabled: true,
  text: "Bảo trì hệ thống lúc 2h sáng mai. Nạp game vẫn hoạt động bình thường.",
  page: "1/1",
};

export const QUICK_ACTIONS = [
  { icon: "📋", label: "Chọn đơn", prompt: "Cho mình xem đơn hàng gần đây" },
  { icon: "💸", label: "Hoàn tiền", prompt: "Mình muốn yêu cầu hoàn tiền" },
  { icon: "🔍", label: "Tra đơn", prompt: "Hướng dẫn mình cách tra đơn hàng" },
  { icon: "🎁", label: "Đổi thưởng", prompt: "Cách đổi thưởng như thế nào?" },
  { icon: "❓", label: "Trợ giúp", prompt: "Mình cần hỗ trợ" },
];

export const CATEGORIES = [
  { id: "account", label: "Tài khoản", icon: "User", color: "#FE2C55" },
  { id: "payment", label: "Thanh toán", icon: "CreditCard", color: "#FF6B00" },
  { id: "order", label: "Đơn hàng", icon: "Package", color: "#00C2FF" },
  { id: "bug", label: "Báo lỗi", icon: "Bug", color: "#8B5CF6" },
  { id: "other", label: "Khác", icon: "MoreHorizontal", color: "#6B7280" },
];

export const GREETING_BY_CATEGORY = {
  account: `Chào bạn 🌸 Mình là NXX, trợ lý của NXX315 Studio.\n\nVề tài khoản, bạn gặp vấn đề gì cụ thể nè?`,
  payment: `Chào bạn 🌸 Mình là NXX, trợ lý của NXX315 Studio.\n\nVề thanh toán, bạn cần hỗ trợ gì nè?`,
  order: `Chào bạn 🌸 Mình là NXX, trợ lý của NXX315 Studio.\n\nVề đơn hàng, bạn muốn kiểm tra đơn nào? Cho mình mã đơn (RBX-xxxxx) nhé.`,
  bug: `Chào bạn 🌸 Mình là NXX, trợ lý của NXX315 Studio.\n\nBạn gặp lỗi gì nè? Mô tả hoặc gửi ảnh màn hình giúp mình nhé.`,
  other: `Chào bạn 🌸 Mình là NXX, trợ lý của NXX315 Studio.\n\nBạn cần hỗ trợ vấn đề gì nè?`,
};

export const SUGGESTIONS_BY_CATEGORY = {
  account: [
    "Tôi quên mật khẩu, giờ phải làm sao?",
    "Tôi không nhận được mã xác minh",
    "Tôi muốn đổi email đăng ký",
    "Tài khoản của tôi có bị khóa không?",
  ],
  payment: [
    "Tôi đã chuyển khoản nhưng chưa nhận Coin",
    "Tôi nạp sai số tiền, có hoàn lại không?",
    "Tôi muốn đổi phương thức thanh toán",
    "Tôi muốn yêu cầu hoàn tiền",
  ],
  order: [
    "Đơn RBX-000138 đang ở trạng thái nào?",
    "Tôi nạp sai ID game, xử lý sao?",
    "Tôi chưa nhận được hàng",
    "Tôi muốn hủy đơn đang chờ",
  ],
  bug: [
    "Trang web bị lỗi khi tôi nạp game",
    "Tôi không thanh toán được",
    "Nút xác nhận không hoạt động",
    "Tôi gửi ảnh lỗi được không?",
  ],
  other: [
    "Tôi muốn hợp tác làm đại lý",
    "Tôi muốn báo cáo tài khoản vi phạm",
    "Tôi có câu hỏi khác",
  ],
};
