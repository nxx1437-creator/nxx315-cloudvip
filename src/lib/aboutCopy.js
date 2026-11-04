// Nội dung trang "Về chúng tôi" (tiếng Việt + tiếng Anh). Sửa chữ ở đây, không cần đụng giao diện.
export const OFFICIAL_EMAIL = "support@nxx315.com";

// ⏱ CÁC MỐC THỜI GIAN: đây là mức đề xuất. Hãy sửa theo khả năng xử lý thật của bạn,
// vì đã ghi lên web là người dùng sẽ trông đợi đúng như vậy.
const T = {
  vi: {
    withdraw: "Thường 1–3 ngày làm việc kể từ khi gửi yêu cầu. Dịp đông yêu cầu có thể lâu hơn",
    withdrawLate: "5 ngày làm việc",
    refundWindow: "Trong vòng 7 ngày kể từ khi tạo đơn",
    refundDone: "3–5 ngày làm việc sau khi yêu cầu được xác nhận",
    ack: "2 ngày làm việc",
    resolve: "7 ngày làm việc",
  },
  en: {
    withdraw: "Usually 1–3 business days after you submit. It can take longer when there are many requests",
    withdrawLate: "5 business days",
    refundWindow: "Within 7 days of creating the order",
    refundDone: "3–5 business days after the request is confirmed",
    ack: "2 business days",
    resolve: "7 business days",
  },
};

const LEGAL = {
  vi: [["/terms", "Điều khoản"], ["/privacy", "Quyền riêng tư"], ["/fraud", "Chống gian lận"], ["/redemption-policy", "Quy định đổi thưởng"]],
  en: [["/terms", "Terms"], ["/privacy", "Privacy"], ["/fraud", "Anti-fraud"], ["/redemption-policy", "Redemption policy"]],
};

