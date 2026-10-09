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
    id: "doi-thuong",
    label: "Đổi thưởng",
    icon: `${ICON_BASE}/icon-coin.png`,
    color: "#ec4899",
  },
  {
    id: "rut-tien",
    label: "Rút tiền",
    icon: `${ICON_BASE}/icon-money.png`, // ← ĐỔI MỚI
    color: "#10b981",
  },
  {
    id: "moi-ban",
    label: "Mời bạn bè",
    icon: `${ICON_BASE}/icon-brain.png`,
    color: "#8b5cf6",
  },
  {
    id: "bao-mat",
    label: "Bảo mật",
    icon: `${ICON_BASE}/icon-shield.png`, // ← ĐỔI MỚI
    color: "#6366f1",
  },
  {
    id: "faq",
    label: "FAQ",
    icon: `${ICON_BASE}/icon-chat.png`,
    color: "#f97316",
  },
  {
    id: "lien-he",
    label: "Liên hệ",
    icon: `${ICON_BASE}/icon-phone.png`, // ← ĐỔI MỚI
    color: "#06b6d4",
  },
];

export const GUIDE_CONTENT = {
  "bat-dau": {
    title: "Bắt đầu sử dụng NXX315",
    description:
      "Chào mừng bạn đến với NXX315 Studio — nền tảng kiếm Coin đổi thưởng miễn phí hàng đầu Việt Nam. Hướng dẫn này sẽ giúp bạn bắt đầu trong 3 phút.",
    sections: [
      {
        heading: "NXX315 là gì?",
        body: `NXX315 là nền tảng kiếm thưởng trực tuyến, nơi bạn có thể:
- Hoàn thành nhiệm vụ đơn giản để nhận Coin
- Đổi Coin lấy Robux, thẻ điện thoại, gift card
- Rút tiền mặt về tài khoản ngân hàng

Toàn bộ miễn phí. Không cần nạp bất kỳ khoản nào.`,
      },
      {
        heading: "3 bước để bắt đầu",
        body: `1. **Đăng ký tài khoản** — Chỉ cần email, 30 giây
2. **Xác minh email** — Click link trong mail xác nhận
3. **Làm nhiệm vụ đầu tiên** — Vào mục Nhiệm vụ, chọn task dễ nhất

Sau khi hoàn thành task đầu, bạn sẽ nhận Coin ngay vào ví.`,
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
4. Bấm **Đăng ký** → check email xác nhận

⚠️ Mỗi thiết bị chỉ được tạo 1 tài khoản.`,
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
        heading: "Cập nhật thông tin",
        body: `Bạn có thể đổi:
- **Username** — tối đa 1 lần mỗi 7 ngày
- **Avatar** — tối đa 3 lần mỗi ngày
- **Giao diện** — sáng/tối
- **Màu chủ đạo** — xanh dương, tím, xanh lá

Vào **Cá nhân** để chỉnh.`,
      },
    ],
  },

  "kiem-coin": {
    title: "Cách kiếm Coin",
    description:
      "Có 4 cách chính để kiếm Coin trên NXX315. Tất cả đều miễn phí và không giới hạn thu nhập.",
    sections: [
      {
        heading: "1. Làm nhiệm vụ",
        body: `Vào mục **Nhiệm vụ** → chọn task → làm theo hướng dẫn.

Các loại nhiệm vụ phổ biến:
- Xem quảng cáo (30 giây)
- Đăng ký app
- Chơi game mobile
- Khảo sát ngắn

**Trung bình:** 200-500 Coin/nhiệm vụ
**Giới hạn:** 10-15 nhiệm vụ/ngày`,
      },
      {
        heading: "2. Mời bạn bè",
        body: `Vào **Mời bạn bè** → copy link giới thiệu → share cho bạn.

Khi bạn bè đăng ký và làm task:
- Bạn nhận **15% hoa hồng** từ Coin họ kiếm được
- Bạn bè nhận **+200 Coin** khi đăng ký

Thu nhập thụ động — càng nhiều bạn bè càng nhiều Coin.`,
      },
      {
        heading: "3. Chơi mini game",
        body: `Có 3 mini game:
- 🎡 **Vòng quay may mắn** — 100-1000 Coin
- 🎰 **Cào thẻ** — 50-500 Coin
- 🎲 **Đổ xúc xắc** — 100-2000 Coin

Mỗi game có lượt chơi miễn phí mỗi ngày.`,
      },
      {
        heading: "4. Sự kiện & Khuyến mãi",
        body: `Theo dõi **Thông báo** để không bỏ lỡ:
- Sự kiện x2, x3 Coin cuối tuần
- Quà tặng sinh nhật
- Streak bonus (điểm danh hàng ngày)

Đăng nhập hàng ngày để duy trì streak → nhận thưởng cao hơn.`,
      },
    ],
  },

  "doi-thuong": {
    title: "Đổi thưởng",
    description:
      "Hướng dẫn đổi Coin lấy Robux, thẻ điện thoại, gift card và nhiều phần quà hấp dẫn khác.",
    sections: [
      {
        heading: "Đổi Robux",
        body: `1. Vào **Cửa hàng** → chọn **Roblox**
2. Chọn gói Robux muốn đổi
3. Nhập **username Roblox** hoặc **User ID**
4. Bấm **Xác nhận đơn**
5. Admin duyệt trong **5-30 phút**

**Lưu ý:** Nhập đúng username, sai sẽ không hoàn xu.

Tỷ lệ: **1000 Coin ≈ 10,000 Robux** (tùy gói)`,
      },
      {
        heading: "Đổi thẻ điện thoại",
        body: `Hỗ trợ các nhà mạng:
- **Viettel** — 10k, 20k, 50k, 100k
- **Mobifone** — 10k, 20k, 50k
- **Vinaphone** — 10k, 20k, 50k
- **Vietnamobile** — 20k, 50k

Thời gian xử lý: **5-15 phút**
Nhận mã thẻ qua notification hoặc email.`,
      },
      {
        heading: "Đổi gift card",
        body: `Gift card có sẵn:
- 🎮 **Steam Wallet** — 50k, 100k, 200k
- 📱 **Google Play** — 50k, 100k
- 🍎 **Apple Store** — 100k, 200k
- 🎁 **Zing Card** — 20k, 50k, 100k

Thời gian xử lý: **10-30 phút**`,
      },
      {
        heading: "Thời gian và chính sách",
        body: `**Thời gian duyệt:** 5-30 phút (giờ hành chính)
**Hoàn tiền:** 100% nếu lỗi hệ thống
**Không hoàn:** nếu bạn nhập sai username/ID

Ngưỡng đổi tối thiểu: **1,000 Coin**`,
      },
    ],
  },

  "rut-tien": {
    title: "Rút tiền",
    description:
      "Hướng dẫn rút tiền mặt về tài khoản ngân hàng. Hỗ trợ tất cả ngân hàng tại Việt Nam.",
    sections: [
      {
        heading: "Điều kiện rút tiền",
        body: `- **Số dư tối thiểu:** 50,000 Coin
- **Tài khoản đã xác minh** email
- **Không bị flag** gian lận
- **Đã hoàn thành ít nhất 10 nhiệm vụ**

Tỷ lệ: **1,000 Coin = 10,000 VNĐ**`,
      },
      {
        heading: "Cách rút tiền",
        body: `1. Vào **Ví** → bấm **Rút tiền**
2. Nhập **số tiền** muốn rút
3. Chọn **ngân hàng** (Vietcombank, Techcombank, MB...)
4. Nhập **số tài khoản** + **tên chủ tài khoản**
5. Bấm **Xác nhận**

Yêu cầu sẽ được admin duyệt trong **24 giờ**.`,
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
    ],
  },

  "moi-ban": {
    title: "Mời bạn bè — Kiếm thụ động",
    description:
      "Chương trình giới thiệu bạn bè — kiếm 15% hoa hồng từ thu nhập của bạn bè.",
    sections: [
      {
        heading: "Cách hoạt động",
        body: `1. Vào **Mời bạn bè** → lấy link giới thiệu của bạn
2. Share link cho bạn bè (Facebook, Zalo, TikTok...)
3. Bạn bè bấm link → đăng ký tài khoản
4. **Bạn nhận +200 Coin** cho mỗi người đăng ký thành công

Sau đó, khi bạn bè làm task, bạn nhận **15% hoa hồng** mỗi task.`,
      },
      {
        heading: "Thu nhập ví dụ",
        body: `Nếu bạn mời **10 người bạn**:
- Đăng ký: 10 × 200 = **2,000 Coin**
- Mỗi người làm 5 task/ngày (~300 Coin/task):
  - 10 người × 5 task × 300 Coin × 15%
  - = **22,500 Coin/ngày** từ hoa hồng

→ Tương đương **225,000 VNĐ/ngày** — thu nhập thụ động!`,
      },
      {
        heading: "Điều kiện nhận hoa hồng",
        body: `- Bạn bè phải **đăng ký mới** (chưa từng có tài khoản)
- Bạn bè phải **xác minh email**
- Bạn bè phải **hoàn thành ít nhất 1 task**
- Không vi phạm chính sách (spam, fake account)

Hoa hồng sẽ tự động cộng vào ví bạn.`,
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

**Lưu vào nơi an toàn** (Note, sổ tay, password manager).

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

🚨 **Nếu có người tự xưng admin** yêu cầu những điều trên → **lừa đảo**, block ngay.`,
      },
      {
        heading: "Khi bị hack",
        body: `Nếu nghi ngờ tài khoản bị xâm nhập:
1. **Đổi mật khẩu ngay** ở trang khác
2. Vào **Cá nhân** → **Bảo mật** → **Đăng xuất mọi thiết bị**
3. Liên hệ Zalo **0865245988** để được hỗ trợ
4. Chúng tôi sẽ hỗ trợ khôi phục trong 24h`,
      },
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    description: "Tổng hợp các câu hỏi phổ biến của người dùng NXX315.",
    sections: [
      {
        heading: "NXX315 là gì? Có uy tín không?",
        body: `NXX315 là nền tảng kiếm thưởng trực tuyến hoạt động từ **2024**.

Chúng tôi đã:
- ✅ Hơn **10,000 người dùng** tin tưởng
- ✅ Hơn **500 triệu VNĐ** đã chi trả
- ✅ Hỗ trợ 24/7
- ✅ Hoàn tiền 100% nếu lỗi`,
      },
      {
        heading: "Có cần nạp tiền không?",
        body: `**Hoàn toàn miễn phí.** Bạn chỉ cần làm nhiệm vụ để kiếm Coin.

NXX315 **KHÔNG BAO GIỜ** yêu cầu nạp bất kỳ khoản nào.`,
      },
      {
        heading: "Bao lâu thì nhận được thưởng?",
        body: `- **Đổi Robux/thẻ:** 5-30 phút
- **Rút tiền mặt:** 2-24 giờ
- **Sự kiện:** tùy chương trình

Nếu quá 1 giờ chưa nhận được → liên hệ Zalo hỗ trợ.`,
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
- Fingerprint thiết bị
- Hành vi

Tài khoản vi phạm sẽ bị **khoá vĩnh viễn**.`,
      },
      {
        heading: "Mời bạn bè có giới hạn không?",
        body: `**Không giới hạn.** Bạn có thể mời bao nhiêu bạn bè tùy thích.

Nhưng **KHÔNG** được:
- Tạo tài khoản fake để tự mời
- Spam link khắp nơi
- Dùng tool auto

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
