// src/components/authCopy.js
export const AUTH_COPY = {
  vi: {
    home: "Trang chủ",
    langBtn: "EN",
    side: {
      login: { eyebrow: "NXX315 · Studio Rewards", a: "Chào mừng", b: "quay lại." },
      register: { eyebrow: "NXX315 · Studio Rewards", a: "Bắt đầu kiếm xu,", b: "miễn phí." },
    },
    perks: [
      "Không cần mật khẩu, chỉ cần email hoặc Google",
      "Làm nhiệm vụ mỗi ngày, nhận xu",
      "Đổi Robux, Quân Huy, Kim Cương và nhiều quà khác",
    ],
    sentTitle: "Kiểm tra email của bạn",
    sentTo: "Mình đã gửi liên kết tới",
    sentHint:
      "Bấm vào liên kết trong email để tiếp tục. Liên kết dùng 1 lần và hết hạn sau 30 phút. Không thấy thư thì kiểm tra mục Spam.",
    resend: "Gửi lại liên kết",
    resendIn: (s) => `Gửi lại sau ${s}s`,
    resent: "Đã gửi lại liên kết.",
    changeEmail: "Dùng email khác",
  },
  en: {
    home: "Home",
    langBtn: "VI",
    side: {
      login: { eyebrow: "NXX315 · Studio Rewards", a: "Welcome", b: "back." },
      register: { eyebrow: "NXX315 · Studio Rewards", a: "Start earning coins,", b: "for free." },
    },
    perks: [
      "No password, just your email or Google",
      "Do daily tasks, earn coins",
      "Redeem Robux, game currency and more",
    ],
    sentTitle: "Check your email",
    sentTo: "We sent a link to",
    sentHint:
      "Tap the link in the email to continue. The link works once and expires after 30 minutes. If you don't see it, check your Spam folder.",
    resend: "Resend link",
    resendIn: (s) => `Resend in ${s}s`,
    resent: "Link sent again.",
    changeEmail: "Use another email",
  },
};
