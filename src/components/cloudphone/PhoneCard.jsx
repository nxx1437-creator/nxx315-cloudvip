import React from "react";
import { Cloud, Smartphone } from "lucide-react";
import { GRAD } from "./cpUi.jsx";
import { remainText } from "./cpUtils.js";

// Trạng thái hiển thị của một đơn thuê
export function orderState(o, now) {
  if (o.status === "delivered") {
    const left = new Date(o.expires_at).getTime() - now;
    if (left > 0)
      return {
        main: remainText(left),
        pill: left < 3600000 ? "Sắp hết hạn" : "Đang chạy",
        mainCls: "text-emerald-600",
        pillCls:
          left < 3600000
            ? "bg-amber-100 text-amber-700"
            : "bg-emerald-100 text-emerald-700",
      };
    return {
      main: "Đã hết hạn",
      pill: "Hết hạn",
      mainCls: "text-slate-400",
      pillCls: "bg-slate-100 text-slate-500",
    };
  }
  if (o.status === "failed")
    return {
      main: "Đã hoàn Coin",
      pill: "Hoàn Coin",
      mainCls: "text-rose-500",
      pillCls: "bg-rose-50 text-rose-600",
    };
  return {
    main: "Đang giao",
    pill: "Chờ máy",
    mainCls: "text-amber-600",
    pillCls: "bg-amber-50 text-amber-700",
  };
}

export default function PhoneCard({ o, now }) {
  const st = orderState(o, now);
  return (
    <div>
      <div className="flex h-44 flex-col items-center justify-center rounded-[1.75rem] border border-emerald-100 bg-white p-3 text-center shadow-[0_1px_2px_rgba(15,23,42,0.05),0_2px_8px_-2px_rgba(15,23,42,0.07)]">
        <Smartphone size={30} className="text-slate-400" />
        <p className={`mt-3 text-base font-black ${st.mainCls}`}>{st.main}</p>
        <span className={`mt-3 rounded-full px-4 py-2 text-xs font-black ${st.pillCls}`}>
          {st.pill}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${GRAD} text-white`}
        >
          <Cloud size={14} />
        </span>
        <span className="text-sm font-bold text-slate-800">#{o.id}</span>
      </div>
    </div>
  );
}
