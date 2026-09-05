import React, { useMemo, useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import useTasks from "../hooks/useTasks.js";
import BottomNav from "../components/BottomNav.jsx";
import TopHeader from "../components/TopHeader.jsx";
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
  const [query, setQuery] = useState("");
  const [startingTaskId, setStartingTaskId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // 👉 Theo dõi NHIỀU nhiệm vụ đang chờ xác nhận cùng lúc (thay vì 1 biến chung)
  const [pollingTaskIds, setPollingTaskIds] = useState([]);
  const pollingRefs = useRef({}); // logId -> intervalId
  const tasksRef = useRef(tasks);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

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

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    window.clearTimeout(window.__taskToast);
    window.__taskToast = window.setTimeout(() => setToast(null), 3500);
  };

  const startPolling = (logId, taskId) => {
    if (pollingRefs.current[logId]) return;

    setPollingTaskIds((prev) => (prev.includes(taskId) ? prev : [...prev, taskId]));

    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke("check-task-status", {
          body: { task_log_id: logId },
        });

        if (error) {
          if (error.message?.includes("429") || error.status === 429) {
            console.warn("Rate limit exceeded, waiting...");
          }
          return;
        }

        if (data?.completed) {
          clearInterval(pollingRefs.current[logId]);
          delete pollingRefs.current[logId];
          setPollingTaskIds((prev) => prev.filter((id) => id !== taskId));

          await supabase
            .from("task_logs")
            .update({ is_polling: false })
            .eq("id", logId);

          const completedTask = tasksRef.current.find((t) => t.id === taskId);

          try {
            await supabase.functions.invoke("telegram-webhook", {
              body: {
                message: {
                  text: `✅ Hoàn thành nhiệm vụ!\n👤 User: ${user.email}\n📦 Provider: ${completedTask?.provider || taskId}\n💰 Thưởng: +${completedTask?.reward_coins || 0} Coin`,
                  chat: { id: 6152450878 },
                },
              },
            });
          } catch (teleError) {
            console.error("Lỗi gửi Telegram:", teleError);
          }

          showToast(`✅ Hoàn thành ${completedTask?.provider || "nhiệm vụ"}! +${completedTask?.reward_coins || 0} Coin`);

          supabase.functions.invoke("send-push", {
            body: {
              title: "🎉 Hoàn thành nhiệm vụ",
              body: `Bạn vừa nhận được +${completedTask?.reward_coins || 0} Coin từ ${completedTask?.provider || "nhiệm vụ"}!`,
              url: "/tasks",
            },
          }).then((res) => {
            if (res.error) {
              alert("LỖI PUSH: " + JSON.stringify(res.error));
            } else {
              alert("PUSH OK: " + JSON.stringify(res.data));
            }
          }).catch((err) => alert("PUSH CATCH: " + err.message))
        }
        if (data?.error === "Đã hết hạn") {
          clearInterval(pollingRefs.current[logId]);
          delete pollingRefs.current[logId];
          setPollingTaskIds((prev) => prev.filter((id) => id !== taskId));

          await supabase
            .from("task_logs")
            .update({ is_polling: false })
            .eq("id", logId);

          showToast("Một nhiệm vụ đã hết hạn.", "error");
          
          reload();
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 5000);

    pollingRefs.current[logId] = interval;
  };

  // Khôi phục TẤT CẢ nhiệm vụ đang chờ khi tải lại trang (không chỉ 1 cái)
  useEffect(() => {
    const restorePolling = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("task_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_polling", true);

      if (error) {
        console.error("Lỗi khôi phục polling:", error);
        return;
      }

      if (!data || data.length === 0) return;

      for (const row of data) {
        if (new Date(row.expires_at) < new Date()) {
          await supabase
            .from("task_logs")
            .update({ status: "expired", is_polling: false })
            .eq("id", row.id);
          continue;
        }

        startPolling(row.id, row.task_id);
      }
    };

    restorePolling();
  }, [user?.id]);

  useEffect(() => {
    return () => {
      Object.values(pollingRefs.current).forEach((intervalId) => clearInterval(intervalId));
    };
  }, []);
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

    if (pollingTaskIds.includes(task.id)) {
      showToast("Nhiệm vụ này đang chờ xác nhận rồi!", "error");
      return;
    }

    setIsLoading(true);
    setStartingTaskId(task.id);

    try {
      const { data, error } = await supabase.functions.invoke("start-task", {
        body: { task_id: task.id },
      });

      setStartingTaskId(null);

      if (error) {
        if (error.message?.includes("Quá nhiều request") || error.status === 429) {
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

      if (data?.shortUrl) {
        const urlParts = data.shortUrl.split("/");
        const slug = urlParts[urlParts.length - 1];

        const { data: logData, error: logError } = await supabase
          .from("task_logs")
          .insert({
            user_id: user.id,
            task_id: task.id,
            token: data.token,
            provider: task.provider,
            provider_slug: slug,
            expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            is_polling: true,
          })
          .select()
          .single();

        if (logError) {
          showToast("Lỗi lưu task log: " + logError.message, "error");
          setIsLoading(false);
          return;
        }

        window.open(data.shortUrl, "_blank");
        startPolling(logData.id, task.id);

        showToast(`Đã mở link ${task.provider}! Bạn có thể làm thêm nhiệm vụ khác trong lúc chờ.`);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-24 font-[Be_Vietnam_Pro]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
      `}</style>

      {toast && (
        <div
          className={`fixed left-1/2 top-4 z-50 flex w-[calc(100%-32px)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-xl ${
            toast.type === "error"
              ? "border-rose-200 bg-white/95 text-rose-700"
              : "border-emerald-200 bg-white/95 text-emerald-700"
          }`}
        >
          {toast.type === "error" ? <XCircle size={19} /> : <CheckCircle2 size={19} />}
          <p className="text-sm font-semibold">{toast.message}</p>
        </div>
      )}

<TopHeader />

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
                ? `Rủi ro: ${profile.risk_score}/100 — Tài khoản bị hạn chế làm nhiệm vụ`
                : `Rủi ro: ${profile.risk_score}/100`}
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

        {pollingTaskIds.length > 0 && (
          <div className="flex items-center gap-2 rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-2.5">
            <div className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-sky-300 border-t-sky-600" />
            <p className="text-xs font-semibold text-sky-700">
              Đang chờ xác nhận {pollingTaskIds.length} nhiệm vụ — cứ làm tiếp nhiệm vụ khác nhé
            </p>
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
            const isThisPolling = pollingTaskIds.includes(task.id);

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
                    disabled={isDone || startingTaskId === task.id || isBlocked || isThisPolling || isLoading}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-sky-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ExternalLink size={15} />
                    {startingTaskId === task.id
                      ? "Đang mở..."
                      : isThisPolling
                      ? "Đang xác nhận..."
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
      </main>

      <BottomNav />
    </div>
  );
}
