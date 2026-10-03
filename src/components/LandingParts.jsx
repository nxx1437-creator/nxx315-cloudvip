import React, { useState } from "react";
import {
  Plus,
  Minus,
  Coins,
  Flame,
  CheckCircle2,
  Gamepad2,
} from "lucide-react";
import { useI18n } from "../i18n/index.js";

export const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-teal-600/25 transition hover:bg-teal-700 active:scale-[0.99]";
export const ghostBtn =
  "inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50";

export function BrandLogo() {
  return (
    <span className="font-['Baloo_2',sans-serif] text-[22px] font-extrabold leading-none tracking-tight text-slate-900">
      Nxx315 <span className="text-teal-600">Studio</span>
    </span>
  );
}

export function SectionHead({ tag, title, sub, center = false }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className="text-xs font-bold uppercase tracking-[0.15em] text-teal-600">
        {tag}
      </span>
      <h2 className="mt-3 text-[28px] font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h2>
      {sub && (
        <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
          {sub}
        </p>
      )}
    </div>
  );
}

const TINTS = {
  teal: "bg-teal-50 text-teal-600",
  amber: "bg-amber-50 text-amber-600",
  violet: "bg-violet-50 text-violet-600",
  rose: "bg-rose-50 text-rose-500",
  sky: "bg-sky-50 text-sky-600",
  emerald: "bg-emerald-50 text-emerald-600",
};

export function BentoCard({
  icon: Icon,
  tint = "teal",
  title,
  desc,
  className = "",
  children,
}) {
  return (
    <div
      className={`flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${className}`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${TINTS[tint]}`}
      >
        <Icon size={19} />
      </div>
      <h3 className="mt-4 text-[15px] font-bold text-slate-950">{title}</h3>
      <p className="mt-1.5 text-sm leading-6 text-slate-500">{desc}</p>
      {children && <div className="mt-4 flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function Chip({ children }) {
  return (
    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
      {children}
    </span>
  );
}

export function SafetyBadge({ icon: Icon, title, desc }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

export function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-slate-900 sm:text-base">
          {q}
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-slate-500">
          {open ? <Minus size={15} /> : <Plus size={15} />}
        </span>
      </button>
      {open && (
        <div className="border-t border-slate-100 px-5 pb-5 pt-3">
          <p className="text-sm leading-6 text-slate-600">{a}</p>
        </div>
      )}
    </div>
  );
}

// Thẻ minh hoạ ở đầu trang (số liệu chỉ là ví dụ)
function MiniCard({ icon: Icon, tint, value, label }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${tint}`}
      >
        <Icon size={16} />
      </span>
      <p className="mt-2 text-base font-extrabold leading-none text-slate-900">
        {value}
      </p>
      <p className="mt-1 truncate text-[11px] text-slate-500">{label}</p>
    </div>
  );
}

export function HeroPreview() {
  const { t } = useI18n();
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-emerald-200/50 via-teal-100/40 to-cyan-200/50 blur-2xl" />

      <div className="rounded-3xl bg-gradient-to-br from-teal-600 to-emerald-500 p-5 text-white shadow-xl shadow-teal-600/20">
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-white/75">
          <span>{t("ld.mockBalance")}</span>
          <span>Lv 3</span>
        </div>
        <div className="mt-2.5 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
            <Coins size={22} className="text-amber-200" />
          </span>
          <span className="text-4xl font-extrabold leading-none">1.250</span>
          <span className="text-sm text-white/70">Coin</span>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/25">
          <div className="h-full w-3/5 rounded-full bg-white" />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <MiniCard
          icon={CheckCircle2}
          tint="bg-teal-50 text-teal-600"
          value="+50"
          label={t("dash.qaTasks")}
        />
        <MiniCard
          icon={Flame}
          tint="bg-amber-50 text-amber-500"
          value="7"
          label={t("ld.mockStreak")}
        />
        <MiniCard
          icon={Gamepad2}
          tint="bg-violet-50 text-violet-600"
          value="3"
          label={t("dash.minigame")}
        />
      </div>

      <p className="mt-3 text-center text-[11px] text-slate-400">
        {t("ld.mockNote")}
      </p>
    </div>
  );
              }
