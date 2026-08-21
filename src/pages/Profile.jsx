import React, { useState } from "react";
import { User, Coins, Flame, ChevronRight, LogOut, Settings, Gift, Star, Users, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { profile } = useProfile();
  const [showLogout, setShowLogout] = useState(false);

  const displayName = profile.username || "Thành viên";
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-24 font-[Be_Vietnam_Pro]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 px-4 py-4 backdrop-blur-md">
        <h1 className="font-display text-xl font-bold text-slate-900">Tài khoản</h1>
      </header>

      <main className="mx-auto max-w-md space-y-5 px-4 py-5">
        {/* Profile Card */}
        <div className="flex items-center gap-4 rounded-3xl border border-sky-100 bg-gradient-to-b from-sky-50 to-white p-5 shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-2xl font-bold text-white shadow-md shadow-blue-500/30">
            {initial}
          </div>
          <div className="flex-1">
            <h2 className="font-display text-lg font-bold text-slate-900">{displayName}</h2>
            <p className="text-xs text-slate-400">{session?.user?.email || "Chưa có email"}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600">
                <Crown size={11} /> Level {profile.level || 1}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-600">
                <Flame size={11} /> {profile.streak_days || 0} ngày
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
            <Coins size={18} className="mx-auto text-amber-500" />
            <p className="mt-1 text-lg font-bold text-slate-900">{profile.coins || 0}</p>
            <p className="text-[10px] uppercase text-slate-400">Coin</p>
          </div>
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
            <Users size={18} className="mx-auto text-blue-500" />
            <p className="mt-1 text-lg font-bold text-slate-900">{profile.referrals_count || 0}</p>
            <p className="text-[10px] uppercase text-slate-400">Đã mời</p>
          </div>
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
            <Star size={18} className="mx-auto text-orange-500" />
            <p className="mt-1 text-lg font-bold text-slate-900">{profile.coins_earned_today || 0}</p>
            <p className="text-[10px] uppercase text-slate-400">Coin hôm nay</p>
          </div>
        </div>

        {/* Menu Actions */}
        <div className="overflow-hidden rounded-2xl border border-white bg-white shadow-sm">
          <button onClick={() => navigate("/store")} className="flex w-full items-center gap-3 border-b border-slate-50 px-4 py-4 transition hover:bg-slate-50">
            <Gift size={18} className="text-sky-500" />
            <span className="flex-1 text-left text-sm font-medium text-slate-700">Cửa hàng đổi quà</span>
            <ChevronRight size={16} className="text-slate-300" />
          </button>
          <button onClick={() => navigate("/wallet")} className="flex w-full items-center gap-3 border-b border-slate-50 px-4 py-4 transition hover:bg-slate-50">
            <Coins size={18} className="text-amber-500" />
            <span className="flex-1 text-left text-sm font-medium text-slate-700">Lịch sử Coin</span>
            <ChevronRight size={16} className="text-slate-300" />
          </button>
          <button onClick={() => navigate("/settings")} className="flex w-full items-center gap-3 px-4 py-4 transition hover:bg-slate-50">
            <Settings size={18} className="text-slate-400" />
            <span className="flex-1 text-left text-sm font-medium text-slate-700">Cài đặt</span>
            <ChevronRight size={16} className="text-slate-300" />
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={() => setShowLogout(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
        >
          <LogOut size={16} /> Đăng xuất
        </button>
      </main>

      {/* Modal xác nhận đăng xuất */}
      {showLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl">
            <h3 className="font-display text-lg font-bold text-slate-900">Xác nhận đăng xuất?</h3>
            <p className="mt-1 text-sm text-slate-500">Bạn sẽ cần đăng nhập lại để sử dụng dịch vụ.</p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowLogout(false)}
                className="flex-1 rounded-full bg-slate-100 py-2.5 text-sm font-semibold text-slate-600"
              >
                Huỷ
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 rounded-full bg-rose-500 py-2.5 text-sm font-semibold text-white"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
      }
