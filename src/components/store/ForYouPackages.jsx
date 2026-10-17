import React from "react";
import { ChevronRight } from "lucide-react";
import { useI18n } from "../../i18n/index.js";
import { SectionTitle } from "./StoreCards.jsx";
import { PACKAGES, DRAFT_KEY, formatCoin } from "../../lib/robloxData.js";

const ROBLOX_PATH = "/store/roblox";

export default function ForYouPackages({ coins, navigate }) {
  const { lang } = useI18n();
  const en = lang === "en";

  if (coins == null) return null;
  const balance = Number(coins) || 0;

  const sorted = [...PACKAGES].sort((a, b) => a.price - b.price);
  // Gói đổi được ngay: đắt nhất lên trước, tối đa 3
  const affordable = sorted.filter((p) => p.price <= balance).reverse().slice(0, 3);
  // Gói rẻ nhất còn thiếu Coin
  const next = sorted.find((p) => p.price > balance);

  if (affordable.length === 0 && !next) return null;

  const pick = (p) => {
    try {
      const old = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "{}");
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...old, packageId: p.id }));
    } catch {}
    navigate(ROBLOX_PATH);
  };

  return (
    <section>
      <SectionTitle
        accent={en ? "Packages" : "Gói"}
        rest={en ? "for you" : "dành cho bạn"}
        right={
          <span className="pb-0.5 font-mono text-[11px] text-slate-400">
            {formatCoin(balance)}
          </span>
        }
      />

      <div className="space-y-2.5">
        {affordable.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => pick(p)}
            className="flex w-full items-center justify-between rounded-2xl border border-emerald-200 bg-white px-3 py-3 text-left shadow-sm transition active:scale-[0.99]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={p.image}
                alt=""
                className="h-11 w-11 shrink-0 rounded-xl object-cover"
                loading="lazy"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">
                  {p.robux} Robux
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Roblox · {p.method}
                </p>
              </div>
            </div>
            <div className="ml-3 flex shrink-0 items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-mono text-[11px] font-extrabold text-emerald-700">
                {formatCoin(p.price)}
              </span>
              <ChevronRight size={16} className="text-slate-300" />
            </div>
          </button>
        ))}

        {next && (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-sm text-slate-700">
              {en ? "Need " : "Còn thiếu "}
              <span className="font-bold text-slate-900">
                {formatCoin(next.price - balance)}
              </span>
              {en ? " more to redeem " : " nữa để đổi "}
              <span className="font-bold text-slate-900">
                {next.robux} Robux
              </span>
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    Math.floor((balance / next.price) * 100)
                  )}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
