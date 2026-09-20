import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  History as HistoryIcon,
  MessageCircle,
  Bot,
  Headphones,
  HelpCircle,
  User,
  Coins,
  Gift,
  Shield,
  Lock,
  PlayCircle,
  Percent,
  Landmark,
  DollarSign,
  Gamepad2,
  Package,
  ArrowRight,
  Lightbulb,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";

// =====================================================
// STORAGE
// =====================================================
const SUPABASE_URL = "https://rwglwovohbyqmbbzdvdj.supabase.co";
const STORAGE_BUCKET = "game_logos";

const getImageUrl = (fileName) =>
  `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${fileName}`;

// Ảnh cần upload lên bucket game_logos:
const HELP_AVATAR = "help-avatar.png"; // 400x400
const HELP_BANNER = "help-banner.png"; // 1200x400

// =====================================================
// FAQ DATA
// =====================================================
const faqData = [
  {
    id: "account",
    icon: User,
    title: "Tài khoản",
    color: "#FE2C55",
    questions: [
      {
        q: "Ai có thể sử dụng NXX315 Studio Rewards?",
        a: "NXX315 Studio Rewards dành cho người dùng từ 15 tuổi trở lên.",
      },
      {
        q: "Tôi có được tạo nhiều tài khoản không?",
        a: "Không. Mỗi người dùng chỉ được phép sử dụng một tài khoản. Việc đổi thiết bị hoặc chuyển từ Wi-Fi sang 4G/5G không thay đổi quy định này.",
      },
      {
        q: "Tôi quên thông tin đăng nhập thì sao?",
        a: "Hãy sử dụng chức năng khôi phục tài khoản được cung cấp trên website hoặc liên hệ bộ phận hỗ trợ nếu bạn không thể tự khôi phục. Không cung cấp mật khẩu hoặc mã xác thực cho người khác.",
      },
    ],
  },
  {
    id: "tasks",
    icon: Coins,
    title: "Xu và nhiệm vụ",
    color: "#FFB800",
    questions: [
      {
        q: "Làm nhiệm vụ nhưng không nhận được xu thì sao?",
        a: "Hãy kiểm tra xem nhiệm vụ đã được hoàn thành đúng yêu cầu chưa. Nếu vẫn không nhận được xu, hãy liên hệ hỗ trợ và cung cấp thông tin về nhiệm vụ cùng ảnh chụp màn hình nếu có.",
      },
      {
        q: "Tôi có thể tự động hóa nhiệm vụ không?",
        a: "Không được sử dụng bot, script hoặc công cụ tự động trái phép để tạo lợi ích trên hệ thống.",
      },
      {
        q: "Xu của tôi bị trừ thì sao?",
        a: "Xu có thể bị trừ khi bạn đổi thưởng, giao dịch điều chỉnh, hoặc phát hiện gian lận. Nếu cho rằng số dư bị trừ sai, hãy liên hệ hỗ trợ.",
      },
    ],
  },
  {
    id: "redemption",
    icon: Gift,
    title: "Đổi thưởng",
    color: "#8B5CF6",
    questions: [
      {
        q: "Tôi có thể đổi những gì?",
        a: "Tùy thời điểm, hệ thống có thể cung cấp: Quân Huy, Mã/code Robux, và các phần thưởng khác được công bố.",
      },
      {
        q: "Đổi thưởng mất bao lâu?",
        a: "Thời gian xử lý phụ thuộc vào loại phần thưởng. Bạn có thể kiểm tra trạng thái trong lịch sử đổi thưởng.",
      },
      {
        q: "Tại sao yêu cầu đổi thưởng của tôi bị từ chối?",
        a: "Có thể do: tài khoản vi phạm, dấu hiệu gian lận, thông tin nhận thưởng sai, hoặc phần thưởng không còn khả dụng.",
      },
    ],
  },
  {
    id: "fraud",
    icon: Shield,
    title: "Gian lận",
    color: "#EF4444",
    questions: [
      {
        q: "Tôi có thể dùng nhiều mạng để tạo nhiều tài khoản không?",
        a: "Không. Quy định là một người dùng chỉ một tài khoản, bất kể Wi-Fi, 4G hay 5G.",
      },
      {
        q: "Tôi phát hiện lỗi thì nên làm gì?",
        a: "Hãy báo lỗi cho NXX315. Không cố tình khai thác lỗi để nhận xu hoặc phần thưởng.",
      },
      {
        q: "Tài khoản của tôi bị khóa do nhầm lẫn thì sao?",
        a: "Bạn có thể liên hệ hỗ trợ để yêu cầu xem xét lại.",
      },
    ],
  },
  {
    id: "security",
    icon: Lock,
    title: "An toàn tài khoản",
    color: "#10B981",
    questions: [
      {
        q: "NXX315 có yêu cầu mật khẩu của tôi không?",
        a: "NXX315 sẽ KHÔNG yêu cầu bạn gửi mật khẩu, mã xác thực, hoặc mã khôi phục. Nếu ai đó tự xưng nhân viên yêu cầu những thông tin này, hãy ngừng trao đổi ngay.",
      },
    ],
  },
];

