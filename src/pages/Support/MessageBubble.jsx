import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, LogIn, Copy, Check, ThumbsUp, ThumbsDown, ChevronRight,
} from "lucide-react";
import MarkdownText from "./MarkdownText.jsx";
import { shouldShowLoginButton } from "./helpers.js";

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

export default function MessageBubble({
  message,
  streamingText,
  isLastAIMessage,
  isFresh = false,          // tin vừa gửi → chạy hiệu ứng quét gradient
  rating = null,            // "up" | "down" | null
  onRate,                   // (rating) => void
  onCopy,                   // (text) => void
  onShowLogin,
  hideLogin = false,
}) {
  const navigate = useNavigate();
  const [mediaError, setMediaError] = useState(false);
  const [copied, setCopied] = useState(false);

  const isUser = message.sender_type === "user";
  const isAI = message.sender_type === "ai";

  const hasMedia = message.image_url && !mediaError;
  const isVideo =
    message.media_type === "video" ||
    message.image_url?.match(/\.(mp4|webm|mov|m3u8)$/i);

  // ==================================================
  // USER BUBBLE — viên thuốc đen, chữ trắng
  // ==================================================
  if (isUser) {
    return (
      <div className="msg-in flex justify-end">
        <div
          className={`relative max-w-[82%] overflow-hidden rounded-[22px] bg-[var(--chat-ink)] text-white ${
            isFresh ? "bubble-sweep" : ""
          }`}
        >
          {hasMedia && (
            <img
              src={message.image_url}
              alt="Ảnh bạn gửi"
              className="relative z-[1] max-h-72 w-full object-cover"
              loading="lazy"
            />
          )}
          {message.message && (
            <p className="relative z-[1] whitespace-pre-wrap break-words px-4 py-2.5 text-[15px] leading-6">
              {message.message}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ==================================================
  // AI MESSAGE — không bong bóng, chữ nằm trực tiếp trên nền
  // ==================================================
  const displayText =
    streamingText !== null ? streamingText : message.message;
  const isStreaming = streamingText !== null;

  const backendActions =
    message.actions &&
    Array.isArray(message.actions) &&
    message.actions.length > 0
      ? message.actions
      : [];

  const parsedActions =
    backendActions.length === 0 && !isStreaming
      ? parseActionsFromText(message.message || "")
      : [];

  const finalActions =
    backendActions.length > 0 ? backendActions : parsedActions;
  const hasActions = finalActions.length > 0;

  const showLoginButton =
    isLastAIMessage &&
    !isStreaming &&
    !hideLogin &&
    shouldShowLoginButton(message.message);

  // Hàng 📋 👎 👍: chỉ hiện ở tin AI cuối, hoặc tin đã được đánh giá
  const showToolbar = isAI && !isStreaming && (isLastAIMessage || rating);

  const handleActionClick = (action) => {
    if (!action?.path) return;
    if (action.path.startsWith("http")) {
      window.open(action.path, "_blank", "noopener,noreferrer");
      return;
    }
    navigate(action.path);
  };

  const handleCopy = () => {
    onCopy?.(message.message || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const iconBtn =
    "flex h-8 w-8 items-center justify-center rounded-lg text-[var(--chat-ink)] transition active:scale-90";

  return (
    <div className="msg-in flex justify-start">
      <div className="w-full max-w-[92%]">
        {/* MEDIA */}
        {hasMedia && (
          <div className="mb-2 overflow-hidden rounded-[18px] border border-[var(--chat-border)] bg-white">
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
              <img
                src={message.image_url}
                alt="Hướng dẫn"
                className="block max-h-96 w-full cursor-pointer object-contain"
                loading="lazy"
                onClick={() => window.open(message.image_url, "_blank")}
                onError={() => setMediaError(true)}
              />
            )}
          </div>
        )}

        {/* TEXT */}
        {displayText && (
          <div className="text-[15px] leading-7 text-[#3b3f4a]">
            <MarkdownText text={displayText} />
            {isStreaming && (
              <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-[var(--chat-ink)] align-middle" />
            )}
          </div>
        )}

        {/* NÚT HÀNH ĐỘNG (điều hướng) — thẻ bo lớn nền xám nhạt */}
        {hasActions && !isStreaming && (
          <div className="mt-3 space-y-2">
            {finalActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleActionClick(action)}
                style={{ "--i": idx }}
                className="chip-in flex w-full items-center gap-3 rounded-[18px] border border-[var(--chat-border)] bg-[var(--chat-surface)] px-3.5 py-3 text-left transition hover:bg-[#eef0f6] active:scale-[0.98]"
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
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white">
                    <span className="text-base">🔗</span>
                  </div>
                )}
                <span className="flex-1 text-[14px] font-semibold leading-tight text-[var(--chat-ink)]">
                  {action.label}
                </span>
                <ChevronRight
                  size={16}
                  strokeWidth={2.2}
                  className="shrink-0 text-[var(--chat-muted)]"
                />
              </button>
            ))}
          </div>
        )}

        {/* ĐĂNG NHẬP */}
        {showLoginButton && (
          <button
            onClick={onShowLogin}
            className="chip-in mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--chat-ink)] px-5 py-2.5 text-[14px] font-semibold text-white transition active:scale-95"
          >
            <LogIn size={16} strokeWidth={2.4} />
            Đăng nhập
          </button>
        )}

        {/* COPY / 👎 / 👍 */}
        {showToolbar && (
          <div className="label-in mt-2 flex items-center gap-1">
            <button
              onClick={handleCopy}
              aria-label="Sao chép"
              className={`${iconBtn} ${copied ? "bg-[#eceef3]" : "hover:bg-[var(--chat-surface)]"}`}
            >
              {copied ? (
                <Check size={17} strokeWidth={2.2} />
              ) : (
                <Copy size={17} strokeWidth={2} />
              )}
            </button>
            <button
              onClick={() => onRate?.("down")}
              aria-label="Chưa hữu ích"
              aria-pressed={rating === "down"}
              className={`${iconBtn} ${
                rating === "down"
                  ? "bg-[#F43F5E] text-white"
                  : "hover:bg-[var(--chat-surface)]"
              }`}
            >
              <ThumbsDown
                size={17}
                strokeWidth={2}
                fill={rating === "down" ? "currentColor" : "none"}
              />
            </button>
            <button
              onClick={() => onRate?.("up")}
              aria-label="Hữu ích"
              aria-pressed={rating === "up"}
              className={`${iconBtn} ${
                rating === "up"
                  ? "bg-[#10B981] text-white"
                  : "hover:bg-[var(--chat-surface)]"
              }`}
            >
              <ThumbsUp
                size={17}
                strokeWidth={2}
                fill={rating === "up" ? "currentColor" : "none"}
              />
            </button>
          </div>
        )}

        {!isStreaming && isAI && (
          <div className="mt-1.5 flex items-center gap-1">
            <Sparkles
              size={11}
              className="text-[var(--chat-muted)]"
              strokeWidth={2.4}
            />
            <span className="text-[11px] text-[var(--chat-muted)]">
              Do AI tạo
            </span>
          </div>
        )}
      </div>
    </div>
  );
               }
            
