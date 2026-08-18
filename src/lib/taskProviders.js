/**
 * taskProviders.js
 * -----------------------------------------------------------------
 * Mỗi nhà cung cấp link-vượt (Layma, Link4m, Traffic68...) có cách
 * tạo link rút gọn kèm Token hơi khác nhau. Đây là chỗ duy nhất bạn
 * cần điền thông tin thật sau khi đăng ký làm publisher trên từng
 * trang và đọc tài liệu "Developers API" của họ.
 *
 * QUAN TRỌNG VỀ BẢO MẬT: nếu nhà cung cấp yêu cầu gửi kèm API Key bí
 * mật khi tạo link, TUYỆT ĐỐI không gọi thẳng từ trình duyệt (ai cũng
 * xem được Network tab và lấy trộm key). Thay vào đó, tạo 1 Supabase
 * Edge Function giữ API Key ở phía server, và hàm buildTaskUrl() dưới
 * đây gọi tới Edge Function đó thay vì gọi thẳng nhà cung cấp.
 * -----------------------------------------------------------------
 */

// URL callback mà nhà cung cấp sẽ redirect người dùng về sau khi hoàn
// thành các bước quảng cáo — PHẢI khớp với route /task/callback.
function callbackUrl(token, taskId) {
  return `${window.location.origin}/task/callback?token=${token}&task=${taskId}`;
}

/**
 * buildTaskUrl — trả về URL thật sự để mở cho người dùng (link rút gọn
 * của Layma/Link4m/Traffic68, có đích đến cuối cùng là callbackUrl()).
 *
 * TODO: thay bằng lệnh gọi API thật của từng provider. Ví dụ cấu trúc
 * phổ biến (cần xác nhận lại theo tài liệu thật của từng bên):
 *
 *   const res = await fetch("https://<edge-function-url>/shorten", {
 *     method: "POST",
 *     body: JSON.stringify({ provider: task.provider, longUrl: dest }),
 *   });
 *   const { shortUrl } = await res.json();
 *   return shortUrl;
 *
 * Trong lúc chưa nối API thật, hàm này tạm thời mở thẳng callback URL
 * (bỏ qua bước quảng cáo) để bạn test luồng token hoạt động đúng.
 */
export async function buildTaskUrl(task, token) {
  const dest = callbackUrl(token, task.id);

  // TODO: thay đoạn này bằng gọi API rút gọn link thật theo provider.
  switch (task.provider) {
    case "LAYMA":
    case "LINK4M":
    case "TRAFFIC68":
    default:
      console.warn(
        `[taskProviders] Chưa nối API thật cho "${task.provider}". ` +
          "Đang mở thẳng callback URL để test — xem TODO trong src/lib/taskProviders.js"
      );
      return dest;
  }
}
