// src/components/store/CardBanner.jsx — khối "Đổi xu thành thẻ cào" trong trang Cửa hàng
import React, { useState } from "react";
import { ChevronRight, CreditCard } from "lucide-react";
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
    kicker: "Turn Coins into phone cards",
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
      <div className="border border-[#e5e5e5] bg-white">
        <button
          type="button"
          onClick={() => navigate("/cards")}
          className="group flex w-full items-center gap-4 border-b border-[#e5e5e5] p-4 text-left transition active:bg-[#f6f8f7]"
        >
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-extralight uppercase tracking-wide text-black">
              {s.kicker}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <h3 className="text-[24px] font-light leading-[1.15] text-black">{s.title}</h3>
              <ChevronRight size={18} className="text-black" strokeWidth={1.25} />
            </div>
            <p className="mt-2 text-[13px] font-extralight leading-[1.5] text-black">{s.desc}</p>
          </div>
          <div className="flex h-20 w-20 shrink-0 items-center justify-center border border-black bg-white">
            <CreditCard size={36} className="text-black" strokeWidth={1} />
          </div>
        </button>

        <div className="divide-y divide-[#e5e5e5]">
          {TELCOS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => navigate(`/cards?telco=${t.id}`)}
              className="group flex w-full items-center gap-4 p-4 text-left transition hover:bg-[#f6f8f7] active:bg-[#f6f8f7]"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#e5e5e5] bg-white">
                <Thumb
                  src={getImageUrl(t.logoFile)}
                  alt={t.name}
                  className="h-7 w-7 object-contain"
                  fallback={
                    <span className="text-[17px] font-light text-black">{t.name.charAt(0)}</span>
                  }
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[19px] font-light leading-[1.15] text-black">{t.name}</p>
                <p className="mt-1 truncate text-[13px] font-extralight text-black">{s.desc}</p>
              </div>
              <span className="shrink-0 border border-black px-4 py-2 text-[13px] font-light uppercase tracking-wide text-black transition group-hover:bg-black group-hover:text-white">
                {s.btn}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
              }
