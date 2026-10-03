import React, { useState } from "react";
import {
  Plus,
  Minus,
  Bell,
  Coins,
  Flame,
  TrendingUp,
  CheckCircle2,
  Home,
  ListChecks,
  Gift,
  Wallet,
  User,
} from "lucide-react";
import { useI18n } from "../i18n/index.js";

export function BrandLogo({ small = false }) {
  return (
    <span
      className={`font-['Baloo_2',sans-serif] font-extrabold leading-none tracking-tight text-slate-900 ${
        small ? "text-[15px]" : "text-[22px]"
      }`}
    >
      Nxx315 <span className="text-[#087EA4]">Studio</span>
    </span>
  );
}

export function SectionHead({ tag, title, sub, center = false }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#087EA4]">
        {tag}
      </span>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
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
  teal: "bg-[#E6F3F7] text-[#087EA4]",
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
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F3F7] text-[#087EA4]">
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
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E6F3F7] text-slate-500">
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

// Khung điện thoại mô phỏng giao diện (số liệu chỉ là ví dụ)
export function PhoneMock() {
  const { t } = useI18n();
  return (
    <div className="relative mx-auto w-[268px] sm:w-[288px]">
      <div className="rounded-[2.4rem] border-[7px] border-slate-900 bg-slate-900 shadow-2xl shadow-[#087EA4]/25">
        <div className="overflow-hidden rounded-[1.9rem] bg-[#F5F7FB]">
          <div className="flex items-center justify-between bg-white px-4 py-3">
            <BrandLogo small />
            <Bell size={15} className="text-slate-400" />
          </div>

          <div className="space-y-2.5 p-3.5">
            <div className="rounded-2xl bg-gradient-to-br from-[#087EA4] to-[#0DB4A0] p-3.5 text-white">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/75">
                {t("ld.mockBalance")}
              </p>
              <div className="mt-1.5 flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                  <Coins size={19} className="text-amber-200" />
                </span>
                <span className="text-2xl font-extrabold leading-none">
                  1.250
                </span>
                <span className="text-xs text-white/70">Coin</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/25">
                <div className="h-full w-3/5 rounded-full bg-white" />
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl bg-white p-2.5 shadow-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E6F3F7] text-[#087EA4]">
                <CheckCircle2 size={16} />
              </span>
              <span className="flex-1 truncate text-xs font-semibold text-slate-700">
                {t("ld.f1t")}
              </span>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-600">
                +50
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl bg-amber-50 p-2.5">
                <Flame size={16} className="text-amber-500" />
                <p className="mt-1.5 text-lg font-extrabold leading-none text-slate-900">
                  7
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  {t("ld.mockStreak")}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-2.5">
                <TrendingUp size={16} className="text-emerald-600" />
                <p className="mt-1.5 text-lg font-extrabold leading-none text-slate-900">
                  Lv 3
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  {t("ld.f4t")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                ["🎡", "dash.wheel"],
                ["🎫", "dash.scratch"],
                ["🎲", "dash.dice"],
              ].map(([emoji, key]) => (
                <div
                  key={key}
                  className="rounded-xl bg-white py-2 text-center shadow-sm"
                >
                  <p className="text-base">{emoji}</p>
                  <p className="mt-0.5 truncate px-1 text-[9px] font-semibold text-slate-500">
                    {t(key)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-around border-t border-slate-100 bg-white py-2.5">
            {[Home, ListChecks, Gift, Wallet, User].map((Icon, i) => (
              <Icon
                key={i}
                size={16}
                className={i === 0 ? "text-[#087EA4]" : "text-slate-300"}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ld-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @media (prefers-reduced-motion: no-preference) { .ld-float { animation: ld-float 4s ease-in-out infinite; } }
      `}</style>
      <span className="ld-float absolute -right-3 top-10 hidden rounded-full bg-white px-3 py-1.5 text-xs font-bold text-amber-600 shadow-lg sm:block">
        +50 Coin
      </span>
      <span className="ld-float absolute -left-4 bottom-20 hidden rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-lg sm:block">
        🔥 {t("ld.mockStreak")}
      </span>

      <p className="mt-4 text-center text-[11px] text-slate-400">
        {t("ld.mockNote")}
      </p>
    </div>
  );
}
