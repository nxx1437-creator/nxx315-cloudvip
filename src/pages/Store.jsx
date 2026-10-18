import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import {
  SectionTitle,
  FeaturedRow,
  CoverGrid,
} from "../components/store/StoreCards.jsx";
import {
  WithdrawBanner,
  StoreHistoryPreview,
} from "../components/store/StoreExtras.jsx";
import ForYouPackages from "../components/store/ForYouPackages.jsx";
import ScanAIIntroModal from "../components/store/ScanAIIntroModal.jsx"; 

import useProfile from "../hooks/useProfile.js";
// Đã thêm getImageUrl vào đây
import { GAMES, trackGameView, getImageUrl } from "../lib/storeData.js";
import { useI18n } from "../i18n/index.js";

export default function Store() {
  const { t, lang } = useI18n();
  const en = lang === "en";
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [activeTab, setActiveTab] = useState("all");
  
  const [showScanAI, setShowScanAI] = useState(false);

  // Tự động hiện sau 1 giây
  useEffect(() => {
    const timer = setTimeout(() => setShowScanAI(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleCloseScanAI = () => {
    setShowScanAI(false);
  };

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

      <main className="mx-auto max-w-5xl space-y-7 px-4 py-4">
        <FeaturedRow
          navigate={navigate}
          onTitleClick={() =>
            document
              .getElementById("store-list")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        />

        <ForYouPackages
          coins={profile?.coins}
          games={GAMES}
          navigate={navigate}
        />

        <section id="store-list">
          <SectionTitle
            accent={en ? "Game" : "Danh sách"}
            rest={en ? "categories" : "game"}
            right={
              <span className="pb-0.5 font-mono text-[11px] text-slate-400">
                {t("st.count", { n: filteredGames.length })}
              </span>
            }
          />

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
            <CoverGrid games={filteredGames} onSelect={handleGameClick} />
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

      {/* Component Modal Giới thiệu */}
      <ScanAIIntroModal
        isOpen={showScanAI}
        onClose={handleCloseScanAI}
        // Nội dung chính xác 100% theo yêu cầu
        description="Nxx315 Studio chính thức ra mắt giao diện Store mới. Tối ưu hóa nạp thẻ, thêm danh sách đề xuất các gói, hỗ trợ rút tiền qua Ngân hàng/MoMo/ZaloPay và theo dõi lịch sử giao dịch minh bạch theo thời gian thực." 
        // Sử dụng hàm getImageUrl để lấy ảnh (đảm bảo file store-preview.png đã có trên Supabase)
        imageSrc={getImageUrl("store-preview.png")} 
        buttonText="Đã hiểu"
      />
    </div>
  );
        }
