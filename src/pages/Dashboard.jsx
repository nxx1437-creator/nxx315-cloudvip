import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Coins,
  Gift,
  Trophy,
  Users,
  Flame,
  CheckSquare,
  Rocket,
  Crown,
  ShoppingBag,
  ArrowLeftRight,
  Headphones,
  ChevronRight,
  TrendingUp,
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
import {
  StatCard,
  QuickAction,
  MilestoneCard,
  DashboardSkeleton,
} from "../components/DashboardParts.jsx";
import {
  Panel,
  SectionLabel,
  AnnouncementsCard,
  ActivityCard,
} from "../components/home/HomeSections.jsx";
import {
  LevelCard,
  ReferralCard,
} from "../components/home/HomeLevelReferral.jsx";
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

  // Biểu đồ Coin 7 ngày (lưu thứ trong tuần dạng số, dịch lúc hiển thị)
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
  const initial = displayName.charAt(0).toUpperCase();
  const todayTasksDone = profile?.tasks_completed_today || 0;
  const todayTasksTotal = 3;
  const todayTaskPct = Math.min(
    100,
    Math.round((todayTasksDone / todayTasksTotal) * 100)
  );

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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-slate-50 to-slate-50 pb-28 font-['Be_Vietnam_Pro',sans-serif] text-slate-900">
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .skeleton-shimmer { background-image: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%); background-size: 200% 100%; animation: shimmer 1.5s infinite linear; }
      `}</style>

      <TopHeader />

      <main className="mx-auto max-w-md space-y-7 px-4 py-5 md:max-w-5xl">
        {loading && <DashboardSkeleton />}

        {!loading && (
          <>
            {/* ===== HERO ===== */}
            <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-5 text-white shadow-xl shadow-emerald-600/25">
              <span className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-white/10" />
              <span className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-teal-300/20" />

              <div className="relative flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg font-extrabold ring-2 ring-white/40">
                    {initial}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-white/80">
                      {getGreeting()}
                    </p>
                    <h1 className="truncate text-xl font-extrabold leading-tight">
                      {displayName} 👋
                    </h1>
                  </div>
                </div>
                {lv && (
                  <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur">
                    <Crown size={13} className="text-amber-200" />
                    {t("dash2.lvNow", { level: lv.level })}
                  </span>
                )}
              </div>

              <div className="relative mt-5 rounded-3xl bg-white/15 p-4 backdrop-blur-sm">
                <p className="text-xs font-semibold text-white/80">
                  {t("dash.balance")}
                </p>
                <div className="mt-1.5 flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/25">
                    <Coins size={26} className="text-amber-200" />
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[34px] font-extrabold leading-none tracking-tight">
                      {fmt(profile?.coins)}
                    </span>
                    <span className="text-sm font-semibold text-white/80">
                      {t("dash.coin")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate("/tasks")}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-white px-3 py-3.5 text-sm font-extrabold text-emerald-700 shadow-lg shadow-emerald-900/10 transition active:scale-95"
                >
                  <Rocket size={16} /> {t("dash.startTasks")}
                </button>
                <button
                  onClick={() => navigate("/invite")}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-white/15 px-3 py-3.5 text-sm font-extrabold text-white ring-1 ring-white/40 transition active:scale-95"
                >
                  <Gift size={16} /> {t("dash.invite")}
                </button>
              </div>
            </section>

            {/* ===== HÀNH ĐỘNG NHANH ===== */}
            <section>
              <SectionLabel>{t("dash.quick")}</SectionLabel>
              <Panel className="grid grid-cols-4 gap-1 px-2 py-4">
                <QuickAction
                  icon={CheckSquare}
                  iconBg="bg-emerald-50"
                  iconColor="text-emerald-600"
                  label={t("dash.qaTasks")}
                  onClick={() => navigate("/tasks")}
                />
                <QuickAction
                  icon={ShoppingBag}
                  iconBg="bg-teal-50"
                  iconColor="text-teal-600"
                  label={t("dash.qaStore")}
                  onClick={() => navigate("/store")}
                />
                <QuickAction
                  icon={ArrowLeftRight}
                  iconBg="bg-amber-50"
                  iconColor="text-amber-600"
                  label={t("dash.qaTopup")}
                  onClick={() => navigate("/shop-earn")}
                />
                <QuickAction
                  icon={Headphones}
                  iconBg="bg-sky-50"
                  iconColor="text-sky-600"
                  label={t("dash.qaSupport")}
                  onClick={() => navigate("/contact")}
                />
              </Panel>
            </section>

            <AnnouncementsCard />

            <HomeTutorial />

            <LevelCard state={{ loading: lvLoading, data: lv }} />

            {/* ===== HÔM NAY ===== */}
            <section>
              <SectionLabel>{t("dash2.todayTitle")}</SectionLabel>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <StatCard
                  icon={TrendingUp}
                  iconBg="bg-emerald-50"
                  iconColor="text-emerald-600"
                  value={fmt(lv?.lifetime)}
                  label={t("dash2.lvLifetime")}
                />
                <StatCard
                  icon={Trophy}
                  iconBg="bg-teal-50"
                  iconColor="text-teal-600"
                  value={todayTasksDone}
                  label={t("dash.statDoneToday")}
                />
                <StatCard
                  icon={Coins}
                  iconBg="bg-amber-50"
                  iconColor="text-amber-600"
                  value={fmt(profile?.coins_earned_today)}
                  label={t("dash.statCoinToday")}
                />
                <StatCard
                  icon={Users}
                  iconBg="bg-sky-50"
                  iconColor="text-sky-600"
                  value={profile?.referrals_count || 0}
                  label={t("dash.statInvited")}
                />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="flex flex-col justify-between rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-[0_4px_20px_-10px_rgba(245,158,11,0.35)]">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
                    <Flame size={22} className="text-orange-500" />
                  </span>
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-amber-700">
                      {t("dash.streak")}
                    </p>
                    <p className="text-2xl font-extrabold text-slate-900">
                      {profile?.streak_days || 0}{" "}
                      <span className="text-sm font-semibold text-slate-500">
                        {t("dash.days")}
                      </span>
                    </p>
                    <p className="text-[11px] font-medium text-amber-700">
                      {t("dash.record")}: {profile?.streak_record || 0}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/tasks")}
                  className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-[0_4px_20px_-10px_rgba(15,23,42,0.15)] transition active:scale-[0.98]"
                >
                  <span className="text-xs font-semibold text-slate-500">
                    {t("dash.progress")}
                  </span>
                  <div
                    className="mt-2.5 flex h-24 w-24 items-center justify-center rounded-full"
                    style={{
                      background: `conic-gradient(#10b981 ${
                        todayTaskPct * 3.6
                      }deg, #e2e8f0 0deg)`,
                    }}
                  >
                    <div className="flex h-[74px] w-[74px] flex-col items-center justify-center rounded-full bg-white">
                      <span className="text-xl font-extrabold text-slate-900">
                        {todayTaskPct}%
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        {todayTasksDone}/{todayTasksTotal}
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </section>

            {/* ===== MỐC THƯỞNG ===== */}
            <section>
              <SectionLabel
                right={
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                    {t("dash.done", { n: todayTasksDone })}
                  </span>
                }
              >
                {t("dash.milestoneTitle")}
              </SectionLabel>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { m: 1, reward: 50 },
                  { m: 5, reward: 200 },
                  { m: 10, reward: 400 },
                ].map(({ m, reward }) => (
                  <MilestoneCard
                    key={m}
                    milestone={m}
                    reward={reward}
                    tasksDone={todayTasksDone}
                    claimed={profile?.[`milestone_${m}_claimed`]}
                    claiming={claimingMilestone === m}
                    onClaim={handleClaimMilestone}
                  />
                ))}
              </div>
            </section>

            {/* ===== MINI GAME ===== */}
            <section>
              <button
                onClick={() => navigate("/minigames")}
                className="w-full overflow-hidden rounded-3xl border border-slate-100 bg-white text-left shadow-[0_4px_24px_-10px_rgba(15,23,42,0.15)] transition active:scale-[0.99]"
              >
                <div className="flex items-center justify-between gap-3 px-5 pt-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-2xl">
                      🎮
                    </span>
                    <div>
                      <p className="text-[17px] font-extrabold text-slate-900">
                        {t("dash.minigame")}
                      </p>
                      <p className="text-xs text-slate-500">
                        {t("dash.miniDesc")}
                      </p>
                    </div>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                    {t("dash.turns", { n: profile?.game_tickets || 0 })}
                    <ChevronRight size={13} />
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2.5 px-5 pb-5">
                  {[
                    ["🎡", "dash.wheel", "from-sky-50 to-cyan-50"],
                    ["🎫", "dash.scratch", "from-amber-50 to-yellow-50"],
                    ["🎲", "dash.dice", "from-rose-50 to-pink-50"],
                  ].map(([emoji, key, bg]) => (
                    <div
                      key={key}
                      className={`rounded-2xl bg-gradient-to-br py-3 text-center ${bg}`}
                    >
                      <p className="text-2xl">{emoji}</p>
                      <p className="mt-1 text-[11px] font-bold text-slate-600">
                        {t(key)}
                      </p>
                    </div>
                  ))}
                </div>
              </button>
            </section>

            <ActivityCard userId={user?.id} />

            <ReferralCard profile={profile} />

            <LeaderboardCard />
            <CoinChart chartData={chartData} chartLoading={chartLoading} />
          </>
        )}
      </main>

      {!loading && <Footer />}
      <BottomNav />
    </div>
  );
      }
          
