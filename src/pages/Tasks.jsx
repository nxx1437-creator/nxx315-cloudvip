import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Sparkles,
  Zap,
  Trophy,
  Coins,
  Clock,
  Flame,
  ExternalLink,
  CheckCircle2,
  XCircle,
  History,
  ListChecks,
  AlertCircle,
  ShieldAlert,
  Send,
} from "lucide-react";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import useTasks from "../hooks/useTasks.js";
import BottomNav from "../components/BottomNav.jsx";
import TopHeader from "../components/TopHeader.jsx";
import { supabase } from "../lib/supabaseClient.js";

// =====================================================
// PROVIDER LOGO
// =====================================================
const SUPABASE_URL = "https://rwglwovohbyqmbbzdvdj.supabase.co";
const STORAGE_BUCKET = "game_logos";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const getImageUrl = (fileName) =>
  `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${fileName}`;

const PROVIDER_LOGOS = {
  layma: "layma.png",
  link4m: "link4m.png",
  site2s: "site2s.png",
  traffic68: "traffic68.png",
};

const getProviderLogo = (task) => {
  if (task?.logo_url) return task.logo_url;
  const key = String(task?.provider || "").toLowerCase().trim();
  const file = PROVIDER_LOGOS[key];
  return file ? getImageUrl(file) : null;
};

function ProviderLogo({ task }) {
  const [error, setError] = useState(false);
  const src = getProviderLogo(task);
  const initials = String(task?.provider || "?").slice(0, 2).toUpperCase();

  if (error || !src) {
    return (
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white shrink-0">
        {initials}
      </div>
    );
  }

  return (
    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-white">
      <img
        src={src}
        alt={task.provider}
        loading="lazy"
        decoding="async"
        onError={() => setError(true)}
        className="h-full w-full object-contain p-1"
      />
    </div>
  );
}

// =====================================================
// HELPERS
// =====================================================
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

function getHistoryStatus(status) {
  const s = String(status || "").toLowerCase();
  switch (s) {
    case "pending":
      return {
        label: "Đang chờ",
        cls: "bg-blue-50 text-blue-600 border-blue-100",
      };
    case "completed":
    case "success":
    case "done":
    case "verified":
      return {
        label: "Hoàn thành",
        cls: "bg-emerald-50 text-emerald-600 border-emerald-100",
      };
    case "expired":
      return {
        label: "Hết hạn",
        cls: "bg-slate-100 text-slate-500 border-slate-200",
      };
    case "cancelled":
      return {
        label: "Đã hủy",
        cls: "bg-amber-50 text-amber-600 border-amber-100",
      };
    case "failed":
      return {
        label: "Thất bại",
        cls: "bg-rose-50 text-rose-600 border-rose-100",
      };
    default:
      return {
        label: s || "—",
        cls: "bg-slate-100 text-slate-500 border-slate-200",
      };
  }
}

function formatDateTime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TaskCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white bg-white shadow-sm">
      <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 to-blue-600" />
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-100" />
            <div className="h-4 w-24 rounded bg-slate-100" />
          </div>
          <div className="h-6 w-14 rounded-full bg-slate-100" />
        </div>
        <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5">
          <div>
            <div className="h-2.5 w-20 rounded bg-slate-200" />
            <div className="mt-2 h-4 w-24 rounded bg-slate-200" />
          </div>
          <div className="h-5 w-14 rounded-full bg-slate-200" />
        </div>
        <div className="mt-3">
          <div className="h-1.5 w-full rounded-full bg-slate-100" />
        </div>
        <div className="mt-4 h-11 w-full rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-0"
          >
            <div className="h-3.5 w-20 rounded bg-slate-100" />
            <div className="h-5 w-20 rounded-full bg-slate-100" />
            <div className="h-3.5 w-16 rounded bg-slate-100" />
            <div className="h-3.5 w-28 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
