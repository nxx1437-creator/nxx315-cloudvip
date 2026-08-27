import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  Globe,
  Menu,
  Sparkles,
  Zap,
  Trophy,
  Coins,
  Clock,
  Flame,
  ExternalLink,
} from "lucide-react";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import useTasks from "../hooks/useTasks.js";
import BottomNav from "../components/BottomNav.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { supabase } from "../lib/supabaseClient.js";

function hoursUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.max(1, Math.round((midnight - now) / 1000 / 60 / 60));
}

function MiniStat({ value, label, icon: Icon, bg, valueColor, iconColor }) {
  return (
    <div className={`rounded-xl p-3.5 ${bg}`}>
      <div className="flex items-start justify-between">
        <span className={`text-2xl font-bold ${valueColor}`}>{value}</span>
        <Icon size={17} className={iconColor} />
      </div>
      <p className="mt-1 text-xs text-slate-600/80">{label}</p>
    </div>
  );
}

export default function Tasks() {
  const navigate = useNavigate();
  const { session } = useSession();
  const user = session?.user;
  const { profile } = useProfile(user?.id);
  const { tasks, loading, reload } = useTasks(user?.id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [startingTaskId, setStartingTaskId] = useState(null);

  const isAdmin = profile.is_admin;
  const isBlocked = profile.is_flagged && !isAdmin;

  const displayName =
    profile.username || user?.user_metadata?.username || user?.email?.split("@")[0] || "Bạn";
  const initial = displayName.charAt(0).toUpperCase();

  const filteredTasks = useMemo(
    () => tasks.filter((t) => t.provider.toLowerCase().includes(query.trim().toLowerCase())),
    [tasks, query]
  );

  const totalRemaining = tasks.reduce((sum, t) => sum + t.remainingToday, 0);
  const availableCount = tasks.filter((t) => t.remainingToday > 0).length;

  const handleStart = async (task) => {
  if (!user?.id) {
    alert("Vui lòng đăng nhập!");
    return;
  }

  try {
    // Lấy session token
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;

    if (!accessToken) {
      alert("Không lấy được token đăng nhập!");
      return;
    }

    // Gọi Edge Function bằng fetch
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/start-task`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ task_id: task.id }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert("Lỗi: " + (data.error || "Không xác định"));
      return;
    }

    if (data.error) {
      alert(data.error);
      return;
    }

    if (data.shortUrl) {
      window.open(data.shortUrl, "_blank");
    } else {
      alert("Không lấy được link nhiệm vụ!");
    }

  } catch (err) {
    alert("Lỗi: " + err.message);
  }
};
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
          <Menu size={19} />
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

      <main className="mx-auto max-w-md space-y-4 px-4 py-5">
        <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-200 via-sky-50 to-white p-5 shadow-lg shadow-sky-100">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-sky-700 shadow-sm">
            <Sparkles size={12} /> TRUNG TÂM NHIỆM VỤ
          </span>

          <div className="mt-3 flex items-start gap-3">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-md shadow-sky-500/30">
              <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
                <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="4" y="4" width="16" height="16" rx="4" stroke="white" strokeWidth="2.2" />
              </svg>
              <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold leading-tight text-slate-900">
                Kiếm <span className="text-sky-600">Coin</span> mỗi ngày
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                {tasks.length} nhiệm vụ đang chạy ·{" "}
                <span className="font-medium text-emerald-600">{totalRemaining} lượt còn</span>
              </p>
            </div>
          </div>

          {(isAdmin || profile.risk_score > 0) && (
            <div
              className={`mt-3 rounded-xl px-3 py-2 text-xs font-semibold ${
                isAdmin
                  ? "bg-purple-100 text-purple-700"
                  : isBlocked
                  ? "bg-rose-100 text-rose-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {isAdmin
                ? "👑 Admin — Miễn kiểm tra"
                : isBlocked
                ? `🚫 Rủi ro: ${profile.risk_score}/100 — Tài khoản bị hạn chế làm nhiệm vụ`
                : `⚠️ Rủi ro: ${profile.risk_score}/100`}
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <MiniStat value={availableCount} label="KHẢ DỤNG" icon={Zap} bg="bg-sky-100/70" valueColor="text-sky-700" iconColor="text-sky-500" />
            <MiniStat value={profile.tasks_completed_today || 0} label="HOÀN THÀNH" icon={Trophy} bg="bg-emerald-100/60" valueColor="text-emerald-700" iconColor="text-emerald-500" />
            <MiniStat value={profile.coins_earned_today || 0} label="COIN HÔM NAY" icon={Coins} bg="bg-amber-100/60" valueColor="text-amber-700" iconColor="text-amber-500" />
            <MiniStat value={hoursUntilMidnight()} label="CÒN LẠI" icon={Clock} bg="bg-sky-100/70" valueColor="text-sky-700" iconColor="text-sky-500" />
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <Search size={16} className="text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm nhiệm vụ, nhà cung cấp..."
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
          />
        </div>

        {isBlocked && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
            <p className="text-sm font-semibold text-rose-700">🚫 Tài khoản của bạn đang bị tạm khóa làm nhiệm vụ</p>
            <p className="mt-1 text-xs text-rose-600">Vui lòng liên hệ hỗ trợ để được giải quyết</p>
          </div>
        )}

        {loading && <p className="py-8 text-center text-sm text-slate-400">Đang tải nhiệm vụ...</p>}
        {!loading && filteredTasks.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">Không có nhiệm vụ nào.</p>
        )}

        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const progressPct = Math.min(100, Math.round((task.completedToday / task.daily_limit) * 100));
            const isDone = task.remainingToday <= 0;

            return (
              <div key={task.id} className="overflow-hidden rounded-2xl border border-white bg-white shadow-sm shadow-slate-200/70">
                <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 to-blue-600" />
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {task.logo_url ? (
                        <img src={task.logo_url} alt={task.provider} className="h-11 w-11 rounded-xl object-cover" />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                          {task.provider.slice(0, 2)}
                        </div>
                      )}
                      <span className="text-base font-bold text-slate-900">{task.provider}</span>
                    </div>
                    {task.is_hot && (
                      <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-500">
                        <Flame size={12} /> HOT
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">Phần thưởng</p>
                      <p className="flex items-center gap-1 text-lg font-bold text-amber-500">
                        <Coins size={15} /> {task.reward_coins} <span className="text-xs font-normal text-slate-400">/lượt</span>
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                      {task.remainingToday} còn
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Hôm nay</span>
                      <span>{task.completedToday}/{task.daily_limit}</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>

                  <button
                    onClick={() => handleStart(task)}
                    disabled={isDone || startingTaskId === task.id || isBlocked}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-sky-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ExternalLink size={15} />
                    {isBlocked ? "🚫 Tài khoản bị khóa" : isDone ? "Đã hết lượt hôm nay" : startingTaskId === task.id ? "Đang mở..." : "Làm nhiệm vụ"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        displayName={displayName}
        initial={initial}
        coins={profile.coins}
        level={profile.level}
      />
      <BottomNav />
    </div>
  );
}
