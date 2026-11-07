import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu, X, Headphones, ArrowUp, Square, Smile, Focus, Camera,
  Image as ImageIcon, Paperclip, CornerDownRight, Loader2, Check,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";

import { supabase } from "../../lib/supabaseClient.js";
import { AI_ENDPOINT, QUICK_ACTIONS, SUPPORT } from "./constants.js";
import BannerNotice from "./BannerNotice.jsx";
import HistoryDrawer from "./HistoryDrawer.jsx";
import MessageBubble from "./MessageBubble.jsx";
import ThinkingIndicator from "./ThinkingIndicator.jsx";
import FeedbackSheet from "./FeedbackSheet.jsx";
import GlowRing from "./GlowRing.jsx";
import "./chat.css";

export default function ChatView({
  conversation,
  user,
  onBack,
  onNewChat,
  onOpenConversation,
}) {
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
  const [conv, setConv] = useState(conversation);
  const [hiddenSuggestionIds, setHiddenSuggestionIds] = useState([]);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);

  // ── mới: hiệu ứng / phản hồi ──
  const [freshIds, setFreshIds] = useState(() => new Set());
  const [glowPulse, setGlowPulse] = useState(0);
  const [ratings, setRatings] = useState({}); // { [messageId]: "up" | "down" }
  const [feedbackFor, setFeedbackFor] = useState(null); // { msg, rating }
  const [toast, setToast] = useState(null); // { id, text }

  const scrollRef = useRef(null);
  const sentIds = useRef(new Set());
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const typewriterRef = useRef(null);
  const abortRef = useRef(null);
  const stoppedRef = useRef(false);

  const busy = sending || aiTyping || !!streamingMsgId;

  const stopTypewriter = () => {
    if (typewriterRef.current) {
      clearInterval(typewriterRef.current);
      typewriterRef.current = null;
    }
  };

  useEffect(() => () => stopTypewriter(), []);

  // ✅ Sync conv khi prop conversation đổi
  useEffect(() => {
    if (conversation?.id && conversation.id !== conv?.id) {
      setConv(conversation);
      setMessages([]);
      setLoading(true);
      stopTypewriter();
      setStreamingMsgId(null);
      setStreamingText("");
      setAiTyping(false);
      setSending(false);
      sentIds.current = new Set();
      setHiddenSuggestionIds([]);
      setPendingImage(null);
      setFreshIds(new Set());
      setRatings({});
    }
  }, [conversation?.id]);

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
    if (!loading && messages.length > 0) scrollToBottom(true);
  }, [messages.length, loading, aiTyping]);

  const showToast = (text) => setToast({ id: Date.now(), text });

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 1900);
    return () => clearTimeout(t);
  }, [toast]);

  const runTypewriter = (msg) => {
    stopTypewriter();
    setStreamingMsgId(msg.id);
    setStreamingText("");
    let idx = 0;
    const full = msg.message;
    typewriterRef.current = setInterval(() => {
      idx += 3;
      if (idx >= full.length) {
        stopTypewriter();
        setStreamingText(full);
        setTimeout(() => {
          setStreamingMsgId(null);
          setStreamingText("");
          setGlowPulse((n) => n + 1); // quét viền 1 lần khi AI trả lời xong
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
      // khôi phục đánh giá đã lưu (nếu bảng có cột `feedback`)
      const saved = {};
      (data || []).forEach((m) => {
        if (m.feedback?.rating) saved[m.id] = m.feedback.rating;
      });
      setRatings((prev) => ({ ...saved, ...prev }));
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setLoading(false);
      setTimeout(() => scrollToBottom(), 100);
    }
  };

  useEffect(() => {
    if (conversation?.id) {
      loadMessages();
    }
  }, [conversation?.id]);

  useEffect(() => {
    if (!conversation?.id) return;

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
          if (msg.sender_type === "ai" && msg.message) runTypewriter(msg);
          else scrollToBottom(true);
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
          setMessages((prev) =>
            prev.filter((m) => m.id !== payload.old.id)
          );
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [conversation?.id]);

  const callAI = async (imageUrl, messageText) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Chưa đăng nhập");

    const controller = new AbortController();
    abortRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const bodyPayload = {
      conversation_id: conversation.id,
      user_message: imageUrl ? "Phân tích ảnh này giúp mình" : messageText,
    };
    if (imageUrl) bodyPayload.image_url = imageUrl;

    try {
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

      if (!response.ok) {
        let errData = {};
        try {
          errData = await response.json();
        } catch (_) {}
        throw new Error(errData?.error || `AI trả về lỗi ${response.status}`);
      }
      return await response.json();
    } finally {
      clearTimeout(timeoutId);
      abortRef.current = null;
    }
  };

  const sendMessage = async (customText) => {
    const content = (customText || input).trim();
    if ((!content && !pendingImage) || busy || !user?.id) return;

    stoppedRef.current = false;
    setSending(true);
    try {
      let imageUrl = null;

      if (pendingImage) {
        const file = pendingImage.file;
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
        imageUrl = urlData?.publicUrl;
        if (!imageUrl) throw new Error("Không lấy được URL ảnh");
      }

      const { data: userMsg, error } = await supabase
        .from("support_messages")
        .insert({
          conversation_id: conversation.id,
          user_id: user.id,
          message: content || "",
          sender_type: "user",
          image_url: imageUrl,
        })
        .select()
        .single();

      if (error) throw error;
      sentIds.current.add(userMsg.id);

      setFreshIds((prev) => new Set(prev).add(userMsg.id));
      setMessages((prev) => [
        ...prev.filter((m) => m.sender_type !== "status"),
        userMsg,
      ]);
      setInput("");
      if (pendingImage) URL.revokeObjectURL(pendingImage.previewUrl);
      setPendingImage(null);
      setShowEmoji(false);
      setShowFileMenu(false);
      scrollToBottom(true);

      if (conv.status === "ai") {
        setAiTyping(true); // hiện "Đang suy nghĩ…" ngay lập tức
        try {
          const data = await callAI(imageUrl, content);
          console.log(
            `[Support AI] Provider: ${data.provider} (${data.model})`
          );

          // ✅ FALLBACK: Reload messages sau 2s để đảm bảo có reply
          setTimeout(() => {
            loadMessages();
          }, 2000);
        } catch (err) {
          if (stoppedRef.current) return; // người dùng chủ động dừng
          console.error("AI error:", err);
          setMessages((prev) =>
            prev.filter((m) => m.sender_type !== "status")
          );
          const { data: errMsg } = await supabase
            .from("support_messages")
            .insert({
              conversation_id: conversation.id,
              user_id: user.id,
              message:
                "Xin lỗi bạn, mình đang gặp sự cố kỹ thuật. Bạn thử lại sau hoặc liên hệ Zalo 0865245988 để được hỗ trợ trực tiếp nha 🌸",
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

  // Nút ■ : dừng chờ AI. (Nếu backend vẫn xử lý xong, câu trả lời vẫn có thể
  // hiện qua realtime — xem ghi chú trong phần hướng dẫn.)
  const stopGenerating = () => {
    stoppedRef.current = true;
    abortRef.current?.abort();
    stopTypewriter();
    setStreamingMsgId(null);
    setStreamingText("");
    setAiTyping(false);
    setMessages((prev) => prev.filter((m) => m.sender_type !== "status"));
    setGlowPulse((n) => n + 1);
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Chỉ hỗ trợ file ảnh");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Ảnh không được vượt quá 5MB");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setPendingImage({ file, previewUrl });
    setShowFileMenu(false);
  };

  const hideAllSuggestions = () => {
    setHiddenSuggestionIds((prev) => {
      const allIds = messages
        .filter((m) => m.suggestions?.length > 0)
        .map((m) => m.id);
      return [...new Set([...prev, ...allIds])];
    });
  };

  // ── Copy / phản hồi ──
  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Đã sao chép");
    } catch (_) {
      showToast("Không thể sao chép");
    }
  };

  const openFeedback = (msg, rating) => setFeedbackFor({ msg, rating });

  const submitFeedback = async ({ rating, tags, note }) => {
    const msg = feedbackFor?.msg;
    if (!msg) return;
    setRatings((prev) => ({ ...prev, [msg.id]: rating }));
    showToast("Cảm ơn bạn đã phản hồi");
    try {
      // Cần cột jsonb `feedback` trên support_messages (xem SQL trong hướng dẫn)
      const { error } = await supabase
        .from("support_messages")
        .update({ feedback: { rating, tags, note } })
        .eq("id", msg.id);
      if (error) console.warn("[Support] Chưa lưu được feedback:", error.message);
    } catch (err) {
      console.warn("[Support] Feedback error:", err);
    }
  };

  const hasInput = !!(input.trim() || pendingImage);
  const hasUserMsg = messages.some((m) => m.sender_type === "user");

  // ── Chip gợi ý phía trên ô nhập ──
  const lastMsg = messages[messages.length - 1];
  const suggestionList =
    lastMsg?.sender_type === "ai" &&
    lastMsg.suggestions?.length > 0 &&
    !hiddenSuggestionIds.includes(lastMsg.id)
      ? lastMsg.suggestions
      : null;
  const chips = suggestionList
    ? suggestionList.map((s) => ({ label: s, prompt: s }))
    : QUICK_ACTIONS.map((q) => ({ label: q.label, prompt: q.prompt }));
  const showChips = !loading && !busy && messages.length > 0;
  const chipsKey = suggestionList ? lastMsg.id : "quick";

  const statusMsg = messages.find((m) => m.sender_type === "status");
  const showThinking = (aiTyping || !!statusMsg) && !streamingMsgId;

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-[var(--chat-bg)]">
      {/* HEADER: ☰ | pill tiêu đề ✕ | tai nghe */}
      <div className="relative z-30 flex items-center gap-2 bg-[var(--chat-bg)]/90 px-3 pb-2 pt-2.5 backdrop-blur-xl">
        <button
          onClick={() => setShowHistoryDrawer(true)}
          aria-label="Lịch sử trò chuyện"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--chat-border)] bg-white text-[var(--chat-ink)] transition active:scale-95"
        >
          <Menu size={20} strokeWidth={2.2} />
        </button>

        <div className="flex h-10 min-w-0 flex-1 items-center gap-1 rounded-full border border-[var(--chat-border)] bg-[var(--chat-surface)] pl-4 pr-1.5">
          <h1 className="min-w-0 flex-1 truncate text-[15px] font-medium text-[var(--chat-ink)]">
            {conv?.title || "Chăm sóc khách hàng"}
          </h1>
          <button
            onClick={onBack}
            aria-label="Đóng cuộc trò chuyện"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--chat-muted)] transition hover:bg-black/5 active:scale-90"
          >
            <X size={16} strokeWidth={2.4} />
          </button>
        </div>

        <a
          href={SUPPORT.zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Gặp nhân viên qua Zalo"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#0068FF]/20 bg-white text-[#0068FF] transition active:scale-95"
        >
          <Headphones size={19} strokeWidth={2} />
        </a>
      </div>

      <BannerNotice />

      <HistoryDrawer
        open={showHistoryDrawer}
        onClose={() => setShowHistoryDrawer(false)}
        userId={user?.id || conversation?.user_id}
        currentConvId={conv.id}
        onOpenConversation={onOpenConversation}
        onNewChat={onNewChat}
      />

      {/* MESSAGES */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto px-4 py-5"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 size={20} className="animate-spin text-slate-300" />
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => {
              // tin "status" của backend → hiển thị bằng ThinkingIndicator bên dưới
              if (msg.sender_type === "status") return null;

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
                  isFresh={freshIds.has(msg.id)}
                  rating={ratings[msg.id] || null}
                  onRate={(r) => openFeedback(msg, r)}
                  onCopy={handleCopy}
                  onShowLogin={() => navigate("/login")}
                  hideLogin={hiddenSuggestionIds.includes(msg.id)}
                />
              );
            })}

            {showThinking && <ThinkingIndicator label={statusMsg?.message} />}
          </>
        )}
      </div>

      {/* CHIP GỢI Ý / HÀNH ĐỘNG NHANH */}
      {showChips && (
        <div
          key={chipsKey}
          className="no-scrollbar flex gap-2 overflow-x-auto bg-[var(--chat-bg)] px-4 pb-2 pt-1"
        >
          {chips.map((c, i) => (
            <button
              key={`${c.label}-${i}`}
              onClick={() => {
                hideAllSuggestions();
                sendMessage(c.prompt);
              }}
              style={{ "--i": i }}
              className="chip-in flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-[var(--chat-border)] bg-white py-2.5 pl-3.5 pr-4 text-[14px] font-medium text-[var(--chat-ink)] transition hover:bg-[var(--chat-surface)] active:scale-95"
            >
              <CornerDownRight
                size={16}
                strokeWidth={2}
                className="text-[var(--chat-muted)]"
              />
              {c.label}
            </button>
          ))}
        </div>
      )}

      {/* INPUT BAR */}
      <div className="relative bg-[var(--chat-bg)] px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-1.5">
        {pendingImage && (
          <div className="msg-in mb-2 flex items-center gap-3 rounded-2xl border border-[var(--chat-border)] bg-[var(--chat-surface)] p-2">
            <img
              src={pendingImage.previewUrl}
              alt="Xem trước"
              className="h-16 w-16 rounded-xl object-cover"
            />
            <div className="flex-1">
              <p className="text-[13px] font-medium text-[var(--chat-ink)]">
                Ảnh đã chọn
              </p>
              <p className="text-[11px] text-[var(--chat-muted)]">
                Nhập mô tả và bấm gửi
              </p>
            </div>
            <button
              onClick={() => {
                URL.revokeObjectURL(pendingImage.previewUrl);
                setPendingImage(null);
              }}
              aria-label="Bỏ ảnh"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 hover:bg-slate-100"
            >
              <X size={16} />
            </button>
          </div>
        )}
{/* Ô nhập dạng viên thuốc + viền sáng */}
        <div className="relative flex h-[58px] items-center gap-2 rounded-[29px] border border-[var(--chat-border)] bg-[var(--chat-surface)] pl-2 pr-2 transition focus-within:border-[#c3c7d1] focus-within:bg-white">
          <GlowRing active={busy} pulseKey={glowPulse} />

          <button
            onClick={() => setShowFileMenu(true)}
            aria-label="Đính kèm ảnh"
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--chat-border)] bg-white text-[var(--chat-ink)] transition active:scale-90"
          >
            <Focus size={19} strokeWidth={2} />
          </button>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={
              hasUserMsg ? "Hỏi thêm…" : "Nhập yêu cầu của bạn tại đây nhé"
            }
            className="relative h-full min-w-0 flex-1 bg-transparent text-[15px] text-[var(--chat-ink)] outline-none placeholder:text-[#a9adbb]"
          />

          {!hasInput && !busy && (
            <button
              onClick={() => setShowEmoji(true)}
              aria-label="Chèn emoji"
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--chat-muted)] transition active:scale-90"
            >
              <Smile size={21} strokeWidth={2} />
            </button>
          )}

          {busy ? (
            <button
              onClick={stopGenerating}
              aria-label="Dừng"
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--chat-ink)] text-white transition active:scale-90"
            >
              <Square size={13} strokeWidth={0} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={() => sendMessage()}
              disabled={!hasInput}
              aria-label="Gửi"
              className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition active:scale-90 ${
                hasInput
                  ? "bg-[var(--chat-ink)] text-white"
                  : "bg-[#d9dce5] text-white"
              }`}
            >
              <ArrowUp size={20} strokeWidth={2.4} />
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileSelect(f);
            e.target.value = "";
          }}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileSelect(f);
            e.target.value = "";
          }}
        />

        {/* FILE MENU */}
        {showFileMenu && (
          <>
            <div
              className="fade-in fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
              onClick={() => setShowFileMenu(false)}
            />
            <div className="sheet-up fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-2xl rounded-t-[28px] bg-white pb-[max(20px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_40px_rgba(17,20,24,0.12)]">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
              <div className="px-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[var(--chat-ink)]">
                    Tải lên
                  </h3>
                  <button
                    onClick={() => {
                      setShowFileMenu(false);
                      fileInputRef.current?.click();
                    }}
                    className="text-sm font-semibold text-blue-500"
                  >
                    Tất cả ảnh
                  </button>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-4">
                  {[
                    {
                      label: "Chụp ảnh",
                      Icon: Camera,
                      onClick: () => cameraInputRef.current?.click(),
                    },
                    {
                      label: "Album",
                      Icon: ImageIcon,
                      onClick: () => fileInputRef.current?.click(),
                    },
                    { label: "Tệp", Icon: Paperclip, onClick: () => {} },
                  ].map(({ label, Icon, onClick }) => (
                    <button
                      key={label}
                      onClick={() => {
                        setShowFileMenu(false);
                        onClick();
                      }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--chat-surface)] text-[var(--chat-ink)] transition active:scale-95">
                        <Icon size={32} strokeWidth={1.8} />
                      </div>
                      <span className="text-[13px] font-medium text-slate-700">
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* EMOJI PICKER */}
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

      {/* TOAST */}
      {toast && (
        <div
          key={toast.id}
          role="status"
          className="toast-pop pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom)+92px)] left-1/2 z-[80] flex items-center gap-2 rounded-full border border-[var(--chat-border)] bg-white px-4 py-2 text-[13px] font-medium text-[var(--chat-ink)] shadow-[0_8px_24px_rgba(17,20,24,0.12)]"
        >
          <Check size={15} strokeWidth={2.6} />
          {toast.text}
        </div>
      )}

      {/* FEEDBACK SHEET */}
      <FeedbackSheet
        open={!!feedbackFor}
        rating={feedbackFor?.rating}
        onClose={() => setFeedbackFor(null)}
        onSubmit={submitFeedback}
      />
    </div>
  );
            }
