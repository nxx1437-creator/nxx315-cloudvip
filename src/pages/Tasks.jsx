import React, { useState } from "react";
import { CheckCircle2, Clock, Coins, Zap, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useSession from "../hooks/useSession.js";
import useTasks from "../hooks/useTasks.js";
import AppBackground from "../components/AppBackground.jsx";
import GlassCard from "../components/GlassCard.jsx";
import GlowButton from "../components/GlowButton.jsx";
import Toast from "../components/Toast.jsx";

export default function Tasks() {
  const navigate = useNavigate();
  const { tasks, completedToday, reload } = useTasks();
  const [toast, setToast] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  // Hiển thị trạng thái nhiệm vụ
  const getTaskStatus = (task) => {
    if (task.completedToday >= task.daily_limit) return "completed";
    if (task.completedToday > 0) return "in_progress";
    return "available";
  };

  return (
    <AppBackground>
      <div className="mx-auto max-w-md px-4 py-5">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-white">Nhiệm vụ</h1>
          <p className="mt-1 text-sm text-slate-400">Hoàn thành nhiệm vụ để kiếm Coin!</p>
        </div>

        {/* Thống kê nhanh */}
        <GlassCard className="mb-6 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">Đã hoàn thành hôm nay</p>
              <p className="mt-1 text-2xl font-bold text-cyan-300">{completedToday}</p>
            </div>
            <Zap size={32} className="text-amber-400" />
          </div>
        </GlassCard>

        {/* Danh sách nhiệm vụ */}
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <p className="text-sm text-slate-400">Chưa có nhiệm vụ nào.</p>
            </GlassCard>
          ) : tasks.map((task) => {
            const status = getTaskStatus(task);
            const isCompleted = status === "completed";
            const isInProgress = status === "in_progress";

            return (
              <GlassCard key={task.id} className={`p-5 ${isCompleted ? "border-emerald-400/30" : ""}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      isCompleted ? "bg-emerald-500/20 text-emerald-400" : "bg-cyan-500/20 text-cyan-400"
                    }`}>
                      {isCompleted ? <CheckCircle2 size={22} /> : <Zap size={22} />}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{task.provider}</p>
                      <p className="mt-1 text-xs text-slate-400">Còn {task.remainingToday} lượt hôm nay</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="flex items-center gap-1 text-sm font-bold text-amber-400">
                      <Coins size={14} /> +{task.reward_coins}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                      isCompleted ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-slate-300"
                    }`}>
                      {isCompleted ? "Đã xong" : isInProgress ? "Đang làm" : "Sẵn sàng"}
                    </span>
                  </div>
                </div>

                {/* Nút hành động */}
                <div className="mt-4">
                  {isCompleted ? (
                    <p className="text-center text-xs text-slate-500">Nhiệm vụ đã hoàn thành. Quay lại vào ngày mai!</p>
                  ) : (
                    <GlowButton
                      onClick={() => {
                        setLoadingId(task.id);
                        setTimeout(() => {
                          setLoadingId(null);
                          setToast({ message: "Đã hoàn thành nhiệm vụ!", type: "success" });
                          reload();
                        }, 1000);
                      }}
                      disabled={loadingId === task.id}
                      className="w-full"
                    >
                      {loadingId === task.id ? <Loader2 size={16} className="animate-spin" /> : "Làm nhiệm vụ"}
                    </GlowButton>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      <BottomNav />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AppBackground>
  );
}

// Import BottomNav ở đầu file nếu chưa có
import BottomNav from "../components/BottomNav.jsx";
