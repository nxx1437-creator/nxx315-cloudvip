// src/pages/help/helpFaqs.js — câu hỏi thường gặp (viết lại hoàn toàn, thay toàn bộ câu hỏi cũ).
// Nội dung bám theo trang "Quy định đổi thưởng". Muốn sửa chữ, thêm hoặc xoá câu: chỉnh ngay tại đây.
// category: order | payment | account | bug | other (khớp CATEGORIES trong helpData.js)
export const HELP_FAQS = [
  {
    id: "o1", category: "order",
    question: "Đơn đổi thưởng của tôi mất bao lâu để xử lý?",
    answer:
      "Với Robux, NXX315 cố gắng xử lý trong vòng 24 giờ làm việc kể từ khi yêu cầu được duyệt. Khi hệ thống bảo trì hoặc đơn cần xác minh thêm, thời gian có thể lâu hơn và chúng tôi sẽ báo cho bạn.\nBạn xem trạng thái đơn ở mục “Đơn gần đây” ngay trên trang này hoặc trong Lịch sử.",
  },
  {
    id: "o2", category: "order",
    question: "Điều kiện để đổi thưởng là gì?",
    answer:
      "Tài khoản đang hoạt động bình thường, không bị hạn chế do vi phạm, đủ số xu cần thiết và thông tin nhận thưởng chính xác. Số xu cần cho từng phần thưởng, cùng mức tối thiểu, luôn hiển thị trên trang đổi thưởng trước khi bạn gửi yêu cầu.",
  },
  {
    id: "o3", category: "order",
    question: "Tôi nhập sai tên người dùng hoặc ID game thì sao?",
    answer:
      "Bạn là người kiểm tra thông tin nhận thưởng trước khi gửi. Nếu phần thưởng đã gửi thành công đến thông tin bạn nhập sai, NXX315 có thể không hoàn lại hoặc thay thế được.\nNếu đơn chưa được xử lý, hãy gửi yêu cầu hỗ trợ ngay kèm mã đơn để đội ngũ kiểm tra giúp bạn.",
  },
  {
    id: "o4", category: "order",
    question: "Đơn bị từ chối hoặc thất bại, tôi có được hoàn xu không?",
    answer:
      "Có, nếu nguyên nhân đến từ hệ thống hoặc từ phía NXX315: đơn thất bại, phần thưởng hết hàng hoặc Robux bị thu hồi do lỗi của chúng tôi. Xu sẽ được hoàn vào tài khoản của bạn.\nTrường hợp gian lận hoặc vi phạm đã được xác định, xu có thể không được hoàn. Khi từ chối hay huỷ đơn, chúng tôi luôn báo lý do cho bạn.",
  },
  {
    id: "p1", category: "payment",
    question: "Xu bị trừ khi nào?",
    answer:
      "Xu được trừ khi yêu cầu đổi thưởng của bạn được xác nhận. Bạn nên xem lại số xu cần thiết và thông tin nhận thưởng trước khi bấm xác nhận.",
  },
  {
    id: "p2", category: "payment",
    question: "Xu đã bị trừ nhưng tôi chưa nhận được thưởng, phải làm gì?",
    answer:
      "Trước hết hãy xem trạng thái đơn, vì đơn có thể vẫn đang trong thời gian xử lý. Nếu đã quá 24 giờ làm việc kể từ khi đơn được duyệt mà bạn vẫn chưa nhận được, hãy gửi yêu cầu hỗ trợ kèm mã đơn. Nếu lỗi thuộc về hệ thống, xu sẽ được hoàn lại.",
  },
  {
    id: "p3", category: "payment",
    question: "Tôi có thể mua, bán hoặc chuyển xu cho người khác không?",
    answer:
      "Không. Xu không được mua bán, trao đổi hay chuyển nhượng giữa người dùng. Mọi giao dịch xu ngoài hệ thống sẽ không được NXX315 hỗ trợ, và bạn nên cẩn thận với những lời mời như vậy.",
  },
  {
    id: "a1", category: "account",
    question: "Tôi quên mật khẩu hoặc không đăng nhập được?",
    answer:
      "Ở trang đăng nhập, chọn “Quên mật khẩu” để nhận email đặt lại. Nếu bạn từng đăng ký bằng Google, hãy đăng nhập bằng đúng tài khoản Google đó. Vẫn chưa vào được thì gửi yêu cầu hỗ trợ, ghi rõ email tài khoản của bạn.",
  },
  {
    id: "a2", category: "account",
    question: "Tài khoản của tôi bị hạn chế, tôi cần làm gì?",
    answer:
      "Hãy gửi yêu cầu hỗ trợ và ghi rõ email tài khoản. Đội ngũ NXX315 sẽ kiểm tra lý do và phản hồi cho bạn. Bạn cũng có thể xem thêm Điều khoản sử dụng để biết những hành vi bị hạn chế.",
  },
  {
    id: "a3", category: "account",
    question: "Làm sao nhận ra người mạo danh NXX315?",
    answer:
      "NXX315 chỉ hỗ trợ qua trang Trợ giúp này, Zalo chính thức và email support@nxx315.com. Đừng gửi mật khẩu hay mã xác minh cho bất kỳ ai, kể cả người tự nhận là nhân viên. Gặp trường hợp đáng ngờ, hãy báo cho chúng tôi.",
  },
  {
    id: "b1", category: "bug",
    question: "Trang bị lỗi hoặc nút bấm không phản hồi thì làm gì?",
    answer:
      "Hãy tải lại trang, rồi thử đăng xuất và đăng nhập lại. Nếu vẫn lỗi, cập nhật trình duyệt hoặc ứng dụng lên bản mới nhất. Sau cùng, gửi yêu cầu hỗ trợ kèm ảnh chụp màn hình để chúng tôi xem nhanh hơn.",
  },
  {
    id: "b2", category: "bug",
    question: "Báo lỗi thế nào để được xử lý nhanh?",
    answer:
      "Cho chúng tôi biết bạn đang làm gì thì lỗi xuất hiện, bạn dùng thiết bị và trình duyệt nào, và đính kèm ảnh chụp màn hình. Nếu lỗi liên quan đến một đơn, nhớ ghi mã đơn.",
  },
  {
    id: "x1", category: "other",
    question: "Tôi gửi yêu cầu rồi thì bao lâu có phản hồi?",
    answer:
      "NXX315 phản hồi trong vòng 3 ngày làm việc. Phản hồi hiện trong Lịch sử yêu cầu. Nếu không đồng ý với kết quả xử lý một đơn đổi thưởng, bạn có thể khiếu nại trong 7 ngày kể từ khi nhận kết quả.",
  },
  {
    id: "x2", category: "other",
    question: "Phần thưởng và số xu cần đổi có thay đổi không?",
    answer:
      "Có thể. NXX315 có quyền thay đổi danh sách phần thưởng, số xu và điều kiện đổi thưởng khi cần. Mọi thay đổi được thông báo trên website ít nhất 2 ngày trước khi áp dụng, và chỉ áp dụng cho yêu cầu mới.",
  },
  {
    id: "x3", category: "other",
    question: "NXX315 có liên kết với Roblox hay Garena không?",
    answer:
      "Không. NXX315 Studio Rewards là đơn vị độc lập, không phải Roblox Corporation, Garena hay nhà phát hành của bất kỳ tựa game nào được nhắc đến. Tên và nhãn hiệu game thuộc về chủ sở hữu tương ứng.",
  },
  {
    id: "x4", category: "other",
    question: "Tôi muốn góp ý cho NXX315 thì gửi ở đâu?",
    answer:
      "Bấm “Gửi yêu cầu”, chọn “Góp ý ý tưởng” rồi chia sẻ điều bạn muốn thay đổi hoặc thêm vào. Mọi góp ý đều được đọc.",
  },
];
