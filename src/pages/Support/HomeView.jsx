// src/pages/Support/HomeView.jsx

import React, { useRef, useState } from "react";
import {
  ArrowLeft, ArrowUp, Check, ChevronDown, ChevronRight, Headphones,
  Loader2, Sparkles, User, CreditCard, Package, Bug, MoreHorizontal,
} from "lucide-react";
import { CATEGORIES, SUPPORT, SYSTEM_BANNER } from "./constants.js";
import BannerNotice from "./BannerNotice.jsx";
import GradientHeadline from "./GradientHeadline.jsx";
import "./chat-effects.css";
import "./home-input.css";

const ICON_COMPONENTS = {
  User, CreditCard, Package, Bug, MoreHorizontal,
};

// phải để ngoài component để GradientHeadline không bị reset
const HEADLINES = [
  "Chúng tôi sẵn sàng hỗ trợ bạn!",
  "Bạn đang gặp vấn đề gì?",
  "Hỏi NXX bất cứ điều gì.",
];

export default function HomeView({ onOpenHelp, onStartChat }) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const taRef = useRef(null);

  const cat = CATEGORIES.find((c) => c.id === category) || null;
  const PillIcon = (cat && ICON_COMPONENTS[cat.icon]) || Sparkles;
  const canSend = text.trim().length > 0 && !sending;

  const handleChange = (e) => {
    setText(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const send = async () => {
    if (!canSend || !onStartChat) return;
    setSending(true);
    try {
      await onStartChat({ text: text.trim(), category });
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    // bỏ qua khi đang gõ dấu tiếng Việt (Telex/VNI)
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const pick = (id) => {
    setCategory(id);
    setSheetOpen(false);
    taRef.current?.focus();
  };

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

      <div className="px-5 pb-3 pt-12">
        <GradientHeadline phrases={HEADLINES} />
        <p className="mx-auto mt-3 max-w-[320px] text-center text-[14px] leading-6 text-[#8a8d93]">
          Hỏi nhanh hoặc chọn chủ đề để NXX hỗ trợ bạn chính xác hơn.
        </p>
      </div>

      <div className="px-4 pt-10">
        <div className="nxx-box">
          <div className="relative rounded-[22px] border border-[#e3e5ee] bg-[#f7f8fc] px-4 pb-3 pt-4">
            <textarea
              ref={taRef}
              value={text}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              rows={1}
              enterKeyHint="send"
              placeholder="Mô tả vấn đề hoặc đặt câu hỏi"
              className="block max-h-[120px] min-h-[28px] w-full resize-none bg-transparent text-[15px] leading-6 text-[#161823] outline-none placeholder:text-[#b4b7c2]"
            />
            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="flex items-center gap-2 rounded-full border border-[#e3e5ee] bg-white px-3.5 py-2 text-[14px] font-medium text-[#161823] transition active:scale-[0.97]"
              >
                <PillIcon
                  size={17}
                  strokeWidth={2.2}
                  style={{ color: cat?.color || "#8a5cff" }}
                />
                {cat ? cat.label : "Chọn chủ đề"}
                <ChevronDown size={16} className="text-[#8a8d93]" />
              </button>

              <button
                type="button"
                onClick={send}
                disabled={!canSend}
                aria-label="Gửi"
                className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                  canSend
                    ? "bg-[#13141a] text-white active:scale-95"
                    : "bg-[#e6e8f0] text-white"
                }`}
              >
                {sending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <ArrowUp size={18} strokeWidth={2.6} />
                )}
              </button>
            </div>
          </div>
        </div>

        {cat && (
          <button
            type="button"
            onClick={() => onOpenHelp(cat.id)}
            className="mx-auto mt-4 flex items-center gap-1 text-[13px] font-medium text-[#0068FF] active:opacity-60"
          >
            Xem hướng dẫn về “{cat.label}”
            <ChevronRight size={15} />
          </button>
        )}
      </div>

      <div className="mx-4 my-8 border-t border-slate-100" />

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

      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <button
            type="button"
            aria-label="Đóng"
            onClick={() => setSheetOpen(false)}
            className="nxx-sheet-backdrop absolute inset-0 bg-slate-900/30"
          />
          <div className="nxx-sheet-panel relative w-full max-w-2xl rounded-t-[28px] bg-white px-3 pb-8 pt-3 shadow-[0_-8px_32px_rgba(17,20,24,0.12)]">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200" />

            <SheetRow
              label="Tất cả chủ đề"
              Icon={Sparkles}
              color="#8a5cff"
              selected={!cat}
              onClick={() => pick(null)}
            />
            {CATEGORIES.map((c) => (
              <SheetRow
                key={c.id}
                label={c.label}
                Icon={ICON_COMPONENTS[c.icon] || Sparkles}
                color={c.color}
                selected={category === c.id}
                onClick={() => pick(c.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SheetRow({ label, Icon, color, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-[14px] px-4 py-3.5 text-left transition active:opacity-70 ${
        selected ? "bg-[#f0f1f6]" : ""
      }`}
    >
      <Icon size={20} strokeWidth={2.1} style={{ color }} />
      <span className="flex-1 text-[15px] font-medium text-[#161823]">
        {label}
      </span>
      {selected && <Check size={18} className="text-[#161823]" />}
    </button>
  );
                                      }
