export const EXTRA_2 = [
  {
    id: "minigame",
    label: "Minigame",
    color: "#ec4899",
    content: {
      title: "Minigame: vòng quay, cào thẻ, xúc xắc",
      description:
        "Giới thiệu các trò chơi nhỏ và những lưu ý để chơi an toàn.",
      sections: [
        {
          heading: "Có những trò nào?",
          body: [
            "- **Vòng quay**: quay để nhận phần thưởng ngẫu nhiên.",
            "- **Cào thẻ**: cào để lộ phần thưởng.",
            "- **Xúc xắc**: gieo xúc xắc theo luật hiển thị trong trò.",
            "",
            "Tất cả nằm ở trang [Minigame](/minigames).",
          ].join("\n"),
        },
        {
          heading: "Cách chơi",
          body: [
            "1. Vào trang Minigame và chọn trò bạn muốn.",
            "2. Xem phần luật và số lượt hoặc số vé bạn đang có ngay trong trò.",
            "3. Bấm chơi và chờ kết quả.",
            "4. Phần thưởng được cộng vào tài khoản ngay sau khi có kết quả.",
          ].join("\n"),
        },
        {
          heading: "Lưu ý quan trọng",
          body: [
            "- Kết quả do hệ thống quyết định ngẫu nhiên. **Không có mẹo hay tool nào** làm tăng tỉ lệ thắng.",
            "- Ai rao bán tool hack minigame đều là **lừa đảo**. Không đưa tiền hay mật khẩu cho họ.",
            "- Chỉ chơi bằng phần xu dư, đừng dùng xu bạn đang dành để đổi quà.",
            "- Đang có dấu hiệu chơi quá đà? Hãy nghỉ và quay lại làm nhiệm vụ.",
          ].join("\n"),
        },
      ],
    },
  },

  {
    id: "doi-thuong",
    label: "Đổi thưởng",
    color: "#8b5cf6",
    content: {
      title: "Đổi thưởng ở Cửa hàng",
      description:
        "Dùng xu để đổi Robux và quà game, kèm các bước nhập thông tin cho đúng.",
      sections: [
        {
          heading: "Có thể đổi gì?",
          body: [
            "Cửa hàng tại [trang Cửa hàng](/store) hiện hỗ trợ:",
            "",
            "- **Roblox**: Robux (có tab VNG và Quốc tế).",
            "- **Liên Quân Mobile**: Quân Huy.",
            "- **Free Fire**, **PUBG Mobile**, **FC Mobile**, **Valorant**.",
            "- **Play Together**.",
            "",
            "Danh mục có thể thay đổi, hãy xem trực tiếp trong cửa hàng.",
          ].join("\n"),
        },
        {
          heading: "Các bước đổi thưởng",
          body: [
            "1. Vào Cửa hàng, chọn game muốn đổi.",
            "2. Chọn gói có số xu phù hợp với số dư của bạn.",
            "3. Nhập thông tin nhận (tên Roblox, ID game...). Với Roblox, hệ thống hiện avatar để bạn kiểm tra đúng tài khoản.",
            "4. Chọn cách nhận hàng (Discord hoặc Zalo) nếu có.",
            "5. Kiểm tra kỹ lần cuối rồi xác nhận đổi.",
            "6. Theo dõi đơn tại trang [Lịch sử](/history).",
          ].join("\n"),
        },
        {
          heading: "Nhập thông tin cho đúng",
          body: [
            "- Kiểm tra **chính xác từng ký tự** của tên đăng nhập hoặc ID trước khi xác nhận.",
            "- Với Play Together: bạn gửi ID người chơi, quản trị viên sẽ nạp Kim cương thủ công qua cổng nạp chính thức của nhà phát hành.",
            "- Giữ liên lạc ở kênh nhận hàng bạn đã chọn để nhận mã hoặc thông báo.",
            "- Nhập sai thông tin có thể làm đơn thất bại hoặc chậm. Xem quy định tại [Chính sách đổi thưởng](/redemption-policy).",
          ].join("\n"),
        },
        {
          heading: "Theo dõi đơn và hoàn xu",
          body: [
            "- Mọi đơn đều nằm trong [Lịch sử](/history). Bấm vào đơn để xem chi tiết.",
            "- Đơn thất bại có thể được hoàn xu, xem tại [Lịch sử hoàn tiền](/refund-history).",
            "- Thời gian xử lý khác nhau theo từng loại. Nếu quá lâu, hãy [liên hệ hỗ trợ](/support) kèm mã đơn.",
          ].join("\n"),
        },
      ],
    },
  },

  {
    id: "vi-rut-tien",
    label: "Ví & rút tiền",
    color: "#06b6d4",
    content: {
      title: "Ví và rút tiền",
      description: "Xem số dư trong ví và cách gửi yêu cầu rút.",
      sections: [
        {
          heading: "Ví của bạn",
          body: [
            "Trang [Ví](/wallet) cho biết số dư hiện tại và các biến động gần đây. Mọi lần cộng hoặc trừ xu đều được ghi lại để bạn đối chiếu.",
          ].join("\n"),
        },
        {
          heading: "Cách rút",
          body: [
            "1. Vào trang [Rút tiền](/withdraw).",
            "2. Xem mức rút tối thiểu và phí (nếu có) hiển thị ngay trên trang.",
            "3. Xác minh số điện thoại nếu hệ thống yêu cầu.",
            "4. Nhập thông tin nhận tiền và số lượng cần rút.",
            "5. Kiểm tra lại rồi gửi yêu cầu.",
            "6. Theo dõi tiến độ tại [Lịch sử rút](/withdraw/history).",
          ].join("\n"),
        },
        {
          heading: "Lưu ý khi rút",
          body: [
            "- Kiểm tra kỹ thông tin nhận trước khi gửi, yêu cầu đã gửi khó chỉnh sửa.",
            "- Yêu cầu có thể cần thời gian để kiểm tra, không phải lúc nào cũng tức thì.",
            "- Tài khoản đang bị hạn chế hoặc nghi ngờ gian lận có thể bị tạm dừng rút.",
            "- NXX315 **không bao giờ** nhờ bạn chuyển tiền trước để nhận tiền rút.",
          ].join("\n"),
        },
      ],
    },
  },
];
