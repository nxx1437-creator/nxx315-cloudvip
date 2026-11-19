// src/pages/Support/ChatView.jsx — màn chat với AI (giao diện kiểu Cofounder)
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CornerDownRight, Sparkles } from "lucide-react";

import { supabase } from "../../lib/supabaseClient.js";
import { QUICK_ACTIONS, SUPPORT } from "./constants.js";
import { cleanAIText } from "./helpers.js";
import BannerNotice from "./BannerNotice.jsx";
import StatusBubble from "./StatusBubble.jsx";
import HistoryDrawer from "./HistoryDrawer.jsx";
import MessageBubble from "./MessageBubble.jsx";
import FeedbackSheet from "./FeedbackSheet.jsx";
import GradientHeadline from "./GradientHeadline.jsx";
import { ThinkingSpinner } from "./ThinkingIndicator.jsx";
import ChatHeader from "./ChatHeader.jsx";
import ChatComposer from "./ChatComposer.jsx";
import { DaySeparator, TypingDots, fmtTime } from "./ChatBits.jsx";
import ErrorBoundary from "./ChatErrorBoundary.jsx";
import { callSupportAI } from "./callSupportAI.js";
import useMessageFeedback from "./useMessageFeedback.js";
import "./chat-effects.css";
import "./chat-cofounder.css";

const HIDE_HEADER_ON_SCROLL = true;
const GAP_MS = 10 * 60 * 1000; // cách nhau > 10 phút thì hiện mốc giờ
const HERO_PHRASES = ["Hỏi NXX bất cứ điều gì", "Gửi ảnh lỗi, NXX xem giúp", "Tra đơn, hoàn tiền, đổi thưởng"];

const MemoBubble = React.memo(
  MessageBubble,
  (a, b) =>
    a.message === b.message && a.streamingText === b.streamingText && a.isLastAIMessage === b.isLastAIMessage &&
    a.sending === b.sending && a.hiddenSuggestionIds === b.hiddenSuggestionIds && a.animateIn === b.animateIn &&
    a.showFeedback === b.showFeedback && a.feedback === b.feedback
);

