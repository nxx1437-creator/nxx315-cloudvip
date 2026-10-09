// ==================================================
// DỮ LIỆU CÁC MỤC HƯỚNG DẪN
// ==================================================

const ICON_BASE =
  "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/icons";

export const GUIDE_MENU = [
  {
    id: "bat-dau",
    label: "Bắt đầu",
    icon: `${ICON_BASE}/icon-rocket.png`,
    color: "#087EA4",
  },
  {
    id: "tai-khoan",
    label: "Tài khoản",
    icon: `${ICON_BASE}/icon-link.png`,
    color: "#0ea5e9",
  },
  {
    id: "kiem-coin",
    label: "Kiếm Coin",
    icon: `${ICON_BASE}/icon-task.png`,
    color: "#f59e0b",
  },
  {
    id: "lam-nhiem-vu",
    label: "Làm nhiệm vụ",
    icon: `${ICON_BASE}/icon-task.png`,
    color: "#3b82f6",
  },
  {
    id: "cap-do",
    label: "Cấp độ & ưu đãi",
    icon: `${ICON_BASE}/icon-rocket.png`,
    color: "#eab308",
  },
  {
    id: "moi-ban",
    label: "Mời bạn bè",
    icon: `${ICON_BASE}/icon-brain.png`,
    color: "#8b5cf6",
  },
  {
    id: "minigame",
    label: "Minigame",
    icon: `${ICON_BASE}/icon-coin.png`,
    color: "#ec4899",
  },
  {
    id: "doi-thuong",
    label: "Đổi thưởng",
    icon: `${ICON_BASE}/icon-coin.png`,
    color: "#d946ef",
  },
  {
    id: "rut-tien",
    label: "Rút tiền",
    icon: `${ICON_BASE}/icon-money.png`,
    color: "#10b981",
  },
  {
    id: "xep-hang-cong-dong",
    label: "Xếp hạng & cộng đồng",
    icon: `${ICON_BASE}/icon-chat.png`,
    color: "#f97316",
  },
  {
    id: "bao-mat",
    label: "Bảo mật",
    icon: `${ICON_BASE}/icon-shield.png`,
    color: "#6366f1",
  },
  {
    id: "faq",
    label: "FAQ",
    icon: `${ICON_BASE}/icon-chat.png`,
    color: "#14b8a6",
  },
  {
    id: "lien-he",
    label: "Liên hệ",
    icon: `${ICON_BASE}/icon-phone.png`,
    color: "#06b6d4",
  },
];

