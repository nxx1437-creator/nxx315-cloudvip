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
  Video,
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
import CheckinCard from "../components/home/CheckinCard.jsx";
import EnablePushCard from "../components/home/EnablePushCard.jsx";
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
    <div className="min-h-screen bg-[#FAFAFA] pb-28 font-['Be_Vietnam_Pro',sans-serif] text-[#171717]">
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .skeleton-shimmer { background-image: linear-gradient(90deg, #f1f1f1 0%, #e6e6e6 50%, #f1f1f1 100%); background-size: 200% 100%; animation: shimmer 1.5s infinite linear; }
      `}</style>

      <TopHeader />

      <main className="mx-auto max-w-md space-y-3 px-4 py-5 md:max-w-3xl">
        {loading && <DashboardSkeleton />}

        {!loading && (
          <>
            {/* ===== TIÊU ĐỀ ===== */}
            <div className="flex items-center justify-between gap-3 pb-1">
              <div className="min-w-0">
                <p className="text-xs text-[#6F6F6F]">{getGreeting()}</p>
                <h1 className="truncate text-xl font-medium tracking-tight">
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
              <p className="text-xs text-[#6F6F6F] lowercase first-letter:uppercase">
                {t("dash.balance")}
              </p>
              <div className="mt-1.5 flex items-center gap-2.5">
                <Coins size={24} strokeWidth={1.75} className="text-amber-500" />
                <span className="text-4xl font-medium leading-none tracking-tight tabular-nums">
                  {fmt(profile?.coins)}
                </span>
                <span className="mt-2 text-xs text-[#9A9A9A]">
                  {t("dash.coin")}
                </span>
              </div>
              {earnedToday > 0 && (
                <p className="mt-2 text-xs tabular-nums text-[#0F7A4D]">
                  +{fmt(earnedToday)} {t("dash.statCoinToday")}
                </p>
              )}
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => navigate("/tasks")}
                  className="h-10 rounded-md border border-[#24B47E] bg-[#3ECF8E] text-[13px] font-medium text-[#0B1F17] transition active:scale-[0.98]"
                >
                  {t("dash.startTasks")}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/invite")}
                  className="h-10 rounded-md border border-[#D4D4D4] bg-white text-[13px] font-medium text-[#171717] transition active:bg-[#F4F4F4]"
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

            {/* ===== ĐIỂM DANH ===== */}
            <CheckinCard
              userId={user?.id}
              onClaimed={(r) =>
                setProfile((p) => ({ ...p, coins: (p?.coins || 0) + r }))
              }
            />
            
            <EnablePushCard userId={user?.id} />

            <AnnouncementsCard />
            <HomeTutorial />

            {/* ===== HÔM NAY ===== */}
            <Panel
              title={t("dash2.todayTitle")}
              right={
                <span className="text-xs tabular-nums text-[#6F6F6F]">
                  {todayTasksDone}/{todayTasksTotal}
                </span>
              }
            >
              <ProgressBar pct={todayTaskPct} />
              <div className="mt-4 grid grid-cols-3 divide-x divide-[#E6E6E6]">
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
              bodyClass="divide-y divide-[#E6E6E6]"
              right={
                <span className="text-[11px] text-[#9A9A9A]">
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
            {/* ===== VIDEO GIỚI THIỆU ===== */}
            <Panel bodyClass="">
              <LinkRow
                icon={Video}
                title={lang === "en" ? "Intro videos" : "Video giới thiệu"}
                value={lang === "en" ? "Get coin codes" : "Nhận code xu"}
                onClick={() => navigate("/creator")}
              />
            </Panel>

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
