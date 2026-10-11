import React from "react";
import { Check, ChevronRight } from "lucide-react";

export function Section({ title, right, className = "", children }) {
  return (
    <section
      className={`border-t border-slate-100 px-5 py-5 first:border-t-0 ${className}`}
    >
      {title && (
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-[13px] font-semibold text-slate-500">{title}</h2>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

const TAG = {
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  slate: "bg-slate-100 text-slate-600",
};

export function Tag({ tone = "slate", children }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${TAG[tone]}`}
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
      className="flex flex-col items-center gap-1.5 transition active:opacity-60"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50">
        <Icon size={21} strokeWidth={1.75} className="text-slate-700" />
      </span>
      <span className="text-center text-xs font-medium text-slate-600">
        {label}
      </span>
    </button>
  );
}

export function Stat({ value, label }) {
  return (
    <div className="min-w-0 pl-4 first:pl-0">
      <p className="truncate text-lg font-semibold tabular-nums text-slate-900">
        {value}
      </p>
      <p className="truncate text-xs text-slate-500">{label}</p>
    </div>
  );
}

export function ProgressBar({ pct }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-emerald-600 transition-all duration-500"
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
      className="flex w-full items-center gap-3 py-1 text-left transition active:opacity-60"
    >
      <Icon size={19} strokeWidth={1.75} className="text-slate-400" />
      <span className="flex-1 text-sm font-medium text-slate-900">
        {title}
      </span>
      <span className="text-sm tabular-nums text-slate-500">{value}</span>
      <ChevronRight size={16} className="text-slate-300" />
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
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
          claimed || reached
            ? "border-emerald-600 bg-emerald-600 text-white"
            : "border-slate-300 text-transparent"
        }`}
      >
        <Check size={12} strokeWidth={3} />
      </span>
      <span className="flex-1 text-sm text-slate-900">
        {milestone} {en ? "tasks" : "nhiệm vụ"}
      </span>
      <span className="text-sm font-medium tabular-nums text-slate-900">
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
            className="h-7 rounded-md bg-emerald-600 px-3 text-xs font-medium text-white transition active:scale-95 disabled:opacity-60"
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
