import React, { useState, useEffect } from "react";
import {
  Coins, Gift, Loader2, TrendingUp, Zap, Trophy, CheckSquare, Users, Flame, ArrowRight,
  Search, Bell, Globe, Menu, Rocket, Crown, Menu as MenuIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";
import Sidebar from "../components/Sidebar.jsx";

const WEEKDAYS = ["Thứ 7", "CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 11) return "Chào buổi sáng";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

function StatCard({ icon: Icon, iconBg, iconColor, value, label }) {
  return (
    <div className="rounded-2xl border border-white bg-white p-4 shadow-sm shadow-slate-200/70 transition hover:shadow-md">
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
  const { profile } = useProfile(user?.id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [marketingCode, setMarketingCode] = useState("");
  const [refMessage, setRefMessage] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refFromUrl = urlParams.get("ref");
    if (refFromUrl) {
      setMarketingCode(refFromUrl);
    }
  }, []);

  const handleSubmitCode = async () => {
    if (!marketingCode.trim()) {
      setRefMessage({ type: "error", text: "Vui lòng nhập mã!" });
      return;
    }

    const { data: campaign } = await supabase
      .from("marketing_campaigns")
      .select("id")
      .eq("marketing_code", marketingCode.trim().toUpperCase())
      .single();

    if (!campaign) {
      setRefMessage({ type: "error", text: "Mã không hợp lệ!" });
      return;
    }

    const sessionHash = Math.random().toString(36).substring(2);
    await supabase.from("marketing_sessions").insert({
      campaign_id: campaign.id,
      visitor_hash: sessionHash,
      session_hash: sessionHash,
      status: "pending"
    });

    setRefMessage({ type: "success", text: "Đã ghi nhận lượt giới thiệu!" });
    setMarketingCode("");
  };

  const displayName = profile.username || user?.user_metadata?.username || user?.email?.split("@")[0] || "Bạn";
  const initial = displayName.charAt(0).toUpperCase();
  const expPct = Math.min(100, Math.round((profile.exp / (profile.exp_target || 100)) * 100));

  const last7Days = [0, 5, 12, 8, 15, 20, 0];
  const maxDay = Math.max(1, ...last7Days);
  const totalCoins7Days = last7Days.reduce((a, b) => a + b, 0);

  const todayTasksDone = profile.tasks_completed_today || 0;
  const todayTasksTotal = 3;
  const todayTaskPct = Math.min(100, Math.round((todayTasksDone / todayTasksTotal) * 100));

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-24 font-[Be_Vietnam_Pro]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
      `}</style>

      <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-slate-100 bg-gradient-to-b from-sky-50/80 to-white/90 px-4 py-3 shadow-sm backdrop-blur-md">
        <button
          aria-label="Mở menu"
          onClick={() => setSidebarOpen(true)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-white hover:shadow-sm"
        >
          <MenuIcon size={19} />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-400 shadow-sm">
          <Search size={15} className="shrink-0" />
          <span className="truncate">Tìm kiếm</span>
        </div>
        <button className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
          <Bell size={16} className="text-slate-600" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
        </button>
        <button className="flex h-9 shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 text-sm shadow-sm">
          <Globe size={15} className="text-slate-500" /> 🇻🇳 VI
        </button>
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-bold text-white shadow-md shadow-sky-500/30">
          {initial}
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-5 px-4 py-5">
        {/* HERO */}
        <div className="rounded-3xl border border-sky-100 bg-gradient-to-b from-sky-100 via-sky-50 to-white p-6 shadow-lg shadow-sky-100">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-sky-700 shadow-sm">
            ✨ Hoàn thành nhiệm vụ hôm nay để nhận thưởng bonus
          </span>

          <h1 className="font-display mt-3 text-[26px] font-bold leading-tight text-slate-900">
            {getGreeting()},
            <br />
            <span className="text-sky-600">{displayName}</span> 👋
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Theo dõi tiến độ, gom Coin và leo top bảng xếp hạng.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button onClick={() => navigate("/tasks")} className="flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/30 transition hover:brightness-110">
              <Rocket size={15} /> Bắt đầu nhiệm vụ
            </button>
            <button onClick={() => navigate("/invite")} className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:shadow-md">
              <Gift size={15} /> Mời bạn
            </button>
          </div>

          {/* BALANCE CARD */}
          <div className="mt-5 rounded-2xl border border-white bg-white p-4 shadow-md shadow-sky-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Số dư
              </span>
              <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600 shadow-sm">
                <Crown size={12} /> LV {profile.level}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <Coins size={26} className="text-amber-400" />
              <span className="text-3xl font-bold text-slate-900">{profile.coins}</span>
              <span className="text-slate-400">Coin</span>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>EXP</span>
                <span>
                  {profile.exp}/{profile.exp_target}
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600"
                  style={{ width: `${expPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* NHẬP MÃ MARKETING */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-700 mb-2">🎁 Bạn có mã Marketing?</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={marketingCode}
              onChange={(e) => setMarketingCode(e.target.value)}
              placeholder="Nhập mã..."
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-400"
            />
            <button
              onClick={handleSubmitCode}
              className="rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Nhập
            </button>
          </div>
          {refMessage && (
            <p className={`mt-2 text-xs ${refMessage.type === "success" ? "text-emerald-600" : "text-rose-500"}`}>
              {refMessage.text}
            </p>
          )}
          <p className="mt-2 text-[11px] text-slate-400">Nhập mã để ghi nhận lượt truy cập cho người giới thiệu.</p>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={CheckSquare} iconBg="bg-sky-50" iconColor="text-sky-500" value={3} label="Nhiệm vụ khả dụng" />
          <StatCard icon={Trophy} iconBg="bg-emerald-50" iconColor="text-emerald-500" value={todayTasksDone} label="Hoàn thành hôm nay" />
          <StatCard icon={Coins} iconBg="bg-amber-50" iconColor="text-amber-500" value={profile.coins_earned_today || 0} label="Coin kiếm hôm nay" />
          <StatCard icon={Users} iconBg="bg-blue-50" iconColor="text-blue-500" value={profile.referrals_count || 0} label="Bạn đã mời" />
        </div>

        {/* STREAK CARD */}
        <div className="flex items-center gap-4 rounded-2xl border border-white bg-white p-4 shadow-sm shadow-slate-200/70">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50">
            <Flame size={22} className="text-orange-500" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Giữ lửa
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {profile.streak_days} <span className="text-sm font-medium text-slate-500">ngày</span>
            </p>
            <p className="text-xs text-slate-500">
              Kỷ lục: <span className="font-semibold text-orange-600">{profile.streak_record}</span>
            </p>
          </div>
        </div>

        {/* TASK STREAK MILESTONES */}
        <div className="rounded-2xl border border-white bg-white p-4 shadow-sm shadow-slate-200/70">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              ✨ Chuỗi nhiệm vụ hôm nay
            </span>
            <span className="text-xs text-slate-400">Đã làm: {todayTasksDone}</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2.5">
            {[
              { n: "1 nv", bonus: "+50", done: todayTasksDone >= 1 },
              { n: "5 nv", bonus: "+200", done: todayTasksDone >= 5 },
              { n: "10 nv", bonus: "+400", done: todayTasksDone >= 10 },
            ].map((m) => (
              <div key={m.n} className={`rounded-xl border p-3 text-center ${m.done ? "border-amber-200 bg-amber-50" : "border-slate-100 bg-slate-50"}`}>
                <p className="text-xs font-medium text-slate-500">{m.n}</p>
                <p className="mt-1 flex items-center justify-center gap-1 text-sm font-bold text-amber-600">
                  <Coins size={13} /> {m.bonus}
                </p>
                <div className="mt-2 h-1 w-full rounded-full bg-slate-200">
                  {m.done && <div className="h-full rounded-full bg-amber-400" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7-DAY COIN CHART */}
        <div className="rounded-2xl border border-white bg-white p-4 shadow-sm shadow-slate-200/70">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              <TrendingUp size={15} className="text-sky-500" /> Coin 7 ngày qua
            </span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
              +{profile.coins_earned_today || 0} hôm nay
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalCoins7Days} <span className="text-sm font-normal text-slate-400">Coin</span>
          </p>
          <div className="mt-4 flex h-16 items-end gap-2">
            {last7Days.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-sky-400 to-blue-500"
                  style={{ height: `${Math.max(4, (v / maxDay) * 100)}%` }}
                />
                <span className="text-[10px] text-slate-400">{WEEKDAYS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* TODAY PROGRESS RING */}
        <div className="rounded-2xl border border-white bg-white p-5 text-center shadow-sm shadow-slate-200/70">
          <span className="flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-900">
            <CheckSquare size={15} className="text-sky-500" /> Tiến độ hôm nay
          </span>
          <div
            className="mx-auto mt-4 flex h-32 w-32 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(#38bdf8 ${todayTaskPct * 3.6}deg, #e2e8f0 0deg)`,
            }}
          >
            <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white">
              <span className="text-2xl font-bold text-slate-900">{todayTaskPct}%</span>
              <span className="text-xs text-slate-400">
                {todayTasksDone}/{todayTasksTotal}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate("/tasks")}
            className="mx-auto mt-4 flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
          >
            Đi đến nhiệm vụ <ArrowRight size={14} />
          </button>
        </div>
      </main>

      <BottomNav />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        displayName={displayName}
        initial={initial}
        coins={profile.coins}
        level={profile.level}
      />
    </div>
  );
                                          }
