// src/lib/landingData.js
export const CREATOR_URL = "https://creator.nxx315.com";
export const HASHTAG = "#Nxx315Studio";

export const COPY = {
  vi: {
    nav: [["onboarding", "Bắt đầu"], ["creator", "Creator"], ["invite", "Mời bạn"], ["rank", "Xếp hạng"], ["orders", "Đơn đã duyệt"], ["details", "Chi tiết"]],
    login: "Đăng nhập", start: "Bắt đầu", langBtn: "EN",
    heroAlt: "Ảnh nền trang giới thiệu",
    h1a: "Làm", h1b: "nhiệm vụ", h1c: "Nhận xu", h1d: "đổi quà thật.",
    heroSub: "Làm nhiệm vụ mỗi ngày, đổi xu lấy quà.",
    ticketMeta: "Vé tham gia",
    ticketTitle: "Bắt đầu miễn phí",
    ticketNote: "Xu đổi được Robux, Quân Huy, Kim Cương và nhiều quà khác.",
    ctaAccount: "Bắt đầu làm nhiệm vụ", ctaCreator: "Quay video kiếm thêm xu",
    scroll: "Cuộn xuống",

    obLabel: "Bắt đầu ngay",
    obTitleA: "Tạo tài khoản", obTitleB: "tại nxx315.com",
    obBody: "Chỉ mất 30 giây để bắt đầu hành trình kiếm xu và đổi quà cùng NXX315 Studio.",
    obSteps: [
      ["Bước 01", "Truy cập & Đăng ký", "Truy cập www.nxx315.com, nhấn nút \"Bắt đầu\" ở góc trên bên phải và điền thông tin tài khoản."],
      ["Bước 02", "Làm nhiệm vụ", "Sau khi đăng nhập, vào mục \"Nhiệm vụ\" để nhận xu miễn phí hàng ngày hoặc tham gia các sự kiện."],
      ["Bước 03", "Đổi quà", "Dùng số xu tích lũy được để đổi thành Robux, Quân Huy, Kim Cương hoặc nhiều phần quà hấp dẫn khác."],
    ],
    obCta: "Tạo tài khoản ngay",

    iLabel: "02 · Mời bạn",
    iTitleA: "Rủ bạn,", iTitleB: "cùng nhận xu.",
    iBody: "Gửi mã mời của bạn cho bạn bè. Mỗi khi họ làm nhiệm vụ, bạn nhận thêm xu hoa hồng.",
    iCols: [
      ["15%", "xu hoa hồng từ nhiệm vụ của bạn bè."],
      ["1 mã", "riêng cho mỗi tài khoản, có sẵn sau khi đăng ký."],
      ["Tự động", "xu cộng thẳng vào ví của bạn."],
    ],
    iCta: "Lấy mã mời của bạn",

    rLabel: "03 · Xếp hạng",
    rTitleA: "Ai kiếm nhiều xu", rTitleB: "nhất tuần?",
    rSub: "Tính theo xu kiếm được trong 7 ngày gần nhất. Tên được ẩn một phần.",

    oLabel: "04 · Đơn đã duyệt",
    oTitleA: "Quà thật,", oTitleB: "giao thật.",
    oSub: "Những đơn vừa được duyệt gần đây. Tên được ẩn một phần để bảo mật.",
    approved: "Đã duyệt", unit: "xu", week: "7 ngày",
    empty: "Chưa có dữ liệu.", failed: "Chưa tải được dữ liệu. Thử lại sau nhé.",
    ago: ["vừa xong", "phút trước", "giờ trước", "ngày trước"],

    dLabel: "05 · Thông tin chi tiết",
    dTitleA: "Mọi thứ bạn cần biết,", dTitleB: "rõ ràng.",
    dItems: [
      ["Xu hoạt động thế nào?", "Mỗi nhiệm vụ hoàn thành, video được duyệt hoặc lượt mời thành công đều cộng xu thẳng vào ví của bạn."],
      ["Đổi được những gì?", "Robux, Quân Huy, Kim Cương và nhiều phần quà khác. Xem danh sách trong mục Đổi quà sau khi đăng nhập."],
      ["Duyệt đơn ra sao?", "Đơn đổi thưởng được kiểm tra trước khi giao để đảm bảo công bằng cho mọi người."],
      ["Thông tin của bạn", "Tên trên bảng xếp hạng và đơn đã duyệt được ẩn một phần để bảo mật."],
    ],
    faqTitle: "Câu hỏi thường gặp",
    faq: [
      ["Tham gia có mất phí không?", "Không. Tạo tài khoản và làm nhiệm vụ hoàn toàn miễn phí."],
      ["Bao lâu thì đơn được duyệt?", "Trạng thái đơn hiển thị trong chi tiết đơn của bạn. Nếu chờ lâu, hãy liên hệ qua Zalo hoặc email ở cuối trang."],
      ["Video của mình bị từ chối thì sao?", `Kiểm tra video đã có đúng hashtag ${HASHTAG} và đã liên kết đúng kênh chưa, rồi đăng lại.`],
      ["Mã mời hoạt động thế nào?", "Mỗi tài khoản có một mã mời riêng. Bạn nhận 15% xu hoa hồng từ nhiệm vụ của người được mời."],
    ],

    cLabel: "Tính năng mới",
    cTitleA: "Trở thành Creator", cTitleB: "kiếm xu thật.",
    cH3: "Quay video, nhận thưởng",
    cBody: `Ngoài làm nhiệm vụ, bạn còn có thể kiếm thêm xu bằng video. Đăng nhập trang Creator bằng Google, liên kết kênh của bạn rồi đăng video kèm hashtag ${HASHTAG}. Video được duyệt sẽ nhận mã quà xu.`,
    cPerks: [
      "Nhận ngay xu thưởng khi video được duyệt.",
      "Không giới hạn số lượng video mỗi ngày.",
      "Kết nối trực tiếp với hệ thống NXX315 Studio.",
    ],
    cCta: "Khám phá Creator Hub",
    mockTag: "Minh họa", mockGift: "Mã quà xu",
    mockPlaceholder: "[Hình ảnh minh họa giao diện Creator]",

    closeA: "Bắt đầu kiếm xu,", closeB: "miễn phí.",
    closeSub: "Tạo tài khoản chỉ mất vài phút.",
    manifesto: "Kiếm xu không cần rối rắm. Quà thì phải giao thật. Nên chúng mình làm cho rõ ràng.",
    fCols: ["Khám phá", "Tài khoản", "Pháp lý", "Liên hệ"],
    fExplore: [["onboarding", "Bắt đầu"], ["creator", "Creator"], ["invite", "Mời bạn"], ["rank", "Xếp hạng"], ["orders", "Đơn đã duyệt"], ["details", "Chi tiết"]],
    fAccount: [["/login", "Đăng nhập"], ["/register", "Đăng ký"], ["/guide", "Hướng dẫn"]],
    fLegal: [["/terms", "Điều khoản"], ["/privacy", "Bảo mật"], ["/refund", "Hoàn tiền"], ["/about", "Giới thiệu"]],
  },

  en: {
    nav: [["onboarding", "Get started"], ["creator", "Creator"], ["invite", "Invite"], ["rank", "Ranking"], ["orders", "Approved orders"], ["details", "Details"]],
    login: "Log in", start: "Start", langBtn: "VI",
    heroAlt: "Landing page background",
    h1a: "Do", h1b: "tasks", h1c: "Earn coins", h1d: "get real rewards.",
    heroSub: "Do daily tasks, redeem coins for rewards.",
    ticketMeta: "Access pass",
    ticketTitle: "Start for free",
    ticketNote: "Coins redeem for Robux, game currency and more.",
    ctaAccount: "Start doing tasks", ctaCreator: "Film videos, earn extra",
    scroll: "Scroll",

    obLabel: "Get started",
    obTitleA: "Create an account", obTitleB: "at nxx315.com",
    obBody: "It takes just 30 seconds to start earning coins and redeeming rewards with NXX315 Studio.",
    obSteps: [
      ["Step 01", "Visit & Sign up", "Go to www.nxx315.com, tap \"Start\" in the top right corner and fill in your account details."],
      ["Step 02", "Do tasks", "After logging in, open \"Tasks\" to earn free coins every day or join events."],
      ["Step 03", "Redeem rewards", "Use your coins to redeem Robux, game currency or many other rewards."],
    ],
    obCta: "Create account now",

    iLabel: "02 · Invite",
    iTitleA: "Bring friends,", iTitleB: "earn together.",
    iBody: "Share your invite code. Whenever your friends complete tasks, you earn bonus coins.",
    iCols: [
      ["15%", "commission coins from your friends' tasks."],
      ["1 code", "per account, ready after you sign up."],
      ["Automatic", "coins go straight to your wallet."],
    ],
    iCta: "Get your invite code",

    rLabel: "03 · Ranking",
    rTitleA: "Who earned the most", rTitleB: "this week?",
    rSub: "Based on coins earned in the last 7 days. Names are partly hidden.",

    oLabel: "04 · Approved orders",
    oTitleA: "Real rewards,", oTitleB: "really delivered.",
    oSub: "Orders approved recently. Names are partly hidden for privacy.",
    approved: "Approved", unit: "coins", week: "7 days",
    empty: "No data yet.", failed: "Couldn't load data. Please try again later.",
    ago: ["just now", "min ago", "h ago", "d ago"],

    dLabel: "05 · Details",
    dTitleA: "Everything you need to know,", dTitleB: "made clear.",
    dItems: [
      ["How do coins work?", "Every completed task, approved video or successful invite adds coins straight to your wallet."],
      ["What can I redeem?", "Robux, game currency and many other rewards. See the list under Rewards after logging in."],
      ["How are orders approved?", "Redemption orders are checked before delivery to keep things fair for everyone."],
      ["Your information", "Names on the ranking and approved orders are partly hidden for privacy."],
    ],
    faqTitle: "Frequently asked questions",
    faq: [
      ["Does it cost anything to join?", "No. Creating an account and doing tasks is completely free."],
      ["How long until my order is approved?", "The status shows in your order details. If it takes long, contact us via Zalo or email at the bottom of the page."],
      ["What if my video is rejected?", `Check that the video has the ${HASHTAG} hashtag and that you linked the right channel, then post again.`],
      ["How does the invite code work?", "Each account has its own invite code. You get 15% commission coins from the tasks of people you invite."],
    ],

    cLabel: "New feature",
    cTitleA: "Become a Creator", cTitleB: "earn real coins.",
    cH3: "Film videos, get rewarded",
    cBody: `Besides tasks, you can earn extra coins with videos. Sign in to the Creator site with Google, link your channel, then post a video with ${HASHTAG}. Approved videos earn a coin gift code.`,
    cPerks: [
      "Get coins as soon as your video is approved.",
      "No limit on the number of videos per day.",
      "Directly connected to the NXX315 Studio system.",
    ],
    cCta: "Explore Creator Hub",
    mockTag: "Illustration", mockGift: "Coin gift code",
    mockPlaceholder: "[Creator interface illustration]",

    closeA: "Start earning coins,", closeB: "for free.",
    closeSub: "Creating an account takes a few minutes.",
    manifesto: "Earning coins shouldn't be complicated. Rewards should be real. So we made it clear.",
    fCols: ["Explore", "Account", "Legal", "Contact"],
    fExplore: [["onboarding", "Get started"], ["creator", "Creator"], ["invite", "Invite"], ["rank", "Ranking"], ["orders", "Approved orders"], ["details", "Details"]],
    fAccount: [["/login", "Log in"], ["/register", "Sign up"], ["/guide", "Guide"]],
    fLegal: [["/terms", "Terms"], ["/privacy", "Privacy"], ["/refund", "Refunds"], ["/about", "About"]],
  },
};
