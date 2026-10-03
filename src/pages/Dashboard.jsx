import React, { useEffect, useState, useCallback } from "react";
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
  Gamepad2,
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

  const getGreeting = useCallback(() => {
    const h = new Date().getHours();
    if (h < 11) return t("dash.greetMorning");
    if (h < 18) return t("dash.greetAfternoon");
    return t("dash.greetEvening");
  }, [t]);

  // Kiểm tra IP trùng
  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;
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
        if (data?.ok === false && isMounted) {
          console.warn("[check-user-ip] User bị xóa vì IP trùng");
          await supabase.auth.signOut();
          window.location.href = "/login?error=ip_duplicate";
        }
      } catch (err) {
        console.error("check-user-ip error:", err);
      }
    };
    checkUserIp();
    return () => { isMounted = false; };
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

  // ===== XỬ LÝ LEVEL VÀ EXP CHUẨN =====
  const rawLevel = profile?.level || 1;
  const rawExp = profile?.exp || 0;
  const rawExpTarget = profile?.exp_target || 100;

  // Nếu EXP vượt quá target, tự động tính lại level và exp dư
  let displayLevel = rawLevel;
  let displayExp = rawExp;
  let displayExpTarget = rawExpTarget;

  // Vòng lặp xử lý level up (đề phòng EXP vượt quá nhiều lần)
  while (displayExp >= displayExpTarget) {
    displayExp -= displayExpTarget;
    displayLevel += 1;
    displayExpTarget = Math.floor(displayExpTarget * 1.5); // Mỗi level tăng 50% EXP cần
  }

  const expPct = Math.min(
    100,
    Math.round((displayExp / displayExpTarget) * 100)
  );
  // =====================================

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

      <main className="mx-auto max-w-md space-y-5 px-4 py-5 md:max-w-5xl">
        {loading && <DashboardSkeleton />}

        {!loading && (
          <>
            {/* === 1. LỜI CHÀO === */}
            <div className="relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-5">
              <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-[#3478F6]/15 to-transparent blur-2xl" />
              <span className="relative inline-flex items-center gap-1.5 rounded-full bg-[#EAF2FE] px-3 py-1 text-xs font-semibold text-[#0878C9]">
                {t("dash.badge")}
              </span>
              <h1 className="relative mt-3 text-2xl font-bold leading-tight text-[#111827]">
                {getGreeting()},<br />
                <span className="text-[#3478F6]">{displayName}</span> 👋
              </h1>
              <p className="relative mt-1.5 text-sm text-[#667085]">
                {t("dash.heroSub")}
              </p>
            </div>

            {/* === 2. THẺ SỐ DƯ (BALANCE CARD) === */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#667085]">
                  {t("dash.balance")}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-[#FFF4DB] px-3 py-1 text-xs font-bold text-[#B87700]">
                  <Crown size={14} /> LV{displayLevel}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <Coins size={28} className="text-[#F2A900]" />
                <span className="text-4xl font-extrabold text-[#111827]">
                  {profile?.coins || 0}
                </span>
                <span className="text-sm font-medium text-[#9CA3AF]">
                  {t("dash.coin")}
                </span>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-medium text-[#9CA3AF]">
                  <span>EXP</span>
                  <span>
                    {displayExp}/{displayExpTarget}
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#3478F6] to-[#0878C9] transition-all duration-500"
                    style={{ width: `${expPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* === 3. HÀNH ĐỘNG NHANH === */}
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

            {/* === 4. THỐNG KÊ (STATS) === */}
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

            {/* === 5. STREAK & PROGRESS === */}
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-[#F3E4CC] bg-[#FFF8ED] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                    <Flame size={24} className="text-[#FFB82E]" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#9C7A3F]">
                      {t("dash.streak")}
                    </p>
                    <p className="text-xl font-bold text-[#111827]">
                      {profile?.streak_days || 0}{" "}
                      <span className="text-sm font-medium text-[#667085]">
                        {t("dash.days")}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#9C7A3F]">{t("dash.record")}</p>
                  <p className="text-lg font-bold text-[#111827]">
                    {profile?.streak_record || 0}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/tasks")}
                className="flex w-full items-center justify-between rounded-2xl border border-[#E5E7EB] bg-white p-4 text-left transition hover:border-sky-200"
              >
                <div>
                  <p className="text-sm font-bold text-[#111827]">
                    {t("dash.progress")}
                  </p>
                  <p className="mt-0.5 text-xs text-[#667085]">
                    {todayTasksDone}/{todayTasksTotal} {t("dash.qaTasks")}
                  </p>
                </div>
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(#3478F6 ${
                      todayTaskPct * 3.6
                    }deg, #E5E7EB 0deg)`,
                  }}
                >
                  <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-white">
                    <span className="text-sm font-bold text-[#111827]">
                      {todayTaskPct}%
                    </span>
                  </div>
                </div>
              </button>
            </div>

            {/* === 6. MỐC THƯỞNG CHUỖI NHIỆM VỤ === */}
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

            {/* === 7. MINI GAME === */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Gamepad2 size={20} className="text-[#3478F6]" />
                  <p className="text-sm font-bold text-[#111827]">
                    {t("dash.minigame")}
                  </p>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-[#EAF2FE] px-2.5 py-1 text-xs font-semibold text-[#3478F6]">
                  {t("dash.turns", { n: profile?.game_tickets || 0 })}{" "}
                  <ChevronRight size={12} />
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { emoji: "🎡", key: "dash.wheel", path: "/minigames/wheel" },
                  { emoji: "🎫", key: "dash.scratch", path: "/minigames/scratch" },
                  { emoji: "🎲", key: "dash.dice", path: "/minigames/dice" },
                ].map(({ emoji, key, path }) => (
                  <button
                    key={key}
                    onClick={() => navigate(path)}
                    className="flex flex-col items-center justify-center rounded-xl border border-[#F3F4F6] bg-[#FAFAFA] p-4 transition hover:border-[#3478F6] hover:bg-[#EAF2FE]"
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="mt-2 text-[11px] font-semibold text-[#6B7280]">
                      {t(key)}
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-center text-xs text-[#9CA3AF]">
                {t("dash.miniDesc")}
              </p>
            </div>

            {/* === 8. BẢNG XẾP HẠNG & HƯỚNG DẪN === */}
            <LeaderboardCard />
            <HomeTutorial />

            {/* === 9. BIỂU ĐỒ COIN 7 NGÀY === */}
            <CoinChart chartData={chartData} chartLoading={chartLoading} />
          </>
        )}
      </main>

      {!loading && <Footer />}
      <BottomNav />
    </div>
  );
            }
