import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Send,
  Loader2,
  Bot,
  Headphones,
  Mail,
  CheckCheck,
  Smile,
  X,
  User,
  CreditCard,
  Package,
  Bug,
  MoreHorizontal,
  Ticket,
  ChevronRight,
  Plus,
  FileText,
  MessageSquare,
  Clock,
  Sparkles,
  Zap,
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

const CATEGORIES = [
  {
    id: "account",
    label: "Tài khoản",
    desc: "Đăng nhập, mật khẩu",
    icon: User,
    color: "from-rose-500 to-rose-600",
    light: "bg-rose-50 text-rose-600",
  },
  {
    id: "payment",
    label: "Thanh toán",
    desc: "Nạp tiền, chuyển khoản",
    icon: CreditCard,
    color: "from-amber-500 to-orange-600",
    light: "bg-amber-50 text-amber-600",
  },
  {
    id: "order",
    label: "Đơn hàng",
    desc: "Trạng thái, giao hàng",
    icon: Package,
    color: "from-sky-500 to-blue-600",
    light: "bg-sky-50 text-sky-600",
  },
  {
    id: "bug",
    label: "Báo lỗi",
    desc: "Gặp sự cố kỹ thuật",
    icon: Bug,
    color: "from-purple-500 to-purple-600",
    light: "bg-purple-50 text-purple-600",
  },
  {
    id: "other",
    label: "Khác",
    desc: "Vấn đề khác",
    icon: MoreHorizontal,
    color: "from-slate-500 to-slate-600",
    light: "bg-slate-100 text-slate-600",
  },
];

function formatTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getGreeting(category) {
  const cat = CATEGORIES.find((c) => c.id === category);
  if (cat) {
    return `Xin chào! 👋 Mình là trợ lý AI của NXX315 Studio.\n\nMình thấy bạn cần hỗ trợ về **${cat.label}** — ${cat.desc.toLowerCase()}.\n\nBạn có thể mô tả chi tiết vấn đề để mình hỗ trợ chính xác hơn nhé!`;
  }
  return `Xin chào! 👋 Mình là trợ lý AI của NXX315 Studio.\n\nMình có thể giúp gì cho bạn hôm nay?`;
}
export default function Support() {
  const [view, setView] = useState("home");
  const [user, setUser] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    loadUser();
  }, []);

  const startAIChat = async (category) => {
    if (!user?.id) return;

    try {
      // Tìm conversation đang mở
      const { data: existing } = await supabase
        .from("support_conversations")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["ai", "pending_agent", "agent"])
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      let conv = existing;

      if (!conv) {
        // Tạo conv mới
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

        // Gửi tin chào mừng
        await supabase.from("support_messages").insert({
          conversation_id: conv.id,
          user_id: user.id,
          message: getGreeting(category),
          sender_type: "ai",
        });
      }

      setConversation(conv);
      setView("chat");
    } catch (error) {
      console.error("Start chat error:", error);
      alert("Không thể bắt đầu cuộc trò chuyện.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 text-slate-900">
      <TopHeader />

      <main className="mx-auto w-full max-w-2xl px-4 py-5">
        {view === "home" && (
          <HomeView
            onStartChat={startAIChat}
            onCreateTicket={() => setView("ticket")}
            onViewTickets={() => setView("ticketDetail")}
          />
        )}

        {view === "chat" && conversation && (
          <ChatView
            conversation={conversation}
            user={user}
            onBack={() => setView("home")}
            onCreateTicket={() => setView("ticket")}
          />
        )}

        {view === "ticket" && (
          <TicketView
            user={user}
            onBack={() => setView("home")}
            onSuccess={() => {
              setView("home");
            }}
          />
        )}

        {view === "ticketDetail" && (
          <TicketListView
            user={user}
            onBack={() => setView("home")}
            onSelect={setSelectedTicket}
          />
        )}
      </main>

      <BottomNav />
    </div>
  );
      }
