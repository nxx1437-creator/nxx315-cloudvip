import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Coins, Gift, Trophy, Users, Flame, CheckSquare, Rocket, Crown, Star, ShoppingBag, ArrowLeftRight, Headphones, BarChart3, Loader2, Check } from "lucide-react";
import useSession from "../hooks/useSession.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";
import TopHeader from "../components/TopHeader.jsx";
import Footer from "../components/Footer.jsx";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 11) return "Chào buổi sáng";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

function StatCard({ icon: Icon, iconBg, iconColor, value, label }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <div className="flex items-start justify-between">
        <span className="text-2xl font-bold text-[#111827]">{value}</span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${iconBg}`}>
          <Icon size={16} className={iconColor} />
        </span>
      </div>
      <p className="mt-1 text-xs text-[#667085]">{label}</p>
    </div>
  );
}

function QuickAction({ icon: Icon, iconBg, iconColor, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white p-4 text-center transition hover:border-[#3478F6]/30"
    >
      <span className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBg}`}>
        <Icon size={18} className={iconColor} />
      </span>
      <span className="text-xs font-semibold text-[#374151]">{label}</span>
    </button>
  );
}
function MilestoneCard({ milestone, reward, tasksDone, claimed, onClaim, claiming }) {
  const reached = tasksDone >= milestone;
  const progressPct = Math.min(100, Math.round((tasksDone / milestone) * 100));

  return (
    <button
      onClick={() => reached && !claimed && onClaim(milestone)}
      disabled={!reached || claimed || claiming}
      className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition ${
        claimed
          ? "border-emerald-200 bg-emerald-50"
          : reached
          ? "border-[#F2A900]/40 bg-[#FFF8ED]"
          : "border-[#E5E7EB] bg-white"
      }`}
    >
      <span className="text-xs font-bold text-[#111827]">{milestone} nv</span>
      <span className={`flex items-center gap-1 text-sm font-bold ${claimed ? "text-emerald-600" : "text-[#B87700]"}`}>
        {claimed ? <Check size={13} /> : <Coins size={13} />}
        +{reward}
      </span>
      <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
        <div
          className={`h-full rounded-full ${claimed ? "bg-emerald-400" : "bg-[#F2A900]"}`}
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </button>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { session } = useSession();
  const user = session?.user;
  const [profile, setProfile] = useState({ coins: 0, level: 0, exp: 0, exp_target: 100, tasks_completed_today: 0, coins_earned_today: 0, referrals_count: 0, streak_days: 0, streak_record: 0, username: "", milestone_1_claimed: false, milestone_5_claimed: false, milestone_10_claimed: false });
  const [loading, setLoading] = useState(true);
  const [claimingMilestone, setClaimingMilestone] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) {
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);
  useEffect(() => {
    const fetchChart = async () => {
      if (!user?.id) {
        setChartLoading(false);
        return;
      }

      const WEEKDAY_LABELS = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        days.push(d);
      }

      const rangeStart = days[0];

      const { data: rows } = await supabase
        .from("task_completions")
        .select("completed_at, coins_earned")
        .eq("user_id", user.id)
        .gte("completed_at", rangeStart.toISOString());

      const sumByDate = {};
      (rows || []).forEach((r) => {
        const key = new Date(r.completed_at).toDateString();
        sumByDate[key] = (sumByDate[key] || 0) + (r.coins_earned || 0);
      });

      const result = days.map((d) => ({
        label: WEEKDAY_LABELS[d.getDay()],
        value: sumByDate[d.toDateString()] || 0,
        isToday: d.toDateString() === new Date().toDateString(),
      }));

      setChartData(result);
      setChartLoading(false);
    };

    fetchChart();
  }, [user]);

  const displayName = profile?.username || user?.user_metadata?.username || user?.email?.split("@")[0] || "Bạn";
  const expPct = Math.min(100, Math.round((profile?.exp || 0) / ((profile?.exp_target || 100)) * 100));

  const todayTasksDone = profile?.tasks_completed_today || 0;
  const todayTasksTotal = 3;
  const todayTaskPct = Math.min(100, Math.round((todayTasksDone / todayTasksTotal) * 100));
  const handleClaimMilestone = async (milestone) => {
    if (!user?.id) return;
    setClaimingMilestone(milestone);

    const { data, error } = await supabase.rpc("claim_task_milestone", {
      p_user_id: user.id,
      p_milestone: milestone,
    });

    setClaimingMilestone(null);

    if (error) {
      alert("Lỗi: " + error.message);
      return;
    }

    if (!data?.success) {
      alert(data?.message || "Không thể nhận thưởng.");
      return;
    }

    const field = `milestone_${milestone}_claimed`;
    setProfile((prev) => ({
      ...prev,
      coins: (prev.coins || 0) + data.reward,
      [field]: true,
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7FB]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#3478F6]"></div>
          <p className="mt-4 text-[#667085]">Đang tải...</p>
        </div>
      </div>
    );
        }
  return (
    <div className="min-h-screen bg-[#F5F7FB] pb-24 text-[#111827]">
      <TopHeader />

      <main className="mx-auto max-w-md space-y-4 px-4 py-5">

        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-[#3478F6]/15 to-transparent blur-2xl" />

          <span className="relative inline-flex items-center gap-1.5 rounded-full bg-[#EAF2FE] px-3 py-1 text-xs font-semibold text-[#0878C9]">
            ✨ Hoàn thành nhiệm vụ hôm nay để nhận thưởng bonus
          </span>

          <h1 className="relative mt-3 text-2xl font-bold leading-tight text-[#111827]">
            {getGreeting()},
            <br />
            <span className="text-[#3478F6]">{displayName}</span> 👋
          </h1>
          <p className="relative mt-1.5 text-sm text-[#667085]">Theo dõi tiến độ, gom Coin và leo top bảng xếp hạng.</p>

          <div className="relative mt-4 flex flex-wrap gap-2.5">
            <button onClick={() => navigate("/tasks")} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3478F6] to-[#0878C9] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#3478F6]/25 transition hover:brightness-105">
              <Rocket size={15} /> Bắt đầu nhiệm vụ
            </button>
            <button onClick={() => navigate("/invite")} className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-5 py-2.5 text-sm font-semibold text-[#374151]">
              <Gift size={15} /> Mời bạn
            </button>
          </div>

          <div className="relative mt-4 rounded-2xl bg-[#F5F7FB] p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#667085]">SỐ DƯ</span>
              <span className="flex items-center gap-1 rounded-full bg-[#FFF4DB] px-2.5 py-1 text-xs font-semibold text-[#B87700]">
                <Crown size={12} /> LV{profile?.level || 0}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <Coins size={24} className="text-[#F2A900]" />
              <span className="text-3xl font-bold text-[#111827]">{profile?.coins || 0}</span>
              <span className="text-[#9CA3AF]">Coin</span>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
                <span>EXP</span>
                <span>{profile?.exp || 0}/{profile?.exp_target || 100}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                <div className="h-full rounded-full bg-[#3478F6]" style={{ width: `${expPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Mua hàng kiếm sao */}
        <button
          onClick={() => navigate("/shop-earn")}
          className="flex w-full items-center justify-between rounded-2xl border border-[#E5E7EB] bg-white p-4 transition hover:border-[#F2A900]/40"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF4DB] text-[#B87700]">
              <ShoppingBag size={17} />
            </span>
            <div className="text-left">
              <p className="flex items-center gap-1 text-sm font-bold text-[#111827]">
                <Star size={12} className="fill-[#F2A900] text-[#F2A900]" />
                Mua hàng kiếm sao
              </p>
              <p className="text-xs text-[#9CA3AF]">Đổi điểm sang Xu hoặc rút về ngân hàng</p>
            </div>
          </div>
          <span className="text-[#D1D5DB]">→</span>
        </button>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={CheckSquare} iconBg="bg-[#EAF2FE]" iconColor="text-[#3478F6]" value={0} label="Nhiệm vụ khả dụng" />
          <StatCard icon={Trophy} iconBg="bg-emerald-50" iconColor="text-emerald-600" value={todayTasksDone} label="Hoàn thành hôm nay" />
          <StatCard icon={Coins} iconBg="bg-[#FFF4DB]" iconColor="text-[#B87700]" value={profile?.coins_earned_today || 0} label="Coin kiếm hôm nay" />
          <StatCard icon={Users} iconBg="bg-[#EAF2FE]" iconColor="text-[#0878C9]" value={profile?.referrals_count || 0} label="Bạn đã mời" />
        </div>

        {/* Streak */}
        <div className="flex items-center gap-4 rounded-2xl border border-[#F3E4CC] bg-[#FFF8ED] p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white">
            <Flame size={22} className="text-[#FFB82E]" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#9C7A3F]">GIỮ LỬA</p>
            <p className="text-2xl font-bold text-[#111827]">{profile?.streak_days || 0} <span className="text-sm font-medium text-[#667085]">ngày</span></p>
            <p className="text-xs text-[#9C7A3F]">Kỷ lục: <span className="font-semibold">{profile?.streak_record || 0}</span></p>
          </div>
        </div>

        {/* Progress */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 text-center">
          <span className="flex items-center justify-center gap-1.5 text-sm font-semibold text-[#111827]">
            <CheckSquare size={15} className="text-[#3478F6]" /> Tiến độ hôm nay
          </span>
          <div className="mx-auto mt-4 flex h-32 w-32 items-center justify-center rounded-full" style={{ background: `conic-gradient(#3478F6 ${todayTaskPct * 3.6}deg, #E5E7EB 0deg)` }}>
            <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white">
              <span className="text-2xl font-bold text-[#111827]">{todayTaskPct}%</span>
              <span className="text-xs text-[#9CA3AF]">{todayTasksDone}/{todayTasksTotal}</span>
            </div>
          </div>
          <button onClick={() => navigate("/tasks")} className="mx-auto mt-4 flex items-center gap-1.5 rounded-xl bg-[#F5F7FB] px-4 py-2 text-sm font-medium text-[#374151]">
            Đi đến nhiệm vụ
          </button>
        </div>

        {/* Mốc thưởng chuỗi nhiệm vụ */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-[#111827]">✨ Chuỗi nhiệm vụ hôm nay</p>
            <span className="text-xs text-[#9CA3AF]">Đã làm: {todayTasksDone}</span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <MilestoneCard
              milestone={1}
              reward={50}
              tasksDone={todayTasksDone}
              claimed={profile?.milestone_1_claimed}
              claiming={claimingMilestone === 1}
              onClaim={handleClaimMilestone}
            />
            <MilestoneCard
              milestone={5}
              reward={200}
              tasksDone={todayTasksDone}
              claimed={profile?.milestone_5_claimed}
              claiming={claimingMilestone === 5}
              onClaim={handleClaimMilestone}
            />
            <MilestoneCard
              milestone={10}
              reward={400}
              tasksDone={todayTasksDone}
              claimed={profile?.milestone_10_claimed}
              claiming={claimingMilestone === 10}
              onClaim={handleClaimMilestone}
            />
          </div>
        </div>

        {/* Coin 7 ngày qua */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-bold text-[#111827]">
              <BarChart3 size={15} className="text-[#3478F6]" />
              Coin 7 ngày qua
            </p>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
              +{chartData.find((d) => d.isToday)?.value || 0} hôm nay
            </span>
          </div>

          {chartLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={20} className="animate-spin text-[#D1D5DB]" />
            </div>
          ) : chartData.every((d) => d.value === 0) ? (
            <div className="mt-5 flex flex-col items-center justify-center py-6 text-center">
              <BarChart3 size={28} className="text-[#D1D5DB]" />
              <p className="mt-2 text-sm font-medium text-[#9CA3AF]">Chưa có dữ liệu</p>
              <p className="mt-0.5 text-xs text-[#C4CAD2]">Hoàn thành nhiệm vụ để bắt đầu theo dõi thu nhập Coin</p>
            </div>
          ) : (
            <div className="mt-5 flex items-end justify-between gap-2" style={{ height: "120px" }}>
              {chartData.map((d, i) => {
                const max = Math.max(...chartData.map((x) => x.value), 1);
                const heightPct = Math.max(4, Math.round((d.value / max) * 100));
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                    <span className="text-[10px] font-bold text-[#9CA3AF]">{d.value > 0 ? d.value : ""}</span>
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className={`w-full rounded-t-md ${d.isToday ? "bg-[#3478F6]" : "bg-[#D9E7FD]"}`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className={`text-[10px] ${d.isToday ? "font-bold text-[#3478F6]" : "text-[#9CA3AF]"}`}>
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Hành động nhanh */}
        <div>
          <p className="mb-3 text-sm font-bold text-[#111827]">Hành động nhanh</p>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction icon={CheckSquare} iconBg="bg-[#EAF2FE]" iconColor="text-[#3478F6]" label="Nhiệm vụ" onClick={() => navigate("/tasks")} />
            <QuickAction icon={ShoppingBag} iconBg="bg-[#EAF2FE]" iconColor="text-[#3478F6]" label="Cửa hàng" onClick={() => navigate("/store")} />
            <QuickAction icon={ArrowLeftRight} iconBg="bg-[#FFF4DB]" iconColor="text-[#B87700]" label="Nạp / Rút" onClick={() => navigate("/shop-earn")} />
            <QuickAction icon={Headphones} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Hỗ trợ" onClick={() => navigate("/contact")} />
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
    }
