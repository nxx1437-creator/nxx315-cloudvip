import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import BottomNav from "../components/BottomNav.jsx";
import TopHeader from "../components/TopHeader.jsx";

// ==================================================
// CUSTOM SVG ICONS
// ==================================================

// Nút back — mũi tên tròn
const IconBack = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="backGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
    </defs>
    <path
      d="M19 12H5M12 19l-7-7 7-7"
      stroke="url(#backGrad)"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Nhà — mái nhà cách điệu
const IconHome = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="homeGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
    </defs>
    <path
      d="M3 10.5l9-7 9 7"
      stroke="url(#homeGrad)"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M5 10v9a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1v-9"
      stroke="url(#homeGrad)"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

// Kính lúp — tìm kiếm
const IconSearch = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="searchGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>
    </defs>
    <circle
      cx="11"
      cy="11"
      r="7"
      stroke="url(#searchGrad)"
      strokeWidth="2.2"
      fill="none"
    />
    <path
      d="M20 20l-3.5-3.5"
      stroke="url(#searchGrad)"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </svg>
);

// Đồng hồ — lịch sử
const IconClock = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="clockHelpGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f472b6" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
    </defs>
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="url(#clockHelpGrad)"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M12 7v5l3 2"
      stroke="url(#clockHelpGrad)"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Chat bubble — hỗ trợ
const IconChatBubble = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="chatGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#fce7f3" />
      </linearGradient>
    </defs>
    <path
      d="M21 12c0 4.4-4 8-9 8-1.6 0-3-.3-4.3-.9L3 21l1.7-4.5C3.6 15.1 3 13.6 3 12c0-4.4 4-8 9-8s9 3.6 9 8z"
      fill="url(#chatGrad)"
      stroke="#ffffff"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle cx="9" cy="12" r="1.2" fill="#ec4899" />
    <circle cx="12" cy="12" r="1.2" fill="#ec4899" />
    <circle cx="15" cy="12" r="1.2" fill="#ec4899" />
  </svg>
);

// Play — mới bắt đầu
const IconPlay = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="playGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f472b6" />
        <stop offset="100%" stopColor="#db2777" />
      </linearGradient>
    </defs>
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="url(#playGrad)"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M10 8.5l6 3.5-6 3.5v-7z"
      fill="url(#playGrad)"
      stroke="url(#playGrad)"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

// Tag khuyến mãi
const IconTag = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="tagGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fb7185" />
        <stop offset="100%" stopColor="#e11d48" />
      </linearGradient>
    </defs>
    <path
      d="M3 12V5a2 2 0 012-2h7l9 9-9 9-9-9z"
      stroke="url(#tagGrad)"
      strokeWidth="2"
      strokeLinejoin="round"
      fill="none"
    />
    <circle cx="8" cy="8" r="1.5" fill="url(#tagGrad)" />
  </svg>
);

// Ngân hàng — cột trụ
const IconBank = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="bankGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#e879f9" />
        <stop offset="100%" stopColor="#c026d3" />
      </linearGradient>
    </defs>
    <path
      d="M3 10l9-6 9 6"
      stroke="url(#bankGrad)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"
      stroke="url(#bankGrad)"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// Thẻ thanh toán
const IconPayment = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="payGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#a78bfa" />
        <stop offset="100%" stopColor="#7c3aed" />
      </linearGradient>
    </defs>
    <rect
      x="3"
      y="6"
      width="18"
      height="13"
      rx="2.5"
      stroke="url(#payGrad)"
      strokeWidth="2"
      fill="none"
    />
    <path d="M3 10h18" stroke="url(#payGrad)" strokeWidth="2" />
    <rect x="6" y="13.5" width="4" height="2" rx="1" fill="url(#payGrad)" />
  </svg>
);

// Tay cầm game — trò chơi
const IconGamepad = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="gamepadGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#6d28d9" />
      </linearGradient>
    </defs>
    <path
      d="M7 8h10a5 5 0 014.5 7.2l-1 2a2 2 0 01-3.5.3L15.5 15h-7L7 17.5a2 2 0 01-3.5-.3l-1-2A5 5 0 017 8z"
      stroke="url(#gamepadGrad)"
      strokeWidth="2"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M8 11v2M7 12h2M15.5 11.5h.01M17 13h.01"
      stroke="url(#gamepadGrad)"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// Khiên — bảo mật
