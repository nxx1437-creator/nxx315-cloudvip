import React from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { GRAD } from "./cpUi.jsx";
import { fmt } from "./cpUtils.js";

// Thanh cố định dưới đáy: nút thuê + số dư
export default function BuyBar({ coins, pkg, soldOut, hasActive, canBuy, busy, onBuy, onEarn }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-[#eefaf7] via-[#eefaf7] to-transparent px-4 pb-5 pt-8">
      <div className="mx-auto max-w-md">
        <button
          onClick={onBuy}
          disabled={!canBuy}
          className={`flex h-14 w-full items-center justify-center gap-2 rounded-full text-base font-black transition active:scale-[0.98] ${
            canBuy
              ? `bg-gradient-to-r ${GRAD} text-white`
              : "bg-slate-200 text-slate-400"
          }`}
        >
          {busy ? (
            <Loader2 size={20} className="animate-spin" />
          ) : soldOut ? (
            "Đang chờ hàng về"
          ) : hasActive ? (
            "Bạn đang có máy"
          ) : (
            `Thuê máy${pkg ? ` · ${fmt(pkg.price_coins)} Coin` : ""}`
          )}
        </button>

        <div className="mt-3 flex items-center justify-between px-1">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Số dư Coin: {fmt(coins)}
            </p>
            <p className="text-xs text-slate-400">Coin nhận được từ nhiệm vụ miễn phí.</p>
          </div>
          <button
            onClick={onEarn}
            className="flex items-center text-sm font-bold text-emerald-700"
          >
            Kiếm Coin
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
