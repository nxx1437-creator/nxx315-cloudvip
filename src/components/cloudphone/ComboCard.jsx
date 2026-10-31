import React from "react";
import { Coins } from "lucide-react";
import { GRAD } from "./cpUi.jsx";
import { fmt, hoursLabel } from "./cpUtils.js";

// Thẻ chọn thời hạn thuê. p có thêm original / discountPct (xem withDiscount)
export default function ComboCard({ p, on, onSelect }) {
  const hasDiscount = p.discountPct > 0;
  return (
    <button
      onClick={onSelect}
      className={`relative overflow-hidden rounded-2xl bg-white text-center transition active:scale-[0.98] ${
        on ? "ring-2 ring-emerald-500" : "ring-1 ring-slate-200"
      }`}
    >
      {hasDiscount && (
        <span className="absolute right-0 top-0 z-10 rounded-bl-xl bg-rose-500 px-2 py-1 font-mono text-[11px] font-bold text-white">
          {p.discountPct}% OFF
        </span>
      )}
      <div
        className={`flex h-24 items-center justify-center text-2xl font-black ${
          on ? "bg-emerald-50 text-emerald-700" : "bg-white text-slate-900"
        }`}
      >
        {hoursLabel(p.duration_hours)}
      </div>
      <div
        className={`flex h-14 flex-col items-center justify-center text-lg font-black ${
          on
            ? `bg-gradient-to-r ${GRAD} text-white`
            : "bg-slate-100 text-amber-600"
        }`}
      >
        <span className="flex items-center gap-1.5 leading-none">
          <Coins size={17} />
          {fmt(p.price_coins)}
        </span>
        {hasDiscount && (
          <span
            className={`mt-1 text-[11px] font-semibold leading-none line-through ${
              on ? "text-white/70" : "text-slate-400"
            }`}
          >
            {fmt(p.original)}
          </span>
        )}
      </div>
    </button>
  );
}
