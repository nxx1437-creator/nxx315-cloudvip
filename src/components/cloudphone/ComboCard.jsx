import React from "react";
import { Check, Coins } from "lucide-react";
import { fmt, hoursLabel } from "./cpUtils.js";

// Thẻ chọn thời hạn thuê. p có thêm original / discountPct (xem withDiscount)
export default function ComboCard({ p, on, onSelect, hot }) {
  const hasDiscount = p.discountPct > 0;
  return (
    <button
      onClick={onSelect}
      className={`relative min-h-[132px] rounded-2xl border-2 p-4 text-left transition active:scale-[0.98] ${
        on ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white"
      }`}
    >
      {hot && (
        <span className="absolute -top-2.5 right-3 rounded-md bg-amber-500 px-2 py-0.5 text-[11px] font-black text-white">
          HOT
        </span>
      )}
      <p className="font-mono text-[11.5px] font-bold uppercase tracking-wider text-slate-400">
        {hoursLabel(p.duration_hours)}
      </p>
      <p className="mt-2 flex items-center gap-1.5 text-[22px] font-black leading-none text-slate-900">
        <Coins size={18} className="text-amber-500" />
        {fmt(p.price_coins)}
      </p>
      {hasDiscount ? (
        <>
          <p className="mt-2 text-[12.5px] font-bold text-emerald-700">
            Tiết kiệm {p.discountPct}%
          </p>
          <p className="text-[11.5px] text-slate-400 line-through">{fmt(p.original)}</p>
        </>
      ) : (
        <p className="mt-2 text-[12.5px] text-slate-400">Giá gốc</p>
      )}
      {on && (
        <span className="absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white">
          <Check size={15} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

