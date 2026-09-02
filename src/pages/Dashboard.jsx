import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Coins, Gift, Trophy, Users, Flame, TrendingUp, CheckSquare, Rocket, Crown, Star, ShoppingBag } from "lucide-react";
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
    <div className="rounded-2xl border border-white bg-white p-4 shadow-sm shadow-slate-200/70">
      <div className="flex items-start justify-between">
        <span className="text-2xl font-bold text-slate-900">{value}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${iconBg}`}>
          <Icon size={15} className={iconColor} />
        </span>
      </div>
      <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { session } = useSession();
  const user = session?.user;
  const [profile, setProfile] = useState({ coins: 0, level: 0, exp: 0, exp_target: 100, tasks_completed_today: 0, coins_earned_today: 0, referrals_count: 0, streak_days: 0, streak_record: 0, username: "" });
  const [loading, setLoading] = useState(true);
  
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

  const displayName = profile?.username || user?.user_metadata?.username || user?.email?.split("@")[0] || "Bạn";
  const initial = displayName.charAt(0).toUpperCase();
  const expPct = Math.min(100, Math.round((profile?.exp || 0) / ((profile?.exp_target || 100)) * 100));

  const todayTasksDone = profile?.tasks_completed_today || 0;
  const todayTasksTotal = 3;
  const todayTaskPct = Math.min(100, Math.round((todayTasksDone / todayTasksTotal) * 100));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
          <p className="mt-4 text-slate-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-24 font-[Be_Vietnam_Pro]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
      `}</style>

      {/* Header */}
      <TopHeader />

      <main className="mx-auto max-w-md space-y-5 px-4 py-5">
        {/* Hero */}
        <div className="rounded-3xl border border-sky-100 bg-gradient-to-b from-sky-100 via-sky-50 to-white p-6 shadow-lg shadow-sky-100">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-sky-700 shadow-sm">
            ✨ Hoàn thành nhiệm vụ hôm nay để nhận thưởng bonus
          </span>

          <h1 className="font-display mt-3 text-[26px] font-bold leading-tight text-slate-900">
            {getGreeting()},
            <br />
            <span className="text-sky-600">{displayName}</span> 👋
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">Theo dõi tiến độ, gom Coin và leo top bảng xếp hạng.</p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button onClick={() => navigate("/tasks")} className="flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/30 transition hover:brightness-110">
              <Rocket size={15} /> Bắt đầu nhiệm vụ
            </button>
            <button onClick={() => navigate("/invite")} className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:shadow-md">
              <Gift size={15} /> Mời bạn
            </button>
          </div>

          <button
            onClick={() => navigate("/shop-earn")}
            className="mt-3 flex w-full items-center justify-between rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                <ShoppingBag size={19} />
              </span>
              <div className="text-left">
                <p className="flex items-center gap-1 text-sm font-black text-slate-900">
                  <Star size={13} className="fill-amber-500 text-amber-500" />
                  Mua hàng kiếm sao
                </p>
                <p className="text-xs text-slate-400">Đổi điểm sang Xu hoặc rút về ngân hàng</p>
              </div>
            </div>
            <span className="text-lg font-black text-amber-400">→</span>
          </button>

          <div className="mt-5 rounded-2xl border border-white bg-white p-4 shadow-md shadow-sky-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Số dư</span>
              <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600 shadow-sm">
                <Crown size={12} /> LV {profile?.level || 0}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <Coins size={26} className="text-amber-400" />
              <span className="text-3xl font-bold text-slate-900">{profile?.coins || 0}</span>
              <span className="text-slate-400">Coin</span>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>EXP</span>
                <span>{profile?.exp || 0}/{profile?.exp_target || 100}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600" style={{ width: `${expPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={CheckSquare} iconBg="bg-sky-50" iconColor="text-sky-500" value={0} label="Nhiệm vụ khả dụng" />
          <StatCard icon={Trophy} iconBg="bg-emerald-50" iconColor="text-emerald-500" value={todayTasksDone} label="Hoàn thành hôm nay" />
          <StatCard icon={Coins} iconBg="bg-amber-50" iconColor="text-amber-500" value={profile?.coins_earned_today || 0} label="Coin kiếm hôm nay" />
          <StatCard icon={Users} iconBg="bg-blue-50" iconColor="text-blue-500" value={profile?.referrals_count || 0} label="Bạn đã mời" />
        </div>

        {/* Streak */}
        <div className="flex items-center gap-4 rounded-2xl border border-white bg-white p-4 shadow-sm shadow-slate-200/70">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50">
            <Flame size={22} className="text-orange-500" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Giữ lửa</p>
            <p className="text-2xl font-bold text-slate-900">{profile?.streak_days || 0} <span className="text-sm font-medium text-slate-500">ngày</span></p>
            <p className="text-xs text-slate-500">Kỷ lục: <span className="font-semibold text-orange-600">{profile?.streak_record || 0}</span></p>
          </div>
        </div>

        {/* Progress */}
        <div className="rounded-2xl border border-white bg-white p-5 text-center shadow-sm shadow-slate-200/70">
          <span className="flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-900">
            <CheckSquare size={15} className="text-sky-500" /> Tiến độ hôm nay
          </span>
          <div className="mx-auto mt-4 flex h-32 w-32 items-center justify-center rounded-full" style={{ background: `conic-gradient(#38bdf8 ${todayTaskPct * 3.6}deg, #e2e8f0 0deg)` }}>
            <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white">
              <span className="text-2xl font-bold text-slate-900">{todayTaskPct}%</span>
              <span className="text-xs text-slate-400">{todayTasksDone}/{todayTasksTotal}</span>
            </div>
          </div>
          <button onClick={() => navigate("/tasks")} className="mx-auto mt-4 flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200">
            Đi đến nhiệm vụ
          </button>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
