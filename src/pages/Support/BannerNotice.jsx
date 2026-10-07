// src/pages/Support/BannerNotice.jsx

import React from "react";
import { Megaphone } from "lucide-react";
import { SYSTEM_BANNER } from "./constants.js";

export default function BannerNotice() {
  if (!SYSTEM_BANNER.enabled) return null;

  return (
    <div className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-2.5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100">
          <Megaphone size={14} className="text-amber-600" strokeWidth={2.4} />
        </div>
        <p className="flex-1 text-[11.5px] font-medium leading-4 text-amber-800">
          {SYSTEM_BANNER.text}
        </p>
        <button className="shrink-0 rounded-full bg-amber-100/80 px-2 py-1 text-[10px] font-bold text-amber-700">
          {SYSTEM_BANNER.page} ›
        </button>
      </div>
    </div>
  );
}
