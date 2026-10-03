import React, { useState } from "react";
import {
  Plus,
  Minus,
  Check,
  Coins,
  Flame,
  CheckCircle2,
  Gamepad2,
} from "lucide-react";
import { useI18n } from "../i18n/index.js";

// ===== Nút =====
export const primaryBtn =
  "inline-flex items-center justify-center gap-2 bg-emerald-500 px-6 py-4 text-[13px] font-extrabold uppercase tracking-[0.18em] text-slate-950 transition hover:bg-emerald-400 active:scale-[0.99]";
export const ghostBtn =
  "inline-flex items-center justify-center gap-2 border-2 border-slate-600/50 bg-slate-900/60 px-6 py-4 text-[13px] font-extrabold uppercase tracking-[0.18em] text-slate-200 transition hover:border-emerald-500/60 hover:text-emerald-300";

// ===== Khung góc (2 góc chéo) =====
export function Corners({ className = "border-emerald-400" }) {
  return (
    <>
      <span
        className={`pointer-events-none absolute -left-px -top-px h-3 w-3 border-l-2 border-t-2 ${className}`}
      />
      <span
        className={`pointer-events-none absolute -bottom-px -right-px h-3 w-3 border-b-2 border-r-2 ${className}`}
      />
    </>
  );
}

export function BrandLogo() {
  return (
    <span className="text-[21px] font-black italic leading-none tracking-[-0.03em] text-white">
      Nxx315 <span className="text-emerald-400">Studio</span>
    </span>
  );
}

// ===== Nhãn đánh số: 001 — TÊN MỤC =====
export function Eyebrow({ index, children }) {
  return (
    <span className="relative inline-flex max-w-full items-center border border-emerald-500/30 bg-emerald-500/5 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-400">
      {index && (
        <span className="mr-2 shrink-0 text-emerald-700/70">{index} —</span>
      )}
      <span className="truncate">{children}</span>
      <Corners />
    </span>
  );
}

