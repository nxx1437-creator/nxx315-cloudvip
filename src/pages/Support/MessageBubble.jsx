import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check, ChevronRight, Copy, LogIn, Sparkles, ThumbsDown, ThumbsUp,
} from "lucide-react";
import MarkdownText from "./MarkdownText.jsx";
import ImageLightbox from "./ImageLightbox.jsx";
import { cleanAIText, shouldShowLoginButton } from "./helpers.js";

const ICON_BASE =
  "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/icons";

function getIconForPath(path) {
  if (path.startsWith("/store")) return `${ICON_BASE}/icon-rocket.png`;
  if (path.startsWith("/tasks") || path.startsWith("/shop-earn"))
    return `${ICON_BASE}/icon-task.png`;
  if (path.startsWith("/wallet")) return `${ICON_BASE}/icon-coin.png`;
  if (
    path.startsWith("/history") ||
    path.startsWith("/profile") ||
    path.startsWith("/community")
  )
    return `${ICON_BASE}/icon-link.png`;
  if (path.startsWith("/help") || path.startsWith("/contact"))
    return `${ICON_BASE}/icon-chat.png`;
  if (path.startsWith("https://zalo.me/"))
    return `${ICON_BASE}/icon-chat.png`;
  return `${ICON_BASE}/icon-rocket.png`;
}

const LABEL_MAP = {
  "/store": "Xem cửa hàng",
  "/store/roblox": "Đổi Robux",
  "/store/lien-quan": "Đổi Liên Quân",
  "/store/pubg-mobile": "Đổi PUBG",
  "/store/free-fire": "Đổi Free Fire",
  "/store/fc-mobile": "Đổi FC Mobile",
  "/store/valorant": "Đổi Valorant",
  "/store/play-together": "Đổi Play Together",
  "/tasks": "Làm nhiệm vụ",
  "/shop-earn": "Kiếm Coin",
  "/community": "Cộng đồng",
  "/wallet": "Xem ví",
  "/history": "Lịch sử đơn",
  "/profile": "Trang cá nhân",
  "/help": "Trung tâm trợ giúp",
  "/contact": "Liên hệ hỗ trợ",
  "https://zalo.me/0865245988": "Chat Zalo",
};

// ✅ Parse path từ text AI
function parseActionsFromText(text) {
  if (!text) return [];

  const found = [];
  const seen = new Set();
  const pathRegex =
    /(?:\/[a-z0-9\-]+(?:\/[a-z0-9\-]+)*|https:\/\/zalo\.me\/\d+)/gi;

  const VALID = [
    "/store",
    "/tasks",
    "/shop-earn",
    "/community",
    "/wallet",
    "/history",
    "/profile",
    "/help",
    "/contact",
  ];

  let match;
  while ((match = pathRegex.exec(text)) !== null) {
    const path = match[0];
    if (seen.has(path)) continue;
    seen.add(path);

    const isValid =
      VALID.some((p) => path === p || path.startsWith(p + "/")) ||
      path.startsWith("https://zalo.me/");

    if (!isValid) continue;

    found.push({
      label:
        LABEL_MAP[path] ||
        path.replace(/^\/store\//, "Đổi ").replace(/^\//, ""),
      path,
      icon: getIconForPath(path),
    });

    if (found.length >= 4) break;
  }

  return found;
}

// Nút nhỏ trong hàng thao tác (sao chép / 👍 / 👎)
function RowButton({ label, onClick, disabled, className = "", children, pressed }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={`nxx-iconbtn h-9 w-9 rounded-[11px] text-[#13141a] transition-colors hover:bg-[#f5f6fb] ${className}`}
    >
      {children}
    </button>
  );
}

