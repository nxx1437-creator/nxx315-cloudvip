import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Coins,
  Gift,
  Users,
  Flame,
  CheckSquare,
  Rocket,
  Crown,
  ShoppingBag,
  ArrowLeftRight,
  Headphones,
  Gamepad2,
  ChevronRight,
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
  Card,
  Tag,
  Shortcut,
  StatTile,
  ProgressBar,
  MilestoneRow,
} from "../components/home/HomeUI.jsx";
import { useI18n } from "../i18n/index.js";

const MILESTONES = [
  { m: 1, reward: 50 },
  { m: 5, reward: 200 },
  { m: 10, reward: 400 },
];

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
    <div className="min-h-screen bg-[#FBF8F3] pb-28 font-['Be_Vietnam_Pro',sans-serif] text-[#1F1B16]">
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .skeleton-shimmer { background-image: linear-gradient(90deg, #f6f1e8 0%, #ebe3d5 50%, #f6f1e8 100%); background-size: 200% 100%; animation: shimmer 1.5s infinite linear; }
      `}</style>

      <TopHeader />

      <main className="mx-auto max-w-md space-y-3.5 px-4 py-5 md:max-w-3xl">
        {loading && <DashboardSkeleton />}

        {!loading && (
          <>
            {/* ===== LỜI CHÀO ===== */}
            <div className="flex items-center justify-between gap-3 px-1 pb-1">
              <div className="min-w-0">
                <p className="text-[13px] text-[#8A8173]">{getGreeting()}</p>
                <h1 className="truncate text-[26px] font-extrabold leading-tight tracking-tight">
                  {displayName}
                </h1>
              </div>
              {lv && (
                <Tag tone="orange">
                  <Crown size={12} />
                  {t("dash2.lvNow", { level: lv.level })}
                </Tag>
              )}
            </div>

            {/* ===== SỐ DƯ ===== */}
            <Card tone="orange" className="relative">
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#F25533]/10" />
              <p className="relative text-[13px] font-medium text-[#9A5B42]">
                {t("dash.balance")}
              </p>
              <div className="relative mt-2 flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white">
                  <Coins size={24} strokeWidth={1.9} className="text-[#F25533]" />
                </span>
                <span className="text-[44px] font-extrabold leading-none tracking-tight tabular-nums">
                  {fmt(profile?.coins)}
                </span>
                <span className="mt-3 text-xs text-[#9A5B42]">
                  {t("dash.coin")}
                </span>
              </div>
              {earnedToday > 0 && (
                <span className="relative mt-3 inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold tabular-nums text-[#C2410C]">
                  +{fmt(earnedToday)} · {t("dash.statCoinToday")}
                </span>
              )}
              <div className="relative mt-4 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => navigate("/tasks")}
                  className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#F25533] text-sm font-bold text-white transition active:scale-[0.97]"
                >
                  <Rocket size={16} /> {t("dash.startTasks")}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/invite")}
                  className="flex h-11 items-center justify-center gap-2 rounded-full border border-[#F2CDBD] bg-white text-sm font-bold text-[#1F1B16] transition active:scale-[0.97]"
                >
                  <Gift size={16} /> {t("dash.invite")}
                </button>
              </div>
            </Card>

            {/* ===== LỐI TẮT ===== */}
            <div className="grid grid-cols-4 gap-2.5">
              <Shortcut
                icon={CheckSquare}
                tone="orange"
                label={t("dash.qaTasks")}
                onClick={() => navigate("/tasks")}
              />
              <Shortcut
                icon={ShoppingBag}
                tone="sage"
                label={t("dash.qaStore")}
                onClick={() => navigate("/store")}
              />
              <Shortcut
                icon={ArrowLeftRight}
                tone="sand"
                label={t("dash.qaTopup")}
                onClick={() => navigate("/shop-earn")}
              />
              <Shortcut
                icon={Headphones}
                tone="sky"
                label={t("dash.qaSupport")}
                onClick={() => navigate("/contact")}
              />
            </div>

            <AnnouncementsCard />
            <HomeTutorial />

            {/* ===== HÔM NAY ===== */}
            <Card
              title={t("dash2.todayTitle")}
              right={
                <button
                  type="button"
                  onClick={() => navigate("/tasks")}
                  className="flex items-center text-[13px] font-bold tabular-nums text-[#C2410C]"
                >
                  {todayTasksDone}/{todayTasksTotal}
                  <ChevronRight size={15} />
                </button>
              }
            >
              <ProgressBar pct={todayTaskPct} />
            </Card>

            {/* ===== BENTO 2 CỘT ===== */}
            <div className="grid grid-cols-2 gap-3.5">
              <StatTile
                icon={Flame}
                tone="orange"
                value={`${profile?.streak_days || 0} ${t("dash.days")}`}
                label={t("dash.streak")}
              />
              <StatTile
                icon={Coins}
                tone="sand"
                value={fmt(earnedToday)}
                label={t("dash.statCoinToday")}
              />
              <StatTile
                icon={Users}
                tone="sage"
                value={profile?.referrals_count || 0}
                label={t("dash.statInvited")}
                onClick={() => navigate("/invite")}
              />
              <StatTile
                icon={Gamepad2}
                tone="sky"
                value={profile?.game_tickets || 0}
                label={t("dash.minigame")}
                onClick={() => navigate("/minigames")}
              />
            </div>

            {/* ===== MỐC THƯỞNG ===== */}
            <Card
              title={t("dash.milestoneTitle")}
              bodyClass="px-1 pb-2 pt-2 divide-y divide-[#F1EADF]"
              right={
                <span className="text-[11px] text-[#A39A8A]">
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
            </Card>

            <LevelCard state={{ loading: lvLoading, data: lv }} />
            <LeaderboardCard />
            <ActivityCard userId={user?.id} />
            <ReferralCard profile={profile} />
            <CoinChart chartData={chartData} chartLoading={chartLoading} />
          </>
        )}
      </main>

      {!loading && <Footer />}
      <BottomNav />
    </div>
  );
    }
