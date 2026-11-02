import React from "react";
import {
  ShieldCheck, UserCog, Users, Coins, ClipboardList, Gift, Ban, ShieldAlert,
  Bug, Server, RefreshCw, LogOut, Scale, Mail,
} from "lucide-react";
import LegalPage from "../components/LegalKit.jsx";

// ẢNH MINH HỌA: tải ảnh lên Supabase (bucket game_logos), rồi ghi TÊN FILE vào đây. Để "" nếu chưa có.
// Muốn có chú thích dưới ảnh thì viết ["ten-file.jpg", "Tiêu đề", "Mô tả ngắn"].
const IMAGES = {
  hero: "/terms-hero.mp4", // video để trong thư mục public của repo (hoặc ảnh: ghi tên file trong game_logos)
  "gioi-thieu": "", "dieu-kien": "", "tai-khoan": "", "xu-diem": "", "nhiem-vu": "",
  "doi-thuong": "", "tu-choi": "", "chong-gian-lan": "", "loi-he-thong": "", "kha-dung": "",
  "thay-doi": "", "cham-dut": "", "trach-nhiem": "", "lien-he": "",
};

const ICONS = {
  "gioi-thieu": ShieldCheck, "dieu-kien": UserCog, "tai-khoan": Users, "xu-diem": Coins,
  "nhiem-vu": ClipboardList, "doi-thuong": Gift, "tu-choi": Ban, "chong-gian-lan": ShieldAlert,
  "loi-he-thong": Bug, "kha-dung": Server, "thay-doi": RefreshCw, "cham-dut": LogOut,
  "trach-nhiem": Scale, "lien-he": Mail,
};

// Nội dung Điều khoản sử dụng. Muốn sửa chữ thì sửa ở đây, không cần đụng giao diện.
// Dùng **chữ đậm** để nhấn mạnh. Loại khối: p (đoạn), list (danh sách), note (ô lưu ý có nhãn).
const UPDATED = "25/08/2026";

const INTRO = {
  tag: "Lưu ý quan trọng",
  text: "Bằng việc đăng ký, truy cập hoặc sử dụng NXX315 Studio Rewards, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý tuân thủ các Điều khoản sử dụng dưới đây.",
  chips: ["Từ 15 tuổi", "Mỗi người một tài khoản", "Xu chỉ có giá trị trong hệ thống"],
};

