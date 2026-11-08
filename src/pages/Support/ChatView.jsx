// src/pages/Support/ChatView.jsx

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUp, Camera, CornerDownRight, Headphones, Image as ImageIcon,
  Paperclip, Plus, Smile, Sparkles, X, AlertTriangle
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";

import { supabase } from "../../lib/supabaseClient.js";
import { AI_ENDPOINT, QUICK_ACTIONS, SUPPORT } from "./constants.js";
import { cleanAIText } from "./helpers.js";
import BannerNotice from "./BannerNotice.jsx";
import StatusBubble from "./StatusBubble.jsx";
import HistoryDrawer from "./HistoryDrawer.jsx";
import MessageBubble from "./MessageBubble.jsx";
import FeedbackSheet from "./FeedbackSheet.jsx";
import GradientHeadline from "./GradientHeadline.jsx";
import GlowFrame from "./GlowFrame.jsx";
import ThinkingIndicator, { ThinkingSpinner } from "./ThinkingIndicator.jsx";
import "./chat-effects.css";

// LƯỚI BẮT LỖI
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 text-red-600 h-full flex flex-col items-center justify-center text-center">
          <AlertTriangle size={48} className="mb-4" />
          <h2 className="text-xl font-bold mb-2">Đã xảy ra lỗi giao diện!</h2>
          <p className="text-sm">{this.state.error?.message || "Lỗi không xác định"}</p>
          <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg">Tải lại trang</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const HIDE_HEADER_ON_SCROLL = true;
const HERO_PHRASES = [
  "Hỏi NXX bất cứ điều gì",
  "Gửi ảnh lỗi, NXX xem giúp",
  "Tra đơn, hoàn tiền, đổi thưởng",
];

const MemoBubble = React.memo(
  MessageBubble,
  (a, b) =>
    a.message === b.message &&
    a.streamingText === b.streamingText &&
    a.isLastAIMessage === b.isLastAIMessage &&
    a.sending === b.sending &&
    a.hiddenSuggestionIds === b.hiddenSuggestionIds &&
    a.animateIn === b.animateIn &&
    a.showFeedback === b.showFeedback &&
    a.feedback === b.feedback
);

function ChatViewContent({
  conversation,
  user,
  initialMessage,
  onBack,
  onNewChat,
  onOpenConversation,
}) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState(initialMessage || "");
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
  const [headerHidden, setHeaderHidden] = useState(false);
  const [feedback, setFeedback] = useState({});
  const [feedbackTarget, setFeedbackTarget] = useState(null);

  const scrollRef = useRef(null);
  const lastScrollY = useRef(0);
  const inputRef = useRef(null);
  const sentIds = useRef(new Set());
  const freshIds = useRef(new Set());
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const initialSent = useRef(false);
  const twRaf = useRef(0);

  useEffect(() => {
    if (conversation?.id && conversation.id !== conv?.id) {
      setConv(conversation);
      setMessages([]);
      setLoading(true);
      setStreamingMsgId(null);
      setStreamingText("");
      setAiTyping(false);
      setSending(false);
      sentIds.current = new Set();
      freshIds.current = new Set();
      setHiddenSuggestionIds([]);
      setPendingImage(null);
      setFeedback({});
      setFeedbackTarget(null);
      setHeaderHidden(false);
    }
  }, [conversation?.id]);

  useEffect(() => () => cancelAnimationFrame(twRaf.current), []);

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
  }, [messages.length, loading]);

  useEffect(() => {
    if (!streamingMsgId) return;
    const el = scrollRef.current;
    if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 160) {
      el.scrollTo({ top: el.scrollHeight, behavior: "instant" });
    }
  }, [streamingText, streamingMsgId]);

  useEffect(() => {
    if (initialMessage && !loading && messages.length > 0 && !initialSent.current) {
      initialSent.current = true;
      sendMessage(initialMessage);
    }
  }, [initialMessage, loading, messages.length]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

  const runTypewriter = (msg) => {
    cancelAnimationFrame(twRaf.current);
    setStreamingMsgId(msg.id);
    setStreamingText("");
    const full = msg.message || "";
    const CPS = 110;
    const start = performance.now();
    let last = 0;

    const tick = (now) => {
      const n = Math.min(full.length, Math.floor(((now - start) / 1000) * CPS));
      if (n === full.length || n - last >= 6) {
        last = n;
        setStreamingText(full.slice(0, n));
      }
      if (n < full.length) {
        twRaf.current = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setStreamingMsgId(null);
          setStreamingText("");
          scrollToBottom(true);
        }, 100);
      }
    };
    twRaf.current = requestAnimationFrame(tick);
  };

  const loadMessages = async (silent = false) => {
    if (!silent) setLoading(true);
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
      if (!silent) {
        setLoading(false);
        setTimeout(() => scrollToBottom(), 100);
      }
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
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_messages", filter: `conversation_id=eq.${conversation.id}` }, (payload) => {
          const msg = payload.new;
          if (sentIds.current.has(msg.id)) return;
          freshIds.current.add(msg.id);
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            if (msg.sender_type === "ai" || msg.sender_type === "system") {
              const withoutStatus = prev.filter((m) => m.sender_type !== "status");
              return [...withoutStatus, msg];
            }
            return [...prev, msg];
          });
          if (msg.sender_type === "ai" && msg.message) runTypewriter(msg);
          else scrollToBottom(true);
        }
      )
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "support_messages", filter: `conversation_id=eq.${conversation.id}` }, (payload) => {
          const msg = payload.new;
          setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, ...msg } : m)));
        }
      )
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "support_messages", filter: `conversation_id=eq.${conversation.id}` }, (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [conversation?.id]);
 
