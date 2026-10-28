// Chữ + hàm dùng chung cho đăng nhập bằng liên kết email
export const AT = {
  vi: {
    sendLogin: "Gửi liên kết đăng nhập",
    sendReg: "Gửi liên kết đăng ký",
    sending: "Đang gửi…",
    hintLogin: "Không cần mật khẩu. Nhập email, chúng tôi gửi liên kết để bạn vào tài khoản ngay.",
    hintReg: "Không cần mật khẩu. Nhập email, chúng tôi gửi liên kết để bạn tạo tài khoản và vào ngay.",
    sentTitle: "Kiểm tra email của bạn",
    sentTo: "Chúng tôi đã gửi liên kết đăng nhập tới",
    sentNote: "Bấm vào liên kết trong email để vào tài khoản. Liên kết chỉ dùng được 1 lần và tự hết hạn sau 30 phút.",
    spam: "Không thấy email? Hãy kiểm tra mục Spam hoặc Quảng cáo.",
    resend: "Gửi lại liên kết",
    resendIn: "Gửi lại sau {s} giây",
    other: "Dùng email khác",
    errEmail: "Email không hợp lệ.",
    errRate: "Bạn thao tác quá nhanh. Vui lòng đợi một chút rồi thử lại.",
    errNotFound: "Email này chưa có tài khoản.",
    goRegister: "Đăng ký ngay",
    errExpired: "Liên kết đã hết hạn hoặc đã được sử dụng. Hãy nhập email để nhận liên kết mới.",
    errGeneric: "Không gửi được liên kết. Vui lòng thử lại.",
    cbTitle: "Đang đăng nhập…",
    cbBody: "Vui lòng đợi trong giây lát.",
    cbIpTitle: "Không đăng nhập được",
    backLogin: "Quay lại đăng nhập",
  },
  en: {
    sendLogin: "Send sign-in link",
    sendReg: "Send sign-up link",
    sending: "Sending…",
    hintLogin: "No password needed. Enter your email and we will send a link to sign you in.",
    hintReg: "No password needed. Enter your email and we will send a link to create your account.",
    sentTitle: "Check your email",
    sentTo: "We sent a sign-in link to",
    sentNote: "Click the link in the email to enter your account. It works once and expires after 30 minutes.",
    spam: "Can't find it? Check your Spam or Promotions folder.",
    resend: "Resend link",
    resendIn: "Resend in {s}s",
    other: "Use another email",
    errEmail: "Invalid email address.",
    errRate: "You are going too fast. Please wait a moment and try again.",
    errNotFound: "No account found for this email.",
    goRegister: "Sign up now",
    errExpired: "This link has expired or was already used. Enter your email to get a new one.",
    errGeneric: "Could not send the link. Please try again.",
    cbTitle: "Signing you in…",
    cbBody: "Please wait a moment.",
    cbIpTitle: "Could not sign in",
    backLogin: "Back to sign in",
  },
};

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Đổi lỗi của Supabase thành thông báo dễ hiểu
export function mapAuthError(err, x) {
  const m = (err?.message || "").toLowerCase();
  if (err?.status === 429 || m.includes("rate limit") || m.includes("only request this after") || m.includes("too many"))
    return { text: x.errRate };
  if (m.includes("signups not allowed") || m.includes("user not found"))
    return { text: x.errNotFound, register: true };
  if (m.includes("invalid") && m.includes("email")) return { text: x.errEmail };
  console.warn("[auth] send link error:", err);
  return { text: x.errGeneric };
}

export const callbackUrl = () => `${window.location.origin}/auth/callback`;
