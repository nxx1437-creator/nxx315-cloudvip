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
  ImageIcon,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";

import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { supabase } from "../lib/supabaseClient.js";

const SUPPORT = {
  zalo: "0865245988",
  zaloUrl: "https://zalo.me/0865245988",
  email: "nxx315hub@gmail.com",
  hours: "8:00 - 24:00 (T2 - CN)",
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

/* Greeting + suggestions khi user bấm "Chat với AI" */
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
export default function Support() {
  const [view, setView] = useState("home"); // home | faq | chat
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

  const openFaq = (category) => {
    setSelectedCategory(category);
    setView("faq");
  };

  const startAIChat = async (category) => {
    if (!user?.id) {
      alert("Vui lòng đăng nhập để chat với AI.");
      return;
    }

    try {
      const { data: existing } = await supabase
        .from("support_conversations")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "ai")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      let conv = existing;

      if (!conv) {
        const { data, error } = await supabase
          .from("support_conversations")
          .insert({
            user_id: user.id,
            title: category
              ? `Hỗ trợ ${CATEGORIES.find((c) => c.id === category)?.label}`
              : "Cuộc trò chuyện mới",
            category,
            status: "ai",
          })
          .select()
          .single();

        if (error) throw error;
        conv = data;

        await supabase.from("support_messages").insert({
          conversation_id: conv.id,
          user_id: user.id,
          message: getGreeting(category),
          sender_type: "ai",
          suggestions: getSuggestions(category),
        });
      }

      setConversation(conv);
      setSelectedCategory(category);
      setView("chat");
    } catch (error) {
      console.error("Start chat error:", error);
      alert("Không thể bắt đầu cuộc trò chuyện.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pb-24 text-slate-900">
      <TopHeader />

      <main className="mx-auto w-full max-w-2xl">
        {view === "home" && (
          <HomeView onOpenFaq={openFaq} onStartChat={startAIChat} />
        )}

        {view === "faq" && (
          <FaqView
            category={selectedCategory}
            onBack={() => setView("home")}
            onStartChat={() => startAIChat(selectedCategory)}
          />
        )}

        {view === "chat" && conversation && (
          <ChatView
            conversation={conversation}
            user={user}
            category={selectedCategory}
            onBack={() => setView("faq")}
          />
        )}
      </main>

      <BottomNav />
    </div>
  );
}

/* ============================================================
   HOME VIEW
   ============================================================ */

function HomeView({ onOpenFaq, onStartChat }) {
  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#fafafa]">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-black/[0.06] bg-white/95 px-4 py-3 backdrop-blur-xl">
        <button
          onClick={() => window.history.back()}
          className="flex h-8 w-8 items-center justify-center text-[#161823]"
        >
          <ArrowLeft size={22} strokeWidth={2.2} />
        </button>
        <h1 className="text-[16px] font-bold tracking-[-0.01em] text-[#161823]">
          Trung tâm Hỗ trợ
        </h1>
        <button className="flex h-8 w-8 items-center justify-center text-[#161823]">
          <FileText size={20} strokeWidth={2} />
        </button>
      </div>

      {/* Tiêu đề */}
      <div className="px-4 pb-4 pt-6">
        <h2 className="text-[20px] font-extrabold leading-tight tracking-[-0.02em] text-[#161823]">
          Trợ giúp theo chủ đề
        </h2>
        <p className="mt-1 text-[13px] text-[#8a8d93]">
          Chọn chủ đề để xem hướng dẫn và câu hỏi thường gặp.
        </p>
      </div>

      {/* Grid danh mục */}
      <div className="grid grid-cols-1 gap-3 px-4 sm:grid-cols-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => onOpenFaq(cat.id)}
              className="group relative flex items-center gap-3 overflow-hidden rounded-[18px] border border-black/[0.06] bg-white px-4 py-4 text-left shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition active:scale-[0.98]"
            >
              {/* Vạch màu bên trái */}
              <div
                className="absolute left-0 top-0 h-full w-1"
                style={{ backgroundColor: cat.color }}
              />

              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]"
                style={{ backgroundColor: `${cat.color}18` }}
              >
                <Icon size={22} style={{ color: cat.color }} strokeWidth={2.2} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-[#161823]">
                  {cat.label}
                </p>
                <p className="mt-0.5 truncate text-[12px] text-[#8a8d93]">
                  Xem hướng dẫn và câu hỏi thường gặp
                </p>
              </div>

              <ChevronRight
                size={18}
                className="shrink-0 text-[#c4c7cc] transition group-hover:translate-x-0.5 group-hover:text-[#8a8d93]"
                strokeWidth={2.2}
              />
            </button>
          );
        })}
      </div>

      {/* Nút chat AI */}
      <div className="px-4 pt-6">
        <button
          onClick={() => onStartChat(null)}
          className="flex w-full items-center justify-between rounded-[18px] bg-gradient-to-r from-[#FE2C55] to-[#FF6B9D] px-4 py-4 text-left shadow-[0_6px_20px_rgba(254,44,85,0.18)] transition active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur">
              <Sparkles size={22} className="text-white" strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-[15px] font-bold text-white">
                Chat với trợ lý AI
              </p>
              <p className="mt-0.5 text-[12px] text-white/80">
                Phản hồi trong vài giây, hỗ trợ 24/7
              </p>
            </div>
          </div>
          <ArrowRight size={20} className="shrink-0 text-white" strokeWidth={2.4} />
        </button>
      </div>

      {/* Nút Zalo */}
      <div className="px-4 pt-3 pb-7">
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

