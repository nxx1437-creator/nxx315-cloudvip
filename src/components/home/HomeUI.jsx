
import React from "react";
import { Check, ChevronRight } from "lucide-react";
import "./hover.css";

// Cập nhật --x/--y cho đốm sáng (chỉ theo chuột)
function trackPointer(e) {
  if (e.pointerType !== "mouse") return;
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
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
    : "border-[#E6E6E6] bg-white";
  return (
    <section
      onPointerMove={dark ? trackPointer : undefined}
      className={`overflow-hidden rounded-lg border ${tone} ${
        lift ? "hv-card" : ""
      } ${dark ? "hv-spot" : ""} ${className}`}
    >
      {title && (
        <div
          className={`flex items-center justify-between gap-3 border-b px-4 py-2.5 ${
            dark ? "border-[#2E2E2E]" : "border-[#E6E6E6]"
          }`}
        >
          <h2
            className={`text-[13px] font-medium ${
              dark ? "text-[#EDEDED]" : "text-[#171717]"
            }`}
          >
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
  green: "border-[#BDEBD5] bg-[#E8F8F0] text-[#0F7A4D]",
  amber: "border-[#F3DFA0] bg-[#FFF7E0] text-[#8A5A00]",
  slate: "border-[#E6E6E6] bg-[#F4F4F4] text-[#6F6F6F]",
};

export function Tag({ tone = "slate", children }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium ${TAG[tone]}`}
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
      className="hv-card hv-btn-ghost flex flex-col items-center gap-2 rounded-lg border border-[#E6E6E6] bg-white px-1 py-3 active:bg-[#F4F4F4]"
    >
      <Icon size={18} strokeWidth={1.75} className="text-[#6F6F6F]" />
      <span className="text-center text-[11.5px] font-medium leading-tight text-[#171717]">
        {label}
      </span>
    </button>
  );
}

export function Stat({ value, label }) {
  return (
    <div className="min-w-0 pl-4 first:pl-0">
      <p className="truncate text-lg font-medium tabular-nums text-[#171717]">
        {value}
      </p>
      <p className="truncate text-xs text-[#6F6F6F]">{label}</p>
    </div>
  );
}

export function ProgressBar({ pct }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#EDEDED]">
      <div
        className="h-full rounded-full bg-[#3ECF8E] transition-all duration-500"
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
      className="hv-row flex w-full items-center gap-3 px-4 py-3 text-left active:bg-[#F4F4F4]"
    >
      <Icon size={18} strokeWidth={1.75} className="text-[#9A9A9A]" />
      <span className="flex-1 text-[13px] font-medium text-[#171717]">
        {title}
      </span>
      <span className="text-[13px] tabular-nums text-[#6F6F6F]">{value}</span>
      <ChevronRight size={15} className="text-[#C4C4C4]" />
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
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
          claimed || reached
            ? "border-[#24B47E] bg-[#3ECF8E] text-[#0B1F17]"
            : "border-[#D4D4D4] text-transparent"
        }`}
      >
        <Check size={12} strokeWidth={3} />
      </span>
      <span className="flex-1 text-[13px] text-[#171717]">
        {milestone} {en ? "tasks" : "nhiệm vụ"}
      </span>
      <span className="text-[13px] font-medium tabular-nums text-amber-600">
        +{reward}
      </span>
      <div className="flex w-16 justify-end">
        {claimed ? (
          <span className="text-xs text-[#9A9A9A]">
            {en ? "Claimed" : "Đã nhận"}
          </span>
        ) : reached ? (
          <button
            type="button"
            disabled={claiming}
            onClick={() => onClaim(milestone)}
            className="hv-btn hv-btn-brand h-7 rounded-md border border-[#24B47E] bg-[#3ECF8E] px-3 text-xs font-medium text-[#0B1F17] active:scale-95 disabled:opacity-60"
          >
            {claiming ? "…" : en ? "Claim" : "Nhận"}
          </button>
        ) : (
          <span className="text-xs tabular-nums text-[#9A9A9A]">
            {Math.min(tasksDone, milestone)}/{milestone}
          </span>
        )}
      </div>
    </div>
  );
  }
