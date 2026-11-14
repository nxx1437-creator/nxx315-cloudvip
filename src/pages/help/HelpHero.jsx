// src/pages/help/HelpHero.jsx
import React from "react";
import Icon from "./HelpIcons.jsx";

export function Hero({ onBack, onHome }) {
  const btn =
    "flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:bg-white/25";
  return (
    <div className="bg-sky-700 dark:bg-sky-900">
      <div className="mx-auto max-w-md px-4 pb-14 pt-3 md:max-w-3xl">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className={btn} aria-label="Quay lại">
            <Icon name="back" size={18} />
          </button>
          <span className="text-[15px] font-semibold text-white">Trung tâm Trợ giúp</span>
          <button onClick={onHome} className={btn} aria-label="Trang chủ">
            <Icon name="home" size={18} />
          </button>
        </div>
        <h2 className="mt-7 text-[24px] font-semibold leading-tight tracking-tight text-white">
          Chúng tôi có thể giúp gì cho bạn?
        </h2>
        <p className="mt-2 text-sm leading-6 text-sky-100">
          Tìm câu trả lời nhanh hoặc liên hệ đội ngũ hỗ trợ NXX315.
        </p>
      </div>
    </div>
  );
}

export function SearchBar({ value, onChange }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
        <Icon name="search" size={18} />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Tìm kiếm câu hỏi thường gặp"
        className="h-14 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-[15px] text-slate-900 shadow-md shadow-slate-900/5 outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Xoá"
        >
          <Icon name="x" size={16} />
        </button>
      )}
    </div>
  );
}
