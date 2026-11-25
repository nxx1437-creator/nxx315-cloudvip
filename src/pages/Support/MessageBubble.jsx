// src/pages/Support/MessageBubble.jsx — AI: chữ rộng hết khung, không bóng, nút thao tác nằm dưới (kiểu Gemini); bạn: bóng kem + nút trả lời, sao chép
// Một câu trả lời AI có thể được tách thành nhiều tin (partIndex/partCount): chỉ tin đầu có khối suy nghĩ + ảnh, chỉ tin cuối có nút thao tác
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronRight, Copy, Reply, Sparkles, Square, ThumbsDown, ThumbsUp, Volume2 } from "lucide-react";
import MarkdownText from "./MarkdownText.jsx";
import ImageLightbox from "./ImageLightbox.jsx";
import { cleanAIText } from "./helpers.js";
import { parseActionsFromText } from "./bubbleActions.js";
import { QuotedText, splitQuote } from "./ChatBits.jsx";
import ThinkingBlock from "./ThinkingBlock.jsx";
import { takeThinking } from "./thinkingStore.js";

function SideBtn({ label, onClick, disabled, className = "", pressed, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={`nxx-iconbtn nxx-sidebtn h-9 w-9 ${className}`}
    >
      {children}
    </button>
  );
}

function feedbackClass(fb, type) {
  if (!fb || fb.rating !== type) return "";
  if (type === "up") return fb.status === "sent" ? "!bg-[#16b981] !text-white" : "!bg-[#bff0dc]";
  return fb.status === "sent" ? "!bg-[#f43f5e] !text-white" : "!bg-[#ffd0d8]";
}

// Lấy text thuần để copy/reply — không dính dấu "> " của quote
function getPlainText(message) {
  if (message.sender_type === "user") {
    const { quote, body } = splitQuote(message.message || "");
    if (body) return body;
    return quote; // chỉ có quote thì trả quote không dấu ">"
  }
  return cleanAIText(message.message || "");
}

// ── Đọc to bằng giọng có sẵn của trình duyệt/điện thoại (Web Speech API): miễn phí, không cần server ──
const canSpeak = () => typeof window !== "undefined" && "speechSynthesis" in window;

// Danh sách giọng của trình duyệt tải chậm ở lần đầu (getVoices() trả rỗng) nên nạp sẵn và nhớ lại,
// lần bấm Nghe đầu tiên không phải chờ. Ưu tiên giọng cài sẵn trong máy (không cần mạng nên bắt đầu đọc ngay)
let viVoice = null;
let voicesWarmed = false;

function pickViVoice() {
  if (!canSpeak()) return null;
  const list = window.speechSynthesis.getVoices().filter((v) => /^vi/i.test(v.lang || ""));
  if (list.length === 0) return null;
  return list.find((v) => v.localService) || list[0];
}

function warmVoices() {
  if (!canSpeak() || voicesWarmed) return;
  voicesWarmed = true;
  const synth = window.speechSynthesis;
  viVoice = pickViVoice();
  const refresh = () => {
    viVoice = pickViVoice() || viVoice;
  };
  if (typeof synth.addEventListener === "function") synth.addEventListener("voiceschanged", refresh);
  else synth.onvoiceschanged = refresh;
}

