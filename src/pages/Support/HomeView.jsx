// src/pages/Support/HomeView.jsx

import React, { useRef, useState } from "react";
import {
  ArrowLeft, ArrowUp, Check, ChevronDown, ChevronRight, Headphones,
  Loader2, Sparkles, User, CreditCard, Package, Bug, MoreHorizontal,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";
import { getGreeting, getSuggestions } from "./helpers.js";
import { CATEGORIES, SUPPORT, SYSTEM_BANNER } from "./constants.js";
import BannerNotice from "./BannerNotice.jsx";
import GradientHeadline from "./GradientHeadline.jsx";
import HomeGuides from "./HomeGuides.jsx";
import "./chat-effects.css";
import "./home-input.css";

const ICON_COMPONENTS = { User, CreditCard, Package, Bug, MoreHorizontal };

const HEADLINES = [
  "Chúng tôi sẵn sàng hỗ trợ bạn!",
  "Bạn đang gặp vấn đề gì?",
  "Hỏi NXX bất cứ điều gì.",
];

const FALLBACK_CATEGORY = CATEGORIES.find((c) => c.label === "Khác")?.id || null;

const FOCUS_GLOW_CSS = `
.nxx-composer--hero:focus-within .nxx-glow { opacity: 1; }
.nxx-composer--hero:focus-within .nxx-glow::before { animation-play-state: running; }
`;

export default function HomeView({ onOpenHelp, onStartChat }) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState(""); // Biến lưu lỗi để hiện chữ đỏ
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

  // Hàm tự tạo chat trực tiếp với Supabase
  const handleSelfStartChat = async ({ text: msg, category: catId }) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user?.id) throw new Error("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.");

      // 1. Tạo cuộc trò chuyện
      const { data: conv, error: convError } = await supabase
        .from("support_conversations")
        .insert({
          user_id: user.id,
          title: catId ? `Hỗ trợ ${CATEGORIES.find((c) => c.id === catId)?.label}` : "Cuộc trò chuyện mới",
          category: catId,
          status: "ai",
        })
        .select()
        .single();

      if (convError) throw new Error("Lỗi tạo cuộc trò chuyện: " + convError.message);

      // 2. Tạo tin nhắn chào
      const { error: msgError } = await supabase
        .from("support_messages")
        .insert({
          conversation_id: conv.id,
          user_id: user.id,
          message: getGreeting(catId),
          sender_type: "ai",
          suggestions: getSuggestions(catId),
        });

      if (msgError) throw new Error("Lỗi tạo tin nhắn chào: " + msgError.message);

      // 3. Bắn sự kiện để trang cha (Support.jsx) chuyển sang màn hình Chat
      window.dispatchEvent(new CustomEvent("nxx-start-chat", { 
        detail: { conversation: conv, category: catId, firstText: msg } 
      }));
      
      return { ok: true };
    } catch (e) {
      return { error: e.message };
    }
  };

  const send = async () => {
    if (!canSend) return;
    setSending(true);
    setErr(""); // Xóa lỗi cũ
    
    const msg = text.trim();
    const catId = category || FALLBACK_CATEGORY;
    
    // Tạo đồng hồ đếm ngược 7 giây chống treo
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Quá 7 giây không phản hồi. Mạng đang chặn Supabase hoặc server bị treo.")), 7000)
    );

    try {
      const fnToCall = typeof onStartChat === "function" ? onStartChat : handleSelfStartChat;
      
      const r = await Promise.race([
        fnToCall({ text: msg, category: catId }),
        timeout
      ]);
      
      if (r && r.error) {
        setErr("LỖI: " + r.error);
      }
    } catch (e) {
      setErr("LỖI HỆ THỐNG: " + e.message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
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
      <style>{FOCUS_GLOW_CSS}</style>

      <div className="sticky top-0 z-20 flex items-center bg-white/90 px-4 py-3 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => window.history.back()}
          aria-label="Quay lại"
          className="nxx-iconbtn h-10 w-10 border border-[#dde0ea] bg-white text-[#13141a]"
        >
          <ArrowLeft size={20} strokeWidth={2.2} />
        </button>
      </div>

      {SYSTEM_BANNER.enabled && <BannerNotice />}

      <div className="px-5 pb-3 pt-8">
        <GradientHeadline phrases={HEADLINES} />
        <p className="mx-auto mt-3 max-w-[320px] text-center text-[14px] leading-6 text-[#8a8d93]">
          Hỏi nhanh hoặc chọn chủ đề để NXX hỗ trợ bạn chính xác hơn.
        </p>
        {/* Dòng chữ test code đã cập nhật */}
        <p className="text-center text-red-600 text-xl font-bold mt-4">
          ĐÃ CẬP NHẬT CODE MỚI!
        </p>
      </div>

      <div className="px-4 pt-8">
        <div
          className={`nxx-composer nxx-composer--hero ${sending ? "is-busy" : ""}`}
          style={{ minHeight: 0, padding: "14px 14px 10px", gap: 6 }}
        >
          <span className="nxx-glow" />
          <textarea
            ref={taRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            rows={1}
            enterKeyHint="send"
            placeholder="Mô tả vấn đề hoặc đặt câu hỏi"
            className="block max-h-[120px] min-h-[44px] w-full flex-1 resize-none bg-transparent text-[16px] leading-6 text-[#13141a] outline-none placeholder:text-[#b4b7c2]"
          />
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="nxx-chip"
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
              className={`nxx-iconbtn h-10 w-10 text-white ${
                canSend ? "bg-[#13141a]" : "bg-[#e6e8f0]"
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

      {/* HIỂN THỊ LỖI BẰNG CHỮ ĐỎ TO RÕ RÀNG */}
      {err && (
        <div className="px-5 pt-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-[14px] leading-6 text-red-600 font-bold text-center">
              {err}
            </p>
          </div>
        </div>
      )}

      <div className="px-4 pt-6">
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

      <div className="pt-10">
        <HomeGuides
          onOpenHelp={onOpenHelp}
          onPickTopic={(title, catId) => {
            setText(title);
            setCategory(catId);
            setTimeout(() => send(), 100);
          }}
        />
      </div>

      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <button
            type="button"
            aria-label="Đóng"
            onClick={() => setSheetOpen(false)}
            className="nxx-fade absolute inset-0 bg-slate-900/30"
          />
          <div className="nxx-sheet-in relative w-full max-w-2xl rounded-t-[28px] bg-white px-3 pb-8 pt-3 shadow-[0_-8px_32px_rgba(17,20,24,0.12)]">
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
      <span className="flex-1 text-[15px] font-medium text-[#13141a]">
        {label}
      </span>
      {selected && <Check size={18} className="text-[#13141a]" />}
    </button>
  );
             }