const SECTIONS = [
  { id: "gioi-thieu", title: "Giới thiệu", blocks: [
    { t: "p", x: "NXX315 Studio Rewards là nền tảng cho phép người dùng tham gia các nhiệm vụ, chương trình hoặc hoạt động được cung cấp trên hệ thống để nhận xu/điểm thưởng." },
    { t: "p", x: "Xu/điểm có thể được sử dụng để yêu cầu đổi lấy các phần thưởng được NXX315 Studio Rewards công bố, bao gồm nhưng không giới hạn ở:" },
    { t: "list", items: ["Quân Huy", "Mã/code Robux", "Các phần thưởng khác được công bố trên hệ thống"] },
    { t: "note", tag: "Lưu ý", x: "NXX315 Studio Rewards không phải là Roblox Corporation và không đại diện, liên kết hoặc được Roblox Corporation tài trợ, chứng thực hay quản lý." },
  ]},
  { id: "dieu-kien", title: "Điều kiện sử dụng", blocks: [
    { t: "p", x: "Để sử dụng dịch vụ, người dùng phải:" },
    { t: "list", items: [
      "Từ 15 tuổi trở lên",
      "Cung cấp thông tin đăng ký chính xác và trung thực",
      "Chỉ sử dụng tài khoản của chính mình",
      "Tuân thủ các điều khoản và quy định của NXX315 Studio Rewards",
      "Không sử dụng hệ thống nhằm mục đích gian lận, trục lợi hoặc phá hoại dịch vụ",
    ]},
    { t: "p", x: "NXX315 Studio Rewards có quyền yêu cầu xác minh thông tin khi cần thiết để bảo vệ hệ thống và người dùng." },
  ]},
  { id: "tai-khoan", title: "Tài khoản người dùng", blocks: [
    { t: "p", x: "Mỗi người dùng chỉ được phép sở hữu một tài khoản trên hệ thống, trừ khi NXX315 Studio Rewards có quy định khác." },
    { t: "p", x: "Người dùng chịu trách nhiệm bảo vệ thông tin đăng nhập và không được chia sẻ tài khoản cho người khác." },
    { t: "note", tag: "Nghiêm cấm", items: [
      "Tạo nhiều tài khoản để nhận nhiều lần phần thưởng",
      "Sử dụng tài khoản của người khác",
      "Mua, bán, cho thuê hoặc chuyển nhượng tài khoản",
      "Sử dụng thông tin giả để đăng ký",
      "Sử dụng công cụ tự động hoặc bot để thao tác với hệ thống khi chưa được cho phép",
    ]},
  ]},
  { id: "xu-diem", title: "Xu và điểm thưởng", blocks: [
    { t: "note", tag: "Lưu ý", x: "Xu/điểm trên NXX315 Studio Rewards **chỉ có giá trị trong phạm vi hệ thống** và không được xem là tiền mặt, tiền điện tử, tài sản tài chính hoặc phương tiện thanh toán." },
    { t: "p", x: "Xu/điểm có thể được cộng hoặc trừ dựa trên:" },
    { t: "list", items: ["Nhiệm vụ hoàn thành hợp lệ", "Hoạt động khuyến mãi", "Đổi phần thưởng", "Điều chỉnh do lỗi hệ thống hoặc hành vi gian lận"] },
    { t: "p", x: "NXX315 Studio Rewards có quyền điều chỉnh hoặc thu hồi số xu/điểm được ghi nhận do lỗi hệ thống, giao dịch không hợp lệ hoặc hành vi gian lận." },
  ]},
  { id: "nhiem-vu", title: "Nhiệm vụ", blocks: [
    { t: "p", x: "Người dùng phải hoàn thành nhiệm vụ theo đúng yêu cầu được hiển thị trên hệ thống." },
    { t: "note", tag: "Nghiêm cấm", items: [
      "Khai báo hoàn thành nhiệm vụ khi chưa thực hiện",
      "Sử dụng nhiều tài khoản để thực hiện cùng một nhiệm vụ nhằm nhận thưởng nhiều lần",
      "Sử dụng bot, script hoặc công cụ tự động trái phép",
      "Làm giả bằng chứng hoàn thành nhiệm vụ",
      "Khai thác lỗi hệ thống để nhận xu/điểm",
      "Cố tình tạo hoạt động giả nhằm tăng phần thưởng",
    ]},
    { t: "p", x: "NXX315 Studio Rewards có quyền từ chối ghi nhận hoặc thu hồi phần thưởng đối với nhiệm vụ không hợp lệ." },
  ]},
  { id: "doi-thuong", title: "Quy định đổi thưởng", blocks: [
    { t: "p", x: "Người dùng có thể sử dụng số xu/điểm đủ điều kiện để tạo yêu cầu đổi phần thưởng. Các yêu cầu đổi thưởng phải tuân thủ:" },
    { t: "list", items: [
      "Người dùng phải có đủ số xu/điểm yêu cầu",
      "Thông tin nhận thưởng phải chính xác",
      "Một yêu cầu đổi thưởng có thể cần được kiểm tra trước khi hoàn tất",
      "Thời gian xử lý có thể thay đổi tùy từng loại phần thưởng",
    ]},
    { t: "p", x: "Sau khi yêu cầu được xác nhận và xử lý thành công, số xu/điểm tương ứng sẽ được trừ khỏi tài khoản." },
    { t: "note", tag: "Lưu ý", x: "NXX315 Studio Rewards không đảm bảo rằng mọi phần thưởng luôn có sẵn. Phần thưởng có thể thay đổi, hết hàng hoặc được thay thế tùy theo tình trạng cung cấp." },
  ]},
  { id: "tu-choi", title: "Hủy hoặc từ chối yêu cầu đổi thưởng", blocks: [
    { t: "p", x: "NXX315 Studio Rewards có thể từ chối, tạm dừng hoặc hủy yêu cầu đổi thưởng nếu:" },
    { t: "list", items: [
      "Phát hiện dấu hiệu gian lận",
      "Người dùng vi phạm Điều khoản sử dụng",
      "Thông tin nhận thưởng không chính xác",
      "Yêu cầu được tạo do lỗi hệ thống",
      "Phần thưởng không còn khả dụng",
      "Có lý do hợp lý để nghi ngờ tài khoản hoặc giao dịch không hợp lệ",
    ]},
    { t: "note", tag: "Hoàn xu", x: "Trong trường hợp yêu cầu bị từ chối do lỗi của người dùng hoặc hành vi vi phạm, NXX315 Studio Rewards **có thể không hoàn lại** số xu/điểm đã sử dụng cho yêu cầu đó." },
  ]},
  { id: "chong-gian-lan", title: "Chính sách chống gian lận", blocks: [
    { t: "p", x: "NXX315 Studio Rewards áp dụng các biện pháp kỹ thuật và thủ công nhằm phát hiện hành vi bất thường. Hệ thống có thể xem xét nhiều tín hiệu khác nhau, chẳng hạn như:" },
    { t: "list", items: ["Thông tin tài khoản", "Lịch sử nhiệm vụ", "Lịch sử đổi thưởng", "Thiết bị và phiên đăng nhập", "Các dấu hiệu hoạt động bất thường", "Mối liên hệ giữa nhiều tài khoản"] },
    { t: "note", tag: "Lưu ý", x: "Việc sử dụng mạng Wi-Fi, 4G hoặc 5G khác nhau không đồng nghĩa với việc người dùng được phép tạo nhiều tài khoản." },
    { t: "note", tag: "Biện pháp xử lý", x: "Nếu phát hiện hành vi gian lận hoặc lạm dụng hệ thống, NXX315 Studio Rewards có thể:", items: [
      "Hủy nhiệm vụ không hợp lệ",
      "Thu hồi xu/điểm bất hợp lệ",
      "Tạm khóa tài khoản",
      "Khóa tài khoản vĩnh viễn",
      "Hủy các yêu cầu đổi thưởng liên quan",
      "Từ chối các yêu cầu hỗ trợ liên quan đến hành vi vi phạm",
    ], foot: "NXX315 Studio Rewards có thể áp dụng biện pháp xử lý ngay cả khi hành vi gian lận được phát hiện sau khi phần thưởng đã được cấp." },
  ]},
  { id: "loi-he-thong", title: "Lạm dụng lỗi hệ thống", blocks: [
    { t: "p", x: "Người dùng không được cố ý khai thác lỗi, lỗ hổng hoặc hành vi ngoài dự kiến của hệ thống để nhận lợi ích." },
    { t: "p", x: "Nếu phát hiện lỗi, người dùng nên thông báo cho NXX315 Studio Rewards thay vì khai thác lỗi." },
    { t: "note", tag: "Lưu ý", x: "Việc cố tình khai thác lỗi để nhận xu, điểm hoặc phần thưởng có thể được xem là hành vi gian lận." },
  ]},
  { id: "kha-dung", title: "Tính khả dụng của dịch vụ", blocks: [
    { t: "p", x: "NXX315 Studio Rewards có thể tạm ngừng hoặc hạn chế một phần dịch vụ để:" },
    { t: "list", items: ["Bảo trì", "Nâng cấp hệ thống", "Khắc phục lỗi", "Xử lý sự cố bảo mật", "Thực hiện các thay đổi cần thiết đối với nền tảng"] },
    { t: "p", x: "NXX315 Studio Rewards không đảm bảo rằng dịch vụ sẽ luôn hoạt động liên tục hoặc không xảy ra lỗi." },
  ]},
  { id: "thay-doi", title: "Thay đổi điều khoản", blocks: [
    { t: "p", x: "NXX315 Studio Rewards có quyền cập nhật hoặc thay đổi Điều khoản sử dụng khi cần thiết. Phiên bản mới sẽ được công bố trên website và có thể có ngày cập nhật mới." },
    { t: "note", tag: "Lưu ý", x: "Việc tiếp tục sử dụng dịch vụ sau khi điều khoản được cập nhật được xem là bạn tiếp tục chấp nhận các điều khoản mới." },
  ]},
  { id: "cham-dut", title: "Chấm dứt quyền sử dụng", blocks: [
    { t: "p", x: "NXX315 Studio Rewards có quyền hạn chế hoặc chấm dứt quyền truy cập của người dùng nếu người dùng:" },
    { t: "list", items: [
      "Vi phạm Điều khoản sử dụng",
      "Gian lận hoặc cố tình lạm dụng hệ thống",
      "Gây ảnh hưởng đến hoạt động của nền tảng",
      "Sử dụng dịch vụ cho mục đích trái pháp luật",
      "Có hành vi gây ảnh hưởng nghiêm trọng đến người dùng hoặc hệ thống",
    ]},
  ]},
  { id: "trach-nhiem", title: "Trách nhiệm của người dùng", blocks: [
    { t: "p", x: "Người dùng có trách nhiệm đảm bảo rằng hoạt động của mình trên NXX315 Studio Rewards tuân thủ pháp luật hiện hành và các quy định của nền tảng." },
    { t: "p", x: "Người dùng không được sử dụng NXX315 Studio Rewards để thực hiện các hoạt động bất hợp pháp, lừa đảo hoặc gây thiệt hại cho người khác." },
  ]},
  { id: "lien-he", title: "Liên hệ", blocks: [
    { t: "p", x: "Nếu bạn phát hiện lỗi, vấn đề bảo mật, giao dịch bất thường hoặc cần hỗ trợ liên quan đến tài khoản, vui lòng liên hệ với NXX315 Studio Rewards thông qua kênh hỗ trợ chính thức được công bố trên website." },
  ]},
];

