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
  Menu,
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

// ✅ TikTok style — Icon đơn sắc, không màu gradient
const CATEGORIES = [
  { id: "account", label: "Tài khoản", icon: User, color: "#FE2C55" },
  { id: "payment", label: "Thanh toán", icon: CreditCard, color: "#FF6B00" },
  { id: "order", label: "Đơn hàng", icon: Package, color: "#00C2FF" },
  { id: "bug", label: "Báo lỗi", icon: Bug, color: "#8B5CF6" },
  { id: "other", label: "Khác", icon: MoreHorizontal, color: "#6B7280" },
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
    return `Chào bạn! Mình nhận thấy bạn cần hỗ trợ về **${cat.label}**.\n\nBạn có thể mô tả chi tiết vấn đề để mình hỗ trợ chính xác hơn nhé! 👇`;
  }
  return `Xin chào! 👋 Mình là trợ lý AI của NXX315 Studio.\n\nMình có thể giúp gì cho bạn hôm nay?`;
    }
export default function Support() {
  const [view, setView] = useState("home");
  const [user, setUser] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

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
    <div className="min-h-screen bg-white pb-24 text-slate-900">
      <TopHeader />

      <main className="mx-auto w-full max-w-2xl">
        {view === "home" && <HomeView onStartChat={startAIChat} />}

        {view === "chat" && conversation && (
          <ChatView
            conversation={conversation}
            user={user}
            category={selectedCategory}
            onBack={() => setView("home")}
          />
        )}
      </main>

      <BottomNav />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// HOME VIEW — Chuẩn TikTok
// ═══════════════════════════════════════════════════════════

function HomeView({ onStartChat }) {
  return (
    <div className="bg-white">
      {/* ─── HEADER ─── */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
        <button
          onClick={() => window.history.back()}
          className="flex h-8 w-8 items-center justify-center text-slate-900"
        >
          <ArrowLeft size={22} strokeWidth={2.2} />
        </button>
        <h1 className="text-base font-bold text-slate-900">
          Bộ phận Hỗ trợ
        </h1>
        <button className="flex h-8 w-8 items-center justify-center text-slate-900">
          <Menu size={20} strokeWidth={2.2} />
        </button>
      </div>

      {/* ─── TITLE ─── */}
      <div className="px-4 pb-5 pt-6">
        <h2 className="text-center text-2xl font-bold leading-tight text-slate-900">
          Chúng tôi sẵn sàng hỗ trợ!
          <br />
          Chọn loại vấn đề.
        </h2>
      </div>

      {/* ─── GRID CATEGORIES ─── */}
      <div className="grid grid-cols-2 gap-3 px-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => onStartChat(cat.id)}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 text-left transition active:scale-[0.97]"
            >
              <Icon
                size={24}
                style={{ color: cat.color }}
                strokeWidth={2.2}
              />
              <span className="text-[15px] font-semibold text-slate-900">
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── DIVIDER ─── */}
      <div className="mx-4 my-5 border-t border-slate-100" />

      {/* ─── TICKET CTA ─── */}
      <div className="px-4 pb-4">
        <button
          onClick={() => onStartChat("other")}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-4 transition active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <Ticket size={24} className="text-slate-900" strokeWidth={2.2} />
            <div className="text-left">
              <p className="text-[15px] font-semibold text-slate-900">
                Tạo phiếu hỗ trợ
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Nhân viên sẽ xử lý
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </button>
      </div>

      {/* ─── DISCLAIMER ─── */}
      <div className="px-4 pb-6 pt-2">
        <p className="text-center text-xs leading-5 text-slate-500">
          Có thể câu trả lời là do AI tạo, do đó có thể sẽ có sai sót.{" "}
          <button className="font-medium text-sky-600">Tìm hiểu thêm</button>
        </p>
      </div>
    </div>
  );
}
function ChatView({ conversation, user, category, onBack }) {
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

          if (!response.ok) {
            const err = await response.json();
            throw new Error(err?.error || "AI lỗi");
          }
        } catch (err) {
          console.error("AI error:", err);
          const { data: errMsg } = await supabase
            .from("support_messages")
            .insert({
              conversation_id: conv.id,
              user_id: user.id,
              message:
                "Xin lỗi, mình gặp sự cố kỹ thuật. Bạn thử lại sau nhé! 🙏",
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
          message: "Để tôi kiểm tra",
          sender_type: "ai",
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

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* ─── HEADER ─── */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <button
          onClick={onBack}
          className="flex h-8 w-8 shrink-0 items-center justify-center text-slate-900"
        >
          <ArrowLeft size={22} strokeWidth={2.2} />
        </button>
        <h1 className="flex-1 truncate text-base font-bold text-slate-900">
          Bộ phận Hỗ trợ
        </h1>
        <button className="flex h-8 w-8 shrink-0 items-center justify-center text-slate-900">
          <Menu size={20} strokeWidth={2.2} />
        </button>
      </div>

      {/* ─── MESSAGES ─── */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 size={20} className="animate-spin text-slate-300" />
          </div>
        ) : (
          <>
            {/* Label "Bộ phận Hỗ trợ của TikTok" style */}
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0A84FF]">
                <Headphones size={13} className="text-white" strokeWidth={2.4} />
              </div>
              <span className="text-xs text-slate-500">
                Bộ phận Hỗ trợ của NXX315
              </span>
            </div>

            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {aiTyping && (
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0A84FF]">
                  <Headphones size={13} className="text-white" strokeWidth={2.4} />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <div className="flex gap-1">
                    <span
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Nút gợi ý như TikTok */}
            {conv.status === "ai" &&
              !aiTyping &&
              messages.length >= 2 && (
                <div className="flex flex-col items-end gap-2 pt-2">
                  <button
                    onClick={requestAgent}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-slate-50 active:scale-[0.97]"
                  >
                    Cho tôi gặp nhân viên
                  </button>
                </div>
              )}
          </>
        )}
      </div>

      {/* ─── RATING BUTTON ─── */}
      <div className="flex justify-start px-4 pb-3">
        <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50">
          Đánh giá trải nghiệm
        </button>
      </div>

      {/* ─── INPUT (TikTok style) ─── */}
      <div className="border-t border-slate-100 bg-white px-4 py-3">
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
            className="h-10 flex-1 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300"
          />

          {input.trim() ? (
            <button
              onClick={sendMessage}
              disabled={sending}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0A84FF] text-white transition active:scale-95 disabled:opacity-40"
            >
              {sending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} strokeWidth={2.4} />
              )}
            </button>
          ) : (
            <button
              onClick={() => setShowEmoji((v) => !v)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 transition active:scale-95"
            >
              <Plus size={20} strokeWidth={2.4} />
            </button>
          )}
        </div>

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