export const GUIDE_CONTENT = {
  "bat-dau": {
    title: "Bắt đầu sử dụng NXX315",
    description:
      "Chào mừng bạn đến với NXX315 Studio, nền tảng kiếm Coin đổi thưởng miễn phí. Hướng dẫn này giúp bạn bắt đầu trong vài phút.",
    sections: [
      {
        heading: "NXX315 là gì?",
        body: `NXX315 là nền tảng kiếm thưởng trực tuyến, nơi bạn có thể:
- Hoàn thành nhiệm vụ đơn giản để nhận Coin
- Đổi Coin lấy Robux và quà game
- Rút tiền về tài khoản của bạn

Toàn bộ miễn phí. Không cần nạp bất kỳ khoản nào.`,
      },
      {
        heading: "3 bước để bắt đầu",
        body: `1. **Đăng ký tài khoản**: chỉ cần email, 30 giây
2. **Xác minh email**: bấm liên kết trong thư xác nhận
3. **Làm nhiệm vụ đầu tiên**: vào mục [Nhiệm vụ](/tasks), chọn nhiệm vụ còn lượt

Sau khi hoàn thành nhiệm vụ đầu, bạn sẽ nhận Coin vào ví.`,
      },
      {
        heading: "Giải thích nhanh các từ hay gặp",
        body: `- **Xu (Coin)**: đơn vị thưởng trên NXX315, dùng để đổi quà.
- **Nhiệm vụ**: việc bạn làm qua liên kết của đối tác để nhận xu.
- **Lượt**: số lần được làm một nhiệm vụ mỗi ngày. Sang ngày mới lượt được làm mới.
- **Cấp độ**: tăng theo tổng xu bạn đã kiếm, càng cao càng được cộng thêm % xu.
- **Mã giới thiệu**: mã riêng để mời bạn bè.
- **Đơn đổi thưởng**: yêu cầu đổi xu lấy quà, theo dõi ở [Lịch sử](/history).`,
      },
      {
        heading: "Dùng trên điện thoại cho tiện",
        body: `1. Mở NXX315 bằng Chrome hoặc trình duyệt mặc định của máy.
2. Bấm menu của trình duyệt (dấu ba chấm) rồi chọn **Thêm vào màn hình chính**.
3. Từ đó bạn mở web như một ứng dụng, không cần gõ lại địa chỉ.

Nhớ cho phép **cửa sổ pop-up** với trang NXX315, vì nhiệm vụ mở trang đối tác ở tab mới.`,
      },
      {
        heading: "Lộ trình gợi ý cho 7 ngày đầu",
        body: `- **Ngày 1**: đăng ký, xác minh email, làm 1 đến 2 nhiệm vụ đầu tiên.
- **Ngày 2 đến 3**: làm đủ lượt mỗi ngày, thử [Minigame](/minigames).
- **Ngày 4 đến 5**: lấy mã giới thiệu và mời vài người bạn thật sự quan tâm.
- **Ngày 6 đến 7**: xem [Cửa hàng](/store), chọn món muốn đổi và đặt mục tiêu số xu.`,
      },
      {
        heading: "Cần hỗ trợ?",
        body: `- Chat với AI: vào mục [Hỗ trợ](/support)
- Chat Zalo: [0865245988](https://zalo.me/0865245988)
- Email: nxx315hub@gmail.com`,
      },
    ],
  },

  "tai-khoan": {
    title: "Quản lý tài khoản",
    description:
      "Hướng dẫn tạo tài khoản, đổi mật khẩu, cập nhật thông tin cá nhân và bảo vệ tài khoản của bạn.",
    sections: [
      {
        heading: "Đăng ký tài khoản",
        body: `1. Vào trang chủ → bấm **Đăng ký**
2. Điền **username**, **email**, **mật khẩu** (tối thiểu 6 ký tự)
3. Nếu có **mã mời**, điền vào để nhận +200 xu
4. Bấm **Đăng ký** → kiểm tra email xác nhận

⚠️ Mỗi thiết bị chỉ được tạo 1 tài khoản.`,
      },
      {
        heading: "Không nhận được email xác minh?",
        body: `1. Kiểm tra mục **Spam** hoặc **Quảng cáo** trong hộp thư.
2. Chắc chắn bạn gõ đúng địa chỉ email lúc đăng ký.
3. Chờ vài phút rồi thử gửi lại tại trang [Xác minh email](/verify-email).
4. Vẫn không có thì [liên hệ hỗ trợ](/support) kèm email đăng ký.`,
      },
      {
        heading: "Đổi mật khẩu",
        body: `1. Vào **Cá nhân** → **Bảo mật**
2. Bấm **Đổi mật khẩu**
3. Nhập mật khẩu cũ + mật khẩu mới
4. Nếu có bật **2FA**, xác thực qua Google Authenticator

Mật khẩu mới phải có ít nhất 6 ký tự.`,
      },
      {
        heading: "Quên mật khẩu",
        body: `Vào trang [Quên mật khẩu](/forgot-password), nhập email đăng ký và làm theo liên kết gửi về. Nếu bạn đã bật 2FA, hãy chuẩn bị app xác thực hoặc mã dự phòng.`,
      },
      {
        heading: "Cập nhật thông tin",
        body: `Bạn có thể đổi:
- **Username**: tối đa 1 lần mỗi 7 ngày
- **Avatar**: tối đa 3 lần mỗi ngày
- **Giao diện**: sáng/tối
- **Màu chủ đạo**: xanh dương, tím, xanh lá

Vào **Cá nhân** để chỉnh.`,
      },
      {
        heading: "Dùng tài khoản an toàn trên nhiều thiết bị",
        body: `- Chỉ đăng nhập trên thiết bị của chính bạn.
- Không cho người khác mượn tài khoản, vì mọi hoạt động đều tính cho bạn.
- Dùng máy lạ hoặc máy công cộng xong hãy **đăng xuất**.
- Nghi ngờ bị lộ mật khẩu: đổi mật khẩu rồi chọn **Đăng xuất mọi thiết bị** ở mục Bảo mật.`,
      },
    ],
  },
  "kiem-coin": {
    title: "Cách kiếm Coin",
    description:
      "Có 4 cách chính để kiếm Coin trên NXX315. Tất cả đều miễn phí.",
    sections: [
      {
        heading: "1. Làm nhiệm vụ",
        body: `Vào mục **Nhiệm vụ** → chọn nhiệm vụ → làm theo hướng dẫn.

Nhiệm vụ gồm:
- Vượt liên kết của đối tác (xem trang đối tác rồi quay lại)
- Nhiệm vụ đánh giá (xu cộng sau khi đối tác duyệt)

Số xu hiển thị ngay trên từng thẻ nhiệm vụ.
Mỗi nhiệm vụ có số lượt riêng mỗi ngày, sang ngày mới lượt được làm mới.

Xem hướng dẫn chi tiết ở mục [Làm nhiệm vụ](/guide/lam-nhiem-vu).`,
      },
      {
        heading: "2. Mời bạn bè",
        body: `Vào **Mời bạn bè** → copy link giới thiệu → chia sẻ cho bạn.

Khi bạn bè đăng ký và làm nhiệm vụ:
- Bạn nhận **15% hoa hồng** từ Coin họ kiếm được
- Bạn bè nhận **+200 Coin** khi đăng ký

Càng nhiều bạn bè hoạt động càng nhiều Coin.`,
      },
      {
        heading: "3. Chơi mini game",
        body: `Có 3 mini game:
- 🎡 **Vòng quay may mắn**: 100-1000 Coin
- 🎰 **Cào thẻ**: 50-500 Coin
- 🎲 **Đổ xúc xắc**: 100-2000 Coin

Mỗi game có lượt chơi miễn phí mỗi ngày. Xem thêm ở mục [Minigame](/guide/minigame).`,
      },
      {
        heading: "4. Sự kiện & Khuyến mãi",
        body: `Theo dõi **Thông báo** để không bỏ lỡ:
- Sự kiện x2, x3 Coin cuối tuần
- Quà tặng sinh nhật
- Streak bonus (điểm danh hàng ngày)

Đăng nhập hàng ngày để duy trì streak → nhận thưởng cao hơn.`,
      },
      {
        heading: "Kiếm xu hiệu quả mà không vi phạm",
        body: `- Làm nhiệm vụ **đúng quy trình** của đối tác, không bỏ bước và không làm quá nhanh.
- Mỗi ngày làm các nhiệm vụ xu cao trước, rồi mới đến nhiệm vụ xu thấp.
- Chỉ dùng **một tài khoản** trên một thiết bị, không dùng VPN hay proxy.
- Không dùng tool tự động hay mẹo lách lỗi. Các hành vi này bị hệ thống phát hiện và có thể bị khóa tài khoản.`,
      },
      {
        heading: "Theo dõi thu nhập của bạn",
        body: `- Số xu đã kiếm hôm nay hiện ở đầu trang [Nhiệm vụ](/tasks).
- Tab **Lịch sử** trong trang Nhiệm vụ cho biết các lượt đã làm.
- Biến động xu chi tiết xem trong [Ví](/wallet).`,
      },
    ],
  },

  "lam-nhiem-vu": {
    title: "Làm nhiệm vụ nhận xu",
    description:
      "Từng bước làm nhiệm vụ và nhận xu đúng cách, kèm cách xử lý khi chưa được cộng xu.",
    sections: [
      {
        heading: "Nhiệm vụ là gì?",
        body: `Mỗi nhiệm vụ là một liên kết do đối tác cung cấp. Bạn mở liên kết, hoàn thành các bước trên trang của đối tác, rồi quay lại NXX315 để nhận xu.

- Số xu của từng nhiệm vụ hiển thị ngay trên thẻ.
- Mỗi nhiệm vụ có giới hạn số lượt mỗi ngày, sang ngày mới lượt được làm mới.
- Nhiệm vụ nào hết lượt sẽ bị làm mờ, hãy chọn nhiệm vụ khác.

Vào [trang Nhiệm vụ](/tasks) để bắt đầu.`,
      },
      {
        heading: "Các bước thực hiện",
        body: `1. Vào trang Nhiệm vụ, chọn thẻ còn lượt và bấm **Làm nhiệm vụ**.
2. Đọc cảnh báo an toàn khi rời trang rồi bấm **Tiếp tục** (cảnh báo chỉ hiện vài lần đầu).
3. Giải captcha để xác nhận bạn là người thật.
4. Một tab mới mở ra là trang của đối tác. Làm theo hướng dẫn trên trang đó (chờ đếm giờ, bấm tiếp tục...).
5. Khi xong, đối tác sẽ tự chuyển bạn quay về NXX315.
6. Giải captcha lần nữa trong **30 giây** để xác nhận nhận xu.
7. Thấy thông báo thành công là xu đã được cộng vào tài khoản.`,
      },
      {
        heading: "Những điều bắt buộc",
        body: `- Phải đi hết các bước của đối tác, không đóng tab giữa chừng.
- Thời gian làm tối thiểu **45 giây**. Làm quá nhanh nhiệm vụ sẽ bị từ chối.
- Liên kết có hiệu lực **15 phút** kể từ lúc bấm. Quá hạn phải bấm làm lại.
- Phải giải captcha ở trang xác nhận trong **30 giây**, nếu không lượt đó sẽ bị hủy.
- Không dùng VPN, proxy hoặc nhiều tài khoản trên cùng một thiết bị.`,
      },
      {
        heading: "Vì sao làm xong mà chưa nhận xu?",
        body: `Các nguyên nhân thường gặp:

- Làm quá nhanh (dưới 45 giây) hoặc bỏ qua bước của đối tác.
- Đối tác không chuyển bạn về NXX315 sau khi hoàn tất.
- Quá 30 giây mới giải captcha ở trang xác nhận.
- Đã hết giới hạn lượt trong ngày hoặc đang trong thời gian chờ giữa hai lượt.
- Đang bật VPN/proxy nên bị chặn.
- Trình duyệt chặn cửa sổ mới (pop-up). Hãy cho phép pop-up cho trang NXX315.
- Nhiệm vụ dạng đánh giá: xu được cộng sau khi đối tác duyệt, có thể mất đến **10 ngày**.

Đã làm đúng mà vẫn không nhận được? [Liên hệ hỗ trợ](/support) và gửi kèm tên tài khoản, tên nhiệm vụ và thời gian bạn làm.`,
      },
      {
        heading: "Mẹo làm nhanh và an toàn",
        body: `- Dùng mạng ổn định (wifi hoặc 4G mạnh) để trang đối tác không bị treo.
- Nếu trang đối tác không tải, thử tắt trình chặn quảng cáo cho trang đó.
- Làm từng nhiệm vụ một, xong hẳn mới bấm nhiệm vụ tiếp theo.
- Ưu tiên nhiệm vụ có xu cao vì lượt mỗi ngày có hạn.
- Chỉ mở liên kết do chính NXX315 tạo ra. Không bấm link nhiệm vụ do người lạ gửi.`,
      },
    ],
  },

  "cap-do": {
    title: "Cấp độ và ưu đãi",
    description:
      "Cách cấp độ được tính và những ưu đãi bạn nhận được khi lên cấp.",
    sections: [
      {
        heading: "Cấp độ hoạt động thế nào?",
        body: `Cấp độ của bạn tăng theo **tổng số xu đã kiếm được** từ trước đến nay. Việc bạn tiêu xu để đổi quà không làm tụt cấp.

Xem cấp hiện tại và các mốc tiếp theo tại [trang Cấp độ](/level).`,
      },
      {
        heading: "Ưu đãi khi lên cấp",
        body: `- Cấp càng cao, bạn được **cộng thêm % xu** mỗi khi làm nhiệm vụ.
- Trên trang Nhiệm vụ có dải thông báo cho biết bạn đang được cộng thêm bao nhiêu %.
- Số xu ghi trên mỗi thẻ nhiệm vụ đã tính sẵn phần thưởng thêm này.`,
      },
      {
        heading: "Cách lên cấp nhanh hơn",
        body: `1. Làm đủ lượt nhiệm vụ mỗi ngày, đừng bỏ lỡ nhiệm vụ xu cao.
2. Chơi [minigame](/minigames) khi có lượt.
3. Mời bạn bè cùng tham gia, hoa hồng giới thiệu cũng được tính vào xu kiếm được.
4. Duy trì đăng nhập đều đặn mỗi ngày.`,
      },
      {
        heading: "Lưu ý",
        body: `- Mức ưu đãi cụ thể của từng cấp luôn lấy theo thông tin hiển thị trên trang Cấp độ.
- Tài khoản vi phạm quy định có thể bị điều chỉnh hoặc thu hồi ưu đãi.`,
      },
    ],
  },
  "moi-ban": {
    title: "Mời bạn bè nhận hoa hồng",
    description:
      "Chương trình giới thiệu bạn bè: nhận 15% hoa hồng từ xu mà bạn bè kiếm được.",
    sections: [
      {
        heading: "Cách hoạt động",
        body: `1. Vào **Mời bạn bè** → lấy link giới thiệu của bạn
2. Chia sẻ link cho bạn bè (Facebook, Zalo, TikTok...)
3. Bạn bè bấm link → đăng ký tài khoản
4. **Bạn nhận +200 Coin** cho mỗi người đăng ký thành công

Sau đó, khi bạn bè làm nhiệm vụ, bạn nhận **15% hoa hồng** từ phần xu họ kiếm được.`,
      },
      {
        heading: "Cách tính hoa hồng (ví dụ minh họa)",
        body: `Hoa hồng là **15% số xu** mà người bạn mời kiếm được từ nhiệm vụ.

Ví dụ giả định: nếu một người bạn nhận 1.000 xu từ nhiệm vụ trong một ngày, bạn nhận 15% = **150 xu**.

Đây chỉ là ví dụ về cách tính, **không phải cam kết thu nhập**. Mỗi nhiệm vụ có giới hạn lượt mỗi ngày nên số xu thực tế phụ thuộc vào mức độ hoạt động của bạn bè.`,
      },
      {
        heading: "Điều kiện nhận hoa hồng",
        body: `- Bạn bè phải **đăng ký mới** (chưa từng có tài khoản)
- Bạn bè phải **xác minh email**
- Bạn bè phải **hoàn thành ít nhất 1 nhiệm vụ**
- Không vi phạm chính sách (spam, tài khoản giả)

Hoa hồng sẽ tự động cộng vào ví bạn.`,
      },
      {
        heading: "Quy tắc để không bị từ chối thưởng",
        body: `- Mỗi người chỉ có **một** người giới thiệu.
- Không tự tạo nhiều tài khoản rồi tự mời chính mình. Hệ thống đối chiếu thiết bị và địa chỉ mạng để phát hiện.
- Không đăng mã giới thiệu ở nơi spam hoặc kèm thông tin sai lệch.
- Tài khoản bị xác định gian lận sẽ bị thu hồi thưởng và có thể bị khóa.`,
      },
      {
        heading: "Mẹo mời hiệu quả",
        body: `- Nói rõ cho bạn bè cách làm nhiệm vụ đúng, tránh họ làm sai rồi bỏ.
- Hướng dẫn bạn bè đọc mục [Làm nhiệm vụ](/guide/lam-nhiem-vu) trước khi bắt đầu.
- Mời người thật sự quan tâm, vì hoa hồng chỉ phát sinh khi họ hoạt động.`,
      },
    ],
  },

  minigame: {
    title: "Minigame: vòng quay, cào thẻ, xúc xắc",
    description:
      "Giới thiệu các trò chơi nhỏ và những lưu ý để chơi an toàn.",
    sections: [
      {
        heading: "Có những trò nào?",
        body: `- **Vòng quay**: quay để nhận phần thưởng ngẫu nhiên.
- **Cào thẻ**: cào để lộ phần thưởng.
- **Xúc xắc**: gieo xúc xắc theo luật hiển thị trong trò.

Tất cả nằm ở trang [Minigame](/minigames).`,
      },
      {
        heading: "Cách chơi",
        body: `1. Vào trang Minigame và chọn trò bạn muốn.
2. Xem phần luật và số lượt hoặc số vé bạn đang có ngay trong trò.
3. Bấm chơi và chờ kết quả.
4. Phần thưởng được cộng vào tài khoản ngay sau khi có kết quả.`,
      },
      {
        heading: "Lưu ý quan trọng",
        body: `- Kết quả do hệ thống quyết định ngẫu nhiên. **Không có mẹo hay tool nào** làm tăng tỉ lệ thắng.
- Ai rao bán tool hack minigame đều là **lừa đảo**. Không đưa tiền hay mật khẩu cho họ.
- Chỉ chơi bằng phần xu dư, đừng dùng xu bạn đang dành để đổi quà.
- Thấy mình chơi quá đà? Hãy nghỉ và quay lại làm nhiệm vụ.`,
      },
    ],
  },

  "doi-thuong": {
    title: "Đổi thưởng",
    description:
      "Hướng dẫn đổi Coin lấy Robux, quà game và nhiều phần quà khác tại Cửa hàng.",
    sections: [
      {
        heading: "Cửa hàng có những gì?",
        body: `Tại [trang Cửa hàng](/store) hiện hỗ trợ:

- **Roblox**: Robux (có tab VNG và Quốc tế)
- **Liên Quân Mobile**: Quân Huy
- **Free Fire**, **PUBG Mobile**, **FC Mobile**, **Valorant**
- **Play Together**

Danh mục có thể thay đổi, hãy xem trực tiếp trong cửa hàng.`,
      },
      {
        heading: "Đổi Robux",
        body: `1. Vào **Cửa hàng** → chọn **Roblox**
2. Chọn gói Robux muốn đổi
3. Nhập **username Roblox** hoặc **User ID**, hệ thống sẽ hiện avatar để bạn kiểm tra đúng tài khoản
4. Bấm **Xác nhận đơn**
5. Admin duyệt trong **5-30 phút**

**Lưu ý:** Nhập đúng username, sai sẽ không hoàn xu.

Tỷ lệ: **1000 Coin ≈ 10,000 Robux** (tùy gói)`,
      },
      {
        heading: "Đổi thẻ điện thoại",
        body: `Hỗ trợ các nhà mạng:
- **Viettel**: 10k, 20k, 50k, 100k
- **Mobifone**: 10k, 20k, 50k
- **Vinaphone**: 10k, 20k, 50k
- **Vietnamobile**: 20k, 50k

Thời gian xử lý: **5-15 phút**
Nhận mã thẻ qua thông báo hoặc email.`,
      },
      {
        heading: "Đổi gift card",
        body: `Gift card có sẵn:
- 🎮 **Steam Wallet**: 50k, 100k, 200k
- 📱 **Google Play**: 50k, 100k
- 🍎 **Apple Store**: 100k, 200k
- 🎁 **Zing Card**: 20k, 50k, 100k

Thời gian xử lý: **10-30 phút**`,
      },
      {
        heading: "Nhập thông tin cho đúng",
        body: `- Kiểm tra **chính xác từng ký tự** của tên đăng nhập hoặc ID trước khi xác nhận.
- Với Play Together: bạn gửi ID người chơi, quản trị viên sẽ nạp Kim cương thủ công qua cổng nạp chính thức của nhà phát hành.
- Giữ liên lạc ở kênh nhận hàng bạn đã chọn (Discord hoặc Zalo) để nhận mã hoặc thông báo.
- Xem quy định đầy đủ tại [Chính sách đổi thưởng](/redemption-policy).`,
      },
      {
        heading: "Thời gian và chính sách",
        body: `**Thời gian duyệt:** 5-30 phút (giờ hành chính)
**Hoàn tiền:** 100% nếu lỗi hệ thống
**Không hoàn:** nếu bạn nhập sai username/ID

Ngưỡng đổi tối thiểu: **1,000 Coin**`,
      },
      {
        heading: "Theo dõi đơn và hoàn xu",
        body: `- Mọi đơn nằm trong [Lịch sử](/history). Bấm vào đơn để xem chi tiết.
- Đơn thất bại do lỗi hệ thống được hoàn xu, xem tại [Lịch sử hoàn tiền](/refund-history).
- Quá thời gian xử lý mà chưa nhận được? [Liên hệ hỗ trợ](/support) kèm mã đơn.`,
      },
    ],
  },
  "rut-tien": {
    title: "Ví và rút tiền",
    description:
      "Xem số dư trong ví và hướng dẫn rút tiền về tài khoản ngân hàng.",
    sections: [
      {
        heading: "Ví của bạn",
        body: `Trang [Ví](/wallet) cho biết số dư hiện tại và các biến động gần đây. Mọi lần cộng hoặc trừ xu đều được ghi lại để bạn đối chiếu.`,
      },
      {
        heading: "Điều kiện rút tiền",
        body: `- **Số dư tối thiểu:** 50,000 Coin
- **Tài khoản đã xác minh** email
- **Không bị gắn cờ** gian lận
- **Đã hoàn thành ít nhất 10 nhiệm vụ**

Tỷ lệ: **1,000 Coin = 10,000 VNĐ**`,
      },
      {
        heading: "Cách rút tiền",
        body: `1. Vào **Ví** → bấm **Rút tiền** (hoặc vào trang [Rút tiền](/withdraw))
2. Nhập **số tiền** muốn rút
3. Chọn **ngân hàng** (Vietcombank, Techcombank, MB...)
4. Nhập **số tài khoản** + **tên chủ tài khoản**
5. Bấm **Xác nhận**

Yêu cầu sẽ được admin duyệt trong **24 giờ**. Theo dõi tại [Lịch sử rút](/withdraw/history).`,
      },
      {
        heading: "Thời gian nhận tiền",
        body: `- **Duyệt:** 2-24 giờ
- **Chuyển khoản:** 5-30 phút sau khi duyệt
- **Cuối tuần/ngày lễ:** có thể chậm hơn

**Lưu ý:** Tên chủ tài khoản phải trùng với tên đăng ký.`,
      },
      {
        heading: "Phí rút tiền",
        body: `**Miễn phí 100%** cho lần rút đầu tiên.

Các lần sau:
- Dưới 500,000 VNĐ: **miễn phí**
- Trên 500,000 VNĐ: **1%** phí giao dịch`,
      },
      {
        heading: "Lưu ý khi rút",
        body: `- Kiểm tra kỹ thông tin nhận trước khi gửi, yêu cầu đã gửi khó chỉnh sửa.
- Tài khoản đang bị hạn chế hoặc nghi ngờ gian lận có thể bị tạm dừng rút.
- NXX315 **không bao giờ** nhờ bạn chuyển tiền trước để nhận tiền rút.`,
      },
    ],
  },

  "xep-hang-cong-dong": {
    title: "Bảng xếp hạng và cộng đồng",
    description:
      "Xem thứ hạng, đăng bài và tương tác trong cộng đồng NXX315.",
    sections: [
      {
        heading: "Bảng xếp hạng",
        body: `[Bảng xếp hạng](/leaderboard) cho thấy những thành viên hoạt động nổi bật. Hãy làm nhiệm vụ đều đặn để leo hạng.`,
      },
      {
        heading: "Cộng đồng (Feed)",
        body: `Tại [trang Cộng đồng](/feed), bạn có thể:

- Xem bài đăng của các thành viên.
- **Thích**, **bình luận** và **chia sẻ hoặc lưu** bài viết.
- Đăng bài gồm chữ, hình ảnh và liên kết (nếu bạn đủ điều kiện).`,
      },
      {
        heading: "Điều kiện đăng bài",
        body: `- Chỉ thành viên **đủ điều kiện** mới đăng được, dựa trên cấp độ và số xu của tài khoản, hoặc được quản trị viên cấp quyền.
- Chưa đăng được thì bạn vẫn xem và tương tác bình thường.`,
      },
      {
        heading: "Quy tắc cộng đồng",
        body: `- Không spam, không đăng lặp nội dung.
- Không đăng liên kết lừa đảo, độc hại hoặc quảng cáo trái phép.
- Không xúc phạm, quấy rối thành viên khác.
- Không đăng nội dung không phù hợp với lứa tuổi nhỏ.
- Bài vi phạm sẽ bị gỡ, người đăng có thể mất quyền đăng bài hoặc bị khóa tài khoản.`,
      },
    ],
  },

  "bao-mat": {
    title: "Bảo mật tài khoản",
    description:
      "Cách bảo vệ tài khoản của bạn khỏi bị hack, chiếm đoạt hoặc lừa đảo.",
    sections: [
      {
        heading: "Bật xác minh 2 bước (2FA)",
        body: `1. Vào **Cá nhân** → **Bảo mật**
2. Bấm **Xác thực 2 bước**
3. Cài **Google Authenticator** trên điện thoại
4. Quét mã QR hiển thị
5. Nhập mã 6 số để xác nhận

Từ đó, mỗi lần đăng nhập sẽ cần mã từ app.`,
      },
      {
        heading: "Mã dự phòng",
        body: `Sau khi bật 2FA, bạn sẽ nhận **10 mã dự phòng**.

**Lưu vào nơi an toàn** (ghi chú, sổ tay, trình quản lý mật khẩu).

Dùng mã dự phòng khi:
- Mất điện thoại
- Không nhận được mã 2FA
- Đổi máy mới

Mỗi mã chỉ dùng được 1 lần.`,
      },
      {
        heading: "Cảnh giác lừa đảo",
        body: `⚠️ **NXX315 KHÔNG BAO GIỜ** yêu cầu:
- Mật khẩu của bạn
- Mã OTP
- Số CCCD
- Nạp tiền để rút tiền

🚨 **Nếu có người tự xưng admin** yêu cầu những điều trên → **lừa đảo**, chặn ngay.`,
      },
      {
        heading: "Quy định một người một tài khoản",
        body: `Để công bằng cho mọi người, hệ thống kiểm tra thiết bị và địa chỉ mạng của tài khoản.

- Nhiều tài khoản dùng chung một thiết bị hoặc cùng địa chỉ mạng có thể bị đánh dấu là **đa tài khoản**.
- Dùng VPN hoặc proxy để qua mặt hệ thống sẽ bị chặn.
- Dùng công cụ tự động, tool hack hoặc lỗi hệ thống để lấy xu là vi phạm.`,
      },
      {
        heading: "Hậu quả khi vi phạm",
        body: `1. Điểm rủi ro của tài khoản tăng lên.
2. Tài khoản bị hạn chế: không làm nhiệm vụ, đổi thưởng hoặc rút xu.
3. Vi phạm nặng hoặc lặp lại: khóa tài khoản và thu hồi xu không hợp lệ.

Xem chi tiết tại [Chống gian lận](/fraud) và [Điều khoản](/terms).`,
      },
      {
        heading: "Khi bị hack",
        body: `Nếu nghi ngờ tài khoản bị xâm nhập:
1. **Đổi mật khẩu ngay** ở trang khác
2. Vào **Cá nhân** → **Bảo mật** → **Đăng xuất mọi thiết bị**
3. Liên hệ Zalo **0865245988** để được hỗ trợ
4. Chúng tôi sẽ hỗ trợ khôi phục trong 24h`,
      },
      {
        heading: "Nếu tài khoản bị hạn chế nhầm",
        body: `Bạn có thể liên hệ để được xem xét lại. Hãy chuẩn bị tên tài khoản, email đăng ký và mô tả ngắn gọn tình huống, rồi gửi qua [Hỗ trợ](/support) hoặc trang [Liên hệ](/contact).`,
      },
      {
        heading: "Dành cho người dùng nhỏ tuổi",
        body: `Bạn nhỏ tuổi nên được phụ huynh biết và đồng ý trước khi dùng. Không chia sẻ thông tin cá nhân như địa chỉ, số điện thoại, trường học cho người lạ. Xem thêm [Chính sách quyền riêng tư](/privacy).`,
      },
    ],
  },
  faq: {
    title: "Câu hỏi thường gặp",
    description: "Tổng hợp các câu hỏi phổ biến của người dùng NXX315.",
    sections: [
      {
        heading: "NXX315 là gì? Có uy tín không?",
        body: `NXX315 là nền tảng kiếm thưởng trực tuyến do NXX315 Studio vận hành. Bạn làm nhiệm vụ, nhận xu và đổi lấy quà trong Cửa hàng.

- Mọi lần cộng, trừ xu và mọi đơn đổi thưởng đều có lịch sử để bạn đối chiếu.
- Điều khoản, quyền riêng tư và chính sách đổi thưởng được công khai tại [Điều khoản](/terms), [Quyền riêng tư](/privacy) và [Chính sách đổi thưởng](/redemption-policy).
- Hỗ trợ qua các kênh chính thức ở mục [Liên hệ](/guide/lien-he).`,
      },
      {
        heading: "Có cần nạp tiền không?",
        body: `**Hoàn toàn miễn phí.** Bạn chỉ cần làm nhiệm vụ để kiếm Coin.

NXX315 **KHÔNG BAO GIỜ** yêu cầu nạp bất kỳ khoản nào.`,
      },
      {
        heading: "Làm xong nhiệm vụ nhưng không nhận được xu?",
        body: `Xem danh sách nguyên nhân tại mục [Làm nhiệm vụ](/guide/lam-nhiem-vu). Nếu đã làm đúng mà vẫn không nhận được, gửi cho hỗ trợ **tên nhiệm vụ** và **thời gian bạn làm**.`,
      },
      {
        heading: "Vì sao nhiệm vụ báo hết lượt?",
        body: `Mỗi nhiệm vụ có giới hạn số lượt mỗi ngày. Sang ngày mới lượt được làm mới. Bạn có thể chọn nhiệm vụ khác còn lượt.`,
      },
      {
        heading: "Bao lâu thì nhận được thưởng?",
        body: `- **Đổi Robux/quà game:** 5-30 phút
- **Rút tiền mặt:** 2-24 giờ
- **Sự kiện:** tùy chương trình

Nếu quá 1 giờ chưa nhận được → liên hệ Zalo hỗ trợ.`,
      },
      {
        heading: "Tôi nhập sai tên hoặc ID khi đổi thì sao?",
        body: `Liên hệ hỗ trợ càng sớm càng tốt kèm mã đơn. Xem thêm [Chính sách đổi thưởng](/redemption-policy).`,
      },
      {
        heading: "Đơn thất bại có được hoàn xu không?",
        body: `Đơn thất bại do lỗi hệ thống được hoàn xu. Xem tại [Lịch sử hoàn tiền](/refund-history).`,
      },
      {
        heading: "Vì sao tài khoản tôi bị khoá?",
        body: `Có thể do:
- Tạo nhiều tài khoản trên cùng thiết bị
- Sử dụng VPN/Proxy
- Gian lận khi làm nhiệm vụ
- Nhập sai mật khẩu quá nhiều lần

Liên hệ Zalo **0865245988** để được hỗ trợ.`,
      },
      {
        heading: "Tôi có thể tạo nhiều tài khoản không?",
        body: `**KHÔNG.** Mỗi người chỉ được 1 tài khoản.

Chúng tôi dùng hệ thống kiểm tra:
- IP
- Dấu vân tay thiết bị
- Hành vi

Tài khoản vi phạm sẽ bị **khoá vĩnh viễn**.`,
      },
      {
        heading: "Mời bạn bè có giới hạn không?",
        body: `**Không giới hạn.** Bạn có thể mời bao nhiêu bạn bè tùy thích.

Nhưng **KHÔNG** được:
- Tạo tài khoản giả để tự mời
- Spam link khắp nơi
- Dùng tool tự động

Vi phạm sẽ bị khoá tài khoản.`,
      },
    ],
  },

  "lien-he": {
    title: "Liên hệ hỗ trợ",
    description:
      "Các kênh liên hệ chính thức của NXX315. Chúng tôi hỗ trợ 24/7.",
    sections: [
      {
        heading: "Chat với AI",
        body: `Vào mục **Hỗ trợ** để chat với trợ lý AI NXX.

**Ưu điểm:**
- Trả lời ngay lập tức
- Hỗ trợ 24/7
- Giải đáp đơn hàng, thanh toán, kỹ thuật

[Chat ngay với AI](/support)`,
      },
      {
        heading: "Chat Zalo",
        body: `**Zalo:** [0865245988](https://zalo.me/0865245988)

**Thời gian hỗ trợ:** 8:00 - 24:00 hàng ngày

Đây là kênh **nhanh nhất** để gặp nhân viên thật.`,
      },
      {
        heading: "Email",
        body: `**Email:** nxx315hub@gmail.com

**Thời gian phản hồi:** trong vòng 24 giờ

Phù hợp cho:
- Khiếu nại
- Báo lỗi
- Hợp tác kinh doanh`,
      },
      {
        heading: "Viết yêu cầu hỗ trợ thế nào để được xử lý nhanh?",
        body: `Hãy gửi kèm đủ các thông tin sau:

- **Tên tài khoản** và **email đăng ký**.
- **Việc bạn đang làm** (nhiệm vụ nào, đơn nào, mã đơn nếu có).
- **Thời gian** xảy ra sự việc.
- **Ảnh chụp màn hình** thông báo lỗi.

Càng đầy đủ thì đội hỗ trợ càng kiểm tra được nhanh. **Không gửi mật khẩu hay mã OTP** cho bất kỳ ai.`,
      },
      {
        heading: "Cảnh báo lừa đảo",
        body: `⚠️ NXX315 **chỉ có 3 kênh chính thức** như trên.

Nếu bạn thấy:
- Fanpage Facebook lạ tự xưng NXX315
- Group Zalo không chính thức
- Người tự xưng admin yêu cầu nạp tiền

→ **KHÔNG PHẢI CHÚNG TÔI**. Báo cáo ngay cho Zalo chính thức.`,
      },
    ],
  },
};
