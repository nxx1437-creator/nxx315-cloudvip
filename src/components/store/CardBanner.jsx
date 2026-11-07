// src/components/store/CardBanner.jsx — khối "Đổi xu thành thẻ cào" trong trang Cửa hàng
import React, { useState } from "react";
import { CreditCard } from "lucide-react";
import { getImageUrl } from "../../lib/storeData.js";
import { useI18n } from "../../i18n/index.js";

const TXT = {
  vi: {
    kicker: "Đổi xu thành ",
    title: "Thẻ cào điện thoại",
    desc: "Thẻ từ 10.000đ, nhận mã ngay",
    btn: "Đổi",
  },
  en: {
    kicker: "Exchange Coins For ",
    title: "Phone cards",
    desc: "Cards from 10,000đ, get your code instantly",
    btn: "Redeem",
  },
};

const TELCOS = [
  { id: "viettel", name: "Viettel", logoFile: "viettel-icon.png" },
  { id: "mobifone", name: "Mobifone", logoFile: "mobifone-icon.png" },
  { id: "vinaphone", name: "Vinaphone", logoFile: "vinaphone-icon.png" },
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
      <div className="overflow-hidden rounded-[28px] bg-[#fbfaf7] p-4 font-['JetBrains_Mono',ui-monospace,monospace] text-[#171612]">
        <button
          type="button"
          onClick={() => navigate("/cards")}
          className="flex w-full items-center gap-4 pb-4 text-left active:opacity-80"
        >
          <div className="min-w-0 flex-1">
            <p className="text-[10.5px] uppercase tracking-[0.2em] text-[#8a8880]">{s.kicker}</p>
            <h3 className="mt-2 text-[22px] font-bold lowercase leading-[1.15]">
              {s.title}
              <span className="text-[#ff5a00]">.</span>
            </h3>
            <p className="mt-2 text-[12px] leading-5 text-[#8a8880]">{s.desc}</p>
          </div>

          {/* Ô họa tiết chấm */}
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#f6f5f1]">
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                backgroundImage: "radial-gradient(#d6d4cc 1.1px, transparent 1.3px)",
                backgroundSize: "9px 9px",
              }}
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                backgroundImage: "radial-gradient(#ff5a00 1.2px, transparent 1.4px)",
                backgroundSize: "9px 9px",
                WebkitMaskImage: "linear-gradient(to bottom right, transparent 20%, #000 100%)",
                maskImage: "linear-gradient(to bottom right, transparent 20%, #000 100%)",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                <CreditCard size={20} strokeWidth={1.75} />
              </span>
            </div>
          </div>
        </button>

        <div className="space-y-2">
          {TELCOS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => navigate(`/cards?telco=${t.id}`)}
              className="flex w-full items-center gap-3 rounded-2xl bg-[#f6f5f1] p-3 text-left active:opacity-80"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white">
                <Thumb
                  src={getImageUrl(t.logoFile)}
                  alt={t.name}
                  className="h-7 w-7 object-contain"
                  fallback={<span className="text-[16px] font-bold">{t.name.charAt(0)}</span>}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-bold leading-tight">{t.name}</p>
                <p className="mt-1 truncate text-[11.5px] leading-tight text-[#8a8880]">{s.desc}</p>
              </div>
              <span className="shrink-0 rounded-full bg-[#171612] px-4 py-2 text-[12px] font-bold lowercase text-white">
                {s.btn}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
                  }
