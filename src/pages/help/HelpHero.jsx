// src/pages/help/HelpHero.jsx
import React from "react";
import Icon from "./HelpIcons.jsx";

export function Hero({ onBack, onHome }) {
  const btn = "flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-gray-800 backdrop-blur-sm transition hover:bg-white/40 active:scale-95 shadow-sm";
  return (
    <div className="bg-gradient-to-b from-[#e0f2fe] to-[#f8f9fc]">
      <div className="mx-auto max-w-md px-4 pb-14 pt-4 md:max-w-3xl">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className={btn} aria-label="Quay lại">
            <Icon name="back" size={18} />
          </button>
          <span className="text-[15px] font-bold text-[#1e1e2f]">Trung tâm Trợ giúp</span>
          <button onClick={onHome} className={btn} aria-label="Trang chủ">
            <Icon name="home" size={18} />
          </button>
        </div>
        <h2 className="mt-7 text-[28px] font-bold leading-tight tracking-tight text-[#1e1e2f]">
          Chúng tôi có thể giúp gì cho bạn?
        </h2>
        <p className="mt-2 text-[15px] leading-6 text-gray-600">
          Tìm câu trả lời nhanh hoặc liên hệ đội ngũ hỗ trợ NXX315.
        </p>
      </div>
    </div>
  );
}

export function SearchBar({ value, onChange }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
        <Icon name="search" size={18} />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Tìm kiếm câu hỏi thường gặp"
        className="h-14 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-11 text-[15px] text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-[#625df5] focus:ring-2 focus:ring-[#625df5]/20"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          aria-label="Xoá"
        >
          <Icon name="x" size={16} />
        </button>
      )}
    </div>
  );
}
