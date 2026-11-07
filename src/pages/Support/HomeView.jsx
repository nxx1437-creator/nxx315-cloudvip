// src/pages/Support/HomeView.jsx

import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, ArrowUp, User, CreditCard, Package, Bug,
  MoreHorizontal, ChevronRight, Headphones,
} from "lucide-react";
import { CATEGORIES, SUPPORT, SYSTEM_BANNER } from "./constants.js";
import BannerNotice from "./BannerNotice.jsx";
import "./chat-effects.css";

const ICON_COMPONENTS = { User, CreditCard, Package, Bug, MoreHorizontal };

const GLOW_OK =
  typeof CSS !== "undefined" && typeof CSS.registerProperty === "function";

const MAX_LENGTH = 2000;

export default function HomeView({
  onOpenHelp = () => {},
  onStartChat,
  onBack,
}) {
  const [text, setText] = useState("");
  const [picked, setPicked] = useState(null);
  const ref = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [text]);

  const trimmed = text.trim();
  const canSend = trimmed.length > 0;

  const handleBack = () => {
    if (typeof onBack === "function") return onBack();
    if (window.history.length > 1) window.history.back();
  };

  const send = () => {
    if (!canSend) return;
    if (typeof onStartChat === "function") {
      onStartChat({ text: trimmed, category: picked });
    }
  };

  const handleChange = (e) => {
    const v = e.target.value;
    setText(v.length > MAX_LENGTH ? v.slice(0, MAX_LENGTH) : v);
  };

  return (
    <div className="min-h-[calc(100dvh-72px)] bg-white">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-black/[0.06] bg-white/95 px-4 py-3 backdrop-blur-xl">
        <button
          onClick={handleBack}
          aria-label="Quay lại"
          className="flex h-8 w-8 items-center justify-center text-[#161823]"
        >
          <ArrowLeft size={22} strokeWidth={2.2} />
        </button>
        <h1 className="text-[16px] font-bold tracking-[-0.01em] text-[#161823]">
          Trung tâm hỗ trợ
        </h1>
        <div className="h-8 w-8" />
      </div>

      {SYSTEM_BANNER?.enabled && <BannerNotice currentPage="support" />}

      <div className="px-5 pb-6 pt-10">
        <h2 className="nxx-hl nxx-hl--in nxx-serif text-center text-[34px] leading-[1.15] tracking-[-0.02em]">
          Chúng tôi sẵn sàng hỗ trợ!
        </h2>
      </div>

      {/* KHUNG NHẬP TO */}
      <div className="px-4">
        <div className="nxx-composer nxx-composer--hero">
          <span
            className={`nxx-glow ${GLOW_OK ? "" : "nxx-glow--pulse"}`}
            aria-hidden="true"
          />
          <textarea
            ref={ref}
            rows={3}
            value={text}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Mô tả vấn đề hoặc đặt câu hỏi..."
            aria-label="Nhập câu hỏi"
            maxLength={MAX_LENGTH}
            className="min-h-[84px] w-full flex-1 resize-none bg-transparent px-1 pt-1 text-[16.5px] leading-6 text-[#13141a] outline-none placeholder:text-[#a2a5b8]"
          />

          <div className="flex items-center gap-2">
            <div className="nxx-noscrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto">
              {(CATEGORIES || []).map((c) => {
                const on = picked === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setPicked(on ? null : c.id)}
                    className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] font-medium transition active:scale-[0.97] ${
                      on
                        ? "border-[#13141a] bg-[#13141a] text-white"
                        : "border-[#dde0ea] bg-white text-[#13141a]"
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={send}
              disabled={!canSend}
              aria-label="Gửi"
              className={`nxx-iconbtn h-10 w-10 text-white transition disabled:cursor-not-allowed ${
                canSend ? "bg-[#13141a]" : "bg-[#d9dbe6]"
              }`}
            >
              <ArrowUp size={20} strokeWidth={2.4} />
            </button>
          </div>

          {text.length > MAX_LENGTH * 0.9 && (
            <div className="mt-1 text-right text-[11px] text-[#a2a5b8]">
              {text.length}/{MAX_LENGTH}
            </div>
          )}
        </div>
      </div>

      <p className="px-5 pb-3 pt-8 text-[13px] font-semibold text-[#7b7e90]">
        Hoặc xem hướng dẫn theo chủ đề
      </p>
      <div className="grid grid-cols-2 gap-3 px-4">
        {(CATEGORIES || []).map((c) => {
          const Icon = ICON_COMPONENTS[c.icon] || MoreHorizontal;
          return (
            <button
              key={c.id}
              onClick={() => onOpenHelp(c.id)}
              className="flex items-center gap-3 rounded-[18px] border border-[#dde0ea] bg-[#f5f6fb] px-4 py-5 text-left transition duration-150 hover:bg-[#eef0f6] active:scale-[0.98]"
            >
              <Icon size={22} style={{ color: c.color }} strokeWidth={2} />
              <span className="text-[14.5px] font-semibold text-[#161823]">
                {c.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mx-4 my-6 border-t border-slate-100" />

      <div className="px-4 pb-7">
        <a
          href={SUPPORT?.zaloUrl}
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
                Hỗ trợ {SUPPORT?.hours}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-[#0068FF]" />
        </a>
      </div>
    </div>
  );
          }                     

