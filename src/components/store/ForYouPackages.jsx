import React, { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";
import { useI18n } from "../../i18n/index.js";
import { SectionTitle } from "./StoreCards.jsx";

const CATEGORY_LABEL = { quanhuy: "Quân Huy", robux: "Robux" };
const REDEEM_PATH = "/shop-earn";

export default function ForYouPackages({ coins, navigate }) {
  const { lang } = useI18n();
  const en = lang === "en";
  const [pkgs, setPkgs] = useState(null);

  useEffect(() => {
    let alive = true;
    supabase
      .from("redemption_packages")
      .select("id, name, category, coin_cost, version")
      .eq("active", true)
      .order("coin_cost", { ascending: true })
      .then(({ data }) => {
        if (alive) setPkgs(data || []);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!pkgs || pkgs.length === 0 || typeof coins !== "number") return null;

  const fmt = (n) => Number(n).toLocaleString(en ? "en-US" : "vi-VN");
  const unit = en ? "coins" : "xu";

  const affordable = pkgs
    .filter((p) => p.coin_cost <= coins)
    .sort((a, b) => b.coin_cost - a.coin_cost)
    .slice(0, 3);
  const next = pkgs.find((p) => p.coin_cost > coins);

  if (affordable.length === 0 && !next) return null;

  return (
    <section>
      <SectionTitle
        accent={en ? "Packages" : "Gói"}
        rest={en ? "for you" : "dành cho bạn"}
        right={
          <span className="pb-0.5 font-mono text-[11px] text-slate-400">
            {fmt(coins)} {unit}
          </span>
        }
      />

      <div className="space-y-2.5">
        {affordable.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => navigate(REDEEM_PATH)}
            className="flex w-full items-center justify-between rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-left shadow-sm transition active:scale-[0.99]"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">
                {p.name}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                {CATEGORY_LABEL[p.category] || p.category}
                {p.version ? ` · ${p.version}` : ""}
              </p>
            </div>
            <div className="ml-3 flex shrink-0 items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-mono text-[11px] font-extrabold text-emerald-700">
                {fmt(p.coin_cost)} {unit}
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
                {fmt(next.coin_cost - coins)} {unit}
              </span>
              {en ? " more to redeem " : " nữa để đổi "}
              <span className="font-bold text-slate-900">{next.name}</span>
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    Math.floor((coins / next.coin_cost) * 100)
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