export function buildAbout(lang, SITE) {
  const vi = lang !== "en"; const t = T[vi ? "vi" : "en"];
  const since = (SITE.launched && (SITE.launched[lang] || SITE.launched.vi)) || "";
  const row = (cond, r) => (cond ? [r] : []);
  const sections = [];

  sections.push({ id: "ai", title: vi ? "Ai đứng sau" : "Who is behind it", blocks: [
    { t: "rows", rows: [
      [vi ? "Người vận hành" : "Operator", SITE.operator],
      ...row(SITE.youtube, [vi ? "Định danh trực tuyến" : "Online identity", { text: vi ? "Nxx · kênh YouTube" : "Nxx · YouTube channel", href: SITE.youtube, ext: true }]),
      [vi ? "Hình thức hoạt động" : "Type of operation", vi ? "Cá nhân vận hành" : "Run by an individual"],
      ...row(SITE.business, [vi ? "Đăng ký kinh doanh" : "Business registration", SITE.business]),
      ...row(SITE.address, [vi ? "Địa chỉ" : "Address", SITE.address]),
      [vi ? "Hoạt động từ" : "Running since", since],
    ] },
    { t: "note", tag: vi ? "Xác minh" : "Verify", tone: "green",
      x: vi ? "Bạn có thể đối chiếu người vận hành qua kênh YouTube công khai ở trên. Chúng tôi không nhắn tin riêng để yêu cầu tiền, mật khẩu hay mã OTP."
            : "You can check the operator through the public YouTube channel above. We never message privately to ask for money, passwords or OTP codes." },
  ] });

  sections.push({ id: "nguon-xu", title: vi ? "Xu đến từ đâu" : "Where the coins come from", blocks: [
    { t: "p", x: vi ? "Mỗi nhiệm vụ là một liên kết của đối tác quảng cáo. Khi bạn hoàn thành hợp lệ, đối tác trả phí cho NXX315 và phần xu thưởng được lấy từ nguồn đó. Vì thế xu chỉ được cộng khi nhiệm vụ được xác nhận, và các hành vi gian lận như đa tài khoản, VPN hay tool tự động sẽ bị chặn."
                : "Each task is a link from an advertising partner. When you complete it validly, the partner pays NXX315 and the coin reward comes from that income. That is why coins are only credited once a task is confirmed, and cheating such as multiple accounts, VPNs or automation tools is blocked." },
  ] });

  sections.push({ id: "khong-lam", title: vi ? "Những điều chúng tôi không làm" : "What we do not do", blocks: [
    { t: "list", items: vi ? [
      "Không yêu cầu nạp tiền để kiếm hoặc rút Coin.",
      "Không bao giờ hỏi mật khẩu, mã OTP hay mã khôi phục của bạn.",
      "Không cam kết thu nhập. Số xu bạn kiếm phụ thuộc vào số nhiệm vụ còn lượt và hoạt động của bạn.",
      "Không bán tool hack minigame hay mẹo tăng xu.",
    ] : [
      "We never ask you to deposit money to earn or withdraw Coins.",
      "We never ask for your password, OTP or recovery codes.",
      "We do not promise income. What you earn depends on available task slots and your activity.",
      "We do not sell minigame hacks or tricks to get more coins.",
    ] },
    { t: "p", x: vi ? "Cửa hàng cho phép thanh toán bằng chuyển khoản nếu bạn muốn mua quà trực tiếp. Đó là mua hàng, không phải khoản nạp bắt buộc để được rút."
                : "The store accepts bank transfer if you want to buy a gift directly. That is a purchase, not a required deposit to be able to withdraw." },
  ] });

  sections.push({ id: "rut-xu", title: vi ? "Rút xu và thời gian xử lý" : "Withdrawals and processing time", blocks: [
    { t: "rows", rows: vi ? [
      ["Tỷ lệ quy đổi", "1 Coin = 1đ"],
      ["Mức rút tối thiểu", "10.000đ về ngân hàng, 5.000đ về MoMo hoặc ZaloPay"],
      ["Phí", "500 Coin mỗi lần rút"],
      ["Giới hạn", "Tối đa 5 lần và 500.000đ mỗi ngày"],
      ["Thời gian xử lý", t.withdraw],
      ["Theo dõi", "Trạng thái và lý do hiển thị trong Lịch sử rút"],
    ] : [
      ["Exchange rate", "1 Coin = 1 VND"],
      ["Minimum withdrawal", "10,000 VND to a bank, 5,000 VND to MoMo or ZaloPay"],
      ["Fee", "500 Coins per request"],
      ["Limit", "Up to 5 requests and 500,000 VND per day"],
      ["Processing time", t.withdraw],
      ["Tracking", "Status and reasons are shown in Withdrawal history"],
    ] },
    { t: "p", x: vi ? "Yêu cầu rút được xem xét thủ công để chặn gian lận, nên cần thời gian. Chúng tôi không hứa duyệt tức thì. Nếu yêu cầu bị từ chối, lý do hiển thị trong lịch sử. Số tiền rút được hoàn lại, phí 500 Coin được giữ."
                : "Withdrawals are reviewed manually to stop fraud, so they take time. We do not promise instant approval. If a request is rejected, the reason is shown in your history. The withdrawn amount is returned and the 500 Coin fee is kept." },
    { t: "note", tag: vi ? "Quá hạn" : "Overdue",
      x: vi ? `Nếu quá ${t.withdrawLate} chưa có kết quả, hãy liên hệ ${OFFICIAL_EMAIL} kèm mã đơn.` : `If there is no result after ${t.withdrawLate}, contact ${OFFICIAL_EMAIL} with your order code.` },
    { t: "links", items: [["/guide/rut-tien", vi ? "Hướng dẫn rút tiền" : "Withdrawal guide"], ["/withdraw/history", vi ? "Lịch sử rút" : "Withdrawal history"]] },
  ] });

  sections.push({ id: "hoan-tien", title: vi ? "Điều kiện hoàn tiền" : "Refund conditions", blocks: [
    { t: "p", x: vi ? "Điều kiện dưới đây áp dụng cho đơn đổi quà và đơn mua bằng chuyển khoản." : "These conditions apply to redemption orders and orders paid by bank transfer." },
    { t: "note", tag: vi ? "Được hoàn" : "Refunded", tone: "green", items: vi ? [
      "Đơn chưa được xử lý và bạn yêu cầu hủy",
      "Lỗi hệ thống hoặc lỗi từ phía NXX315 (đã trừ xu hoặc tiền nhưng không giao thưởng)",
      "Phần thưởng hết hàng hoặc không còn cung cấp sau khi bạn đã thanh toán",
      "Chuyển khoản trùng hoặc thừa tiền",
    ] : [
      "The order has not been processed and you ask to cancel it",
      "A system error or an error on NXX315's side (coins or money charged but no reward delivered)",
      "The reward is out of stock or no longer offered after you paid",
      "A duplicate or excess bank transfer",
    ] },
    { t: "note", tag: vi ? "Không hoàn" : "Not refunded", tone: "rose", items: vi ? [
      "Phần thưởng đã giao thành công đến đúng thông tin bạn cung cấp",
      "Bạn nhập sai ID, tài khoản hoặc thông tin nhận thưởng",
      "Yêu cầu bị từ chối do vi phạm hoặc gian lận",
      "Bạn đổi ý sau khi phần thưởng đã được xử lý",
      "Phí rút 500 Coin của yêu cầu rút bị từ chối",
    ] : [
      "The reward was delivered successfully to the details you provided",
      "You entered a wrong ID, account or delivery detail",
      "The request was rejected for a violation or fraud",
      "You changed your mind after the reward was processed",
      "The 500 Coin fee of a rejected withdrawal",
    ] },
    { t: "rows", rows: vi ? [
      ["Thời hạn yêu cầu", t.refundWindow],
      ["Thời gian hoàn", t.refundDone],
      ["Hình thức hoàn", "Đơn trả bằng Coin: hoàn Coin vào ví. Đơn chuyển khoản: hoàn về đúng tài khoản đã chuyển."],
      ["Cần cung cấp", "Mã đơn, tên tài khoản, mô tả vấn đề và ảnh biên lai nếu có"],
    ] : [
      ["Request deadline", t.refundWindow],
      ["Refund time", t.refundDone],
      ["How we refund", "Orders paid with Coins: Coins return to your wallet. Bank transfer orders: money returns to the account you paid from."],
      ["What to provide", "Order code, account name, a description of the problem and the receipt if you have one"],
    ] },
    { t: "links", items: [["/redemption-policy", vi ? "Quy định đổi thưởng" : "Redemption policy"], ["/refund", vi ? "Chính sách hoàn tiền" : "Refund policy"]] },
  ] });

  sections.push({ id: "khieu-nai", title: vi ? "Quy trình xử lý khiếu nại" : "Complaint handling process", blocks: [
    { t: "p", x: vi ? "Nếu bạn cho rằng tài khoản, đơn hàng hoặc yêu cầu rút bị xử lý nhầm, hãy làm theo các bước sau:" : "If you believe your account, order or withdrawal was handled wrongly, follow these steps:" },
    { t: "list", items: vi ? [
      `Bước 1 · Gửi khiếu nại: email ${OFFICIAL_EMAIL} hoặc biểu mẫu ở trang Liên hệ, kèm tên tài khoản, mã đơn, mô tả vấn đề và ảnh chụp màn hình.`,
      `Bước 2 · Tiếp nhận: chúng tôi xác nhận đã nhận trong ${t.ack}.`,
      "Bước 3 · Xác minh: đối chiếu dữ liệu hệ thống như lịch sử nhiệm vụ, đơn hàng và đăng nhập. Chúng tôi có thể hỏi thêm thông tin.",
      `Bước 4 · Kết quả: gửi kết luận và lý do qua email trong ${t.resolve} kể từ khi đủ thông tin. Nếu lỗi thuộc về hệ thống, xu hoặc tiền được hoàn theo mục trên.`,
      "Bước 5 · Xem xét lại: nếu không đồng ý, bạn trả lời email kèm thêm bằng chứng để được xem xét lại một lần.",
    ] : [
      `Step 1 · Submit: email ${OFFICIAL_EMAIL} or use the form on the Contact page with your account name, order code, a description and screenshots.`,
      `Step 2 · Acknowledgement: we confirm receipt within ${t.ack}.`,
      "Step 3 · Review: we check system data such as task history, orders and logins. We may ask for more information.",
      `Step 4 · Result: we send the decision and reasons by email within ${t.resolve} of receiving enough information. If the error was ours, coins or money are refunded as described above.`,
      "Step 5 · Second look: if you disagree, reply to the email with extra evidence for one more review.",
    ] },
    { t: "p", x: vi ? "Tài khoản bị khóa do gian lận có thể bị từ chối khôi phục." : "An account locked for fraud may be refused reinstatement." },
    { t: "note", tag: vi ? "Bảo mật" : "Security", tone: "rose", x: vi ? "**Không gửi mật khẩu hoặc mã OTP** khi khiếu nại. Chúng tôi sẽ không bao giờ hỏi." : "**Never send your password or OTP** when complaining. We will never ask for them." },
  ] });

  sections.push({ id: "gioi-thieu", title: vi ? "Chương trình giới thiệu" : "Referral program", blocks: [
    { t: "p", x: vi ? "Chương trình chỉ có một cấp và không thu phí tham gia. Người được mời nhận 200 xu khi nhập mã. Người mời nhận 15% số xu mà người đó kiếm từ nhiệm vụ, kèm thưởng mốc khi đủ 3, 5, 10 và 20 người. Đây không phải cam kết thu nhập, và tài khoản tạo ra để tự mời chính mình sẽ bị thu hồi thưởng."
                : "The program has a single level and no joining fee. A friend who enters your code gets 200 coins. You get 15% of the coins they earn from tasks, plus bonuses at 3, 5, 10 and 20 invites. This is not an income guarantee, and accounts created to invite yourself lose their rewards." },
  ] });

  sections.push({ id: "lien-he", title: vi ? "Liên hệ chính thức" : "Official contact", blocks: [
    { t: "rows", rows: [
      [vi ? "Email hỗ trợ chính thức" : "Official support email", { text: OFFICIAL_EMAIL, href: `mailto:${OFFICIAL_EMAIL}` }],
      ...row(SITE.zalo, ["Zalo", { text: SITE.zalo, href: SITE.zaloUrl, ext: true }]),
      [vi ? "Chat hỗ trợ" : "Support chat", { text: "/support", to: "/support" }],
    ] },
    { t: "note", tag: vi ? "Giả mạo" : "Impersonation", tone: "rose",
      x: vi ? "Chúng tôi chỉ có các kênh trên. Mọi trang hoặc người khác tự xưng NXX315 rồi đòi tiền hay mật khẩu đều là giả mạo."
            : "These are our only channels. Any other page or person claiming to be NXX315 and asking for money or passwords is an impersonator." },
    { t: "links", items: LEGAL[vi ? "vi" : "en"] },
  ] });

  return {
    title: vi ? "Về NXX315 Studio" : "About NXX315 Studio",
    eyebrow: vi ? "Về chúng tôi · Minh bạch" : "About · Transparency",
    intro: vi
      ? `NXX315 là nền tảng làm nhiệm vụ nhận Coin và đổi lấy quà game, do cá nhân vận hành. Web mới hoạt động từ ${since}, còn nhỏ và đang hoàn thiện. Vì vậy bạn nên đọc kỹ trang này trước khi tham gia.`
      : `NXX315 is a platform where you complete tasks to earn Coins and redeem game gifts. It is run by an individual. The site has only been running since ${since}, so it is small and still improving. Please read this page before you join.`,
    chips: vi ? ["Do cá nhân vận hành", "Không thu tiền để rút", "Email hỗ trợ chính thức"] : ["Run by an individual", "No payment needed to withdraw", "Official support email"],
    ui: vi ? {} : { back: "Back", home: "Home", toc: "Contents", backHome: "Back to home" },
    sections,
  };
}
