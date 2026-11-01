import React from "react";
import { Database, Eye, Lock, Share2, Clock, UserCheck, Baby, RefreshCw, Mail } from "lucide-react";
import LegalPage from "../components/LegalKit.jsx";

// ẢNH MINH HỌA: tải ảnh lên Supabase (bucket game_logos), rồi ghi TÊN FILE vào đây. Để "" nếu chưa có.
// Muốn có chú thích dưới ảnh thì viết ["ten-file.jpg", "Tiêu đề", "Mô tả ngắn"].
const IMAGES = {
  hero: "",
  "thu-thap": "", "muc-dich": "", "bao-ve": "", "chia-se": "", "luu-tru": "",
  quyen: "", "do-tuoi": "", "thay-doi": "", "lien-he": "",
};

const ICONS = {
  "thu-thap": Database, "muc-dich": Eye, "bao-ve": Lock, "chia-se": Share2, "luu-tru": Clock,
  quyen: UserCheck, "do-tuoi": Baby, "thay-doi": RefreshCw, "lien-he": Mail,
};

// Nội dung chính sách: sửa chữ ở đây. Dùng **chữ đậm** để nhấn mạnh.
// Loại khối: p (đoạn), list (danh sách), note (ô lưu ý có nhãn).
const UPDATED = "25/08/2026";
const INTRO = {
  text: "NXX315 Studio Rewards tôn trọng quyền riêng tư của người dùng và cam kết bảo vệ thông tin được cung cấp trong quá trình sử dụng dịch vụ.",
  chips: ["Chỉ thu thập thông tin cần thiết", "Không chủ động bán thông tin cá nhân", "Từ 15 tuổi trở lên"],
};
const SECTIONS = [
  { id: "thu-thap", title: "Thông tin chúng tôi có thể thu thập", blocks: [
    { t: "p", x: "Tùy vào cách bạn sử dụng dịch vụ, NXX315 Studio Rewards có thể xử lý một số thông tin cần thiết cho hoạt động của tài khoản, bao gồm:" },
    { t: "list", items: [
      "Thông tin tài khoản như tên hiển thị hoặc thông tin đăng nhập",
      "Thông tin liên quan đến hồ sơ người dùng",
      "Lịch sử nhiệm vụ và phần thưởng",
      "Lịch sử đổi thưởng",
      "Thông tin cần thiết để xử lý yêu cầu hỗ trợ",
      "Thông tin kỹ thuật cần thiết để duy trì và bảo vệ hoạt động của hệ thống",
    ]},
    { t: "note", tag: "Lưu ý", x: "Chúng tôi **chỉ thu thập những thông tin cần thiết** cho mục đích vận hành, bảo mật và cung cấp dịch vụ." },
  ]},
  { id: "muc-dich", title: "Mục đích sử dụng thông tin", blocks: [
    { t: "p", x: "Thông tin có thể được sử dụng để:" },
    { t: "list", items: [
      "Quản lý tài khoản người dùng",
      "Ghi nhận nhiệm vụ và xu/điểm",
      "Xử lý yêu cầu đổi thưởng",
      "Phát hiện và ngăn chặn gian lận",
      "Bảo vệ hệ thống khỏi hành vi lạm dụng",
      "Cải thiện chất lượng dịch vụ",
      "Xử lý yêu cầu hỗ trợ",
      "Khắc phục lỗi và sự cố kỹ thuật",
    ]},
  ]},
  { id: "bao-ve", title: "Bảo vệ thông tin", blocks: [
    { t: "p", x: "NXX315 Studio Rewards áp dụng các biện pháp phù hợp nhằm hạn chế truy cập trái phép, mất mát hoặc sử dụng thông tin không đúng mục đích." },
    { t: "note", tag: "Lưu ý", x: "Tuy nhiên, **không có hệ thống trực tuyến nào có thể đảm bảo an toàn tuyệt đối**. Người dùng cũng có trách nhiệm bảo vệ thông tin đăng nhập và không chia sẻ thông tin tài khoản cho người khác." },
  ]},
  { id: "chia-se", title: "Chia sẻ thông tin", blocks: [
    { t: "p", x: "NXX315 Studio Rewards **không chủ động bán thông tin cá nhân** của người dùng." },
    { t: "p", x: "Thông tin có thể được cung cấp cho bên thứ ba khi cần thiết để:" },
    { t: "list", items: [
      "Cung cấp hoặc xử lý phần thưởng",
      "Duy trì hoạt động của dịch vụ",
      "Xử lý vấn đề kỹ thuật",
      "Tuân thủ nghĩa vụ pháp lý hợp lệ",
      "Bảo vệ quyền lợi, tài sản và sự an toàn của hệ thống",
    ]},
  ]},
  { id: "luu-tru", title: "Thời gian lưu trữ", blocks: [
    { t: "p", x: "Thông tin được lưu trữ trong khoảng thời gian cần thiết để vận hành dịch vụ, xử lý giao dịch, bảo mật hệ thống và thực hiện các mục đích hợp pháp khác." },
    { t: "p", x: "Một số dữ liệu giao dịch hoặc dữ liệu liên quan đến gian lận có thể được lưu giữ lâu hơn để phục vụ việc kiểm tra và bảo vệ hệ thống." },
  ]},
  { id: "quyen", title: "Quyền của người dùng", blocks: [
    { t: "p", x: "Tùy theo quy định pháp luật áp dụng, người dùng có thể yêu cầu:" },
    { t: "list", items: [
      "Kiểm tra thông tin liên quan đến tài khoản",
      "Sửa thông tin không chính xác",
      "Yêu cầu hỗ trợ liên quan đến dữ liệu của mình",
      "Yêu cầu xóa tài khoản khi phù hợp",
    ]},
    { t: "note", tag: "Lưu ý", x: "Một số dữ liệu có thể cần được giữ lại vì lý do bảo mật, giao dịch, chống gian lận hoặc nghĩa vụ pháp lý." },
  ]},
  { id: "do-tuoi", title: "Trẻ em và độ tuổi sử dụng", blocks: [
    { t: "p", x: "NXX315 Studio Rewards yêu cầu người dùng **từ 15 tuổi trở lên**." },
    { t: "p", x: "Nếu phát hiện tài khoản không đáp ứng điều kiện độ tuổi, NXX315 Studio Rewards có thể hạn chế hoặc chấm dứt quyền sử dụng tài khoản." },
  ]},
  { id: "thay-doi", title: "Thay đổi chính sách", blocks: [
    { t: "p", x: "Chính sách quyền riêng tư có thể được cập nhật khi hệ thống hoặc cách thức xử lý dữ liệu thay đổi." },
    { t: "p", x: "Phiên bản mới sẽ được công bố trên website cùng ngày cập nhật." },
  ]},
  { id: "lien-he", title: "Liên hệ", blocks: [
    { t: "p", x: "Nếu bạn có câu hỏi hoặc yêu cầu liên quan đến quyền riêng tư, vui lòng liên hệ NXX315 Studio Rewards thông qua kênh hỗ trợ chính thức được công bố trên website." },
  ]},
];


const PAGE_SECTIONS = SECTIONS.map((s) => ({ ...s, icon: ICONS[s.id], img: IMAGES[s.id] }));

export default function Privacy() {
  return (
    <LegalPage
      title="Chính sách quyền riêng tư"
      updated={UPDATED}
      intro={INTRO.text}
      chips={INTRO.chips}
      hero={IMAGES.hero}
      sections={PAGE_SECTIONS}
    />
  );
      }

    
