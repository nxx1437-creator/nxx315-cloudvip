// src/lib/helpArticles.js  (PHẦN 2/2 – bộ câu hỏi mới, sửa nội dung tại đây)
// Mỗi bài: id, cat (khớp HELP_CATEGORIES), title, body = mảng đoạn văn.
export const HELP_ARTICLES = [
  // ---- Bắt đầu ----
  { id: "s1", cat: "start", title: "Nxx315 Studio là gì?",
    body: ["Nxx315 Studio là nơi bạn làm các nhiệm vụ nhỏ để nhận xu, rồi dùng xu đổi quà cho Roblox, game di động hoặc rút về ví.",
           "Mọi thứ nằm trong một tài khoản duy nhất: nhiệm vụ, ví xu, cửa hàng và lịch sử đơn."] },
  { id: "s2", cat: "start", title: "Bắt đầu kiếm xu từ đâu?",
    body: ["Vào mục Nhiệm vụ, chọn một nhiệm vụ và bấm Làm nhiệm vụ.",
           "Hoàn tất các bước ở trang đối tác. Khi xong, trang sẽ tự đưa bạn về web để nhận xu. Đừng đóng tab giữa chừng."] },
  { id: "s3", cat: "start", title: "Một xu bằng bao nhiêu tiền?",
    body: ["Khi rút tiền, một xu bằng một đồng. Giá đổi quà của từng món hiển thị ngay trong cửa hàng, bạn xem trước khi xác nhận."] },
  { id: "s4", cat: "start", title: "Đổi ngôn ngữ hoặc giao diện sáng/tối",
    body: ["Vào Hồ sơ, chọn Cài đặt tài khoản. Ở đó có phần ngôn ngữ và giao diện sáng/tối, trung tâm trợ giúp đổi theo."] },

  // ---- Nhiệm vụ & xu ----
  { id: "t1", cat: "tasks", title: "Làm xong nhiệm vụ nhưng chưa nhận được xu",
    body: ["Xu chỉ được cộng khi trang đối tác tự chuyển bạn về web. Hãy làm đủ các bước và chờ trang chuyển, đừng tự quay lại bằng tay.",
           "Mỗi nhiệm vụ có thời gian tối thiểu, làm quá nhanh sẽ không được tính. Nếu đã làm đúng mà vẫn không nhận được, gửi yêu cầu kèm tên nhiệm vụ và giờ làm."] },
  { id: "t2", cat: "tasks", title: "Báo lỗi “Token không hợp lệ hoặc đã hết hạn”",
    body: ["Mỗi lượt làm nhiệm vụ có một liên kết dùng một lần và hết hạn sau ít phút. Mở lại liên kết cũ hoặc để quá lâu sẽ báo lỗi này.",
           "Hãy quay về trang Nhiệm vụ và bắt đầu lại từ đầu."] },
  { id: "t3", cat: "tasks", title: "Vì sao nhiệm vụ báo hết lượt?",
    body: ["Mỗi nhiệm vụ có số lượt tối đa mỗi ngày, do đối tác quy định. Lượt được làm mới lúc 00:00 giờ Việt Nam."] },
  { id: "t4", cat: "tasks", title: "Điểm danh và nhiệm vụ tháng hoạt động thế nào?",
    body: ["Điểm danh cần bạn hoàn thành ít nhất một nhiệm vụ trong ngày, chuỗi điểm danh càng dài xu thưởng càng cao.",
           "Nhiệm vụ tháng có nhiều mốc số nhiệm vụ. Đạt mốc nào thì bấm Nhận ở mốc đó."] },
  { id: "t5", cat: "tasks", title: "Dùng mã quà tặng như thế nào?",
    body: ["Vào Ví, chọn Mã quà tặng và nhập mã. Mỗi mã có giới hạn lượt dùng và hạn dùng.",
           "Nhập sai nhiều lần liên tiếp sẽ bị tạm khóa vài phút, bạn chờ rồi thử lại."] },

  // ---- Đổi thưởng & đơn hàng ----
  { id: "o1", cat: "store", title: "Đơn của mình đang ở bước nào?",
    body: ["Vào Hồ sơ, mở lịch sử đơn. Đơn đi qua các bước: chờ thanh toán, đã thanh toán, chuẩn bị giao, rồi đã giao hoặc bị từ chối.",
           "Sau khi đặt khoảng một giờ, bạn sẽ nhận thông báo chuẩn bị giao."] },
  { id: "o2", cat: "store", title: "Đơn bị từ chối thì sao?",
    body: ["Nếu bạn trả bằng xu, xu được hoàn lại tự động. Lý do từ chối của quản trị viên được gửi vào thông báo của bạn."] },
  { id: "o3", cat: "store", title: "Mình nhập sai tên Roblox hoặc ID game",
    body: ["Gửi yêu cầu hỗ trợ càng sớm càng tốt, ghi rõ mã đơn và thông tin đúng. Đơn đã giao thì không thể sửa."] },
  { id: "o4", cat: "store", title: "Có thể thanh toán đơn bằng cách nào?",
    body: ["Hiện tại đơn trong cửa hàng thanh toán bằng xu trong ví. Hãy kiểm tra số dư trước khi đặt."] },

  // ---- Rút tiền ----
  { id: "w1", cat: "withdraw", title: "Điều kiện và phí rút tiền",
    body: ["Mức rút tối thiểu là 10.000đ về ngân hàng và 5.000đ về MoMo hoặc ZaloPay. Phí mỗi lần rút là 500đ.",
           "Bạn cần đủ xu trong ví cho cả số tiền rút và phí."] },
  { id: "w2", cat: "withdraw", title: "Bao lâu thì nhận được tiền?",
    body: ["Thời gian xử lý được ghi ở trang Về chúng tôi. Trong lúc chờ, bạn theo dõi trạng thái yêu cầu ngay trong trang Rút tiền."] },
  { id: "w3", cat: "withdraw", title: "Mình nhập sai thông tin nhận tiền",
    body: ["Gửi yêu cầu hỗ trợ ngay và đừng gửi thêm lệnh rút khác. Ghi rõ thông tin đã nhập sai và thông tin đúng."] },

  // ---- Tài khoản & bảo mật ----
  { id: "a1", cat: "account", title: "Mình không đăng nhập được",
    body: ["Thử đăng nhập bằng Google nếu bạn từng đăng ký như vậy, hoặc dùng chức năng quên mật khẩu để đặt lại.",
           "Vẫn không được thì gửi yêu cầu kèm email đăng ký."] },
  { id: "a2", cat: "account", title: "Vì sao tài khoản bị khóa?",
    body: ["Web mỗi người chỉ được dùng một tài khoản. Khi nhiều tài khoản dùng chung thiết bị hoặc mạng, hệ thống có thể khóa để xem lại.",
           "Nếu bạn nghĩ mình bị khóa nhầm, gửi yêu cầu để được kiểm tra."] },
  { id: "a3", cat: "account", title: "Mã giới thiệu nằm ở đâu?",
    body: ["Trong Hồ sơ, mục giới thiệu bạn bè. Bạn bè nhập mã của bạn khi đăng ký để cả hai cùng được thưởng."] },
  { id: "a4", cat: "account", title: "Bật thông báo đẩy để không lỡ tin",
    body: ["Ở trang chủ có thẻ bật thông báo. Cho phép thông báo trong trình duyệt là bạn nhận được nhắc nhiệm vụ và trạng thái đơn."] },

  // ---- Creator & video ----
  { id: "c1", cat: "creator", title: "Creator là gì?",
    body: ["Creator là trang riêng để bạn liên kết kênh YouTube hoặc TikTok, gửi video giới thiệu Nxx315 Studio và nhận thưởng khi video được duyệt."] },
  { id: "c2", cat: "creator", title: "Video bị từ chối vì sao?",
    body: ["Hai lý do thường gặp: video thiếu hashtag bắt buộc, hoặc video thuộc kênh khác với kênh bạn đã liên kết. Lý do cụ thể hiển thị trong chi tiết video."] },
  { id: "c3", cat: "creator", title: "Phần thưởng của video được trả thế nào?",
    body: ["Video được duyệt sẽ nhận một mã quà tặng xu, hiển thị trong lịch sử video của bạn. Nhập mã ở mục Mã quà tặng trong Ví."] },
];

const strip = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").toLowerCase();

export function searchArticles(q) {
  const words = strip(q).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return HELP_ARTICLES.map((a) => {
    const t = strip(a.title), b = strip(a.body.join(" "));
    let score = 0;
    for (const w of words) { if (t.includes(w)) score += 3; if (b.includes(w)) score += 1; }
    return { a, score };
  }).filter((x) => x.score > 0).sort((x, y) => y.score - x.score).map((x) => x.a);
}
