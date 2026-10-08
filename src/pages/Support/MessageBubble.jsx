import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, LogIn } from "lucide-react";
import MarkdownText from "./MarkdownText.jsx";
import { shouldShowLoginButton } from "./helpers.js";

export default function MessageBubble({
  message,
  streamingText,
  isLastAIMessage,
  onSuggestionClick,
  sending,
  onShowLogin,
  hiddenSuggestionIds = [],
  onHideSuggestions,
}) {
  const navigate = useNavigate();
  const [mediaError, setMediaError] = useState(false);

  const isUser = message.sender_type === "user";
  const isAI = message.sender_type === "ai";
  const isSuggestionHidden = hiddenSuggestionIds.includes(message.id);

  const hasMedia = message.image_url && !mediaError;
  const isVideo =
    message.media_type === "video" ||
    message.image_url?.match(/\.(mp4|webm|mov|m3u8)$/i);

  // ==================================================
  // USER BUBBLE
  // ==================================================
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="relative max-w-[78%]">
          <div className="absolute -right-[5px] top-0 h-3 w-3 bg-[#FFE5EC] [clip-path:polygon(0_0,100%_0,0_100%)]" />
          <div className="overflow-hidden rounded-[20px] rounded-tr-[6px] bg-[#FFE5EC] shadow-[0_2px_8px_rgba(254,44,85,0.08)]">
            {hasMedia && (
              <img
                src={message.image_url}
                alt="User upload"
                className="max-h-72 w-full object-cover"
                loading="lazy"
              />
            )}
            {message.message && (
              <p className="whitespace-pre-wrap break-words px-4 py-2.5 text-[14px] leading-6 text-[#161823]">
                {message.message}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==================================================
  // AI BUBBLE
  // ==================================================
  const displayText =
    streamingText !== null ? streamingText : message.message;
  const isStreaming = streamingText !== null;
  const hasSuggestions =
    isLastAIMessage &&
    message.suggestions?.length > 0 &&
    !isStreaming &&
    !isSuggestionHidden;
  const hasActions =
    message.actions &&
    Array.isArray(message.actions) &&
    message.actions.length > 0;
  // ✅ FALLBACK: Parse nút từ text nếu AI không gọi tool
const parsedActions = (() => {
  // Chỉ parse khi không có actions từ backend
  if (hasActions) return [];

  const text = message.message || "";
  const lines = text.split("\n");
  const found = [];

  const PATH_REGEX =
    /^(.*?)\s*(?:→|->|>)\s*(\/[a-z0-9\-\/]+|https?:\/\/[^\s]+)$/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = trimmed.match(PATH_REGEX);
    if (match) {
      const label = match[1].trim();
      const path = match[2].trim();

      // Validate path
      const VALID_PREFIXES = [
        "/store",
        "/tasks",
        "/shop-earn",
        "/community",
        "/wallet",
        "/history",
        "/profile",
        "/help",
        "/contact",
        "https://zalo.me/",
      ];

      const isValid = VALID_PREFIXES.some(
        (prefix) => path.startsWith(prefix) || path === prefix
      );

      if (isValid && label.length < 50) {
        found.push({
          label: label.slice(0, 30),
          path,
          icon: getIconForPath(path),
        });
      }
    }
  }

  return found.slice(0, 4);
})();

// ✅ Helper — chọn icon theo path
function getIconForPath(path) {
  const ICON_BASE =
    "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/icons";

  if (path.startsWith("/store")) return `${ICON_BASE}/icon-rocket.png`;
  if (path.startsWith("/tasks") || path.startsWith("/shop-earn"))
    return `${ICON_BASE}/icon-task.png`;
  if (path.startsWith("/wallet")) return `${ICON_BASE}/icon-coin.png`;
  if (path.startsWith("/history") || path.startsWith("/profile"))
    return `${ICON_BASE}/icon-link.png`;
  if (path.startsWith("/help") || path.startsWith("/contact"))
    return `${ICON_BASE}/icon-chat.png`;
  if (path.startsWith("https://zalo.me/"))
    return `${ICON_BASE}/icon-chat.png`;
  return `${ICON_BASE}/icon-rocket.png`;
}
  const showLoginButton =
    isLastAIMessage &&
    !isStreaming &&
    !isSuggestionHidden &&
    shouldShowLoginButton(message.message);

  const handleSuggestionClick = (reply) => {
    if (onHideSuggestions) onHideSuggestions();
    onSuggestionClick(reply);
  };

  const handleActionClick = (action) => {
    if (!action?.path) return;
    if (action.path.startsWith("http")) {
      window.open(action.path, "_blank", "noopener,noreferrer");
      return;
    }
    navigate(action.path);
  };

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%]">
        <div className="relative">
          <div className="absolute -left-[5px] top-0 h-3 w-3 bg-white [clip-path:polygon(0_0,100%_0,100%_100%)]" />

          <div className="overflow-hidden rounded-[20px] rounded-tl-[6px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            {/* ============ MEDIA (Ảnh/Video) ============ */}
            {hasMedia && (
              <div className="bg-white">
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
                    onClick={() =>
                      window.open(message.image_url, "_blank")
                    }
                    onError={() => setMediaError(true)}
                  />
                )}
              </div>
            )}

            {/* ============ TEXT với Markdown ============ */}
            {displayText && (
              <div className="px-4 py-3">
                <MarkdownText text={displayText} />
                {isStreaming && (
                  <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-slate-400 align-middle" />
                )}
              </div>
            )}

            {/* ============ ACTION BUTTONS với icon 3D ============ */}
            {(hasActions || parsedActions.length > 0) && !isStreaming && (
  <div className="border-t border-slate-100 px-3 py-3">
    <div className="space-y-2">
      {(hasActions ? message.actions : parsedActions).map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleActionClick(action)}
                      className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
                    >
                      {/* Icon 3D */}
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
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          <span className="text-base">🔗</span>
                        </div>
                      )}

                      <span className="flex-1 text-[13.5px] font-semibold leading-tight text-slate-700">
                        {action.label}
                      </span>

                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="shrink-0 text-slate-400"
                      >
                        <path
                          d="M9 6l6 6-6 6"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ============ SUGGESTIONS ============ */}
            {hasSuggestions && (
              <div className="border-t border-slate-100">
                {message.suggestions.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(reply)}
                    disabled={sending}
                    className={`flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 ${
                      idx !== message.suggestions.length - 1 ||
                      showLoginButton
                        ? "border-b border-slate-100"
                        : ""
                    }`}
                  >
                    <span className="text-[14px] font-medium leading-5 text-slate-700">
                      {reply}
                    </span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="shrink-0 text-slate-300"
                    >
                      <path
                        d="M9 6l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                ))}

                {showLoginButton && (
                  <button
                    onClick={onShowLogin}
                    className="flex w-full items-center justify-center gap-2 bg-[#FE2C55] px-4 py-3 text-sm font-bold text-white transition hover:brightness-110 active:scale-[0.99]"
                  >
                    <LogIn size={16} strokeWidth={2.4} />
                    Đăng nhập
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Label AI */}
        {!isStreaming && isAI && (
          <div className="mt-1.5 flex items-center gap-1 px-2">
            <Sparkles size={11} className="text-slate-400" strokeWidth={2.4} />
            <span className="text-[11px] text-[#8a8d93]">Do AI tạo</span>
          </div>
        )}
      </div>
    </div>
  );
                          }
