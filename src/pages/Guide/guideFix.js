// Ghi đè các mục Guide bằng số liệu đã đối chiếu với database và code thật
export function applyGuideFix(C) {
  const patch = (id, startsWith, next) => {
    const list = C[id]?.sections;
    if (!list) return;
    const i = list.findIndex((s) => s.heading.startsWith(startsWith));
    if (i !== -1) list[i] = next;
  };

  // ================= KIẾM COIN =================
  C["kiem-coin"] = {
    title: "Cách kiếm Coin",
    description:
      "Các cách kiếm Coin trên NXX315. Tất cả đều miễn phí.",
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
        heading: "2. Điểm danh hàng ngày",
        body: `Điểm danh mỗi ngày để nhận xu, chuỗi điểm danh kéo dài **7 ngày** rồi quay lại từ đầu:

- Ngày 1: **100** xu
- Ngày 2: **150** xu
- Ngày 3: **200** xu
- Ngày 4: **300** xu
- Ngày 5: **400** xu
- Ngày 6: **500** xu
- Ngày 7: **1.000** xu

Bỏ lỡ một ngày thì chuỗi bắt đầu lại từ ngày 1.`,
      },
      {
        heading: "3. Thưởng mốc",
        body: `**Mốc nhiệm vụ**: hoàn thành 1, 5 hoặc 10 nhiệm vụ để nhận lần lượt **50**, **200** và **400** xu. Mỗi mốc nhận một lần.

**Mốc mời bạn**: mời đủ 3, 5, 10 hoặc 20 người để nhận lần lượt **500**, **1.000**, **3.000** và **10.000** xu. Xem chi tiết ở mục [Mời bạn bè](/guide/moi-ban).`,
      },
      {
        heading: "4. Mời bạn bè",
        body: `Vào **Mời bạn bè** → copy link giới thiệu → chia sẻ cho bạn.

- Người được mời nhập mã sẽ nhận **+200 xu**.
- Bạn nhận **15% hoa hồng** từ số xu mà người đó kiếm được từ nhiệm vụ.
- Bạn còn nhận thưởng khi đạt các mốc số người mời.`,
      },
      {
        heading: "5. Chơi mini game",
        body: `Có 3 mini game: **Vòng quay**, **Cào thẻ** và **Xúc xắc**.

Mỗi lượt chơi tốn **1 vé**. Hết vé thì làm thêm nhiệm vụ để có lượt chơi tiếp.

Phần thưởng mỗi lượt:
- 🎡 Vòng quay: từ 0 đến **500** xu
- 🎰 Cào thẻ: từ 0 đến **300** xu
- 🎲 Xúc xắc: từ **10** đến **60** xu

Kết quả ngẫu nhiên, có thể trúng 0 xu. Xem thêm ở mục [Minigame](/guide/minigame).`,
      },
      {
        heading: "Sự kiện và thông báo",
        body: `Theo dõi **Thông báo** để không bỏ lỡ các sự kiện hoặc chương trình tặng thưởng của NXX315.`,
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
  };

  // ================= MINIGAME =================
  C["minigame"] = {
    title: "Minigame: vòng quay, cào thẻ, xúc xắc",
    description:
      "Giới thiệu các trò chơi nhỏ, phần thưởng và những lưu ý để chơi an toàn.",
    sections: [
      {
        heading: "Có những trò nào?",
        body: `- **Vòng quay**: quay để nhận phần thưởng ngẫu nhiên.
- **Cào thẻ**: cào để lộ phần thưởng.
- **Xúc xắc**: gieo xúc xắc để nhận thưởng.

Tất cả nằm ở trang [Minigame](/minigames).`,
      },
      {
        heading: "Vé chơi và phần thưởng",
        body: `Mỗi lượt chơi tốn **1 vé**. Vé có được khi bạn làm nhiệm vụ. Hết vé thì làm thêm nhiệm vụ để có lượt chơi tiếp.

Phần thưởng mỗi lượt:
- Vòng quay: từ 0 đến **500** xu
- Cào thẻ: từ 0 đến **300** xu
- Xúc xắc: từ **10** đến **60** xu

Có thể trúng 0 xu. Xu được cộng vào tài khoản ngay sau khi có kết quả.`,
      },
      {
        heading: "Cách chơi",
        body: `1. Vào trang Minigame và chọn trò bạn muốn.
2. Kiểm tra số vé bạn đang có.
3. Bấm chơi và chờ kết quả.`,
      },
      {
        heading: "Lưu ý quan trọng",
        body: `- Kết quả do hệ thống quyết định ngẫu nhiên. **Không có mẹo hay tool nào** làm tăng tỉ lệ thắng.
- Ai rao bán tool hack minigame đều là **lừa đảo**. Không đưa tiền hay mật khẩu cho họ.
- Thấy mình chơi quá đà? Hãy nghỉ và quay lại làm nhiệm vụ.`,
      },
    ],
  };

  // ================= MỜI BẠN BÈ =================
  C["moi-ban"] = {
    title: "Mời bạn bè nhận hoa hồng",
    description:
      "Chia sẻ mã giới thiệu để nhận 15% hoa hồng và thưởng mốc khi bạn bè hoạt động.",
    sections: [
      {
        heading: "Cách hoạt động",
        body: `1. Vào **Mời bạn bè** → lấy mã và liên kết giới thiệu của bạn
2. Chia sẻ cho bạn bè (Facebook, Zalo, TikTok...)
3. Bạn bè đăng ký tài khoản và nhập mã của bạn
4. Khi họ làm nhiệm vụ, bạn nhận hoa hồng tự động`,
      },
      {
        heading: "Ai nhận được gì?",
        body: `- **Người được mời**: nhận **+200 xu** khi nhập mã thành công.
- **Bạn (người mời)**: nhận **15% hoa hồng** từ số xu mà người được mời kiếm được từ nhiệm vụ, cộng thẳng vào ví.
- Mỗi tài khoản chỉ nhập **một** mã giới thiệu và không thể nhập mã của chính mình.`,
      },
      {
        heading: "Thưởng mốc số người mời",
        body: `Khi số người bạn mời đạt các mốc sau, bạn được nhận thưởng một lần cho mỗi mốc:

- **3 người**: 500 xu
- **5 người**: 1.000 xu
- **10 người**: 3.000 xu
- **20 người**: 10.000 xu

Nhận thưởng tại trang [Mời bạn](/invite).`,
      },
      {
        heading: "Cách tính hoa hồng (ví dụ minh họa)",
        body: `Ví dụ giả định: nếu một người bạn nhận 1.000 xu từ nhiệm vụ trong một ngày, bạn nhận 15% = **150 xu**.

Đây chỉ là ví dụ về cách tính, **không phải cam kết thu nhập**. Mỗi nhiệm vụ có giới hạn lượt mỗi ngày nên số xu thực tế phụ thuộc vào mức độ hoạt động của bạn bè.`,
      },
      {
        heading: "Quy tắc để không bị từ chối thưởng",
        body: `- Không tự tạo nhiều tài khoản rồi tự mời chính mình. Hệ thống đối chiếu thiết bị và địa chỉ mạng để phát hiện.
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
  };

  // ================= ĐỔI THƯỞNG =================
  C["doi-thuong"] = {
    title: "Đổi thưởng",
    description:
      "Dùng Coin hoặc chuyển khoản để đổi Robux và quà game tại Cửa hàng.",
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
        heading: "Giá quy đổi",
        body: `**1 Coin = 1đ.** Cùng một gói, bạn có thể trả bằng Coin hoặc chuyển khoản với số tiền tương ứng.

Ví dụ một số gói (giá có thể thay đổi, hãy xem giá hiện tại trong Cửa hàng):
- Roblox: 40 Robux = 14.500 Coin, 80 Robux = 28.500 Coin
- Free Fire: 25 Kim cương = 5.000 Coin, 113 Kim cương = 20.000 Coin`,
      },
      {
        heading: "Các bước đổi thưởng",
        body: `1. Vào **Cửa hàng** → chọn game
2. Chọn gói muốn đổi
3. Nhập **thông tin nhận** (tên đăng nhập hoặc ID game). Với Roblox, hệ thống hiện avatar để bạn kiểm tra đúng tài khoản
4. Chọn cách nhận hàng (Discord hoặc Zalo) nếu có
5. Chọn cách thanh toán: **bằng Coin** (trừ ngay khỏi số dư) hoặc **chuyển khoản**
6. Kiểm tra kỹ lần cuối rồi xác nhận
7. Theo dõi đơn tại trang [Lịch sử](/history)`,
      },
      {
        heading: "Đơn hàng có những trạng thái nào?",
        body: `- **Đang chờ**: đơn đã tạo, chưa thanh toán
- **Đã thanh toán**: đã trừ Coin hoặc đã xác nhận chuyển khoản, chờ xử lý
- **Đang xử lý**: quản trị viên đang thực hiện đơn
- **Đã giao**: hoàn tất
- **Bị từ chối / Đã hủy**: đơn không được thực hiện`,
      },
      {
        heading: "Nhập thông tin cho đúng",
        body: `- Kiểm tra **chính xác từng ký tự** của tên đăng nhập hoặc ID trước khi xác nhận.
- Với Play Together: bạn gửi ID người chơi, quản trị viên sẽ nạp thủ công qua cổng nạp chính thức của nhà phát hành.
- Giữ liên lạc ở kênh nhận hàng bạn đã chọn (Discord hoặc Zalo) để nhận thông báo.
- Nhập sai thông tin có thể làm đơn thất bại hoặc chậm. Xem quy định tại [Chính sách đổi thưởng](/redemption-policy).`,
      },
      {
        heading: "Hủy đơn và hoàn xu",
        body: `- Đơn còn ở trạng thái **Đang chờ** bạn có thể hủy.
- Đơn thất bại có thể được hoàn xu, xem tại [Lịch sử hoàn tiền](/refund-history).
- Chờ quá lâu mà chưa nhận được? [Liên hệ hỗ trợ](/support) kèm mã đơn.`,
      },
    ],
  };

  // ================= RÚT TIỀN =================
  C["rut-tien"] = {
    title: "Ví và rút tiền",
    description:
      "Xem số dư trong ví, mức rút, phí và cách gửi yêu cầu rút tiền.",
    sections: [
      {
        heading: "Quy đổi Coin",
        body: `**1 Coin = 1đ.**

Ví dụ: 14.500 Coin tương ứng 14.500đ, cùng mức bạn thấy khi chọn chuyển khoản trong Cửa hàng.`,
      },
      {
        heading: "Ví của bạn",
        body: `Trang [Ví](/wallet) cho biết số dư hiện tại và các biến động gần đây. Mọi lần cộng hoặc trừ xu đều được ghi lại để bạn đối chiếu.`,
      },
      {
        heading: "Mức rút và phí",
        body: `- Số tiền rút tối thiểu: **10.000đ**
- Phí rút: **1.000 Coin** mỗi lần, trừ cùng lúc với số tiền rút
- Ví dụ: rút 10.000đ thì bị trừ tổng **11.000 Coin**
- Tối đa **5 lần** và **500.000đ** mỗi ngày
- Số dư phải đủ cho cả số tiền rút và phí
- Phương thức nhận: **ngân hàng**, **MoMo** hoặc **ZaloPay**`,
      },
      {
        heading: "Cách rút tiền",
        body: `1. Vào trang [Rút tiền](/withdraw)
2. Chọn phương thức nhận (ngân hàng, MoMo hoặc ZaloPay)
3. Với ngân hàng, chọn ngân hàng của bạn
4. Nhập **số tài khoản**, **tên chủ tài khoản** và **số điện thoại liên hệ**
5. Nhập số tiền muốn rút
6. Kiểm tra lại thật kỹ rồi gửi yêu cầu

Thông tin nhận tiền được mã hóa khi lưu. Theo dõi yêu cầu tại [Lịch sử rút](/withdraw/history).`,
      },
      {
        heading: "Hủy yêu cầu và trường hợp bị từ chối",
        body: `- Yêu cầu đang **chờ duyệt** có thể hủy, bạn được hoàn **đủ số Coin đã trừ, gồm cả phí**.
- Nếu quản trị viên **từ chối** yêu cầu, bạn được hoàn **số tiền rút**, còn **phí 1.000 Coin được giữ lại**. Lý do từ chối hiển thị trong lịch sử rút.
- Yêu cầu được xử lý thủ công nên thời gian duyệt phụ thuộc vào số lượng yêu cầu.`,
      },
      {
        heading: "Lưu ý khi rút",
        body: `- Kiểm tra kỹ thông tin nhận trước khi gửi.
- Tên chủ tài khoản nên trùng với tên đăng ký tài khoản nhận tiền.
- Tài khoản đang bị hạn chế hoặc nghi ngờ gian lận có thể bị tạm dừng rút.
- NXX315 **không bao giờ** nhờ bạn chuyển tiền trước để nhận tiền rút.`,
      },
    ],
  };

  // ================= FAQ (sửa đoạn thời gian nhận thưởng) =================
  patch("faq", "Bao lâu thì nhận được thưởng?", {
    heading: "Bao lâu thì nhận được thưởng?",
    body: `Đơn đổi thưởng và yêu cầu rút tiền được xử lý thủ công nên thời gian phụ thuộc vào số lượng đơn.

- Theo dõi đơn đổi thưởng tại [Lịch sử](/history)
- Theo dõi yêu cầu rút tiền tại [Lịch sử rút](/withdraw/history)

Chờ quá lâu mà chưa thấy cập nhật → liên hệ hỗ trợ kèm mã đơn.`,
  });
    }
