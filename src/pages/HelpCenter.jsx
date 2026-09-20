import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HelpCircle,
  User,
  Coins,
  Gift,
  Shield,
  Lock,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  History as HistoryIcon,
  MessageCircle,
  Gamepad2,
  Wallet,
  Package,
  Bug,
  MoreHorizontal,
  Bot,
  Clock,
  Headphones,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";

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
        a: "Không được sử dụng bot, script hoặc công cụ tự động trái phép để tạo lợi ích trên hệ thống. Những hoạt động có dấu hiệu gian lận có thể bị từ chối hoặc xử lý theo Chính sách chống gian lận.",
      },
      {
        q: "Xu của tôi bị trừ thì sao?",
        a: "Xu có thể bị trừ khi: Bạn thực hiện đổi thưởng, giao dịch được điều chỉnh, hệ thống phát hiện xu được cộng không hợp lệ, hoặc xu/điểm liên quan đến hành vi gian lận bị thu hồi. Nếu cho rằng số dư bị trừ sai, hãy liên hệ hỗ trợ.",
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
        a: "Tùy thời điểm, NXX315 Studio Rewards có thể cung cấp: Quân Huy, Mã/code Robux, và các phần thưởng khác được công bố trên hệ thống.",
      },
      {
        q: "Đổi thưởng mất bao lâu?",
        a: "Thời gian xử lý phụ thuộc vào loại phần thưởng và tình trạng hệ thống. Bạn có thể kiểm tra trạng thái yêu cầu trong lịch sử đổi thưởng nếu tính năng này được cung cấp.",
      },
      {
        q: "Tại sao yêu cầu đổi thưởng của tôi bị từ chối?",
        a: "Một yêu cầu có thể bị từ chối nếu: Tài khoản vi phạm quy định, có dấu hiệu gian lận, thông tin nhận thưởng không chính xác, phần thưởng không còn khả dụng, hoặc yêu cầu gặp lỗi cần xác minh thêm.",
      },
      {
        q: "Tôi nhập sai thông tin nhận thưởng thì sao?",
        a: "Hãy liên hệ hỗ trợ càng sớm càng tốt. NXX315 Studio Rewards không đảm bảo có thể sửa hoặc hoàn lại phần thưởng nếu thông tin sai đã được xử lý thành công.",
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
        a: "Không. Quy định của hệ thống là một người dùng chỉ một tài khoản, bất kể người dùng đang sử dụng Wi-Fi, 4G hay 5G.",
      },
      {
        q: "Tôi phát hiện lỗi thì nên làm gì?",
        a: "Hãy báo lỗi cho NXX315 Studio Rewards. Không cố tình khai thác lỗi để nhận xu, điểm hoặc phần thưởng.",
      },
      {
        q: "Tài khoản của tôi bị khóa do nhầm lẫn thì sao?",
        a: "Bạn có thể liên hệ hỗ trợ để yêu cầu xem xét. NXX315 Studio Rewards có thể yêu cầu thông tin cần thiết để kiểm tra trường hợp của bạn.",
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
        q: "NXX315 Studio Rewards có yêu cầu mật khẩu của tôi không?",
        a: "NXX315 Studio Rewards sẽ KHÔNG yêu cầu bạn gửi: Mật khẩu, mã xác thực đăng nhập, mã khôi phục tài khoản, hoặc thông tin bảo mật không cần thiết. Nếu một người tự xưng là nhân viên yêu cầu những thông tin trên, hãy ngừng trao đổi và liên hệ qua kênh chính thức.",
      },
    ],
  },
];

