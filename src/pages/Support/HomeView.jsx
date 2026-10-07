// src/pages/Support/HomeView.jsx

import React from "react";
import {
  ArrowLeft, User, CreditCard, Package, Bug, MoreHorizontal,
  ChevronRight, Headphones,
} from "lucide-react";
import { CATEGORIES, SUPPORT, SYSTEM_BANNER } from "./constants.js";
import BannerNotice from "./BannerNotice.jsx";

const ICON_COMPONENTS = {
  User, CreditCard, Package, Bug, MoreHorizontal,
};

export default function HomeView({ onOpenHelp }) {
  return (
    <div className="min-h-[calc(100vh-72px)] bg-white">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-black/[0.06] bg-white/95 px-4 py-3 backdrop-blur-xl">
        <button
          onClick={() => window.history.back()}
          className="flex h-8 w-8 items-center justify-center text-[#161823]"
        >
          <ArrowLeft size={22} strokeWidth={2.2} />
        </button>
        <h1 className="text-[16px] font-bold tracking-[-0.01em] text-[#161823]">
          Trung tâm hỗ trợ
        </h1>
        <div className="h-8 w-8" />
      </div>

      {SYSTEM_BANNER.enabled && <BannerNotice />}

      <div className="px-5 pb-6 pt-8">
        <h2 className="text-center text-[22px] font-extrabold leading-[1.3] tracking-[-0.02em] text-[#161823]">
          Chúng tôi sẵn sàng hỗ trợ!
          <br />
          Chọn loại vấn đề.
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4">
        {CATEGORIES.map((cat) => {
          const Icon = ICON_COMPONENTS[cat.icon];
          return (
            <button
              key={cat.id}
              onClick={() => onOpenHelp(cat.id)}
              className="flex items-center gap-3 rounded-[18px] border border-black/[0.06] bg-[#f8f8f8] px-4 py-5 text-left transition duration-150 hover:border-black/[0.12] hover:bg-[#f2f2f2] active:scale-[0.98]"
            >
              <Icon size={22} style={{ color: cat.color }} strokeWidth={2} />
              <span className="text-[14.5px] font-semibold text-[#161823]">
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mx-4 my-6 border-t border-slate-100" />

      <div className="px-4 pb-7">
        <a
          href={SUPPORT.zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-between rounded-[18px] border border-[#0068FF]/25 bg-[#0068FF]/[0.04] px-4 py-4 transition hover:bg-[#0068FF]/[0.08] active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <Headphones size={22} className="text-[#0068FF]" strokeWidth={2} />
            <div className="text-left">
              <p className="text-[14.5px] font-semibold text-[#0068FF]">
                Gặp nhân viên qua Zalo
              </p>
              <p className="mt-0.5 text-[11.5px] text-[#0068FF]/70">
                Hỗ trợ {SUPPORT.hours}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-[#0068FF]" />
        </a>
      </div>
    </div>
  );
}