const ACCEPT = {
  id: "chap-nhan",
  title: "Chấp nhận điều khoản",
  lead: "Khi tạo tài khoản hoặc tiếp tục sử dụng NXX315 Studio Rewards, bạn xác nhận rằng:",
  items: [
    "Bạn đã đọc và hiểu Điều khoản sử dụng",
    "Bạn đáp ứng điều kiện độ tuổi tối thiểu 15 tuổi",
    "Bạn đồng ý tuân thủ các quy định của nền tảng",
    "Bạn hiểu rằng hành vi gian lận hoặc lạm dụng có thể dẫn đến việc mất quyền sử dụng tài khoản và các quyền lợi liên quan",
  ],
  foot: "NXX315 Studio Rewards có quyền thực hiện các biện pháp cần thiết để bảo vệ tính công bằng, an toàn và ổn định của hệ thống.",
};


const PAGE_SECTIONS = SECTIONS.map((s) => ({ ...s, icon: ICONS[s.id], img: IMAGES[s.id] }));

export default function Terms() {
  return (
    <LegalPage
      title="Điều khoản sử dụng"
      updated={UPDATED}
      intro={INTRO.text}
      chips={INTRO.chips}
      hero={IMAGES.hero}
      sections={PAGE_SECTIONS}
      accept={ACCEPT}
    />
  );
     }
     
