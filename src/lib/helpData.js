// src/lib/helpData.js  (PHẦN 1/2 – cấu hình, ảnh, danh mục)
const SB = (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) || "";

// Nhận link đầy đủ (https://...) HOẶC chỉ tên file trong bucket game_logos
export const imgUrl = (v) =>
  !v ? "" : /^(https?:|\/|data:)/.test(v) ? v : `${SB}/storage/v1/object/public/game_logos/${v}`;

export const HELP_LINKS = {
  home: "/",
  support: "/support",     // trang gửi yêu cầu hỗ trợ
  contact: "/contact",
  terms: "/terms",
  privacy: "/privacy",
  about: "/about",
  email: "support@nxx315.com",
};

/* ====== CHỖ DÁN ẢNH ======
   Điền link ảnh (hoặc tên file trong bucket game_logos) vào `src`.
   Để trống = web tự vẽ tranh pixel thay thế, không bị trống. */
export const HELP_IMAGES = {
  hero: {
    src: "",
    size: "2400 × 1344 px, ngang",
    guide:
      "Tranh phong cảnh pixel full-bleed: trời xanh, lá thu cam/đỏ ở hai góc trên, công viên + hồ nước phía dưới. Chừa khoảng trời trống ở giữa-trên (đặt tên) và vùng thấp, ít chi tiết ở góc dưới-trái (đặt khung kính chữ trắng).",
  },
  specimen: {
    src: "",
    size: "600 × 900 px, PNG nền trong suốt",
    guide:
      "Một vật pixel đứng riêng, không khung (ví dụ bông hoa vàng, cây nhỏ). Cạnh bậc thang, ít màu: vàng/kem phía trên, xanh lá phía dưới.",
  },
  invitation: {
    src: "",
    size: "2784 × 1600 px, ngang",
    guide:
      "Bầu trời xanh #0081c0 có mây. Hoa hướng dương pixel mọc từ mép dưới và mép phải, bông to nhất ở bên phải. NỬA TRÊN-TRÁI để trống hoàn toàn cho chữ trắng.",
  },
  closing: {
    src: "",
    size: "2400 × 1000 px, ngang",
    guide:
      "Đại lộ công viên pixel: hai bên tối (xanh teal đậm), giữa sáng rực như nắng, có vài người nhỏ và chú chó. Phần sáng ở giữa, đáy ảnh sẽ được phủ tối nhẹ tự động.",
  },
  cat_start: { src: "help_start.png", size: "800 × 700 px", guide: "Bìa danh mục 'Bắt đầu': trời xanh, mây pixel khối, lá xanh ở hai góc dưới, chừa trời ở giữa." },
  cat_tasks: { src: "help_tasks.png", size: "800 × 700 px", guide: "Bìa 'Nhiệm vụ & xu': trời xanh, vài đồng xu/bông hoa pixel nhỏ ở giữa, lá ở hai góc." },
  cat_store: { src: "help_store.png", size: "800 × 700 px", guide: "Bìa 'Đổi thưởng': trời xanh, một hộp quà pixel ở giữa, mây và lá ở góc." },
  cat_withdraw: { src: "help_withdraw.png", size: "800 × 700 px", guide: "Bìa 'Rút tiền': trời xanh, chiếc ví pixel ở giữa, lá ở góc." },
  cat_account: { src: "help_account.png", size: "800 × 700 px", guide: "Bìa 'Tài khoản': trời xanh, ổ khóa hoặc chiếc chìa pixel ở giữa, lá ở góc." },
  cat_creator: { src: "help_creator.png", size: "800 × 700 px", guide: "Bìa 'Creator': trời xanh, khung phim/máy quay pixel ở giữa, lá ở góc." },
};

export const HELP_CATEGORIES = [
  { id: "start", title: "Bắt đầu", blurb: "Làm quen với Nxx315 Studio" },
  { id: "tasks", title: "Nhiệm vụ & xu", blurb: "Làm nhiệm vụ, điểm danh, mã quà" },
  { id: "store", title: "Đổi thưởng & đơn hàng", blurb: "Theo dõi và xử lý đơn" },
  { id: "withdraw", title: "Rút tiền", blurb: "Điều kiện, phí, nhận tiền" },
  { id: "account", title: "Tài khoản & bảo mật", blurb: "Đăng nhập, khóa, thông báo" },
  { id: "creator", title: "Creator & video", blurb: "Gửi video nhận thưởng" },
];

export const SCHEMATIC_STEPS = [
  { title: "Nhiệm vụ", text: "Mỗi nhiệm vụ là một việc nhỏ ở trang đối tác. Làm xong, trang tự đưa bạn quay lại." },
  { title: "Xu", text: "Web kiểm tra rồi cộng xu vào ví. Một xu tương đương một đồng khi rút." },
  { title: "Quà", text: "Dùng xu để đổi quà trong cửa hàng, hoặc rút về ngân hàng và ví điện tử." },
];

export const HELP_COPY = {
  identity: "Trung tâm trợ giúp\nNxx315 Studio",
  promise: "Cần gì, hỏi ở đây.",
  support:
    "Tìm câu trả lời về nhiệm vụ, xu, đơn hàng và rút tiền. Chưa thấy thì nhắn cho chúng mình, tin nào cũng có người đọc.",
  visionP:
    "Mỗi xu bạn kiếm được đều là công sức thật. Chúng mình viết trang này để bạn không phải đoán.",
  vision: "Làm nhiệm vụ, tích xu, đổi quà. Dễ như chơi một ván game.",
  thesis: "Mọi thứ trên web đi theo một đường",
  thesisPale: "nhiệm vụ, xu, quà",
  thesis2: "Hiểu đường đi đó là hiểu gần hết.",
  invite: "Chưa thấy câu trả lời? Nhắn cho chúng mình.",
  inviteP:
    "Mô tả vấn đề, gửi kèm ảnh chụp màn hình nếu có. Chúng mình đọc từng yêu cầu và trả lời trong ứng dụng.",
  closing: "Nếu bạn vẫn còn thắc mắc,\ncứ nhắn cho chúng mình",
};
