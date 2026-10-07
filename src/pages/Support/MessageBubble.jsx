import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, LogIn } from "lucide-react";
import { shouldShowLoginButton } from "./helpers.js";
import MarkdownText from "./MarkdownText.jsx";

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

            {/* ============ TEXT ============ */}
            {displayText && (
  <div className="px-4 py-3">
    <MarkdownText text={displayText} />
    {isStreaming && (
      <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-slate-400 align-middle" />
    )}
  </div>
)}

            {/* ============ ACTION BUTTONS ============ */}
            {hasActions && !isStreaming && (
              <div className="border-t border-slate-100 px-3 py-3">
                <div className="grid grid-cols-2 gap-2">
                  {message.actions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleActionClick(action)}
                      className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left transition hover:border-slate-300 hover:bg-white active:scale-[0.97]"
                    >
                      <span className="line-clamp-2 text-[12.5px] font-semibold leading-tight text-slate-700">
                        {action.label}
                      </span>
                      <svg
                        width="14"
                        height="14"
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
