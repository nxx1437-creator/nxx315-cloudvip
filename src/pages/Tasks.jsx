import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Search,
  Zap,
  Trophy,
  Coins,
  Clock,
  Flame,
  ListChecks,
  History,
  CheckCircle2,
  XCircle,
  Loader2,
  TrendingUp,
} from "lucide-react";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import useTasks from "../hooks/useTasks.js";
import BottomNav from "../components/BottomNav.jsx";
import TopHeader from "../components/TopHeader.jsx";
import IpBlockedScreen from "../components/tasks/IpBlockedScreen.jsx";
import CaptchaModal from "../components/tasks/CaptchaModal.jsx";
import ExternalLinkWarning from "../components/tasks/ExternalLinkWarning.jsx";
import {
  StatPill,
  TaskCard,
  TaskCardSkeleton,
  EmptyState,
  HistoryList,
  HistorySkeleton,
} from "../components/tasks/TaskParts.jsx";
import { supabase } from "../lib/supabaseClient.js";
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  hoursUntilMidnight,
  generateFingerprint,
} from "../lib/taskHelpers.js";
import { useI18n } from "../i18n/index.js";

const WARN_KEY = "ext_link_warn_count";
const WARN_MAX = 3;

const getWarnCount = () => {
  try {
    return parseInt(localStorage.getItem(WARN_KEY) || "0", 10) || 0;
  } catch {
    return 0;
  }
};

const bumpWarnCount = () => {
  try {
    localStorage.setItem(WARN_KEY, String(getWarnCount() + 1));
  } catch {
    /* bỏ qua */
  }
};