const callAI = async (imageUrl, messageText) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Chưa đăng nhập");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  const bodyPayload = {
    conversation_id: conversation.id,
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
    try { errData = await response.json(); } catch (_) {}
    throw new Error(errData?.error || `AI trả về lỗi ${response.status}`);
  }
  return response.json();
};

const sendMessage = async (customText) => {
  const content = (customText || input).trim();
  if ((!content && !pendingImage) || sending || !user?.id) return;

  setSending(true);
  try {
    let imageUrl = null;

    if (pendingImage) {
      const file = pendingImage.file;
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("support-images")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("support-images").getPublicUrl(fileName);
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
    freshIds.current.add(userMsg.id);

    setMessages((prev) => [...prev.filter((m) => m.sender_type !== "status"), userMsg]);
    setInput("");
    if (pendingImage) URL.revokeObjectURL(pendingImage.previewUrl);
    setPendingImage(null);
    setShowEmoji(false);
    setShowFileMenu(false);
    scrollToBottom(true);

    if (conv.status === "ai") {
      const typingTimer = setTimeout(() => setAiTyping(true), 600);
      try {
        const data = await callAI(imageUrl, content);
        console.log(`[Support AI] Provider: ${data.provider} (${data.model})`);
        setTimeout(() => { loadMessages(true); }, 2000);
      } catch (err) {
        console.error("AI error:", err);
        setMessages((prev) => prev.filter((m) => m.sender_type !== "status"));
        const { data: errMsg } = await supabase
          .from("support_messages")
          .insert({
            conversation_id: conversation.id,
            user_id: user.id,
            message: "Xin lỗi bạn, mình đang gặp sự cố kỹ thuật. Bạn thử lại sau hoặc liên hệ Zalo 0865245988 để được hỗ trợ trực tiếp nha 🌸",
            sender_type: "ai",
            suggestions: [],
          })
          .select()
          .single();
        if (errMsg) {
          sentIds.current.add(errMsg.id);
          freshIds.current.add(errMsg.id);
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

const handleFileSelect = (file) => {
  if (!file) return;
  if (!file.type.startsWith("image/")) return alert("Chỉ hỗ trợ file ảnh");
  if (file.size > 5 * 1024 * 1024) return alert("Ảnh không được vượt quá 5MB");
  const previewUrl = URL.createObjectURL(file);
  setPendingImage({ file, previewUrl });
  setShowFileMenu(false);
};

const hideAllSuggestions = () => {
  setHiddenSuggestionIds((prev) => {
    const allIds = messages.filter((m) => m.suggestions?.length > 0).map((m) => m.id);
    return [...new Set([...prev, ...allIds])];
  });
};

const openFeedback = (message, rating) => {
  if (feedback[message.id]?.status === "sent") return;
  setFeedback((prev) => ({ ...prev, [message.id]: { rating, status: "draft" } }));
  setFeedbackTarget({ message, rating });
};

const closeFeedback = () => {
  if (feedbackTarget) {
    const id = feedbackTarget.message.id;
    setFeedback((prev) => {
      if (prev[id]?.status !== "draft") return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }
  setFeedbackTarget(null);
};

const submitFeedback = async ({ reasons, comment }) => {
  if (!feedbackTarget) return;
  const { message, rating } = feedbackTarget;
  setFeedback((prev) => ({ ...prev, [message.id]: { rating, status: "sent" } }));
  setFeedbackTarget(null);
  try {
    await supabase.from("support_message_feedback").insert({
      message_id: String(message.id),
      conversation_id: String(conversation.id),
      user_id: user?.id,
      rating,
      reasons,
      comment: comment || null,
    });
  } catch (e) { console.warn(e); }
};

const handleScroll = (e) => {
  if (!HIDE_HEADER_ON_SCROLL) return;
  const el = e.currentTarget;
  const y = el.scrollTop;
  const dy = y - lastScrollY.current;
  if (Math.abs(dy) < 10) return;
  const overscroll = y < 0 || y > el.scrollHeight - el.clientHeight;
  if (overscroll) return;
  if (y < 48) setHeaderHidden(false);
  else setHeaderHidden(dy > 0);
  lastScrollY.current = y;
};

const hasInput = Boolean(input.trim() || pendingImage);
const busy = sending || aiTyping || Boolean(streamingMsgId);
const hasStatusMsg = messages.some((m) => m.sender_type === "status");
const hasUserMsg = messages.some((m) => m.sender_type === "user");
const isHero = !loading && messages.length > 0 && !hasUserMsg && !hasStatusMsg;

const lastMsg = messages[messages.length - 1];
const lastAiSuggestions =
  lastMsg?.sender_type === "ai" && lastMsg.suggestions?.length > 0 && !hiddenSuggestionIds.includes(lastMsg.id)
    ? lastMsg.suggestions : [];

const chipItems = isHero
  ? QUICK_ACTIONS.map((q) => ({ label: q.label, prompt: q.prompt, emoji: q.icon }))
  : lastAiSuggestions.length > 0
  ? lastAiSuggestions.map((s) => ({ label: s, prompt: s, suggestion: true }))
  : QUICK_ACTIONS.map((q) => ({ label: q.label, prompt: q.prompt, emoji: q.icon }));

const chipKey = chipItems.map((c) => c.label).join("|");

const heroGreeting = isHero ? messages.find((m) => m.sender_type === "ai") : null;
const heroSuggestions = isHero ? heroGreeting?.suggestions || [] : [];

const pickChip = (item) => {
  if (item.suggestion) hideAllSuggestions();
  sendMessage(item.prompt);
};

if (!conversation?.id) {
  return (
    <div className="p-6 text-center text-red-600 font-bold">
      Lỗi: Không tìm thấy ID cuộc trò chuyện. Vui lòng thử lại!
    </div>
  );
     }
   
  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-white">
      <div className="relative min-h-0 flex-1">
        <div className={`absolute inset-x-0 top-0 z-20 transition-transform duration-300 ease-out ${headerHidden ? "-translate-y-full" : "translate-y-0"}`}>
          <div className="mx-auto flex w-full max-w-2xl items-center gap-2 bg-[linear-gradient(to_bottom,#fff_72%,rgba(255,255,255,0))] px-3 pb-3 pt-[max(8px,env(safe-area-inset-top))]">
            <button type="button" onClick={() => setShowHistoryDrawer(true)} aria-label="Lịch sử trò chuyện" className="nxx-iconbtn h-10 w-10 border border-[#dde0ea] bg-white text-[#13141a] shadow-[0_1px_2px_rgba(19,20,26,0.04)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 9h14M5 15h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
            </button>
            <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full border border-[#dde0ea] bg-[#f5f6fb] pl-1.5 pr-1.5">
              <img src="https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/avatar.png" alt="NXX" className="h-7 w-7 shrink-0 rounded-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://ui-avatars.com/api/?name=NXX&background=13141a&color=fff&bold=true&size=80`; }} />
              <h1 key={conv.title || "title"} className="nxx-fade min-w-0 flex-1 truncate text-[15.5px] font-medium tracking-[-0.005em] text-[#13141a]">{conv.title || "Chăm sóc khách hàng"}</h1>
              <button type="button" onClick={onBack} aria-label="Đóng cuộc trò chuyện" className="nxx-iconbtn h-7 w-7 bg-[#e9ebf3] text-[#13141a]"><X size={15} strokeWidth={2.4} /></button>
            </div>
            <a href={SUPPORT.zaloUrl} target="_blank" rel="noopener noreferrer" aria-label="Gặp nhân viên qua Zalo" className="nxx-iconbtn h-10 w-10 border border-[#dde0ea] bg-white text-[#0068FF] shadow-[0_1px_2px_rgba(19,20,26,0.04)]"><Headphones size={19} strokeWidth={2} /></a>
          </div>
        </div>

        <HistoryDrawer open={showHistoryDrawer} onClose={() => setShowHistoryDrawer(false)} userId={user?.id || conversation?.user_id} currentConvId={conv.id} onOpenConversation={onOpenConversation} onNewChat={onNewChat} />

        <div ref={scrollRef} onScroll={handleScroll} className="nxx-noscrollbar absolute inset-0 overflow-y-auto overscroll-contain" style={{ scrollBehavior: "smooth", WebkitOverflowScrolling: "touch" }}>
          <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-4 pb-6 pt-[76px]">
            <BannerNotice />
            {loading ? (
              <div className="flex flex-1 items-center justify-center"><ThinkingSpinner size={32} /></div>
            ) : isHero ? (
              <div className="nxx-fade my-auto flex flex-col items-center pb-10 text-center">
                <GradientHeadline phrases={HERO_PHRASES} />
                {heroGreeting?.message && (
                  <p className="mt-4 max-w-[21rem] whitespace-pre-line text-[15.5px] leading-6 text-[#7b7e90]">{cleanAIText(heroGreeting.message)}</p>
                )}
                {heroSuggestions.length > 0 && (
                  <div className="mt-7 flex flex-wrap justify-center gap-2">
                    {heroSuggestions.map((s) => (
                      <button key={s} type="button" disabled={sending} onClick={() => { hideAllSuggestions(); sendMessage(s); }} className="nxx-chip nxx-chip--wrap">
                        <CornerDownRight size={16} className="shrink-0 text-[#a2a5b8]" />{s}
                      </button>
                    ))}
                  </div>
                )}
                <div className="mt-6 flex items-center gap-1">
                  <Sparkles size={11} className="text-[#a2a5b8]" strokeWidth={2.4} />
                  <span className="text-[11px] text-[#7b7e90]">Do AI tạo</span>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, idx) => {
                  if (msg.sender_type === "status") return <StatusBubble key={msg.id} message={msg} />;
                  const isLastAIMessage = idx === messages.length - 1 && msg.sender_type === "ai" && !streamingMsgId && !aiTyping;
                  return (
                    <MemoBubble key={msg.id} message={msg} streamingText={streamingMsgId === msg.id ? streamingText : null} isLastAIMessage={isLastAIMessage} sending={sending} onShowLogin={() => navigate("/login")} hiddenSuggestionIds={hiddenSuggestionIds} animateIn={freshIds.current.has(msg.id)} showFeedback={msg.sender_type === "ai" && idx > 0} feedback={feedback[msg.id] || null} onFeedback={(rating) => openFeedback(msg, rating)} />
                  );
                })}
                {aiTyping && !streamingMsgId && !hasStatusMsg && <ThinkingIndicator />}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative shrink-0 bg-white">
        {!busy && chipItems.length > 0 && (
          <div key={chipKey} className="nxx-noscrollbar nxx-rise mx-auto flex w-full max-w-2xl gap-2 overflow-x-auto px-3.5 pb-2.5 pt-1">
            {chipItems.map((item) => (
              <button key={item.label} type="button" onClick={() => pickChip(item)} disabled={sending} className="nxx-chip">
                {item.suggestion ? <CornerDownRight size={16} className="shrink-0 text-[#a2a5b8]" /> : <span className="text-[15px]">{item.emoji}</span>}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}

        <div className="mx-auto w-full max-w-2xl px-3.5 pb-[max(12px,env(safe-area-inset-bottom))] pt-1">
          {pendingImage && (
            <div className="nxx-rise mb-2 flex items-center gap-3 rounded-[22px] border border-[#dde0ea] bg-[#f5f6fb] p-2">
              <img src={pendingImage.previewUrl} alt="Xem trước" className="h-14 w-14 rounded-2xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-[#13141a]">Ảnh đã chọn</p>
                <p className="text-[12px] text-[#7b7e90]">Nhập mô tả và bấm gửi</p>
              </div>
              <button type="button" onClick={() => { URL.revokeObjectURL(pendingImage.previewUrl); setPendingImage(null); }} aria-label="Bỏ ảnh" className="nxx-iconbtn h-8 w-8 bg-white text-[#7b7e90]"><X size={16} /></button>
            </div>
          )}

          <GlowFrame active={busy}>
            <div className={`nxx-composer ${busy ? "is-busy" : ""}`}>
              <button type="button" onClick={() => setShowFileMenu(true)} aria-label="Đính kèm ảnh" className="nxx-iconbtn h-10 w-10 border border-[#dde0ea] bg-white text-[#13141a]"><Plus size={20} strokeWidth={2.2} /></button>
              <textarea ref={inputRef} rows={1} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); sendMessage(); } }} enterKeyHint="send" aria-label="Nhập tin nhắn" placeholder={isHero ? "Bạn cần hỗ trợ gì nè?" : "Hỏi tiếp tại đây nhé"} className="max-h-[120px] min-h-[40px] min-w-0 flex-1 resize-none bg-transparent py-2.5 text-[15.5px] leading-5 text-[#13141a] outline-none placeholder:text-[#a2a5b8]" />
              <button type="button" onClick={() => setShowEmoji(true)} aria-label="Chèn emoji" className="nxx-iconbtn h-10 w-10 text-[#7b7e90]"><Smile size={21} strokeWidth={2} /></button>
              <button type="button" onClick={() => sendMessage()} disabled={busy || !hasInput} aria-label={busy ? "Đang trả lời" : "Gửi"} className={`nxx-iconbtn h-10 w-10 ${busy || hasInput ? "bg-[#13141a] text-white" : "bg-[#d9dbe6] text-white"} ${busy ? "cursor-default" : ""}`}>
                {busy ? <span className="h-3 w-3 rounded-[3px] bg-white" /> : <ArrowUp size={20} strokeWidth={2.4} />}
              </button>
            </div>
          </GlowFrame>

          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); e.target.value = ""; }} />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); e.target.value = ""; }} />
        </div>

        {showFileMenu && (
          <>
            <div className="nxx-fade fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setShowFileMenu(false)} />
            <div className="nxx-sheet-in fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-2xl rounded-t-[28px] border border-[#dde0ea] bg-white pb-[max(20px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_40px_rgba(19,20,26,0.12)]">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#e3e5ee]" />
              <div className="px-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[19px] font-semibold tracking-[-0.01em] text-[#13141a]">Tải lên</h3>
                  <button type="button" onClick={() => { setShowFileMenu(false); fileInputRef.current?.click(); }} className="text-sm font-semibold text-[#0068FF]">Tất cả ảnh</button>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <button type="button" onClick={() => { setShowFileMenu(false); cameraInputRef.current?.click(); }} className="flex flex-col items-center gap-3">
                    <div className="flex h-20 w-20 items-center justify-center rounded-[22px] bg-[#f5f6fb] text-[#13141a]"><Camera size={30} strokeWidth={1.8} /></div>
                    <span className="text-[13px] font-medium text-[#3f4254]">Chụp ảnh</span>
                  </button>
                  <button type="button" onClick={() => { setShowFileMenu(false); fileInputRef.current?.click(); }} className="flex flex-col items-center gap-3">
                    <div className="flex h-20 w-20 items-center justify-center rounded-[22px] bg-[#f5f6fb] text-[#13141a]"><ImageIcon size={30} strokeWidth={1.8} /></div>
                    <span className="text-[13px] font-medium text-[#3f4254]">Album</span>
                  </button>
                  <button type="button" onClick={() => setShowFileMenu(false)} className="flex flex-col items-center gap-3">
                    <div className="flex h-20 w-20 items-center justify-center rounded-[22px] bg-[#f5f6fb] text-[#13141a]"><Paperclip size={30} strokeWidth={1.8} /></div>
                    <span className="text-[13px] font-medium text-[#3f4254]">Tệp</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {showEmoji && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowEmoji(false)} />
            <div className="absolute bottom-[78px] right-4 z-50 overflow-hidden rounded-2xl border border-[#dde0ea] shadow-2xl">
              <EmojiPicker onEmojiClick={(e) => setInput((prev) => prev + e.emoji)} theme="light" height={350} width={300} />
            </div>
          </>
        )}
      </div>

      <FeedbackSheet open={Boolean(feedbackTarget)} rating={feedbackTarget?.rating} onClose={closeFeedback} onSubmit={submitFeedback} />
    </div>
  );
}

// Bọc component bằng ErrorBoundary
export default function ChatView(props) {
  return (
    <ErrorBoundary>
      <ChatViewContent {...props} />
    </ErrorBoundary>
  );
}      
