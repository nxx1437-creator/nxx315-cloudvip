import React from "react";
import { Coins, Check } from "lucide-react";
import { useI18n } from "../i18n/index.js";

export function StatCard({ icon: Icon, iconBg, iconColor, value, label }) {
  return (
    <div className="border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <span className="text-2xl font-black leading-none text-slate-950">
          {value}
        </span>
        <span
          className={`flex h-9 w-9 items-center justify-center ${iconBg}`}
        >
          <Icon size={16} className={iconColor} />
        </span>
      </div>
      <p className="mt-2 font-mono text-[10px] uppercase leading-4 tracking-wider text-slate-500">
        {label}
      </p>
    </div>
  );
}

export function QuickAction({ icon: Icon, iconBg, iconColor, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex h-[92px] flex-col items-center justify-center gap-2 border border-slate-200 bg-white px-1 shadow-sm transition hover:border-emerald-500/60 active:scale-[0.97]"
    >
      <span
        className={`flex h-10 w-10 items-center justify-center ${iconBg}`}
      >
        <Icon size={18} className={iconColor} />
      </span>
      <span className="w-full truncate text-center font-mono text-[10px] font-bold uppercase tracking-wider text-slate-600">
        {label}
      </span>
    </button>
  );
}

export function MilestoneCard({
  milestone,
  reward,
  tasksDone,
  claimed,
  onClaim,
  claiming,
}) {
  const { t } = useI18n();
  const reached = tasksDone >= milestone;
  const progressPct = Math.min(100, Math.round((tasksDone / milestone) * 100));

  return (
    <button
      onClick={() => reached && !claimed && onClaim(milestone)}
      disabled={!reached || claimed || claiming}
      className={`flex flex-col items-center gap-1.5 border p-3 text-center transition ${
        claimed
          ? "border-emerald-300 bg-emerald-50"
          : reached
          ? "border-amber-300 bg-amber-50 shadow-sm"
          : "border-slate-200 bg-white"
      }`}
    >
      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-700">
        {t("dash.msShort", { n: milestone })}
      </span>
      <span
        className={`flex items-center gap-1 text-sm font-black ${
          claimed ? "text-emerald-600" : "text-amber-600"
        }`}
      >
        {claimed ? <Check size={13} /> : <Coins size={13} />}+{reward}
      </span>
      <div className="mt-0.5 h-1.5 w-full bg-slate-200">
        <div
          className={`h-full ${claimed ? "bg-emerald-500" : "bg-amber-400"}`}
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </button>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="border border-slate-200 bg-white p-5">
        <div className="h-4 w-32 skeleton-shimmer" />
        <div className="mt-3 h-7 w-44 skeleton-shimmer" />
        <div className="mt-2 h-4 w-56 skeleton-shimmer" />
        <div className="mt-4 h-28 w-full skeleton-shimmer" />
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <div className="h-11 skeleton-shimmer" />
          <div className="h-11 skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}
