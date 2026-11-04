import React from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { GRAD } from "./cpUi.jsx";
import { fmt } from "./cpUtils.js";

export default function BuyBar({ pkg, soldOut, hasActive, canBuy, busy, onBuy }) {
  return (
    <div className="fixed inset-x-0 bottom-[96px] z-20 bg-gradient-to-t from-[#eefaf7] via-[#eefaf7]/95 to-transparent px-4 pb-2 pt-6">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3 rounded-[1.75rem] border border-emerald-100 bg-white p-3 pl-5 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_2px_8px_-2px_rgba(15,23,42,0.07)]">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-mono text-[10.5px] font-bold uppercase tracking-wider text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Gói đã chọn
          </p>
          <p className="truncate text-[22px] font-black leading-tight text-slate-900">
            {pkg ? `${fmt(pkg.price_coins)} Coin` : "—"}
          </p>
        </div>
        <button
          onClick={onBuy}
          disabled={!canBuy}
          className={`flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-full px-6 text-[15px] font-black transition active:scale-[0.98] ${
            canBuy ? `bg-gradient-to-r ${GRAD} text-white` : "bg-slate-200 text-slate-400"
          }`}
        >
          {busy ? (
            <Loader2 size={18} className="animate-spin" />
          ) : soldOut ? (
            "Chờ hàng về"
          ) : hasActive ? (
            "Đang có máy"
          ) : (
            <>
              Thuê ngay <ArrowRight size={17} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}


