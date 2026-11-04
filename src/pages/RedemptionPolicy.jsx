import React from "react";
import {
  Gift, ShieldCheck, Clock, Mail, XCircle, Coins, AlertCircle, Ban, MessageCircle,
  RefreshCw, BadgeCheck, ListChecks, Scale,
} from "lucide-react";
import LegalPage from "../components/LegalKit.jsx";

// ====== ĐIỀN CÁC GIÁ TRỊ NÀY TRƯỚC KHI ĐƯA LÊN WEB ======
// Chỉ ghi đúng những gì bạn thật sự làm được. Giữ GIỐNG HỆT ở trang Điều khoản.
const SUPPORT_EMAIL = "support@nxx315.com";
const MIN_COINS = "5,000";
const PROCESS_HOURS = "24 giờ làm việc";        // thời gian xử lý Robux, thống nhất với trang Điều khoản
const COMPLAINT_DAYS = "7 ngày";             // thời hạn người dùng được khiếu nại
const REPLY_DAYS = "3 ngày làm việc";        // thời gian bạn phản hồi khiếu nại
const NOTICE_DAYS = "2 ngày";                // thông báo trước khi đổi danh sách/giá phần thưởng

// ẢNH / VIDEO MINH HỌA: ảnh thì tải lên Supabase (bucket game_logos) rồi ghi TÊN FILE;
// video thì để trong thư mục public của repo rồi ghi "/ten-video.mp4". Để "" nếu chưa có.
const IMAGES = {
  hero: "/redemption-hero.mp4",
  "loai-qua": "", "bang-xu": "", "dieu-kien": "", "quy-trinh": "", "thong-tin": "",
  "huy-yeu-cau": "", "xu-sau-doi": "", "het-hang": "", "mua-ban-xu": "",
  "khieu-nai": "", "thay-doi": "", "lien-ket": "",
};

const ICONS = {
  "loai-qua": Gift, "bang-xu": ListChecks, "dieu-kien": ShieldCheck, "quy-trinh": Clock,
  "thong-tin": Mail, "huy-yeu-cau": XCircle, "xu-sau-doi": Coins, "het-hang": AlertCircle,
  "mua-ban-xu": Ban, "khieu-nai": MessageCircle, "thay-doi": RefreshCw, "lien-ket": Scale,
};

// Nội dung quy định: sửa chữ ở đây. Dùng **chữ đậm** để nhấn mạnh.
const UPDATED = "04/11/2026";

const INTRO = {
  text: "Quy định này áp dụng cho tất cả yêu cầu đổi xu/điểm lấy phần thưởng trên NXX315 Studio Rewards. Vui lòng đọc kỹ trước khi gửi yêu cầu.",
  chips: ["Áp dụng cho mọi yêu cầu đổi thưởng", "Trừ xu khi yêu cầu được xác nhận", "Hoàn xu nếu lỗi từ phía hệ thống"],
};

