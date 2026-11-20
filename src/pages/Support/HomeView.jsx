// src/pages/Support/HomeView.jsx — trang chủ chat AI (giao diện kiểu Cofounder)
import React, { useRef, useState } from "react";
import { ArrowLeft, ArrowUp, Check, ChevronDown, Headphones, Loader2, Sparkles, User, CreditCard, Package, Bug, MoreHorizontal } from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";
import { getGreeting, getSuggestions } from "./helpers.js";
import { CATEGORIES, SUPPORT, SYSTEM_BANNER } from "./constants.js";
import BannerNotice from "./BannerNotice.jsx";
import HomeGuides from "./HomeGuides.jsx";
import { SupportTiles, Statement, Features, FinalCard } from "./HomeSections.jsx";
import HomeDemo from "./HomeDemo.jsx";
import { PixelScene } from "../help/HelpPixel.jsx";
import "./chat-effects.css";
import "./home-input.css";
import "./chat-cofounder.css";
import "./home-cofounder.css";

const ICON_COMPONENTS = { User, CreditCard, Package, Bug, MoreHorizontal };
const FALLBACK_CATEGORY = CATEGORIES.find((c) => c.label === "Khác")?.id || null;

export default function HomeView({ user, onOpenHelp, onStartChat }) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const taRef = useRef(null);

  const cat = CATEGORIES.find((c) => c.id === category) || null;
  const PillIcon = (cat && ICON_COMPONENTS[cat.icon]) || Sparkles;
  const canSend = text.trim().length > 0 && !sending;

  const resize = (el) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };
  
  const handleChange = (e) => {
    setText(e.target.value);
    resize(e.target);
  };

  const send = async (overrideText, overrideCat) => {
    const msg = (typeof overrideText === "string" ? overrideText : text).trim();
    if (!msg || sending) return;

    setSending(true);
    setErr("");
    const catId = (overrideCat !== undefined ? overrideCat : category) || FALLBACK_CATEGORY;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const fnToCall = typeof onStartChat === "function"
        ? onStartChat
        : async (payload) => {
            if (!user?.id) throw new Error("Chưa đăng nhập.");
            const { data: conv, error: convError } = await supabase
              .from("support_conversations")
              .insert({
                user_id: user.id,
                title: payload.category ? `Hỗ trợ ${payload.category}` : "Cuộc trò chuyện mới",
                category: payload.category,
                status: "ai",
              })
              .select()
              .single();
            if (convError) throw new Error("Lỗi tạo chat: " + convError.message);

            const { error: msgError } = await supabase.from("support_messages").insert({
              conversation_id: conv.id,
              user_id: user.id,
              message: getGreeting(payload.category),
              sender_type: "ai",
              suggestions: getSuggestions(payload.category),
            });
            if (msgError) throw new Error("Lỗi tạo tin nhắn: " + msgError.message);

            window.dispatchEvent(
              new CustomEvent("nxx-start-chat", {
                detail: { conversation: conv, category: payload.category, firstText: payload.text },
              })
            );
            return { ok: true };
          };

      const r = await fnToCall({ text: msg, category: catId, signal: controller.signal });
      if (r && r.error) setErr("LỖI: " + r.error);
    } catch (e) {
      if (e.name === "AbortError") {
        setErr("LỖI: Quá 8 giây không phản hồi. Vui lòng kiểm tra mạng và thử lại.");
      } else {
        setErr("LỖI HỆ THỐNG: " + e.message);
      }
    } finally {
      clearTimeout(timeoutId);
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

  const focusComposer = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => taRef.current?.focus({ preventScroll: true }), 380);
  };

  const tryExample = ({ text: t, category: c }) => {
    setText(t);
    setCategory(c);
    setTimeout(() => resize(taRef.current), 0);
    focusComposer();
  };

  return (
    <div className="nxx-skin nxh min-h-[calc(100vh-72px)] pb-6">
      {SYSTEM_BANNER.enabled && <BannerNotice />}

      <div className="px-3 pt-2">
        <section className="nxh-hero">
          <PixelScene className="nxh-art" kind="meadow" seed={5} />
          <div className="nxh-hero-in">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.history.back()}
                aria-label="Quay lại"
                className="nxx-sqbtn"
                style={{ background: "rgba(255,255,255,.2)", borderColor: "rgba(255,255,255,.4)", color: "#fff" }}
              >
                <ArrowLeft size={19} strokeWidth={2.2} />
              </button>
              <span className="text-[17px] font-medium tracking-[-0.01em]">NXX Support</span>
            </div>

            <div className="mt-6 flex flex-col gap-3.5">
              <h1>NXX giải quyết vấn đề của bạn trong vài phút.</h1>
              <p>Hỏi nhanh hoặc chọn chủ đề, trợ lý AI sẽ hỗ trợ bạn chính xác hơn.</p>
            </div>

            <div className="nxh-glasscard mt-2">
              <div
                className={`nxx-composer nxx-composer--hero ${sending ? "is-busy" : ""}`}
                style={{ minHeight: 0, padding: "14px 14px 10px", gap: 6, border: 0, boxShadow: "none", background: "transparent" }}
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
                  className="block max-h-[120px] min-h-[44px] w-full flex-1 resize-none bg-transparent text-[16px] leading-6 text-[#2b2b2b] outline-none placeholder:text-[#a2a29b]"
                />
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => setSheetOpen(true)} className="nxx-chip">
                    <PillIcon size={17} strokeWidth={2.2} style={{ color: cat?.color || "#8a5cff" }} />
                    {cat ? cat.label : "Chọn chủ đề"}
                    <ChevronDown size={16} className="text-[#8b8b84]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => send()}
                    disabled={!canSend}
                    aria-label="Gửi"
                    className={`nxx-iconbtn h-10 w-10 text-white ${canSend ? "bg-[#2b2b2b]" : "bg-[#cfcfc8]"}`}
                  >
                    {sending ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={18} strokeWidth={2.6} />}
                  </button>
                </div>
              </div>
            </div>

            {err && (
              <p
                className="rounded-xl bg-red-50 p-3 text-center text-[14px] font-bold leading-5 !text-red-600"
                style={{ textShadow: "none" }}
              >
                {err}
              </p>
            )}

            <div>
              <a href={SUPPORT.zaloUrl} target="_blank" rel="noopener noreferrer" className="nxh-btn glass">
                <Headphones size={17} />
                Gặp nhân viên qua Zalo
              </a>
            </div>
          </div>
        </section>
      </div>

      <div className="nxh-sec" style={{ paddingTop: 40 }}>
        <div className="nxh-eyebrow">Hỗ trợ {SUPPORT.hours}</div>
        <SupportTiles />
      </div>
      <Statement />
      <HomeDemo onTry={tryExample} />
      <Features onStart={focusComposer} />

      <HomeGuides onOpenHelp={onOpenHelp} onPickTopic={(title, catId) => send(title, catId)} />
      <FinalCard onStart={focusComposer} />

      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <button type="button" aria-label="Đóng" onClick={() => setSheetOpen(false)} className="nxx-fade absolute inset-0 bg-slate-900/30" />
          <div className="nxx-sheet-in relative w-full max-w-2xl rounded-t-[28px] bg-[#fbfbf8] px-3 pb-8 pt-3 shadow-[0_-8px_32px_rgba(17,20,24,0.12)]">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200" />
            <SheetRow label="Tất cả chủ đề" Icon={Sparkles} color="#8a5cff" selected={!cat} onClick={() => pick(null)} />
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
      className={`flex w-full items-center gap-3 rounded-[14px] px-4 py-3.5 text-left transition active:opacity-70 ${selected ? "bg-[#f2f2ee]" : ""}`}
    >
      <Icon size={20} strokeWidth={2.1} style={{ color }} />
      <span className="flex-1 text-[15px] font-medium text-[#2b2b2b]">{label}</span>
      {selected && <Check size={18} className="text-[#2b2b2b]" />}
    </button>
  );
  }
