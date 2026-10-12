import React from "react";
import { Check, ChevronRight } from "lucide-react";

export function Panel({
  title,
  right,
  className = "",
  bodyClass = "p-4",
  children,
}) {
  return (
    <section
      className={`overflow-hidden rounded-lg border border-[#2E2E2E] bg-[#1F1F1F] ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-[#2E2E2E] px-4 py-2.5">
          <h2 className="text-[13px] font-medium text-[#EDEDED]">{title}</h2>
          {right}
        </div>
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  );
}

const TAG = {
  green: "border-[#3ECF8E]/30 bg-[#3ECF8E]/10 text-[#3ECF8E]",
  amber: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  slate: "border-[#3A3A3A] bg-[#262626] text-[#A0A0A0]",
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
      className="flex flex-col items-center gap-2 rounded-lg border border-[#2E2E2E] bg-[#1F1F1F] px-1 py-3 transition hover:border-[#3ECF8E]/50 active:bg-[#262626]"
    >
      <Icon size={18} strokeWidth={1.75} className="text-[#A0A0A0]" />
      <span className="text-center text-[11.5px] font-medium leading-tight text-[#EDEDED]">
        {label}
      </span>
    </button>
  );
}

export function Stat({ value, label }) {
  return (
    <div className="min-w-0 pl-4 first:pl-0">
      <p className="truncate text-lg font-medium tabular-nums text-white">
        {value}
      </p>
      <p className="truncate text-xs text-[#898989]">{label}</p>
    </div>
  );
}

export function ProgressBar({ pct }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#2E2E2E]">
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
      className="flex w-full items-center gap-3 px-4 py-3 text-left transition active:bg-[#262626]"
    >
      <Icon size={18} strokeWidth={1.75} className="text-[#898989]" />
      <span className="flex-1 text-[13px] font-medium text-[#EDEDED]">
        {title}
      </span>
      <span className="text-[13px] tabular-nums text-[#898989]">{value}</span>
      <ChevronRight size={15} className="text-[#5A5A5A]" />
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
    <div className="flex items-center gap-3 px-4 py-3">
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
          claimed || reached
            ? "border-[#3ECF8E] bg-[#3ECF8E] text-[#0B1F17]"
            : "border-[#3A3A3A] text-transparent"
        }`}
      >
        <Check size={12} strokeWidth={3} />
      </span>
      <span className="flex-1 text-[13px] text-[#EDEDED]">
        {milestone} {en ? "tasks" : "nhiệm vụ"}
      </span>
      <span className="text-[13px] font-medium tabular-nums text-amber-300">
        +{reward}
      </span>
      <div className="flex w-16 justify-end">
        {claimed ? (
          <span className="text-xs text-[#6B6B6B]">
            {en ? "Claimed" : "Đã nhận"}
          </span>
        ) : reached ? (
          <button
            type="button"
            disabled={claiming}
            onClick={() => onClaim(milestone)}
            className="h-7 rounded-md border border-[#3ECF8E]/50 bg-[#006239] px-3 text-xs font-medium text-white transition active:scale-95 disabled:opacity-60"
          >
            {claiming ? "…" : en ? "Claim" : "Nhận"}
          </button>
        ) : (
          <span className="text-xs tabular-nums text-[#6B6B6B]">
            {Math.min(tasksDone, milestone)}/{milestone}
          </span>
        )}
      </div>
    </div>
  );
}
