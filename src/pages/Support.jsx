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
  Smile,
  X,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";

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

// Welcome message cố định
const WELCOME_MESSAGE = {
  id: "welcome",
  message:
    "Xin chào bạn! 👋\n\nNếu bạn gặp bất kỳ vấn đề gì khi sử dụng dịch vụ, hãy nhắn tin cho chúng tôi tại đây. Đội ngũ hỗ trợ sẽ phản hồi trong thời gian sớm nhất.\n\n⏰ Thời gian hỗ trợ: 8:00 - 24:00 (T2 - CN)",
  is_admin: true,
  created_at: new Date().toISOString(),
};

function formatTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
export default function Support() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const sentMessageIds = useRef(new Set()); // Tránh nhân đôi tin nhắn

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
          const newMsg = payload.new;

          // ✅ Tránh trùng: nếu đã có tin với id này → bỏ qua
          if (sentMessageIds.current.has(newMsg.id)) {
            sentMessageIds.current.delete(newMsg.id);
            return;
          }

          setMessages((prev) => {
            // Nếu tin đã tồn tại → bỏ qua
            if (prev.some((m) => m.id === newMsg.id)) return prev;

            // Xóa optimistic "temp-xxx" của user nếu trùng content + thời gian gần
            const filtered = prev.filter((m) => {
              if (
                typeof m.id === "string" &&
                m.id.startsWith("temp-") &&
                m.message === newMsg.message &&
                m.user_id === newMsg.user_id
              ) {
                return false;
              }
              return true;
            });

            return [...filtered, newMsg];
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

  // Gửi tin nhắn text
  const sendMessage = async () => {
    const content = input.trim();
    if (!content || sending || !user?.id) return;

    setSending(true);
    try {
      const { data, error } = await supabase
        .from("live_chat_messages")
        .insert({
          user_id: user.id,
          message: content,
          is_admin: false,
        })
        .select()
        .single();

      if (error) throw error;

      // ✅ Đánh dấu tin này đã gửi → realtime sẽ bỏ qua
      sentMessageIds.current.add(data.id);

      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });

      setInput("");
      setShowEmoji(false);
      scrollToBottom();
    } catch (error) {
      console.error("Send error:", error);
      alert("Không thể gửi tin nhắn. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  // Gửi ảnh
  const handleImageUpload = async (file) => {
    if (!file || !user?.id) return;

    setUploadingImage(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("chat_images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("chat_images").getPublicUrl(fileName);

      const { data, error } = await supabase
        .from("live_chat_messages")
        .insert({
          user_id: user.id,
          message: "📷 Hình ảnh",
          image_url: publicUrl,
          is_admin: false,
        })
        .select()
        .single();

      if (error) throw error;

      sentMessageIds.current.add(data.id);
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
      scrollToBottom();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Không thể gửi ảnh. Vui lòng thử lại.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Đóng emoji khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target)
      ) {
        setShowEmoji(false);
      }
    };
    if (showEmoji) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmoji]);

  return (
    <div className="min-h-screen bg-[#0d1424] text-white">
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
            <h1 className="text-lg font-black text-white">
              Hỗ trợ trực tuyến
            </h1>
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

          <button
            onClick={() => setShowContact(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
          >
            <Headphones size={18} />
          </button>
        </div>

        {/* Chat container */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111a2e]">
          {/* Messages */}
          <div
            ref={scrollRef}
            className="min-h-[420px] max-h-[60vh] flex-1 space-y-3 overflow-y-auto p-4"
          >
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 size={24} className="animate-spin text-slate-500" />
              </div>
            ) : (
              <>
                {/* Welcome message cố định */}
                <ChatBubble message={WELCOME_MESSAGE} isWelcome />

                {/* Tin nhắn từ DB */}
                {messages.map((msg) => (
                  <ChatBubble key={msg.id} message={msg} />
                ))}
              </>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-white/10 bg-[#0d1424] p-3">
            <div className="flex items-end gap-2">
              {/* Nút ảnh */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage || sending}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
              >
                {uploadingImage ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <ImageIcon size={18} />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Input + emoji */}
              <div className="relative flex flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 focus-within:border-sky-400 focus-within:bg-white/10">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Chat với chúng tôi..."
                  rows={1}
                  className="max-h-24 min-h-[32px] flex-1 resize-none bg-transparent py-1.5 text-sm text-white outline-none placeholder:text-slate-500"
                />
                <button
                  onClick={() => setShowEmoji((v) => !v)}
                  className="shrink-0 text-slate-400 transition hover:text-amber-400"
                >
                  <Smile size={20} />
                </button>

                {/* Emoji Picker */}
                {showEmoji && (
                  <div
                    ref={emojiPickerRef}
                    className="absolute bottom-full right-0 z-50 mb-2"
                  >
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      theme="dark"
                      height={380}
                      width={320}
                    />
                  </div>
                )}
              </div>

              {/* Nút gửi */}
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

      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
    </div>
  );
                }
function ChatBubble({ message, isWelcome = false }) {
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
          className={`overflow-hidden rounded-2xl ${
            isAdmin
              ? `rounded-bl-md border ${
                  isWelcome
                    ? "border-sky-400/30 bg-gradient-to-br from-sky-500/15 to-blue-600/10"
                    : "border-white/10 bg-white/5"
                } text-white`
              : "rounded-br-md bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20"
          }`}
        >
          {/* Image nếu có */}
          {message.image_url && (
            <div className="relative">
              <img
                src={message.image_url}
                alt="attachment"
                className="max-h-72 w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}

          {/* Text */}
          {message.message && (
            <div className="px-3.5 py-2.5">
              <p className="whitespace-pre-wrap break-words text-sm leading-6">
                {message.message}
              </p>
            </div>
          )}
        </div>

        {/* Time */}
        <div
          className={`mt-1 flex items-center gap-1 px-1 text-[10px] text-slate-500 ${
            isAdmin ? "justify-start" : "justify-end"
          }`}
        >
          {isAdmin && !isWelcome && (
            <span className="font-bold text-emerald-400">Admin</span>
          )}
          {isWelcome ? (
            <span className="italic text-sky-400">Tin nhắn hệ thống</span>
          ) : (
            <>
              <span>{formatTime(message.created_at)}</span>
              {!isAdmin && <CheckCheck size={10} />}
            </>
          )}
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

function ContactModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-t-3xl border border-white/10 bg-[#0d1424] shadow-2xl sm:rounded-3xl">
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
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5"
            >
              <X size={18} />
            </button>
          </div>
        </div>

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
