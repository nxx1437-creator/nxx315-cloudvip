import React, { useState } from "react";
import { Coins, Flame, ExternalLink, Search, History } from "lucide-react";
import { useI18n } from "../../i18n/index.js";
import {
  getProviderLogo,
  getDisplayName,
  getHistoryStatus,
  formatDateTime,
  DONE_STATUSES,
} from "../../lib/taskHelpers.js";

// ---------- Logo nhà cung cấp ----------
export function ProviderLogo({ task }) {
  const [error, setError] = useState(false);
  const src = getProviderLogo(task);
  const initials = String(task?.provider || "?").slice(0, 2).toUpperCase();

  if (error || !src) {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
        {initials}
      </div>
    );
  }
  return (
    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-white">
      <img
        src={src}
        alt={task.provider}
        loading="lazy"
        decoding="async"
        onError={() => setError(true)}
        className="h-full w-full object-contain p-1"
      />
    </div>
  );
}

// ---------- Ô thống kê nhỏ (4 ô / 1 hàng) ----------
export function StatPill({ value, label, icon: Icon, bg, valueColor, iconColor }) {
  return (
    <div className={`rounded-xl px-1.5 py-2.5 text-center ${bg}`}>
      <Icon size={14} className={`mx-auto ${iconColor}`} />
      <p className={`mt-1 text-lg font-bold leading-none ${valueColor}`}>
        {value}
      </p>
      <p className="mt-1 truncate text-[10px] font-medium text-slate-500">
        {label}
      </p>
    </div>
  );
}

// ---------- Thẻ nhiệm vụ ----------
export function TaskCard({
  task,
  boosted,
  isThisStarting,
  isBlocked,
  busy,
  onStart,
}) {
  const { t } = useI18n();
  const { finalReward, bonusAmount, bonusPct } = boosted;
  const isDone = task.remainingToday <= 0;
  const progressPct = Math.min(
    100,
    Math.round((task.completedToday / task.daily_limit) * 100)
  );

  return (
    <div
      className={`rounded-2xl border border-slate-100 bg-white p-4 shadow-sm ${
        isDone ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <ProviderLogo task={task} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold text-slate-900">
            {getDisplayName(task)}
          </p>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="flex items-center gap-1 text-sm font-bold text-amber-500">
              <Coins size={13} /> {finalReward}
              <span className="text-xs font-normal text-slate-400">
                {t("tk.perPlay")}
              </span>
            </span>
            {bonusAmount > 0 && (
              <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                +{bonusPct}%
              </span>
            )}
          </div>
        </div>
        {task.is_hot && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-500">
            <Flame size={12} /> HOT
          </span>
        )}
      </div>

      {task.provider === "TASKDAILY" && (
        <p className="mt-2 text-center text-[11px] font-medium text-amber-600">
          {t("tk.taskdailyNote")}
        </p>
      )}

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            {t("tk.today")}: {task.completedToday}/{task.daily_limit}
          </span>
          <span className="font-semibold text-emerald-600">
            {t("tk.left", { n: task.remainingToday })}
          </span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <button
        onClick={() => onStart(task)}
        disabled={isDone || isThisStarting || isBlocked || busy}
        className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-sky-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ExternalLink size={15} />
        {isThisStarting
          ? t("tk.opening")
          : isBlocked
          ? t("tk.cardBlocked")
          : isDone
          ? t("tk.doneToday")
          : t("tk.start")}
      </button>
    </div>
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-slate-100" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
      <div className="mt-4 h-1.5 w-full animate-pulse rounded-full bg-slate-100" />
      <div className="mt-4 h-11 w-full animate-pulse rounded-full bg-slate-100" />
    </div>
  );
}

// ---------- Trạng thái trống ----------
export function EmptyState({ icon: Icon = Search, title, sub }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center">
      <Icon size={30} className="mx-auto mb-2 text-slate-300" />
      <p className="text-sm font-bold text-slate-600">{title}</p>
      <p className="mt-1 text-xs text-slate-400">{sub}</p>
    </div>
  );
}

// ---------- Lịch sử ----------
export function HistorySkeleton() {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0"
        >
          <div className="space-y-2">
            <div className="h-3.5 w-24 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="h-4 w-12 animate-pulse rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export function HistoryList({ history }) {
  const { t, lang } = useI18n();

  const isCompleted = (log) =>
    DONE_STATUSES.includes(String(log.status || "").toLowerCase());

  const totalEarned = history.reduce(
    (sum, log) => sum + (isCompleted(log) ? Number(log.reward_coins) || 0 : 0),
    0
  );

  if (history.length === 0) {
    return (
      <EmptyState
        icon={History}
        title={t("tk.histEmpty")}
        sub={t("tk.histEmptySub")}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-1.5 border-b border-slate-100 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-700">
        <Coins size={14} /> {t("tk.histTotal", { n: totalEarned })}
      </div>

      <div className="divide-y divide-slate-100">
        {history.map((log) => {
          const status = getHistoryStatus(log.status);
          const done = isCompleted(log);
          return (
            <div
              key={log.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {log.provider || "—"}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${status.cls}`}
                  >
                    {status.key ? t(status.key) : status.raw}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formatDateTime(log.created_at, lang)}
                  </span>
                </div>
              </div>
              <span
                className={`flex shrink-0 items-center gap-1 text-sm font-bold ${
                  done && log.reward_coins ? "text-emerald-600" : "text-slate-300"
                }`}
              >
                {done && log.reward_coins ? (
                  <>
                    +{log.reward_coins} <Coins size={13} />
                  </>
                ) : (
                  "—"
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
            }
