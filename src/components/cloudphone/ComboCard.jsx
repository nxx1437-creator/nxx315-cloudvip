import React from "react";
import { Check, Coins } from "lucide-react";
import { fmt, hoursLabel } from "./cpUtils.js";

// Thẻ chọn thời hạn thuê. p có thêm original / discountPct (xem withDiscount)
export default function ComboCard({ p, on, onSelect, hot }) {
  const hasDiscount = p.discountPct > 0;
  const perHour = p.duration_hours ? Math.round(p.price_coins / p.duration_hours) : 0;
  return (
    <button
      onClick={onSelect}
      className={`relative flex min-h-[140px] flex-col rounded-2xl border-2 p-4 text-left transition active:scale-[0.98] ${
        on
          ? "border-emerald-500 bg-gradient-to-b from-emerald-50 to-white shadow-[0_6px_16px_-8px_rgba(16,185,129,0.45)]"
          : "border-slate-200 bg-white"
      }`}
    >
      {hot && (
        <span className="absolute -top-2.5 right-3 rounded-md bg-amber-500 px-2 py-0.5 text-[11px] font-black text-white">
          HOT
        </span>
      )}
      <div className="flex items-start justify-between">
        <p className="text-[17px] font-black leading-none text-slate-900">
          {hoursLabel(p.duration_hours)}
        </p>
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
            on ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-200 text-transparent"
          }`}
        >
          <Check size={13} strokeWidth={3.5} />
        </span>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-[24px] font-black leading-none tabular-nums text-emerald-700">
        <Coins size={19} className="text-amber-500" />
        {fmt(p.price_coins)}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-3">
        {hasDiscount ? (
          <>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11.5px] font-bold text-emerald-700">
              Tiết kiệm {p.discountPct}%
            </span>
            <span className="text-[11.5px] text-slate-400 line-through">
              {fmt(p.original)}
            </span>
          </>
        ) : (
          <span className="font-mono text-[11px] text-slate-400">≈ {fmt(perHour)} Coin/giờ</span>
        )}
      </div>
    </button>
  );
}


