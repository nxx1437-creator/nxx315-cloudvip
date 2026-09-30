// src/pages/help/HelpHero.jsx
import React from "react";
import Icon from "./HelpIcons.jsx";
import { ZALO_URL } from "./helpData.js";

export function Mascot({ size = 116 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <defs>
        <linearGradient id="hcHelmet" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#c026d3" />
        </linearGradient>
        <linearGradient id="hcBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#fce7f3" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="112" rx="30" ry="5" fill="#f9a8d4" opacity="0.5" />
      <path d="M30 108c0-16 13-26 30-26s30 10 30 26z" fill="url(#hcBody)" stroke="#f9a8d4" strokeWidth="2" />
      <rect x="49" y="94" width="22" height="14" rx="7" fill="url(#hcHelmet)" />
      <circle cx="60" cy="52" r="34" fill="url(#hcBody)" stroke="#f9a8d4" strokeWidth="2.5" />
      <path d="M26 50a34 34 0 0 1 68 0c-6-14-18-20-34-20S32 36 26 50z" fill="url(#hcHelmet)" />
      <rect x="18" y="46" width="10" height="20" rx="5" fill="#3b82f6" />
      <rect x="92" y="46" width="10" height="20" rx="5" fill="#3b82f6" />
      <path d="M97 64c0 12-10 18-26 18" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
      <circle cx="68" cy="82" r="4" fill="#1d4ed8" />
      <ellipse cx="47" cy="56" rx="4.5" ry="6" fill="#4a044e" />
      <ellipse cx="73" cy="56" rx="4.5" ry="6" fill="#4a044e" />
      <circle cx="48.5" cy="54" r="1.6" fill="#fff" />
      <circle cx="74.5" cy="54" r="1.6" fill="#fff" />
      <ellipse cx="38" cy="66" rx="5" ry="3" fill="#f472b6" opacity="0.5" />
      <ellipse cx="82" cy="66" rx="5" ry="3" fill="#f472b6" opacity="0.5" />
      <path d="M52 68c2.5 5 13.5 5 16 0z" fill="#be185d" />
      <path d="M60 22v-6" stroke="#c026d3" strokeWidth="3" strokeLinecap="round" />
      <circle cx="60" cy="14" r="4" fill="#fbbf24" />
    </svg>
  );
}

export function Hero({ scrolled, onBack, onHome }) {
  const btn =
    "flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-black/5 transition active:scale-95 dark:bg-slate-800 dark:text-slate-100";
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 overflow-hidden bg-gradient-to-b from-pink-200/90 via-pink-100/70 to-transparent dark:from-pink-500/10 dark:via-transparent">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-fuchsia-300/40 blur-3xl" />
        <div className="absolute -left-12 top-28 h-40 w-40 rounded-full bg-rose-300/40 blur-3xl" />
      </div>

      <div
        className={`sticky top-0 z-30 transition-all duration-200 ${
          scrolled ? "bg-white/85 shadow-sm backdrop-blur-md dark:bg-slate-950/85" : ""
        }`}
      >
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3 md:max-w-3xl">
          <button onClick={onBack} className={btn} aria-label="Quay lại">
            <Icon name="back" size={18} />
          </button>
          <h1 className="text-[15px] font-extrabold text-slate-800 dark:text-white">Trung tâm Trợ giúp</h1>
          <button onClick={onHome} className={btn} aria-label="Trang chủ">
            <Icon name="home" size={18} />
          </button>
        </div>
      </div>

      <div className="relative mx-auto flex max-w-md items-center px-4 pb-4 pt-1 md:max-w-3xl">
        <div className="flex-1 pr-2">
          <p className="font-display text-[26px] font-black leading-none text-fuchsia-600">Chào bạn 👋</p>
          <p className="mt-2 text-[17px] font-extrabold leading-snug text-slate-800 dark:text-white">
            NXX315 có thể giúp gì cho bạn?
          </p>
        </div>
        <div className="relative shrink-0">
          <span className="absolute -left-3 top-1 rounded-lg bg-white px-2 py-0.5 text-[10px] font-black text-pink-500 shadow ring-1 ring-pink-100">
            FAQ
          </span>
          <span className="absolute -right-1 top-6 flex h-7 w-7 items-center justify-center rounded-lg bg-white text-sky-500 shadow ring-1 ring-sky-100">
            <Icon name="chat" size={15} />
          </span>
          <Mascot />
        </div>
      </div>
    </>
  );
}

export function SearchBar({ value, onChange, onHistory }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon name="search" size={18} />
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Tìm kiếm vấn đề của bạn tại đây"
          className="w-full rounded-2xl border-0 bg-white py-3.5 pl-11 pr-10 text-sm text-slate-800 shadow-sm ring-1 ring-black/5 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-pink-300 dark:bg-slate-900 dark:text-white"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800"
            aria-label="Xoá"
          >
            <Icon name="x" size={12} stroke={2.5} />
          </button>
        )}
      </div>
      <button
        onClick={onHistory}
        className="flex h-[50px] shrink-0 flex-col items-center justify-center rounded-2xl bg-white px-3.5 text-pink-500 shadow-sm ring-1 ring-black/5 transition active:scale-95 dark:bg-slate-900"
      >
        <Icon name="history" size={18} />
        <span className="mt-0.5 text-[10px] font-extrabold">Lịch sử</span>
      </button>
    </div>
  );
}

export function ChatCard() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-purple-600 p-4 shadow-lg shadow-pink-500/25">
      <div className="pointer-events-none absolute -right-6 -top-10 h-32 w-32 rounded-full bg-white/15" />
      <div className="pointer-events-none absolute -bottom-12 right-16 h-28 w-28 rounded-full bg-white/10" />
      <div className="relative flex items-center gap-3">
        <div className="relative shrink-0">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-inner">
            <Mascot size={46} />
          </div>
          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-extrabold text-white">Hỗ trợ trực tuyến</p>
          <p className="mt-0.5 text-xs text-pink-50">Trả lời mọi câu hỏi của bạn 24/7</p>
        </div>
      </div>
      <a
        href={ZALO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="relative mt-3 flex items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm font-extrabold text-fuchsia-600 shadow transition active:scale-[0.98]"
      >
        <Icon name="chat" size={16} />
        Chat với NXX315
      </a>
    </div>
  );
}
