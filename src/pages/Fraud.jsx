import React from "react";
import { User, AlertTriangle, Bot, Ban, Bug, Mail, RefreshCw } from "lucide-react";
import LegalPage from "../components/LegalKit.jsx";

// ẢNH / VIDEO MINH HỌA: ảnh thì tải lên Supabase (bucket game_logos) rồi ghi TÊN FILE;
// video thì để trong thư mục public của repo rồi ghi "/ten-video.mp4". Để "" nếu chưa có.
// Muốn có chú thích dưới ảnh thì viết ["ten-file.jpg", "Tiêu đề", "Mô tả ngắn"].
const IMAGES = {
  hero: "/fraud-hero.mp4",
  "mot-tai-khoan": "", "hanh-vi": "", "phat-hien": "", "xu-ly": "",
  "loi-he-thong": "", "khieu-nai": "", "cap-nhat": "",
};

const ICONS = {
  "mot-tai-khoan": User, "hanh-vi": AlertTriangle, "phat-hien": Bot, "xu-ly": Ban,
  "loi-he-thong": Bug, "khieu-nai": Mail, "cap-nhat": RefreshCw,
};

// Nội dung chính sách: sửa chữ ở đây. Dùng **chữ đậm** để nhấn mạnh.
const UPDATED = "25/08/2026";
const INTRO = {
  text: "NXX315 Studio Rewards được xây dựng dựa trên nguyên tắc công bằng giữa người dùng. Các hành vi cố tình gian lận, khai thác lỗi hoặc tạo nhiều tài khoản để nhận lợi ích không hợp lệ đều bị nghiêm cấm.",
  chips: ["Một người, một tài khoản", "Không bot, không khai thác lỗi", "Được khiếu nại khi bị xử lý nhầm"],
};
const SECTIONS = [
  { id: "mot-tai-khoan", title: "Một người dùng, một tài khoản", blocks: [
    { t: "p", x: "Mỗi người dùng **chỉ được phép sử dụng một tài khoản** trên NXX315 Studio Rewards." },
    { t: "p", x: "Việc thay đổi thiết bị hoặc mạng Internet không làm thay đổi quy định này." },
    { t: "note", tag: "Nghiêm cấm", x: "Tạo hoặc sử dụng nhiều tài khoản nhằm:", items: [
      "Nhận phần thưởng nhiều lần",
      "Vượt giới hạn nhiệm vụ",
      "Nhận ưu đãi dành cho người dùng mới nhiều lần",
      "Chuyển hoặc gom xu/điểm bất hợp lệ",
      "Né tránh các biện pháp xử lý tài khoản",
    ]},
  ]},
  { id: "hanh-vi", title: "Các hành vi bị coi là gian lận", blocks: [
    { t: "p", x: "Bao gồm nhưng không giới hạn:" },
    { t: "list", items: [
      "Tạo nhiều tài khoản",
      "Sử dụng tài khoản của người khác",
      "Làm giả kết quả hoặc bằng chứng nhiệm vụ",
      "Khai báo nhiệm vụ chưa hoàn thành",
      "Sử dụng bot hoặc công cụ tự động trái phép",
      "Can thiệp vào dữ liệu hoặc yêu cầu gửi đến hệ thống",
      "Khai thác lỗi để tạo xu/điểm",
      "Cố tình gửi yêu cầu bất thường đến hệ thống",
      "Tìm cách vượt giới hạn nhiệm vụ hoặc giới hạn phần thưởng",
      "Sử dụng các phương thức nhằm che giấu hành vi vi phạm",
    ]},
  ]},
  { id: "phat-hien", title: "Phát hiện gian lận", blocks: [
    { t: "p", x: "NXX315 Studio Rewards có thể sử dụng các thông tin và tín hiệu hợp lệ mà hệ thống có sẵn để phát hiện hoạt động bất thường. Một tài khoản có thể được xem xét khi xuất hiện các dấu hiệu như:" },
    { t: "list", items: [
      "Hoạt động nhiệm vụ bất thường",
      "Lịch sử nhận thưởng không hợp lý",
      "Nhiều tài khoản có hành vi liên quan đáng ngờ",
      "Thao tác có dấu hiệu tự động hóa",
      "Khai thác lỗi hoặc hành vi bất thường khác",
    ]},
    { t: "note", tag: "Lưu ý", x: "Việc sử dụng Wi-Fi, 4G hoặc 5G khác nhau **không được xem là lý do hợp lệ** để tạo thêm tài khoản." },
  ]},
  { id: "xu-ly", title: "Biện pháp xử lý", blocks: [
    { t: "p", x: "Tùy mức độ vi phạm, NXX315 Studio Rewards có thể:" },
    { t: "list", items: [
      "Từ chối nhiệm vụ",
      "Hủy xu/điểm không hợp lệ",
      "Hủy phần thưởng chưa xử lý",
      "Tạm khóa tài khoản",
      "Khóa tài khoản vĩnh viễn",
      "Hạn chế một số chức năng",
      "Từ chối các yêu cầu đổi thưởng liên quan",
    ]},
    { t: "p", x: "Trong trường hợp nghiêm trọng, các tài khoản có liên quan đến hành vi gian lận cũng có thể được kiểm tra." },
  ]},
  { id: "loi-he-thong", title: "Khai thác lỗi hệ thống", blocks: [
    { t: "p", x: "Nếu phát hiện lỗi, người dùng **nên báo cho NXX315 Studio Rewards** thay vì khai thác lỗi." },
    { t: "note", tag: "Nghiêm cấm", x: "Việc cố tình khai thác lỗi để nhận xu, điểm hoặc phần thưởng **được xem là hành vi vi phạm** chính sách chống gian lận." },
  ]},
  { id: "khieu-nai", title: "Khiếu nại", blocks: [
    { t: "p", x: "Nếu cho rằng tài khoản bị xử lý nhầm, người dùng có thể liên hệ kênh hỗ trợ chính thức để yêu cầu xem xét." },
    { t: "p", x: "NXX315 Studio Rewards có quyền yêu cầu thông tin cần thiết để xác minh khiếu nại." },
  ]},
  { id: "cap-nhat", title: "Cập nhật chính sách", blocks: [
    { t: "p", x: "Chính sách chống gian lận có thể được cập nhật để phù hợp với những hình thức gian lận mới hoặc thay đổi của hệ thống." },
    { t: "p", x: "Việc tiếp tục sử dụng dịch vụ đồng nghĩa với việc người dùng chấp nhận chính sách hiện hành." },
  ]},
];

const PAGE_SECTIONS = SECTIONS.map((s) => ({ ...s, icon: ICONS[s.id], img: IMAGES[s.id] }));

export default function Fraud() {
  return (
    <LegalPage
      title="Chính sách chống gian lận"
      updated={UPDATED}
      intro={INTRO.text}
      chips={INTRO.chips}
      hero={IMAGES.hero}
      sections={PAGE_SECTIONS}
    />
  );
   }

