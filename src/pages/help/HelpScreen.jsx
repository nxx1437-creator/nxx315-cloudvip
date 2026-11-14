// src/pages/help/HelpScreen.jsx
import React, { useEffect } from "react";
import { Icon } from "./HelpUI.jsx";
import { TICKET_STATUS } from "./helpData.js";
import { useHelpTheme } from "./helpTheme.jsx";

// ==========================================
// BỔ SUNG 2 HẰNG SỐ NÀY ĐỂ FIX LỖI BUILD
// ==========================================
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
  const n = parts.length >= 3 ? 2 : 1;
  const tail = parts.splice(parts.length - n, n).join(" ");
  return (
    <>
      {parts.length > 0 && `${parts.join(" ")} `}
      <span className="hc-serif">{tail}</span>
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
    // hc-canvas đã được CSS ép thành flex-col 100vh để không bị vỡ layout
    <div className="hc-canvas fixed inset-0 z-50 flex flex-col bg-[#f8f9fc]">
      
      {/* HEADER CỐ ĐỊNH */}
      <header className="hc-nav flex-shrink-0 sticky top-0 z-10" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="mx-auto flex h-[56px] w-full max-w-md items-center gap-3 px-4 md:max-w-xl">
          <button 
            onClick={onClose} 
            className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-gray-100 text-[#1e1e2f] text-sm font-semibold transition active:scale-95"
          >
            <Icon name="back" size={16} />
            Quay lại
          </button>
          <span className="flex-1 truncate text-[15px] font-bold text-[#1e1e2f]">{title}</span>
          {right}
        </div>
      </header>

      {/* VÙNG NỘI DUNG CUỘN ĐƯỢC */}
      <div className="flex-1 overflow-y-auto relative z-0">
        <div className="mx-auto max-w-md space-y-4 px-4 pb-8 pt-6 md:max-w-xl">
          {children}
        </div>
      </div>

      {/* FOOTER CỐ ĐỊNH (NẾU CÓ) */}
      {footer && (
        <div className="hc-bar flex-shrink-0 relative z-10" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          <div className="mx-auto max-w-md md:max-w-xl">{footer}</div>
        </div>
      )}
    </div>
  );
      }

