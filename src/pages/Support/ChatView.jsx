// src/pages/Support/ChatView.jsx — màn chat với AI (giao diện kiểu Cofounder)
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CornerDownRight, Info, Sparkles } from "lucide-react";

import { supabase } from "../../lib/supabaseClient.js";
import { QUICK_ACTIONS, SUPPORT } from "./constants.js";
import { cleanAIText } from "./helpers.js";
import { splitReply } from "./splitReply.js";
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
import { useChatLimit } from "./useChatLimit.js";
import { usePermissionSheet } from "./PermissionSheet.jsx";
import "./chat-effects.css";
import "./chat-cofounder.css";

const HIDE_HEADER_ON_SCROLL = true;
const GAP_MS = 10 * 60 * 1000;
const HERO_PHRASES = ["Hỏi NXX bất cứ điều gì", "Gửi ảnh lỗi, NXX xem giúp", "Tra đơn, hoàn tiền, đổi thưởng"];
const RELOAD_AI_DELAY_MS = 2000;

// Tiêu đề mặc định lúc tạo chat; còn là các tiêu đề này thì sẽ đổi theo câu hỏi đầu tiên
const DEFAULT_TITLE = /^(Hỗ trợ( |$)|Cuộc trò chuyện mới$)/;

// Tạo tiêu đề ngắn từ câu hỏi của người dùng (bỏ phần trích dẫn "> ...")
function makeTitle(raw) {
  const text = String(raw || "")
    .split("\n")
    .filter((line) => !line.trim().startsWith(">"))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "Hình ảnh cần hỗ trợ";
  const MAX = 48;
  let out = text;
  if (text.length > MAX) {
    const cut = text.slice(0, MAX);
    const sp = cut.lastIndexOf(" ");
    out = (sp > 24 ? cut.slice(0, sp) : cut).trim() + "…";
  }
  return out.charAt(0).toUpperCase() + out.slice(1);
}

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
    a.feedback === b.feedback &&
    a.onReply === b.onReply &&
    a.onShowLogin === b.onShowLogin &&
    a.onFeedback === b.onFeedback &&
    a.partIndex === b.partIndex &&
    a.partCount === b.partCount &&
    a.fullText === b.fullText
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
  // Nhắn nhiều tin: revealed[msgId] = số tin đã hiện; playingMsgId = câu trả lời đang "nhắn" dần
  const [revealed, setRevealed] = useState({});
  const [playingMsgId, setPlayingMsgId] = useState(null);
  const [partTyping, setPartTyping] = useState(false);
  // Lỗi gọi AI: hiện thẻ "Thử lại" thay vì nhắn tin xin lỗi; lưu lại yêu cầu để gọi lại
  const [aiError, setAiError] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [conv, setConv] = useState(conversation);
  const [hiddenSuggestionIds, setHiddenSuggestionIds] = useState([]);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const [headerHidden, setHeaderHidden] = useState(false);
  const { feedback, feedbackTarget, openFeedback, closeFeedback, submitFeedback, resetFeedback } =
    useMessageFeedback(conversation, user);
  const [replyTo, setReplyTo] = useState(null);
  // Giới hạn lượt chat + hộp xin quyền camera/album
  const { checkLimit, limitNotice, clearLimitNotice, notifyServerLimit } = useChatLimit(user?.id);
  const { ask: askPerm, sheet: permSheet } = usePermissionSheet();

  const scrollRef = useRef(null);
  const lastScrollY = useRef(0);
  const inputRef = useRef(null);
  const sentIds = useRef(new Set());
  const freshIds = useRef(new Set());
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const initialSent = useRef(false);
  const titledRef = useRef(false);
  const twRaf = useRef(0);
  const twTimer = useRef(0);
  const reloadTimer = useRef(0);
  const gapTimer = useRef(0);
  const playRef = useRef(0);
  const activeRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      playRef.current += 1;
      cancelAnimationFrame(twRaf.current);
      clearTimeout(twTimer.current);
      clearTimeout(reloadTimer.current);
      clearTimeout(gapTimer.current);
    };
  }, []);

  // Reset state khi đổi conversation.
  // LƯU Ý: KHÔNG đưa resetFeedback vào deps — hook useMessageFeedback đã tự reset
  // khi conversation.id đổi. Đưa vào sẽ gây infinite loop nếu resetFeedback không ổn định.
  useEffect(() => {
    if (!conversation?.id) return;
    setConv(conversation);
    setMessages([]);
    setLoading(true);
    setStreamingMsgId(null);
    setStreamingText("");
    setAiTyping(false);
    setSending(false);
    playRef.current += 1;
    clearTimeout(gapTimer.current);
    activeRef.current = null;
    setRevealed({});
    setPlayingMsgId(null);
    setPartTyping(false);
    setAiError(null);
    sentIds.current = new Set();
    freshIds.current = new Set();
    setHiddenSuggestionIds([]);
    setPendingImage(null);
    resetFeedback();
    setHeaderHidden(false);
    setReplyTo(null);
    lastScrollY.current = 0;
    initialSent.current = false;
    titledRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id]);

  const scrollToBottom = useCallback((smooth = false) => {
    requestAnimationFrame(() => {
      if (scrollRef.current)
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    });
  }, []);

  useEffect(() => {
    if (!loading && messages.length > 0) scrollToBottom(true);
  }, [messages.length, loading, scrollToBottom]);

  // Hiện thêm tin trong câu trả lời nhiều tin, hoặc hiện thẻ lỗi thì cuộn xuống
  useEffect(() => {
    if (Object.keys(revealed).length > 0 || aiError) scrollToBottom(true);
  }, [revealed, partTyping, aiError, scrollToBottom]);

  useEffect(() => {
    if (!streamingMsgId) return;
    const el = scrollRef.current;
    if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 160)
      el.scrollTo({ top: el.scrollHeight, behavior: "instant" });
  }, [streamingText, streamingMsgId]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

  // Gõ chữ dần cho câu trả lời một tin
  const runTypewriter = useCallback((msg) => {
    cancelAnimationFrame(twRaf.current);
    clearTimeout(twTimer.current);
    setStreamingMsgId(msg.id);
    setStreamingText("");
    const full = msg.message || "";
    const CPS = 110;
    const start = performance.now();
    let last = 0;
    const tick = (now) => {
      if (!mountedRef.current) return;
      const n = Math.min(full.length, Math.floor(((now - start) / 1000) * CPS));
      if (n === full.length || n - last >= 6) {
        last = n;
        setStreamingText(full.slice(0, n));
      }
      if (n < full.length) {
        twRaf.current = requestAnimationFrame(tick);
      } else {
        twTimer.current = setTimeout(() => {
          if (!mountedRef.current) return;
          setStreamingMsgId(null);
          setStreamingText("");
          scrollToBottom(true);
        }, 100);
      }
    };
    twRaf.current = requestAnimationFrame(tick);
  }, [scrollToBottom]);

  // Câu trả lời của AI: 1 đoạn thì gõ chữ như cũ. Nhiều đoạn (tối đa 2 tin) thì tin đầu hiện luôn,
  // rồi dấu ba chấm rất ngắn, tin sau hiện nguyên cả tin (không gõ từng chữ để khỏi chậm)
  const playReply = useCallback(
    (msg) => {
      const token = ++playRef.current;
      clearTimeout(gapTimer.current);
      const prev = activeRef.current;
      if (prev) setRevealed((r) => ({ ...r, [prev.id]: prev.n }));
      activeRef.current = null;
      setPartTyping(false);

      const parts = splitReply(cleanAIText(msg.message || ""));
      const n = parts.length;
      if (n < 2) {
        setPlayingMsgId(null);
        runTypewriter(msg);
        return;
      }

      cancelAnimationFrame(twRaf.current);
      clearTimeout(twTimer.current);
      setStreamingMsgId(null);
      setStreamingText("");
      activeRef.current = { id: msg.id, n };
      setPlayingMsgId(msg.id);
      setRevealed((r) => ({ ...r, [msg.id]: 1 }));

      const finish = () => {
        setRevealed((r) => ({ ...r, [msg.id]: n }));
        setPlayingMsgId((cur) => (cur === msg.id ? null : cur));
        setPartTyping(false);
        if (activeRef.current?.id === msg.id) activeRef.current = null;
      };

      // part i đã hiện; chờ một nhịp ngắn rồi hiện part i+1
      const step = (i) => {
        if (!mountedRef.current || playRef.current !== token) return;
        if (i + 1 >= n) {
          finish();
          return;
        }
        setPartTyping(true);
        gapTimer.current = setTimeout(() => {
          if (!mountedRef.current || playRef.current !== token) return;
          setPartTyping(false);
          setRevealed((r) => ({ ...r, [msg.id]: i + 2 }));
          step(i + 1);
        }, Math.min(1100, 450 + parts[i + 1].length * 7));
      };
      step(0);
    },
    [runTypewriter]
  );

  const loadMessages = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      if (!mountedRef.current) return;
      setMessages(data || []);
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      if (!silent && mountedRef.current) {
        setLoading(false);
        setTimeout(() => scrollToBottom(), 100);
      }
    }
  }, [conversation?.id, scrollToBottom]);

  useEffect(() => {
    if (conversation?.id) loadMessages();
  }, [conversation?.id, loadMessages]);

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
          if (msg.sender_type === "ai" || msg.sender_type === "system")
            return [...prev.filter((m) => m.sender_type !== "status"), msg];
          return [...prev, msg];
        });
        if (msg.sender_type === "ai" && msg.message) playReply(msg);
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
  }, [conversation?.id, playReply, scrollToBottom]);

  // Gọi AI trả lời cho một yêu cầu. Lỗi thì hiện thẻ "Thử lại" (không ghi tin xin lỗi vào cuộc trò chuyện)
  const runAI = useCallback(
    async (content, imageUrl) => {
      setAiError(null);
      const typingTimer = setTimeout(() => mountedRef.current && setAiTyping(true), 600);
      try {
        // Chat cũ: lấy trạng thái thật nếu chưa có (mở từ lịch sử có thể thiếu)
        let status = conv.status;
        if (!status) {
          const { data: row } = await supabase
            .from("support_conversations")
            .select("status")
            .eq("id", conversation.id)
            .maybeSingle();
          status = row?.status || "ai";
        }
        // Nhân viên đang xử lý thì AI không chen vào; các trạng thái còn lại (ai, closed...) vẫn cho AI trả lời
        if (status === "agent" || status === "pending_agent") return;

        // Chat đã đóng: mở lại ở chế độ AI trước khi gọi (function chỉ trả lời khi status = "ai")
        if (status !== "ai") {
          const { error: reopenErr } = await supabase
            .from("support_conversations")
            .update({ status: "ai", updated_at: new Date().toISOString() })
            .eq("id", conversation.id)
            .eq("user_id", user.id);
          if (reopenErr) throw reopenErr;
        }
        if (conv.status !== "ai" && mountedRef.current) setConv((c) => ({ ...c, status: "ai" }));

        const data = await callSupportAI(conversation.id, imageUrl, content);
        console.log(`[Support AI] Provider: ${data.provider} (${data.model})`);
        clearTimeout(reloadTimer.current);
        reloadTimer.current = setTimeout(() => {
          if (mountedRef.current) loadMessages(true);
        }, RELOAD_AI_DELAY_MS);
      } catch (err) {
        console.error("AI error:", err);
        if (!mountedRef.current) return;
        setMessages((prev) => prev.filter((m) => m.sender_type !== "status"));
        const busyErr = /429|502|503|504|busy|quá lâu|timeout|kết nối/i.test(String(err?.message || ""));
        setAiError({ content, imageUrl, busy: busyErr });
      } finally {
        clearTimeout(typingTimer);
        if (mountedRef.current) setAiTyping(false);
      }
    },
    [conv.status, conversation?.id, user?.id, loadMessages]
  );

  const retryAI = useCallback(async () => {
    if (!aiError || sending) return;
    const req = aiError;
    setSending(true);
    try {
      await runAI(req.content, req.imageUrl);
    } finally {
      if (mountedRef.current) setSending(false);
    }
  }, [aiError, sending, runAI]);

  const sendMessage = useCallback(async (customText) => {
    const typed = (customText || input).trim();
    if ((!typed && !pendingImage) || sending) return;
    if (!user?.id) {
      alert("Vui lòng đăng nhập để gửi tin nhắn.");
      return;
    }
    // Hết lượt thì hiện thông báo, giữ nguyên nội dung đang gõ để gửi sau
    if (!checkLimit()) return;

    const snippet = replyTo ? replyTo.text.replace(/\s+/g, " ").slice(0, 160) : "";
    const content = snippet ? `> ${snippet}\n\n${typed}` : typed;

    setSending(true);
    setAiError(null);
    let uploadedImageUrl = null;
    try {
      if (pendingImage) {
        const file = pendingImage.file;
        const fileExt = file.name.split(".").pop() || "jpg";
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("support-images")
          .upload(fileName, file, { cacheControl: "3600", upsert: false });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("support-images").getPublicUrl(fileName);
        uploadedImageUrl = urlData?.publicUrl;
        if (!uploadedImageUrl) throw new Error("Không lấy được URL ảnh");
      }

      const { data: userMsg, error } = await supabase
        .from("support_messages")
        .insert({
          conversation_id: conversation.id,
          user_id: user.id,
          message: content || "",
          sender_type: "user",
          image_url: uploadedImageUrl,
        })
        .select()
        .single();
      if (error) throw error;

      sentIds.current.add(userMsg.id);
      freshIds.current.add(userMsg.id);
      setMessages((prev) => [...prev.filter((m) => m.sender_type !== "status"), userMsg]);
      setInput("");
      setReplyTo(null);
      if (pendingImage) URL.revokeObjectURL(pendingImage.previewUrl);
      setPendingImage(null);
      setShowEmoji(false);
      setShowFileMenu(false);
      scrollToBottom(true);

      // Đặt tiêu đề cuộc trò chuyện theo câu hỏi đầu tiên của người dùng
      if (!titledRef.current && (!conv.title || DEFAULT_TITLE.test(conv.title))) {
        titledRef.current = true;
        const newTitle = makeTitle(content);
        supabase
          .from("support_conversations")
          .update({ title: newTitle })
          .eq("id", conversation.id)
          .eq("user_id", user.id)
          .then(({ error: titleErr }) => {
            if (titleErr) console.warn("Không đặt được tiêu đề:", titleErr.message);
            else if (mountedRef.current) setConv((c) => ({ ...c, title: newTitle }));
          });
      }

      await runAI(content, uploadedImageUrl);
    } catch (error) {
      console.error("Send error:", error);
      if (mountedRef.current) {
        // Server (trigger giới hạn) từ chối thì hiện thông báo hết lượt, lỗi khác mới báo "không thể gửi"
        if (!notifyServerLimit(error?.message)) alert("Không thể gửi tin nhắn.");
      }
    } finally {
      if (mountedRef.current) setSending(false);
    }
  }, [input, pendingImage, sending, user?.id, replyTo, conv.title, conversation?.id, runAI, scrollToBottom, checkLimit, notifyServerLimit]);

  useEffect(() => {
    if (initialMessage && !loading && messages.length > 0 && !initialSent.current) {
      initialSent.current = true;
      sendMessage(initialMessage);
    }
  }, [initialMessage, loading, messages.length, sendMessage]);

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return alert("Chỉ hỗ trợ file ảnh");
    if (file.size > 5 * 1024 * 1024) return alert("Ảnh không được vượt quá 5MB");
    setPendingImage({ file, previewUrl: URL.createObjectURL(file) });
    setShowFileMenu(false);
  };

  const hideAllSuggestions = useCallback(() => {
    setHiddenSuggestionIds((prev) => [
      ...new Set([...prev, ...messages.filter((m) => m.suggestions?.length > 0).map((m) => m.id)]),
    ]);
  }, [messages]);

  const handleScroll = (e) => {
    if (!HIDE_HEADER_ON_SCROLL) return;
    const el = e.currentTarget;
    const y = el.scrollTop;
    const dy = y - lastScrollY.current;
    if (Math.abs(dy) < 10) return;
    if (y < 0 || y > el.scrollHeight - el.clientHeight) return;
    if (y < 48) setHeaderHidden(false);
    else setHeaderHidden(dy > 0);
    lastScrollY.current = y;
  };

  // Handlers ổn định cho MemoBubble
  const handleShowLogin = useCallback(() => navigate("/login"), [navigate]);
  const handleReply = useCallback((r) => {
    setReplyTo(r);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);
  const handleOpenFeedback = useCallback(
    (msg, rating) => {
      openFeedback(msg, rating);
    },
    [openFeedback]
  );

  // Tách sẵn các tin AI nhiều đoạn (đối tượng ổn định để MemoBubble không render lại thừa)
  const partsById = useMemo(() => {
    const map = {};
    for (const m of messages) {
      if (m.sender_type === "ai" && m.message) {
        const p = splitReply(cleanAIText(m.message));
        if (p.length > 1) map[m.id] = p.map((text) => ({ ...m, message: text }));
      }
    }
    return map;
  }, [messages]);

  const hasInput = Boolean(input.trim() || pendingImage);
  const busy = sending || aiTyping || Boolean(streamingMsgId) || Boolean(playingMsgId);
  const hasStatusMsg = messages.some((m) => m.sender_type === "status");
  const hasUserMsg = messages.some((m) => m.sender_type === "user");
  const isHero = !loading && messages.length > 0 && !hasUserMsg && !hasStatusMsg;

  const lastMsg = messages[messages.length - 1];
  const lastAiSuggestions =
    lastMsg?.sender_type === "ai" &&
    lastMsg.suggestions?.length > 0 &&
    !hiddenSuggestionIds.includes(lastMsg.id)
      ? lastMsg.suggestions
      : [];
  const quick = useMemo(
    () => QUICK_ACTIONS.map((q) => ({ label: q.label, prompt: q.prompt, emoji: q.icon })),
    []
  );
  const chipItems = isHero
    ? quick
    : lastAiSuggestions.length > 0
    ? lastAiSuggestions.map((s) => ({ label: s, prompt: s, suggestion: true }))
    : quick;
  const chipKey = chipItems.map((c) => c.label).join("|");
  const heroGreeting = isHero ? messages.find((m) => m.sender_type === "ai") : null;
  const heroSuggestions = isHero ? heroGreeting?.suggestions || [] : [];
  const lastUserIdx = messages.map((m) => m.sender_type).lastIndexOf("user");

  const pickChip = useCallback(
    (item) => {
      if (item.suggestion) hideAllSuggestions();
      sendMessage(item.prompt);
    },
    [hideAllSuggestions, sendMessage]
  );

  if (!conversation?.id) {
    return (
      <div className="p-6 text-center text-red-600 font-bold">
        Lỗi: Không tìm thấy ID cuộc trò chuyện. Vui lòng thử lại!
      </div>
    );
  }

  return (
    <div className="nxx-skin fixed inset-0 z-30 flex flex-col">
      <div className="relative min-h-0 flex-1">
        <ChatHeader
          hidden={headerHidden}
          onHistory={() => setShowHistoryDrawer(true)}
          onBack={onBack}
          zaloUrl={SUPPORT.zaloUrl}
        />
        <HistoryDrawer
          open={showHistoryDrawer}
          onClose={() => setShowHistoryDrawer(false)}
          userId={user?.id || conversation?.user_id}
          currentConvId={conv.id}
          onOpenConversation={onOpenConversation}
          onNewChat={onNewChat}
        />

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="nxx-noscrollbar absolute inset-0 overflow-y-auto overscroll-contain"
          style={{ scrollBehavior: "smooth", WebkitOverflowScrolling: "touch" }}
        >
          <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-4 pb-6 pt-[132px]">
            <BannerNotice />
            {loading ? (
              <div className="flex flex-1 items-center justify-center">
                <ThinkingSpinner size={32} />
              </div>
            ) : isHero ? (
              <div className="nxx-fade my-auto flex flex-col items-center pb-10 text-center">
                <GradientHeadline phrases={HERO_PHRASES} />
                {heroGreeting?.message && (
                  <p className="mt-4 max-w-[21rem] whitespace-pre-line text-[15.5px] leading-6 text-[#8b8b84]">
                    {cleanAIText(heroGreeting.message)}
                  </p>
                )}
                {heroSuggestions.length > 0 && (
                  <div className="mt-7 flex flex-wrap justify-center gap-2">
                    {heroSuggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={sending}
                        onClick={() => {
                          hideAllSuggestions();
                          sendMessage(s);
                        }}
                        className="nxx-chip nxx-chip--wrap"
                      >
                        <CornerDownRight size={16} className="shrink-0 text-[#a2a29b]" />
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                <div className="mt-6 flex items-center gap-1">
                  <Sparkles size={11} className="text-[#a2a29b]" strokeWidth={2.4} />
                  <span className="text-[11px] text-[#8b8b84]">Do AI tạo</span>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {messages.map((msg, idx) => {
                  if (msg.sender_type === "status") return <StatusBubble key={msg.id} message={msg} />;
                  const prev = messages[idx - 1];
                  const showDay =
                    msg.created_at &&
                    (!prev?.created_at || new Date(msg.created_at) - new Date(prev.created_at) > GAP_MS);
                  const isLastAIMessage =
                    idx === messages.length - 1 &&
                    msg.sender_type === "ai" &&
                    !streamingMsgId &&
                    !aiTyping &&
                    !playingMsgId;
                  const hasAfters = messages
                    .slice(idx + 1)
                    .some((m) => m.sender_type === "ai" || m.sender_type === "system");
                  const seen = idx === lastUserIdx && (aiTyping || hasAfters || Boolean(aiError));
                  const parts = partsById[msg.id];
                  const shown = parts ? Math.min(parts.length, revealed[msg.id] ?? parts.length) : 0;
                  return (
                    <React.Fragment key={msg.id}>
                      {showDay && <DaySeparator iso={msg.created_at} />}
                      {parts ? (
                        <div className="space-y-2">
                          {parts.slice(0, shown).map((p, k) => {
                            const partKey = k === 0 ? msg.id : `${msg.id}#${k}`;
                            return (
                              <MemoBubble
                                key={partKey}
                                message={p}
                                partIndex={k}
                                partCount={parts.length}
                                fullText={msg.message}
                                streamingText={streamingMsgId === partKey ? streamingText : null}
                                isLastAIMessage={isLastAIMessage}
                                sending={sending}
                                onShowLogin={handleShowLogin}
                                hiddenSuggestionIds={hiddenSuggestionIds}
                                animateIn={freshIds.current.has(msg.id)}
                                showFeedback={idx > 0}
                                feedback={feedback[msg.id] || null}
                                onFeedback={handleOpenFeedback}
                                onReply={handleReply}
                              />
                            );
                          })}
                        </div>
                      ) : (
                        <MemoBubble
                          message={msg}
                          streamingText={streamingMsgId === msg.id ? streamingText : null}
                          isLastAIMessage={isLastAIMessage}
                          sending={sending}
                          onShowLogin={handleShowLogin}
                          hiddenSuggestionIds={hiddenSuggestionIds}
                          animateIn={freshIds.current.has(msg.id)}
                          showFeedback={msg.sender_type === "ai" && idx > 0}
                          feedback={feedback[msg.id] || null}
                          onFeedback={handleOpenFeedback}
                          onReply={handleReply}
                        />
                      )}
                      {seen && (
                        <div className="nxx-read">
                          <b>Đã xem</b>
                          {fmtTime(msg.created_at)}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
                {((aiTyping && !streamingMsgId && !hasStatusMsg) || partTyping) && <TypingDots />}
                {aiError && !aiTyping && (
                  <div className="nxx-rise flex items-center gap-3 rounded-[22px] border border-[#e6e6df] bg-white px-4 py-3">
                    <Info size={20} strokeWidth={1.8} className="shrink-0 text-[#6f6f68]" />
                    <p className="min-w-0 flex-1 text-[15px] leading-snug text-[#2b2b2b]">
                      {aiError.busy
                        ? "NXX hiện đang bận. Hãy thử lại sau giây lát."
                        : "Không thể tạo phản hồi của NXX."}
                    </p>
                    <button
                      type="button"
                      onClick={retryAI}
                      disabled={sending}
                      className="shrink-0 rounded-full border border-[#d9d9d0] bg-white px-4 py-2 text-[14.5px] font-medium text-[#2b2b2b] transition active:scale-[0.97] disabled:opacity-50"
                    >
                      Thử lại
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {limitNotice && (
        <div className="shrink-0 bg-[#fbfbf8]">
          <div className="nxx-rise mx-auto flex w-full max-w-2xl items-center gap-3 px-3.5 pb-2 pt-1">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[22px] border border-[#e6e6df] bg-white px-4 py-3">
              <Info size={20} strokeWidth={1.8} className="shrink-0 text-[#6f6f68]" />
              <p className="min-w-0 flex-1 text-[15px] leading-snug text-[#2b2b2b]">{limitNotice}</p>
              <button
                type="button"
                onClick={clearLimitNotice}
                className="shrink-0 rounded-full border border-[#d9d9d0] bg-white px-4 py-2 text-[14.5px] font-medium text-[#2b2b2b] transition active:scale-[0.97]"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      <ChatComposer
        input={input}
        setInput={setInput}
        inputRef={inputRef}
        isHero={isHero}
        busy={busy}
        hasInput={hasInput}
        sending={sending}
        onSend={sendMessage}
        pendingImage={pendingImage}
        clearPending={() => {
          if (pendingImage) URL.revokeObjectURL(pendingImage.previewUrl);
          setPendingImage(null);
        }}
        replyTo={replyTo}
        clearReply={() => setReplyTo(null)}
        chipItems={chipItems}
        chipKey={chipKey}
        onPickChip={pickChip}
        showFileMenu={showFileMenu}
        setShowFileMenu={setShowFileMenu}
        showEmoji={showEmoji}
        setShowEmoji={setShowEmoji}
        fileInputRef={fileInputRef}
        cameraInputRef={cameraInputRef}
        onFile={handleFileSelect}
        askPerm={askPerm}
      />
      <FeedbackSheet
        open={Boolean(feedbackTarget)}
        rating={feedbackTarget?.rating}
        onClose={closeFeedback}
        onSubmit={submitFeedback}
      />
      {permSheet}
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
