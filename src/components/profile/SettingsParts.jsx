// src/components/profile/SettingsParts.jsx — khối UI cho trang Cài đặt tài khoản (kiểu MoMo)
import React from "react";
import { ChevronRight } from "lucide-react";

export function Group({ id, title, children }) {
  return (
    <section id={id ? `grp-${id}` : undefined} className="scroll-mt-24">
      <h2 className="px-1 pb-2 pt-6 text-[17px] font-semibold text-slate-900 dark:text-white">
        {title}
      </h2>
      <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white dark:divide-slate-800 dark:bg-slate-900">
        {children}
      </div>
    </section>
  );
}

// right: undefined + có onClick => hiện mũi tên; truyền node để thay thế
export function Row({ icon: Icon, title, sub, right, onClick, danger, disabled, children }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      disabled={onClick ? disabled : undefined}
      className={`flex w-full items-center gap-3.5 px-4 py-4 text-left ${
        onClick ? "transition active:bg-slate-50 dark:active:bg-slate-800/50" : ""
      } ${disabled ? "opacity-60" : ""}`}
    >
      {Icon && (
        <Icon
          size={24}
          strokeWidth={1.7}
          className={`shrink-0 ${danger ? "text-rose-500" : "text-slate-800 dark:text-slate-200"}`}
        />
      )}
      <span className="min-w-0 flex-1">
        <span
          className={`block text-[16px] font-semibold leading-5 ${
            danger ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"
          }`}
        >
          {title}
        </span>
        {sub && (
          <span className="mt-0.5 block text-[14px] leading-5 text-slate-500 dark:text-slate-400">
            {sub}
          </span>
        )}
        {children}
      </span>
      {right === undefined ? (
        onClick ? <ChevronRight size={20} className="shrink-0 text-slate-400" /> : null
      ) : (
        right
      )}
    </Tag>
  );
}

export function Switch({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-[52px] shrink-0 rounded-full transition disabled:opacity-50 ${
        checked ? "bg-accent-500" : "bg-slate-300 dark:bg-slate-700"
      }`}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${
          checked ? "left-[24px]" : "left-1"
        }`}
      />
    </button>
  );
}

export function Badge({ on, onText, offText }) {
  return (
    <span
      className={`shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-semibold ${
        on
          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
      }`}
    >
      {on ? onText : offText}
    </span>
  );
}

export function PillButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-xl border border-accent-500 px-4 py-2 text-[14px] font-semibold text-accent-600 transition active:scale-95"
    >
      {children}
    </button>
  );
}
