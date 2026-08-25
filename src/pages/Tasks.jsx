import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Target, 
  Coins, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Trophy, 
  Sparkles, 
  Zap,
  Flame,
  Award
} from "lucide-react";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import useTasks from "../hooks/useTasks.js";
import { useFraud } from "../hooks/useFraud.js";
import BottomNav from "../components/BottomNav.jsx";

export default function Tasks() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { profile } = useProfile();
  const { risk, checkTask, isAdmin } = useFraud(session?.user?.id);
  const { tasks, loading, completeTask } = useTasks(session?.user?.id);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // Kiểm tra fraud khi làm task
  const handleCompleteTask = async (task) => {
    if (!session?.user?.id) {
      setToast({ message: "Vui lòng đăng nhập!", type: "error" });
      return;
    }

    // Kiểm tra fraud - admin được bypass
    const fraudCheck = await checkTask();
    if (!fraudCheck.allowed) {
      setToast({ message: fraudCheck.reason, type: "error" });
      return;
    }

    const result = await completeTask(task.id);
    if (result.success) {
      setToast({ message: `✅ Hoàn thành nhiệm vụ! +${task.reward_coins} Coin`, type: "success" });
    } else {
      setToast({ message: result.error || "Lỗi hoàn thành nhiệm vụ!", type: "error" });
    }
  };

  // Thống kê
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const availableTasks = tasks.filter(t => !t.completed && t.available).length;
  const totalCoinToday = tasks
    .filter(t => t.completed && new Date(t.completed_at).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + t.reward_coins, 0);

  // Lọc task
  const filteredTasks = tasks.filter(task => {
    const matchSearch = task.provider?.toLowerCase().includes(search.toLowerCase()) ||
                         task.title?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" ? true :
                         filter === "available" ? !task.completed && task.available :
                         filter === "completed" ? task.completed : true;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-24 font-[Be_Vietnam_Pro]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
      `}</style>

      <main className="mx-auto max-w-md px-4 py-5">
        {/* Header */}
        <div className="rounded-3xl border border-sky-100 bg-gradient-to-b from-sky-100 via-sky-50 to-white p-6 shadow-lg shadow-sky-100">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-sky-700 shadow-sm">
            <Target size={12} /> TRUNG TÂM NHIỆM VỤ
          </span>
          <h1 className="font-display mt-3 text-3xl font-bold leading-tight text-slate-900">Kiếm Coin mỗi ngày</h1>
          <p className="mt-2 text-sm text-slate-500">{tasks.length} nhiệm vụ đang chạy · {availableTasks} lượt còn</p>
          
          {/* Risk */}
          {risk && (
            <div className="mt-3 rounded-2xl bg-white/70 p-3 text-sm">
              <span className="font-semibold text-slate-600">
                {isAdmin ? '👑 Admin - Miễn kiểm tra' : `Rủi ro: ${risk.score}/100`}
              </span>
            </div>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div className={"mt-4 rounded-2xl p-4 " + (toast.type === 'success' ? 'bg-emerald-50 border border-emerald-200' : 'bg-rose-50 border border-rose-200')}>
            <p className={"text-sm " + (toast.type === 'success' ? 'text-emerald-700' : 'text-rose-700')}>{toast.message}</p>
          </div>
        )}

        {/* Stats */}
        <div className="mt-6 grid grid-cols-4 gap-2">
          <div className="rounded-2xl bg-white p-3 text-center shadow-sm border border-slate-100">
            <p className="text-2xl font-bold text-sky-600">{availableTasks}</p>
            <p className="text-[10px] text-slate-400">Còn lại</p>
          </div>
          <div className="rounded-2xl bg-white p-3 text-center shadow-sm border border-slate-100">
            <p className="text-2xl font-bold text-emerald-600">{completedTasks}</p>
            <p className="text-[10px] text-slate-400">Hoàn thành</p>
          </div>
          <div className="rounded-2xl bg-white p-3 text-center shadow-sm border border-slate-100">
            <p className="text-2xl font-bold text-amber-500">{totalCoinToday}</p>
            <p className="text-[10px] text-slate-400">Coin hôm nay</p>
          </div>
          <div className="rounded-2xl bg-white p-3 text-center shadow-sm border border-slate-100">
            <p className="text-2xl font-bold text-purple-600">{totalTasks}</p>
            <p className="text-[10px] text-slate-400">Tổng</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <Search size={16} className="text-slate-400" />
            <input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Tìm nhiệm vụ, nhà cung cấp..." 
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <div className="flex gap-2">
            {["all", "available", "completed"].map((f) => (
              <button 
                key={f} 
                onClick={() => setFilter(f)} 
                className={`px-4 py-2 rounded-full text-xs font-semibold ${filter === f ? "bg-blue-500 text-white" : "bg-white text-slate-500 border border-slate-200"}`}
              >
                {f === "all" ? "Tất cả" : f === "available" ? "Còn lượt" : "Đã làm"}
              </button>
            ))}
          </div>
        </div>

        {/* Fraud Warning */}
        {!isAdmin && risk?.level === 'danger' && (
          <div className="mt-4 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-center">
            <p className="text-sm font-semibold text-rose-700">🚫 Tài khoản của bạn đang bị tạm khóa làm nhiệm vụ</p>
            <p className="text-xs text-rose-500 mt-1">Vui lòng liên hệ hỗ trợ để được giải quyết</p>
          </div>
        )}

        {/* Danh sách task */}
        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="py-12 text-center">
              <Loader2 size={32} className="animate-spin text-sky-500 mx-auto" />
              <p className="mt-3 text-sm text-slate-400">Đang tải nhiệm vụ...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-400">Không tìm thấy nhiệm vụ nào.</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isAvailable = !task.completed && task.available;
              const canDo = isAvailable && !(risk?.level === 'danger' && !isAdmin);
              
              return (
                <div key={task.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-500">
                        {task.completed ? <CheckCircle2 size={24} className="text-emerald-500" /> : <Target size={24} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900">{task.provider}</p>
                          {task.hot && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-600">HOT</span>}
                          {task.completed && <CheckCircle2 size={14} className="text-emerald-500" />}
                        </div>
                        <p className="text-xs text-slate-400">{task.title || task.provider}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-amber-500">{task.reward_coins}</p>
                      <p className="text-[10px] text-slate-400">/lượt</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isAvailable && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                          <Sparkles size={10} /> {task.available_count || "∞"} còn
                        </span>
                      )}
                      {task.completed && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                          <Clock size={10} /> Đã hoàn thành
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => handleCompleteTask(task)} 
                      disabled={!canDo}
                      className={`rounded-full px-5 py-2 text-xs font-semibold text-white transition ${
                        canDo ? "bg-gradient-to-r from-sky-400 to-blue-600 shadow-md shadow-sky-500/25" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      {task.completed ? "✅ Đã làm" : canDo ? "Làm ngay" : "🔒 Khóa"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
            }
