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
      className={`group relative overflow-hidden rounded-2xl ${cfg.surface} ${cfg.text}`}
    >
      {/* Viền trái gradient */}
      <div
        className="absolute inset-y-0 left-0 w-1"
        style={{
          background: `linear-gradient(180deg, ${cfg.accent}, ${cfg.accent}dd)`,
        }}
      />

      <div className="flex items-center gap-3.5 py-3.5 pl-5 pr-3.5">
        {/* Icon + chấm nhấp nháy */}
        <div
          className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cfg.iconBg} shadow-sm`}
        >
          <Icon size={17} className={cfg.iconColor} strokeWidth={2.4} />
          <span
            className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white"
            style={{ backgroundColor: cfg.accent }}
          >
            <span
              className="absolute inset-0 animate-ping rounded-full"
              style={{ backgroundColor: cfg.accent }}
            />
          </span>
        </div>

        {/* Message */}
        <div className="min-w-0 flex-1">
          {marquee ? (
            <div className="relative overflow-hidden">
              <div className="marquee-content">
                <span className="marquee-text text-[13.5px] font-semibold leading-5 tracking-tight">
                  {message}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-[13.5px] font-semibold leading-5 tracking-tight">
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
                className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[12px] font-bold transition ${cfg.actionColor}`}
              >
                {action.label}
                <ArrowRight
                  size={12}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </a>
            ) : (
              <button
                onClick={action.onClick}
                className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[12px] font-bold transition ${cfg.actionColor}`}
              >
                {action.label}
                <ArrowRight
                  size={12}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>
            )}
          </div>
        )}

        {/* Dismiss */}
        {dismissible && (
          <button
            onClick={handleDismiss}
            aria-label="Đóng thông báo"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition hover:bg-black/5"
          >
            <X size={14} strokeWidth={2.4} />
          </button>
        )}
      </div>

      {/* CSS marquee — nhanh hơn */}
      {marquee && (
        <style>{`
          @keyframes marqueeScroll {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .marquee-content {
            display: flex;
            white-space: nowrap;
            animation: marqueeScroll 12s linear infinite;
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
