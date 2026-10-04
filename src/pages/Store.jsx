import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Coins, Plus } from "lucide-react";

import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import useProfile from "../hooks/useProfile.js";
import { SectionLabel } from "../components/home/HomeSections.jsx";
import {
  GameCard,
  StoreSearch,
  BannerSlideshow,
} from "../components/store/StoreParts.jsx";
import {
  WithdrawBanner,
  StoreHistoryPreview,
} from "../components/store/StoreExtras.jsx";
import {
  GAMES,
  getRecommendedGames,
  trackGameView,
  locale,
} from "../lib/storeData.js";
import { useI18n } from "../i18n/index.js";

export default function Store() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { profile } = useProfile();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    setRecommended(getRecommendedGames(4));
  }, []);

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

  const filteredGames = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return GAMES.filter((game) => {
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "hot" ? game.hot : game.category === activeTab);
      const matchesSearch =
        !keyword || game.name.toLowerCase().includes(keyword);
      return matchesTab && matchesSearch;
    });
  }, [search, activeTab]);

  const handleGameClick = (game) => {
    trackGameView(game.id);
    navigate(game.path);
  };

  const clearFilters = () => {
    setSearch("");
    setActiveTab("all");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-['Be_Vietnam_Pro',sans-serif] text-slate-900">
      <TopHeader />

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-4">
        {/* Số dư Coin + nút kiếm thêm */}
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-600 to-teal-500 p-4 text-white shadow-md shadow-emerald-600/20">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Coins size={22} className="text-amber-200" />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/75">
                {t("st.balance")}
              </p>
              <p className="truncate text-2xl font-black leading-tight">
                {Number(profile?.coins || 0).toLocaleString(locale(lang))}
                <span className="ml-1.5 font-mono text-xs font-medium uppercase tracking-widest text-white/75">
                  {t("dash.coin")}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/tasks")}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-3.5 py-2.5 font-mono text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 transition hover:bg-emerald-50 active:scale-[0.98]"
          >
            <Plus size={14} /> {t("st.earnMore")}
          </button>
        </div>

        <StoreSearch
          search={search}
          setSearch={setSearch}
          onSelect={handleGameClick}
        />

        <BannerSlideshow navigate={navigate} />

        {/* Dành cho bạn */}
        {recommended.length > 0 && !search && (
          <section>
            <SectionLabel>{t("st.forYou")}</SectionLabel>
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {recommended.map((game) => (
                <div key={game.id} className="w-[150px] shrink-0 sm:w-[170px]">
                  <GameCard game={game} onClick={handleGameClick} />
                </div>
              ))}
            </div>
          </section>
        )}

        <WithdrawBanner navigate={navigate} />

        {/* Danh sách game */}
        <section>
          <SectionLabel
            right={
              <span className="font-mono text-[11px] text-slate-400">
                {t("st.count", { n: filteredGames.length })}
              </span>
            }
          >
            {t("st.list")}
          </SectionLabel>

          <div className="mb-4 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl border-2 px-4 py-2.5 font-mono text-[11px] font-extrabold uppercase tracking-wider transition ${
                    active
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-transparent bg-white text-slate-500 shadow-sm hover:text-slate-800"
                  }`}
                >
                  {t(tab.key)}
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                      active ? "bg-emerald-600 text-white" : "bg-slate-100"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {filteredGames.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filteredGames.map((game) => (
                <GameCard key={game.id} game={game} onClick={handleGameClick} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white py-14 text-center">
              <Search size={34} className="mx-auto mb-3 text-slate-300" />
              <p className="font-bold text-slate-700">{t("st.noGame")}</p>
              <p className="mt-1 text-sm text-slate-400">{t("st.tryOther")}</p>
              <button
                onClick={clearFilters}
                className="mt-4 rounded-xl bg-emerald-600 px-5 py-2.5 font-mono text-[11px] font-extrabold uppercase tracking-wider text-white transition hover:bg-emerald-700"
              >
                {t("st.clear")}
              </button>
            </div>
          )}
        </section>

        <StoreHistoryPreview />
      </main>

      <BottomNav />
    </div>
  );
                }
