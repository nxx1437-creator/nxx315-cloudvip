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
  StatRow,
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
    <div className="min-h-screen bg-[#FAFAFA] pb-28 font-['Be_Vietnam_Pro',sans-serif] text-slate-900">
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .skeleton-shimmer { background-image: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%); background-size: 200% 100%; animation: shimmer 1.5s infinite linear; }
      `}</style>

      <TopHeader />

      <main className="mx-auto max-w-md space-y-4 px-4 py-5 md:max-w-3xl">
        {loading && <DashboardSkeleton />}

        {!loading && (
          <>
            {/* ===== TIÊU ĐỀ ===== */}
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-slate-500">{getGreeting()}</p>
                <h1 className="truncate text-xl font-semibold tracking-tight">
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
            <Card>
              <p className="text-xs text-slate-500">{t("dash.balance")}</p>
              <div className="mt-1.5 flex items-center gap-2.5">
                <Coins size={26} strokeWidth={1.75} className="text-amber-500" />
                <span className="text-4xl font-semibold tabular-nums tracking-tight">
                  {fmt(profile?.coins)}
                </span>
                <span className="mt-2 text-xs text-slate-500">
                  {t("dash.coin")}
                </span>
              </div>
              {earnedToday > 0 && (
                <p className="mt-1.5 text-xs tabular-nums text-emerald-600">
                  +{fmt(earnedToday)} · {t("dash.statCoinToday")}
                </p>
              )}
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => navigate("/tasks")}
                  className="flex h-10 items-center justify-center gap-2 rounded-md border border-emerald-600 bg-[#3ECF8E] text-[13px] font-medium text-slate-900 transition active:scale-[0.98]"
                >
                  <Rocket size={15} /> {t("dash.startTasks")}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/invite")}
                  className="flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white text-[13px] font-medium text-slate-800 transition hover:border-slate-400 active:scale-[0.98]"
                >
                  <Gift size={15} /> {t("dash.invite")}
                </button>
              </div>
            </Card>

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

            <AnnouncementsCard />
            <HomeTutorial />

            {/* ===== HÔM NAY ===== */}
            <Card
              title={t("dash2.todayTitle")}
              bodyClass=""
              right={
                <button
                  type="button"
                  onClick={() => navigate("/tasks")}
                  className="flex items-center text-xs font-medium tabular-nums text-emerald-600"
                >
                  {todayTasksDone}/{todayTasksTotal}
                  <ChevronRight size={14} />
                </button>
              }
            >
              <div className="px-4 pt-4">
                <ProgressBar pct={todayTaskPct} />
              </div>
              <div className="mt-2 border-t border-slate-200">
                <StatRow
                  items={[
                    {
                      icon: Coins,
                      value: fmt(earnedToday),
                      label: t("dash.statCoinToday"),
                    },
                    {
                      icon: Flame,
                      value: `${profile?.streak_days || 0} ${t("dash.days")}`,
                      label: t("dash.streak"),
                    },
                    {
                      icon: Users,
                      value: profile?.referrals_count || 0,
                      label: t("dash.statInvited"),
                    },
                  ]}
                />
              </div>
            </Card>

            {/* ===== MỐC THƯỞNG ===== */}
            <Card
              title={t("dash.milestoneTitle")}
              bodyClass="divide-y divide-slate-200"
              right={
                <span className="text-[11px] text-slate-400">
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

            {/* ===== MINI GAME ===== */}
            <button
              type="button"
              onClick={() => navigate("/minigames")}
              className="w-full rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-emerald-500 active:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-xl">
                  🎮
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium">{t("dash.minigame")}</p>
                  <p className="truncate text-xs text-slate-500">
                    {t("dash.miniDesc")}
                  </p>
                </div>
                <Tag tone="green">
                  {t("dash.turns", { n: profile?.game_tickets || 0 })}
                  <ChevronRight size={11} />
                </Tag>
              </div>
              <div className="mt-3 flex gap-1.5">
                {[
                  ["🎡", "dash.wheel"],
                  ["🎫", "dash.scratch"],
                  ["🎲", "dash.dice"],
                ].map(([emoji, key]) => (
                  <Tag key={key}>
                    {emoji} {t(key)}
                  </Tag>
                ))}
              </div>
            </button>

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
          
