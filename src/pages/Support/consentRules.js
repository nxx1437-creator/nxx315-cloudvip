// src/pages/Support/consentRules.js — tin nhắn nào cần hỏi quyền trước khi gửi cho AI

// Cần xem đơn hàng / số dư / tình trạng tài khoản của chính người dùng
const ACCOUNT_RE =
  /RBX-?\d+|(xem|kiểm tra|check)\s+(giúp\s+)?(đơn|tài khoản|ví|số dư)|đơn( hàng)? (của )?(mình|tôi)|đơn hàng gần đây|tài khoản (của )?(mình|tôi)|số dư|chưa nhận (được )?(hàng|coin|xu)|hoàn tiền/i;

// Cần tạo yêu cầu hỗ trợ để nhân viên xử lý
const TICKET_RE =
  /hoàn tiền|khiếu nại|gặp nhân viên|nói chuyện với (người|nhân viên)|tạo (yêu cầu|ticket)|gửi yêu cầu|báo cáo (tài khoản|lỗi)|báo lỗi/i;

// Trả về danh sách quyền cần hỏi theo thứ tự: ["account", "ticket"]
export function neededConsents(text) {
  const t = String(text || "")
    .split("\n")
    .filter((line) => !line.trim().startsWith(">")) // bỏ phần trích dẫn
    .join(" ");
  const out = [];
  if (ACCOUNT_RE.test(t)) out.push("account");
  if (TICKET_RE.test(t)) out.push("ticket");
  return out;
}
