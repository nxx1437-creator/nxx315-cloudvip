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
} from "lucide-react";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
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
import { useI18n } from "../i18n/index.js";

export default function Dashboard() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { session } = useSession();
  const user = session?.user;

  const { profile, loading, setProfile } = useProfile();

  const [claimingMilestone, setClaimingMilestone] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);

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
  const expPct = Math.min(
    100,
    Math.round(((profile?.exp || 0) / (profile?.exp_target || 100)) * 100)
  );
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
    <div className="min-h-screen bg-[#F5F7FB] pb-24 text-[#111827]">
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .skeleton-shimmer { background-image: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%); background-size: 200% 100%; animation: shimmer 1.5s infinite linear; }
      `}</style>

      <TopHeader />

      <main className="mx-auto max-w-md space-y-4 px-4 py-5 md:max-w-5xl">
        {loading && <DashboardSkeleton />}

        {!loading && (
          <>
            {/* Hero */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-[#667085]">{getGreeting()},</p>
                  <h1 className="mt-0.5 truncate text-2xl font-bold leading-tight text-[#111827]">
                    {displayName} 👋
                  </h1>
                </div>
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#FFF4DB] px-2.5 py-1 text-xs font-bold text-[#B87700]">
                  <Crown size={12} /> LV{profile?.level || 0}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-[#667085]">
                {t("dash.heroSub")}
              </p>

              {/* Thẻ số dư */}
              <div className="mt-4 rounded-lg bg-gradient-to-br from-[#3478F6] to-[#0878C9] p-4 text-white shadow-md shadow-[#3478F6]/20">
                <div className="flex items-center justify-between text-xs font-semibold text-white/75">
                  <span className="tracking-wide">{t("dash.balance")}</span>
                  <span>
                    EXP {profile?.exp || 0}/{profile?.exp_target || 100}
                  </span>
                </div>
                <div className="mt-2.5 flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-white/20">
                    <Coins size={26} className="text-[#FFD36B]" />
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold leading-none">
                      {profile?.coins || 0}
                    </span>
                    <span className="text-sm text-white/70">
                      {t("dash.coin")}
                    </span>
                  </div>
                </div>
                <div className="mt-3.5 h-1.5 w-full overflow-hidden rounded-sm bg-white/25">
                  <div
                    className="h-full rounded-sm bg-white"
                    style={{ width: `${expPct}%` }}
                  />
                </div>
              </div>
              {/* Hai nút chính */}
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => navigate("/tasks")}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#111827] px-3 py-3 text-sm font-semibold text-white transition active:scale-[0.98]"
                >
                  <Rocket size={15} /> {t("dash.startTasks")}
                </button>
                <button
                  onClick={() => navigate("/invite")}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-3 text-sm font-semibold text-[#374151] transition active:scale-[0.98]"
                >
                  <Gift size={15} /> {t("dash.invite")}
                </button>
              </div>
            </div>

            {/* Hành động nhanh */}
            <div>
              <p className="mb-3 text-sm font-bold text-[#111827]">
                {t("dash.quick")}
              </p>
              <div className="grid grid-cols-4 gap-2.5">
                <QuickAction
                  icon={CheckSquare}
                  iconBg="bg-[#EAF2FE]"
                  iconColor="text-[#3478F6]"
                  label={t("dash.qaTasks")}
                  onClick={() => navigate("/tasks")}
                />
                <QuickAction
                  icon={ShoppingBag}
                  iconBg="bg-[#EAF2FE]"
                  iconColor="text-[#3478F6]"
                  label={t("dash.qaStore")}
                  onClick={() => navigate("/store")}
                />
                <QuickAction
                  icon={ArrowLeftRight}
                  iconBg="bg-[#FFF4DB]"
                  iconColor="text-[#B87700]"
                  label={t("dash.qaTopup")}
                  onClick={() => navigate("/shop-earn")}
                />
                <QuickAction
                  icon={Headphones}
                  iconBg="bg-emerald-50"
                  iconColor="text-emerald-600"
                  label={t("dash.qaSupport")}
                  onClick={() => navigate("/contact")}
                />
              </div>
            </div>

            <HomeTutorial />

            {/* Top 3 tuần này */}
            <LeaderboardCard />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard
                icon={CheckSquare}
                iconBg="bg-[#EAF2FE]"
                iconColor="text-[#3478F6]"
                value={0}
                label={t("dash.statAvailable")}
              />
              <StatCard
                icon={Trophy}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                value={todayTasksDone}
                label={t("dash.statDoneToday")}
              />
              <StatCard
                icon={Coins}
                iconBg="bg-[#FFF4DB]"
                iconColor="text-[#B87700]"
                value={profile?.coins_earned_today || 0}
                label={t("dash.statCoinToday")}
              />
              <StatCard
                icon={Users}
                iconBg="bg-[#EAF2FE]"
                iconColor="text-[#0878C9]"
                value={profile?.referrals_count || 0}
                label={t("dash.statInvited")}
              />
            </div>

            {/* Giữ lửa + Tiến độ hôm nay (2 cột) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col justify-between rounded-2xl border border-[#F3E4CC] bg-[#FFF8ED] p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                  <Flame size={20} className="text-[#FFB82E]" />
                </div>
                <div className="mt-3">
                  <p className="text-xs font-medium text-[#9C7A3F]">
                    {t("dash.streak")}
                  </p>
                  <p className="text-2xl font-bold text-[#111827]">
                    {profile?.streak_days || 0}{" "}
                    <span className="text-sm font-medium text-[#667085]">
                      {t("dash.days")}
                    </span>
                  </p>
                  <p className="text-xs text-[#9C7A3F]">
                    {t("dash.record")}:{" "}
                    <span className="font-semibold">
                      {profile?.streak_record || 0}
                    </span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/tasks")}
                className="flex flex-col items-center rounded-2xl border border-[#E5E7EB] bg-white p-4 text-center"
              >
                <span className="text-xs font-semibold text-[#667085]">
                  {t("dash.progress")}
                </span>
                <div
                  className="mt-2.5 flex h-24 w-24 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(#3478F6 ${
                      todayTaskPct * 3.6
                    }deg, #E5E7EB 0deg)`,
                  }}
                >
                  <div className="flex h-[72px] w-[72px] flex-col items-center justify-center rounded-full bg-white">
                    <span className="text-xl font-bold text-[#111827]">
                      {todayTaskPct}%
                    </span>
                    <span className="text-[10px] text-[#9CA3AF]">
                      {todayTasksDone}/{todayTasksTotal}
                    </span>
                  </div>
                </div>
              </button>
            </div>

            {/* Mốc thưởng chuỗi nhiệm vụ */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-[#111827]">
                  {t("dash.milestoneTitle")}
                </p>
                <span className="text-xs text-[#9CA3AF]">
                  {t("dash.done", { n: todayTasksDone })}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
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

            {/* Mini Game */}
            <button
              onClick={() => navigate("/minigames")}
              className="w-full overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white text-left transition hover:border-sky-200"
            >
              <div className="flex items-center justify-between px-4 pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎮</span>
                  <p className="text-sm font-bold text-[#111827]">
                    {t("dash.minigame")}
                  </p>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-[#EAF2FE] px-2.5 py-1 text-xs font-semibold text-[#3478F6]">
                  {t("dash.turns", { n: profile?.game_tickets || 0 })}{" "}
                  <ChevronRight size={12} />
                </span>
              </div>
              <p className="px-4 pb-3 pt-1 text-xs text-[#9CA3AF]">
                {t("dash.miniDesc")}
              </p>
              <div className="grid grid-cols-3 gap-px bg-[#F3F4F6]">
                {[
                  ["🎡", "dash.wheel"],
                  ["🎫", "dash.scratch"],
                  ["🎲", "dash.dice"],
                ].map(([emoji, key]) => (
                  <div key={key} className="bg-white px-3 py-3 text-center">
                    <p className="text-lg">{emoji}</p>
                    <p className="mt-1 text-[10px] font-semibold text-[#6B7280]">
                      {t(key)}
                    </p>
                  </div>
                ))}
              </div>
            </button>

            {/* Coin 7 ngày qua */}
            <CoinChart chartData={chartData} chartLoading={chartLoading} />
          </>
        )}
      </main>

      {!loading && <Footer />}
      <BottomNav />
    </div>
  );
    }
