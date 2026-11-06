// src/components/store/CardBanner.jsx — khối "Đổi xu thành thẻ cào" trong trang Cửa hàng (thay WithdrawBanner)
import React, { useState } from "react";
import { ChevronRight, CreditCard } from "lucide-react";
import { getImageUrl } from "../../lib/storeData.js";
import { useI18n } from "../../i18n/index.js";

const TXT = {
  vi: {
    kicker: "Đổi xu thành thẻ cào",
    title: "Thẻ cào điện thoại",
    desc: "Thẻ từ 10.000đ, nhận mã ngay",
    btn: "Đổi",
  },
  en: {
    kicker: "Turn Coins into phone cards",
    title: "Phone cards",
    desc: "Cards from 10,000đ, get your code instantly",
    btn: "Redeem",
  },
};

const TELCOS = [
  { id: "viettel", name: "Viettel", color: "#E2231A", logoFile: "viettel-icon.png" },
  { id: "mobifone", name: "Mobifone", color: "#0067B1", logoFile: "mobifone-icon.png" },
  { id: "vinaphone", name: "Vinaphone", color: "#00A1E4", logoFile: "vinaphone-icon.png" },
];

function Thumb({ src, alt = "", fallback, className = "" }) {
  const [error, setError] = useState(false);
  if (error || !src) return fallback;
  return <img src={src} alt={alt} loading="lazy" className={className} onError={() => setError(true)} />;
}

export default function CardBanner({ navigate }) {
  const { lang } = useI18n();
  const s = TXT[lang] || TXT.vi;

  return (
    <section>
      <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-b from-emerald-50 via-teal-50/50 to-white p-3 shadow-sm">
        <button
          type="button"
          onClick={() => navigate("/cards")}
          className="group flex w-full items-center gap-3 px-2 pb-4 pt-1 text-left transition active:opacity-80"
        >
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-700">
              {s.kicker}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <h3 className="text-[22px] font-black leading-tight tracking-[-0.02em] text-slate-900">{s.title}</h3>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm transition group-hover:bg-emerald-50">
                <ChevronRight size={14} className="text-slate-700" strokeWidth={2.8} />
              </span>
            </div>
            <p className="mt-1 text-[12.5px] text-slate-500">{s.desc}</p>
          </div>
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm">
            <CreditCard size={36} className="text-white" strokeWidth={2.2} />
          </div>
        </button>

        <div className="space-y-2">
          {TELCOS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => navigate(`/cards?telco=${t.id}`)}
              className="group flex w-full items-center gap-3 rounded-xl border border-white bg-white/90 p-3 text-left shadow-sm transition hover:border-emerald-200 hover:shadow-md active:scale-[0.99]"
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${t.color}14` }}
              >
                <Thumb
                  src={getImageUrl(t.logoFile)}
                  alt={t.name}
                  className="h-7 w-7 object-contain"
                  fallback={
                    <span className="text-[17px] font-black" style={{ color: t.color }}>
                      {t.name.charAt(0)}
                    </span>
                  }
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14.5px] font-bold leading-tight text-slate-900">{t.name}</p>
                <p className="mt-0.5 truncate text-[12px] leading-tight text-slate-500">{s.desc}</p>
              </div>
              <span className="shrink-0 rounded-lg bg-slate-100 px-3.5 py-2 font-mono text-[11px] font-extrabold uppercase tracking-wider text-slate-700 transition group-hover:bg-emerald-600 group-hover:text-white">
                {s.btn}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