export default function Tasks() {
  const navigate = useNavigate();
  const { session } = useSession();
  const user = session?.user;
  const { profile } = useProfile(user?.id);
  const { tasks, loading, reload } = useTasks(user?.id);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("hot");
  const [startingTaskId, setStartingTaskId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [ipBlocked, setIpBlocked] = useState(null); // { reason, can_appeal }
  const [checkingIp, setCheckingIp] = useState(true);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // ✅ Check IP lần đầu vào trang
useEffect(() => {
  if (!user?.id) return;

  const checkIp = async () => {
    setCheckingIp(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setCheckingIp(false);
        return;
      }

      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/log-ip`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (data.allowed === false) {
        setIpBlocked({
          reason: data.reason,
          can_appeal: data.can_appeal,
        });
      } else {
        setIpBlocked(null);
      }
    } catch (err) {
      console.error("Check IP error:", err);
    } finally {
      setCheckingIp(false);
    }
  };

  checkIp();
}, [user?.id]);

// Reload khi quay lại tab
useEffect(() => {
  const handleVisibility = () => {
    if (document.visibilityState === "visible") {
      reload();
      setHistoryLoaded(false);
    }
  };

  document.addEventListener("visibilitychange", handleVisibility);
  window.addEventListener("focus", handleVisibility);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibility);
    window.removeEventListener("focus", handleVisibility);
  };
}, [navigate, reload]);

  const isAdmin = profile.is_admin;
  const isBlocked = profile.is_flagged && !isAdmin;

  const filteredTasks = useMemo(() => {
    let list = tasks;

    if (activeTab === "hot") {
      list = list.filter((t) => t.is_hot);
    }

    const kw = query.trim().toLowerCase();
    if (kw) {
      list = list.filter((t) => t.provider.toLowerCase().includes(kw));
    }

    return list;
  }, [tasks, query, activeTab]);

  const totalRemaining = tasks.reduce((sum, t) => sum + t.remainingToday, 0);
  const availableCount = tasks.filter((t) => t.remainingToday > 0).length;
  const hotCount = tasks.filter((t) => t.is_hot).length;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    window.clearTimeout(window.__taskToast);
    window.__taskToast = window.setTimeout(() => setToast(null), 3500);
  };

  // Fetch history
  useEffect(() => {
    if (activeTab !== "history" || historyLoaded || !user?.id) return;

    const fetchHistory = async () => {
      setHistoryLoading(true);
      try {
        const { data: tokens, error: tokensErr } = await supabase
          .from("task_tokens")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (tokensErr) throw tokensErr;

        if (!tokens || tokens.length === 0) {
          setHistory([]);
          setHistoryLoaded(true);
          return;
        }

        const taskIds = [
          ...new Set(tokens.map((t) => t.task_id).filter(Boolean)),
        ];

        const { data: tasksList } = await supabase
          .from("tasks")
          .select("id, provider, reward_coins")
          .in("id", taskIds);

        const taskMap = {};
        (tasksList || []).forEach((t) => {
          taskMap[t.id] = t;
        });

        const enriched = tokens.map((t) => ({
          ...t,
          provider: taskMap[t.task_id]?.provider || "—",
          reward_coins:
            t.reward_coins || taskMap[t.task_id]?.reward_coins || 0,
        }));

        setHistory(enriched);
        setHistoryLoaded(true);
      } catch (err) {
        console.error("Fetch history error:", err);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [activeTab, user?.id, historyLoaded]);

  const handleStart = async (task) => {
    if (isLoading) return;

    if (!user?.id) {
      showToast("Vui lòng đăng nhập!", "error");
      return;
    }

    if (isBlocked) {
      showToast("Tài khoản của bạn đang bị hạn chế!", "error");
      return;
    }

    // Gọi API trực tiếp, không qua modal
    await startTaskApi(task);
  };

  const startTaskApi = async (task) => {
    setIsLoading(true);
    setStartingTaskId(task.id);

    try {
      const { data, error } = await supabase.functions.invoke("start-task", {
        body: { task_id: task.id },
      });

      setStartingTaskId(null);

      if (error) {
        if (
          error.message?.includes("Quá nhiều request") ||
          error.status === 429
        ) {
          showToast("Bạn đang thao tác quá nhanh! Vui lòng đợi 1 phút.", "error");
        } else {
          showToast("Lỗi: " + error.message, "error");
        }
        setIsLoading(false);
        return;
      }

      if (data?.error) {
        showToast(data.error, "error");
        setIsLoading(false);
        return;
      }

      if (data?.shortUrl && data?.token) {
        localStorage.setItem("pending_task_token", data.token);
        localStorage.setItem("pending_task_time", Date.now().toString());
        localStorage.setItem("pending_task_id", task.id);
        localStorage.setItem("pending_task_provider", task.provider || "");

        window.open(data.shortUrl, "_blank");

        showToast(
          `Đã mở link ${task.provider}! Làm xong quay lại để nhận thưởng.`
        );

        setTimeout(() => {
          reload();
          setHistoryLoaded(false);
        }, 2000);
      } else {
        showToast("Không lấy được link nhiệm vụ!", "error");
      }
    } catch (err) {
      setStartingTaskId(null);
      showToast("Lỗi: " + err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };
    // ✅ Nếu đang check IP — hiện loading có BottomNav
if (checkingIp) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-24 font-[Be_Vietnam_Pro]">
      <TopHeader />

      <main className="mx-auto max-w-md space-y-4 px-4 py-5 md:max-w-5xl">
        {/* Hero skeleton */}
        <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-200 via-sky-50 to-white p-5">
          <div className="h-6 w-40 animate-pulse rounded-full bg-white/70" />
          <div className="mt-3 flex items-start gap-3">
            <div className="h-14 w-14 animate-pulse rounded-2xl bg-sky-300/60" />
            <div className="flex-1 space-y-2">
              <div className="h-7 w-48 animate-pulse rounded bg-white/70" />
              <div className="h-4 w-32 animate-pulse rounded bg-white/60" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl bg-white/60"
              />
            ))}
          </div>
        </div>

        {/* Task skeleton */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-white bg-white shadow-sm"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 to-blue-600 opacity-60" />
              <div className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-100" />
                    <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                  </div>
                  <div className="h-6 w-14 animate-pulse rounded-full bg-slate-100" />
                </div>
                <div className="h-14 animate-pulse rounded-xl bg-slate-50" />
                <div className="h-11 animate-pulse rounded-full bg-slate-100" />
              </div>
            </div>
          ))}
        </div>

        {/* Text */}
        <div className="text-center text-[12px] text-slate-400">
          Đang kiểm tra thiết bị...
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

return (
<div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-24 font-[Be_Vietnam_Pro]">
    {toast && (
      <div
        className={`fixed left-1/2 top-4 z-50 flex w-[calc(100%-32px)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl border px-4 py-3 shadow-xl ${
          toast.type === "error"
            ? "border-rose-200 bg-white text-rose-700"
            : "border-emerald-200 bg-white text-emerald-700"
        }`}
      >
        {toast.type === "error" ? (
          <XCircle size={19} />
        ) : (
          <CheckCircle2 size={19} />
        )}
        <p className="text-sm font-semibold">{toast.message}</p>
      </div>
    )}

    <TopHeader />

    <main className="mx-auto max-w-md space-y-4 px-4 py-5 md:max-w-5xl">
      {/* Hero */}
      <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-200 via-sky-50 to-white p-5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-sky-700 shadow-sm">
          <Sparkles size={12} /> TRUNG TÂM NHIỆM VỤ
        </span>

        <div className="mt-3 flex items-start gap-3">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-md shadow-sky-500/30">
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
              <path
                d="M9 12l2 2 4-4"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect
                x="4"
                y="4"
                width="16"
                height="16"
                rx="4"
                stroke="white"
                strokeWidth="2.2"
              />
            </svg>
            <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-tight text-slate-900">
              Kiếm <span className="text-sky-600">Coin</span> mỗi ngày
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {tasks.length} nhiệm vụ đang chạy ·{" "}
              <span className="font-medium text-emerald-600">
                {totalRemaining} lượt còn
              </span>
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
              ? " Admin — Miễn kiểm tra"
              : isBlocked
              ? `Rủi ro: ${profile.risk_score}/100 — Tài khoản bị hạn chế`
              : `Rủi ro: ${profile.risk_score}/100`}
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <MiniStat
            value={availableCount}
            label="KHẢ DỤNG"
            icon={Zap}
            bg="bg-sky-100/70"
            valueColor="text-sky-700"
            iconColor="text-sky-500"
          />
          <MiniStat
            value={profile.tasks_completed_today || 0}
            label="HOÀN THÀNH"
            icon={Trophy}
            bg="bg-emerald-100/60"
            valueColor="text-emerald-700"
            iconColor="text-emerald-500"
          />
          <MiniStat
            value={profile.coins_earned_today || 0}
            label="COIN HÔM NAY"
            icon={Coins}
            bg="bg-amber-100/60"
            valueColor="text-amber-700"
            iconColor="text-amber-500"
          />
          <MiniStat
            value={hoursUntilMidnight()}
            label="CÒN LẠI"
            icon={Clock}
            bg="bg-sky-100/70"
            valueColor="text-sky-700"
            iconColor="text-sky-500"
          />
        </div>
      </div>

      {isBlocked && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
          <p className="text-sm font-semibold text-rose-700">
            🚫 Tài khoản của bạn đang bị tạm khóa làm nhiệm vụ
          </p>
          <p className="mt-1 text-xs text-rose-600">
            Vui lòng liên hệ hỗ trợ để được giải quyết
          </p>
        </div>
      )}

      {/* Search + Tabs */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-sm md:order-2 md:w-80">
          <Search size={16} className="shrink-0 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm nhiệm vụ, nhà cung cấp..."
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 md:order-1">
          <button
            onClick={() => setActiveTab("hot")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition ${
              activeTab === "hot"
                ? "bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/30"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Flame size={13} />
            Hot
            <span
              className={`rounded-full px-1.5 text-[10px] ${
                activeTab === "hot" ? "bg-white/20" : "bg-slate-100"
              }`}
            >
              {hotCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("all")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition ${
              activeTab === "all"
                ? "bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/30"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <ListChecks size={13} />
            Tất cả
            <span
              className={`rounded-full px-1.5 text-[10px] ${
                activeTab === "all" ? "bg-white/20" : "bg-slate-100"
              }`}
            >
              {tasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition ${
              activeTab === "history"
                ? "bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/30"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <History size={13} />
            Lịch sử
          </button>
        </div>
      </div>
              {/* TAB HOT / ALL */}
        {(activeTab === "hot" || activeTab === "all") && (
          <>
            {loading && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <TaskCardSkeleton key={i} />
                ))}
              </div>
            )}

            {!loading && filteredTasks.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center">
                <Search size={30} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-bold text-slate-600">
                  Không tìm thấy nhiệm vụ
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Thử đổi tab hoặc từ khóa khác
                </p>
              </div>
            )}

            {!loading && filteredTasks.length > 0 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTasks.map((task) => {
                  const progressPct = Math.min(
                    100,
                    Math.round((task.completedToday / task.daily_limit) * 100)
                  );
                  const isDone = task.remainingToday <= 0;
                  const isThisStarting = startingTaskId === task.id;

                  return (
                    <div
                      key={task.id}
                      className="overflow-hidden rounded-2xl border border-white bg-white shadow-sm"
                    >
                      <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 to-blue-600" />
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <ProviderLogo task={task} />
                            <span className="block text-base font-bold text-slate-900">
                              {task.provider}
                            </span>
                          </div>
                          {task.is_hot && (
                            <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-500">
                              <Flame size={12} /> HOT
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5">
                          <div>
                            <p className="text-[11px] uppercase tracking-wide text-slate-400">
                              Phần thưởng
                            </p>
                            <p className="flex items-center gap-1 text-lg font-bold text-amber-500">
                              <Coins size={15} /> {task.reward_coins}{" "}
                              <span className="text-xs font-normal text-slate-400">
                                /lượt
                              </span>
                            </p>
                          </div>
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                            {task.remainingToday} còn
                          </span>
                        </div>

                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Hôm nay</span>
                            <span>
                              {task.completedToday}/{task.daily_limit}
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => handleStart(task)}
                          disabled={
                            isDone || isThisStarting || isBlocked || isLoading
                          }
                          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-sky-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ExternalLink size={15} />
                          {isThisStarting
                            ? "Đang mở..."
                            : isBlocked
                            ? "Tài khoản bị khóa"
                            : isDone
                            ? "Đã hết lượt hôm nay"
                            : "Làm nhiệm vụ"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* TAB HISTORY */}
        {activeTab === "history" && (
          <>
            {historyLoading ? (
              <HistorySkeleton />
            ) : history.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center">
                <History size={30} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-bold text-slate-600">
                  Chưa có lịch sử nhiệm vụ
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Làm nhiệm vụ để xem lịch sử tại đây
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="hidden grid-cols-12 gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 md:grid">
                  <div className="col-span-3">Nhiệm vụ</div>
                  <div className="col-span-3">Trạng thái</div>
                  <div className="col-span-3">Thưởng</div>
                  <div className="col-span-3 text-right">Thời gian</div>
                </div>

                <div className="divide-y divide-slate-100">
                  {history.map((log) => {
                    const status = getHistoryStatus(log.status);
                    const isCompleted = [
                      "completed",
                      "success",
                      "done",
                      "verified",
                    ].includes(String(log.status || "").toLowerCase());

                    return (
                      <div
                        key={log.id}
                        className="px-4 py-3 md:grid md:grid-cols-12 md:items-center md:gap-3"
                      >
                        <div className="flex items-start justify-between gap-3 md:hidden">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {log.provider || "—"}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <span
                                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${status.cls}`}
                              >
                                {status.label}
                              </span>
                              <span
                                className={`text-xs font-bold ${
                                  isCompleted
                                    ? "text-emerald-600"
                                    : "text-slate-400"
                                }`}
                              >
                                {isCompleted && log.reward_coins
                                  ? `+${log.reward_coins}đ`
                                  : "—"}
                              </span>
                            </div>
                            <p className="mt-1 text-[10px] text-slate-400">
                              {formatDateTime(log.created_at)}
                            </p>
                          </div>
                        </div>

                        <div className="hidden md:col-span-3 md:block">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {log.provider || "—"}
                          </p>
                        </div>
                        <div className="hidden md:col-span-3 md:block">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${status.cls}`}
                          >
                            {status.label}
                          </span>
                        </div>
                        <div className="hidden md:col-span-3 md:block">
                          <span
                            className={`text-sm font-bold ${
                              isCompleted && log.reward_coins
                                ? "text-emerald-600"
                                : "text-slate-400"
                            }`}
                          >
                            {isCompleted && log.reward_coins
                              ? `+${log.reward_coins}đ`
                              : "—"}
                          </span>
                        </div>
                        <div className="hidden md:col-span-3 md:block md:text-right">
                          <span className="text-xs text-slate-500">
                            {formatDateTime(log.created_at)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
                        }
// =====================================================
// COMPONENT: MÀN HÌNH CHẶN IP
// =====================================================
function IpBlockedScreen({ reason, canAppeal }) {
  const [appealText, setAppealText] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitAppeal = async () => {
    if (!appealText.trim()) {
      alert("Vui lòng nhập lý do kháng cáo.");
      return;
    }

    setSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Chưa đăng nhập");

      const { data, error } = await supabase.rpc("submit_fraud_appeal", {
        p_user_id: session.user.id,
        p_reason: appealText.trim(),
        p_contact_info: contactInfo.trim() || null,
      });

      if (error) throw error;
      if (data?.error) {
        alert(data.error);
        return;
      }

      setSubmitted(true);
    } catch (err) {
      alert("Không thể gửi kháng cáo: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <TopHeader />

      <div className="mx-auto max-w-lg px-4 py-8">
        {/* Warning card */}
        <div className="rounded-2xl border-2 border-rose-300 bg-gradient-to-br from-rose-50 to-white p-6 text-center shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
            <ShieldAlert size={32} className="text-rose-600" strokeWidth={2.2} />
          </div>

          <h2 className="mt-4 text-[20px] font-black text-rose-800">
            🚫 Không thể làm nhiệm vụ
          </h2>

          <p className="mt-3 text-[13.5px] leading-6 text-rose-700">
            {reason}
          </p>
        </div>

        {/* Appeal form */}
        {canAppeal && !submitted && (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Send size={16} className="text-sky-600" strokeWidth={2.4} />
              <h3 className="text-[14px] font-black text-slate-900">
                Gửi kháng cáo
              </h3>
            </div>

            <p className="mt-1.5 text-[12px] leading-5 text-slate-500">
              Nếu bạn cho rằng đây là nhầm lẫn, hãy gửi kháng cáo để admin xem xét trong 24-48h.
            </p>

            <textarea
              value={appealText}
              onChange={(e) => setAppealText(e.target.value)}
              placeholder="Giải thích lý do tại sao bạn cho rằng mình không gian lận..."
              rows={4}
              className="mt-3 w-full rounded-xl border border-slate-200 p-3 text-[13px] outline-none transition focus:border-sky-500"
            />

            <input
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="SĐT / Zalo liên hệ (không bắt buộc)"
              className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-[13px] outline-none transition focus:border-sky-500"
            />

            <button
              onClick={submitAppeal}
              disabled={submitting || !appealText.trim()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 text-[13px] font-bold text-white transition hover:bg-rose-700 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send size={14} strokeWidth={2.4} />
                  Gửi kháng cáo
                </>
              )}
            </button>
          </div>
        )}

        {/* Success */}
        {submitted && (
          <div className="mt-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-5 text-center">
            <CheckCircle2 size={36} className="mx-auto text-emerald-600" />
            <p className="mt-3 text-[14px] font-black text-emerald-800">
              Đã gửi kháng cáo!
            </p>
            <p className="mt-1 text-[12px] leading-5 text-emerald-700">
              Admin sẽ xem xét trong 24-48h. Bạn sẽ được thông báo qua Zalo/email sau khi có kết quả.
            </p>
          </div>
        )}

        {/* Hint */}
        <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-3.5">
          <p className="text-[12px] leading-5 text-sky-700">
            💡 <b>Gợi ý:</b> Nếu bạn dùng chung WiFi với người khác, hãy tắt WiFi và dùng <b>4G</b> để làm nhiệm vụ.
          </p>
        </div>

        {/* Support link */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3.5 text-center">
          <p className="text-[12px] text-slate-500">
            Cần hỗ trợ thêm? Liên hệ Zalo{" "}
            <a
              href="https://zalo.me/0865245988"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-sky-600"
            >
              0865245988
            </a>
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
