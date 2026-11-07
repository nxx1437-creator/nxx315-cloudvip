// src/pages/help/HelpScreen.jsx — khung màn hình dùng chung cho form Trợ giúp
import React from "react";
import { Icon, ring } from "./HelpUI.jsx";

export const MAX_IMAGES = 3;
export const MAX_MB = 5;

export function Screen({ title, onClose, right, footer, children }) {
  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-[#f1f4fa]">
      <div className="flex items-center gap-3 px-4 pb-2 pt-3">
        <button
          onClick={onClose}
          aria-label="Đóng"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ffffff] text-[#16213e] ${ring}`}
        >
          <Icon name="x" size={20} />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-center text-[18px] font-semibold tracking-[-0.3px] text-[#16213e]">
          {title}
        </h1>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center">
          {right}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-2">
        <div className="mx-auto w-full max-w-2xl space-y-4">{children}</div>
      </div>

      {footer && (
        <div className="border-t border-[#16213e]/10 bg-[#f1f4fa] px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
          <div className="mx-auto w-full max-w-2xl">{footer}</div>
        </div>
      )}
    </div>
  );
}