function Chip({ active, onClick, icon: Icon, children, count }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition ${
        active
          ? "bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/30"
          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      <Icon size={13} />
      {children}
      {count !== undefined && (
        <span
          className={`rounded-full px-1.5 text-[10px] ${
            active ? "bg-white/20" : "bg-slate-100"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export default function Tasks() {
  const { t, lang } = useI18n();
  const { session } = useSession();
  const user = session?.user;
  const { profile } = useProfile();
  const { tasks, loading, reload } = useTasks(user?.id);

  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [onlyAvail, setOnlyAvail] = useState(false);
  const [startingTaskId, setStartingTaskId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [ipBlocked, setIpBlocked] = useState(null);
  const [checkingIp, setCheckingIp] = useState(true);
  const [userLevel, setUserLevel] = useState(null);
  const [captchaTask, setCaptchaTask] = useState(null);
  const [warnTask, setWarnTask] = useState(null);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const toastTimer = useRef(null);
  const lastReloadRef = useRef(0);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // Kiểm tra IP + fingerprint chạy NGẦM (không chặn danh sách)
  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const checkIp = async () => {
      setCheckingIp(true);
      try {
        const {
          data: { session: s },
        } = await supabase.auth.getSession();
        if (!s?.access_token) return;

        let fingerprint = localStorage.getItem("device_fingerprint");
        if (!fingerprint) {
          fingerprint = generateFingerprint();
          localStorage.setItem("device_fingerprint", fingerprint);
        }

        const res = await fetch(`${SUPABASE_URL}/functions/v1/log-ip`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${s.access_token}`,
            apikey: SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fingerprint }),
          signal: controller.signal,
        });
        const data = await res.json();
        if (!alive) return;

        if (data.allowed === false) {
          setIpBlocked({ reason: data.reason, can_appeal: data.can_appeal });
        } else {
          setIpBlocked(null);
        }
      } catch (err) {
        console.error("Check IP error:", err);
      } finally {
        clearTimeout(timeout);
        if (alive) setCheckingIp(false);
      }
    };

    checkIp();
    return () => {
      alive = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [user?.id]);

  // Level + ưu đãi
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const { data, error } = await supabase.rpc("get_user_level", {
          p_user_id: user.id,
        });
        if (error) throw error;
        if (data) setUserLevel(data);
      } catch (err) {
        console.error("Load level error:", err);
      }
    })();
  }, [user?.id]);

  // Tải lại khi quay về tab (tối đa 1 lần / 3 giây)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return;
      const now = Date.now();
      if (now - lastReloadRef.current < 3000) return;
      lastReloadRef.current = now;
      reload();
      setHistoryLoaded(false);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
    };
  }, [reload]);
  const isAdmin = profile.is_admin;
  const isBlocked = profile.is_flagged && !isAdmin;

  const filteredTasks = useMemo(() => {
    let list = [...tasks];
    if (activeTab === "hot") list = list.filter((x) => x.is_hot);
    if (onlyAvail) list = list.filter((x) => x.remainingToday > 0);
    const kw = query.trim().toLowerCase();
    if (kw) list = list.filter((x) => x.provider.toLowerCase().includes(kw));
    // Còn lượt lên trước, thưởng cao lên trước
    list.sort((a, b) => {
      const ad = a.remainingToday <= 0;
      const bd = b.remainingToday <= 0;
      if (ad !== bd) return ad ? 1 : -1;
      return (b.reward_coins || 0) - (a.reward_coins || 0);
    });
    return list;
  }, [tasks, query, activeTab, onlyAvail]);

  const totalRemaining = tasks.reduce((s, x) => s + x.remainingToday, 0);
  const totalDone = tasks.reduce((s, x) => s + (x.completedToday || 0), 0);
  const totalLimit = tasks.reduce((s, x) => s + (x.daily_limit || 0), 0);
  const overallPct = totalLimit
    ? Math.min(100, Math.round((totalDone / totalLimit) * 100))
    : 0;
  const availableCount = tasks.filter((x) => x.remainingToday > 0).length;
  const hotCount = tasks.filter((x) => x.is_hot).length;

  const getBoostedReward = (baseReward) => {
    const bonusPct = userLevel?.task_bonus || 0;
    const finalReward = Math.floor(baseReward * (1 + bonusPct / 100));
    return { finalReward, bonusAmount: finalReward - baseReward, bonusPct };
  };

  // Lịch sử
  useEffect(() => {
    if (activeTab !== "history" || historyLoaded || !user?.id) return;

    (async () => {
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
          ...new Set(tokens.map((x) => x.task_id).filter(Boolean)),
        ];
        const { data: tasksList } = await supabase
          .from("tasks")
          .select("id, provider, reward_coins")
          .in("id", taskIds);

        const taskMap = {};
        (tasksList || []).forEach((x) => {
          taskMap[x.id] = x;
        });

        setHistory(
          tokens.map((x) => ({
            ...x,
            provider: taskMap[x.task_id]?.provider || "—",
            reward_coins:
              x.reward_coins || taskMap[x.task_id]?.reward_coins || 0,
          }))
        );
        setHistoryLoaded(true);
      } catch (err) {
        console.error("Fetch history error:", err);
      } finally {
        setHistoryLoading(false);
      }
    })();
  }, [activeTab, user?.id, historyLoaded]);

  const handleStart = (task) => {
    if (isLoading || checkingIp) return;
    if (!user?.id) {
      showToast(t("tk.t.login"), "error");
      return;
    }
    if (isBlocked) {
      showToast(t("tk.t.restricted"), "error");
      return;
    }
    if (getWarnCount() >= WARN_MAX) {
      setCaptchaTask(task);
      return;
    }
    setWarnTask(task);
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
          showToast(t("tk.t.tooFast"), "error");
        } else {
          showToast(t("tk.t.err", { msg: error.message }), "error");
        }
        return;
      }

      if (data?.error) {
        showToast(data.error, "error");
        return;
      }

      if (data?.shortUrl && data?.token) {
        localStorage.setItem("pending_task_token", data.token);
        localStorage.setItem("pending_task_time", Date.now().toString());
        localStorage.setItem("pending_task_id", task.id);
        localStorage.setItem("pending_task_provider", task.provider || "");

        window.open(data.shortUrl, "_blank");

        const { finalReward, bonusPct } = getBoostedReward(task.reward_coins);
        showToast(
          t(bonusPct > 0 ? "tk.t.openedBonus" : "tk.t.opened", {
            provider: task.provider,
            reward: finalReward,
            pct: bonusPct,
          })
        );

        setTimeout(() => {
          reload();
          setHistoryLoaded(false);
        }, 2000);
      } else {
        showToast(t("tk.t.noLink"), "error");
      }
    } catch (err) {
      setStartingTaskId(null);
      showToast(t("tk.t.err", { msg: err.message }), "error");
    } finally {
      setIsLoading(false);
    }
  };
  if (ipBlocked) return <IpBlockedScreen reason={ipBlocked.reason} />;

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

      {warnTask && (
        <ExternalLinkWarning
          lang={lang}
          onCancel={() => setWarnTask(null)}
          onConfirm={() => {
            bumpWarnCount();
            const task = warnTask;
            setWarnTask(null);
            setCaptchaTask(task);
          }}
        />
      )}

      {captchaTask && (
        <CaptchaModal
          task={captchaTask}
          showToast={showToast}
          onClose={() => setCaptchaTask(null)}
          onSolved={(task) => {
            setCaptchaTask(null);
            startTaskApi(task);
          }}
        />
      )}

      {isLoading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/20 px-6 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-50">
              <Loader2 size={26} className="animate-spin text-sky-500" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">
              {t("tk.m.creating")}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {t("tk.m.creatingSub")}
            </p>
          </div>
        </div>
      )}

      <TopHeader />

      <main className="mx-auto max-w-md space-y-4 px-4 py-5 md:max-w-5xl">
        {/* Đầu trang gọn */}
        <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-100 via-sky-50 to-white p-4">
          <h1 className="text-xl font-bold leading-tight text-slate-900">
            {t("tk.title")}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {t("tk.sub", { n: tasks.length, m: totalRemaining })}
          </p>

          <div className="mt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">
                {t("tk.todayProgress")}
              </span>
              <span className="text-slate-400">
                {t("tk.plays", { done: totalDone, total: totalLimit })}
              </span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600 transition-all"
                style={{ width: `${overallPct}%` }}
              />
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
                ? t("tk.adminBadge")
                : isBlocked
                ? t("tk.riskBlocked", { n: profile.risk_score })
                : t("tk.risk", { n: profile.risk_score })}
            </div>
          )}

          {userLevel && userLevel.task_bonus > 0 && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2">
              <TrendingUp size={14} className="shrink-0 text-amber-600" />
              <p className="text-xs font-semibold text-amber-700">
                {t("tk.levelBonus", {
                  level: userLevel.level,
                  pct: userLevel.task_bonus,
                })}
              </p>
            </div>
          )}

          <div className="mt-3 grid grid-cols-4 gap-2">
            <StatPill
              value={availableCount}
              label={t("tk.stAvail")}
              icon={Zap}
              bg="bg-sky-100/70"
              valueColor="text-sky-700"
              iconColor="text-sky-500"
            />
            <StatPill
              value={profile.tasks_completed_today || 0}
              label={t("tk.stDone")}
              icon={Trophy}
              bg="bg-emerald-100/60"
              valueColor="text-emerald-700"
              iconColor="text-emerald-500"
            />
            <StatPill
              value={profile.coins_earned_today || 0}
              label={t("tk.stCoin")}
              icon={Coins}
              bg="bg-amber-100/60"
              valueColor="text-amber-700"
              iconColor="text-amber-500"
            />
          </div>
        </div>

        {isBlocked && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
            <p className="text-sm font-semibold text-rose-700">
              {t("tk.lockedTitle")}
            </p>
            <p className="mt-1 text-xs text-rose-600">{t("tk.lockedSub")}</p>
          </div>
        )}

        {/* Tìm kiếm + Tab */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <Search size={16} className="shrink-0 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("tk.searchPh")}
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Chip
              active={activeTab === "hot"}
              onClick={() => setActiveTab("hot")}
              icon={Flame}
              count={hotCount}
            >
              {t("tk.tabHot")}
            </Chip>
            <Chip
              active={activeTab === "all"}
              onClick={() => setActiveTab("all")}
              icon={ListChecks}
              count={tasks.length}
            >
              {t("tk.tabAll")}
            </Chip>
            <Chip
              active={activeTab === "history"}
              onClick={() => setActiveTab("history")}
              icon={History}
            >
              {t("tk.tabHistory")}
            </Chip>
            {activeTab !== "history" && (
              <button
                onClick={() => setOnlyAvail((v) => !v)}
                className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                  onlyAvail
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-500"
                }`}
              >
                {t("tk.onlyAvail")}
              </button>
            )}
          </div>

          {checkingIp && activeTab !== "history" && (
            <p className="flex items-center gap-1.5 text-[12px] text-slate-400">
              <Loader2 size={12} className="animate-spin" /> {t("tk.checking")}
            </p>
          )}
        </div>

        {/* Tab Hot / Tất cả */}
        {activeTab !== "history" && (
          <>
            {loading && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <TaskCardSkeleton key={i} />
                ))}
              </div>
            )}

            {!loading && filteredTasks.length === 0 && (
              <EmptyState
                title={t("tk.emptyTitle")}
                sub={t("tk.emptySub")}
              />
            )}

            {!loading && filteredTasks.length > 0 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    boosted={getBoostedReward(task.reward_coins)}
                    isThisStarting={startingTaskId === task.id}
                    isBlocked={isBlocked}
                    busy={isLoading || checkingIp}
                    onStart={handleStart}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Tab Lịch sử */}
        {activeTab === "history" &&
          (historyLoading ? (
            <HistorySkeleton />
          ) : (
            <HistoryList history={history} />
          ))}
      </main>

      <BottomNav />
    </div>
  );
          }