// Bỏ định dạng markdown, link, emoji để giọng đọc không đọc ra ký hiệu
function toSpeechText(raw) {
  return String(raw || "")
    .replace(/\[SUGGESTIONS\][\s\S]*$/i, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*(?:[-*•]|\d+[.)])\s+/gm, "")
    .replace(/[*_`#]/g, "")
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/\s*\n+\s*/g, ". ")
    .replace(/\.{2,}/g, ".")
    .replace(/\s+/g, " ")
    .trim();
}

// Cắt thành các đoạn ngắn: Chrome trên Android hay tự dừng nếu một lượt đọc quá dài,
// và giọng online cần tải cả đoạn trước khi đọc nên đoạn ĐẦU để thật ngắn cho bắt đầu đọc nhanh
function speechChunks(text, firstMax = 60, max = 170) {
  const pieces = [];
  for (const s of text.match(/[^.!?…]+[.!?…]*/g) || [text]) {
    let rest = s.trim();
    while (rest.length > max) {
      const cut = rest.lastIndexOf(" ", max);
      const at = cut > 40 ? cut : max;
      pieces.push(rest.slice(0, at).trim());
      rest = rest.slice(at).trim();
    }
    if (rest) pieces.push(rest);
  }
  if (pieces.length > 0 && pieces[0].length > firstMax) {
    const f = pieces[0];
    const i = Math.max(f.lastIndexOf(", ", firstMax), f.lastIndexOf(" ", firstMax));
    if (i > 20) pieces.splice(0, 1, f.slice(0, i + 1).trim(), f.slice(i + 1).trim());
  }
  const out = [];
  let cur = "";
  for (const p of pieces) {
    const lim = out.length === 0 ? firstMax : max;
    if (cur && `${cur} ${p}`.length > lim) {
      out.push(cur);
      cur = p;
    } else {
      cur = cur ? `${cur} ${p}` : p;
    }
  }
  if (cur) out.push(cur);
  return out;
}

export default function MessageBubble({
  message,
  streamingText,
  sending,
  hiddenSuggestionIds = [],
  animateIn = false,
  showFeedback = false,
  feedback = null,
  onFeedback,
  onReply,
  partIndex = 0,
  partCount = 1,
  fullText = null,
}) {
  const navigate = useNavigate();
  const imgElRef = useRef(null);
  const speakingRef = useRef(false);
  const [mediaError, setMediaError] = useState(false);
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [thinking] = useState(() =>
    message.sender_type === "ai" && animateIn && partIndex === 0 ? takeThinking(message.id) : null
  );

  const isUser = message.sender_type === "user";
  const isAI = message.sender_type === "ai";
  const isLastPart = partIndex >= partCount - 1;
  const hasMedia = Boolean(message.image_url) && !mediaError;
  const isVideo =
    message.media_type === "video" ||
    (typeof message.image_url === "string" &&
      /\.(mp4|webm|mov|m3u8)$/i.test(message.image_url));

  // Đồng bộ trạng thái ảnh đã cache xong (nếu có) sau khi mount
  useEffect(() => {
    const el = imgElRef.current;
    if (el && el.complete && el.naturalWidth > 0) setMediaLoaded(true);
  }, [message.image_url]);

  useEffect(() => {
    speakingRef.current = speaking;
  }, [speaking]);

  // Nạp sẵn giọng đọc ngay khi có tin AI để lần bấm Nghe đầu tiên không bị trễ
  useEffect(() => {
    if (isAI) warmVoices();
  }, [isAI]);

  // Rời màn hình thì tắt tiếng đang đọc
  useEffect(
    () => () => {
      if (speakingRef.current && canSpeak()) window.speechSynthesis.cancel();
    },
    []
  );

  const plainText = getPlainText(message);

  const handleCopy = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(plainText);
      } else {
        const ta = document.createElement("textarea");
        ta.value = plainText;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (e) {
      console.warn("Copy failed:", e);
    }
  }, [plainText]);

  // Bấm để nghe toàn bộ câu trả lời, bấm lại để dừng
  const handleSpeak = useCallback(() => {
    if (!canSpeak()) return;
    const synth = window.speechSynthesis;
    if (speakingRef.current) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const chunks = speechChunks(toSpeechText(cleanAIText(fullText ?? message.message ?? "")));
    if (chunks.length === 0) return;
    setSpeaking(true);

    const start = () => {
      const voice = viVoice || pickViVoice();
      if (voice) viVoice = voice;
      synth.resume(); // Android đôi khi để kẹt ở trạng thái tạm dừng
      chunks.forEach((c, i) => {
        const u = new SpeechSynthesisUtterance(c);
        u.lang = "vi-VN";
        if (voice) u.voice = voice;
        u.rate = 1;
        if (i === chunks.length - 1) u.onend = () => setSpeaking(false);
        u.onerror = () => setSpeaking(false);
        synth.speak(u);
      });
    };

    // Chỉ huỷ khi đang đọc dở (huỷ rồi đọc ngay dễ làm Chrome trễ vài giây, nên chờ một nhịp ngắn)
    if (synth.speaking || synth.pending) {
      synth.cancel();
      setTimeout(start, 80);
    } else {
      start();
    }
  }, [fullText, message.message]);

  const replyBtn = (
    <SideBtn label="Trả lời" onClick={() => onReply?.({ id: message.id, text: plainText })}>
      <Reply size={18} strokeWidth={1.7} />
    </SideBtn>
  );
  const copyBtn = (
    <SideBtn label={copied ? "Đã sao chép" : "Sao chép"} onClick={handleCopy}>
      {copied ? <Check size={18} strokeWidth={1.9} /> : <Copy size={17} strokeWidth={1.7} />}
    </SideBtn>
  );

  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-1.5">
        {hasMedia && (
          <button
            type="button"
            onClick={() => setLightbox(true)}
            aria-label="Xem ảnh đã gửi"
            className="max-w-[78%] overflow-hidden rounded-[22px] border border-[#e6e6df]"
          >
            <img
              src={message.image_url}
              alt="Ảnh bạn đã gửi"
              className="block max-h-72 w-full object-cover"
              loading="lazy"
              onError={() => setMediaError(true)}
            />
          </button>
        )}
        {message.message && (
          <div className="flex w-full items-center justify-end gap-0.5">
            <div className="flex shrink-0 items-center">
              {replyBtn}
              {copyBtn}
            </div>
            <div
              className={`nxx-user-pill min-w-0 max-w-[calc(100%-80px)] rounded-[24px] px-4 py-3 ${
                animateIn ? "is-new" : ""
              }`}
            >
              <QuotedText text={message.message} />
            </div>
          </div>
        )}
        {lightbox && (
          <ImageLightbox
            src={message.image_url}
            alt="Ảnh bạn đã gửi"
            title="Ảnh bạn đã gửi"
            onClose={() => setLightbox(false)}
          />
        )}
      </div>
    );
  }

  const isStreaming = streamingText !== null && streamingText !== undefined;
  const displayText = isStreaming ? streamingText : message.message;

  // Nút hành động đọc từ TOÀN BỘ câu trả lời, nhưng chỉ hiện ở tin cuối
  const sourceText = fullText ?? message.message ?? "";

  const finalActions =
    !isStreaming && isLastPart
      ? message.actions?.length
        ? message.actions
        : parseActionsFromText(sourceText)
      : [];

  const fbLocked = feedback?.status === "sent";

  const handleActionClick = (action) => {
    if (!action?.path) return;
    if (/^(https?:|mailto:|tel:)/.test(action.path)) {
      window.open(action.path, "_blank", "noopener,noreferrer");
      return;
    }
    navigate(action.path);
  };

  return (
    <div className={`flex justify-start ${animateIn ? "nxx-rise" : ""}`}>
      <div className="w-full">
        {thinking && (
          <div className="mb-1.5">
            <ThinkingBlock done lines={thinking.lines} seconds={thinking.seconds} />
          </div>
        )}
        {hasMedia && partIndex === 0 && (
          <div className="mb-2 overflow-hidden rounded-[22px] border border-[#e6e6df] bg-[#f2f2ee]">
            {isVideo ? (
              <video
                src={message.image_url}
                controls
                playsInline
                preload="metadata"
                className="block max-h-96 w-full bg-black object-contain"
                onError={() => setMediaError(true)}
              />
            ) : (
              <button
                type="button"
                onClick={() => setLightbox(true)}
                aria-label="Xem ảnh lớn"
                className={`block w-full ${mediaLoaded ? "" : "nxx-skel min-h-[180px]"}`}
              >
                <img
                  ref={imgElRef}
                  src={message.image_url}
                  alt="Hướng dẫn"
                  loading="lazy"
                  onLoad={() => setMediaLoaded(true)}
                  onError={() => setMediaError(true)}
                  className={`block max-h-96 w-full object-contain transition-opacity duration-300 ${
                    mediaLoaded ? "opacity-100" : "opacity-0"
                  }`}
                />
              </button>
            )}
          </div>
        )}

        {displayText && (
          <div className="nxx-ai-bubble min-w-0">
            <MarkdownText text={displayText} />
            {isStreaming && <span className="nxx-streaming-cursor" />}
          </div>
        )}

        {finalActions.length > 0 && (
          <div className="nxx-rise mt-3 space-y-2">
            {finalActions.map((action, idx) => (
              <button
                key={action.id ?? action.path ?? idx}
                type="button"
                onClick={() => handleActionClick(action)}
                className="flex w-full items-center gap-3 rounded-[20px] border border-[#e6e6df] bg-white px-3.5 py-3 text-left transition active:bg-[#f2f2ee]"
              >
                {action.icon ? (
                  <img
                    src={action.icon}
                    alt=""
                    className="h-8 w-8 shrink-0 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f2f2ee]">
                    <span className="text-base">🔗</span>
                  </div>
                )}
                <span className="flex-1 text-[14.5px] font-medium leading-tight text-[#2b2b2b]">
                  {action.label}
                </span>
                <ChevronRight size={16} className="shrink-0 text-[#a2a29b]" />
              </button>
            ))}
          </div>
        )}

        {/* Hàng nút dưới câu trả lời (chỉ ở tin cuối): hữu ích / chưa hữu ích / nghe / sao chép / trả lời, "Do AI tạo" ở bên phải */}
        {!isStreaming && isAI && isLastPart && (
          <div className="-ml-2 mt-1 flex items-center gap-0.5">
            {showFeedback && (
              <>
                <SideBtn
                  label="Hữu ích"
                  pressed={feedback?.rating === "up"}
                  disabled={fbLocked}
                  onClick={() => onFeedback?.(message, "up")}
                  className={feedbackClass(feedback, "up")}
                >
                  <ThumbsUp size={17} strokeWidth={1.8} />
                </SideBtn>
                <SideBtn
                  label="Chưa hữu ích"
                  pressed={feedback?.rating === "down"}
                  disabled={fbLocked}
                  onClick={() => onFeedback?.(message, "down")}
                  className={feedbackClass(feedback, "down")}
                >
                  <ThumbsDown size={17} strokeWidth={1.8} />
                </SideBtn>
              </>
            )}
            {canSpeak() && (
              <SideBtn label={speaking ? "Dừng đọc" : "Nghe"} pressed={speaking} onClick={handleSpeak}>
                {speaking ? <Square size={15} strokeWidth={2} fill="currentColor" /> : <Volume2 size={18} strokeWidth={1.7} />}
              </SideBtn>
            )}
            {copyBtn}
            {replyBtn}
            <div className="ml-auto flex items-center gap-1 pr-1 opacity-80">
              <Sparkles size={11} className="text-[#a2a29b]" strokeWidth={2.4} />
              <span className="text-[11px] text-[#8b8b84]">Do AI tạo</span>
            </div>
          </div>
        )}

        {lightbox && (
          <ImageLightbox
            src={message.image_url}
            alt="Hướng dẫn"
            title="Ảnh hướng dẫn"
            onClose={() => setLightbox(false)}
          />
        )}
      </div>
    </div>
  );
}
