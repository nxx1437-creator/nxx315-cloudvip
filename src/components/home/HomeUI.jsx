import React from "react";
import { Check } from "lucide-react";

const TONES = {
  emerald: "bg-emerald-50 text-emerald-600",
  teal: "bg-teal-50 text-teal-600",
  amber: "bg-amber-50 text-amber-600",
  orange: "bg-orange-50 text-orange-500",
  sky: "bg-sky-50 text-sky-600",
};

export function Card({ className = "", children }) {
  return (
    <section
      className={`rounded-3xl bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)] ring-1 ring-slate-100 ${className}`}
    >
      {children}
    </section>
  );
}

export function CardHeader({ title, right }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="font-['Baloo_2',sans-serif] text-[17px] font-bold text-slate-900">
        {title}
      </h2>
      {right}
    </div>
  );
}

export function LevelPill({ children }) {
  return (
    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
      {children}
    </span>
  );
}

export function Shortcut({ icon: Icon, label, tone = "emerald", onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-2xl bg-white px-1 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.05)] ring-1 ring-slate-100 transition active:scale-95"
    >
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${TONES[tone]}`}
      >
        <Icon size={21} />
      </span>
      <span className="text-center text-[11.5px] font-semibold leading-tight text-slate-700">
        {label}
      </span>
    </button>
  );
}

export function MiniStat({ icon: Icon, tone = "emerald", value, label }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-3">
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-xl ${TONES[tone]}`}
      >
        <Icon size={16} />
      </span>
      <p className="mt-2 truncate font-['Baloo_2',sans-serif] text-lg font-bold leading-none text-slate-900">
        {value}
      </p>
      <p className="mt-1 truncate text-[11px] text-slate-500">{label}</p>
    </div>
  );
}

export function ProgressBar({ pct }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function MilestoneChip({
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
  const bg = claimed
    ? "bg-slate-50"
    : reached
    ? "bg-emerald-50 ring-1 ring-emerald-200"
    : "bg-slate-50";

  return (
    <div
      className={`flex flex-col items-center rounded-2xl px-2 py-3 text-center ${bg}`}
    >
      <p className="text-[11px] text-slate-500">
        {milestone} {en ? "tasks" : "nhiệm vụ"}
      </p>
      <p className="mt-1 font-['Baloo_2',sans-serif] text-lg font-bold text-amber-600">
        +{reward}
      </p>
      {claimed ? (
        <span className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-slate-400">
          <Check size={12} /> {en ? "Claimed" : "Đã nhận"}
        </span>
      ) : reached ? (
        <button
          type="button"
          disabled={claiming}
          onClick={() => onClaim(milestone)}
          className="mt-2 w-full rounded-xl bg-emerald-600 py-1.5 text-xs font-bold text-white transition active:scale-95 disabled:opacity-60"
        >
          {claiming ? "…" : en ? "Claim" : "Nhận"}
        </button>
      ) : (
        <span className="mt-2 text-[11px] font-medium text-slate-400">
          {Math.min(tasksDone, milestone)}/{milestone}
        </span>
      )}
    </div>
  );
    }
