import React from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckSquare,
  ShoppingBag,
  ArrowLeftRight,
  Headphones,
  Gamepad2,
  Crown,
  Video,
  Users,
  ListChecks,
  ArrowRight,
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
  Avatar,
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
  const avatarUrl =
    profile?.avatar_url ||
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    "";
  const todayTasksDone = profile?.tasks_completed_today || 0;
  const todayTasksTotal = 3;
  const todayTaskPct = Math.min(
    100,
    Math.round((todayTasksDone / todayTasksTotal) * 100)
  );
  const earnedToday = profile?.coins_earned_today || 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#eefaf7] pb-32 font-['Be_Vietnam_Pro',sans-serif] text-slate-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px]"
        style={{
          background:
            "radial-gradient(420px 320px at 85% 40px,rgba(255,255,255,.7),transparent 70%),linear-gradient(180deg,#d6f0e9 0,#e6f6f2 50%,#eefaf7 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(6,78,59,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(6,78,59,.07) 1px,transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .skeleton-shimmer { background-image: linear-gradient(90deg, #f1f1f1 0%, #e6e6e6 50%, #f1f1f1 100%); background-size: 200% 100%; animation: shimmer 1.5s infinite linear; }
      `}</style>

      <TopHeader />

      <main className="relative mx-auto max-w-md space-y-4 px-4 py-3 md:max-w-3xl">
        {loading && <DashboardSkeleton />}

        {!loading && (
          <>
            {/* ===== THẺ CHÀO ===== */}
            <section className="relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_2px_8px_-2px_rgba(15,23,42,0.07)]">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0 pb-3">
                  <Avatar
                    src={avatarUrl}
                    name={displayName}
                    size={84}
                    className="bg-emerald-50 ring-4 ring-emerald-100"
                  />
                  {lv && (
                    <span className="absolute -bottom-0 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-xl bg-slate-800 px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-white">
                      <Crown size={11} />
                      {t("dash2.lvNow", { level: lv.level })}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {t("dash.streak")}: {profile?.streak_days || 0} {t("dash.days")}
                  </span>
                  <p className="mt-1.5 text-[16px] text-slate-500">{getGreeting()}</p>
                  <h1 className="truncate text-[30px] font-extrabold leading-tight tracking-tight text-emerald-600">
                    {displayName}
                  </h1>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/tasks")}
                className="mt-5 flex w-full items-center justify-between rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 py-2.5 pl-6 pr-2.5 text-[17px] font-bold text-white transition active:scale-[0.99]"
              >
                {t("dash.startTasks")}
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/25">
                  <ListChecks size={20} />
                </span>
              </button>
              <button
                type="button"
                onClick={() => navigate("/invite")}
                className="mt-3 flex w-full items-center justify-between rounded-full border border-slate-200 bg-white py-3.5 pl-5 pr-5 text-[17px] font-semibold text-slate-700 transition active:bg-slate-50"
              >
                <span className="flex items-center gap-3">
                  <Users size={22} className="text-amber-500" />
                  {t("dash.invite")}
                </span>
                <ArrowRight size={18} className="text-slate-400" />
              </button>
              <span className="absolute inset-x-10 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-sky-300 to-transparent" />
            </section>

            {/* ===== SỐ DƯ + HÔM NAY ===== */}
            <section className="rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_2px_8px_-2px_rgba(15,23,42,0.07)]">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-cyan-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                  {t("dash.balance")}
                </span>
                <button
                  type="button"
                  onClick={() => navigate("/wallet")}
                  className="inline-flex items-center gap-1 text-[12.5px] font-bold text-emerald-700"
                >
                  {lang === "en" ? "Wallet" : "Ví"} <ArrowRight size={13} />
                </button>
              </div>
              <div className="mt-3 flex items-end gap-3">
                <span className="text-[44px] font-black leading-none tracking-tight text-cyan-600 tabular-nums">
                  {fmt(profile?.coins)}
                </span>
                <span className="pb-1.5 text-base font-bold text-slate-500">
                  {t("dash.coin")}
                </span>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <div className="mb-2 flex items-center justify-between text-[12.5px] font-semibold text-slate-600">
                  <span>{t("dash2.todayTitle")}</span>
                  <span className="tabular-nums text-slate-500">
                    {todayTasksDone}/{todayTasksTotal}
                  </span>
                </div>
                <ProgressBar pct={todayTaskPct} />
                <div className="mt-4 grid grid-cols-3 divide-x divide-slate-100">
                  <Stat
                    value={`${profile?.streak_days || 0} ${t("dash.days")}`}
                    label={t("dash.streak")}
                  />
                  <Stat
                    value={`+${fmt(earnedToday)}`}
                    label={t("dash.statCoinToday")}
                  />
                  <Stat
                    value={profile?.referrals_count || 0}
                    label={t("dash.statInvited")}
                  />
                </div>
              </div>
            </section>

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

            {/* ===== MỐC THƯỞNG ===== */}
            <Panel
              title={t("dash.milestoneTitle")}
              bodyClass="divide-y divide-slate-100"
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
            </Panel>

            {/* ===== KHÁM PHÁ ===== */}
            <Panel
              title={lang === "en" ? "Explore" : "Khám phá"}
              bodyClass="divide-y divide-slate-100"
            >
              <LinkRow
                icon={Gamepad2}
                title={t("dash.minigame")}
                value={t("dash.turns", { n: profile?.game_tickets || 0 })}
                onClick={() => navigate("/minigames")}
              />
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
              
