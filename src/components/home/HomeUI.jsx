import React, { useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import "./hover.css";

// Cập nhật --x/--y cho đốm sáng (chỉ theo chuột)
function trackPointer(e) {
  if (e.pointerType !== "mouse") return;
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
}

/* Ảnh đại diện tròn; không có ảnh hoặc ảnh lỗi thì hiện chữ cái đầu */
export function Avatar({ src, name = "", size = 48, className = "" }) {
  const [bad, setBad] = useState(false);
  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";
  const box = { width: size, height: size };
  if (src && !bad) {
    return (
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setBad(true)}
        style={box}
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }
  return (
    <span
      style={{ ...box, fontSize: Math.round(size * 0.42) }}
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 font-extrabold text-white ${className}`}
    >
      {initial}
    </span>
  );
}

export function Panel({
  title,
  right,
  className = "",
  bodyClass = "p-4",
  lift = true,
  dark = false,
  children,
}) {
  const tone = dark
    ? "border-[#2E2E2E] bg-[#1F1F1F]"
    : "border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]";
  return (
    <section
      onPointerMove={dark ? trackPointer : undefined}
      className={`overflow-hidden rounded-xl border ${tone} ${
        lift ? "hv-card" : ""
      } ${dark ? "hv-spot" : ""} ${className}`}
    >
      {title && (
        <div
          className={`flex items-center justify-between gap-3 border-b px-4 py-3 ${
            dark ? "border-[#2E2E2E]" : "border-slate-100"
          }`}
        >
          <h2
            className={`flex items-center gap-2 text-[13.5px] font-bold ${
              dark ? "text-[#EDEDED]" : "text-slate-900"
            }`}
          >
            <span className="h-3.5 w-1 rounded-full bg-emerald-500" />
            {title}
          </h2>
          {right}
        </div>
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  );
}

const TAG = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  slate: "border-slate-200 bg-slate-50 text-slate-600",
};

export function Tag({ tone = "slate", children }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${TAG[tone]}`}
    >
      {children}
    </span>
  );
}

export function Shortcut({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hv-card hv-btn-ghost flex flex-col items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-1 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition active:scale-[0.97]"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
        <Icon size={19} strokeWidth={2} />
      </span>
      <span className="text-center text-[11.5px] font-semibold leading-tight text-slate-800">
        {label}
      </span>
    </button>
  );
}

export function Stat({ value, label }) {
  return (
    <div className="min-w-0 pl-4 first:pl-0">
      <p className="truncate text-lg font-extrabold tabular-nums text-slate-900">
        {value}
      </p>
      <p className="truncate text-xs text-slate-500">{label}</p>
    </div>
  );
}

export function ProgressBar({ pct }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function LinkRow({ icon: Icon, title, value, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hv-row flex w-full items-center gap-3 px-4 py-3 text-left active:bg-slate-50"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
        <Icon size={17} strokeWidth={2} />
      </span>
      <span className="flex-1 text-[13.5px] font-semibold text-slate-900">
        {title}
      </span>
      <span className="text-[13px] tabular-nums text-slate-500">{value}</span>
      <ChevronRight size={15} className="text-slate-300" />
    </button>
  );
}

export function MilestoneRow({
  milestone,
  reward,
  tasksDone,
  claimed,
  claiming,
  onClaim,
  lang,
}) {
  const en = lang === "en";
  const reached = tasksDone >= milestone;

  return (
    <div className="hv-row flex items-center gap-3 px-4 py-3">
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
          claimed || reached
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-slate-300 text-transparent"
        }`}
      >
        <Check size={13} strokeWidth={3} />
      </span>
      <span className="flex-1 text-[13.5px] font-medium text-slate-900">
        {milestone} {en ? "tasks" : "nhiệm vụ"}
      </span>
      <span className="text-[13px] font-bold tabular-nums text-amber-600">
        +{reward}
      </span>
      <div className="flex w-16 justify-end">
        {claimed ? (
          <span className="text-xs text-slate-400">
            {en ? "Claimed" : "Đã nhận"}
          </span>
        ) : reached ? (
          <button
            type="button"
            disabled={claiming}
            onClick={() => onClaim(milestone)}
            className="hv-btn hv-btn-brand h-7 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white active:scale-95 disabled:opacity-60"
          >
            {claiming ? "…" : en ? "Claim" : "Nhận"}
          </button>
        ) : (
          <span className="text-xs tabular-nums text-slate-400">
            {Math.min(tasksDone, milestone)}/{milestone}
          </span>
        )}
      </div>
    </div>
  );
    }

