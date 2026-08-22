import React, { useState } from "react";
import { Coins, Rocket, Gift, History, ChevronRight, Zap, Target, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import useTasks from "../hooks/useTasks.js";
import AppBackground from "../components/AppBackground.jsx";
import GlassCard from "../components/GlassCard.jsx";
import GlowButton from "../components/GlowButton.jsx";
import Toast from "../components/Toast.jsx";
import BottomNav from "../components/BottomNav.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { tasks, completedToday } = useTasks();
  const [toast, setToast] = useState(null);

  const displayName = profile.username || "Người dùng";
  const initial = displayName.charAt(0).toUpperCase();

  const expPct = Math.min(100, Math.round((profile.exp / (profile.exp_target || 100)) * 100));

  const missionCount = tasks.length;
  const missionDone = completedToday;
  const missionPct = missionCount > 0 ? Math.round((missionDone / missionCount) * 100) : 0;

  return (
    <AppBackground>
      <div className="mx-auto max-w-md px-4 py-5">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-lg font-bold text-white">
              {initial}
            </div>
            <div>
              <p className="text-xs text-slate-400">Xin chào,</p>
              <h1 className="font-display text-lg font-bold text-white">{displayName}</h1>
            </div>
          </div>
          <button onClick={() => navigate("/profile")} className="text-slate-400 transition hover:text-white">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Số dư nổi bật */}
        <GlassCard className="mb-6 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Số dư Coin</p>
              <div className="mt-2 flex items-center gap-2">
                <Coins size={32} className="text-amber-400" />
                <span className="font-display text-4xl font-bold text-white">{profile.coins}</span>
                <span className="text-sm text-slate-400">Coin</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                <TrendingUp size={12} /> +{profile.coins_earned_today || 0} hôm nay
              </span>
              <span className="text-xs text-slate-400">Lv. {profile.level || 1}</span>
            </div>
          </div>
        </GlassCard>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Hành động nhanh</h2>
          <div className="grid grid-cols-3 gap-3">
            <GlassCard onClick={() => navigate("/tasks")} className="cursor-pointer p-4 text-center">
              <Zap size={20} className="mx-auto text-cyan-400" />
              <p className="mt-2 text-xs font-medium text-white">Kiếm Coin</p>
            </GlassCard>
            <GlassCard onClick={() => navigate("/store")} className="cursor-pointer p-4 text-center">
              <Gift size={20} className="mx-auto text-purple-400" />
              <p className="mt-2 text-xs font-medium text-white">Đổi thưởng</p>
            </GlassCard>
            <GlassCard onClick={() => navigate("/wallet")} className="cursor-pointer p-4 text-center">
              <History size={20} className="mx-auto text-blue-400" />
              <p className="mt-2 text-xs font-medium text-white">Lịch sử</p>
            </GlassCard>
          </div>
        </div>

        {/* Nhiệm vụ dạng Card */}
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Nhiệm vụ hôm nay</h2>
          <GlassCard className="mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Target size={20} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Làm 1 nhiệm vụ</p>
                  <p className="text-xs text-slate-400">Nhận +50 Coin</p>
                </div>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
                {missionDone >= 1 ? "Đã xong" : "Chưa làm"}
              </span>
            </div>
          </GlassCard>

          <GlassCard className="mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
                  <Target size={20} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Làm 5 nhiệm vụ</p>
                  <p className="text-xs text-slate-400">Nhận +200 Coin</p>
                </div>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
                {missionDone >= 5 ? "Đã xong" : `${missionDone}/5`}
              </span>
            </div>
          </GlassCard>
        </div>

        {/* Tiến độ hôm nay */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Tiến độ hôm nay</p>
            <span className="text-xs text-slate-400">{missionPct}%</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all duration-500" style={{ width: `${missionPct}%` }} />
          </div>
        </GlassCard>
      </div>

      <BottomNav />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AppBackground>
  );
}
