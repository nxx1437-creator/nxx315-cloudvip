import React from "react";
import { Coins, Check } from "lucide-react";
import { useI18n } from "../i18n/index.js";

export function StatCard({ icon: Icon, iconBg, iconColor, value, label }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_4px_20px_-10px_rgba(15,23,42,0.15)]">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBg}`}
      >
        <Icon size={18} className={iconColor} />
      </span>
      <p className="mt-3 text-[22px] font-extrabold leading-none tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-1.5 text-xs font-medium leading-4 text-slate-500">
        {label}
      </p>
    </div>
  );
}

export function QuickAction({ icon: Icon, iconBg, iconColor, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-2 rounded-2xl py-1 transition active:scale-95"
    >
      <span
        className={`flex h-14 w-14 items-center justify-center rounded-2xl transition group-hover:scale-105 ${iconBg}`}
      >
        <Icon size={24} className={iconColor} />
      </span>
      <span className="w-full truncate text-center text-[12px] font-semibold text-slate-700">
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
      className={`flex flex-col items-center gap-2 rounded-2xl border p-3.5 text-center transition active:scale-[0.97] ${
        claimed
          ? "border-emerald-200 bg-emerald-50"
          : reached
          ? "border-amber-300 bg-gradient-to-b from-amber-50 to-white shadow-md shadow-amber-200/40"
          : "border-slate-100 bg-white shadow-[0_4px_20px_-10px_rgba(15,23,42,0.15)]"
      }`}
    >
      <span className="text-xs font-bold text-slate-600">
        {t("dash.msShort", { n: milestone })}
      </span>
      <span
        className={`flex items-center gap-1 text-base font-extrabold ${
          claimed ? "text-emerald-600" : "text-amber-600"
        }`}
      >
        {claimed ? <Check size={15} /> : <Coins size={15} />}+{reward}
      </span>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${
            claimed ? "bg-emerald-500" : "bg-amber-400"
          }`}
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </button>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-[28px] bg-white p-5 shadow-sm">
        <div className="h-4 w-32 rounded-full skeleton-shimmer" />
        <div className="mt-3 h-7 w-44 rounded-full skeleton-shimmer" />
        <div className="mt-4 h-24 w-full rounded-2xl skeleton-shimmer" />
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <div className="h-12 rounded-2xl skeleton-shimmer" />
          <div className="h-12 rounded-2xl skeleton-shimmer" />
        </div>
      </div>
      <div className="h-24 rounded-3xl skeleton-shimmer" />
    </div>
  );
}

