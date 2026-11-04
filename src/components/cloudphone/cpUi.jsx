import React from "react";
import { Check } from "lucide-react";

export const GRAD = "from-emerald-500 to-emerald-400";

export const CARD =
  "rounded-[1.75rem] border border-emerald-100 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05),0_2px_8px_-2px_rgba(15,23,42,0.07)]";

export function RoundBtn({ onClick, children, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-emerald-100 bg-white text-slate-700 shadow-sm transition active:scale-95"
    >
      {children}
    </button>
  );
}

// Tiêu đề mục dạng nhãn mono, giống các thẻ ở trang chủ
export function Section({ icon: Icon, title, children }) {
  return (
    <div>
      <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700">
        <Icon size={13} />
        {title}
      </p>
      {children}
    </div>
  );
}

// Ô lựa chọn đang được chọn (máy chủ, hệ điều hành)
export function Chip({ text }) {
  return (
    <div className="relative flex h-14 items-center justify-center rounded-2xl border-2 border-emerald-500 bg-emerald-50 px-3 text-base font-bold text-emerald-800">
      {text}
      <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-tl-lg rounded-br-xl bg-emerald-500 text-white">
        <Check size={13} strokeWidth={3} />
      </span>
    </div>
  );
}
