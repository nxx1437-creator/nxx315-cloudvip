import React, { useEffect, useState } from "react";
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
import { supabase } from "../lib/supabaseClient.js";
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
  CardHeader,
  LevelPill,
  Shortcut,
  MiniStat,
  ProgressBar,
  MilestoneChip,
} from "../components/home/HomeUI.jsx";
import { useI18n } from "../i18n/index.js";

export default function Dashboard() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { session } = useSession();
  const user = session?.user;

  const { profile, loading, setProfile } = useProfile();
  const { loading: lvLoading, data: lv } = useLevelProgress(user?.id);

  const [claimingMilestone, setClaimingMilestone] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);

  const fmt = (n) =>
    Number(n || 0).toLocaleString(lang === "en" ? "en-US" : "vi-VN");

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 11) return t("dash.greetMorning");
    if (h < 18) return t("dash.greetAfternoon");
    return t("dash.greetEvening");
  };

  // Kiểm tra IP trùng
  useEffect(() => {
    if (!user?.id) return;
    const checkUserIp = async () => {
      try {
        const sessionRes = await supabase.auth.getSession();
        const accessToken = sessionRes.data.session?.access_token;
        if (!accessToken) return;
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-user-ip`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await res.json();
        if (data?.ok === false) {
          console.warn("[check-user-ip] User bị xóa vì IP trùng");
          await supabase.auth.signOut();
          window.location.href = "/login?error=ip_duplicate";
        }
      } catch (err) {
        console.error("check-user-ip error:", err);
      }
    };
    checkUserIp();
  }, [user?.id]);

  // Biểu đồ Coin 7 ngày
  useEffect(() => {
    const fetchChart = async () => {
      if (!user?.id) {
        setChartLoading(false);
        return;
      }
      try {
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          d.setHours(0, 0, 0, 0);
          days.push(d);
        }
        const { data: rows } = await supabase
          .from("task_completions")
          .select("completed_at, coins_earned")
          .eq("user_id", user.id)
          .gte("completed_at", days[0].toISOString());

        const sumByDate = {};
        (rows || []).forEach((r) => {
          const key = new Date(r.completed_at).toDateString();
          sumByDate[key] = (sumByDate[key] || 0) + (r.coins_earned || 0);
        });
        setChartData(
          days.map((d) => ({
            dow: d.getDay(),
            value: sumByDate[d.toDateString()] || 0,
            isToday: d.toDateString() === new Date().toDateString(),
          }))
        );
      } catch (err) {
        console.error("fetchChart error:", err);
      } finally {
        setChartLoading(false);
      }
    };
    fetchChart();
  }, [user]);

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

  const handleClaimMilestone = async (milestone) => {
    if (!user?.id) return;
    setClaimingMilestone(milestone);
    const { data, error } = await supabase.rpc("claim_task_milestone", {
      p_user_id: user.id,
      p_milestone: milestone,
    });
    setClaimingMilestone(null);
    if (error) {
      alert(t("dash.errPrefix") + error.message);
      return;
    }
    if (!data?.success) {
      alert(data?.message || t("dash.claimFail"));
      return;
    }
    const field = `milestone_${milestone}_claimed`;
    setProfile((prev) => ({
      ...prev,
      coins: (prev.coins || 0) + data.reward,
      [field]: true,
    }));
  };

  return (
    <div className="min-h-screen bg-[#F4F8F8] pb-28 font-['Be_Vietnam_Pro',sans-serif] text-slate-900">
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .skeleton-shimmer { background-image: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%); background-size: 200% 100%; animation: shimmer 1.5s infinite linear; }
      `}</style>

      <TopHeader />

      <main className="mx-auto max-w-md space-y-5 px-4 py-5 md:max-w-3xl">
        {loading && <DashboardSkeleton />}

        {!loading && (
          <>
            {/* ===== LỜI CHÀO ===== */}
            <div className="flex items-center justify-between gap-3 px-1">
              <div className="min-w-0">
                <p className="text-[13px] text-slate-500">{getGreeting()}</p>
                <h1 className="truncate font-['Baloo_2',sans-serif] text-[28px] font-extrabold leading-tight text-slate-900">
                  {displayName}
                </h1>
              </div>
              {lv && (
                <LevelPill>
                  <Crown size={13} />
                  {t("dash2.lvNow", { level: lv.level })}
                </LevelPill>
              )}
            </div>

            {/* ===== THẺ SỐ DƯ ===== */}
            <section className="relative overflow-hidden rounded-[28px] bg-emerald-600 p-5 text-white shadow-[0_14px_30px_-14px_rgba(5,150,105,0.6)]">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
              <div className="pointer-events-none absolute -bottom-14 right-12 h-32 w-32 rounded-full bg-teal-300/20" />

              <p className="relative text-[13px] font-medium text-white/80">
                {t("dash.balance")}
              </p>
              <div className="relative mt-1 flex items-end gap-2">
                <Coins size={30} className="mb-1.5 text-amber-200" />
                <span className="font-['Baloo_2',sans-serif] text-[46px] font-extrabold leading-none">
                  {fmt(profile?.coins)}
                </span>
                <span className="mb-1.5 text-sm text-white/80">
                  {t("dash.coin")}
                </span>
              </div>

              {earnedToday > 0 && (
                <span className="relative mt-3 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                  +{fmt(earnedToday)} · {t("dash.statCoinToday")}
                </span>
              )}

              <div className="relative mt-4 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => navigate("/tasks")}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-white px-3 py-3 text-sm font-bold text-emerald-700 transition active:scale-[0.97]"
                >
                  <Rocket size={16} /> {t("dash.startTasks")}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/invite")}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-white/15 px-3 py-3 text-sm font-bold text-white transition active:scale-[0.97]"
                >
                  <Gift size={16} /> {t("dash.invite")}
                </button>
              </div>
            </section>

            {/* ===== LỐI TẮT ===== */}
            <div className="grid grid-cols-4 gap-2.5">
              <Shortcut
                icon={CheckSquare}
                tone="emerald"
                label={t("dash.qaTasks")}
                onClick={() => navigate("/tasks")}
              />
              <Shortcut
                icon={ShoppingBag}
                tone="teal"
                label={t("dash.qaStore")}
                onClick={() => navigate("/store")}
              />
              <Shortcut
                icon={ArrowLeftRight}
                tone="amber"
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
            <Card>
              <CardHeader
                title={t("dash2.todayTitle")}
                right={
                  <button
                    type="button"
                    onClick={() => navigate("/tasks")}
                    className="flex items-center text-[13px] font-semibold text-emerald-600"
                  >
                    {todayTasksDone}/{todayTasksTotal}
                    <ChevronRight size={15} />
                  </button>
                }
              />
              <ProgressBar pct={todayTaskPct} />
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                <MiniStat
                  icon={Coins}
                  tone="amber"
                  value={fmt(earnedToday)}
                  label={t("dash.statCoinToday")}
                />
                <MiniStat
                  icon={Flame}
                  tone="orange"
                  value={`${profile?.streak_days || 0} ${t("dash.days")}`}
                  label={t("dash.streak")}
                />
                <MiniStat
                  icon={Users}
                  tone="sky"
                  value={profile?.referrals_count || 0}
                  label={t("dash.statInvited")}
                />
              </div>
            </Card>

            {/* ===== MỐC THƯỞNG ===== */}
            <Card>
              <CardHeader
                title={t("dash.milestoneTitle")}
                right={
                  <span className="text-xs text-slate-400">
                    {t("dash.done", { n: todayTasksDone })}
                  </span>
                }
              />
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { m: 1, reward: 50 },
                  { m: 5, reward: 200 },
                  { m: 10, reward: 400 },
                ].map(({ m, reward }) => (
                  <MilestoneChip
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
              </div>
            </Card>

            <LevelCard state={{ loading: lvLoading, data: lv }} />

            {/* ===== MINI GAME ===== */}
            <button
              type="button"
              onClick={() => navigate("/minigames")}
              className="w-full rounded-3xl bg-white p-4 text-left shadow-[0_1px_2px_rgba(15,23,42,0.05)] ring-1 ring-slate-100 transition active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-2xl">
                  🎮
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-['Baloo_2',sans-serif] text-[17px] font-bold text-slate-900">
                    {t("dash.minigame")}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {t("dash.miniDesc")}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                  {t("dash.turns", { n: profile?.game_tickets || 0 })}
                  <ChevronRight size={12} />
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                {[
                  ["🎡", "dash.wheel"],
                  ["🎫", "dash.scratch"],
                  ["🎲", "dash.dice"],
                ].map(([emoji, key]) => (
                  <span
                    key={key}
                    className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600"
                  >
                    {emoji} {t(key)}
                  </span>
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
          
