import React from "react";
import { ChevronRight } from "lucide-react";
import { useI18n } from "../../i18n/index.js";
import { SectionTitle } from "./StoreCards.jsx";
import {
  PACKAGES as ROBLOX,
  DRAFT_KEY,
  formatCoin,
} from "../../lib/robloxData.js";
import { PACKAGES as LIENQUAN } from "../../lib/lienquanData.js";
import { PACKAGES as FREEFIRE } from "../../lib/freefireData.js";

const ITEMS = [
  ...ROBLOX.map((p) => ({
    key: p.id,
    game: "Roblox",
    path: "/store/roblox",
    title: `${p.robux} Robux`,
    sub: `Roblox · ${p.method}`,
    price: p.price,
    image: p.image,
    draftId: p.id,
  })),
  ...LIENQUAN.map((p) => ({
    key: p.id,
    game: "Liên Quân Mobile",
    path: "/store/lien-quan",
    title: `${p.quanhuy} Quân Huy`,
    sub: "Liên Quân Mobile",
    price: p.amount,
    image: p.image,
  })),
  ...FREEFIRE.map((p) => ({
    key: p.id,
    game: "Free Fire",
    path: "/store/free-fire",
    title: `${p.diamond} Kim Cương`,
    sub: "Free Fire",
    price: p.amount,
    image: p.image,
  })),
];

export default function ForYouPackages({ coins, navigate }) {
  const { lang } = useI18n();
  const en = lang === "en";

  if (coins == null) return null;
  const balance = Number(coins) || 0;

  // Gói lớn nhất đổi được cho mỗi game, hiện tối đa 3 game
  const best = {};
  for (const it of ITEMS) {
    if (it.price <= balance && (!best[it.game] || it.price > best[it.game].price)) {
      best[it.game] = it;
    }
  }
  const affordable = Object.values(best)
    .sort((a, b) => b.price - a.price)
    .slice(0, 3);

  // Gói rẻ nhất còn thiếu Coin
  const next = ITEMS.filter((i) => i.price > balance).sort(
    (a, b) => a.price - b.price
  )[0];

  if (affordable.length === 0 && !next) return null;

  const pick = (it) => {
    if (it.draftId) {
      try {
        const old = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "{}");
        sessionStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ ...old, packageId: it.draftId })
        );
      } catch {}
    }
    navigate(it.path);
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
        {affordable.map((it) => (
          <button
            key={it.key}
            type="button"
            onClick={() => pick(it)}
            className="flex w-full items-center justify-between rounded-2xl border border-emerald-200 bg-white px-3 py-3 text-left shadow-sm transition active:scale-[0.99]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={it.image}
                alt=""
                className="h-11 w-11 shrink-0 rounded-xl object-cover"
                loading="lazy"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">
                  {it.title}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">{it.sub}</p>
              </div>
            </div>
            <div className="ml-3 flex shrink-0 items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-mono text-[11px] font-extrabold text-emerald-700">
                {formatCoin(it.price)}
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
              <span className="font-bold text-slate-900">{next.title}</span>
              <span className="text-slate-400"> ({next.game})</span>
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
