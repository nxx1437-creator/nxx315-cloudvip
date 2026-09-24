import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Loader2,
  Bot,
  Headphones,
  Smile,
  User,
  CreditCard,
  Package,
  Bug,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Plus,
  FileText,
  RefreshCw,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  LogIn,
  Lightbulb,
  Image as ImageIcon,
  Sparkles,
  HelpCircle,
  KeyRound,
  ShieldCheck,
  Mail,
  RotateCcw,
  Receipt,
  Search,
  XCircle,
  Truck,
  Globe,
  Smartphone,
  ImagePlus,
  Handshake,
  AlertTriangle,
  Camera,
  Edit,
  History,
  X,
  Menu,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";

import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { supabase } from "../lib/supabaseClient.js";

// 👇 Avatar Bot cố định (admin set, user không đổi được)
const BOT_AVATAR_URL =
  "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/avatar.png";

const SUPPORT = {
  zalo: "0865245988",
  zaloUrl: "https://zalo.me/0865245988",
  email: "nxx315hub@gmail.com",
  hours: "12:00 - 13:00 (T2 - CN)",
};

const AI_ENDPOINT =
  import.meta.env.VITE_AI_SUPPORT_URL ||
  "https://rwglwovohbyqmbbzdvdj.supabase.co/functions/v1/ai-support-reply";

const CATEGORIES = [
  { id: "account", label: "Tài khoản", icon: User, color: "#FE2C55" },
  { id: "payment", label: "Thanh toán", icon: CreditCard, color: "#FF6B00" },
  { id: "order", label: "Đơn hàng", icon: Package, color: "#00C2FF" },
  { id: "bug", label: "Báo lỗi", icon: Bug, color: "#8B5CF6" },
  { id: "other", label: "Khác", icon: MoreHorizontal, color: "#6B7280" },
];

const ICON_MAP = {
  HelpCircle, KeyRound, ShieldCheck, Mail, CreditCard, RotateCcw,
  Receipt, Search, XCircle, Truck, Globe, Smartphone, ImagePlus,
  Handshake, AlertTriangle, User, Package, Bug,
};

const GREETING_BY_CATEGORY = {
  account: `Chào bạn. Mình là trợ lý AI của NXX315 Studio.\n\nVề tài khoản, bạn gặp vấn đề gì cụ thể?`,
  payment: `Chào bạn. Mình là trợ lý AI của NXX315 Studio.\n\nVề thanh toán, bạn cần hỗ trợ gì?`,
  order: `Chào bạn. Mình là trợ lý AI của NXX315 Studio.\n\nVề đơn hàng, bạn muốn kiểm tra đơn nào? Cho mình mã đơn (RBX-xxxxx) nhé.`,
  bug: `Chào bạn. Mình là trợ lý AI của NXX315 Studio.\n\nBạn gặp lỗi gì? Mô tả hoặc gửi ảnh màn hình giúp mình nhé.`,
  other: `Chào bạn. Mình là trợ lý AI của NXX315 Studio.\n\nBạn cần hỗ trợ vấn đề gì?`,
};

const SUGGESTIONS_BY_CATEGORY = {
  account: [
    "Tôi quên mật khẩu, giờ phải làm sao?",
    "Tôi không nhận được mã xác minh",
    "Tôi muốn đổi email đăng ký",
    "Tài khoản của tôi có bị khóa không?",
  ],
  payment: [
    "Tôi đã chuyển khoản nhưng chưa nhận Coin",
    "Tôi nạp sai số tiền, có hoàn lại không?",
    "Tôi muốn đổi phương thức thanh toán",
    "Tôi muốn yêu cầu hoàn tiền",
  ],
  order: [
    "Đơn RBX-000138 đang ở trạng thái nào?",
    "Tôi nạp sai ID game, xử lý sao?",
    "Tôi chưa nhận được hàng",
    "Tôi muốn hủy đơn đang chờ",
  ],
  bug: [
    "Trang web bị lỗi khi tôi nạp game",
    "Tôi không thanh toán được",
    "Nút xác nhận không hoạt động",
    "Tôi gửi ảnh lỗi được không?",
  ],
  other: [
    "Tôi muốn hợp tác làm đại lý",
    "Tôi muốn báo cáo tài khoản vi phạm",
    "Tôi có câu hỏi khác",
  ],
};

