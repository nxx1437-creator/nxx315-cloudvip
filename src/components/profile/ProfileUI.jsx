// src/components/profile/ProfileUI.jsx — thành phần UI dùng chung của trang hồ sơ
import React from "react";
import { ChevronRight } from "lucide-react";

export function SettingsGroup({ title, children, danger }) {
  return (
    <div>
      <p
        className={`mb-2 px-1 text-[11px] font-bold uppercase tracking-wider ${
          danger ? "text-rose-500" : "text-slate-500"
        }`}
      >
        {title}
      </p>
      <div
        className={`overflow-hidden rounded-xl border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-slate-900 ${
          danger
            ? "border-rose-200 dark:border-rose-500/30"
            : "border-slate-200 dark:border-slate-800"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export function SettingsRow({
  icon: Icon,
  label,
  sub,
  onClick,
  active,
  danger,
  last,
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between px-4 py-3.5 text-left transition ${
        !last ? "border-b border-slate-100 dark:border-slate-800" : ""
      } ${
        active
          ? "bg-slate-50 dark:bg-slate-800/50"
          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            danger
              ? "bg-rose-50 text-rose-500 dark:bg-rose-500/10"
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          <Icon size={16} />
        </span>
        <div className="min-w-0">
          <p
            className={`truncate text-sm font-semibold ${
              danger
                ? "text-rose-600 dark:text-rose-400"
                : "text-slate-800 dark:text-slate-100"
            }`}
          >
            {label}
          </p>
          {sub && (
            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
              {sub}
            </p>
          )}
        </div>
      </div>
      <ChevronRight size={16} className="shrink-0 text-slate-400" />
    </button>
  );
}

export function NotifToggle({ label, sub, checked, onChange, last }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {label}
        </p>
        {sub && (
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {sub}
          </p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-accent-500" : "bg-slate-200 dark:bg-slate-700"
        }`}
        aria-checked={checked}
        role="switch"
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export function TileButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={!!active}
      className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3.5 text-left transition active:scale-[0.98] ${
        active
          ? "border-accent-500 bg-accent-500/5"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
      }`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-500/10 text-accent-600">
        <Icon size={19} />
      </span>
      <span className="text-[15px] font-semibold leading-5 text-slate-800 dark:text-slate-100">
        {label}
      </span>
    </button>
  );
}