// ═══════════════════════════════════════════════════════════
// MESSAGE BUBBLE — Style TikTok (không có avatar tròn, có label trên)
// ═══════════════════════════════════════════════════════════

function MessageBubble({ message }) {
  const isUser = message.sender_type === "user";
  const isAI = message.sender_type === "ai";
  const isAgent = message.sender_type === "agent";
  const isSystem = message.sender_type === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500">
          {message.message}
        </div>
      </div>
    );
  }

  // User — bong bóng xanh nằm bên phải
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl bg-[#0A84FF] px-4 py-2.5 text-white">
          <p className="whitespace-pre-wrap break-words text-sm leading-6">
            {message.message}
          </p>
        </div>
      </div>
    );
  }

  // AI/Admin — bong bóng trắng + label trên
  return (
    <div className="flex items-start gap-2">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0A84FF]">
        <Headphones size={13} className="text-white" strokeWidth={2.4} />
      </div>
      <div className="max-w-[85%] flex-1">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <div className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-900">
            {renderMessageWithBold(message.message)}
          </div>
        </div>
        {isAI && (
          <div className="mt-1.5 flex items-center justify-between px-1">
            <span className="text-[10px] text-slate-400">
              ✨ Do AI tạo
            </span>
            <div className="flex items-center gap-2">
              <button className="text-slate-400 transition hover:text-slate-600">
                👍
              </button>
              <button className="text-slate-400 transition hover:text-slate-600">
                👎
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Render **bold** markdown
function renderMessageWithBold(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
              }
