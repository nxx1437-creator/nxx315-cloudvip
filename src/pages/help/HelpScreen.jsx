// src/pages/help/HelpScreen.jsx
import React, { useEffect } from "react";
import { Icon } from "./HelpUI.jsx";
import { TICKET_STATUS } from "./helpData.js";
import { useHelpTheme } from "./helpTheme.jsx";

export const statusOf = (s) => TICKET_STATUS[s] || { label: s, dot: "bg-slate-400" };

export function Screen({ title, big = true, onClose, right, footer, children }) {
  useHelpTheme();
  
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    // hc-canvas đã được CSS ép thành flex-col 100vh
    <div className="hc-canvas fixed inset-0 z-50 flex flex-col bg-[#f8f9fc]">
      
      {/* HEADER CỐ ĐỊNH */}
      <header className="hc-nav flex-shrink-0 sticky top-0 z-10" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="mx-auto flex h-[56px] w-full max-w-md items-center gap-3 px-4 md:max-w-xl">
          <button onClick={onClose} className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-gray-100 text-[#1e1e2f] text-sm font-semibold transition active:scale-95">
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

