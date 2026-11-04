// src/pages/help/HelpScreen.jsx — khung toàn màn hình dùng chung cho gửi yêu cầu / lịch sử / chat
import React, { useEffect } from "react";
import { Icon, ring } from "./HelpUI.jsx";
import { TICKET_STATUS } from "./helpData.js";

export const MAX_IMAGES = 3;
export const MAX_MB = 5;
export const statusOf = (s) => TICKET_STATUS[s] || { label: s, dot: "bg-slate-400" };

/* ---------- Khung toàn màn hình ---------- */
export function Screen({ title, big = true, onClose, right, footer, children }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#eef2f9]">
      <div className="mx-auto w-full max-w-md px-4 pt-3 md:max-w-xl">
        <div className="flex items-center gap-3">
          <button onClick={onClose} aria-label="Quay lại"
            className={`flex h-11 w-11 items-center justify-center rounded-full bg-[#ffffff] text-[#16213e] ${ring}`}>
            <Icon name="back" size={20} />
          </button>
          {big ? <span className="flex-1" /> : <h1 className="flex-1 text-[20px] font-semibold tracking-[-0.3px] text-[#16213e]">{title}</h1>}
          {right}
        </div>
        {big && <h1 className="mt-5 text-[34px] font-semibold leading-[1.05] tracking-[-1px] text-[#16213e]">{title}</h1>}
      </div>
      <div className="pointer-events-none relative z-10 -mb-5 h-5 bg-gradient-to-b from-[#eef2f9] to-transparent" />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-md space-y-4 px-4 pb-8 pt-5 md:max-w-xl">{children}</div>
      </div>
      {footer && (
        <div className="border-t border-[#16213e]/5 bg-white/85 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-[9px]">
          <div className="mx-auto max-w-md md:max-w-xl">{footer}</div>
        </div>
      )}
    </div>
  );
}
