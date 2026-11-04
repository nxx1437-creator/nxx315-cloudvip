import React from "react";
import { Gift, ShieldCheck, Clock, Mail, XCircle, Coins, AlertCircle, Ban, MessageCircle, RefreshCw } from "lucide-react";
import LegalPage from "../components/LegalKit.jsx";

// ẢNH / VIDEO MINH HỌA: ảnh thì tải lên Supabase (bucket game_logos) rồi ghi TÊN FILE;
// video thì để trong thư mục public của repo rồi ghi "/ten-video.mp4". Để "" nếu chưa có.
// Muốn có chú thích dưới ảnh thì viết ["ten-file.jpg", "Tiêu đề", "Mô tả ngắn"].
const IMAGES = {
  hero: "/redemption-hero.mp4",
  "loai-qua": "", "dieu-kien": "", "quy-trinh": "", "thong-tin": "", "huy-yeu-cau": "",
  "xu-sau-doi": "", "het-hang": "", "mua-ban-xu": "", "tranh-chap": "", "thay-doi": "",
};

const ICONS = {
  "loai-qua": Gift, "dieu-kien": ShieldCheck, "quy-trinh": Clock, "thong-tin": Mail, "huy-yeu-cau": XCircle,
  "xu-sau-doi": Coins, "het-hang": AlertCircle, "mua-ban-xu": Ban, "tranh-chap": MessageCircle, "thay-doi": RefreshCw,
};

