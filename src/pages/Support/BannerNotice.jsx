// src/pages/Support/BannerNotice.jsx

import React from "react";
import { Megaphone } from "lucide-react";
import { SYSTEM_BANNER } from "./constants.js";

/**
 * Banner thông báo hệ thống.
 * @param {Object} props
 * @param {string} [props.currentPage] - Trang hiện tại, vd "support". Bỏ trống = luôn hiện (nếu enabled).
 */
export default function BannerNotice({ currentPage }) {
  if (!SYSTEM_BANNER?.enabled) return null;

  const pages = SYSTEM_BANNER.pages || [];
  if (currentPage && pages.length > 0 && !pages.includes(currentPage)) {
    return null;
  }

  const hasCta = Boolean(SYSTEM_BANNER.ctaLabel);

  return (
    <div className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-2.5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100">
          <Megaphone size={14} className="text-amber-600" strokeWidth={2.4} />
        </div>

        <p className="flex-1 text-[11.5px] font-medium leading-4 text-amber-800">
          {SYSTEM_BANNER.text}
        </p>

        {hasCta && (
          <a
            href={SYSTEM_BANNER.ctaHref || undefined}
            target={SYSTEM_BANNER.ctaHref ? "_blank" : undefined}
            rel={SYSTEM_BANNER.ctaHref ? "noopener noreferrer" : undefined}
            className="shrink-0 rounded-full bg-amber-100/80 px-2 py-1 text-[10px] font-bold text-amber-700 transition hover:bg-amber-200/80"
          >
            {SYSTEM_BANNER.ctaLabel} ›
          </a>
        )}
      </div>
    </div>
  );
}