// =====================================================
// CATEGORY GRID (Trợ giúp theo chủ đề)
// =====================================================
const TOPIC_CATEGORIES = [
  {
    id: "start",
    icon: Gamepad2,
    title: "Mới bắt đầu",
    color: "#FE2C55",
    link: "/help",
  },
  {
    id: "promo",
    icon: Gift,
    title: "Ưu đãi và Quà của tôi",
    color: "#8B5CF6",
    link: "/tasks",
  },
  {
    id: "bank",
    icon: Wallet,
    title: "Ngân hàng và Nguồn tiền",
    color: "#10B981",
    link: "/wallet",
  },
  {
    id: "order",
    icon: Package,
    title: "Đơn hàng và Giao dịch",
    color: "#FFB800",
    link: "/history",
  },
  {
    id: "bug",
    icon: Bug,
    title: "Báo lỗi",
    color: "#EF4444",
    link: "/support",
  },
  {
    id: "other",
    icon: MoreHorizontal,
    title: "Chủ đề khác",
    color: "#6B7280",
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

function getHistoryIcon(order) {
  const packageId = String(order?.package_id || "").toLowerCase();
  if (packageId.includes("roblox")) return "🎮";
  if (packageId.includes("pubg")) return "🔫";
  if (packageId.includes("freefire")) return "🔥";
  if (packageId.includes("lienquan")) return "⚔️";
  if (packageId.includes("playtogether")) return "🐰";
  if (packageId.includes("fcmobile")) return "⚽";
  if (packageId.includes("valorant")) return "🎯";
  return "💳";
        }
export default function HelpCenter() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

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
          .limit(2);

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

  // Filter FAQ theo từ khóa
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

  return (
    <div className="min-h-screen bg-[#f8f8f8] pb-24 text-slate-900">
      {/* HEADER */}
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-black/[0.06] bg-white/95 px-4 py-3 backdrop-blur-xl">
        <button
          onClick={() => navigate(-1)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-900"
        >
          <ChevronDown size={18} className="rotate-90" strokeWidth={2.4} />
        </button>
        <h1 className="flex-1 text-[15px] font-extrabold tracking-[-0.02em] text-[#161823]">
          Trung tâm Trợ giúp
        </h1>
        <Link
          to="/"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700"
        >
          <svg
            width="16"
            height="16"
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

      {/* HERO — Chào + Mascot */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#FE2C55]/10 via-pink-50 to-[#25F4EE]/10 px-4 pb-5 pt-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="flex items-center gap-2 text-2xl font-black tracking-[-0.03em] text-[#161823]">
                Chào bạn{" "}
                <span className="inline-block animate-wave text-2xl">👋</span>
              </h2>
              <p className="mt-1 text-[14px] font-semibold leading-5 text-slate-700">
                NXX315 có thể giúp gì cho bạn?
              </p>
            </div>

            {/* Mascot placeholder - thay avt sau */}
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FE2C55] to-[#25F4EE] shadow-[0_10px_30px_rgba(254,44,85,0.25)]">
              <Bot size={36} className="text-white" strokeWidth={2.2} />
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm shadow-md">
                ✨
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH + HISTORY */}
      <div className="px-4">
        <div className="mx-auto max-w-3xl -mt-3 flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-black/[0.06] bg-white px-4 py-3 shadow-sm">
            <Search size={18} className="shrink-0 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm vấn đề của bạn tại đây"
              className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-slate-400"
            />
          </div>
          <Link
            to="/history"
            className="flex shrink-0 flex-col items-center justify-center rounded-2xl bg-white px-3 py-2 text-[10px] font-bold text-[#FE2C55] shadow-sm"
          >
            <HistoryIcon size={18} strokeWidth={2.4} />
            <span className="mt-0.5">Lịch sử</span>
          </Link>
        </div>
      </div>

      {/* CARD HỖ TRỢ TRỰC TUYẾN */}
      <div className="px-4 pt-4">
        <div className="mx-auto max-w-3xl">
          <div className="relative overflow-hidden rounded-[20px] border border-black/[0.05] bg-gradient-to-br from-[#FE2C55] via-[#FE2C55] to-[#ff6b9d] p-5 shadow-[0_10px_30px_rgba(254,44,85,0.2)]">
            {/* Decorative circles */}
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-12 -left-6 h-40 w-40 rounded-full bg-white/5" />

            <div className="relative flex items-center gap-4">
              {/* Icon */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Headphones size={28} className="text-white" strokeWidth={2.2} />
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-black uppercase tracking-wide text-white">
                  Hỗ trợ trực tuyến
                </p>
                <p className="mt-0.5 text-[13px] text-white/90">
                  Trả lời mọi câu hỏi của bạn 24/7
                </p>
              </div>
            </div>

            {/* Button */}
            <Link
              to="/support"
              className="relative mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-[14px] font-extrabold text-[#FE2C55] shadow-md transition active:scale-[0.98]"
            >
              <MessageCircle size={18} strokeWidth={2.4} />
              Chat với NXX315
            </Link>
          </div>
        </div>
      </div>
                {/* SECTION: THẮC MẮC VỀ GIAO DỊCH */}
      {recentOrders.length > 0 && (
        <section className="pt-6">
          <div className="mx-auto max-w-3xl px-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[16px] font-black text-[#161823]">
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
                    className="flex w-[280px] shrink-0 flex-col gap-2.5 rounded-[16px] border border-black/[0.06] bg-white p-3.5 shadow-sm transition active:scale-[0.99]"
                  >
                    {/* Top: icon + info */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-2xl">
                        {getHistoryIcon(order)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-bold text-slate-800">
                          Chuyển đến NXX315 Studio
                        </p>
                        <p className="truncate text-[11px] text-slate-500">
                          {formatHistoryDate(order.created_at)}
                        </p>
                        <p className="truncate text-[11px] font-medium text-sky-600">
                          Mã giao dịch: {String(order.id).slice(0, 12)}
                        </p>
                      </div>
                    </div>

                    {/* Bottom: status + amount */}
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

      {/* SECTION: TRỢ GIÚP THEO CHỦ ĐỀ */}
      <section className="pt-6">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[16px] font-black text-[#161823]">
              Trợ giúp theo chủ đề
            </h3>
            <button
              onClick={() => {
                const el = document.getElementById("faq-list");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-[13px] font-bold text-[#FE2C55]"
            >
              Xem tất cả
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {TOPIC_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  to={cat.link}
                  className="flex flex-col items-center gap-2 rounded-[16px] border border-black/[0.05] bg-white p-3 text-center shadow-sm transition hover:shadow-md active:scale-[0.97]"
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${cat.color}15` }}
                  >
                    <Icon
                      size={22}
                      style={{ color: cat.color }}
                      strokeWidth={2.2}
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

      {/* SECTION: FAQ */}
      <section id="faq-list" className="pt-6">
        <div className="mx-auto max-w-3xl px-4">
          <h3 className="mb-3 text-[16px] font-black text-[#161823]">
            Câu hỏi thường gặp
          </h3>

          {filteredFaq.length === 0 ? (
            <div className="rounded-[16px] border border-black/[0.06] bg-white py-12 text-center">
              <Search size={32} className="mx-auto mb-3 text-slate-300" />
              <p className="text-[14px] font-bold text-slate-700">
                Không tìm thấy câu hỏi phù hợp
              </p>
              <p className="mt-1 text-[12px] text-slate-500">
                Thử từ khóa khác hoặc chat với AI
              </p>
              <Link
                to="/support"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#FE2C55] px-5 py-2 text-[13px] font-bold text-white"
              >
                <MessageCircle size={14} strokeWidth={2.4} />
                Chat với AI
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredFaq.map((section) => {
                const Icon = section.icon;
                const isOpen = openId === section.id;

                return (
                  <div
                    key={section.id}
                    className="overflow-hidden rounded-[16px] border border-black/[0.06] bg-white shadow-sm"
                  >
                    <button
                      onClick={() => toggle(section.id)}
                      className="flex w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-slate-50"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                          style={{ backgroundColor: `${section.color}15` }}
                        >
                          <Icon
                            size={16}
                            style={{ color: section.color }}
                            strokeWidth={2.2}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-bold text-slate-900">
                            {section.title}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {section.questions.length} câu hỏi
                          </p>
                        </div>
                      </div>
                      {isOpen ? (
                        <ChevronUp
                          size={18}
                          className="shrink-0 text-slate-400"
                          strokeWidth={2.4}
                        />
                      ) : (
                        <ChevronDown
                          size={18}
                          className="shrink-0 text-slate-400"
                          strokeWidth={2.4}
                        />
                      )}
                    </button>

                    {isOpen && (
                      <div className="border-t border-slate-100">
                        {section.questions.map((item, idx) => (
                          <div
                            key={idx}
                            className="border-b border-slate-50 p-4 last:border-0"
                          >
                            <p className="text-[13px] font-bold text-slate-900">
                              {item.q}
                            </p>
                            <p className="mt-1.5 text-[13px] leading-5 text-slate-600">
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
          )}
        </div>
      </section>

      {/* CTA: Liên hệ hỗ trợ */}
      <section className="px-4 pt-6 pb-4">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[20px] border-2 border-[#FE2C55]/20 bg-gradient-to-b from-[#FE2C55]/[0.04] to-white p-5 text-center">
            <p className="text-3xl">📮</p>
            <h3 className="mt-2 text-[16px] font-black text-[#161823]">
              Không tìm thấy câu trả lời?
            </h3>
            <p className="mt-1.5 text-[13px] leading-5 text-slate-600">
              Đừng lo, hãy chat với AI của NXX315 hoặc liên hệ nhân viên hỗ trợ
              để được giúp đỡ.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Link
                to="/support"
                className="inline-flex items-center gap-2 rounded-full bg-[#FE2C55] px-5 py-2.5 text-[13px] font-bold text-white shadow-md transition active:scale-[0.98]"
              >
                <MessageCircle size={14} strokeWidth={2.4} />
                Chat với AI
              </Link>
              <a
                href="https://zalo.me/0865245988"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <Headphones size={14} strokeWidth={2.4} />
                Gặp nhân viên
              </a>
            </div>
          </div>
        </div>
      </section>

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