// Nội dung quy định: sửa chữ ở đây. Dùng **chữ đậm** để nhấn mạnh.
const UPDATED = "25/08/2026";
const INTRO = {
  text: "Quy định này áp dụng cho tất cả yêu cầu đổi xu/điểm lấy phần thưởng trên NXX315 Studio Rewards.",
  chips: ["Áp dụng cho mọi yêu cầu đổi thưởng", "Trừ xu khi yêu cầu được xác nhận", "Hoàn xu nếu lỗi từ hệ thống"],
};
const SECTIONS = [
  { id: "loai-qua", title: "Các loại phần thưởng", blocks: [
    { t: "p", x: "Tùy từng thời điểm, NXX315 Studio Rewards có thể cung cấp các phần thưởng như:" },
    { t: "list", items: ["Quân Huy", "Mã/code Robux", "Các phần thưởng khác được công bố trên hệ thống"] },
    { t: "note", tag: "Lưu ý", x: "Danh sách, giá trị và số xu/điểm cần thiết **có thể thay đổi** tùy từng thời điểm." },
  ]},
  { id: "dieu-kien", title: "Điều kiện đổi thưởng", blocks: [
    { t: "p", x: "Để tạo yêu cầu đổi thưởng:" },
    { t: "list", items: [
      "Tài khoản phải hoạt động bình thường",
      "Người dùng phải có đủ số xu/điểm yêu cầu",
      "Người dùng phải cung cấp thông tin nhận thưởng chính xác",
      "Tài khoản không đang bị hạn chế do vi phạm",
      "Yêu cầu phải tuân thủ các quy định của NXX315 Studio Rewards",
    ]},
  ]},
  { id: "quy-trinh", title: "Quy trình đổi thưởng", blocks: [
    { t: "p", x: "Thông thường, quy trình gồm:" },
    { t: "list", items: [
      "Bước 1: Người dùng chọn phần thưởng",
      "Bước 2: Hệ thống kiểm tra số xu/điểm",
      "Bước 3: Người dùng gửi yêu cầu đổi thưởng",
      "Bước 4: Yêu cầu được kiểm tra và xử lý",
      "Bước 5: Phần thưởng được cung cấp theo phương thức được công bố",
    ]},
    { t: "p", x: "Thời gian xử lý có thể khác nhau tùy loại phần thưởng và tình trạng hệ thống." },
  ]},
  { id: "thong-tin", title: "Thông tin nhận thưởng", blocks: [
    { t: "p", x: "Người dùng **chịu trách nhiệm kiểm tra thông tin** trước khi gửi yêu cầu." },
    { t: "note", tag: "Không hoàn xu", x: "Nếu người dùng cung cấp thông tin sai, NXX315 Studio Rewards **có thể không thể hoàn lại hoặc thay thế** phần thưởng đã được gửi thành công." },
  ]},
  { id: "huy-yeu-cau", title: "Hủy yêu cầu", blocks: [
    { t: "p", x: "Yêu cầu đổi thưởng có thể bị từ chối hoặc hủy nếu:" },
    { t: "list", items: [
      "Phát hiện gian lận",
      "Tài khoản vi phạm điều khoản",
      "Thông tin nhận thưởng không hợp lệ",
      "Phần thưởng không còn khả dụng",
      "Yêu cầu được tạo do lỗi hệ thống",
      "Có dấu hiệu bất thường cần xác minh",
    ]},
  ]},
  { id: "xu-sau-doi", title: "Xu/điểm sau khi đổi thưởng", blocks: [
    { t: "p", x: "Khi yêu cầu đổi thưởng được xác nhận, số xu/điểm tương ứng **sẽ được trừ khỏi tài khoản**." },
    { t: "note", tag: "Được hoàn xu", x: "Nếu yêu cầu bị từ chối do lỗi hệ thống hoặc nguyên nhân thuộc về NXX315 Studio Rewards, số xu/điểm **có thể được hoàn lại** tùy trường hợp." },
    { t: "note", tag: "Không hoàn xu", x: "Nếu yêu cầu bị từ chối do gian lận hoặc vi phạm của người dùng, NXX315 Studio Rewards **có quyền không hoàn lại** số xu/điểm liên quan." },
  ]},
  { id: "het-hang", title: "Phần thưởng hết hàng", blocks: [
    { t: "p", x: "Một số phần thưởng có thể có số lượng giới hạn hoặc phụ thuộc vào nguồn cung." },
    { t: "p", x: "NXX315 Studio Rewards có quyền tạm dừng hoặc ngừng cung cấp một phần thưởng khi phần thưởng đó không còn khả dụng." },
  ]},
  { id: "mua-ban-xu", title: "Không được mua bán xu/điểm", blocks: [
    { t: "p", x: "Xu/điểm trên hệ thống **không được mua bán, trao đổi hoặc chuyển nhượng** giữa người dùng nếu NXX315 Studio Rewards không cho phép." },
    { t: "p", x: "Mọi giao dịch ngoài hệ thống liên quan đến xu/điểm có thể không được hỗ trợ." },
  ]},
  { id: "tranh-chap", title: "Tranh chấp và hỗ trợ", blocks: [
    { t: "p", x: "Nếu xảy ra vấn đề với yêu cầu đổi thưởng, người dùng nên liên hệ kênh hỗ trợ chính thức và cung cấp thông tin cần thiết như mã đơn hàng hoặc thông tin giao dịch." },
    { t: "p", x: "NXX315 Studio Rewards sẽ xem xét từng trường hợp dựa trên dữ liệu hệ thống." },
  ]},
  { id: "thay-doi", title: "Thay đổi phần thưởng", blocks: [
    { t: "p", x: "NXX315 Studio Rewards có quyền thay đổi danh sách phần thưởng, số xu/điểm yêu cầu và điều kiện đổi thưởng khi cần thiết." },
  ]},
];

const PAGE_SECTIONS = SECTIONS.map((s) => ({ ...s, icon: ICONS[s.id], img: IMAGES[s.id] }));

export default function Redemption() {
  return (
    <LegalPage
      title="Quy định đổi thưởng"
      updated={UPDATED}
      intro={INTRO.text}
      chips={INTRO.chips}
      hero={IMAGES.hero}
      sections={PAGE_SECTIONS}
    />
  );
   }
  
