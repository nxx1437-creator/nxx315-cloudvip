export const EXTRA_1 = [
  {
    id: "lam-nhiem-vu",
    label: "Làm nhiệm vụ",
    color: "#3b82f6",
    content: {
      title: "Làm nhiệm vụ nhận xu",
      description:
        "Từng bước làm nhiệm vụ và nhận xu đúng cách, kèm cách xử lý khi chưa được cộng xu.",
      sections: [
        {
          heading: "Nhiệm vụ là gì?",
          body: [
            "Mỗi nhiệm vụ là một liên kết do đối tác cung cấp. Bạn mở liên kết, hoàn thành các bước trên trang của đối tác, rồi quay lại NXX315 để nhận xu.",
            "",
            "- Số xu của từng nhiệm vụ hiển thị ngay trên thẻ.",
            "- Mỗi nhiệm vụ có giới hạn số lượt mỗi ngày, sang ngày mới lượt được làm mới.",
            "- Nhiệm vụ nào hết lượt sẽ bị làm mờ, hãy chọn nhiệm vụ khác.",
            "",
            "Vào [trang Nhiệm vụ](/tasks) để bắt đầu.",
          ].join("\n"),
        },
        {
          heading: "Các bước thực hiện",
          body: [
            "1. Vào trang Nhiệm vụ, chọn thẻ còn lượt và bấm **Làm nhiệm vụ**.",
            "2. Đọc cảnh báo an toàn khi rời trang rồi bấm **Tiếp tục** (cảnh báo chỉ hiện vài lần đầu).",
            "3. Giải captcha để xác nhận bạn là người thật.",
            "4. Một tab mới mở ra là trang của đối tác. Làm theo hướng dẫn trên trang đó (chờ đếm giờ, bấm tiếp tục...).",
            "5. Khi xong, đối tác sẽ tự chuyển bạn quay về NXX315.",
            "6. Giải captcha lần nữa trong **30 giây** để xác nhận nhận xu.",
            "7. Thấy thông báo thành công là xu đã được cộng vào tài khoản.",
          ].join("\n"),
        },
        {
          heading: "Những điều bắt buộc",
          body: [
            "- Phải đi hết các bước của đối tác, không đóng tab giữa chừng.",
            "- Thời gian làm tối thiểu **45 giây**. Làm quá nhanh nhiệm vụ sẽ bị từ chối.",
            "- Liên kết có hiệu lực **15 phút** kể từ lúc bấm. Quá hạn phải bấm làm lại.",
            "- Phải giải captcha ở trang xác nhận trong **30 giây**, nếu không lượt đó sẽ bị hủy.",
            "- Không dùng VPN, proxy hoặc nhiều tài khoản trên cùng một thiết bị.",
          ].join("\n"),
        },
        {
          heading: "Vì sao làm xong mà chưa nhận xu?",
          body: [
            "Các nguyên nhân thường gặp:",
            "",
            "- Làm quá nhanh (dưới 45 giây) hoặc bỏ qua bước của đối tác.",
            "- Đối tác không chuyển bạn về NXX315 sau khi hoàn tất.",
            "- Quá 30 giây mới giải captcha ở trang xác nhận.",
            "- Đã hết giới hạn lượt trong ngày hoặc đang trong thời gian chờ giữa hai lượt.",
            "- Đang bật VPN/proxy nên bị chặn.",
            "- Trình duyệt chặn cửa sổ mới (pop-up). Hãy cho phép pop-up cho trang NXX315.",
            "- Nhiệm vụ dạng đánh giá: xu được cộng sau khi đối tác duyệt, có thể mất đến **10 ngày**.",
            "",
            "Đã làm đúng mà vẫn không nhận được? [Liên hệ hỗ trợ](/support) và gửi kèm tên tài khoản, tên nhiệm vụ và thời gian bạn làm.",
          ].join("\n"),
        },
        {
          heading: "Mẹo làm nhanh và an toàn",
          body: [
            "- Dùng mạng ổn định (wifi hoặc 4G mạnh) để trang đối tác không bị treo.",
            "- Nếu trang đối tác không tải, thử tắt trình chặn quảng cáo cho trang đó.",
            "- Làm từng nhiệm vụ một, xong hẳn mới bấm nhiệm vụ tiếp theo.",
            "- Ưu tiên nhiệm vụ có xu cao vì lượt mỗi ngày có hạn.",
            "- Chỉ mở liên kết do chính NXX315 tạo ra. Không bấm link nhiệm vụ do người lạ gửi.",
          ].join("\n"),
        },
      ],
    },
  },

  {
    id: "cap-do",
    label: "Cấp độ & ưu đãi",
    color: "#f59e0b",
    content: {
      title: "Cấp độ và ưu đãi",
      description:
        "Cách cấp độ được tính và những ưu đãi bạn nhận được khi lên cấp.",
      sections: [
        {
          heading: "Cấp độ hoạt động thế nào?",
          body: [
            "Cấp độ của bạn tăng theo **tổng số xu đã kiếm được** từ trước đến nay. Việc bạn tiêu xu để đổi quà không làm tụt cấp.",
            "",
            "Xem cấp hiện tại và các mốc tiếp theo tại [trang Cấp độ](/level).",
          ].join("\n"),
        },
        {
          heading: "Ưu đãi khi lên cấp",
          body: [
            "- Cấp càng cao, bạn được **cộng thêm % xu** mỗi khi làm nhiệm vụ.",
            "- Trên trang Nhiệm vụ có dải thông báo cho biết bạn đang được cộng thêm bao nhiêu %.",
            "- Số xu ghi trên mỗi thẻ nhiệm vụ đã tính sẵn phần thưởng thêm này.",
          ].join("\n"),
        },
        {
          heading: "Cách lên cấp nhanh hơn",
          body: [
            "1. Làm đủ lượt nhiệm vụ mỗi ngày, đừng bỏ lỡ nhiệm vụ xu cao.",
            "2. Chơi [minigame](/minigames) khi có lượt.",
            "3. Mời bạn bè cùng tham gia, hoa hồng giới thiệu cũng được tính vào xu kiếm được.",
            "4. Duy trì đăng nhập đều đặn mỗi ngày.",
          ].join("\n"),
        },
        {
          heading: "Lưu ý",
          body: [
            "- Mức ưu đãi cụ thể của từng cấp luôn lấy theo thông tin hiển thị trên trang Cấp độ.",
            "- Tài khoản vi phạm quy định có thể bị điều chỉnh hoặc thu hồi ưu đãi.",
          ].join("\n"),
        },
      ],
    },
  },

  {
    id: "moi-ban-be",
    label: "Mời bạn bè",
    color: "#10b981",
    content: {
      title: "Mời bạn bè nhận thưởng",
      description:
        "Chia sẻ mã giới thiệu để nhận hoa hồng xu khi bạn bè hoạt động.",
      sections: [
        {
          heading: "Cách mời",
          body: [
            "1. Vào trang [Mời bạn](/invite) để lấy **mã giới thiệu** và liên kết riêng của bạn.",
            "2. Gửi mã hoặc liên kết cho bạn bè qua Zalo, Messenger hoặc mạng xã hội.",
            "3. Bạn bè đăng ký tài khoản và nhập mã của bạn.",
            "4. Khi họ hoạt động, bạn nhận hoa hồng xu tự động.",
          ].join("\n"),
        },
        {
          heading: "Bạn nhận được gì?",
          body: [
            "- **Hoa hồng xu** khi người bạn mời hoàn thành nhiệm vụ. Xu được hệ thống cộng tự động ở phía máy chủ.",
            "- **Thưởng mốc** khi số người mời đạt các cột mốc. Mốc và phần thưởng hiển thị trên trang Mời bạn.",
          ].join("\n"),
        },
        {
          heading: "Quy tắc để không bị từ chối thưởng",
          body: [
            "- Mỗi người chỉ có **một** người giới thiệu.",
            "- Không tự tạo nhiều tài khoản rồi tự mời chính mình. Hệ thống đối chiếu thiết bị và địa chỉ mạng để phát hiện.",
            "- Không đăng mã giới thiệu ở nơi spam hoặc kèm thông tin sai lệch.",
            "- Tài khoản bị xác định gian lận sẽ bị thu hồi thưởng và có thể bị khóa.",
          ].join("\n"),
        },
        {
          heading: "Mẹo mời hiệu quả",
          body: [
            "- Nói rõ cho bạn bè cách làm nhiệm vụ đúng, tránh họ làm sai rồi bỏ.",
            "- Hướng dẫn bạn bè đọc mục [Làm nhiệm vụ](/guide/lam-nhiem-vu) trước khi bắt đầu.",
            "- Mời người thật sự quan tâm, vì hoa hồng chỉ phát sinh khi họ hoạt động.",
          ].join("\n"),
        },
      ],
    },
  },
];