// =====================================================
// TOPIC CATEGORIES
// =====================================================
const TOPIC_CATEGORIES = [
  {
    id: "start",
    icon: PlayCircle,
    title: "Mới bắt đầu",
    color: "#FE2C55",
    link: "/help",
  },
  {
    id: "promo",
    icon: Percent,
    title: "Ưu đãi và Quà của tôi",
    color: "#8B5CF6",
    link: "/tasks",
  },
  {
    id: "bank",
    icon: Landmark,
    title: "Ngân hàng và Nguồn tiền",
    color: "#10B981",
    link: "/wallet",
  },
  {
    id: "payment",
    icon: DollarSign,
    title: "Thanh toán dịch vụ",
    color: "#FFB800",
    link: "/history",
  },
  {
    id: "games",
    icon: Gamepad2,
    title: "Trò chơi",
    color: "#F43F5E",
    link: "/store",
  },
  {
    id: "security",
    icon: Shield,
    title: "Tài khoản và bảo mật",
    color: "#0EA5E9",
    link: "/support",
  },
];

// =====================================================
// HISTORY HELPERS
// =====================================================
function formatHistoryDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getHistoryStatus(status) {
  const key = String(status || "").toLowerCase();
  if (key === "delivered" || key === "success" || key === "paid") {
    return { label: "Thành công", className: "text-emerald-600" };
  }
  if (key === "pending") {
    return { label: "Chờ xử lý", className: "text-amber-600" };
  }
  if (key === "processing") {
    return { label: "Đang xử lý", className: "text-sky-600" };
  }
  if (key === "rejected" || key === "failed" || key === "cancelled") {
    return { label: "Thất bại", className: "text-rose-600" };
  }
  return { label: "Đang xử lý", className: "text-slate-600" };
}

function getHistoryAmount(order) {
  const money =
    order?.price_vnd ?? order?.amount_vnd ?? order?.amount ?? order?.amount_money;
  if (money != null) return `${Number(money).toLocaleString("vi-VN")}đ`;
  return "—";
}

function getHistoryLogo(order) {
  const packageId = String(order?.package_id || "").toLowerCase();
  if (packageId.includes("roblox")) return getImageUrl("roblox.png");
  if (packageId.includes("pubg")) return getImageUrl("pubg-mobile-vn.png");
  if (packageId.includes("freefire")) return getImageUrl("free-fire.png");
  if (packageId.includes("lienquan")) return getImageUrl("lien-quan-mobile.png");
  if (packageId.includes("playtogether")) return getImageUrl("play-together-vng.png");
  if (packageId.includes("fcmobile")) return getImageUrl("fc-mobile.png");
  if (packageId.includes("valorant")) return getImageUrl("valorant.png");
  return getImageUrl("store-cute.png");
  }
