import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Send,
  Loader2,
  MessageCircle,
  Phone,
  Mail,
  Headphones,
  Clock,
  CheckCheck,
  Image as ImageIcon,
  X,
} from "lucide-react";

import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { supabase } from "../lib/supabaseClient.js";

// Contact info
const SUPPORT = {
  zalo: "0865245988",
  zaloUrl: "https://zalo.me/0865245988",
  email: "nxx315hub@gmail.com",
  hours: "8:00 - 24:00 (T2 - CN)",
};

function formatTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();

  if (isToday) return formatTime(value);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
}
export default function Support() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const scrollRef = useRef(null);

  // Load user
  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    loadUser();
  }, []);

  // Load messages
  const loadMessages = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("live_chat_messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Load messages error:", error);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  useEffect(() => {
    if (user?.id) loadMessages();
  }, [user?.id]);

  // Realtime subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`live-chat-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "live_chat_messages",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setMessages((prev) => {
            // Tránh trùng
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  };

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || sending || !user?.id) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from("live_chat_messages")
        .insert({
          user_id: user.id,
          message: content,
          is_admin: false,
        });

      if (error) throw error;

      // Optimistic update
      const optimisticMsg = {
        id: `temp-${Date.now()}`,
        user_id: user.id,
        message: content,
        is_admin: false,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticMsg]);
      setInput("");
      scrollToBottom();
    } catch (error) {
      console.error("Send error:", error);
      alert("Không thể gửi tin nhắn. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <TopHeader />

      <main className="mx-auto flex w-full max-w-2xl flex-col px-4 py-4">
        {/* Header */}
        <div className="mb-3 flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-black text-white">Hỗ trợ trực tuyến</h1>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <p className="text-xs text-emerald-400">
                Đang hoạt động · Phản hồi trong 5 phút
              </p>
            </div>
          </div>

          {/* Contact button */}
          <button
            onClick={() => setShowContact(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
          >
            <Headphones size={18} />
          </button>
        </div>

        {/* Welcome banner */}
        <div className="mb-3 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-sky-500/10 to-blue-600/5 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg shadow-sky-500/30">
              <MessageCircle size={18} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white">
                Xin chào! Chúng tôi có thể giúp gì cho bạn?
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Nhắn tin trực tiếp với đội ngũ hỗ trợ. Phản hồi nhanh chóng từ 8h - 24h mỗi ngày.
              </p>
            </div>
          </div>
        </div>

        {/* Chat container */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f1e]">
          {/* Messages */}
          <div
            ref={scrollRef}
            className="min-h-[380px] max-h-[60vh] flex-1 space-y-3 overflow-y-auto p-4"
          >
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 size={24} className="animate-spin text-slate-500" />
              </div>
            ) : messages.length === 0 ? (
              <EmptyState />
            ) : (
              messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))
            )}
          </div>

          {/* Input */}
          <div className="border-t border-white/10 bg-[#0f172a] p-3">
            <div className="flex items-end gap-2">
              <div className="flex flex-1 items-end gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 focus-within:border-sky-400 focus-within:bg-white/10">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Chat với chúng tôi..."
                  rows={1}
                  className="max-h-24 min-h-[32px] flex-1 resize-none bg-transparent py-1.5 text-sm text-white outline-none placeholder:text-slate-500"
                />
              </div>

              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30 transition hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:shadow-none"
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
      </main>

      <BottomNav />

      {/* Contact Modal */}
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
    </div>
  );
    }
function ChatBubble({ message }) {
  const isAdmin = message.is_admin === true;

  return (
    <div
      className={`flex items-end gap-2 ${
        isAdmin ? "justify-start" : "justify-end"
      }`}
    >
      {/* Admin avatar */}
      {isAdmin && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-md shadow-emerald-500/30">
          <Headphones size={14} className="text-white" />
        </div>
      )}

      <div className={`max-w-[75%] ${isAdmin ? "" : "items-end"}`}>
        <div
          className={`rounded-2xl px-3.5 py-2.5 ${
            isAdmin
              ? "rounded-bl-md border border-white/10 bg-white/5 text-white"
              : "rounded-br-md bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20"
          }`}
        >
          <p className="whitespace-pre-wrap break-words text-sm leading-6">
            {message.message}
          </p>
        </div>
        <div
          className={`mt-1 flex items-center gap-1 px-1 text-[10px] text-slate-500 ${
            isAdmin ? "justify-start" : "justify-end"
          }`}
        >
          {isAdmin && (
            <span className="font-bold text-emerald-400">Admin</span>
          )}
          <span>{formatTime(message.created_at)}</span>
          {!isAdmin && <CheckCheck size={10} />}
        </div>
      </div>

      {/* User avatar */}
      {!isAdmin && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/20">
          <span className="text-[11px] font-black">U</span>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
        <MessageCircle size={28} className="text-slate-500" />
      </div>
      <p className="mt-3 text-sm font-bold text-white">
        Bắt đầu cuộc trò chuyện
      </p>
      <p className="mt-1 max-w-xs text-xs text-slate-500">
        Gửi tin nhắn đầu tiên để được hỗ trợ. Chúng tôi sẽ phản hồi trong vài phút.
      </p>
    </div>
  );
}
function ContactModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-t-3xl border border-white/10 bg-[#0f172a] shadow-2xl sm:rounded-3xl">
        {/* Header */}
        <div className="relative border-b border-white/5 p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Headphones size={14} className="text-sky-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400">
                  Liên hệ hỗ trợ
                </span>
              </div>
              <h3 className="mt-1 text-base font-black text-white">
                Kênh liên hệ khác
              </h3>
              <p className="mt-0.5 text-xs text-slate-400">
                Nếu cần hỗ trợ gấp
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-3 p-5">
          {/* Zalo */}
          <a
            href={SUPPORT.zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-sky-500/40 hover:bg-white/10"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30">
              <span className="text-lg font-black text-white">Z</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-white">Zalo</p>
              <p className="mt-0.5 text-xs text-slate-400">
                {SUPPORT.zalo}
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-400 transition group-hover:bg-sky-500 group-hover:text-white">
              <Phone size={14} />
            </div>
          </a>

          {/* Email */}
          <a
            href={`mailto:${SUPPORT.email}`}
            className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-sky-500/40 hover:bg-white/10"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 shadow-lg shadow-rose-500/30">
              <Mail size={20} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-white">Email</p>
              <p className="mt-0.5 truncate text-xs text-slate-400">
                {SUPPORT.email}
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-400 transition group-hover:bg-sky-500 group-hover:text-white">
              <Send size={14} />
            </div>
          </a>

          {/* Hours */}
          <div className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/20">
              <Clock size={20} className="text-amber-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-amber-300">
                Giờ hỗ trợ
              </p>
              <p className="mt-0.5 text-xs text-amber-400/80">
                {SUPPORT.hours}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 p-5">
          <button
            onClick={onClose}
            className="h-12 w-full rounded-xl bg-white/5 text-sm font-black text-white transition hover:bg-white/10"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