const SUB_CARD_PROMPTS = {
  "Khôi phục tài khoản": {
    greeting: `Chào bạn. Mình là trợ lý AI của NXX315 Studio.\n\nBạn đang muốn khôi phục tài khoản. Bạn gặp trường hợp nào?\n• Quên mật khẩu, không đăng nhập được\n• Mất quyền truy cập email\n• Tài khoản bị khóa\n\nMô tả cụ thể giúp mình nhé.`,
    suggestions: [
      "Tôi quên mật khẩu, không đăng nhập được",
      "Tôi mất email đã đăng ký",
      "Tài khoản tôi bị khóa",
      "Tôi không nhận được mã xác minh",
    ],
  },
  "Trung tâm an toàn": {
    greeting: `Chào bạn. Mình là trợ lý AI của NXX315 Studio.\n\nVề bảo mật tài khoản, bạn cần hỗ trợ gì?`,
    suggestions: [
      "Làm sao để bảo mật tài khoản?",
      "Tôi nghi ngờ tài khoản bị xâm nhập",
      "Tôi muốn bật xác minh 2 bước",
      "Tôi muốn đổi mật khẩu",
    ],
  },
  "Đổi email / SĐT": {
    greeting: `Chào bạn. Mình là trợ lý AI của NXX315 Studio.\n\nBạn muốn đổi email hay số điện thoại đăng ký?`,
    suggestions: [
      "Tôi muốn đổi email đăng ký",
      "Tôi muốn đổi số điện thoại",
      "Tôi quên email cũ rồi",
      "Đổi email có mất dữ liệu không?",
    ],
  },
  "Phương thức thanh toán": {
    greeting: `Chào bạn. Mình là trợ lý AI của NXX315 Studio.\n\nBạn cần hỗ trợ gì về phương thức thanh toán?`,
    suggestions: [
      "Có những phương thức thanh toán nào?",
      "Tôi muốn đổi phương thức thanh toán",
      "Tôi chuyển khoản bị sai nội dung",
      "Tôi không nhận được tiền sau khi chuyển",
    ],
  },
  "Hoàn tiền": {
    greeting: `Chào bạn. Mình là trợ lý AI của NXX315 Studio.\n\nBạn muốn yêu cầu hoàn tiền cho đơn nào? Cho mình mã đơn (RBX-xxxxx) nhé.`,
    suggestions: [
      "Đơn của tôi bị lỗi, muốn hoàn tiền",
      "Tôi nạp trùng 2 lần",
      "Bao lâu thì nhận được tiền hoàn?",
      "Điều kiện hoàn tiền là gì?",
    ],
  },
  "Lịch sử giao dịch": {
    greeting: `Chào bạn. Mình là trợ lý AI của NXX315 Studio.\n\nBạn muốn xem lịch sử giao dịch hay kiểm tra đơn hàng?`,
    suggestions: [
      "Tôi muốn xem lịch sử nạp tiền",
      "Tôi không thấy giao dịch gần đây",
      "Đơn RBX-000138 của tôi đâu rồi?",
      "Tôi muốn xuất hoá đơn",
    ],
  },
  "Tra cứu đơn hàng": {
    greeting: `Chào bạn. Mình là trợ lý AI của NXX315 Studio.\n\nBạn muốn tra cứu đơn nào? Cho mình mã đơn (RBX-xxxxx) nhé.`,
    suggestions: [
      "Đơn RBX-000138 đang ở trạng thái nào?",
      "Cho mình xem đơn gần đây nhất",
      "Đơn của tôi sao chưa xử lý?",
      "Đơn của tôi báo lỗi",
    ],
  },
  "Hủy đơn": {
    greeting: `Chào bạn. Mình là trợ lý AI của NXX315 Studio.\n\nBạn muốn hủy đơn nào? Cho mình mã đơn (RBX-xxxxx) nhé.`,
    suggestions: [
      "Tôi muốn hủy đơn RBX-000138",
      "Đơn đang xử lý có hủy được không?",
      "Hủy đơn có được hoàn tiền?",
      "Tôi nạp sai ID, muốn hủy",
    ],
  },
  "Theo dõi đơn": {
    greeting: `Chào bạn. Mình là trợ lý AI của NXX315 Studio.\n\nBạn muốn theo dõi đơn nào? Cho mình mã đơn (RBX-xxxxx) nhé.`,
    suggestions: [
      "Đơn của tôi bao giờ xử lý xong?",
      "Đơn RBX-000138 đang ở đâu?",
      "Tại sao đơn chưa được xử lý?",
      "Đơn của tôi có bị lỗi không?",
    ],
  },
  "Lỗi website": {
    greeting: `Chào bạn. Mình là trợ lý AI của NXX315 Studio.\n\nBạn đang gặp lỗi gì trên website? Mô tả hoặc gửi ảnh màn hình giúp mình nhé.`,
    suggestions: [
      "Trang web bị trắng, không load được",
      "Nút bấm không phản hồi",
      "Tôi không đăng nhập được",
      "Giao diện bị lỗi hiển thị",
    ],
  },
  "Lỗi ứng dụng": {
    greeting: `Chào bạn. Mình là trợ lý AI của NXX315 Studio.\n\nBạn gặp lỗi gì trên ứng dụng? Mô tả hoặc gửi ảnh màn hình giúp mình nhé.`,
    suggestions: [
      "App bị văng khi đang dùng",
      "App không load được dữ liệu",
      "Không nhận được thông báo",
      "App chạy chậm, lag",
    ],
  },
  "Gửi ảnh lỗi": {
    greeting: `Chào bạn. Mình là trợ lý AI của NXX315 Studio.\n\nBạn gửi ảnh màn hình lỗi + mô tả giúp mình nhé. Mình sẽ phân tích và hướng dẫn bạn khắc phục.`,
    suggestions: [
      "Tôi muốn gửi ảnh lỗi",
      "Ảnh chụp màn hình thanh toán",
      "Ảnh đơn hàng bị lỗi",
      "Ảnh tin nhắn lỗi từ hệ thống",
    ],
  },
};

function getSubCardPrompt(title) {
  return SUB_CARD_PROMPTS[title] || null;
}

const NO_CHAT_SUB_CARDS = [
  "Hợp tác / Đại lý",
  "Báo cáo vi phạm",
  "Câu hỏi chung",
];

function isNoChatSubCard(title) {
  return NO_CHAT_SUB_CARDS.includes(title);
}

function getGreeting(category) {
  return (
    GREETING_BY_CATEGORY[category] ||
    `Chào bạn. Mình là trợ lý AI của NXX315 Studio.\n\nMình có thể giúp gì cho bạn hôm nay?`
  );
}

function getSuggestions(category) {
  return SUGGESTIONS_BY_CATEGORY[category] || SUGGESTIONS_BY_CATEGORY.other;
}

function shouldShowLoginButton(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return (
    lower.includes("mật khẩu") ||
    lower.includes("đăng nhập") ||
    lower.includes("đăng ký") ||
    lower.includes("xác minh") ||
    lower.includes("verify") ||
    lower.includes("password") ||
    lower.includes("login")
  );
}

// Format thời gian cho lịch sử chat
function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return date.toLocaleDateString("vi-VN");
  }
