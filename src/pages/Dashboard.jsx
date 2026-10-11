import React from "react";
import { useNavigate } from "react-router-dom";
import {
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
  Section,
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

// Bọc các thẻ cũ cho khớp bố cục mới (sẽ thay dần)
function Legacy({ children }) {
  return <div className="border-t border-slate-100 px-5 py-5">{children}</div>;
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
    <div className="min-h-screen bg-white pb-28 font-['Be_Vietnam_Pro',sans-serif] text-slate-900">
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .skeleton-shimmer { background-image: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%); background-size: 200% 100%; animation: shimmer 1.5s infinite linear; }
      `}</style>

      <TopHeader />

      <main className="mx-auto max-w-md md:max-w-3xl">
        {loading && (
          <div className="px-5 py-5">
            <DashboardSkeleton />
          </div>
        )}

        {!loading && (
          <>
            {/* ===== SỐ DƯ ===== */}
            <Section className="pt-6">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm text-slate-500">
                  {getGreeting()},{" "}
                  <span className="font-medium text-slate-900">
                    {displayName}
                  </span>
                </p>
                {lv && (
                  <Tag tone="amber">
                    <Crown size={11} />
                    {t("dash2.lvNow", { level: lv.level })}
                  </Tag>
                )}
              </div>

              <p className="mt-6 text-[13px] text-slate-500 lowercase first-letter:uppercase">
                {t("dash.balance")}
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-[40px] font-semibold leading-none tracking-tight tabular-nums">
                  {fmt(profile?.coins)}
                </span>
                <span className="text-sm text-slate-400">{t("dash.coin")}</span>
              </div>
              {earnedToday > 0 && (
                <p className="mt-2 text-[13px] tabular-nums text-emerald-600">
                  +{fmt(earnedToday)} {t("dash.statCoinToday")}
                </p>
              )}

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => navigate("/tasks")}
                  className="h-11 rounded-lg bg-emerald-600 text-sm font-medium text-white transition active:scale-[0.98]"
                >
                  {t("dash.startTasks")}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/invite")}
                  className="h-11 rounded-lg border border-slate-200 text-sm font-medium text-slate-800 transition active:bg-slate-50"
                >
                  {t("dash.invite")}
                </button>
              </div>
            </Section>

            {/* ===== LỐI TẮT ===== */}
            <Section>
              <div className="grid grid-cols-4 gap-2">
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
            </Section>

            <Legacy>
              <AnnouncementsCard />
            </Legacy>
            <Legacy>
              <HomeTutorial />
            </Legacy>

            {/* ===== HÔM NAY ===== */}
            <Section
              title={t("dash2.todayTitle")}
              right={
                <span className="text-[13px] tabular-nums text-slate-500">
                  {todayTasksDone}/{todayTasksTotal}
                </span>
              }
            >
              <ProgressBar pct={todayTaskPct} />
              <div className="mt-4 grid grid-cols-3 divide-x divide-slate-100">
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
            </Section>

            {/* ===== MỐC THƯỞNG ===== */}
            <Section
              title={t("dash.milestoneTitle")}
              right={
                <span className="text-xs text-slate-400">
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
            </Section>

            {/* ===== MINI GAME ===== */}
            <Section>
              <LinkRow
                icon={Gamepad2}
                title={t("dash.minigame")}
                value={t("dash.turns", { n: profile?.game_tickets || 0 })}
                onClick={() => navigate("/minigames")}
              />
            </Section>

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