export function SectionHead({ index, tag, title, sub, center = false }) {
  return (
    <div className={center ? "text-center" : ""}>
      <Eyebrow index={index}>{tag}</Eyebrow>
      <h2 className="mt-6 text-[34px] font-black italic uppercase leading-[1.08] tracking-[-0.02em] text-white sm:text-5xl">
        {title}
      </h2>
      {sub && (
        <p
          className={`mt-4 max-w-2xl text-[15px] leading-7 text-slate-400 ${
            center ? "mx-auto" : ""
          }`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

// ===== Thẻ tính năng =====
export function BentoCard({
  icon: Icon,
  title,
  desc,
  className = "",
  featured = false,
  children,
}) {
  return (
    <div
      className={`relative flex flex-col border bg-[#0A1020] p-6 transition hover:border-emerald-500/50 ${
        featured
          ? "border-emerald-500/40 shadow-[0_0_40px_-12px_rgba(16,185,129,0.45)]"
          : "border-white/10"
      } ${className}`}
    >
      <span className="flex h-12 w-12 items-center justify-center border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
        <Icon size={20} />
      </span>
      <h3 className="mt-5 text-lg font-black italic uppercase leading-tight tracking-[-0.01em] text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{desc}</p>
      {children && <div className="mt-4 flex flex-wrap gap-2">{children}</div>}
      {featured && <Corners />}
    </div>
  );
}

export function Chip({ children }) {
  return (
    <span className="border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-300">
      {children}
    </span>
  );
}

// ===== Ô tick xanh (mục an toàn) =====
export function SafetyBadge({ icon: Icon, title, desc }) {
  return (
    <div className="flex items-start gap-4 border border-emerald-500/30 bg-emerald-500/5 p-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-emerald-500/15 text-emerald-400">
        <Icon size={18} />
      </span>
      <div>
        <p className="flex items-center gap-2 text-[15px] font-bold text-emerald-300">
          <Check size={15} /> {title}
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-400">{desc}</p>
      </div>
    </div>
  );
}

// ===== Bước với số lớn rỗng ruột =====
export function StepCard({ n, icon: Icon, title, desc, children }) {
  return (
    <div>
      <span className="block select-none text-[84px] font-black italic leading-none text-transparent [-webkit-text-stroke:2px_rgba(16,185,129,0.5)]">
        {n}
      </span>
      <h3 className="mt-3 text-2xl font-black italic uppercase leading-tight tracking-[-0.01em] text-white">
        {title}
      </h3>
      <p className="mt-3 text-[15px] leading-7 text-slate-400">{desc}</p>
      <div className="relative mt-6 border border-emerald-500/20 bg-[#0A1020] p-5">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
            <Icon size={20} />
          </span>
          <div className="flex flex-wrap gap-2">{children}</div>
        </div>
        <Corners />
      </div>
    </div>
  );
}

export function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border bg-[#0A1020] transition ${
        open ? "border-emerald-500/50" : "border-white/10"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-[15px] font-bold text-white">{q}</span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-emerald-500/30 text-emerald-400">
          {open ? <Minus size={15} /> : <Plus size={15} />}
        </span>
      </button>
      {open && (
        <div className="border-t border-white/10 px-5 pb-5 pt-3">
          <p className="text-sm leading-6 text-slate-400">{a}</p>
        </div>
      )}
    </div>
  );
}

// ===== Khung giao diện minh hoạ ở đầu trang (số liệu chỉ là ví dụ) =====
function Tile({ icon: Icon, color, value, label }) {
  return (
    <div className="border border-white/10 bg-white/[0.03] p-3">
      <Icon size={16} className={color} />
      <p className="mt-2 text-xl font-black italic leading-none text-white">
        {value}
      </p>
      <p className="mt-1.5 truncate font-mono text-[9px] uppercase tracking-wider text-slate-500">
        {label}
      </p>
    </div>
  );
}

export function HeroConsole() {
  const { t } = useI18n();
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="pointer-events-none absolute -inset-6 -z-10 bg-emerald-500/10 blur-3xl" />

      <div className="relative overflow-hidden border border-emerald-500/30 bg-[#070D1A] shadow-[0_0_60px_-15px_rgba(16,185,129,0.5)]">
        <div className="flex items-center gap-2 border-b border-white/10 bg-black/40 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-2 truncate bg-white/5 px-3 py-1 font-mono text-[11px] text-slate-400">
            nxx315.top
          </span>
        </div>

        <div className="p-5">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
            {t("ld.mockBalance")}
          </p>
          <div className="mt-3 flex items-end gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center border border-amber-400/30 bg-amber-400/10 text-amber-300">
              <Coins size={22} />
            </span>
            <span className="text-5xl font-black italic leading-none tracking-[-0.03em] text-white">
              1.250
            </span>
            <span className="pb-1 font-mono text-xs uppercase tracking-widest text-emerald-400">
              Coin
            </span>
          </div>
          <div className="mt-5 h-2 bg-white/10">
            <div className="h-full w-3/5 bg-gradient-to-r from-amber-400 to-emerald-400" />
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <Tile
              icon={CheckCircle2}
              color="text-emerald-400"
              value="+50"
              label={t("dash.qaTasks")}
            />
            <Tile
              icon={Flame}
              color="text-amber-400"
              value="7"
              label={t("ld.mockStreak")}
            />
            <Tile
              icon={Gamepad2}
              color="text-violet-400"
              value="3"
              label={t("dash.minigame")}
            />
          </div>
        </div>
      </div>

      <span className="absolute -top-3 right-2 border border-emerald-500/40 bg-[#050A14] px-3 py-1.5 font-mono text-[11px] font-bold text-emerald-300">
        +50 COIN
      </span>

      <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-slate-600">
        {t("ld.mockNote")}
      </p>
    </div>
  );
}

// Giữ tên cũ để file trang cũ vẫn build được
export const HeroPreview = HeroConsole;
