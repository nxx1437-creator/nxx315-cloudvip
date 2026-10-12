import React, { useState } from "react";
import {
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  X,
  ArrowRight,
} from "lucide-react";

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

  const CONFIG = {
    warning: {
      icon: AlertTriangle,
      surface: "bg-amber-50",
      accent: "#f59e0b",
      text: "text-amber-900",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      actionColor: "text-amber-700 hover:bg-amber-100",
    },
    info: {
      icon: Info,
      surface: "bg-sky-50",
      accent: "#0ea5e9",
      text: "text-sky-900",
      iconBg: "bg-sky-100",
      iconColor: "text-sky-600",
      actionColor: "text-sky-700 hover:bg-sky-100",
    },
    success: {
      icon: CheckCircle2,
      surface: "bg-emerald-50",
      accent: "#10b981",
      text: "text-emerald-900",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      actionColor: "text-emerald-700 hover:bg-emerald-100",
    },
    error: {
      icon: XCircle,
      surface: "bg-rose-50",
      accent: "#ef4444",
      text: "text-rose-900",
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
      actionColor: "text-rose-700 hover:bg-rose-100",
    },
  };

  const cfg = CONFIG[severity] || CONFIG.warning;
  const Icon = cfg.icon;

  const liveRole = live
    ? severity === "error"
      ? "alert"
      : "status"
    : undefined;

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  return (
    <div
      role={liveRole}
      aria-live={
        live
          ? severity === "error"
            ? "assertive"
            : "polite"
          : undefined
      }
      className={`group relative overflow-hidden rounded-xl ${cfg.surface} ${cfg.text}`}
    >
      {/* Viền trái gradient */}
      <div
        className="absolute inset-y-0 left-0 w-0.5"
        style={{
          background: `linear-gradient(180deg, ${cfg.accent}, ${cfg.accent}dd)`,
        }}
      />

      {/* Content — thu gọn */}
      <div className="flex items-center gap-2.5 py-2 pl-3 pr-2">
        {/* Icon nhỏ gọn */}
        <div
          className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${cfg.iconBg}`}
        >
          <Icon size={13} className={cfg.iconColor} strokeWidth={2.6} />
        </div>

        {/* Message — text nhỏ hơn */}
        <div className="min-w-0 flex-1">
          {marquee ? (
            <div className="relative overflow-hidden">
              <div className="marquee-track">
                <span className="marquee-item text-[12px] font-medium leading-4">
                  {message}
                </span>
                <span className="marquee-item text-[12px] font-medium leading-4" aria-hidden="true">
                  {message}
                </span>
              </div>
            </div>
          ) : (
            <p className="truncate text-[12px] font-medium leading-4">
              {message}
            </p>
          )}
        </div>

        {/* Action */}
        {action && (
          <div className="shrink-0">
            {action.href ? (
              <a
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-0.5 rounded-md px-2 py-1 text-[11px] font-bold transition ${cfg.actionColor}`}
              >
                {action.label}
                <ArrowRight size={11} />
              </a>
            ) : (
              <button
                onClick={action.onClick}
                className={`inline-flex items-center gap-0.5 rounded-md px-2 py-1 text-[11px] font-bold transition ${cfg.actionColor}`}
              >
                {action.label}
                <ArrowRight size={11} />
              </button>
            )}
          </div>
        )}

        {/* Dismiss — nhỏ hơn */}
        {dismissible && (
          <button
            onClick={handleDismiss}
            aria-label="Đóng thông báo"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition hover:bg-black/5"
          >
            <X size={13} strokeWidth={2.6} />
          </button>
        )}
      </div>

      {/* CSS marquee — chạy liên tục, không giật */}
      {marquee && (
        <style>{`
          @keyframes marqueeScroll {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          .marquee-track {
            display: inline-flex;
            white-space: nowrap;
            animation: marqueeScroll 15s linear infinite;
          }
          .marquee-item {
            display: inline-block;
            padding-right: 60px;
          }
          .marquee-track:hover {
            animation-play-state: paused;
          }
        `}</style>
      )}
    </div>
  );
        }
