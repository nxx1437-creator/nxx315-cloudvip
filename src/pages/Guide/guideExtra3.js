export const EXTRA_3 = [
  {
    id: "xep-hang-cong-dong",
    label: "Xếp hạng & cộng đồng",
    color: "#f97316",
    content: {
      title: "Bảng xếp hạng và cộng đồng",
      description:
        "Xem thứ hạng, đăng bài và tương tác trong cộng đồng NXX315.",
      sections: [
        {
          heading: "Bảng xếp hạng",
          body: [
            "[Bảng xếp hạng](/leaderboard) cho thấy những thành viên hoạt động nổi bật. Hãy làm nhiệm vụ đều đặn để leo hạng.",
          ].join("\n"),
        },
        {
          heading: "Cộng đồng (Feed)",
          body: [
            "Tại [trang Cộng đồng](/feed), bạn có thể:",
            "",
            "- Xem bài đăng của các thành viên.",
            "- **Thích**, **bình luận** và **chia sẻ hoặc lưu** bài viết.",
            "- Đăng bài gồm chữ, hình ảnh và liên kết (nếu bạn đủ điều kiện).",
          ].join("\n"),
        },
        {
          heading: "Điều kiện đăng bài",
          body: [
            "- Chỉ thành viên **đủ điều kiện** mới đăng được, dựa trên cấp độ và số xu của tài khoản, hoặc được quản trị viên cấp quyền.",
            "- Chưa đăng được thì bạn vẫn xem và tương tác bình thường.",
          ].join("\n"),
        },
        {
          heading: "Quy tắc cộng đồng",
          body: [
            "- Không spam, không đăng lặp nội dung.",
            "- Không đăng liên kết lừa đảo, độc hại hoặc quảng cáo trái phép.",
            "- Không xúc phạm, quấy rối thành viên khác.",
            "- Không đăng nội dung không phù hợp với lứa tuổi nhỏ.",
            "- Bài vi phạm sẽ bị gỡ, người đăng có thể mất quyền đăng bài hoặc bị khóa tài khoản.",
          ].join("\n"),
        },
      ],
    },
  },

  {
    id: "bao-mat",
    label: "Bảo mật & chống gian lận",
    color: "#ef4444",
    content: {
      title: "Bảo mật tài khoản và chống gian lận",
      description:
        "Cách giữ tài khoản an toàn và những hành vi bị hệ thống chặn.",
      sections: [
        {
          heading: "Giữ tài khoản an toàn",
          body: [
            "- Dùng mật khẩu mạnh, không trùng với mật khẩu ở nơi khác.",
            "- Xác minh email khi đăng ký.",
            "- Lưu **mã khôi phục** ở nơi an toàn, không chụp màn hình gửi người khác.",
            "- Không đưa mật khẩu hoặc mã OTP cho bất kỳ ai. NXX315 **không bao giờ** hỏi mật khẩu của bạn.",
            "- Quên mật khẩu? Dùng trang [Quên mật khẩu](/forgot-password).",
          ].join("\n"),
        },
        {
          heading: "Quy định một người một tài khoản",
          body: [
            "Để công bằng cho mọi người, hệ thống kiểm tra thiết bị và địa chỉ mạng của tài khoản.",
            "",
            "- Nhiều tài khoản dùng chung một thiết bị hoặc cùng địa chỉ mạng có thể bị đánh dấu là **đa tài khoản**.",
            "- Dùng VPN hoặc proxy để qua mặt hệ thống sẽ bị chặn.",
            "- Dùng công cụ tự động, tool hack hoặc lỗi hệ thống để lấy xu là vi phạm.",
          ].join("\n"),
        },
        {
          heading: "Hậu quả khi vi phạm",
          body: [
            "1. Điểm rủi ro của tài khoản tăng lên.",
            "2. Tài khoản bị hạn chế: không làm nhiệm vụ, đổi thưởng hoặc rút xu.",
            "3. Vi phạm nặng hoặc lặp lại: khóa tài khoản và thu hồi xu không hợp lệ.",
            "",
            "Xem chi tiết tại [Chống gian lận](/fraud) và [Điều khoản](/terms).",
          ].join("\n"),
        },
        {
          heading: "Nếu tài khoản bị hạn chế nhầm",
          body: [
            "Bạn có thể liên hệ để được xem xét lại. Hãy chuẩn bị tên tài khoản, email đăng ký và mô tả ngắn gọn tình huống, rồi gửi qua [Hỗ trợ](/support) hoặc trang [Liên hệ](/contact).",
          ].join("\n"),
        },
        {
          heading: "Dành cho người dùng nhỏ tuổi",
          body: [
            "Bạn nhỏ tuổi nên được phụ huynh biết và đồng ý trước khi dùng. Không chia sẻ thông tin cá nhân như địa chỉ, số điện thoại, trường học cho người lạ. Xem thêm [Chính sách quyền riêng tư](/privacy).",
          ].join("\n"),
        },
      ],
    },
  },

  {
    id: "faq",
    label: "Câu hỏi thường gặp",
    color: "#14b8a6",
    content: {
      title: "Câu hỏi thường gặp",
      description: "Giải đáp nhanh những thắc mắc phổ biến nhất.",
      sections: [
        {
          heading: "Tài khoản",
          body: [
            "**Tôi quên mật khẩu thì làm sao?**",
            "Vào trang [Quên mật khẩu](/forgot-password) và làm theo hướng dẫn gửi qua email.",
            "",
            "**Tôi có thể có nhiều tài khoản không?**",
            "Không. Mỗi người chỉ được dùng một tài khoản. Tạo nhiều tài khoản có thể khiến tất cả bị khóa.",
            "",
            "**Tài khoản của tôi bị khóa, phải làm gì?**",
            "Xem lý do hiển thị trên màn hình khóa, sau đó liên hệ [Hỗ trợ](/support) để được xem xét.",
          ].join("\n"),
        },
        {
          heading: "Nhiệm vụ và xu",
          body: [
            "**Làm xong nhiệm vụ nhưng không nhận được xu?**",
            "Xem danh sách nguyên nhân tại mục [Làm nhiệm vụ](/guide/lam-nhiem-vu). Nếu vẫn không được, hãy gửi cho hỗ trợ tên nhiệm vụ và thời gian làm.",
            "",
            "**Vì sao nhiệm vụ báo hết lượt?**",
            "Mỗi nhiệm vụ có giới hạn số lượt mỗi ngày. Sang ngày mới lượt được làm mới.",
            "",
            "**Xu có hết hạn không?**",
            "Hãy xem thông báo và điều khoản hiện hành. Cách tốt nhất là dùng xu đều đặn để đổi quà.",
          ].join("\n"),
        },
        {
          heading: "Đổi thưởng",
          body: [
            "**Đổi quà mất bao lâu?**",
            "Tùy loại quà, có loại xử lý nhanh, có loại cần quản trị viên xử lý thủ công. Theo dõi tại [Lịch sử](/history).",
            "",
            "**Tôi nhập sai tên hoặc ID khi đổi thì sao?**",
            "Liên hệ hỗ trợ càng sớm càng tốt kèm mã đơn. Xem thêm [Chính sách đổi thưởng](/redemption-policy).",
            "",
            "**Đơn thất bại có được hoàn xu không?**",
            "Có thể. Xem tại [Lịch sử hoàn tiền](/refund-history).",
          ].join("\n"),
        },
        {
          heading: "Liên hệ hỗ trợ",
          body: [
            "- Chat AI hỗ trợ: [Mở trang Hỗ trợ](/support).",
            "- Trung tâm trợ giúp: [Trợ giúp](/help).",
            "- Zalo: [0865245988](https://zalo.me/0865245988).",
            "- Biểu mẫu: [Liên hệ](/contact).",
          ].join("\n"),
        },
      ],
    },
  },
];
