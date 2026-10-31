import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { GRAD } from "./cpUi.jsx";
import { fmtDate } from "./cpUtils.js";

// Thẻ chi tiết đơn đang giao / đã giao
export default function ActiveCard({ order, busy, onRetry }) {
  const [acc, setAcc] = useState(order.vmos_account || "");
  const delivered = order.status === "delivered";
  const err = String(order.error || "");
  const transferFail = err.startsWith("transfer_");
  const stuck = Number(order.attempts) >= 99;

  if (delivered) {
    return (
      <div className="space-y-3 rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={20} className="text-emerald-600" />
          <p className="text-base font-black text-emerald-800">Máy đã được giao</p>
        </div>
        <p className="text-sm text-slate-600">
          Đã chuyển vào tài khoản VMOS{" "}
          <span className="font-bold text-slate-900">{order.vmos_account}</span>
        </p>
        <p className="text-sm text-slate-600">
          Hết hạn:{" "}
          <span className="font-bold text-slate-900">{fmtDate(order.expires_at)}</span>
        </p>
        <div className="rounded-2xl bg-white p-3 text-xs leading-5 text-slate-500">
          Mở app VMOS Cloud, đăng nhập bằng email trên rồi vào danh sách máy để dùng.
          Máy hết hạn sẽ tự dừng.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-[1.75rem] border border-emerald-100 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_2px_8px_-2px_rgba(15,23,42,0.07)]">
      <div className="flex items-center gap-2">
        {stuck || transferFail ? (
          <AlertTriangle size={20} className="text-amber-500" />
        ) : (
          <Loader2 size={20} className="animate-spin text-emerald-600" />
        )}
        <p className="text-base font-black text-slate-900">
          {stuck
            ? "Đơn đang được admin kiểm tra"
            : transferFail
            ? "Chưa chuyển được máy"
            : "Đang chuẩn bị máy cho bạn"}
        </p>
      </div>

      <p className="text-xs leading-5 text-slate-500">
        {stuck
          ? `Mã đơn #${order.id}. Nếu quá 30 phút chưa có máy, hãy liên hệ admin kèm mã đơn này.`
          : transferFail
          ? "Kiểm tra lại email tài khoản VMOS Cloud, sửa nếu sai rồi bấm Thử lại."
          : "Thường mất 1–2 phút. Trang sẽ tự cập nhật, bạn không cần tải lại."}
      </p>

      {transferFail && !stuck && (
        <input
          type="email"
          inputMode="email"
          autoCapitalize="none"
          value={acc}
          onChange={(e) => setAcc(e.target.value)}
          className="h-12 w-full rounded-2xl border border-emerald-100 bg-white px-4 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        />
      )}

      {!stuck && (
        <button
          onClick={() => onRetry(order, transferFail ? acc : undefined)}
          disabled={busy || order.status === "fulfilling"}
          className={`flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r ${GRAD} text-sm font-black text-white transition active:scale-[0.98] disabled:opacity-40`}
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Thử lại
        </button>
      )}
    </div>
  );
}