function HomeView({ onStartChat, onCreateTicket, onViewTickets }) {
  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 shadow-md">
            <Headphones size={22} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-black text-slate-900">
              Bộ phận Hỗ trợ
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Chúng tôi sẵn sàng hỗ trợ bạn 24/7
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <p className="text-xs font-semibold text-emerald-700">
            Đang hoạt động · Phản hồi trung bình 5 phút
          </p>
        </div>
      </div>

      {/* Categories */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-500">
            Chọn loại vấn đề
          </h2>
          <button
            onClick={onViewTickets}
            className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700"
          >
            Xem phiếu
            <ChevronRight size={12} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onStartChat(cat.id)}
                className="group flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3.5 text-left transition hover:border-sky-300 hover:shadow-md active:scale-[0.98]"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${cat.color} shadow-sm`}
                >
                  <Icon size={18} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {cat.label}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-slate-500">
                    {cat.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* CTA: Tạo phiếu */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-start gap-3 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 shadow-sm">
            <Ticket size={18} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900">
              Tạo phiếu hỗ trợ
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Gửi yêu cầu chi tiết, nhân viên sẽ xử lý
            </p>
          </div>
        </div>
        <div className="border-t border-slate-100 p-3">
          <button
            onClick={onCreateTicket}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-rose-500 to-rose-600 text-sm font-bold text-white shadow-sm transition hover:brightness-110"
          >
            <Plus size={16} />
            Tạo phiếu mới
          </button>
        </div>
      </div>

      {/* Contact */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-[11px] font-black uppercase tracking-widest text-slate-500">
          Kênh liên hệ khác
        </p>
        <div className="space-y-2">
          <a
            href={SUPPORT.zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 transition hover:border-sky-200 hover:bg-sky-50"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-black text-white">
              Z
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900">Zalo</p>
              <p className="text-xs text-slate-500">{SUPPORT.zalo}</p>
            </div>
            <ChevronRight size={14} className="text-slate-400" />
          </a>

          <a
            href={`mailto:${SUPPORT.email}`}
            className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 transition hover:border-rose-200 hover:bg-rose-50"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-rose-600">
              <Mail size={16} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900">Email</p>
              <p className="truncate text-xs text-slate-500">
                {SUPPORT.email}
              </p>
            </div>
            <ChevronRight size={14} className="text-slate-400" />
          </a>
        </div>
      </div>

      <p className="text-center text-[10px] text-slate-400">
        Câu trả lời có thể do AI tạo, có thể có sai sót.
      </p>
    </div>
  );
            }
function ChatView({ conversation, user, onBack, onCreateTicket }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [conv, setConv] = useState(conversation);
  const scrollRef = useRef(null);
  const sentIds = useRef(new Set());

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
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
      scrollToBottom();
    }
  };

  useEffect(() => {
    loadMessages();
  }, [conversation.id]);

  // Realtime
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
            return [...prev, msg];
          });
          scrollToBottom();
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [conversation.id]);

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || sending || !user?.id) return;

    setSending(true);
    try {
      // Insert user message
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
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setShowEmoji(false);
      scrollToBottom();

      // Nếu đang AI mode → gọi Gemini
      if (conv.status === "ai") {
        setAiTyping(true);
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.access_token) throw new Error("Chưa đăng nhập");

          const response = await fetch(
            "https://rwglwovohbyqmbbzdvdj.supabase.co/functions/v1/ai-support-reply",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
                apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
              },
              body: JSON.stringify({
                conversation_id: conv.id,
                user_message: content,
              }),
            }
          );

          const data = await response.json();
          if (!response.ok) throw new Error(data?.error || "AI lỗi");

          // Edge Function đã insert tin AI → realtime sẽ push
        } catch (err) {
          console.error("AI error:", err);
          const { data: errMsg } = await supabase
            .from("support_messages")
            .insert({
              conversation_id: conv.id,
              user_id: user.id,
              message:
                "Xin lỗi, mình gặp sự cố kỹ thuật. Bạn vui lòng thử lại hoặc nhấn **Cho tôi gặp nhân viên** nhé! 🙏",
              sender_type: "ai",
            })
            .select()
            .single();

          if (errMsg) {
            sentIds.current.add(errMsg.id);
            setMessages((prev) => [...prev, errMsg]);
            scrollToBottom();
          }
        } finally {
          setAiTyping(false);
        }
      }

      await supabase
        .from("support_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conv.id);
    } catch (error) {
      console.error("Send error:", error);
      alert("Không thể gửi tin nhắn.");
    } finally {
      setSending(false);
    }
  };

  const requestAgent = async () => {
    if (conv.status === "agent") return;

    try {
      await supabase
        .from("support_conversations")
        .update({
          status: "pending_agent",
          updated_at: new Date().toISOString(),
        })
        .eq("id", conv.id);

      const { data } = await supabase
        .from("support_messages")
        .insert({
          conversation_id: conv.id,
          user_id: user.id,
          message:
            "Đã gửi yêu cầu kết nối nhân viên. Vui lòng chờ trong giây lát ⏳",
          sender_type: "system",
        })
        .select()
        .single();

      if (data) {
        sentIds.current.add(data.id);
        setMessages((prev) => [...prev, data]);
      }
      setConv({ ...conv, status: "pending_agent" });
      scrollToBottom();
    } catch (error) {
      console.error("Request agent error:", error);
    }
  };

  const isAI = conv.status === "ai";

  return (
    <div className="flex h-[calc(100vh-150px)] flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        <button
          onClick={onBack}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
        </button>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            isAI
              ? "bg-gradient-to-br from-sky-500 to-blue-600"
              : "bg-gradient-to-br from-emerald-500 to-emerald-600"
          } shadow-sm`}
        >
          {isAI ? (
            <Bot size={18} className="text-white" />
          ) : (
            <Headphones size={18} className="text-white" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900">
            {isAI ? "Trợ lý AI" : "Nhân viên hỗ trợ"}
          </p>
          <div className="flex items-center gap-1">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isAI ? "bg-sky-500" : "bg-emerald-500"
              }`}
            />
            <p
              className={`text-[10px] font-semibold ${
                isAI ? "text-sky-600" : "text-emerald-600"
              }`}
            >
              {isAI
                ? "Gemini AI"
                : conv.status === "pending_agent"
                ? "Đang kết nối..."
                : "Đang trực tuyến"}
            </p>
          </div>
        </div>

        {isAI && (
          <span className="hidden shrink-0 items-center gap-1 rounded-full bg-sky-50 px-2 py-1 text-[10px] font-bold text-sky-600 sm:flex">
            <Sparkles size={10} />
            AI
          </span>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4"
      >
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 size={20} className="animate-spin text-slate-400" />
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {aiTyping && (
              <div className="flex items-end gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600">
                  <Bot size={13} className="text-white" />
                </div>
                <div className="rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
                  <div className="flex gap-1">
                    <span
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Suggestions */}
      {isAI && !aiTyping && messages.length <= 2 && (
        <div className="flex gap-2 overflow-x-auto border-t border-slate-100 bg-white px-4 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={requestAgent}
            className="shrink-0 whitespace-nowrap rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-600 transition hover:bg-sky-100"
          >
            👨‍💼 Gặp nhân viên
          </button>
          <button
            onClick={onCreateTicket}
            className="shrink-0 whitespace-nowrap rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
          >
            📩 Tạo phiếu hỗ trợ
          </button>
        </div>
      )}

      {/* Input */}
      <div className="relative border-t border-slate-100 bg-white p-3">
        <div className="flex items-end gap-2">
          <div className="flex flex-1 items-end gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-sky-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-100">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Nhập tin nhắn..."
              rows={1}
              className="max-h-24 min-h-[24px] flex-1 resize-none bg-transparent py-1 text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
            <button
              onClick={() => setShowEmoji((v) => !v)}
              className="shrink-0 text-slate-400 transition hover:text-amber-500"
            >
              <Smile size={18} />
            </button>
          </div>

          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sm transition hover:brightness-110 active:scale-95 disabled:opacity-40"
          >
            {sending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>

        {showEmoji && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowEmoji(false)}
            />
            <div className="absolute bottom-full right-3 z-50 mb-2 overflow-hidden rounded-lg border border-slate-200 shadow-2xl">
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

function MessageBubble({ message }) {
  const isUser = message.sender_type === "user";
  const isAI = message.sender_type === "ai";
  const isAgent = message.sender_type === "agent";
  const isSystem = message.sender_type === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-500 shadow-sm">
          {message.message}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-end gap-2 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full shadow-sm ${
            isAI
              ? "bg-gradient-to-br from-sky-500 to-blue-600"
              : "bg-gradient-to-br from-emerald-500 to-emerald-600"
          }`}
        >
          {isAI ? (
            <Bot size={13} className="text-white" />
          ) : (
            <Headphones size={13} className="text-white" />
          )}
        </div>
      )}

      <div className={`max-w-[78%] ${isUser ? "items-end" : ""}`}>
        <div
          className={`px-3.5 py-2.5 shadow-sm ${
            isUser
              ? "rounded-2xl rounded-br-sm bg-gradient-to-br from-sky-500 to-blue-600 text-white"
              : "rounded-2xl rounded-bl-sm border border-slate-200 bg-white text-slate-800"
          }`}
        >
          <p className="whitespace-pre-wrap break-words text-sm leading-6">
            {message.message}
          </p>
        </div>
        <div
          className={`mt-1 flex items-center gap-1 px-1 text-[10px] text-slate-400 ${
            isUser ? "justify-end" : "justify-start"
          }`}
        >
          {isAI && <span className="font-bold text-sky-600">AI</span>}
          {isAgent && (
            <span className="font-bold text-emerald-600">
              {message.agent_name || "Nhân viên"}
            </span>
          )}
          <span>{formatTime(message.created_at)}</span>
          {isUser && <CheckCheck size={10} />}
        </div>
      </div>
    </div>
  );
        }
   function TicketView({ user, onBack, onSuccess }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("payment");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      alert("Vui lòng nhập tiêu đề và mô tả.");
      return;
    }

    setCreating(true);
    try {
      const code = `TKT-${Date.now().toString(36).toUpperCase()}`;

      const { error } = await supabase.from("support_tickets").insert({
        user_id: user.id,
        ticket_code: code,
        title: title.trim(),
        category,
        description: description.trim(),
        status: "open",
      });

      if (error) throw error;

      alert(`✅ Đã tạo phiếu hỗ trợ!\n\nMã: ${code}\n\nNhân viên sẽ phản hồi trong 24h.`);
      onSuccess();
    } catch (error) {
      console.error("Create ticket error:", error);
      alert("Không thể tạo phiếu.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-base font-black text-slate-900">
            Tạo phiếu hỗ trợ
          </h1>
          <p className="text-xs text-slate-500">
            Nhân viên sẽ phản hồi trong 24h
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Tiêu đề
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: Không nhận được Coin sau khi nạp"
            className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Loại vấn đề
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              const isActive = category === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                    isActive
                      ? "border-sky-500 bg-sky-50 text-sky-600"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={12} />
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Mô tả chi tiết
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả chi tiết vấn đề bạn gặp..."
            rows={6}
            className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={creating || !title.trim() || !description.trim()}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-rose-500 to-rose-600 text-sm font-bold text-white shadow-sm transition hover:brightness-110 disabled:opacity-40"
        >
          {creating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Đang tạo...
            </>
          ) : (
            <>
              <Ticket size={16} />
              Tạo phiếu
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function TicketListView({ user, onBack }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("support_tickets")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        setTickets(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) load();
  }, [user?.id]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-black text-slate-900">
            Phiếu hỗ trợ của bạn
          </h1>
          <p className="text-xs text-slate-500">{tickets.length} phiếu</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={20} className="animate-spin text-slate-400" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-10 text-center shadow-sm">
          <FileText size={36} className="mx-auto text-slate-300" />
          <p className="mt-3 text-sm font-bold text-slate-700">
            Chưa có phiếu nào
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                    #{t.ticket_code}
                  </p>
                  <p className="mt-1 truncate text-sm font-bold text-slate-900">
                    {t.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                    {t.description}
                  </p>
                  <p className="mt-2 text-[10px] text-slate-400">
                    {formatDate(t.created_at)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                    t.status === "open"
                      ? "bg-emerald-50 text-emerald-600"
                      : t.status === "processing"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {t.status === "open"
                    ? "Đang mở"
                    : t.status === "processing"
                    ? "Đang xử lý"
                    : "Đã đóng"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
    }   
