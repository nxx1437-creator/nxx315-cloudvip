import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import {
  FeaturedRow,
  GameCard,
} from "../components/store/StoreParts.jsx";
import {
  WithdrawBanner,
  StoreHistoryPreview,
} from "../components/store/StoreExtras.jsx";
import { GAMES, trackGameView } from "../lib/storeData.js";
import { useI18n } from "../i18n/index.js";

export default function Store() {
  const { t, lang } = useI18n();
  const en = lang === "en";
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const tabs = useMemo(
    () => [
      { id: "all", key: "st.tabAll", count: GAMES.length },
      { id: "hot", key: "st.tabHot", count: GAMES.filter((g) => g.hot).length },
      {
        id: "mobile",
        key: "st.tabMobile",
        count: GAMES.filter((g) => g.category === "mobile").length,
      },
      {
        id: "pc",
        key: "st.tabPc",
        count: GAMES.filter((g) => g.category === "pc").length,
      },
    ],
    []
  );

  const filteredGames = useMemo(
    () =>
      GAMES.filter((game) =>
        activeTab === "all"
          ? true
          : activeTab === "hot"
          ? game.hot
          : game.category === activeTab
      ),
    [activeTab]
  );

  const handleGameClick = (game) => {
    trackGameView(game.id);
    navigate(game.path);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-['Be_Vietnam_Pro',sans-serif] text-slate-900">
      <TopHeader />

      {/* ĐÃ SỬA: pb-24 để giống ảnh 19:16 (thanh BottomNav sẽ che mất một phần thẻ game bên dưới) */}
      <main className="mx-auto max-w-5xl space-y-7 px-4 py-4 pb-24">
        <FeaturedRow
          navigate={navigate}
          onTitleClick={() =>
            document
              .getElementById("store-list")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        />

        <section id="store-list">
          <div className="mb-3 flex items-end justify-between gap-3">
            <h2 className="text-xl font-extrabold leading-tight text-slate-900">
              <span className="text-emerald-600">
                {en ? "Game" : "Danh sách"}
              </span>{" "}
              {en ? "categories" : "game"}
            </h2>
            <span className="pb-0.5 font-mono text-[11px] text-slate-400">
              {t("st.count", { n: filteredGames.length })}
            </span>
          </div>

          <div className="mb-4 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 font-mono text-[11px] font-extrabold uppercase tracking-wider transition ${
                    active
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-slate-500 shadow-sm"
                  }`}
                >
                  {t(tab.key)}
                  <span className={active ? "text-emerald-100" : "text-slate-400"}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {filteredGames.length > 0 ? (
            <div className="grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-4 lg:grid-cols-6">
              {filteredGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onClick={handleGameClick}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center">
              <Search size={30} className="mx-auto mb-2 text-slate-300" />
              <p className="font-bold text-slate-700">{t("st.noGame")}</p>
            </div>
          )}
        </section>

        <WithdrawBanner navigate={navigate} />
        <StoreHistoryPreview />
      </main>

      <BottomNav />
    </div>
  );
      }
