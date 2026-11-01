import React from "react";
import { CARD } from "./cpUi.jsx";
import { SPEC, fmt } from "./cpUtils.js";

// Dải 3 ô đầu trang thuê: số dư, máy chủ, máy của tôi
export default function SummaryStrip({ coins, region, count, onEarn, onMine }) {
  const label = "text-[12px] font-semibold text-slate-400";
  const link = "mt-0.5 text-[11.5px] font-bold text-emerald-700";
  return (
    <div className={`grid grid-cols-3 divide-x divide-emerald-100 ${CARD}`}>
      <button type="button" onClick={onEarn} className="p-3.5 text-left">
        <p className={label}>Số dư</p>
        <p className="mt-1 text-[18px] font-black tabular-nums leading-tight text-slate-900">
          {fmt(coins)}
        </p>
        <p className={link}>Kiếm Coin ›</p>
      </button>
      <div className="p-3.5">
        <p className={label}>Máy chủ</p>
        <p className="mt-1 text-[18px] font-black leading-tight text-slate-900">{region}</p>
        <p className="mt-0.5 text-[11.5px] text-slate-400">Android {SPEC.android}</p>
      </div>
      <button type="button" onClick={onMine} className="p-3.5 text-left">
        <p className={label}>Máy của tôi</p>
        <p className="mt-1 text-[18px] font-black leading-tight text-slate-900">
          {count} máy
        </p>
        <p className={link}>Xem ›</p>
      </button>
    </div>
  );
}