export default function HelpCenter() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState(null);
  const [showAllFaq, setShowAllFaq] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [avatarError, setAvatarError] = useState(false);

  const toggle = (id) => {
    setOpenId(openId === id ? null : id);
  };

  // Load giao dịch gần đây
  useEffect(() => {
    let alive = true;

    const loadRecent = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (alive) setLoadingHistory(false);
          return;
        }

        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3);

        if (error) throw error;

        if (alive) setRecentOrders(data || []);
      } catch (err) {
        console.error("HelpCenter history error:", err);
        if (alive) setRecentOrders([]);
      } finally {
        if (alive) setLoadingHistory(false);
      }
    };

    loadRecent();
    return () => {
      alive = false;
    };
  }, []);

  // Filter FAQ
  const filteredFaq = faqData
    .map((section) => ({
      ...section,
      questions: section.questions.filter(
        (q) =>
          q.q.toLowerCase().includes(search.toLowerCase()) ||
          q.a.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((section) => section.questions.length > 0);

  // Hiện 3 section đầu, còn lại ẩn
  const visibleFaq = showAllFaq ? filteredFaq : filteredFaq.slice(0, 3);
  const hasMoreFaq = filteredFaq.length > 3;

  return (
    <div className="min-h-screen bg-[#fafafa] pb-24 text-slate-900">
      {/* ============================================== */}
      {/* HEADER */}
      {/* ============================================== */}
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-black/[0.06] bg-white/95 px-4 py-3 backdrop-blur-xl">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-900 transition active:scale-95"
        >
          <ChevronDown size={20} className="rotate-90" strokeWidth={2.4} />
        </button>
        <h1 className="flex-1 text-center text-[15px] font-extrabold tracking-[-0.02em] text-[#161823]">
          Trung tâm Trợ giúp
        </h1>
        <Link
          to="/"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition active:scale-95"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </Link>
      </div>
      {/* ============================================== */}
{/* HERO */}
{/* ============================================== */}
<div className="relative overflow-hidden">
  {/* Banner background */}
  <div
    className="absolute inset-0 z-0 bg-gradient-to-br from-pink-100 via-rose-50 to-pink-50"
    style={{
      backgroundImage: `url(${getImageUrl(HELP_BANNER)})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  >
    {/* Overlay nhẹ để chữ nổi */}
    <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/20 to-white/70" />
  </div>

  <div className="relative z-10 mx-auto max-w-3xl px-4 pb-6 pt-5">
    <div className="flex items-start justify-between gap-3">
      {/* Text */}
      <div className="flex-1 pt-2">
        <h2 className="flex items-center gap-2 text-[26px] font-black leading-tight tracking-[-0.04em] text-[#161823]">
          Chào bạn
          <span className="inline-block animate-wave text-2xl">👋</span>
        </h2>
        <p className="mt-1 max-w-[200px] text-[14px] font-semibold leading-5 text-slate-700">
          NXX315 có thể giúp gì cho bạn?
        </p>
      </div>

      {/* Avatar mascot */}
      <div className="relative h-24 w-24 shrink-0">
        {!avatarError ? (
          <img
            src={getImageUrl(HELP_AVATAR)}
            alt="NXX315 Mascot"
            className="h-full w-full rounded-full object-cover drop-shadow-xl"
            onError={() => setAvatarError(true)}
          />
        ) : (
          // Fallback nếu chưa upload avatar
          <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[#FE2C55] to-[#25F4EE] shadow-[0_10px_30px_rgba(254,44,85,0.3)]">
            <Bot size={40} className="text-white" strokeWidth={2.2} />
          </div>
        )}
        <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm shadow-md">
          ✨
        </span>
      </div>
    </div>
  </div>
</div>

{/* ============================================== */}
{/* SEARCH */}
{/* ============================================== */}
<div className="px-4">
  <div className="mx-auto max-w-3xl">
    <div className="flex items-center gap-2">
      <div className="flex flex-1 items-center gap-2 rounded-full border border-black/[0.06] bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <Search size={18} className="shrink-0 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm vấn đề của bạn..."
          className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-slate-400"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="shrink-0 text-slate-400 transition hover:text-slate-700"
          >
            <X size={16} strokeWidth={2.4} />
          </button>
        )}
      </div>
      <Link
        to="/history"
        className="flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl bg-white px-3.5 py-2 text-[10px] font-bold text-[#FE2C55] shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition active:scale-95"
      >
        <HistoryIcon size={18} strokeWidth={2.4} />
        <span>Lịch sử</span>
      </Link>
    </div>
  </div>
</div>

{/* ============================================== */}
{/* CARD HỖ TRỢ TRỰC TUYẾN */}
{/* ============================================== */}
<div className="px-4 pt-4">
  <div className="mx-auto max-w-3xl">
    <div className="relative overflow-hidden rounded-[22px] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
      {/* Decorative pattern */}
      <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br from-pink-100 to-rose-50 opacity-60" />
      <div className="absolute -bottom-10 -left-4 h-32 w-32 rounded-full bg-gradient-to-br from-pink-50 to-transparent opacity-80" />

      <div className="relative flex items-center gap-4">
        {/* Avatar mini */}
        <div className="relative h-16 w-16 shrink-0">
          {!avatarError ? (
            <img
              src={getImageUrl(HELP_AVATAR)}
              alt=""
              className="h-full w-full rounded-full object-cover shadow-md"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[#FE2C55] to-[#25F4EE]">
              <Bot size={26} className="text-white" strokeWidth={2.2} />
            </div>
          )}
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-black text-[#161823]">
            Hỗ trợ trực tuyến
          </p>
          <p className="mt-0.5 text-[12px] leading-4 text-slate-500">
            Trả lời mọi câu hỏi của bạn 24/7
          </p>
        </div>
      </div>

      {/* Button */}
      <Link
        to="/support"
        className="relative mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FE2C55] to-[#ff4d79] px-4 py-3.5 text-[14px] font-extrabold text-white shadow-[0_6px_20px_rgba(254,44,85,0.3)] transition active:scale-[0.98]"
      >
        <MessageCircle size={18} strokeWidth={2.6} />
        Chat với NXX315
      </Link>
    </div>
  </div>
</div>
        {/* ============================================== */}
      {/* SECTION: THẮC MẮC VỀ GIAO DỊCH */}
      {/* ============================================== */}
      {recentOrders.length > 0 && (
        <section className="pt-7">
          <div className="mx-auto max-w-3xl px-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[17px] font-black text-[#161823]">
                Thắc mắc về giao dịch?
              </h3>
              <Link
                to="/history"
                className="text-[13px] font-bold text-[#FE2C55]"
              >
                Xem tất cả
              </Link>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {recentOrders.map((order) => {
                const status = getHistoryStatus(order.status);
                return (
                  <Link
                    key={order.id}
                    to={`/history/order/${order.id}?source=orders`}
                    className="flex w-[280px] shrink-0 flex-col gap-2.5 rounded-[18px] border border-black/[0.05] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition active:scale-[0.99]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50 p-1.5">
                        <img
                          src={getHistoryLogo(order)}
                          alt=""
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = getImageUrl("store-cute.png");
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-bold leading-tight text-slate-800">
                          Chuyển đến NXX315 Studio
                        </p>
                        <p className="mt-1 truncate text-[11px] text-slate-500">
                          {formatHistoryDate(order.created_at)}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] font-semibold text-sky-600">
                          Mã GD: {order.order_code || `#${order.id}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                      <span
                        className={`inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold ${status.className}`}
                      >
                        {status.label}
                      </span>
                      <span className="text-[15px] font-black text-slate-900">
                        -{getHistoryAmount(order)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============================================== */}
      {/* SECTION: TRỢ GIÚP THEO CHỦ ĐỀ */}
      {/* ============================================== */}
      <section className="pt-7">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[17px] font-black text-[#161823]">
              Trợ giúp theo chủ đề
            </h3>
            <button
              onClick={() => {
                const el = document.getElementById("faq-list");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="text-[13px] font-bold text-[#FE2C55]"
            >
              Xem tất cả
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {TOPIC_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  to={cat.link}
                  className="flex flex-col items-center gap-2.5 rounded-[18px] border border-black/[0.05] bg-white p-3.5 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] active:scale-[0.97]"
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${cat.color}15` }}
                  >
                    <Icon
                      size={24}
                      style={{ color: cat.color }}
                      strokeWidth={2}
                    />
                  </div>
                  <p className="text-[11px] font-bold leading-tight text-slate-800">
                    {cat.title}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================== */}
      {/* SECTION: FAQ */}
      {/* ============================================== */}
      <section id="faq-list" className="pt-7">
        <div className="mx-auto max-w-3xl px-4">
          <h3 className="mb-3 text-[17px] font-black text-[#161823]">
            Các vấn đề thường gặp
          </h3>

          {filteredFaq.length === 0 ? (
            <div className="rounded-[18px] border border-black/[0.05] bg-white py-14 text-center">
              <Search size={36} className="mx-auto mb-3 text-slate-300" />
              <p className="text-[14px] font-bold text-slate-700">
                Không tìm thấy câu hỏi phù hợp
              </p>
              <p className="mt-1 text-[12px] text-slate-500">
                Thử từ khóa khác hoặc chat với AI
              </p>
              <Link
                to="/support"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#FE2C55] px-5 py-2.5 text-[13px] font-bold text-white shadow-md transition active:scale-95"
              >
                <MessageCircle size={14} strokeWidth={2.4} />
                Chat với AI
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-[18px] border border-black/[0.05] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                {visibleFaq.map((section, sectionIdx) => {
                  const isOpen = openId === section.id;

                  return (
                    <div
                      key={section.id}
                      className={`${
                        sectionIdx > 0 ? "border-t border-slate-100" : ""
                      }`}
                    >
                      <button
                        onClick={() => toggle(section.id)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition active:bg-slate-50"
                      >
                        <span className="flex-1 text-[14px] font-bold leading-5 text-slate-900">
                          {section.title}
                        </span>
                        <ChevronRight
                          size={18}
                          className={`shrink-0 text-slate-400 transition-transform ${
                            isOpen ? "rotate-90" : ""
                          }`}
                          strokeWidth={2.4}
                        />
                      </button>

                      {isOpen && (
                        <div className="border-t border-slate-50 bg-slate-50/50">
                          {section.questions.map((item, idx) => (
                            <div
                              key={idx}
                              className="border-b border-slate-100 px-4 py-3.5 last:border-0"
                            >
                              <p className="text-[13px] font-bold leading-5 text-slate-900">
                                {item.q}
                              </p>
                              <p className="mt-2 text-[13px] leading-5 text-slate-600">
                                {item.a}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {hasMoreFaq && (
                <button
                  onClick={() => setShowAllFaq((v) => !v)}
                  className="mx-auto mt-4 flex items-center gap-2 rounded-full border border-[#FE2C55]/30 bg-white px-5 py-2.5 text-[13px] font-bold text-[#FE2C55] shadow-sm transition active:scale-95"
                >
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      showAllFaq ? "rotate-180" : ""
                    }`}
                    strokeWidth={2.6}
                  />
                  {showAllFaq ? "Thu gọn" : "Xem thêm"}
                </button>
              )}
            </>
          )}
        </div>
      </section>

      {/* ============================================== */}
      {/* CTA: GÓP Ý / LIÊN HỆ */}
      {/* ============================================== */}
      <section className="px-4 pt-7 pb-4">
        <div className="mx-auto max-w-3xl">
          <div className="relative overflow-hidden rounded-[20px] border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-blue-50 p-5 shadow-[0_4px_16px_rgba(14,165,233,0.08)]">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 shadow-md">
                <Lightbulb size={26} className="text-white" strokeWidth={2.2} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-black text-slate-900">
                  NXX315 cần bạn góp ý
                </p>
                <p className="mt-1 text-[12px] leading-4 text-slate-600">
                  Mỗi đề xuất của bạn là động lực để NXX315 cải thiện từng chút
                  một.
                </p>
                <Link
                  to="/contact"
                  className="mt-3 inline-flex items-center gap-1 text-[13px] font-bold text-sky-600"
                >
                  Khám phá ngay
                  <ArrowRight size={14} strokeWidth={2.6} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================== */}
      {/* ANIMATION */}
      {/* ============================================== */}
      <style>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-10deg); }
        }
        .animate-wave {
          display: inline-block;
          animation: wave 1.5s ease-in-out infinite;
          transform-origin: 70% 70%;
        }
      `}</style>
    </div>
  );
}