export default function Support() {
  const [view, setView] = useState("home");
  const [user, setUser] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    loadUser();
  }, []);

  const openHelp = (category) => {
    setSelectedCategory(category);
    setView("help");
  };

  // 👇 Hàm tạo cuộc trò chuyện mới (có thể xóa conversation cũ hoặc giữ lại)
  const startAIChat = async (category, subCardTitle = null) => {
  if (!user?.id) {
    alert("Bạn chưa đăng nhập");
    return;
  }

  try {
    const { data: conv, error: convError } = await supabase
      .from("support_conversations")
      .insert({
        user_id: user.id,
        title: subCardTitle
          ? subCardTitle
          : category
          ? `Hỗ trợ ${CATEGORIES.find((c) => c.id === category)?.label}`
          : "Cuộc trò chuyện mới",
        category,
        status: "ai",
      })
      .select()
      .single();

    if (convError) {
      alert("LỖI TẠO CONV: " + convError.message);
      return;
    }

    alert("TẠO CONV OK: " + conv.id);

    const subPrompt = subCardTitle ? getSubCardPrompt(subCardTitle) : null;
    const greeting = subPrompt?.greeting || getGreeting(category);
    const suggestions = subPrompt?.suggestions || getSuggestions(category);

    const { error: msgError } = await supabase.from("support_messages").insert({
      conversation_id: conv.id,
      user_id: user.id,
      message: greeting,
      sender_type: "ai",
      suggestions: suggestions,
    });

    if (msgError) {
      alert("LỖI TẠO MESSAGE: " + msgError.message);
      return;
    }

    setConversation(conv);
    setView("chat");
  } catch (error) {
    alert("LỖI KHÔNG XÁC ĐỊNH: " + error.message);
  }
};

  // 👇 Hàm mở 1 conversation cũ từ lịch sử
  const openConversation = (conv) => {
    setSelectedCategory(conv.category || null);
    setConversation(conv);
    setView("chat");
  };

  return (
    <div className="min-h-screen bg-white pb-24 text-slate-900">
      <TopHeader />
      <main className="mx-auto w-full max-w-2xl">
        {view === "home" && <HomeView onOpenHelp={openHelp} />}
        {view === "help" && (
          <HelpView
            category={selectedCategory}
            onBack={() => setView("home")}
            onStartChat={() => startAIChat(selectedCategory)}
            onStartChatWith={(subCardTitle) =>
              startAIChat(selectedCategory, subCardTitle)
            }
          />
        )}
        {view === "chat" && conversation && (
          <ChatView
            conversation={conversation}
            user={user}
            category={selectedCategory}
            onBack={() => setView("help")}
            onNewChat={() => startAIChat(selectedCategory)}
            onOpenConversation={openConversation}
          />
        )}
      </main>
      <BottomNav />
    </div>
  );
}

