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
import { LevelCard, ReferralCard } from "../components/home/HomeLevelReferral.jsx";
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
    <div className="min-h-screen bg-slate-50 pb-24 font-['Be_Vietnam_Pro',sans-serif] text-slate-900">
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .skeleton-shimmer { background-image: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%); background-size: 200% 100%; animation: shimmer 1.5s infinite linear; }
      `}</style>

      <TopHeader />

      <main className="mx-auto max-w-md space-y-6 px-4 py-5 md:max-w-5xl">
        {loading && <DashboardSkeleton />}

        {!loading && (
          <>
            {/* ===== HERO ===== */}
            <Panel className="relative p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                    {getGreeting()}
                  </p>
                  <h1 className="mt-1 truncate text-[26px] font-black leading-tight tracking-[-0.02em] text-slate-950">
                    {displayName} 👋
                  </h1>
                </div>
                {lv && (
                  <span className="flex shrink-0 items-center gap-1.5 border border-amber-200 bg-amber-50 px-2.5 py-1.5 font-mono text-[11px] font-bold text-amber-700">
                    <Crown size={12} />
                    {t("dash2.lvNow", { level: lv.level })}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-[13px] leading-5 text-slate-500">
                {t("dash.heroSub")}
              </p>

              {/* Thẻ số dư */}
              <div className="mt-4 bg-gradient-to-br from-emerald-600 to-teal-500 p-4 text-white shadow-lg shadow-emerald-600/20">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-white/75">
                  {t("dash.balance")}
                </p>
                <div className="mt-2.5 flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-white/20">
                    <Coins size={26} className="text-amber-200" />
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black leading-none tracking-[-0.03em]">
                      {fmt(profile?.coins)}
                    </span>
                    <span className="font-mono text-xs uppercase tracking-widest text-white/75">
                      {t("dash.coin")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => navigate("/tasks")}
                  className="flex items-center justify-center gap-2 bg-slate-950 px-3 py-3.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white transition active:scale-[0.98]"
                >
                  <Rocket size={14} /> {t("dash.startTasks")}
                </button>
                <button
                  onClick={() => navigate("/invite")}
                  className="flex items-center justify-center gap-2 border-2 border-slate-200 bg-white px-3 py-3.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-700 transition hover:border-emerald-500 active:scale-[0.98]"
                >
                  <Gift size={14} /> {t("dash.invite")}
                </button>
              </div>
            </Panel>

            {/* ===== HÀNH ĐỘNG NHANH ===== */}
            <div>
              <SectionLabel>{t("dash.quick")}</SectionLabel>
              <div className="grid grid-cols-4 gap-2.5">
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
              </div>
            </div>

            {/* ===== MỤC MỚI: THÔNG BÁO TỪ ADMIN ===== */}
            <AnnouncementsCard />

            <HomeTutorial />

            {/* ===== MỤC MỚI: CẤP ĐỘ ===== */}
            <LevelCard state={{ loading: lvLoading, data: lv }} />

            {/* ===== HÔM NAY ===== */}
            <div>
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
                <div className="flex flex-col justify-between border border-amber-200 bg-amber-50 p-4">
                  <span className="flex h-10 w-10 items-center justify-center bg-white">
                    <Flame size={20} className="text-amber-500" />
                  </span>
                  <div className="mt-3">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">
                      {t("dash.streak")}
                    </p>
                    <p className="text-2xl font-black text-slate-950">
                      {profile?.streak_days || 0}{" "}
                      <span className="font-mono text-xs font-medium uppercase text-slate-500">
                        {t("dash.days")}
                      </span>
                    </p>
                    <p className="font-mono text-[10px] uppercase text-amber-700">
                      {t("dash.record")}: {profile?.streak_record || 0}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/tasks")}
                  className="flex flex-col items-center border border-slate-200 bg-white p-4 text-center shadow-sm"
                >
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                    {t("dash.progress")}
                  </span>
                  <div
                    className="mt-2.5 flex h-24 w-24 items-center justify-center rounded-full"
                    style={{
                      background: `conic-gradient(#059669 ${
                        todayTaskPct * 3.6
                      }deg, #E2E8F0 0deg)`,
                    }}
                  >
                    <div className="flex h-[72px] w-[72px] flex-col items-center justify-center rounded-full bg-white">
                      <span className="text-xl font-black text-slate-950">
                        {todayTaskPct}%
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {todayTasksDone}/{todayTasksTotal}
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* ===== MỐC THƯỞNG ===== */}
            <div>
              <SectionLabel
                right={
                  <span className="font-mono text-[11px] text-slate-400">
                    {t("dash.done", { n: todayTasksDone })}
                  </span>
                }
              >
                {t("dash.milestoneTitle")}
              </SectionLabel>
              <div className="grid grid-cols-3 gap-2.5">
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
            </div>

            {/* ===== MINI GAME ===== */}
            <button
              onClick={() => navigate("/minigames")}
              className="w-full overflow-hidden border border-slate-200 bg-white text-left shadow-sm transition hover:border-emerald-500/60"
            >
              <div className="flex items-center justify-between px-4 pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎮</span>
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-slate-800">
                    {t("dash.minigame")}
                  </p>
                </div>
                <span className="flex items-center gap-1 border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-mono text-[11px] font-bold text-emerald-700">
                  {t("dash.turns", { n: profile?.game_tickets || 0 })}{" "}
                  <ChevronRight size={12} />
                </span>
              </div>
              <p className="px-4 pb-3 pt-1.5 text-xs text-slate-500">
                {t("dash.miniDesc")}
              </p>
              <div className="grid grid-cols-3 gap-px bg-slate-100">
                {[
                  ["🎡", "dash.wheel"],
                  ["🎫", "dash.scratch"],
                  ["🎲", "dash.dice"],
                ].map(([emoji, key]) => (
                  <div key={key} className="bg-white px-3 py-3 text-center">
                    <p className="text-lg">{emoji}</p>
                    <p className="mt-1 font-mono text-[10px] font-bold uppercase text-slate-500">
                      {t(key)}
                    </p>
                  </div>
                ))}
              </div>
            </button>

            {/* ===== MỤC MỚI: HOẠT ĐỘNG GẦN ĐÂY ===== */}
            <ActivityCard userId={user?.id} />

            {/* ===== MỤC MỚI: MỜI BẠN BÈ ===== */}
            <ReferralCard profile={profile} />

            {/* ===== BẢNG XẾP HẠNG + BIỂU ĐỒ ===== */}
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
          