/* ============================================================
   FAQ VIEW — trang hướng dẫn theo category
   ============================================================ */

function FaqView({ category, onBack, onStartChat }) {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  const cat = CATEGORIES.find((c) => c.id === category);
  const Icon = cat?.icon || HelpCircle;
  const color = cat?.color || "#FE2C55";

  useEffect(() => {
    loadFaqs();
  }, [category]);

  const loadFaqs = async () => {
    if (!category) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("support_faqs")
        .select("*")
        .eq("category", category)
        .eq("is_active", true)
        .order("order", { ascending: true });

      if (error) throw error;
      setFaqs(data || []);
    } catch (err) {
      console.error("Load FAQ error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#fafafa]">
      {/* Header */}
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

      {/* Header category */}
      <div className="px-4 pb-4 pt-6">
        <div className="flex items-center gap-3">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px]"
            style={{ backgroundColor: `${color}18` }}
          >
            <Icon size={26} style={{ color }} strokeWidth={2.2} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[20px] font-extrabold leading-tight tracking-[-0.02em] text-[#161823]">
              {cat?.label || "Hỗ trợ"}
            </h2>
            <p className="mt-0.5 text-[12.5px] text-[#8a8d93]">
              Câu hỏi thường gặp và hướng dẫn
            </p>
          </div>
        </div>
      </div>

      {/* FAQ list */}
      <div className="px-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={22} className="animate-spin text-slate-300" />
          </div>
        ) : faqs.length === 0 ? (
          <div className="rounded-[18px] border border-dashed border-black/[0.08] bg-white px-4 py-10 text-center">
            <HelpCircle
              size={32}
              className="mx-auto mb-2 text-slate-300"
              strokeWidth={2}
            />
            <p className="text-[14px] font-semibold text-[#161823]">
              Chưa có hướng dẫn cho mục này
            </p>
            <p className="mt-1 text-[12.5px] text-[#8a8d93]">
              Bạn có thể chat với AI để được hỗ trợ trực tiếp.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {faqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="overflow-hidden rounded-[16px] border border-black/[0.06] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition active:bg-slate-50"
                  >
                    <span className="flex-1 text-[14px] font-semibold leading-5 text-[#161823]">
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-[#8a8d93] transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      strokeWidth={2.2}
                    />
                  </button>

                  {isOpen && (
                    <div className="border-t border-black/[0.05] bg-[#fafafa] px-4 py-3.5">
                      <p className="whitespace-pre-wrap text-[13.5px] leading-6 text-[#4a4d54]">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CTA — Chat với AI */}
      <div className="px-4 pt-6 pb-4">
        <button
          onClick={onStartChat}
          className="flex w-full items-center justify-between rounded-[18px] bg-gradient-to-r from-[#FE2C55] to-[#FF6B9D] px-4 py-4 text-left shadow-[0_6px_20px_rgba(254,44,85,0.18)] transition active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur">
              <Sparkles size={22} className="text-white" strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-[15px] font-bold text-white">
                Vẫn cần hỗ trợ?
              </p>
              <p className="mt-0.5 text-[12px] text-white/80">
                Chat với trợ lý AI ngay
              </p>
            </div>
          </div>
          <ArrowRight size={20} className="shrink-0 text-white" strokeWidth={2.4} />
        </button>
      </div>

      {/* Nút Zalo */}
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
function ChatView({ conversation, user, category, onBack }) {
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
  const [showHistoryMenu, setShowHistoryMenu] = useState(false);
  const scrollRef = useRef(null);
  const sentIds = useRef(new Set());
  const fileInputRef = useRef(null);

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
          console.log(
            `[Support AI] Provider: ${data.provider} (${data.model})`
          );
        } catch (err) {
          console.error("AI error:", err);
          setMessages((prev) =>
            prev.filter((m) => m.sender_type !== "status")
          );

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
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

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
      scrollToBottom(true);

      if (conv.status === "ai") {
        const typingTimer = setTimeout(() => setAiTyping(true), 1500);

        try {
          const data = await callAI(publicUrl, null);
          console.log(
            `[Support AI - image] Provider: ${data.provider} (${data.model})`
          );
        } catch (err) {
          console.error("AI image error:", err);
          setMessages((prev) =>
            prev.filter((m) => m.sender_type !== "status")
          );

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

  return (
    <div className="relative flex h-[calc(100vh-0px)] flex-col bg-[#fafafa]">
      {/* HEADER */}
      <div className="sticky top-0 z-20 flex items-center gap-2 border-b border-black/[0.06] bg-white/95 px-3 py-3 backdrop-blur-xl">
        <button
          onClick={onBack}
          className="flex h-8 w-8 shrink-0 items-center justify-center text-[#161823]"
        >
          <ArrowLeft size={22} strokeWidth={2.2} />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <h1 className="truncate text-[15px] font-bold tracking-[-0.01em] text-[#161823]">
            Trợ lý AI NXX315
          </h1>
          <p className="text-[10.5px] font-medium text-[#8a8d93]">
            Phản hồi trong vài giây
          </p>
        </div>
        <a
          href={SUPPORT.zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#0068FF] transition hover:bg-[#0068FF]/[0.08]"
          title="Gặp nhân viên qua Zalo"
        >
          <Headphones size={19} strokeWidth={2} />
        </a>
        <button
          onClick={() => setShowHistoryMenu((v) => !v)}
          className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#161823] transition hover:bg-slate-50"
        >
          <FileText size={19} strokeWidth={2} />
          {hiddenSuggestionIds.length > 0 && (
            <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-rose-500" />
          )}
        </button>
      </div>

      {/* HISTORY MENU */}
      {showHistoryMenu && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowHistoryMenu(false)}
          />
          <div className="absolute right-3 top-14 z-40 w-72 overflow-hidden rounded-[16px] border border-black/[0.06] bg-white shadow-[0_14px_40px_rgba(0,0,0,0.12)]">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Đề xuất đã ẩn
              </p>
              <p className="mt-0.5 text-[10px] text-slate-400">
                {hiddenSuggestionIds.length} tin nhắn có suggestions đã ẩn
              </p>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {hiddenSuggestionIds.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-slate-400">
                  Chưa có suggestions nào bị ẩn
                </div>
              ) : (
                hiddenSuggestionIds.map((msgId) => {
                  const msg = messages.find((m) => m.id === msgId);
                  if (!msg) return null;
                  return (
                    <button
                      key={msgId}
                      onClick={() => {
                        setHiddenSuggestionIds((prev) =>
                          prev.filter((id) => id !== msgId)
                        );
                        setShowHistoryMenu(false);
                        scrollToBottom(true);
                      }}
                      className="flex w-full items-center justify-between gap-3 border-b border-slate-50 px-4 py-3 text-left transition last:border-0 hover:bg-slate-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-slate-700">
                          {msg.message.slice(0, 50)}
                          {msg.message.length > 50 ? "..." : ""}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {msg.suggestions?.length || 0} đề xuất
                        </p>
                      </div>
                      <ArrowRight size={14} className="text-slate-400" />
                    </button>
                  );
                })
              )}
            </div>

            {hiddenSuggestionIds.length > 0 && (
              <div className="border-t border-slate-100 p-2">
                <button
                  onClick={() => {
                    setHiddenSuggestionIds([]);
                    setShowHistoryMenu(false);
                    scrollToBottom(true);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-50 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
                >
                  <RefreshCw size={12} />
                  Hiện lại tất cả
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* MESSAGES */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-2.5 overflow-y-auto px-3.5 py-4 sm:px-4"
        style={{
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
        }}
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
                  streamingText={
                    streamingMsgId === msg.id ? streamingText : null
                  }
                  isLastAIMessage={isLastAIMessage}
                  onSuggestionClick={sendMessage}
                  sending={sending}
                  onShowLogin={() => navigate("/login")}
                  hiddenSuggestionIds={hiddenSuggestionIds}
                  onHideSuggestions={hideAllSuggestions}
                />
              );
            })}

            {aiTyping &&
              !streamingMsgId &&
              !messages.some((m) => m.sender_type === "status") && (
                <div className="flex justify-start">
                  <div className="rounded-[20px] rounded-tl-[6px] bg-white px-4 py-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                    <div className="flex gap-1">
                      <span
                        className="h-2 w-2 animate-bounce rounded-full bg-slate-300"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="h-2 w-2 animate-bounce rounded-full bg-slate-300"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="h-2 w-2 animate-bounce rounded-full bg-slate-300"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}
          </>
        )}
      </div>

      {/* Nút Zalo */}
      <div className="border-t border-black/[0.05] bg-white px-3.5 py-2.5">
        <a
          href={SUPPORT.zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-[#0068FF]/30 bg-[#0068FF]/[0.05] px-4 py-2.5 text-[13px] font-semibold text-[#0068FF] transition hover:bg-[#0068FF]/[0.10] active:scale-[0.99]"
        >
          <Headphones size={16} strokeWidth={2.4} />
          Cần gặp nhân viên? Chat qua Zalo
        </a>
      </div>

      {/* INPUT */}
      <div className="relative border-t border-black/[0.05] bg-white px-3.5 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 sm:px-4">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Gửi tin nhắn..."
            className="h-11 flex-1 rounded-full border border-black/[0.07] bg-[#f2f2f2] px-4 text-[14px] text-[#161823] outline-none transition placeholder:text-[#8a8d93] focus:border-[#b9bdc5] focus:bg-white"
          />

          {input.trim() ? (
            <button
              onClick={() => sendMessage()}
              disabled={sending}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FE2C55] text-white shadow-[0_4px_12px_rgba(254,44,85,0.2)] transition active:scale-95 disabled:opacity-40"
            >
              {sending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} strokeWidth={2.4} />
              )}
            </button>
          ) : (
            <button
              onClick={() => setShowFileMenu((v) => !v)}
              disabled={uploading}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/[0.07] bg-[#f2f2f2] text-[#161823] transition active:scale-95 disabled:opacity-40"
            >
                  {uploading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Plus size={20} strokeWidth={2.4} />
              )}
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
            e.target.value = "";
          }}
        />

        {/* FILE MENU */}
        {showFileMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowFileMenu(false)}
            />
            <div className="absolute bottom-20 right-4 z-50 w-60 overflow-hidden rounded-[16px] border border-black/[0.06] bg-white shadow-[0_14px_40px_rgba(0,0,0,0.15)]">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50">
                  <ImageIcon
                    size={18}
                    className="text-rose-600"
                    strokeWidth={2.2}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-slate-800">
                    Gửi ảnh
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Bill, lỗi, đơn hàng
                  </p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowFileMenu(false);
                  setShowEmoji(true);
                }}
                className="flex w-full items-center gap-3 border-t border-slate-50 px-4 py-3 text-left transition hover:bg-slate-50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50">
                  <Smile
                    size={18}
                    className="text-amber-600"
                    strokeWidth={2.2}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-slate-800">
                    Biểu tượng cảm xúc
                  </p>
                  <p className="text-[11px] text-slate-500">Emoji</p>
                </div>
              </button>

              <a
                href={SUPPORT.zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowFileMenu(false)}
                className="flex w-full items-center gap-3 border-t border-slate-50 px-4 py-3 text-left transition hover:bg-slate-50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50">
                  <Headphones
                    size={18}
                    className="text-sky-600"
                    strokeWidth={2.2}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-slate-800">
                    Gặp nhân viên
                  </p>
                  <p className="text-[11px] text-slate-500">Chat qua Zalo</p>
                </div>
              </a>
            </div>
          </>
        )}

        {showEmoji && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowEmoji(false)}
            />
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
                  title="Hữu ích"
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
                  title="Không hữu ích"
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
                className="group flex items-center justify-between gap-2 rounded-[14px] border border-[#FE2C55]/20 bg-gradient-to-br from-[#FE2C55]/[0.04] to-[#FE2C55]/[0.02] px-3.5 py-3 text-left transition hover:border-[#FE2C55]/40 hover:from-[#FE2C55]/[0.08] hover:to-[#FE2C55]/[0.04] active:scale-[0.97]"
              >
                <span className="line-clamp-2 text-[12.5px] font-bold leading-tight text-[#161823]">
                  {action.label}
                </span>
                <ArrowRight
                  size={14}
                  className="shrink-0 text-[#FE2C55] transition group-hover:translate-x-0.5"
                  strokeWidth={2.6}
                />
              </button>
            ))}
          </div>
        )}

        {hasSuggestions && (
          <div className="mt-2.5 space-y-2">
            {message.suggestions.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(reply)}
                disabled={sending}
                className="flex w-full items-center justify-between gap-3 rounded-[14px] border border-black/[0.06] bg-white px-4 py-3 text-left shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition hover:border-black/[0.10] hover:bg-[#fafafa] active:scale-[0.99] disabled:opacity-50"
              >
                <span className="text-sm font-medium text-slate-700">
                  {reply}
                </span>
                <ArrowRight
                  size={16}
                  className="shrink-0 text-rose-400"
                  strokeWidth={2.4}
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
