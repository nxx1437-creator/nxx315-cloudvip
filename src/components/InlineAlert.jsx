import React, { useState } from "react";
import {
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  X,
  ArrowRight,
} from "lucide-react";

/**
 * Inline Alert — thông báo trong luồng nội dung
 *
 * @param {string} severity - "warning" | "info" | "success" | "error"
 * @param {string} message - Nội dung thông báo
 * @param {boolean} marquee - Chữ chạy ngang (default: false)
 * @param {boolean} dismissible - Cho phép đóng (default: false)
 * @param {object} action - { label, onClick, href }
 * @param {boolean} live - Có dùng role="alert"/"status" không (default: false)
 * @param {function} onDismiss - Callback khi đóng
 */
export default function InlineAlert({
  severity = "warning",
  message,
  marquee = false,
  dismissible = false,
  action,
  live = false,
  onDismiss,
}) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // Config theo severity
  const CONFIG = {
    warning: {
      icon: AlertTriangle,
      surface: "bg-amber-50",
      border: "border-amber-200",
      accent: "#f59e0b",
      text: "text-amber-900",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      actionColor: "text-amber-700 hover:bg-amber-100",
    },
    info: {
      icon: Info,
      surface: "bg-sky-50",
      border: "border-sky-200",
      accent: "#0ea5e9",
      text: "text-sky-900",
      iconBg: "bg-sky-100",
      iconColor: "text-sky-600",
      actionColor: "text-sky-700 hover:bg-sky-100",
    },
    success: {
      icon: CheckCircle2,
      surface: "bg-emerald-50",
      border: "border-emerald-200",
      accent: "#10b981",
      text: "text-emerald-900",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      actionColor: "text-emerald-700 hover:bg-emerald-100",
    },
    error: {
      icon: XCircle,
      surface: "bg-rose-50",
      border: "border-rose-200",
      accent: "#ef4444",
      text: "text-rose-900",
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
      actionColor: "text-rose-700 hover:bg-rose-100",
    },
  };

  const cfg = CONFIG[severity] || CONFIG.warning;
  const Icon = cfg.icon;

  // Live region role — chỉ dùng khi message dynamic + được chỉ định
  const liveRole = live ? (severity === "error" ? "alert" : "status") : undefined;

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  return (
    <div
      role={liveRole}
      aria-live={live ? (severity === "error" ? "assertive" : "polite") : undefined}
      className={`relative overflow-hidden rounded-xl border ${cfg.border} ${cfg.surface} ${cfg.text} shadow-sm`}
      style={{
        borderInlineStartWidth: "4px",
        borderInlineStartColor: cfg.accent,
      }}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Icon */}
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${cfg.iconBg}`}
        >
          <Icon size={15} className={cfg.iconColor} strokeWidth={2.4} />
        </div>

        {/* Message */}
        <div className="min-w-0 flex-1 pt-0.5">
          {marquee ? (
            <div className="relative overflow-hidden">
              <div className="marquee-content">
                <span className="marquee-text text-[13px] font-medium leading-5">
                  {message}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-[13px] font-medium leading-5">{message}</p>
          )}
        </div>

        {/* Action */}
        {action && (
          <div className="shrink-0 pt-0.5">
            {action.href ? (
              <a
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[12px] font-bold transition ${cfg.actionColor}`}
              >
                {action.label}
                <ArrowRight size={12} />
              </a>
            ) : (
              <button
                onClick={action.onClick}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[12px] font-bold transition ${cfg.actionColor}`}
              >
                {action.label}
                <ArrowRight size={12} />
              </button>
            )}
          </div>
        )}

        {/* Dismiss button */}
        {dismissible && (
          <button
            onClick={handleDismiss}
            aria-label="Đóng thông báo"
            className={`shrink-0 rounded-lg p-1.5 transition hover:bg-black/5 ${cfg.text}`}
          >
            <X size={14} strokeWidth={2.4} />
          </button>
        )}
      </div>

      {/* CSS cho marquee */}
      {marquee && (
        <style>{`
          @keyframes marqueeScroll {
            0% {
              transform: translateX(100%);
            }
            100% {
              transform: translateX(-100%);
            }
          }
          .marquee-content {
            display: flex;
            white-space: nowrap;
            animation: marqueeScroll 20s linear infinite;
          }
          .marquee-text {
            display: inline-block;
            padding-right: 100%;
          }
          .marquee-content:hover {
            animation-play-state: paused;
          }
        `}</style>
      )}
    </div>
  );
}
