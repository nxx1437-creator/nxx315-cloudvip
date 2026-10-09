// Phần viết thêm, nối vào cuối các mục đã có
export const APPEND = {
  "bat-dau": [
    {
      heading: "Giải thích nhanh các từ hay gặp",
      body: [
        "- **Xu (Coin)**: đơn vị thưởng trên NXX315, dùng để đổi quà.",
        "- **Nhiệm vụ**: việc bạn làm qua liên kết của đối tác để nhận xu.",
        "- **Lượt**: số lần được làm một nhiệm vụ mỗi ngày. Sang ngày mới lượt được làm mới.",
        "- **Cấp độ**: tăng theo tổng xu bạn đã kiếm, càng cao càng được cộng thêm % xu.",
        "- **Mã giới thiệu**: mã riêng để mời bạn bè.",
        "- **Đơn đổi thưởng**: yêu cầu đổi xu lấy quà, theo dõi ở [Lịch sử](/history).",
      ].join("\n"),
    },
    {
      heading: "Dùng trên điện thoại cho tiện",
      body: [
        "1. Mở NXX315 bằng Chrome hoặc trình duyệt mặc định của máy.",
        "2. Bấm menu của trình duyệt (dấu ba chấm) rồi chọn **Thêm vào màn hình chính**.",
        "3. Từ đó bạn mở web như một ứng dụng, không cần gõ lại địa chỉ.",
        "",
        "Nhớ cho phép **cửa sổ pop-up** với trang NXX315, vì nhiệm vụ mở trang đối tác ở tab mới.",
      ].join("\n"),
    },
    {
      heading: "Lộ trình gợi ý cho 7 ngày đầu",
      body: [
        "- **Ngày 1**: đăng ký, xác minh email, làm 1 đến 2 nhiệm vụ đầu tiên.",
        "- **Ngày 2 đến 3**: làm đủ lượt mỗi ngày, thử [Minigame](/minigames).",
        "- **Ngày 4 đến 5**: lấy mã giới thiệu và mời vài người bạn thật sự quan tâm.",
        "- **Ngày 6 đến 7**: xem [Cửa hàng](/store), chọn món muốn đổi và đặt mục tiêu số xu.",
      ].join("\n"),
    },
  ],

  "tai-khoan": [
    {
      heading: "Không nhận được email xác minh?",
      body: [
        "1. Kiểm tra mục **Spam** hoặc **Quảng cáo** trong hộp thư.",
        "2. Chắc chắn bạn gõ đúng địa chỉ email lúc đăng ký.",
        "3. Chờ vài phút rồi thử gửi lại tại trang [Xác minh email](/verify-email).",
        "4. Vẫn không có thì [liên hệ hỗ trợ](/support) kèm email đăng ký.",
      ].join("\n"),
    },
    {
      heading: "Quên mật khẩu",
      body: [
        "Vào trang [Quên mật khẩu](/forgot-password), nhập email đăng ký và làm theo liên kết gửi về. Nếu bạn đã bật 2FA, hãy chuẩn bị app xác thực hoặc mã dự phòng.",
      ].join("\n"),
    },
    {
      heading: "Dùng tài khoản an toàn trên nhiều thiết bị",
      body: [
        "- Chỉ đăng nhập trên thiết bị của chính bạn.",
        "- Không cho người khác mượn tài khoản, vì mọi hoạt động đều tính cho bạn.",
        "- Dùng máy lạ hoặc máy công cộng xong hãy **đăng xuất**.",
        "- Nghi ngờ bị lộ mật khẩu: đổi mật khẩu rồi chọn **Đăng xuất mọi thiết bị** ở mục Bảo mật.",
      ].join("\n"),
    },
  ],

  "kiem-coin": [
    {
      heading: "Kiếm xu hiệu quả mà không vi phạm",
      body: [
        "- Làm nhiệm vụ **đúng quy trình** của đối tác, không bỏ bước và không làm quá nhanh.",
        "- Mỗi ngày làm đủ lượt ở các nhiệm vụ xu cao trước, rồi mới đến nhiệm vụ xu thấp.",
        "- Chỉ dùng **một tài khoản** trên một thiết bị, không dùng VPN hay proxy.",
        "- Không dùng tool tự động hay mẹo lách lỗi. Các hành vi này bị hệ thống phát hiện và có thể bị khóa tài khoản.",
      ].join("\n"),
    },
    {
      heading: "Nhiệm vụ bị lỗi thì làm gì?",
      body: [
        "Xem nguyên nhân phổ biến và cách xử lý chi tiết ở mục [Làm nhiệm vụ](/guide/lam-nhiem-vu). Nếu đã làm đúng mà chưa nhận xu, gửi cho [Hỗ trợ](/support) tên nhiệm vụ và thời gian bạn làm.",
      ].join("\n"),
    },
    {
      heading: "Theo dõi thu nhập của bạn",
      body: [
        "- Số xu đã kiếm hôm nay hiện ở đầu trang [Nhiệm vụ](/tasks).",
        "- Tab **Lịch sử** trong trang Nhiệm vụ cho biết các lượt đã làm.",
        "- Biến động xu chi tiết xem trong [Ví](/wallet).",
      ].join("\n"),
    },
  ],

  "lien-he": [
    {
      heading: "Viết yêu cầu hỗ trợ thế nào để được xử lý nhanh?",
      body: [
        "Hãy gửi kèm đủ các thông tin sau:",
        "",
        "- **Tên tài khoản** và **email đăng ký**.",
        "- **Việc bạn đang làm** (nhiệm vụ nào, đơn nào, mã đơn nếu có).",
        "- **Thời gian** xảy ra sự việc.",
        "- **Ảnh chụp màn hình** thông báo lỗi.",
        "",
        "Càng đầy đủ thì đội hỗ trợ càng kiểm tra được nhanh. **Không gửi mật khẩu hay mã OTP** cho bất kỳ ai.",
      ].join("\n"),
    },
  ],
};
