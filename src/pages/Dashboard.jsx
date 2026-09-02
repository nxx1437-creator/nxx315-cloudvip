import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Coins, Gift, Trophy, Users, Flame, CheckSquare, Rocket, Crown, Star, ShoppingBag, ArrowLeftRight, Headphones } from "lucide-react";
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
        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${iconBg}`}>
          <Icon size={15} className={iconColor} />
        </span>
      </div>
      <p className="mt-1 text-xs text-[#6B7280]">{label}</p>
    </div>
  );
}

function QuickAction({ icon: Icon, iconBg, iconColor, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white p-4 text-center transition hover:border-sky-200"
    >
      <span className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBg}`}>
        <Icon size={18} className={iconColor} />
      </span>
      <span className="text-xs font-semibold text-[#374151]">{label}</span>
    </button>
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
  const expPct = Math.min(100, Math.round((profile?.exp || 0) / ((profile?.exp_target || 100)) * 100));

  const todayTasksDone = profile?.tasks_completed_today || 0;
  const todayTasksTotal = 3;
  const todayTaskPct = Math.min(100, Math.round((todayTasksDone / todayTasksTotal) * 100));

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F9FC]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-sky-500"></div>
          <p className="mt-4 text-[#6B7280]">Đang tải...</p>
        </div>
      </div>
    );
    }
  return (
    <div className="min-h-screen bg-[#F7F9FC] pb-24 text-[#111827]">
      <TopHeader />

      <main className="mx-auto max-w-md space-y-4 px-4 py-5">

        {/* Hero */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-600">
            ✨ Hoàn thành nhiệm vụ hôm nay để nhận thưởng bonus
          </span>

          <h1 className="mt-3 text-2xl font-bold leading-tight text-[#111827]">
            {getGreeting()},
            <br />
            <span className="text-sky-500">{displayName}</span> 👋
          </h1>
          <p className="mt-1.5 text-sm text-[#6B7280]">Theo dõi tiến độ, gom Coin và leo top bảng xếp hạng.</p>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <button onClick={() => navigate("/tasks")} className="flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-105">
              <Rocket size={15} /> Bắt đầu nhiệm vụ
            </button>
            <button onClick={() => navigate("/invite")} className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-5 py-2.5 text-sm font-semibold text-[#374151]">
              <Gift size={15} /> Mời bạn
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-[#E5E7EB] bg-[#F7F9FC] p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#6B7280]">SỐ DƯ</span>
              <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">
                <Crown size={12} /> LV{profile?.level || 0}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <Coins size={24} className="text-amber-400" />
              <span className="text-3xl font-bold text-[#111827]">{profile?.coins || 0}</span>
              <span className="text-[#9CA3AF]">Coin</span>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
                <span>EXP</span>
                <span>{profile?.exp || 0}/{profile?.exp_target || 100}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                <div className="h-full rounded-full bg-sky-500" style={{ width: `${expPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Mua hàng kiếm sao */}
        <button
          onClick={() => navigate("/shop-earn")}
          className="flex w-full items-center justify-between rounded-2xl border border-[#E5E7EB] bg-white p-4 transition hover:border-amber-200"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <ShoppingBag size={17} />
            </span>
            <div className="text-left">
              <p className="flex items-center gap-1 text-sm font-bold text-[#111827]">
                <Star size={12} className="fill-amber-500 text-amber-500" />
                Mua hàng kiếm sao
              </p>
              <p className="text-xs text-[#9CA3AF]">Đổi điểm sang Xu hoặc rút về ngân hàng</p>
            </div>
          </div>
          <span className="text-[#D1D5DB]">→</span>
        </button>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={CheckSquare} iconBg="bg-sky-50" iconColor="text-sky-500" value={0} label="Nhiệm vụ khả dụng" />
          <StatCard icon={Trophy} iconBg="bg-emerald-50" iconColor="text-emerald-500" value={todayTasksDone} label="Hoàn thành hôm nay" />
          <StatCard icon={Coins} iconBg="bg-amber-50" iconColor="text-amber-500" value={profile?.coins_earned_today || 0} label="Coin kiếm hôm nay" />
          <StatCard icon={Users} iconBg="bg-blue-50" iconColor="text-blue-500" value={profile?.referrals_count || 0} label="Bạn đã mời" />
        </div>

        {/* Streak */}
        <div className="flex items-center gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-50">
            <Flame size={22} className="text-orange-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#9CA3AF]">GIỮ LỬA</p>
            <p className="text-2xl font-bold text-[#111827]">{profile?.streak_days || 0} <span className="text-sm font-medium text-[#6B7280]">ngày</span></p>
            <p className="text-xs text-[#6B7280]">Kỷ lục: <span className="font-semibold text-orange-600">{profile?.streak_record || 0}</span></p>
          </div>
        </div>

        {/* Progress */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 text-center">
          <span className="flex items-center justify-center gap-1.5 text-sm font-semibold text-[#111827]">
            <CheckSquare size={15} className="text-sky-500" /> Tiến độ hôm nay
          </span>
          <div className="mx-auto mt-4 flex h-32 w-32 items-center justify-center rounded-full" style={{ background: `conic-gradient(#0ea5e9 ${todayTaskPct * 3.6}deg, #E5E7EB 0deg)` }}>
            <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white">
              <span className="text-2xl font-bold text-[#111827]">{todayTaskPct}%</span>
              <span className="text-xs text-[#9CA3AF]">{todayTasksDone}/{todayTasksTotal}</span>
            </div>
          </div>
          <button onClick={() => navigate("/tasks")} className="mx-auto mt-4 flex items-center gap-1.5 rounded-xl bg-[#F3F4F6] px-4 py-2 text-sm font-medium text-[#374151]">
            Đi đến nhiệm vụ
          </button>
        </div>

        {/* Hành động nhanh */}
        <div>
          <p className="mb-3 text-sm font-bold text-[#111827]">Hành động nhanh</p>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction icon={CheckSquare} iconBg="bg-sky-50" iconColor="text-sky-500" label="Nhiệm vụ" onClick={() => navigate("/tasks")} />
            <QuickAction icon={ShoppingBag} iconBg="bg-sky-50" iconColor="text-sky-500" label="Cửa hàng" onClick={() => navigate("/store")} />
            <QuickAction icon={ArrowLeftRight} iconBg="bg-amber-50" iconColor="text-amber-500" label="Nạp / Rút" onClick={() => navigate("/shop-earn")} />
            <QuickAction icon={Headphones} iconBg="bg-emerald-50" iconColor="text-emerald-500" label="Hỗ trợ" onClick={() => navigate("/contact")} />
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
          }