function ChatViewContent({ conversation, user, initialMessage, onBack, onNewChat, onOpenConversation }) {
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
  const { feedback, feedbackTarget, openFeedback, closeFeedback, submitFeedback, resetFeedback } = useMessageFeedback(conversation, user);
  const [replyTo, setReplyTo] = useState(null);

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
      setConv(conversation); setMessages([]); setLoading(true);
      setStreamingMsgId(null); setStreamingText(""); setAiTyping(false); setSending(false);
      sentIds.current = new Set(); freshIds.current = new Set();
      setHiddenSuggestionIds([]); setPendingImage(null); resetFeedback();
      setHeaderHidden(false); setReplyTo(null);
    }
  }, [conversation?.id]);

  useEffect(() => () => cancelAnimationFrame(twRaf.current), []);

  const scrollToBottom = (smooth = false) => {
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    });
  };

  useEffect(() => { if (!loading && messages.length > 0) scrollToBottom(true); }, [messages.length, loading]);

  useEffect(() => {
    if (!streamingMsgId) return;
    const el = scrollRef.current;
    if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 160) el.scrollTo({ top: el.scrollHeight, behavior: "instant" });
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
    setStreamingMsgId(msg.id); setStreamingText("");
    const full = msg.message || "";
    const CPS = 110;
    const start = performance.now();
    let last = 0;
    const tick = (now) => {
      const n = Math.min(full.length, Math.floor(((now - start) / 1000) * CPS));
      if (n === full.length || n - last >= 6) { last = n; setStreamingText(full.slice(0, n)); }
      if (n < full.length) twRaf.current = requestAnimationFrame(tick);
      else setTimeout(() => { setStreamingMsgId(null); setStreamingText(""); scrollToBottom(true); }, 100);
    };
    twRaf.current = requestAnimationFrame(tick);
  };

  const loadMessages = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data, error } = await supabase.from("support_messages").select("*").eq("conversation_id", conversation.id).order("created_at", { ascending: true });
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      if (!silent) { setLoading(false); setTimeout(() => scrollToBottom(), 100); }
    }
  };

  useEffect(() => { if (conversation?.id) loadMessages(); }, [conversation?.id]);

  useEffect(() => {
    if (!conversation?.id) return undefined;
    const f = `conversation_id=eq.${conversation.id}`;
    const channel = supabase
      .channel(`conv-${conversation.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_messages", filter: f }, (payload) => {
        const msg = payload.new;
        if (sentIds.current.has(msg.id)) return;
        freshIds.current.add(msg.id);
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          if (msg.sender_type === "ai" || msg.sender_type === "system") return [...prev.filter((m) => m.sender_type !== "status"), msg];
          return [...prev, msg];
        });
        if (msg.sender_type === "ai" && msg.message) runTypewriter(msg);
        else scrollToBottom(true);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "support_messages", filter: f }, (payload) => {
        const msg = payload.new;
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, ...msg } : m)));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "support_messages", filter: f }, (payload) => {
        setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [conversation?.id]);

  const sendMessage = async (customText) => {
    const typed = (customText || input).trim();
    if ((!typed && !pendingImage) || sending || !user?.id) return;
    // trả lời một tin nhắn: gắn đoạn trích đứng đầu
    const snippet = replyTo ? replyTo.text.replace(/\s+/g, " ").slice(0, 160) : "";
    const content = snippet ? `> ${snippet}\n\n${typed}` : typed;

    setSending(true);
    try {
      let imageUrl = null;
      if (pendingImage) {
        const file = pendingImage.file;
        const fileExt = file.name.split(".").pop() || "jpg";
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("support-images").upload(fileName, file, { cacheControl: "3600", upsert: false });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("support-images").getPublicUrl(fileName);
        imageUrl = urlData?.publicUrl;
        if (!imageUrl) throw new Error("Không lấy được URL ảnh");
      }

      const { data: userMsg, error } = await supabase
        .from("support_messages")
        .insert({ conversation_id: conversation.id, user_id: user.id, message: content || "", sender_type: "user", image_url: imageUrl })
        .select().single();
      if (error) throw error;
      sentIds.current.add(userMsg.id);
      freshIds.current.add(userMsg.id);

      setMessages((prev) => [...prev.filter((m) => m.sender_type !== "status"), userMsg]);
      setInput(""); setReplyTo(null);
      if (pendingImage) URL.revokeObjectURL(pendingImage.previewUrl);
      setPendingImage(null); setShowEmoji(false); setShowFileMenu(false);
      scrollToBottom(true);

      if (conv.status === "ai") {
        const typingTimer = setTimeout(() => setAiTyping(true), 600);
        try {
          const data = await callSupportAI(conversation.id, imageUrl, content);
          console.log(`[Support AI] Provider: ${data.provider} (${data.model})`);
          setTimeout(() => { loadMessages(true); }, 2000);
        } catch (err) {
          console.error("AI error:", err);
          setMessages((prev) => prev.filter((m) => m.sender_type !== "status"));
          const { data: errMsg } = await supabase
            .from("support_messages")
            .insert({
              conversation_id: conversation.id, user_id: user.id,
              message: "Xin lỗi bạn, mình đang gặp sự cố kỹ thuật. Bạn thử lại sau hoặc liên hệ Zalo 0865245988 để được hỗ trợ trực tiếp nha 🌸",
              sender_type: "ai", suggestions: [],
            })
            .select().single();
          if (errMsg) {
            sentIds.current.add(errMsg.id); freshIds.current.add(errMsg.id);
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
    setPendingImage({ file, previewUrl: URL.createObjectURL(file) });
    setShowFileMenu(false);
  };

  const hideAllSuggestions = () => {
    setHiddenSuggestionIds((prev) => [...new Set([...prev, ...messages.filter((m) => m.suggestions?.length > 0).map((m) => m.id)])]);
  };

  const handleScroll = (e) => {
    if (!HIDE_HEADER_ON_SCROLL) return;
    const el = e.currentTarget;
    const y = el.scrollTop;
    const dy = y - lastScrollY.current;
    if (Math.abs(dy) < 10) return;
    if (y < 0 || y > el.scrollHeight - el.clientHeight) return;
    if (y < 48) setHeaderHidden(false); else setHeaderHidden(dy > 0);
    lastScrollY.current = y;
  };

  const hasInput = Boolean(input.trim() || pendingImage);
  const busy = sending || aiTyping || Boolean(streamingMsgId);
  const hasStatusMsg = messages.some((m) => m.sender_type === "status");
  const hasUserMsg = messages.some((m) => m.sender_type === "user");
  const isHero = !loading && messages.length > 0 && !hasUserMsg && !hasStatusMsg;

  const lastMsg = messages[messages.length - 1];
  const lastAiSuggestions = lastMsg?.sender_type === "ai" && lastMsg.suggestions?.length > 0 && !hiddenSuggestionIds.includes(lastMsg.id) ? lastMsg.suggestions : [];
  const quick = QUICK_ACTIONS.map((q) => ({ label: q.label, prompt: q.prompt, emoji: q.icon }));
  const chipItems = isHero ? quick : lastAiSuggestions.length > 0 ? lastAiSuggestions.map((s) => ({ label: s, prompt: s, suggestion: true })) : quick;
  const chipKey = chipItems.map((c) => c.label).join("|");
  const heroGreeting = isHero ? messages.find((m) => m.sender_type === "ai") : null;
  const heroSuggestions = isHero ? heroGreeting?.suggestions || [] : [];
  const lastUserIdx = messages.map((m) => m.sender_type).lastIndexOf("user");

  const pickChip = (item) => { if (item.suggestion) hideAllSuggestions(); sendMessage(item.prompt); };
  const startReply = (r) => { setReplyTo(r); setTimeout(() => inputRef.current?.focus(), 50); };

  if (!conversation?.id) {
    return <div className="p-6 text-center text-red-600 font-bold">Lỗi: Không tìm thấy ID cuộc trò chuyện. Vui lòng thử lại!</div>;
  }

  return (
    <div className="nxx-skin fixed inset-0 z-30 flex flex-col">
      <div className="relative min-h-0 flex-1">
        <ChatHeader hidden={headerHidden} onHistory={() => setShowHistoryDrawer(true)} onBack={onBack} zaloUrl={SUPPORT.zaloUrl} />
        <HistoryDrawer open={showHistoryDrawer} onClose={() => setShowHistoryDrawer(false)} userId={user?.id || conversation?.user_id} currentConvId={conv.id} onOpenConversation={onOpenConversation} onNewChat={onNewChat} />

        <div ref={scrollRef} onScroll={handleScroll} className="nxx-noscrollbar absolute inset-0 overflow-y-auto overscroll-contain" style={{ scrollBehavior: "smooth", WebkitOverflowScrolling: "touch" }}>
          <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-4 pb-6 pt-[132px]">
            <BannerNotice />
            {loading ? (
              <div className="flex flex-1 items-center justify-center"><ThinkingSpinner size={32} /></div>
            ) : isHero ? (
              <div className="nxx-fade my-auto flex flex-col items-center pb-10 text-center">
                <GradientHeadline phrases={HERO_PHRASES} />
                {heroGreeting?.message && <p className="mt-4 max-w-[21rem] whitespace-pre-line text-[15.5px] leading-6 text-[#8b8b84]">{cleanAIText(heroGreeting.message)}</p>}
                {heroSuggestions.length > 0 && (
                  <div className="mt-7 flex flex-wrap justify-center gap-2">
                    {heroSuggestions.map((s) => (
                      <button key={s} type="button" disabled={sending} onClick={() => { hideAllSuggestions(); sendMessage(s); }} className="nxx-chip nxx-chip--wrap">
                        <CornerDownRight size={16} className="shrink-0 text-[#a2a29b]" />{s}
                      </button>
                    ))}
                  </div>
                )}
                <div className="mt-6 flex items-center gap-1"><Sparkles size={11} className="text-[#a2a29b]" strokeWidth={2.4} /><span className="text-[11px] text-[#8b8b84]">Do AI tạo</span></div>
              </div>
            ) : (
              <div className="space-y-5">
                {messages.map((msg, idx) => {
                  if (msg.sender_type === "status") return <StatusBubble key={msg.id} message={msg} />;
                  const prev = messages[idx - 1];
                  const showDay = msg.created_at && (!prev?.created_at || new Date(msg.created_at) - new Date(prev.created_at) > GAP_MS);
                  const isLastAIMessage = idx === messages.length - 1 && msg.sender_type === "ai" && !streamingMsgId && !aiTyping;
                  const seen = idx === lastUserIdx && (idx < messages.length - 1 || aiTyping);
                  return (
                    <React.Fragment key={msg.id}>
                      {showDay && <DaySeparator iso={msg.created_at} />}
                      <MemoBubble message={msg} streamingText={streamingMsgId === msg.id ? streamingText : null} isLastAIMessage={isLastAIMessage} sending={sending}
                        onShowLogin={() => navigate("/login")} hiddenSuggestionIds={hiddenSuggestionIds} animateIn={freshIds.current.has(msg.id)}
                        showFeedback={msg.sender_type === "ai" && idx > 0} feedback={feedback[msg.id] || null} onFeedback={(rating) => openFeedback(msg, rating)} onReply={startReply} />
                      {seen && <div className="nxx-read"><b>Đã xem</b>{fmtTime(msg.created_at)}</div>}
                    </React.Fragment>
                  );
                })}
                {aiTyping && !streamingMsgId && !hasStatusMsg && <TypingDots />}
              </div>
            )}
          </div>
        </div>
      </div>

      <ChatComposer
        input={input} setInput={setInput} inputRef={inputRef} isHero={isHero} busy={busy} hasInput={hasInput} sending={sending} onSend={sendMessage}
        pendingImage={pendingImage} clearPending={() => { URL.revokeObjectURL(pendingImage.previewUrl); setPendingImage(null); }}
        replyTo={replyTo} clearReply={() => setReplyTo(null)}
        chipItems={chipItems} chipKey={chipKey} onPickChip={pickChip}
        showFileMenu={showFileMenu} setShowFileMenu={setShowFileMenu} showEmoji={showEmoji} setShowEmoji={setShowEmoji}
        fileInputRef={fileInputRef} cameraInputRef={cameraInputRef} onFile={handleFileSelect}
      />
      <FeedbackSheet open={Boolean(feedbackTarget)} rating={feedbackTarget?.rating} onClose={closeFeedback} onSubmit={submitFeedback} />
    </div>
  );
}

export default function ChatView(props) {
  return (
    <ErrorBoundary>
      <ChatViewContent {...props} />
    </ErrorBoundary>
  );
}