function HomeView({ onOpenHelp }) {
  return (
    <div className="min-h-[calc(100vh-72px)] bg-white">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-black/[0.06] bg-white/95 px-4 py-3 backdrop-blur-xl">
        <button
          onClick={() => window.history.back()}
          className="flex h-8 w-8 items-center justify-center text-[#161823]"
        >
          <ArrowLeft size={22} strokeWidth={2.2} />
        </button>
        <h1 className="text-[16px] font-bold tracking-[-0.01em] text-[#161823]">
          Bộ phận Hỗ trợ của NXX315
        </h1>
        <button className="flex h-8 w-8 items-center justify-center text-[#161823]">
          <FileText size={20} strokeWidth={2} />
        </button>
      </div>

      <div className="px-5 pb-6 pt-8">
        <h2 className="text-center text-[22px] font-extrabold leading-[1.3] tracking-[-0.02em] text-[#161823]">
          Chúng tôi sẵn sàng hỗ trợ!
          <br />
          Chọn loại vấn đề.
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => onOpenHelp(cat.id)}
              className="flex items-center gap-3 rounded-[18px] border border-black/[0.06] bg-[#f8f8f8] px-4 py-5 text-left transition duration-150 hover:border-black/[0.12] hover:bg-[#f2f2f2] active:scale-[0.98]"
            >
              <Icon size={22} style={{ color: cat.color }} strokeWidth={2} />
              <span className="text-[14.5px] font-semibold text-[#161823]">
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="px-5 pt-5">
        <p className="mx-auto max-w-[340px] text-center text-[12.5px] leading-5 text-[#8a8d93]">
          Có thể câu trả lời là do AI tạo, do đó có thể sẽ có sai sót.{" "}
          <button className="font-medium text-sky-600">Tìm hiểu thêm</button>
        </p>
      </div>

      <div className="mx-4 my-5 border-t border-slate-100" />

      <div className="px-4 pb-7">
        <a
          href={SUPPORT.zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-between rounded-[18px] border border-[#0068FF]/25 bg-[#0068FF]/[0.04] px-4 py-4 transition hover:bg-[#0068FF]/[0.08] active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <Headphones size={22} className="text-[#0068FF]" strokeWidth={2} />
            <div className="text-left">
              <p className="text-[14.5px] font-semibold text-[#0068FF]">
                Gặp nhân viên qua Zalo
              </p>
              <p className="mt-0.5 text-[11.5px] text-[#0068FF]/70">
                Hỗ trợ {SUPPORT.hours}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-[#0068FF]" />
        </a>
      </div>
    </div>
  );
}

function HelpView({ category, onBack, onStartChat, onStartChatWith }) {
  const [subCards, setSubCards] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  const cat = CATEGORIES.find((c) => c.id === category);

  useEffect(() => {
    loadData();
  }, [category]);

  const loadData = async () => {
    if (!category) return;
    setLoading(true);
    try {
      const [cardsRes, faqsRes] = await Promise.all([
        supabase
          .from("support_sub_cards")
          .select("*")
          .eq("category", category)
          .eq("is_active", true)
          .order("order", { ascending: true }),
        supabase
          .from("support_faqs")
          .select("*")
          .eq("category", category)
          .eq("is_active", true)
          .order("order", { ascending: true }),
      ]);

      if (cardsRes.error) console.error("sub_cards error:", cardsRes.error);
      if (faqsRes.error) console.error("faqs error:", faqsRes.error);

      setSubCards(cardsRes.data || []);
      setFaqs(faqsRes.data || []);
    } catch (err) {
      console.error("Load help error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-white pb-32">
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-black/[0.06] bg-white/95 px-4 py-3 backdrop-blur-xl">
        <button
          onClick={onBack}
          className="flex h-8 w-8 shrink-0 items-center justify-center text-[#161823]"
        >
          <ArrowLeft size={22} strokeWidth={2.2} />
        </button>
        <h1 className="flex-1 text-[15px] font-bold tracking-[-0.01em] text-[#161823]">
          {cat?.label || "Hỗ trợ"}
        </h1>
      </div>

      <div className="px-5 pb-4 pt-6">
        <h2 className="text-[26px] font-extrabold leading-[1.2] tracking-[-0.03em] text-[#161823]">
          Chúng tôi có thể giúp gì?
        </h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={22} className="animate-spin text-slate-300" />
        </div>
      ) : (
        <>
          {subCards.length > 0 && (
            <div className="mb-6">
              <div
                className="flex gap-3 overflow-x-auto px-5 pb-2"
                style={{ scrollbarWidth: "none" }}
              >
                {subCards.map((card) => {
                  const Icon = ICON_MAP[card.icon] || HelpCircle;
                  const isNoChat = isNoChatSubCard(card.title);

                  return (
                    <button
                      key={card.id}
                      onClick={() => {
                        if (isNoChat) {
                          document
                            .querySelector("#help-faq-section")
                            ?.scrollIntoView({ behavior: "smooth" });
                        } else {
                          onStartChatWith(card.title);
                        }
                      }}
                      className="flex w-[140px] shrink-0 flex-col items-start gap-3 rounded-[18px] bg-[#f5f5f5] p-4 text-left transition active:scale-[0.97]"
                    >
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-[10px]"
                        style={{ backgroundColor: `${card.color}22` }}
                      >
                        <Icon
                          size={20}
                          style={{ color: card.color }}
                          strokeWidth={2.2}
                        />
                      </div>
                      <span className="text-[13.5px] font-semibold leading-tight text-[#161823]">
                        {card.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {faqs.length > 0 ? (
            <div id="help-faq-section" className="px-5">
              <h3 className="mb-1 text-[20px] font-extrabold tracking-[-0.02em] text-[#161823]">
                Câu hỏi thường gặp
              </h3>
              <div>
                {faqs.map((faq) => {
                  const isOpen = openId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="border-b border-black/[0.06] last:border-b-0"
                    >
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="flex w-full items-center gap-3 py-4 text-left transition active:opacity-60"
                      >
                        <span className="flex-1 text-[15px] font-medium leading-6 text-[#161823]">
                          {faq.question}
                        </span>
                        <ChevronRight
                          size={18}
                          className={`shrink-0 text-[#8a8d93] transition-transform duration-200 ${
                            isOpen ? "rotate-90" : ""
                          }`}
                          strokeWidth={2.2}
                        />
                      </button>
                      {isOpen && (
                        <div className="pb-4">
                          <p className="whitespace-pre-wrap text-[14px] leading-6 text-[#4a4d54]">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <HelpCircle
                size={36}
                className="mx-auto mb-3 text-slate-300"
                strokeWidth={1.8}
              />
              <p className="text-[14px] font-semibold text-[#161823]">
                Chưa có hướng dẫn cho mục này
              </p>
              <p className="mt-1 text-[12.5px] text-[#8a8d93]">
                Bạn có thể chat với AI để được hỗ trợ trực tiếp.
              </p>
            </div>
          )}
        </>
      )}

      <div className="fixed bottom-20 left-1/2 z-30 w-full max-w-2xl -translate-x-1/2 px-4">
        <button
          onClick={onStartChat}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#FE2C55] px-5 py-3.5 text-[15px] font-bold text-white shadow-[0_8px_24px_rgba(254,44,85,0.35)] transition active:scale-[0.98]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Trò chuyện với chúng tôi
        </button>
      </div>
    </div>
  );
}

function StatusBubble({ message }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="px-1 py-0.5">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-[14px] border border-black/[0.06] bg-white px-3.5 py-2.5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition hover:bg-slate-50 active:scale-[0.99]"
      >
        <Lightbulb
          size={16}
          className="shrink-0 text-slate-500"
          strokeWidth={2.2}
        />
        <span className="flex-1 truncate text-[13px] font-medium text-slate-700">
          {message.message}
        </span>
        <ChevronRight
          size={16}
          className={`shrink-0 text-slate-400 transition-transform ${
            expanded ? "rotate-90" : ""
          }`}
          strokeWidth={2.2}
        />
      </button>

      {expanded && (
        <div className="mt-1.5 rounded-[12px] border border-black/[0.05] bg-slate-50 px-3.5 py-2.5 text-[12px] leading-5 text-slate-600">
          AI đang xử lý yêu cầu của bạn. Quá trình này có thể mất vài giây.
        </div>
      )}
    </div>
  );
                   }
function WelcomeScreen({ onCardClick }) {
  const greetingCards = [
    {
      id: 1,
      title: "Kiểm tra tình trạng đơn hàng",
      icon: "📦",
      bg: "bg-blue-50",
      prompt: "Cho tôi kiểm tra tình trạng đơn hàng RBX-000138",
    },
    {
      id: 2,
      title: "Hướng dẫn nạp tiền / thanh toán",
      icon: "💳",
      bg: "bg-green-50",
      prompt: "Hướng dẫn tôi cách nạp tiền vào tài khoản",
    },
    {
      id: 3,
      title: "Báo lỗi hoặc sự cố kỹ thuật",
      icon: "🛠️",
      bg: "bg-orange-50",
      prompt: "Tôi đang gặp lỗi không đăng nhập được, cần hỗ trợ",
    },
  ];

  const suggestedQuestions = [
    "Tôi quên mật khẩu, làm sao để khôi phục?",
    "Đơn hàng của tôi chưa được xử lý",
    "Tôi muốn yêu cầu hoàn tiền",
    "Làm sao để liên hệ nhân viên hỗ trợ?",
  ];

  return (
    <div className="flex-1 overflow-y-auto px-5 pb-6 pt-8">
      <div className="text-center">
        {/* AVATAR BOT - CỐ ĐỊNH, KHÔNG CHO ĐỔI */}
        <div className="mx-auto mb-4 h-20 w-20">
          <img
            src={BOT_AVATAR_URL}
            alt="Bot Avatar"
            className="h-20 w-20 rounded-full border-2 border-white object-cover shadow-md"
          />
        </div>

        <h2 className="text-[22px] font-extrabold leading-[1.3] tracking-[-0.02em] text-[#161823]">
          Xin chào, tôi là trợ lý AI
          <br />
          của NXX315 Studio.
        </h2>
        <p className="mt-2 text-[13px] text-[#8a8d93]">
          Tôi có thể giúp bạn kiểm tra đơn hàng, xử lý thanh toán hoặc giải đáp
          thắc mắc.{" "}
          <button className="font-medium text-sky-600">Tìm hiểu thêm</button>
        </p>
      </div>

      {/* Các thẻ gợi ý */}
      <div className="mt-6 space-y-3">
        {greetingCards.map((card) => (
          <button
            key={card.id}
            onClick={() => onCardClick(card.prompt)}
            className="flex w-full items-center gap-4 rounded-[20px] border border-black/[0.06] bg-white p-3 text-left shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition hover:border-black/[0.12] hover:bg-[#fafafa] active:scale-[0.98]"
          >
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${card.bg} text-2xl`}
            >
              {card.icon}
            </div>
            <div className="flex-1">
              <p className="text-[14.5px] font-semibold text-[#161823]">
                {card.title}
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <ArrowRight size={16} strokeWidth={2.4} />
            </div>
          </button>
        ))}
      </div>

      {/* Gợi ý câu hỏi */}
      <div className="mt-8">
        <h3 className="mb-3 text-sm font-bold text-slate-800">
          Bạn cần hỗ trợ gì?
        </h3>
        <div className="space-y-2">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => onCardClick(q)}
              className="flex w-full items-center justify-between rounded-[14px] border border-black/[0.06] bg-[#f8f8f8] px-4 py-3.5 text-left text-[14px] text-[#161823] transition hover:bg-[#f2f2f2] active:scale-[0.99]"
            >
              <span>{q}</span>
              <ArrowRight
                size={16}
                className="shrink-0 text-slate-400"
                strokeWidth={2.2}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-[11px] text-slate-400">
          AI có thể mắc lỗi. Tìm hiểu thêm
        </p>
      </div>
    </div>
  );
}

// 👇 DRAWER LỊCH SỬ TRÒ CHUYỆN (dùng cho nút 3 gạch)
function HistoryDrawer({ open, onClose, userId, currentConvId, onOpenConversation, onNewChat }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && userId) {
      loadConversations();
    }
  }, [open, userId]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("support_conversations")
        .select("id, title, category, created_at, updated_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (err) {
      console.error("Load conversations error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Nhóm theo thời gian
  const groupConversations = () => {
    const now = new Date();
    const groups = { today: [], week: [], older: [] };

    conversations.forEach((conv) => {
      const d = new Date(conv.created_at);
      const diffDay = Math.floor((now - d) / 86400000);
      if (diffDay < 1) groups.today.push(conv);
      else if (diffDay < 7) groups.week.push(conv);
      else groups.older.push(conv);
    });

    return groups;
  };

  const groups = groupConversations();

  const renderGroup = (title, items) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-5">
        <h3 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {title}
        </h3>
        <div className="space-y-0.5">
          {items.map((conv) => (
            <button
              key={conv.id}
              onClick={() => {
                onOpenConversation(conv);
                onClose();
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                conv.id === currentConvId
                  ? "bg-rose-50 text-[#FE2C55]"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <FileText size={16} className="shrink-0 opacity-60" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-medium">
                  {conv.title || "Cuộc trò chuyện"}
                </p>
                <p className="truncate text-[11px] opacity-60">
                  {formatRelativeTime(conv.created_at)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed left-0 top-0 z-50 flex h-full w-[85%] max-w-sm flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
          <h2 className="text-[17px] font-bold text-slate-800">
            Lịch sử trò chuyện
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nút tạo chat mới */}
        <div className="border-b border-slate-100 p-3">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FE2C55] px-4 py-3 text-[14px] font-bold text-white shadow-[0_4px_12px_rgba(254,44,85,0.25)] transition active:scale-[0.98]"
          >
            <Plus size={18} strokeWidth={2.4} />
            Cuộc trò chuyện mới
          </button>
        </div>

        {/* Danh sách */}
        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={20} className="animate-spin text-slate-300" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <History
                size={36}
                className="mx-auto mb-3 text-slate-300"
                strokeWidth={1.5}
              />
              <p className="text-[13px] font-medium text-slate-500">
                Chưa có cuộc trò chuyện nào
              </p>
              <p className="mt-1 text-[11.5px] text-slate-400">
                Bắt đầu chat để lưu lịch sử
              </p>
            </div>
          ) : (
            <>
              {renderGroup("Hôm nay", groups.today)}
              {renderGroup("7 ngày qua", groups.week)}
              {renderGroup("Trước đây", groups.older)}
            </>
          )}
        </div>
      </div>
    </>
  );
}
function ChatView({ conversation, user, category, onBack, onNewChat, onOpenConversation }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const [streamingMsgId, setStreamingMsgId] = useState(null);
  const [streamingText, setStreamingText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [conv, setConv] = useState(conversation);
  const [hiddenSuggestionIds, setHiddenSuggestionIds] = useState([]);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const scrollRef = useRef(null);
  const sentIds = useRef(new Set());
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const scrollToBottom = (smooth = false) => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: smooth ? "smooth" : "auto",
        });
      }
    });
  };

  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom(true);
    }
  }, [messages.length, loading]);

  const runTypewriter = (msg) => {
    setStreamingMsgId(msg.id);
    setStreamingText("");
    let idx = 0;
    const full = msg.message;
    const interval = setInterval(() => {
      idx += 3;
      if (idx >= full.length) {
        setStreamingText(full);
        clearInterval(interval);
        setTimeout(() => {
          setStreamingMsgId(null);
          setStreamingText("");
          scrollToBottom(true);
        }, 100);
      } else {
        setStreamingText(full.slice(0, idx));
      }
    }, 20);
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setMessages(data || []);
      if (data && data.length > 0) {
        setShowWelcome(false);
      }
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setLoading(false);
      setTimeout(() => scrollToBottom(), 100);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [conversation.id]);

  useEffect(() => {
    const channel = supabase
      .channel(`conv-${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const msg = payload.new;
          if (sentIds.current.has(msg.id)) return;

          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;

            if (msg.sender_type === "ai" || msg.sender_type === "system") {
              const withoutStatus = prev.filter(
                (m) => m.sender_type !== "status"
              );
              return [...withoutStatus, msg];
            }

            return [...prev, msg];
          });

          if (msg.sender_type === "ai" && msg.message) {
            runTypewriter(msg);
          } else {
            scrollToBottom(true);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "support_messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const msg = payload.new;
          setMessages((prev) =>
            prev.map((m) => (m.id === msg.id ? { ...m, ...msg } : m))
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "support_messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const removedId = payload.old.id;
          setMessages((prev) => prev.filter((m) => m.id !== removedId));
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [conversation.id]);

  const callAI = async (imageUrl, messageText) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Chưa đăng nhập");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const bodyPayload = {
      conversation_id: conv.id,
      user_message: imageUrl ? "Phân tích ảnh này giúp mình" : messageText,
    };
    if (imageUrl) bodyPayload.image_url = imageUrl;

    const response = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(bodyPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errData = {};
      try {
        errData = await response.json();
      } catch (_) {}
      throw new Error(errData?.error || `AI trả về lỗi ${response.status}`);
    }

    return response.json();
  };

  const sendMessage = async (customText) => {
    const content = (customText || input).trim();
    if (!content || sending || !user?.id) return;

    setSending(true);
    setShowWelcome(false);
    try {
      const { data: userMsg, error } = await supabase
        .from("support_messages")
        .insert({
          conversation_id: conv.id,
          user_id: user.id,
          message: content,
          sender_type: "user",
        })
        .select()
        .single();

      if (error) throw error;
      sentIds.current.add(userMsg.id);

      setMessages((prev) => [
        ...prev.filter((m) => m.sender_type !== "status"),
        userMsg,
      ]);

      setInput("");
      setShowEmoji(false);
      setShowFileMenu(false);
      scrollToBottom(true);

      if (conv.status === "ai") {
        const typingTimer = setTimeout(() => setAiTyping(true), 1500);

        try {
          const data = await callAI(null, content);
          console.log(`[Support AI] Provider: ${data.provider} (${data.model})`);
        } catch (err) {
          console.error("AI error:", err);
          setMessages((prev) => prev.filter((m) => m.sender_type !== "status"));

          const { data: errMsg } = await supabase
            .from("support_messages")
            .insert({
              conversation_id: conv.id,
              user_id: user.id,
              message:
                "Xin lỗi, mình đang gặp sự cố kỹ thuật. Bạn vui lòng thử lại sau hoặc liên hệ Zalo 0865245988 để được hỗ trợ trực tiếp.",
              sender_type: "ai",
              suggestions: [],
            })
            .select()
            .single();
          if (errMsg) {
            sentIds.current.add(errMsg.id);
            setMessages((prev) => [...prev, errMsg]);
            runTypewriter(errMsg);
          }
        } finally {
          clearTimeout(typingTimer);
          setAiTyping(false);
        }
      }
    } catch (error) {
      console.error("Send error:", error);
      alert("Không thể gửi tin nhắn.");
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = async (file) => {
    if (!file || !user?.id || uploading) return;

    setUploading(true);
    setShowFileMenu(false);

    try {
      if (!file.type.startsWith("image/")) {
        alert("Chỉ hỗ trợ file ảnh");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Ảnh không được vượt quá 5MB");
        return;
      }

      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("support-images")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("support-images")
        .getPublicUrl(fileName);

      const publicUrl = urlData?.publicUrl;
      if (!publicUrl) throw new Error("Không lấy được URL ảnh");

      const { data: userMsg, error: msgError } = await supabase
        .from("support_messages")
        .insert({
          conversation_id: conv.id,
          user_id: user.id,
          message: "",
          sender_type: "user",
          image_url: publicUrl,
        })
        .select()
        .single();

      if (msgError) throw msgError;

      sentIds.current.add(userMsg.id);
      setMessages((prev) => [...prev, userMsg]);
      setShowWelcome(false);
      scrollToBottom(true);

      if (conv.status === "ai") {
        const typingTimer = setTimeout(() => setAiTyping(true), 1500);
        try {
          const data = await callAI(publicUrl, null);
          console.log(`[Support AI - image] Provider: ${data.provider} (${data.model})`);
        } catch (err) {
          console.error("AI image error:", err);
          setMessages((prev) => prev.filter((m) => m.sender_type !== "status"));

          const { data: errMsg } = await supabase
            .from("support_messages")
            .insert({
              conversation_id: conv.id,
              user_id: user.id,
              message:
                "Xin lỗi, mình không phân tích được ảnh này. Bạn thử lại sau hoặc liên hệ Zalo 0865245988 để được hỗ trợ.",
              sender_type: "ai",
              suggestions: [],
            })
            .select()
            .single();
          if (errMsg) {
            sentIds.current.add(errMsg.id);
            setMessages((prev) => [...prev, errMsg]);
            runTypewriter(errMsg);
          }
        } finally {
          clearTimeout(typingTimer);
          setAiTyping(false);
        }
      }
    } catch (err) {
      console.error("[upload] error:", err);
      alert("Không thể gửi ảnh. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  const hideAllSuggestions = () => {
    setHiddenSuggestionIds((prev) => {
      const allIds = messages
        .filter((m) => m.suggestions?.length > 0)
        .map((m) => m.id);
      return [...new Set([...prev, ...allIds])];
    });
  };

  const handleWelcomeCardClick = (promptText) => {
    setShowWelcome(false);
    setTimeout(() => {
      sendMessage(promptText);
    }, 100);
  };

  return (
    <div className="relative flex h-[100dvh] flex-col bg-white">
      {/* HEADER */}
      <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-black/[0.06] bg-white/95 px-3 py-3 backdrop-blur-xl">
        <button
          onClick={onBack}
          className="flex h-8 w-8 shrink-0 items-center justify-center text-[#161823]"
        >
          <ArrowLeft size={22} strokeWidth={2.2} />
        </button>

        {/* Avatar + tên bot */}
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
          <img
            src={BOT_AVATAR_URL}
            alt="Bot"
            className="h-8 w-8 rounded-full border border-slate-200 object-cover"
          />
          <div className="text-left">
            <h1 className="truncate text-[14px] font-bold tracking-[-0.01em] text-[#161823]">
              Trợ lý NXX315
            </h1>
            <p className="text-[10px] font-medium text-[#8a8d93]">
              Phản hồi trong vài giây
            </p>
          </div>
        </div>

        {/* 👇 NÚT 3 GẠCH - MỞ LỊCH SỬ */}
        <button
          onClick={() => setShowHistoryDrawer(true)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#161823] transition hover:bg-slate-50"
          title="Lịch sử trò chuyện"
        >
          <Menu size={20} strokeWidth={2.2} />
        </button>

        <a
          href={SUPPORT.zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#0068FF] transition hover:bg-[#0068FF]/[0.08]"
        >
          <Headphones size={19} strokeWidth={2} />
        </a>
      </div>

      {/* 👇 DRAWER LỊCH SỬ */}
      <HistoryDrawer
        open={showHistoryDrawer}
        onClose={() => setShowHistoryDrawer(false)}
        userId={user?.id}
        currentConvId={conv.id}
        onOpenConversation={onOpenConversation}
        onNewChat={onNewChat}
      />

      {/* KHU VỰC CHÍNH */}
      {showWelcome ? (
        <WelcomeScreen onCardClick={handleWelcomeCardClick} />
      ) : (
        <div
          ref={scrollRef}
          className="flex-1 space-y-2.5 overflow-y-auto px-3.5 py-4 sm:px-4"
          style={{ scrollBehavior: "smooth", WebkitOverflowScrolling: "touch" }}
        >
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 size={20} className="animate-spin text-slate-300" />
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => {
                if (msg.sender_type === "status") {
                  return <StatusBubble key={msg.id} message={msg} />;
                }
                const isLastAIMessage =
                  idx === messages.length - 1 &&
                  msg.sender_type === "ai" &&
                  !streamingMsgId &&
                  !aiTyping;
                return (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    streamingText={streamingMsgId === msg.id ? streamingText : null}
                    isLastAIMessage={isLastAIMessage}
                    onSuggestionClick={(text) => {
                      hideAllSuggestions();
                      sendMessage(text);
                    }}
                    sending={sending}
                    onShowLogin={() => navigate("/login")}
                    hiddenSuggestionIds={hiddenSuggestionIds}
                    onHideSuggestions={hideAllSuggestions}
                  />
                );
              })}

              {aiTyping && !streamingMsgId && !messages.some((m) => m.sender_type === "status") && (
                <div className="flex justify-start">
                  <div className="rounded-[20px] rounded-tl-[6px] border border-slate-100 bg-white px-4 py-3.5 shadow-sm">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* INPUT BAR */}
      <div className="relative border-t border-black/[0.05] bg-white px-3.5 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 sm:px-4">
        <div className="flex items-end gap-2">
          <button
            onClick={() => setShowFileMenu(true)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/[0.07] bg-white text-[#161823] transition active:scale-95"
          >
            <Plus size={22} strokeWidth={2.2} />
          </button>

          <div className="relative flex-1">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Hỏi bất cứ điều gì"
              className="h-11 w-full rounded-full border border-black/[0.07] bg-[#f2f2f2] px-4 text-[14px] text-[#161823] outline-none transition placeholder:text-[#8a8d93] focus:border-[#b9bdc5] focus:bg-white"
            />
            {input.trim() && (
              <button
                onClick={() => sendMessage()}
                disabled={sending}
                className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#FE2C55] text-white transition active:scale-95 disabled:opacity-40"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} strokeWidth={2.4} />}
              </button>
            )}
          </div>

          <button
            onClick={() => setShowEmoji(true)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#161823] transition active:scale-95"
          >
            <Smile size={22} strokeWidth={2.2} />
          </button>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" hidden
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); e.target.value = ""; }} />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" hidden
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); e.target.value = ""; }} />

        {/* BOTTOM SHEET */}
        {showFileMenu && (
          <>
            <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setShowFileMenu(false)} />
            <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[24px] bg-white pb-[max(20px,env(safe-area-inset-bottom))] pt-2 shadow-2xl">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
              <div className="px-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">Tải lên</h3>
                  <button onClick={() => fileInputRef.current?.click()} className="text-sm font-semibold text-blue-500">
                    Tất cả ảnh
                  </button>
                </div>
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={() => { setShowFileMenu(false); cameraInputRef.current?.click(); }}
                    className="flex w-24 flex-col items-center gap-2"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                      <Camera size={28} />
                    </div>
                    <span className="text-xs font-medium text-slate-600">Camera</span>
                  </button>
                </div>
                <div className="mt-6 border-t border-slate-100 pt-4">
                  <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 py-3 text-sm font-semibold text-slate-700">
                    <Edit size={16} /> Chỉnh sửa hình ảnh
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* EMOJI PICKER */}
        {showEmoji && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowEmoji(false)} />
            <div className="absolute bottom-20 right-4 z-50 overflow-hidden rounded-lg border border-slate-200 shadow-2xl">
              <EmojiPicker
                onEmojiClick={(e) => setInput((prev) => prev + e.emoji)}
                theme="light"
                height={350}
                width={300}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
function MessageBubble({
  message,
  streamingText,
  isLastAIMessage,
  onSuggestionClick,
  sending,
  onShowLogin,
  hiddenSuggestionIds = [],
  onHideSuggestions,
}) {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);

  const isUser = message.sender_type === "user";
  const isAI = message.sender_type === "ai";
  const isAgent = message.sender_type === "agent";
  const isSystem = message.sender_type === "system";
  const isSuggestionHidden = hiddenSuggestionIds.includes(message.id);

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500">
          {message.message}
        </div>
      </div>
    );
  }

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="relative max-w-[78%]">
          <div className="absolute -right-[5px] top-0 h-3 w-3 bg-[#FFE5EC] [clip-path:polygon(0_0,100%_0,0_100%)]" />
          <div className="rounded-[20px] rounded-tr-[6px] bg-[#FFE5EC] px-4 py-2.5 shadow-[0_2px_8px_rgba(254,44,85,0.08)]">
            {message.image_url && (
              <img
                src={message.image_url}
                alt="User upload"
                className="mb-2 max-h-72 w-full rounded-[14px] object-cover"
                loading="lazy"
              />
            )}
            {message.message && (
              <p className="whitespace-pre-wrap break-words text-[14px] leading-6 text-[#161823]">
                {message.message}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const displayText = streamingText !== null ? streamingText : message.message;
  const isStreaming = streamingText !== null;

  const hasSuggestions =
    isLastAIMessage &&
    message.suggestions?.length > 0 &&
    !isStreaming &&
    !isSuggestionHidden;

  const hasActions =
    message.actions &&
    Array.isArray(message.actions) &&
    message.actions.length > 0;

  const showLoginButton =
    isLastAIMessage &&
    !isStreaming &&
    !isSuggestionHidden &&
    shouldShowLoginButton(message.message);

  const handleSuggestionClick = (reply) => {
    if (onHideSuggestions) onHideSuggestions();
    onSuggestionClick(reply);
  };

  const handleActionClick = (action) => {
    if (!action?.path) return;
    if (action.path.startsWith("http")) {
      window.open(action.path, "_blank", "noopener,noreferrer");
      return;
    }
    navigate(action.path);
  };

  return (
    <div className="flex justify-start">
      <div className="max-w-[82%]">
        <div className="relative">
          <div className="absolute -left-[5px] top-0 h-3 w-3 bg-white [clip-path:polygon(0_0,100%_0,100%_100%)]" />
          <div className="rounded-[20px] rounded-tl-[6px] bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            {message.image_url && (
              <img
                src={message.image_url}
                alt="Message"
                className="mb-2 max-h-72 w-full rounded-[14px] object-cover"
                loading="lazy"
              />
            )}
            <p className="whitespace-pre-wrap break-words text-[14px] leading-6 text-[#161823]">
              {displayText}
              {isStreaming && (
                <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-slate-400 align-middle" />
              )}
            </p>
          </div>
        </div>

        {!isStreaming && (
          <div className="mt-1.5 flex items-center gap-2 px-2">
            <span className="flex items-center gap-1 text-[11px] text-[#8a8d93]">
              {isAI && <Sparkles size={11} strokeWidth={2.4} />}
              {isAI ? "Do AI tạo" : isAgent ? "Nhân viên hỗ trợ" : ""}
            </span>
            {isAI && (
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() =>
                    setFeedback(feedback === "like" ? null : "like")
                  }
                  className={`flex h-6 w-6 items-center justify-center rounded-full transition ${
                    feedback === "like"
                      ? "bg-sky-50 text-sky-600"
                      : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  }`}
                >
                  <ThumbsUp size={12} strokeWidth={2.2} />
                </button>
                <button
                  onClick={() =>
                    setFeedback(feedback === "dislike" ? null : "dislike")
                  }
                  className={`flex h-6 w-6 items-center justify-center rounded-full transition ${
                    feedback === "dislike"
                      ? "bg-rose-50 text-rose-600"
                      : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  }`}
                >
                  <ThumbsDown size={12} strokeWidth={2.2} />
                </button>
              </div>
            )}
          </div>
        )}

        {hasActions && !isStreaming && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {message.actions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleActionClick(action)}
                className="group flex items-center justify-between gap-2 rounded-[14px] border border-[#FE2C55]/20 bg-gradient-to-br from-[#FE2C55]/[0.04] to-[#FE2C55]/[0.02] px-3.5 py-3 text-left transition hover:border-[#FE2C55]/40 hover:from-[#FE2C55]/[0.08] active:scale-[0.97]"
              >
                <span className="line-clamp-2 text-[12.5px] font-bold leading-tight text-[#161823]">
                  {action.label}
                </span>
                <ArrowRight
                  size={14}
                  className="shrink-0 text-[#FE2C55]"
                  strokeWidth={2.6}
                />
              </button>
            ))}
          </div>
        )}

        {hasSuggestions && (
          <div className="mt-3 space-y-2">
            {message.suggestions.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(reply)}
                disabled={sending}
                className="flex w-full items-center justify-between gap-3 rounded-[16px] border border-black/[0.06] bg-white px-4 py-3.5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition hover:border-black/[0.10] hover:bg-[#fafafa] active:scale-[0.99] disabled:opacity-50"
              >
                <span className="text-[14px] font-medium text-slate-700">
                  {reply}
                </span>
                <ArrowRight
                  size={16}
                  className="shrink-0 text-slate-400"
                  strokeWidth={2.2}
                />
              </button>
            ))}

            {showLoginButton && (
              <button
                onClick={onShowLogin}
                className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#FE2C55] px-4 py-3 text-sm font-extrabold text-white shadow-[0_5px_15px_rgba(254,44,85,0.15)] transition hover:brightness-110 active:scale-[0.99]"
              >
                <LogIn size={16} strokeWidth={2.4} />
                Đăng nhập
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
                }