const SECTIONS = [
  { id: "loai-qua", title: "Các loại phần thưởng", blocks: [
    { t: "p", x: "Tùy từng thời điểm, NXX315 Studio Rewards có thể cung cấp các phần thưởng như:" },
    { t: "list", items: ["Quân Huy", "Mã/code Robux", "Các phần thưởng khác được công bố trên hệ thống"] },
    { t: "note", tag: "Lưu ý", x: "Danh sách phần thưởng, giá trị và số xu/điểm cần thiết **có thể thay đổi** theo từng thời điểm. Xem mục “Thay đổi phần thưởng” bên dưới." },
    { t: "note", tag: "Nguồn phần thưởng", x: "Phần thưởng Robux được NXX315 Studio Rewards cung cấp thông qua các đối tác phân phối chính thức tại Việt Nam. Chúng tôi không sử dụng các công cụ hoặc phương thức trái phép để tạo Robux." },
  ]},
  { id: "bang-xu", title: "Bảng xu cần để đổi thưởng", blocks: [
    { t: "p", x: `Số xu/điểm cần để đổi từng phần thưởng và mức xu tối thiểu (hiện là **${MIN_COINS}**) được hiển thị trên trang đổi thưởng **trước khi** bạn gửi yêu cầu.` },
    { t: "p", x: "Bạn nên kiểm tra kỹ số xu cần thiết và thông tin nhận thưởng trước khi xác nhận." },
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
    { t: "p", x: `Với phần thưởng Robux, chúng tôi nỗ lực xử lý **trong vòng ${PROCESS_HOURS}** kể từ khi yêu cầu được duyệt. Thời gian này có thể kéo dài hơn khi hệ thống bảo trì hoặc yêu cầu cần xác minh thêm, và khi đó chúng tôi sẽ thông báo cho bạn.` },
  ]},
  { id: "thong-tin", title: "Thông tin nhận thưởng", blocks: [
    { t: "p", x: "Người dùng **chịu trách nhiệm kiểm tra thông tin** (ví dụ tên người dùng/ID game) trước khi gửi yêu cầu." },
    { t: "note", tag: "Không hoàn xu", x: "Nếu phần thưởng đã được gửi thành công đến thông tin do chính người dùng nhập sai, NXX315 Studio Rewards **có thể không thể hoàn lại hoặc thay thế** phần thưởng đó." },
  ]},
  { id: "huy-yeu-cau", title: "Từ chối hoặc hủy yêu cầu", blocks: [
    { t: "p", x: "Yêu cầu đổi thưởng có thể bị từ chối hoặc hủy nếu:" },
    { t: "list", items: [
      "Phát hiện gian lận",
      "Tài khoản vi phạm điều khoản",
      "Thông tin nhận thưởng không hợp lệ",
      "Phần thưởng không còn khả dụng",
      "Yêu cầu được tạo do lỗi hệ thống",
      "Có dấu hiệu bất thường cần xác minh",
    ]},
    { t: "note", tag: "Quyền của bạn", x: `Khi từ chối hoặc hủy yêu cầu, chúng tôi sẽ thông báo **lý do** cho bạn. Bạn có thể khiếu nại theo mục “Khiếu nại và hỗ trợ”.` },
  ]},
  { id: "xu-sau-doi", title: "Xu/điểm sau khi đổi thưởng", blocks: [
    { t: "p", x: "Khi yêu cầu đổi thưởng được xác nhận, số xu/điểm tương ứng **sẽ được trừ khỏi tài khoản**." },
    { t: "note", tag: "Được hoàn xu", x: "Nếu yêu cầu bị từ chối, thất bại hoặc phần thưởng không được cung cấp do lỗi hệ thống hoặc nguyên nhân thuộc về NXX315 Studio Rewards (bao gồm trường hợp Robux bị thu hồi do lỗi từ phía chúng tôi), số xu/điểm tương ứng **sẽ được hoàn lại vào tài khoản của bạn**." },
    { t: "note", tag: "Không hoàn xu", x: "Nếu yêu cầu bị từ chối do gian lận hoặc vi phạm đã được xác định của người dùng, NXX315 Studio Rewards có quyền không hoàn lại số xu/điểm liên quan." },
  ]},
  { id: "het-hang", title: "Phần thưởng hết hàng", blocks: [
    { t: "p", x: "Một số phần thưởng có thể có số lượng giới hạn hoặc phụ thuộc vào nguồn cung." },
    { t: "p", x: "NXX315 Studio Rewards có quyền tạm dừng hoặc ngừng cung cấp một phần thưởng khi phần thưởng đó không còn khả dụng. Với yêu cầu đã trừ xu mà phần thưởng hết hàng, số xu sẽ được hoàn lại." },
  ]},
  { id: "mua-ban-xu", title: "Không được mua bán xu/điểm", blocks: [
    { t: "p", x: "Xu/điểm trên hệ thống **không được mua bán, trao đổi hoặc chuyển nhượng** giữa người dùng nếu NXX315 Studio Rewards không cho phép." },
    { t: "p", x: "Mọi giao dịch ngoài hệ thống liên quan đến xu/điểm sẽ không được hỗ trợ." },
  ]},
  { id: "khieu-nai", title: "Khiếu nại và hỗ trợ", blocks: [
    { t: "p", x: `Nếu có vấn đề với yêu cầu đổi thưởng, hoặc bạn không đồng ý với kết quả xử lý, bạn có thể gửi khiếu nại trong vòng **${COMPLAINT_DAYS}** kể từ khi nhận kết quả, qua email **${SUPPORT_EMAIL}** hoặc kênh hỗ trợ chính thức trên website.` },
    { t: "p", x: "Vui lòng cung cấp mã yêu cầu/mã giao dịch, tên tài khoản và mô tả vấn đề để chúng tôi kiểm tra nhanh hơn." },
    { t: "p", x: `Chúng tôi sẽ phản hồi trong vòng **${REPLY_DAYS}** và xem xét từng trường hợp dựa trên dữ liệu hệ thống.` },
  ]},
  { id: "thay-doi", title: "Thay đổi phần thưởng", blocks: [
    { t: "p", x: "NXX315 Studio Rewards có quyền thay đổi danh sách phần thưởng, số xu/điểm yêu cầu và điều kiện đổi thưởng khi cần thiết." },
    { t: "note", tag: "Cam kết", x: `Thay đổi sẽ được thông báo trên website **ít nhất ${NOTICE_DAYS}** trước khi áp dụng, và chỉ áp dụng cho yêu cầu **mới**. Yêu cầu đã được xác nhận trước đó vẫn được xử lý theo điều kiện cũ.` },
  ]},
  { id: "lien-ket", title: "Không liên kết với nhà phát hành game", blocks: [
    { t: "p", x: "NXX315 Studio Rewards là đơn vị độc lập, **không phải** Roblox Corporation, Garena hay nhà phát hành của bất kỳ tựa game nào được nhắc đến trên website." },
    { t: "p", x: "Chúng tôi không đại diện, liên kết hoặc được các nhà phát hành này tài trợ, chứng thực hay quản lý. Tên và nhãn hiệu game thuộc quyền sở hữu của chủ sở hữu tương ứng." },
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
