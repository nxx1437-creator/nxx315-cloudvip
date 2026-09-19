import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Send,
  Loader2,
  Bot,
  User as UserIcon,
  Headphones,
  Phone,
  Mail,
  Clock,
  CheckCheck,
  Image as ImageIcon,
  Smile,
  X,
  User,
  CreditCard,
  Package,
  Bug,
  MoreHorizontal,
  Star,
  Ticket,
  MessageSquare,
  ChevronRight,
  Plus,
  FileText,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";

import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { supabase } from "../lib/supabaseClient.js";

// ============= CONSTANTS =============

const SUPPORT = {
  zalo: "0865245988",
  zaloUrl: "https://zalo.me/0865245988",
  email: "nxx315hub@gmail.com",
  hours: "8:00 - 24:00 (T2 - CN)",
};

const CATEGORIES = [
  { id: "account", label: "Tài khoản", icon: User, color: "from-rose-400 to-rose-600" },
  { id: "payment", label: "Thanh toán", icon: CreditCard, color: "from-amber-400 to-orange-600" },
  { id: "order", label: "Đơn hàng", icon: Package, color: "from-sky-400 to-blue-600" },
  { id: "bug", label: "Báo lỗi", icon: Bug, color: "from-purple-400 to-purple-600" },
  { id: "other", label: "Khác", icon: MoreHorizontal, color: "from-slate-400 to-slate-600" },
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
export default function Support() {
  const [view, setView] = useState("home"); // home | chat | ticket | ticketDetail
  const [user, setUser] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Load user
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
      // Kiểm tra conversation đang mở
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
        // Tạo conversation mới
        const { data, error } = await supabase
          .from("support_conversations")
          .insert({
            user_id: user.id,
            title: category ? `Hỗ trợ ${CATEGORIES.find(c => c.id === category)?.label}` : "Cuộc trò chuyện mới",
            category,
            status: "ai",
          })
          .select()
          .single();

        if (error) throw error;
        conv = data;

        // Gửi tin nhắn chào mừng từ AI
        const greeting = AI_RESPONSES.greeting[Math.floor(Math.random() * AI_RESPONSES.greeting.length)];
        await supabase.from("support_messages").insert({
          conversation_id: conv.id,
          user_id: user.id,
          message: greeting,
          sender_type: "ai",
        });

        // Nếu đang ở chế độ AI → gọi Gemini API
if (conv.status === "ai") {
  setAiTyping(true);
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error("Bạn chưa đăng nhập");
    }

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

    if (!response.ok) {
      throw new Error(data?.error || "AI không trả lời được");
    }

    // Tin nhắn AI đã được Edge Function insert → realtime sẽ tự push
    // Không cần insert lại ở frontend
  } catch (error) {
    console.error("AI error:", error);
    // Fallback: insert tin nhắn lỗi
    await supabase.from("support_messages").insert({
      conversation_id: conv.id,
      user_id: user.id,
      message:
        "Xin lỗi, mình đang gặp sự cố kỹ thuật. Bạn vui lòng thử lại sau hoặc nhấn 'Cho tôi gặp nhân viên' nhé! 🙏",
      sender_type: "ai",
    });
  } finally {
    setAiTyping(false);
  }
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
    <div className="min-h-screen bg-[#f7f9fc] pb-24 text-slate-900">
      <TopHeader />

      <main className="mx-auto w-full max-w-2xl px-4 py-5">
        {view === "home" && (
          <HomeView
            onStartChat={startAIChat}
            onCreateTicket={() => setView("ticket")}
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
            onSuccess={() => setView("ticketDetail")}
          />
        )}

        {view === "ticketDetail" && (
          <TicketListView
            user={user}
            onBack={() => setView("home")}
            onSelect={(t) => setSelectedTicket(t)}
          />
        )}
      </main>

      <BottomNav />
    </div>
  );
}
function HomeView({ onStartChat, onCreateTicket }) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg shadow-sky-200">
          <Headphones size={26} className="text-white" />
        </div>
        <h1 className="mt-3 text-xl font-black text-slate-900">
          Bộ phận hỗ trợ
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Chúng tôi sẵn sàng hỗ trợ bạn 24/7
        </p>
      </div>

      {/* Status card */}
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-bold text-emerald-700">
              Đang hoạt động
            </p>
            <p className="text-xs text-emerald-600">
              Phản hồi trung bình trong 5 phút
            </p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="mb-3 text-base font-black text-slate-900">
          Chọn loại vấn đề
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onStartChat(cat.id)}
                className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-sky-300 hover:shadow-md active:scale-[0.98]"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} shadow-md`}
                >
                  <Icon size={20} className="text-white" />
                </div>
                <span className="flex-1 text-sm font-bold text-slate-800">
                  {cat.label}
                </span>
                <ChevronRight
                  size={16}
                  className="text-slate-300 transition group-hover:text-sky-500"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Ticket CTA */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-rose-50 to-white p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 shadow-md">
            <Ticket size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-slate-900">
              Tạo phiếu hỗ trợ
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Gửi yêu cầu chi tiết, nhân viên sẽ xử lý
            </p>
          </div>
        </div>
        <button
          onClick={onCreateTicket}
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-sm font-black text-white shadow-md shadow-rose-200 transition hover:brightness-110"
        >
          <Plus size={16} />
          Tạo phiếu hỗ trợ
        </button>
      </div>

      {/* Contact other channels */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-500">
          Liên hệ khác
        </p>
        <div className="space-y-2">
          <a
            href={SUPPORT.zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 transition hover:bg-slate-100"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-black text-white">
              Z
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800">Zalo</p>
              <p className="text-xs text-slate-500">{SUPPORT.zalo}</p>
            </div>
            <ChevronRight size={16} className="text-slate-300" />
          </a>

          <a
            href={`mailto:${SUPPORT.email}`}
            className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 transition hover:bg-slate-100"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-rose-400 to-rose-600">
              <Mail size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800">Email</p>
              <p className="truncate text-xs text-slate-500">
                {SUPPORT.email}
              </p>
            </div>
            <ChevronRight size={16} className="text-slate-300" />
          </a>
        </div>
      </div>

      <p className="text-center text-[11px] text-slate-400">
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
  const fileInputRef = useRef(null);

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
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
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
      const { error } = await supabase.from("support_messages").insert({
        conversation_id: conv.id,
        user_id: user.id,
        message: content,
        sender_type: "user",
      });

      if (error) throw error;
      setInput("");
      setShowEmoji(false);

      // Nếu đang ở chế độ AI → trả lời tự động
      if (conv.status === "ai") {
        setAiTyping(true);
        await new Promise((r) => setTimeout(r, 1200));

        const aiReply = getAIReply(content);
        await supabase.from("support_messages").insert({
          conversation_id: conv.id,
          user_id: user.id,
          message: aiReply,
          sender_type: "ai",
        });
        setAiTyping(false);
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

      await supabase.from("support_messages").insert({
        conversation_id: conv.id,
        user_id: user.id,
        message:
          "Đã gửi yêu cầu kết nối nhân viên. Vui lòng chờ trong giây lát ⏳",
        sender_type: "system",
      });

      setConv({ ...conv, status: "pending_agent" });
    } catch (error) {
      console.error("Request agent error:", error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-160px)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
        <button
          onClick={onBack}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md shadow-sky-200">
          {conv.status === "agent" ? (
            <Headphones size={18} />
          ) : (
            <Bot size={18} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-slate-900">
            {conv.status === "agent" ? "Nhân viên hỗ trợ" : "Trợ lý AI"}
          </p>
          <p className="text-[10px] text-emerald-600">
            {conv.status === "agent"
              ? "Đang trực tuyến"
              : conv.status === "pending_agent"
              ? "Đang kết nối nhân viên..."
              : "AI trả lời tự động"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto py-4"
      >
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={24} className="animate-spin text-slate-400" />
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {aiTyping && (
              <div className="flex items-end gap-2 justify-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md">
                  <Bot size={14} />
                </div>
                <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Suggestion buttons */}
      {conv.status === "ai" && !aiTyping && (
        <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-3">
          <button
            onClick={requestAgent}
            className="rounded-full border border-sky-200 bg-sky-50 px-3.5 py-2 text-xs font-bold text-sky-600 transition hover:bg-sky-100"
          >
            👨‍💼 Cho tôi gặp nhân viên
          </button>
          <button
            onClick={onCreateTicket}
            className="rounded-full border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
          >
            📩 Tạo phiếu hỗ trợ
          </button>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-slate-200 bg-white pt-3">
        <div className="flex items-end gap-2">
          <div className="flex flex-1 items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-sky-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-100">
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
              className="max-h-24 min-h-[32px] flex-1 resize-none bg-transparent py-1.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
            <button
              onClick={() => setShowEmoji((v) => !v)}
              className="shrink-0 text-slate-400 transition hover:text-amber-400"
            >
              <Smile size={20} />
            </button>
            {showEmoji && (
              <div className="absolute bottom-20 right-4 z-50">
                <EmojiPicker
                  onEmojiClick={(e) => setInput((prev) => prev + e.emoji)}
                  theme="light"
                  height={350}
                  width={300}
                />
              </div>
            )}
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-200 transition hover:brightness-110 active:scale-95 disabled:opacity-40"
          >
            {sending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.sender_type === "user";
  const isAI = message.sender_type === "ai";
  const isSystem = message.sender_type === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-500">
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
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md">
          {isAI ? <Bot size={14} /> : <Headphones size={14} />}
        </div>
      )}

      <div className={`max-w-[78%] ${isUser ? "items-end" : ""}`}>
        <div
          className={`rounded-2xl px-3.5 py-2.5 ${
            isUser
              ? "rounded-br-md bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-200"
              : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
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
          {message.sender_type === "agent" && (
            <span className="font-bold text-emerald-600">Nhân viên</span>
          )}
          <span>{formatTime(message.created_at)}</span>
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
      const ticketCode = `TKT-${Date.now().toString(36).toUpperCase()}`;

      const { error } = await supabase.from("support_tickets").insert({
        user_id: user.id,
        ticket_code: ticketCode,
        title: title.trim(),
        category,
        description: description.trim(),
        status: "open",
      });

      if (error) throw error;

      alert(`✅ Đã tạo phiếu hỗ trợ!\n\nMã: ${ticketCode}\n\nNhân viên sẽ phản hồi trong 24h.`);
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
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-lg font-black text-slate-900">
            Tạo phiếu hỗ trợ
          </h1>
          <p className="text-xs text-slate-500">
            Nhân viên sẽ phản hồi trong 24h
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Tiêu đề
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: Không nhận được Coin sau khi nạp"
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Loại vấn đề
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                    category === c.id
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
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={creating || !title.trim() || !description.trim()}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-sm font-black text-white shadow-md shadow-rose-200 transition hover:brightness-110 disabled:opacity-40"
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
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-lg font-black text-slate-900">
            Phiếu hỗ trợ của bạn
          </h1>
          <p className="text-xs text-slate-500">{tickets.length} phiếu</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-slate-400" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <FileText size={40} className="mx-auto text-slate-300" />
          <p className="mt-3 text-sm font-bold text-slate-700">
            Chưa có phiếu nào
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-sky-600">
                    #{t.ticket_code}
                  </p>
                  <p className="mt-1 truncate text-sm font-black text-slate-900">
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
                      : "bg-slate-50 text-slate-500"
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
