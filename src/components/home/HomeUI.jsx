import React from "react";
import { Check } from "lucide-react";

export function Card({
  title,
  right,
  className = "",
  bodyClass = "p-4",
  children,
}) {
  return (
    <section
      className={`overflow-hidden rounded-lg border border-slate-200 bg-white ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-2.5">
          <h2 className="text-[13px] font-medium text-slate-900">{title}</h2>
          {right}
        </div>
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  );
}

const TAG_TONES = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  slate: "border-slate-200 bg-slate-50 text-slate-600",
};

export function Tag({ tone = "slate", children }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium ${TAG_TONES[tone]}`}
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
      className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white px-1 py-3 transition hover:border-emerald-500 active:bg-slate-50"
    >
      <Icon size={18} strokeWidth={1.75} className="text-slate-500" />
      <span className="text-center text-[11.5px] font-medium leading-tight text-slate-800">
        {label}
      </span>
    </button>
  );
}

export function StatRow({ items }) {
  return (
    <div className="grid grid-cols-3 divide-x divide-slate-200">
      {items.map(({ icon: Icon, value, label }) => (
        <div key={label} className="min-w-0 px-3 py-3 first:pl-4 last:pr-4">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Icon size={13} strokeWidth={1.75} />
            <span className="truncate text-[11px]">{label}</span>
          </div>
          <p className="mt-1.5 truncate text-lg font-semibold tabular-nums text-slate-900">
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}

export function ProgressBar({ pct }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-[#3ECF8E] transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
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
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
          claimed || reached
            ? "border-emerald-500 bg-emerald-50 text-emerald-600"
            : "border-slate-300 text-slate-300"
        }`}
      >
        <Check size={13} strokeWidth={2.5} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-slate-900">
          {milestone} {en ? "tasks" : "nhiệm vụ"}
        </p>
        <p className="text-[11px] tabular-nums text-slate-500">
          {Math.min(tasksDone, milestone)}/{milestone}
        </p>
      </div>
      <span className="text-[13px] font-semibold tabular-nums text-amber-600">
        +{reward}
      </span>
      {claimed ? (
        <span className="w-16 text-right text-[11px] text-slate-400">
          {en ? "Claimed" : "Đã nhận"}
        </span>
      ) : (
        <button
          type="button"
          disabled={!reached || claiming}
          onClick={() => onClaim(milestone)}
          className="w-16 rounded-md border border-emerald-600 bg-[#3ECF8E] py-1.5 text-xs font-medium text-slate-900 transition active:scale-95 disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
        >
          {claiming ? "…" : en ? "Claim" : "Nhận"}
        </button>
      )}
    </div>
  );
}
