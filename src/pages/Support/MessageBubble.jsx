// src/pages/Support/MessageBubble.jsx — AI: chữ rộng hết khung, không bóng, nút thao tác nằm dưới (kiểu Gemini); bạn: bóng kem + nút trả lời, sao chép
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronRight, Copy, LogIn, Reply, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";
import MarkdownText from "./MarkdownText.jsx";
import ImageLightbox from "./ImageLightbox.jsx";
import { cleanAIText, shouldShowLoginButton } from "./helpers.js";
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

export default function MessageBubble({
  message,
  streamingText,
  isLastAIMessage,
  sending,
  onShowLogin,
  hiddenSuggestionIds = [],
  animateIn = false,
  showFeedback = false,
  feedback = null,
  onFeedback,
  onReply,
}) {
  const navigate = useNavigate();
  const imgElRef = useRef(null);
  const [mediaError, setMediaError] = useState(false);
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [copied, setCopied] = useState(false);
  const [thinking] = useState(() =>
    message.sender_type === "ai" && animateIn ? takeThinking(message.id) : null
  );

  const isUser = message.sender_type === "user";
  const isAI = message.sender_type === "ai";
  const isSuggestionHidden = hiddenSuggestionIds.includes(message.id);
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

  const finalActions = !isStreaming
    ? message.actions?.length
      ? message.actions
      : parseActionsFromText(message.message || "")
    : [];

  const showLoginButton =
    isLastAIMessage &&
    !isStreaming &&
    message.suggestions?.length > 0 &&
    !isSuggestionHidden &&
    shouldShowLoginButton(message.message || "");

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
        {hasMedia && (
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

        {showLoginButton && (
          <button
            type="button"
            onClick={onShowLogin}
            disabled={sending}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#2b2b2b] px-5 py-2.5 text-[14px] font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
          >
            <LogIn size={16} strokeWidth={2.4} />
            Đăng nhập
          </button>
        )}

        {/* Hàng nút dưới câu trả lời: hữu ích / chưa hữu ích / sao chép / trả lời, "Do AI tạo" ở bên phải */}
        {!isStreaming && isAI && (
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