const IconShield = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="shieldHelpGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#818cf8" />
        <stop offset="100%" stopColor="#4f46e5" />
      </linearGradient>
    </defs>
    <path
      d="M12 2.5l8 3v6.5c0 5-3.4 8.5-8 9.5-4.6-1-8-4.5-8-9.5V5.5l8-3z"
      stroke="url(#shieldHelpGrad)"
      strokeWidth="2"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M9 12l2 2 4-4"
      stroke="url(#shieldHelpGrad)"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Mũi tên xuống — accordion
const IconChevronDown = ({ size = 18, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <defs>
      <linearGradient id="chevDownGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>
    </defs>
    <path
      d="M6 9l6 6 6-6"
      stroke="url(#chevDownGrad)"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Ngôi sao lấp lánh — góp ý
const IconSparkle = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="sparkleGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>
    </defs>
    <path
      d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3z"
      fill="url(#sparkleGrad)"
      stroke="url(#sparkleGrad)"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M18.5 15l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z"
      fill="url(#sparkleGrad)"
    />
  </svg>
);

// Mascot — mặt cười dễ thương
const MascotFace = ({ size = 72 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
    <defs>
      <linearGradient id="mascotGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f9a8d4" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
      <linearGradient id="mascotFaceGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fbcfe8" />
        <stop offset="100%" stopColor="#f9a8d4" />
      </linearGradient>
    </defs>
    {/* Đầu */}
    <circle cx="40" cy="42" r="28" fill="url(#mascotFaceGrad)" stroke="url(#mascotGrad)" strokeWidth="2.5" />
    {/* Tai trái */}
    <ellipse cx="18" cy="20" rx="6" ry="9" fill="url(#mascotGrad)" />
    {/* Tai phải */}
    <ellipse cx="62" cy="20" rx="6" ry="9" fill="url(#mascotGrad)" />
    {/* Mắt trái */}
    <ellipse cx="30" cy="40" rx="3" ry="4" fill="#831843" />
    {/* Mắt phải */}
    <ellipse cx="50" cy="40" rx="3" ry="4" fill="#831843" />
    {/* Chấm sáng mắt */}
    <circle cx="31" cy="38.5" r="1" fill="#ffffff" />
    <circle cx="51" cy="38.5" r="1" fill="#ffffff" />
    {/* Má hồng */}
    <ellipse cx="24" cy="48" rx="4" ry="2.5" fill="#f472b6" opacity="0.6" />
    <ellipse cx="56" cy="48" rx="4" ry="2.5" fill="#f472b6" opacity="0.6" />
    {/* Miệng cười */}
    <path
      d="M32 51c2 3 5.5 4.5 8 4.5s6-1.5 8-4.5"
      stroke="#831843"
      strokeWidth="2.2"
      strokeLinecap="round"
      fill="none"
    />
    {/* Mũ */}
    <path
      d="M22 28c4-8 12-13 18-13s14 5 18 13"
      fill="url(#mascotGrad)"
      stroke="#be185d"
      strokeWidth="1.5"
    />
    {/* Nơ trên mũ */}
    <path
      d="M40 12l-5 4M40 12l5 4"
      stroke="#be185d"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <circle cx="40" cy="12" r="2.5" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
  </svg>
);
// ==================================================
// DATA
// ==================================================

const TOPICS = [
  {
    key: "start",
    label: "Mới bắt đầu",
    Icon: IconPlay,
    color: "text-pink-500",
    bg: "bg-pink-50",
    link: "/help?topic=start",
  },
  {
    key: "promo",
    label: "Ưu đãi & Quà",
    Icon: IconTag,
    color: "text-rose-500",
    bg: "bg-rose-50",
    link: "/help?topic=promo",
  },
  {
    key: "bank",
    label: "Ngân hàng & Nguồn tiền",
    Icon: IconBank,
    color: "text-fuchsia-500",
    bg: "bg-fuchsia-50",
    link: "/help?topic=bank",
  },
  {
    key: "payment",
    label: "Thanh toán dịch vụ",
    Icon: IconPayment,
    color: "text-purple-500",
    bg: "bg-purple-50",
    link: "/help?topic=payment",
  },
  {
    key: "game",
    label: "Trò chơi",
    Icon: IconGamepad,
    color: "text-violet-500",
    bg: "bg-violet-50",
    link: "/help?topic=game",
  },
  {
    key: "security",
    label: "Tài khoản & Bảo mật",
    Icon: IconShield,
    color: "text-indigo-500",
    bg: "bg-indigo-50",
    link: "/help?topic=security",
  },
];

const FAQS = [
  {
    q: "Làm thế nào để liên hệ với bộ phận hỗ trợ NXX315?",
    a: "Bạn có thể chat trực tiếp với admin qua Zalo 0865245988 hoặc gửi yêu cầu tại trang Hỗ trợ. Thời gian phản hồi trung bình từ 5-15 phút trong giờ hành chính.",
  },
  {
    q: "Làm sao để đổi thưởng Robux hoặc thẻ game?",
    a: "Vào mục Cửa hàng → chọn game bạn muốn đổi → nhập thông tin tài khoản game → xác nhận đơn. Hệ thống sẽ xử lý trong 5-30 phút.",
  },
  {
    q: "Tôi nên làm gì khi phát hiện giao dịch bất thường hoặc mất tiền?",
    a: "Ngay lập tức liên hệ Zalo 0865245988 để được hỗ trợ. Đồng thời vào Cài đặt → Bảo mật → Đăng xuất mọi thiết bị khác để bảo vệ tài khoản.",
  },
  {
    q: "Vì sao tài khoản của tôi bị khoá tạm thời?",
    a: "Tài khoản có thể bị khoá khi phát hiện dấu hiệu bất thường như: tạo nhiều tài khoản trên cùng thiết bị, đăng nhập sai mật khẩu quá nhiều lần, hoặc IP không khớp với IP đăng ký. Vui lòng liên hệ Zalo để được hỗ trợ.",
  },
  {
    q: "Làm sao để kiếm thêm Coin trong NXX315?",
    a: "Có nhiều cách: làm nhiệm vụ hàng ngày, chơi mini game, mời bạn bè qua link giới thiệu, xem video quảng cáo, và tham gia sự kiện. Xem chi tiết tại mục Nhiệm vụ.",
  },
  {
    q: "Đơn hàng của tôi đang xử lý quá lâu, phải làm sao?",
    a: "Đơn hàng thường được xử lý trong 5-30 phút. Nếu quá 1 giờ vẫn chưa có kết quả, vui lòng liên hệ Zalo 0865245988 kèm mã đơn hàng để được ưu tiên xử lý.",
  },
];

// ==================================================
// MAIN COMPONENT
// ==================================================

export default function HelpCenter() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const filteredFaqs = FAQS.filter(
    (faq) =>
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFaq = (index) => {
    setOpenFaqIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] pb-24 dark:bg-slate-950">
      <TopHeader />

      {/* ============ HEADER GRADIENT ============ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-pink-100 via-rose-50 to-pink-50 px-4 pb-8 pt-4 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-pink-200/40 blur-3xl dark:bg-pink-500/10" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-500/10" />

        <div className="relative mx-auto max-w-md md:max-w-3xl">
          {/* Back + Home */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm transition hover:bg-slate-50 dark:bg-slate-800"
            >
              <IconBack size={18} />
            </button>

            <h1 className="text-base font-bold text-slate-800 dark:text-white">
              Trung tâm Trợ giúp
            </h1>

            <button
              onClick={() => navigate("/")}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm transition hover:bg-slate-50 dark:bg-slate-800"
            >
              <IconHome size={18} />
            </button>
          </div>

          {/* Chào hỏi + Mascot */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="font-display text-2xl font-black text-pink-600">
                Chào bạn 👋
              </p>
              <p className="mt-1 text-base font-bold leading-tight text-slate-800 dark:text-white">
                NXX315 có thể giúp gì cho bạn?
              </p>
            </div>

            {/* Mascot SVG tự vẽ */}
            <div className="relative shrink-0">
              <MascotFace size={84} />
            </div>
          </div>
        </div>
      </div>

      {/* ============ MAIN ============ */}
      <main className="mx-auto max-w-md space-y-5 px-4 pt-5 md:max-w-3xl">
        {/* Search bar + Lịch sử */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
              <IconSearch size={18} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm vấn đề của bạn tại đây"
              className="w-full rounded-full border-0 bg-white py-3.5 pl-11 pr-4 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-pink-200 dark:bg-slate-900 dark:text-white dark:focus:ring-pink-500/30"
            />
          </div>

          <button
            onClick={() => navigate("/history")}
            className="flex shrink-0 flex-col items-center justify-center gap-1 rounded-2xl bg-white px-3 shadow-sm transition hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            <IconClock size={16} />
            <span className="text-[10px] font-bold text-pink-500">Lịch sử</span>
          </button>
        </div>

        {/* Card hỗ trợ trực tuyến */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-pink-100/60 dark:bg-pink-500/10" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500 shadow-md">
              <IconChatBubble size={28} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                Hỗ trợ trực tuyến
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Trả lời mọi câu hỏi của bạn 24/7
              </p>
            </div>

            <a
              href="https://zalo.me/0865245988"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-pink-500/30 transition hover:opacity-90"
            >
              Chat với NXX315
            </a>
          </div>
        </div>

        {/* Đơn hàng gần đây */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 dark:text-white">
              Thắc mắc về giao dịch?
            </h2>
            <Link
              to="/history"
              className="text-sm font-bold text-pink-600 transition hover:underline"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1">
            <Link
              to="/history"
              className="flex w-64 shrink-0 items-center gap-3 rounded-2xl bg-white p-3 shadow-sm transition hover:shadow-md dark:bg-slate-900"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                <IconBank size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-800 dark:text-white">
                  Đổi thưởng Robux
                </p>
                <p className="mt-0.5 truncate text-[10px] text-slate-500">
                  Mã: #12345 · 30/09/2026
                </p>
                <span className="mt-1 inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/10">
                  Thành công
                </span>
              </div>
              <span className="shrink-0 text-xs font-bold text-slate-700 dark:text-slate-300">
                -100 xu
              </span>
            </Link>

            <Link
              to="/history"
              className="flex w-64 shrink-0 items-center gap-3 rounded-2xl bg-white p-3 shadow-sm transition hover:shadow-md dark:bg-slate-900"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10">
                <IconPayment size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-800 dark:text-white">
                  Đổi thẻ điện thoại
                </p>
                <p className="mt-0.5 truncate text-[10px] text-slate-500">
                  Mã: #12344 · 29/09/2026
                </p>
                <span className="mt-1 inline-block rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-500/10">
                  Đang xử lý
                </span>
              </div>
              <span className="shrink-0 text-xs font-bold text-slate-700 dark:text-slate-300">
                -50 xu
              </span>
            </Link>
          </div>
        </div>

        {/* Trợ giúp theo chủ đề */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 dark:text-white">
              Trợ giúp theo chủ đề
            </h2>
            <button
              onClick={() => navigate("/help/all")}
              className="text-sm font-bold text-pink-600 transition hover:underline"
            >
              Xem tất cả
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {TOPICS.map((topic) => {
              const { Icon } = topic;
              return (
                <button
                  key={topic.key}
                  onClick={() => navigate(topic.link)}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-white p-3.5 text-center shadow-sm transition hover:shadow-md dark:bg-slate-900"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${topic.bg} dark:bg-slate-800`}
                  >
                    <Icon size={22} />
                  </div>
                  <span className="text-[11px] font-bold leading-tight text-slate-700 dark:text-slate-300">
                    {topic.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ accordion */}
        <div>
          <h2 className="mb-3 text-base font-bold text-slate-800 dark:text-white">
            Các vấn đề thường gặp
          </h2>

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-slate-900">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`${
                    idx !== filteredFaqs.length - 1
                      ? "border-b border-slate-100 dark:border-slate-800"
                      : ""
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <span className="flex-1 text-sm font-semibold leading-5 text-slate-800 dark:text-slate-100">
                      {faq.q}
                    </span>
                    <div
                      className={`shrink-0 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      <IconChevronDown size={18} />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/30">
                      <p className="text-[13px] leading-6 text-slate-600 dark:text-slate-300">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredFaqs.length === 0 && (
              <div className="p-6 text-center">
                <p className="text-sm text-slate-500">
                  Không tìm thấy câu hỏi phù hợp.
                </p>
              </div>
            )}
          </div>

          {filteredFaqs.length > 0 && !searchQuery && (
            <div className="mt-3 flex justify-center">
              <button
                onClick={() => navigate("/help/all")}
                className="flex items-center gap-1.5 rounded-full border-2 border-pink-200 bg-white px-5 py-2.5 text-xs font-bold text-pink-600 transition hover:bg-pink-50 dark:border-pink-500/30 dark:bg-slate-900 dark:hover:bg-pink-500/10"
              >
                <IconChevronDown size={14} />
                Xem thêm
              </button>
            </div>
          )}
        </div>

        {/* Card góp ý */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 dark:border-blue-500/30 dark:from-blue-500/10 dark:to-cyan-500/10">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-900">
              <IconSparkle size={22} />
            </div>

            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                NXX315 cần bạn góp ý
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                Mỗi đề xuất của bạn là động lực để NXX315 cải thiện từng chút một.
              </p>

              <a
                href="https://zalo.me/0865245988"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs font-bold text-blue-600 underline"
              >
                Khám phá ngay
              </a>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
    }
