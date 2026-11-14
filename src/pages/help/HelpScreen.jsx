// src/pages/help/HelpScreen.jsx — khung toàn màn hình dùng chung cho gửi yêu cầu / lịch sử
import React, { useEffect } from "react";
import { Icon } from "./HelpUI.jsx";
import { TICKET_STATUS } from "./helpData.js";
import { useHelpTheme } from "./helpTheme.jsx";

export const MAX_IMAGES = 3;
export const MAX_MB = 5;

/* Trạng thái ticket */
export const statusOf = (s) =>
  TICKET_STATUS[s] || { label: s, dot: "bg-slate-400" };

/* Nguồn gửi ticket */
const SOURCES = {
  help_center: { label: "Trung tâm trợ giúp", dot: "bg-sky-400" },
  profile:     { label: "Hồ sơ",              dot: "bg-violet-400" },
  order:       { label: "Đơn hàng",           dot: "bg-amber-400" },
  chat:        { label: "Trò chuyện",         dot: "bg-emerald-400" },
  landing:     { label: "Trang chủ",          dot: "bg-slate-400" },
};

export const sourceOf = (s) =>
  SOURCES[s] || { label: s || "Khác", dot: "bg-slate-400" };

function Title({ text }) {
  const parts = String(text).split(" ");
  const last = parts.pop();
  return (
    <>
      {parts.length > 0 && `${parts.join(" ")} `}
      <span className="hc-serif">{last}</span>
    </>
  );
}

export function Screen({ title, big = true, onClose, right, footer, children }) {
  useHelpTheme();
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  return (
    <div className="hc-canvas fixed inset-0 z-50 flex flex-col">
      <div aria-hidden className="hc-halo" />
      <header
        className="hc-nav relative z-10"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex h-[54px] w-full max-w-md items-center gap-3 px-4 md:max-w-xl">
          <button onClick={onClose} aria-label="Quay lại" className="hc-navbtn">
            <Icon name="back" size={14} />
            Quay lại
          </button>
          <span className="hc-vr" />
          <span className="hc-text2 flex-1 truncate text-[12px] uppercase">
            {big ? "Trợ giúp" : title}
          </span>
          {right}
        </div>
      </header>

      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-md space-y-4 px-4 pb-8 pt-6 md:max-w-xl">
          {big && (
            <h1 className="hc-text px-1 pb-1 text-[40px] font-medium leading-[0.95] tracking-[-0.03em]">
              <Title text={title} />
            </h1>
          )}
          {children}
        </div>
      </div>

      {footer && (
        <div className="hc-bar relative z-10 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto max-w-md md:max-w-xl">{footer}</div>
        </div>
      )}
    </div>
  );
}

