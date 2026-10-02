import React from "react";
import { Coins, Check } from "lucide-react";
import { useI18n } from "../i18n/index.js";

export function StatCard({ icon: Icon, iconBg, iconColor, value, label }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <div className="flex items-start justify-between">
        <span className="text-2xl font-bold text-[#111827]">{value}</span>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full ${iconBg}`}
        >
          <Icon size={16} className={iconColor} />
        </span>
      </div>
      <p className="mt-1 text-xs text-[#667085]">{label}</p>
    </div>
  );
}

export function QuickAction({ icon: Icon, iconBg, iconColor, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-1 py-3 text-center transition hover:border-[#3478F6]/30"
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBg}`}
      >
        <Icon size={18} className={iconColor} />
      </span>
      <span className="w-full truncate text-[11px] font-semibold text-[#374151]">
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
      className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition ${
        claimed
          ? "border-emerald-200 bg-emerald-50"
          : reached
          ? "border-[#F2A900]/40 bg-[#FFF8ED]"
          : "border-[#E5E7EB] bg-white"
      }`}
    >
      <span className="text-xs font-bold text-[#111827]">
        {t("dash.msShort", { n: milestone })}
      </span>
      <span
        className={`flex items-center gap-1 text-sm font-bold ${
          claimed ? "text-emerald-600" : "text-[#B87700]"
        }`}
      >
        {claimed ? <Check size={13} /> : <Coins size={13} />}+{reward}
      </span>
      <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
        <div
          className={`h-full rounded-full ${
            claimed ? "bg-emerald-400" : "bg-[#F2A900]"
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
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <div className="h-5 w-48 rounded-full skeleton-shimmer" />
        <div className="mt-3 h-7 w-40 rounded skeleton-shimmer" />
        <div className="mt-2 h-4 w-56 rounded skeleton-shimmer" />
        <div className="mt-4 flex gap-2.5">
          <div className="h-10 w-40 rounded-xl skeleton-shimmer" />
          <div className="h-10 w-28 rounded-xl skeleton-shimmer" />
        </div>
        <div className="mt-4 rounded-2xl bg-[#F5F7FB] p-4">
          <div className="h-3 w-16 rounded skeleton-shimmer" />
          <div className="mt-2 h-8 w-40 rounded skeleton-shimmer" />
          <div className="mt-3 h-2 w-full rounded-full skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
          }
