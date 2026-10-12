import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Coins,
  CheckSquare,
  ShoppingBag,
  ArrowLeftRight,
  Headphones,
  Gamepad2,
  Crown,
} from "lucide-react";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import useLevelProgress from "../hooks/useLevelProgress.js";
import useHomeData from "../hooks/useHomeData.js";
import BottomNav from "../components/BottomNav.jsx";
import TopHeader from "../components/TopHeader.jsx";
import Footer from "../components/Footer.jsx";
import LeaderboardCard from "../components/LeaderboardCard.jsx";
import HomeTutorial from "../components/HomeTutorial.jsx";
import CoinChart from "../components/CoinChart.jsx";
import { DashboardSkeleton } from "../components/DashboardParts.jsx";
import {
  AnnouncementsCard,
  ActivityCard,
} from "../components/home/HomeSections.jsx";
import {
  LevelCard,
  ReferralCard,
} from "../components/home/HomeLevelReferral.jsx";
import {
  Panel,
  Tag,
  Shortcut,
  Stat,
  ProgressBar,
  LinkRow,
  MilestoneRow,
} from "../components/home/HomeUI.jsx";
import { useI18n } from "../i18n/index.js";

const MILESTONES = [
  { m: 1, reward: 50 },
  { m: 5, reward: 200 },
  { m: 10, reward: 400 },
];

// Các thẻ cũ vẫn nền sáng, đặt trong khung sáng để chữ còn đọc được
function Legacy({ children }) {
  return (
    <div className="rounded-lg border border-[#2E2E2E] bg-slate-50 p-3">
      {children}
    </div>
  );
}