// Màu nút phản hồi: nháp (chưa gửi) = pastel, đã gửi = đậm
function feedbackClass(fb, type) {
  if (!fb || fb.rating !== type) return "";
  if (type === "up") {
    return fb.status === "sent"
      ? "!bg-[#16b981] !text-white"
      : "!bg-[#bff0dc]";
  }
  return fb.status === "sent" ? "!bg-[#f43f5e] !text-white" : "!bg-[#ffd0d8]";
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
}) {
  const navigate = useNavigate();
  const [mediaError, setMediaError] = useState(false);
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [copied, setCopied] = useState(false);

  const isUser = message.sender_type === "user";
  const isAI = message.sender_type === "ai";
  const isSuggestionHidden = hiddenSuggestionIds.includes(message.id);

  const hasMedia = message.image_url && !mediaError;
  const isVideo =
    message.media_type === "video" ||
    message.image_url?.match(/\.(mp4|webm|mov|m3u8)$/i);

  // Ảnh đã nằm trong cache thì onLoad có thể bắn trước khi React gắn listener
  const imgRef = (el) => {
    if (el && el.complete && el.naturalWidth > 0 && !mediaLoaded) {
      setMediaLoaded(true);
    }
  };

  // ==================================================
  // USER BUBBLE — viên thuốc đen, quét gradient khi vừa gửi
  // ==================================================
  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-1.5">
        {hasMedia && (
          <button
            type="button"
            onClick={() => setLightbox(true)}
            aria-label="Xem ảnh đã gửi"
            className="max-w-[78%] overflow-hidden rounded-[22px] border border-[#dde0ea]"
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
          <div
            className={`nxx-user-pill max-w-[84%] rounded-[24px] px-4 py-2.5 ${
              animateIn ? "is-new" : ""
            }`}
          >
            <p className="whitespace-pre-wrap break-words text-[15px] leading-6">
              {message.message}
            </p>
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

  // ==================================================
  // AI MESSAGE — chữ trực tiếp trên nền trắng, không khung
  // ==================================================
  const displayText =
    streamingText !== null && streamingText !== undefined
      ? streamingText
      : message.message;
  const isStreaming = streamingText !== null && streamingText !== undefined;

  // ✅ Actions từ backend
  const backendActions =
    message.actions &&
    Array.isArray(message.actions) &&
    message.actions.length > 0
      ? message.actions
      : [];

  // ✅ Fallback: parse từ text
  const parsedActions =
    backendActions.length === 0 && !isStreaming
      ? parseActionsFromText(message.message || "")
      : [];

  const finalActions =
    backendActions.length > 0 ? backendActions : parsedActions;

  const hasActions = finalActions.length > 0;

  // Giữ nguyên điều kiện cũ: nút Đăng nhập chỉ xuất hiện cùng danh sách gợi ý
  const showLoginButton =
    isLastAIMessage &&
    !isStreaming &&
    message.suggestions?.length > 0 &&
    !isSuggestionHidden &&
    shouldShowLoginButton(message.message);

  const handleActionClick = (action) => {
    if (!action?.path) return;
    if (action.path.startsWith("http")) {
      window.open(action.path, "_blank", "noopener,noreferrer");
      return;
    }
    navigate(action.path);
  };

  const handleCopy = async () => {
    const text = cleanAIText(message.message || "");
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
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
  };

  const fbLocked = feedback?.status === "sent";

  return (
    <div className={`flex justify-start ${animateIn ? "nxx-rise" : ""}`}>
      <div className="w-full max-w-[94%]">
        {/* MEDIA */}
        {hasMedia && (
          <div className="mb-3 overflow-hidden rounded-[22px] border border-[#dde0ea] bg-[#f5f6fb]">
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
                className={`block w-full ${
                  mediaLoaded ? "" : "nxx-skel min-h-[180px]"
                }`}
              >
                <img
                  ref={imgRef}
                  src={message.image_url}
                  alt="Hướng dẫn"
                  className={`block max-h-96 w-full object-contain transition-opacity duration-300 ${
                    mediaLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  loading="lazy"
                  onLoad={() => setMediaLoaded(true)}
                  onError={() => setMediaError(true)}
                />
              </button>
            )}
          </div>
        )}

        {/* TEXT */}
        {displayText && (
          <div className="px-0.5">
            <MarkdownText text={displayText} />
            {isStreaming && (
              <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-[#a2a5b8] align-middle" />
            )}
          </div>
        )}

        {/* ACTION BUTTONS */}
        {hasActions && !isStreaming && (
          <div className="nxx-rise mt-3 space-y-2">
            {finalActions.map((action, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleActionClick(action)}
                className="flex w-full items-center gap-3 rounded-[20px] border border-[#dde0ea] bg-white px-3.5 py-3 text-left transition active:bg-[#f5f6fb]"
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
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f5f6fb]">
                    <span className="text-base">🔗</span>
                  </div>
                )}
                <span className="flex-1 text-[14.5px] font-medium leading-tight text-[#13141a]">
                  {action.label}
                </span>
                <ChevronRight size={16} className="shrink-0 text-[#a2a5b8]" />
              </button>
            ))}
          </div>
        )}

        {/* LOGIN */}
        {showLoginButton && (
          <button
            type="button"
            onClick={onShowLogin}
            disabled={sending}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#13141a] px-5 py-2.5 text-[14px] font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
          >
            <LogIn size={16} strokeWidth={2.4} />
            Đăng nhập
          </button>
        )}

        {/* FOOTER */}
        {!isStreaming && isAI && (
          <div className="mt-2.5">
            <div className="flex items-center gap-1 px-0.5">
              <Sparkles size={11} className="text-[#a2a5b8]" strokeWidth={2.4} />
              <span className="text-[11px] text-[#7b7e90]">Do AI tạo</span>
            </div>

            {showFeedback && (
              <div className="mt-2 flex items-center justify-center gap-1.5">
                <RowButton label={copied ? "Đã sao chép" : "Sao chép"} onClick={handleCopy}>
                  {copied ? (
                    <Check size={18} strokeWidth={2} />
                  ) : (
                    <Copy size={18} strokeWidth={1.8} />
                  )}
                </RowButton>
                <RowButton
                  label="Chưa hữu ích"
                  pressed={feedback?.rating === "down"}
                  disabled={fbLocked}
                  onClick={() => onFeedback?.("down")}
                  className={feedbackClass(feedback, "down")}
                >
                  <ThumbsDown size={18} strokeWidth={1.8} />
                </RowButton>
                <RowButton
                  label="Hữu ích"
                  pressed={feedback?.rating === "up"}
                  disabled={fbLocked}
                  onClick={() => onFeedback?.("up")}
                  className={feedbackClass(feedback, "up")}
                >
                  <ThumbsUp size={18} strokeWidth={1.8} />
                </RowButton>
              </div>
            )}
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
    
            