export default function Dashboard() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { session } = useSession();
  const user = session?.user;

  const { profile, loading, setProfile } = useProfile();
  const { loading: lvLoading, data: lv } = useLevelProgress(user?.id);
  const { chartData, chartLoading, claimingMilestone, handleClaimMilestone } =
    useHomeData(user, setProfile, t);

  const fmt = (n) =>
    Number(n || 0).toLocaleString(lang === "en" ? "en-US" : "vi-VN");

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 11) return t("dash.greetMorning");
    if (h < 18) return t("dash.greetAfternoon");
    return t("dash.greetEvening");
  };

  const displayName =
    profile?.username ||
    user?.user_metadata?.username ||
    user?.email?.split("@")[0] ||
    t("dash.fallbackName");
  const todayTasksDone = profile?.tasks_completed_today || 0;
  const todayTasksTotal = 3;
  const todayTaskPct = Math.min(
    100,
    Math.round((todayTasksDone / todayTasksTotal) * 100)
  );
  const earnedToday = profile?.coins_earned_today || 0;

  return (
    <div className="min-h-screen bg-[#171717] pb-28 font-['Be_Vietnam_Pro',sans-serif] text-[#EDEDED]">
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .skeleton-shimmer { background-image: linear-gradient(90deg, #262626 0%, #333333 50%, #262626 100%); background-size: 200% 100%; animation: shimmer 1.5s infinite linear; }
      `}</style>

      <TopHeader />

      <main className="mx-auto max-w-md space-y-3 px-4 py-5 md:max-w-3xl">
        {loading && <DashboardSkeleton />}

        {!loading && (
          <>
            {/* ===== TIÊU ĐỀ ===== */}
            <div className="flex items-center justify-between gap-3 pb-1">
              <div className="min-w-0">
                <p className="text-xs text-[#898989]">{getGreeting()}</p>
                <h1 className="truncate text-xl font-medium tracking-tight text-white">
                  {displayName}
                </h1>
              </div>
              {lv && (
                <Tag tone="amber">
                  <Crown size={11} />
                  {t("dash2.lvNow", { level: lv.level })}
                </Tag>
              )}
            </div>

            {/* ===== SỐ DƯ ===== */}
            <Panel>
              <p className="text-xs text-[#898989] lowercase first-letter:uppercase">
                {t("dash.balance")}
              </p>
              <div className="mt-1.5 flex items-center gap-2.5">
                <Coins size={24} strokeWidth={1.75} className="text-amber-300" />
                <span className="text-4xl font-medium leading-none tracking-tight tabular-nums text-white">
                  {fmt(profile?.coins)}
                </span>
                <span className="mt-2 text-xs text-[#898989]">
                  {t("dash.coin")}
                </span>
              </div>
              {earnedToday > 0 && (
                <p className="mt-2 text-xs tabular-nums text-[#3ECF8E]">
                  +{fmt(earnedToday)} {t("dash.statCoinToday")}
                </p>
              )}
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => navigate("/tasks")}
                  className="h-10 rounded-md border border-[#3ECF8E]/50 bg-[#006239] text-[13px] font-medium text-white transition active:scale-[0.98]"
                >
                  {t("dash.startTasks")}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/invite")}
                  className="h-10 rounded-md border border-[#3A3A3A] bg-[#2A2A2A] text-[13px] font-medium text-[#EDEDED] transition active:scale-[0.98]"
                >
                  {t("dash.invite")}
                </button>
              </div>
            </Panel>

            {/* ===== LỐI TẮT ===== */}
            <div className="grid grid-cols-4 gap-2.5">
              <Shortcut
                icon={CheckSquare}
                label={t("dash.qaTasks")}
                onClick={() => navigate("/tasks")}
              />
              <Shortcut
                icon={ShoppingBag}
                label={t("dash.qaStore")}
                onClick={() => navigate("/store")}
              />
              <Shortcut
                icon={ArrowLeftRight}
                label={t("dash.qaTopup")}
                onClick={() => navigate("/shop-earn")}
              />
              <Shortcut
                icon={Headphones}
                label={t("dash.qaSupport")}
                onClick={() => navigate("/contact")}
              />
            </div>

            <Legacy>
              <AnnouncementsCard />
            </Legacy>
            <Legacy>
              <HomeTutorial />
            </Legacy>

            {/* ===== HÔM NAY ===== */}
            <Panel
              title={t("dash2.todayTitle")}
              right={
                <span className="text-xs tabular-nums text-[#898989]">
                  {todayTasksDone}/{todayTasksTotal}
                </span>
              }
            >
              <ProgressBar pct={todayTaskPct} />
              <div className="mt-4 grid grid-cols-3 divide-x divide-[#2E2E2E]">
                <Stat
                  value={`${profile?.streak_days || 0} ${t("dash.days")}`}
                  label={t("dash.streak")}
                />
                <Stat
                  value={fmt(earnedToday)}
                  label={t("dash.statCoinToday")}
                />
                <Stat
                  value={profile?.referrals_count || 0}
                  label={t("dash.statInvited")}
                />
              </div>
            </Panel>

            {/* ===== MỐC THƯỞNG ===== */}
            <Panel
              title={t("dash.milestoneTitle")}
              bodyClass="divide-y divide-[#2E2E2E]"
              right={
                <span className="text-[11px] text-[#6B6B6B]">
                  {t("dash.done", { n: todayTasksDone })}
                </span>
              }
            >
              {MILESTONES.map(({ m, reward }) => (
                <MilestoneRow
                  key={m}
                  milestone={m}
                  reward={reward}
                  tasksDone={todayTasksDone}
                  claimed={profile?.[`milestone_${m}_claimed`]}
                  claiming={claimingMilestone === m}
                  onClaim={handleClaimMilestone}
                  lang={lang}
                />
              ))}
            </Panel>

            {/* ===== MINI GAME ===== */}
            <Panel bodyClass="">
              <LinkRow
                icon={Gamepad2}
                title={t("dash.minigame")}
                value={t("dash.turns", { n: profile?.game_tickets || 0 })}
                onClick={() => navigate("/minigames")}
              />
            </Panel>

            <LevelCard state={{ loading: lvLoading, data: lv }} />

            <Legacy>
              <LeaderboardCard />
            </Legacy>
            <Legacy>
              <ActivityCard userId={user?.id} />
            </Legacy>

            <ReferralCard profile={profile} />

            <Legacy>
              <CoinChart chartData={chartData} chartLoading={chartLoading} />
            </Legacy>
          </>
        )}
      </main>

      {!loading && <Footer />}
      <BottomNav />
    </div>
  );
                         }
