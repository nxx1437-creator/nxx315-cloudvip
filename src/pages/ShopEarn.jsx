// ============================================
// PHẦN 1: IMPORTS, UTILITIES & COMPONENTS CƠ BẢN
// ============================================

import React, { useState } from "react";
import {
  Link2, Copy, Check, Loader2, Star, ArrowLeftRight, Landmark, X,
  Clock3, CheckCircle2, XCircle, ArrowLeft, HelpCircle, Info,
  ShoppingBag, PackageCheck, Wallet2, Flame, CalendarCheck,
  ChevronRight, Sparkles, Search, Gift, TrendingUp, AlertTriangle,
  Lock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import useTasks from "../hooks/useTasks.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";
import LuckyDraw from "../components/ShopEarn/LuckyDraw.jsx";

// ========== UTILITY FUNCTIONS ==========
const formatVND = (v) => Number(v || 0).toLocaleString("vi-VN") + "đ";
const formatCoins = (v) => Number(v || 0).toLocaleString("vi-VN");

const PLATFORMS = [
  { key: "tiktok", label: "TikTok", active: true, mark: "TT" },
  { key: "shopee", label: "Shopee", active: false, mark: "S" },
  { key: "lazada", label: "Lazada", active: false, mark: "L" },
];

const rewardForDay = (day) => day <= 10 ? 5 : day <= 20 ? 10 : 15;

const COLOR_MAP = {
  sky: { bg: "bg-sky-500", ring: "ring-sky-100", badgeBg: "bg-sky-50", badgeText: "text-sky-600" },
  amber: { bg: "bg-amber-500", ring: "ring-amber-100", badgeBg: "bg-amber-50", badgeText: "text-amber-600" },
  emerald: { bg: "bg-emerald-500", ring: "ring-emerald-100", badgeBg: "bg-emerald-50", badgeText: "text-emerald-600" },
};

// ===== HEADER =====
function Header() {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 border-b border-black/[0.04] bg-[#F5F8F4]/95 px-4 py-3 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center gap-3">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#66736B] shadow-sm hover:shadow-md transition-all">
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-[15px] font-black text-[#18231D]">Mua hàng kiếm sao</h1>
          <p className="text-[11px] text-[#819087]">Mua sắm vui vẻ · nhận Sao mỗi ngày ✨</p>
        </div>
        <button onClick={() => navigate("/tasks")} className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#38A169] shadow-sm hover:shadow-md transition-all">
          <Sparkles size={17} />
        </button>
      </div>
    </header>
  );
}

// ===== POINTS CARD =====
function PointsCard({ starPoints, pendingPoints = 0 }) {
  const navigate = useNavigate();
  return (
    <section className="relative overflow-hidden rounded-[25px] bg-gradient-to-br from-[#B9EFA5] via-[#86D88A] to-[#45B96B] p-5 shadow-[0_10px_30px_rgba(61,153,89,0.18)] hover:shadow-[0_15px_40px_rgba(61,153,89,0.25)] transition-shadow">
      <div className="pointer-events-none absolute -right-12 -top-14 h-36 w-36 rounded-full bg-white/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 left-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#255B38]">Điểm tích lũy</p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-[30px] font-black leading-none text-white">{formatCoins(starPoints)}</span>
              <Star size={20} className="fill-white text-white" />
            </div>
            <span className="mt-2 inline-flex rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-black text-[#3B7D4E]">Tập sự săn sale</span>
          </div>
          <div className="rounded-2xl bg-white/25 px-3 py-2 text-right backdrop-blur-sm">
            <p className="text-[9px] font-bold text-[#255B38]">Điểm chờ duyệt</p>
            <p className="mt-0.5 text-sm font-black text-white">{formatCoins(pendingPoints)} ⭐</p>
            {pendingPoints > 0 && (
              <p className="text-[8px] text-white/70 animate-pulse">⏳ Đang xử lý...</p>
            )}
          </div>
        </div>
        <div className="mt-5 rounded-2xl bg-white/30 p-3 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-bold leading-4 text-[#255B38]">Thêm 2.000 ⭐ để nâng hạng nhaaa</p>
            <ChevronRight size={15} className="shrink-0 text-[#255B38]" />
          </div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/50">
            <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${Math.min(100, (starPoints / 2000) * 100)}%` }} />
          </div>
          <button onClick={() => navigate("/point-history")} className="mt-2 text-[10px] font-bold text-[#255B38] hover:underline">
            Chi tiết lịch sử điểm →
          </button>
        </div>
      </div>
    </section>
  );
}

// ===== CHECKIN SECTION =====
function CheckinSection({ 
  currentStreak, 
  hasCheckedInToday, 
  checkinLoading, 
  handleCheckin, 
  daysToNextMilestone,
  isRefundLocked = false
}) {
  const nextReward = rewardForDay(currentStreak + 1);

  return (
    <section className="rounded-[23px] bg-white p-4 shadow-[0_5px_20px_rgba(31,55,40,0.05)] hover:shadow-[0_8px_30px_rgba(31,55,40,0.08)] transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black tracking-[0.14em] text-[#7A897F]">CHUỖI ĐIỂM DANH</p>
          <div className="mt-1 flex items-center gap-1.5">
            <Flame size={18} className={isRefundLocked ? 'fill-gray-400 text-gray-400' : 'fill-orange-400 text-orange-500'} />
            <span className={`text-xl font-black ${isRefundLocked ? 'text-gray-400' : 'text-[#18231D]'}`}>
              {isRefundLocked ? '🔒' : currentStreak}
            </span>
            <span className={`text-xs font-bold ${isRefundLocked ? 'text-gray-400' : 'text-[#7A897F]'}`}>
              {isRefundLocked ? 'bị khóa' : 'ngày'}
            </span>
          </div>
        </div>
        <div className={`rounded-full px-3 py-1.5 text-[10px] font-black ${
          isRefundLocked 
            ? 'bg-gray-200 text-gray-500' 
            : 'bg-[#EFF9E9] text-[#43A85F]'
        }`}>
          {isRefundLocked ? '🔒 Đã khóa' : `+${nextReward} ⭐ hôm nay`}
        </div>
      </div>

      <div className={`mt-3 grid grid-cols-4 gap-1.5 ${isRefundLocked ? 'opacity-40' : ''}`}>
        {[["N1–N10", "+5 ⭐"], ["N11–N20", "+10 ⭐"], ["N21–N30", "+15 ⭐"], ["N31+", "+15 ⭐"]].map(([title, reward]) => (
          <div key={title} className="rounded-xl bg-[#F5F8F4] px-1 py-2 text-center hover:bg-[#EAF3E8] transition-colors">
            <p className="text-[9px] font-bold text-[#8B978F]">{title}</p>
            <p className="mt-0.5 text-[10px] font-black text-[#43A85F]">{reward}</p>
          </div>
        ))}
      </div>

      <div className={`mt-3 flex gap-1.5 ${isRefundLocked ? 'opacity-40' : ''}`}>
        {Array.from({ length: 5 }).map((_, offset) => {
          const baseDay = Math.max(1, currentStreak - 3);
          const dayNumber = baseDay + offset;
          const isToday = hasCheckedInToday ? offset === 3 : offset === 4;
          const isDone = dayNumber <= currentStreak;
          return (
            <div key={offset} className={`flex min-w-0 flex-1 flex-col items-center rounded-2xl border px-1 py-2.5 transition-all ${
              isDone ? "border-[#BFE8B8] bg-[#F0FAEC]" :
              isToday ? "border-[#8FD79A] bg-[#F7FFF5] ring-2 ring-[#8FD79A]" :
              "border-[#EDF0ED] bg-[#FAFBFA]"
            }`}>
              <span className="text-[8px] font-bold text-[#96A199]">{isToday ? "HÔM NAY" : `N${dayNumber}`}</span>
              <span className={`mt-1 text-[11px] font-black ${isDone ? "text-[#43A85F]" : "text-[#8C968F]"}`}>
                +{rewardForDay(dayNumber)} ⭐
              </span>
              {isDone && <Check size={11} className="mt-1 text-[#43A85F]" />}
            </div>
          );
        })}
      </div>

      {isRefundLocked ? (
        <div className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-200 py-3.5 text-xs font-black text-gray-500 cursor-not-allowed">
          <Lock size={15} />
          Đã khóa do nợ hoàn trả
        </div>
      ) : (
        <button
          onClick={handleCheckin}
          disabled={hasCheckedInToday || checkinLoading}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#42B866] py-3.5 text-xs font-black text-white shadow-[0_7px_16px_rgba(66,184,102,0.22)] transition active:scale-[0.99] hover:bg-[#3AA85A] disabled:bg-[#B9C6BD] disabled:shadow-none"
        >
          {checkinLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : hasCheckedInToday ? (
            <><Check size={15} /> Đã điểm danh hôm nay</>
          ) : (
            <><CalendarCheck size={15} /> Điểm danh nhận +{nextReward} Sao</>
          )}
        </button>
      )}

      <p className={`mt-2.5 text-center text-[10px] font-semibold ${isRefundLocked ? 'text-gray-400' : 'text-[#8A968E]'}`}>
        {isRefundLocked 
          ? '🔒 Vui lòng hoàn trả tiền để mở khóa điểm danh' 
          : daysToNextMilestone > 0 
            ? `Còn ${daysToNextMilestone} ngày nữa để đạt mốc ${currentStreak < 10 ? "10" : "15"} ⭐/ngày`
            : "Bạn đang ở mốc thưởng cao nhất 🔥"}
      </p>

      {isRefundLocked && (
        <div className="mt-2 rounded-lg bg-rose-50 border border-rose-200 p-2">
          <p className="text-[8px] text-rose-600 text-center">
            ⛔ Tài khoản đang bị khóa, không thể điểm danh. Vui lòng hoàn trả tiền để mở khóa.
          </p>
        </div>
      )}
    </section>
  );
          }
// ============================================
// PHẦN 2: TASK, SHOP, CASHBACK HISTORY
// ============================================

// ===== TASK SECTION =====
function TaskSection({ tasks }) {
  const navigate = useNavigate();

  return (
    <section>
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] font-black tracking-[0.13em] text-[#69766E]">THỬ THÁCH NHẬN ĐIỂM</p>
        <button onClick={() => navigate("/tasks")} className="flex items-center gap-0.5 text-[10px] font-black text-[#49A961] hover:text-[#3D8F54] transition-colors">
          Tất cả <ChevronRight size={13} />
        </button>
      </div>

      <div className="mt-2.5 rounded-[22px] bg-white p-3 shadow-[0_5px_20px_rgba(31,55,40,0.05)] hover:shadow-[0_8px_30px_rgba(31,55,40,0.08)] transition-shadow">
        {tasks.length > 0 ? (
          <div className="space-y-2">
            {tasks.slice(0, 3).map((task) => {
              const isDone = task.remainingToday <= 0;
              return (
                <div key={task.id} className="flex items-center gap-3 rounded-2xl bg-[#F7FAF7] p-3 hover:bg-[#F0F5EE] transition-colors">
                  {task.logo_url ? (
                    <img src={task.logo_url} alt={task.provider} className="h-11 w-11 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E9F6E9] text-xs font-black text-[#43A85F]">
                      {task.provider?.slice(0, 2) || "NV"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-black text-[#18231D]">{task.provider}</p>
                    <p className="mt-0.5 text-[10px] text-[#8B978F]">Nhiệm vụ hàng ngày · {task.remainingToday} lượt còn lại</p>
                  </div>
                  <button
                    onClick={() => navigate("/tasks")}
                    disabled={isDone}
                    className="shrink-0 rounded-xl bg-[#4FBE69] px-3 py-2 text-[10px] font-black text-white hover:bg-[#3DA85A] transition-colors disabled:bg-[#C8D0CB] disabled:cursor-not-allowed"
                  >
                    {isDone ? "Đã xong" : `+${task.reward_coins} ⭐`}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <button onClick={() => navigate("/tasks")} className="flex w-full items-center justify-between rounded-2xl bg-[#F7FAF7] p-4 text-left hover:bg-[#F0F5EE] transition-colors">
            <div>
              <p className="text-xs font-black text-[#18231D]">Nhiệm vụ hàng ngày</p>
              <p className="mt-1 text-[10px] text-[#8B978F]">Vào xem các thử thách mới để nhận thêm Sao.</p>
            </div>
            <ChevronRight size={17} className="text-[#54AF68]" />
          </button>
        )}
      </div>
    </section>
  );
}

// ===== REFUND LOCK WARNING =====
function RefundLockWarning({ isLocked, reason, onPayRefund }) {
  const navigate = useNavigate();
  
  if (!isLocked) return null;
  
  return (
    <div className="mt-3 rounded-2xl bg-rose-50 border-2 border-rose-200 p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100">
          <AlertTriangle size={20} className="text-rose-600" />
        </div>
        <div className="flex-1">
          <p className="text-[12px] font-black text-rose-700">⛔ Tài khoản đã bị khóa</p>
          <p className="mt-1 text-[10px] leading-4 text-rose-600">
            {reason || 'Bạn chưa hoàn trả tiền cho đơn hàng đã bị từ chối. Các tính năng bị khóa: Điểm danh, Tạo link, Đổi Xu, Rút tiền.'}
          </p>
          <div className="mt-2 flex gap-2">
            <button 
              onClick={() => navigate("/refund-history")}
              className="text-[10px] font-bold text-rose-600 underline"
            >
              Xem chi tiết →
            </button>
            {onPayRefund && (
              <button 
                onClick={onPayRefund}
                className="text-[10px] font-bold text-white bg-rose-600 px-3 py-1 rounded-full hover:bg-rose-700 transition-colors"
              >
                Trả nợ ngay
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== CASHBACK HISTORY =====
function CashbackHistory({ userId }) {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [totalPending, setTotalPending] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [totalExpected, setTotalExpected] = useState(0);
  const [totalRefund, setTotalRefund] = useState(0);

  React.useEffect(() => {
    if (!userId) return;

    const fetchHistory = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('affiliate_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('transaction_time', { ascending: false })
        .limit(50);

      if (!error && data) {
        setHistory(data);
        
        const pending = data.filter(t => t.status === 0);
        const completed = data.filter(t => t.status === 1);
        const refund = data.filter(t => t.status === 3);
        const total = data.reduce((sum, t) => sum + (t.star_points_awarded || 0), 0);
        
        setTotalPending(pending.reduce((sum, t) => sum + (t.star_points_awarded || 0), 0));
        setTotalCompleted(completed.reduce((sum, t) => sum + (t.star_points_awarded || 0), 0));
        setTotalExpected(total);
        setTotalRefund(refund.reduce((sum, t) => sum + (t.star_points_awarded || 0), 0));
      }

      setLoading(false);
    };

    fetchHistory();
  }, [userId]);

  const statusMap = {
    0: { label: "Chờ xác nhận", icon: Clock3, cls: "text-amber-600 bg-amber-50" },
    1: { label: "Đã hoàn", icon: CheckCircle2, cls: "text-emerald-600 bg-emerald-50" },
    2: { label: "Bị từ chối", icon: XCircle, cls: "text-rose-600 bg-rose-50" },
    3: { label: "Cần hoàn trả", icon: AlertTriangle, cls: "text-orange-600 bg-orange-50" },
  };

  const tabs = [
    { key: "all", label: "Tất cả" },
    { key: "completed", label: "Đã hoàn" },
    { key: "pending", label: "Chờ xác nhận" },
    { key: "rejected", label: "Bị từ chối" },
    { key: "refund", label: "Cần hoàn trả" },
  ];

  const filteredHistory = history.filter(tx => {
    if (activeTab === "all") return true;
    if (activeTab === "completed") return tx.status === 1;
    if (activeTab === "pending") return tx.status === 0;
    if (activeTab === "rejected") return tx.status === 2;
    if (activeTab === "refund") return tx.status === 3;
    return true;
  });

  if (loading) {
    return (
      <div className="mt-3 rounded-[18px] bg-white p-4 shadow-[0_5px_20px_rgba(31,55,40,0.05)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet2 size={16} className="text-[#45B967]" />
            <span className="text-[11px] font-black text-[#18231D]">Lịch sử hoàn tiền</span>
          </div>
          <ChevronRight size={16} className="text-[#9CA3AF]" />
        </div>
        <div className="mt-3 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#45B967] border-t-transparent" />
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="mt-3 rounded-[18px] bg-white p-4 shadow-[0_5px_20px_rgba(31,55,40,0.05)] hover:shadow-[0_8px_30px_rgba(31,55,40,0.08)] transition-shadow">
        <button 
          onClick={() => navigate("/cashback-history")}
          className="flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Wallet2 size={16} className="text-[#45B967]" />
            <span className="text-[11px] font-black text-[#18231D]">Lịch sử hoàn tiền</span>
          </div>
          <ChevronRight size={16} className="text-[#9CA3AF]" />
        </button>
        <div className="mt-3 flex flex-col items-center py-4">
          <Gift size={32} className="text-[#D1D9D3]" />
          <p className="mt-2 text-[10px] text-[#9CA3AF]">Chưa có đơn hàng nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-[18px] bg-white p-4 shadow-[0_5px_20px_rgba(31,55,40,0.05)] hover:shadow-[0_8px_30px_rgba(31,55,40,0.08)] transition-shadow">
      <button 
        onClick={() => navigate("/cashback-history")}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Wallet2 size={16} className="text-[#45B967]" />
          <span className="text-[11px] font-black text-[#18231D]">Lịch sử hoàn tiền</span>
          {totalPending > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[8px] font-black text-white">
              {totalPending > 99 ? '99+' : totalPending}
            </span>
          )}
          {totalRefund > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[8px] font-black text-white animate-pulse">
              {totalRefund > 99 ? '99+' : totalRefund}
            </span>
          )}
        </div>
        <ChevronRight size={16} className="text-[#9CA3AF]" />
      </button>

      {totalRefund > 0 && (
        <div className="mt-3 rounded-xl bg-orange-50 border border-orange-200 p-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle size={16} className="text-orange-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-orange-700">⚠️ Có đơn cần thu hồi tiền hoàn</p>
              <p className="mt-0.5 text-[9px] text-orange-600">
                Cần hoàn trả {formatVND(totalRefund)} → 
                <span className="text-[8px] block mt-0.5">
                  Do đơn đã nhận hoàn bị từ chối, hãy đảm bảo số dư ví tương ứng để tự động thu hồi tiền hoàn trong 7 ngày.
                </span>
              </p>
              <button 
                onClick={() => navigate("/refund-history")}
                className="mt-2 text-[9px] font-bold text-orange-600 underline"
              >
                Xem chi tiết →
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-gradient-to-r from-[#F5F8F4] to-[#EEF3EC] p-3">
        <div className="text-center">
          <p className="text-[8px] font-black text-[#7A897F]">Tổng dự kiến</p>
          <p className="text-[13px] font-black text-[#18231D]">{formatVND(totalExpected)}</p>
        </div>
        <div className="text-center border-x border-[#E5E7EB]">
          <p className="text-[8px] font-black text-[#7A897F]">Chờ xác nhận</p>
          <p className="text-[13px] font-black text-amber-500">{formatVND(totalPending)}</p>
        </div>
        <div className="text-center">
          <p className="text-[8px] font-black text-[#7A897F]">Đã hoàn</p>
          <p className="text-[13px] font-black text-emerald-500">{formatVND(totalCompleted)}</p>
        </div>
      </div>

      <div className="mt-3 flex gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-[9px] font-bold transition-all ${
              activeTab === tab.key
                ? "bg-[#45B967] text-white shadow-sm"
                : "bg-[#F5F8F4] text-[#7A897F] hover:bg-[#EAF3E8]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
        {filteredHistory.slice(0, 5).map((tx) => {
          const status = statusMap[tx.status] || statusMap[0];
          const StatusIcon = status.icon;
          return (
            <div key={tx.id} className="flex items-center justify-between rounded-xl border border-[#F3F4F6] p-2.5 hover:bg-[#FAFCFA] transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#18231D]">#{tx.order_id || tx.id.slice(-6)}</span>
                  <span className="text-[8px] text-[#9CA3AF]">{tx.platform || "TikTok Shop"}</span>
                </div>
                <p className="mt-0.5 text-[8px] text-[#9CA3AF]">
                  {tx.transaction_time ? new Date(tx.transaction_time).toLocaleString("vi-VN") : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[12px] font-black text-emerald-500">+{formatVND(tx.star_points_awarded || 0)}</p>
                <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-bold ${status.cls}`}>
                  <StatusIcon size={8} />
                  {status.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredHistory.length > 5 && (
        <button 
          onClick={() => navigate("/cashback-history")}
          className="mt-2 w-full text-center text-[9px] font-bold text-[#45B967] hover:text-[#3DA85A] transition-colors"
        >
          Xem tất cả {filteredHistory.length} đơn hàng →
        </button>
      )}
    </div>
  );
              }
// ============================================
// PHẦN 3: SHOP SECTION, WALLET, ROADMAP, TRANSACTION HISTORY
// ============================================

// ===== SHOP SECTION =====
function ShopSection({ 
  platform, setPlatform, productUrl, setProductUrl,
  generating, genError, handlePaste, handleGenerate,
  setShowGuide, productInfo, setProductInfo, 
  copied, setCopied, navigate,
  userId,
  isRefundLocked = false
}) {
  return (
    <section className="overflow-hidden rounded-[24px] bg-[#EAF7E6] p-4 shadow-[0_5px_20px_rgba(31,55,40,0.04)] hover:shadow-[0_8px_30px_rgba(31,55,40,0.08)] transition-shadow">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#42B866] shadow-sm">
          <ShoppingBag size={20} />
        </div>
        <div>
          <p className="text-sm font-black text-[#245A34]">MUA HÀNG TÍCH ĐIỂM</p>
          <p className="mt-1 text-[10px] leading-4 text-[#64806B]">Dán link sản phẩm, hoặc sử dụng mẹo chia sẻ link nhanh không cần copy link theo hướng dẫn</p>
        </div>
      </div>

      <div className="mt-2 text-right">
        <button 
          onClick={() => setShowGuide(true)}
          className="text-[10px] font-black text-[#3FA55A] underline hover:text-[#2D8A45] transition-colors"
        >
          TẠI ĐÂY
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-2xl border border-[#D8EAD3] bg-white px-3 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-[#45B967] transition-all">
        <Link2 size={16} className="shrink-0 text-[#91A098]" />
        <input
          type="text"
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
          placeholder="Link sản phẩm"
          className="min-w-0 flex-1 bg-transparent text-xs font-medium text-[#18231D] outline-none placeholder:text-[#A5B0A9]"
        />
        <button onClick={handlePaste} className="flex shrink-0 items-center gap-1 rounded-xl bg-[#F2F7F1] px-2.5 py-2 text-[9px] font-black text-[#4CA963] hover:bg-[#E5F0E3] transition-colors">
          <Copy size={12} /> Dán link
        </button>
      </div>

      {genError && <p className="mt-2 text-[10px] font-bold text-rose-500">{genError}</p>}

      {isRefundLocked ? (
        <div className="mt-2.5 rounded-2xl bg-rose-100 p-4 text-center border border-rose-200">
          <Lock size={16} className="mx-auto text-rose-500" />
          <p className="mt-1 text-[11px] font-bold text-rose-600">⛔ Tạm khóa</p>
          <p className="mt-0.5 text-[9px] text-rose-500">Vui lòng hoàn trả tiền để tiếp tục sử dụng</p>
        </div>
      ) : (
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#43B967] py-3.5 text-xs font-black text-white shadow-[0_7px_16px_rgba(67,185,103,0.2)] transition hover:bg-[#3AA85A] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {generating ? <Loader2 size={16} className="animate-spin" /> : <><Link2 size={15} /> Lấy link nhận Sao</>}
        </button>
      )}

      <p className="mt-3 text-center text-[9px] font-medium leading-4 text-[#77907E]">
        Sau khi nhập link và mua hàng, đơn sẽ tự động xuất hiện trong Điểm chờ duyệt sau tối đa 48 giờ.
      </p>

      <div className="mt-3.5 flex items-center justify-between border-t border-[#D8EAD3] pt-3">
        <button 
          onClick={() => navigate("/link-history")}
          className="flex items-center gap-1 text-[10px] font-black text-[#3FA55A] hover:text-[#2D8A45] transition-colors"
        >
          <Clock3 size={12} />
          Lịch sử tạo link
        </button>
        <ChevronRight size={14} className="text-[#3FA55A]" />
      </div>

      {userId && <CashbackHistory userId={userId} />}

      {productInfo && (
        <ProductInfoModal 
          productInfo={productInfo} 
          setProductInfo={setProductInfo} 
          copied={copied} 
          setCopied={setCopied} 
          navigate={navigate} 
        />
      )}
    </section>
  );
}

// ===== PRODUCT INFO MODAL =====
function ProductInfoModal({ productInfo, setProductInfo, copied, setCopied, navigate }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-t-[30px] bg-white px-5 pb-6 pt-2.5 shadow-2xl sm:rounded-[30px] animate-in slide-in-from-bottom duration-300">
        <div className="mx-auto h-1.5 w-12 rounded-full bg-[#D9DED9]" />
        
        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[17px] font-black text-[#42AE5F]">Tạo link mua hàng thành công 🎉</p>
            <p className="mt-1 text-[10px] font-medium text-[#87938B]">Mua hàng từ link Nô Tì để tích điểm đổi quà.</p>
          </div>
          <button onClick={() => setProductInfo(null)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F4F6F4] text-[#8C978F] hover:bg-[#E8EDE8] transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 flex gap-3 rounded-2xl border border-[#E8ECE8] bg-[#F8FAF8] p-3">
          {productInfo.image ? (
            <img 
              src={productInfo.image} 
              alt={productInfo.name || "Sản phẩm"} 
              className="h-[72px] w-[72px] shrink-0 rounded-xl object-cover"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          ) : (
            <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-xl bg-white border border-[#E8ECE8]">
              <ShoppingBag size={28} className="text-[#C6CEC8]" />
            </div>
          )}
          <div className="min-w-0 flex-1 py-1">
            <p className="line-clamp-3 text-xs font-black leading-4 text-[#18231D]">
              {productInfo.name || "Sản phẩm TikTok Shop"}
            </p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#111] px-1.5 py-1 text-[8px] font-black text-white">
              TikTok Shop
            </span>
          </div>
        </div>

        <div className="mt-4 flex gap-2.5">
          <button
            onClick={async () => {
              if (navigator.share) {
                try { await navigator.share({ title: productInfo.name || "Sản phẩm", url: productInfo.link }); } catch {}
              } else {
                await navigator.clipboard.writeText(productInfo.link);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }
            }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-[#48B866] py-3.5 text-xs font-black text-[#42AA5C] hover:bg-[#F5FFF5] transition-colors"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Đã sao chép" : "Chia sẻ"}
          </button>

          <button
            onClick={() => navigate(`/redirect?url=${encodeURIComponent(productInfo.link)}&name=${encodeURIComponent(productInfo.name || "Sản phẩm TikTok Shop")}&image=${encodeURIComponent(productInfo.image || "")}`)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-[#45B967] py-3.5 text-xs font-black text-white shadow-[0_7px_16px_rgba(69,185,103,0.18)] hover:bg-[#3DA85A] transition-colors"
          >
            Mua ngay <ChevronRight size={14} />
          </button>
        </div>

        <div className="mt-3 rounded-xl bg-[#EFF9EC] px-3 py-2.5 text-center">
          <p className="text-[10px] font-black text-[#42A35A]">Đơn hàng của Sếp sẽ được cập nhật điểm sau 24–48h</p>
        </div>

        <div className="mt-4 border-t border-[#EEF1EE] pt-4">
          <p className="text-[11px] font-black text-[#26352B]">Lưu ý để được ghi nhận đơn</p>
          <div className="mt-2.5 space-y-2">
            <NoteRow text="Sau mỗi lần đặt hàng, nhớ bấm lại link để nhận Sao cho đơn tiếp theo." />
            <NoteRow text="Mua đúng sản phẩm được gắn link hoặc sản phẩm cùng shop để nhận Sao chính xác." />
            <NoteRow text="Không tính Sao cho sản phẩm được thêm từ livestream/video KOC." />
          </div>
        </div>
      </div>
    </div>
  );
}

function NoteRow({ text }) {
  return (
    <div className="flex items-start gap-2">
      <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-500" />
      <p className="text-[10px] leading-4 text-[#6B7280]">{text}</p>
    </div>
  );
}

// ===== WALLET SECTION =====
function WalletSection({ 
  starPoints, 
  canWithdraw, 
  setShowConvert, 
  setShowWithdraw,
  isRefundLocked = false,
  refundLockReason = ""
}) {
  const navigate = useNavigate();
  
  return (
    <section className="rounded-[22px] bg-white p-4 shadow-[0_5px_20px_rgba(31,55,40,0.05)] hover:shadow-[0_8px_30px_rgba(31,55,40,0.08)] transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-[10px] font-black tracking-wide text-[#829087]">
            <Star size={13} className="fill-amber-400 text-amber-400" /> SAO CỦA BẠN
          </p>
          <p className="mt-1 text-2xl font-black leading-none text-[#18231D]">{formatCoins(starPoints)} ⭐</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3F8F1]">
          <Wallet2 size={21} className="text-[#66A876]" />
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setShowConvert(true)}
          disabled={starPoints <= 0 || isRefundLocked}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[10px] font-black text-white shadow-sm transition-colors ${
            isRefundLocked 
              ? "bg-[#B9C6BD] cursor-not-allowed" 
              : "bg-[#4DBD69] hover:bg-[#3DA85A]"
          }`}
        >
          <ArrowLeftRight size={13} /> Đổi sang Xu
        </button>
        <button
          onClick={() => canWithdraw && setShowWithdraw(true)}
          disabled={!canWithdraw || isRefundLocked}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-[10px] font-black transition-colors ${
            isRefundLocked
              ? "border-[#E5EAE6] text-[#B9C6BD] cursor-not-allowed bg-[#F5F8F4]"
              : "border-[#E5EAE6] text-[#6F7B73] hover:bg-[#F5F8F4]"
          }`}
        >
          <Landmark size={13} /> Rút ngân hàng
        </button>
      </div>

      {isRefundLocked && (
        <div className="mt-2 rounded-xl bg-rose-50 p-2.5 border border-rose-200">
          <p className="flex items-center gap-1.5 text-[9px] font-semibold text-rose-600">
            <Lock size={12} />
            Tạm khóa: {refundLockReason || 'Cần hoàn trả tiền để mở khóa'}
          </p>
          <button 
            onClick={() => navigate("/refund-history")}
            className="mt-1 text-[9px] font-bold text-rose-600 underline"
          >
            Xem chi tiết →
          </button>
        </div>
      )}

      {!canWithdraw && !isRefundLocked && (
        <p className="mt-2 flex items-center gap-1 text-[9px] text-[#9AA49E]">
          <Info size={11} /> Cần tối thiểu 20.000đ để rút về ngân hàng
        </p>
      )}
    </section>
  );
}
// ===== PAYMENT RULES =====
function PaymentRules() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-[22px] bg-white p-4 shadow-[0_5px_20px_rgba(31,55,40,0.05)] hover:shadow-[0_8px_30px_rgba(31,55,40,0.08)] transition-shadow">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Info size={16} className="text-[#45B967]" />
          <span className="text-[11px] font-black text-[#18231D]">Quy tắc thanh toán</span>
        </div>
        <ChevronRight 
          size={16} 
          className={`text-[#9CA3AF] transition-transform duration-300 ${
            expanded ? 'rotate-90' : ''
          }`} 
        />
      </button>

      {expanded && (
        <div className="mt-3 space-y-2.5 border-t border-[#F3F4F6] pt-3">
          {/* Tổng nhận */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-[#F5F8F4] p-3 text-center">
              <p className="text-[8px] font-semibold text-[#7A897F]">Tổng nhận VND</p>
              <p className="text-[14px] font-black text-[#18231D]">0đ</p>
            </div>
            <div className="rounded-xl bg-[#F5F8F4] p-3 text-center">
              <p className="text-[8px] font-semibold text-[#7A897F]">Đã đổi Main</p>
              <p className="text-[14px] font-black text-[#18231D]">0</p>
            </div>
          </div>

          {/* Quy tắc */}
          <div className="mt-2 space-y-2">
            <p className="text-[10px] font-bold text-[#18231D] flex items-center gap-1.5">
              <span className="text-sm">📋</span> Quy tắc thanh toán
            </p>
            
            <div className="space-y-1.5">
              <RuleItem 
                icon="💵" 
                text="1 sao = 10 VND khi rút tiền"
              />
              <RuleItem 
                icon="🔄" 
                text="Đổi sang Main coin: 1.000 mkt → 900 main (phí sàn 10%)"
              />
              <RuleItem 
                icon="🏦" 
                text="Rút bank/ví: phí 20% (rút 100.000 → nhận 80.000 VND)"
              />
              <RuleItem 
                icon="📌" 
                text="Tối thiểu mỗi lần rút: 10.000 VND"
              />
              <RuleItem 
                icon="🔀" 
                text="sao mua hàng tách riêng khỏi Main coin — không gộp"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// ===== ROADMAP =====
function Roadmap() {
  return (
    <section className="rounded-[22px] bg-white p-4 shadow-[0_5px_20px_rgba(31,55,40,0.05)] hover:shadow-[0_8px_30px_rgba(31,55,40,0.08)] transition-shadow">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF8EC] px-2.5 py-1 text-[9px] font-black text-[#4CA662]">
        <Clock3 size={11} /> LỘ TRÌNH NHẬN SAO
      </span>
      <h3 className="mt-2 text-sm font-black text-[#18231D]">Quy trình nhận Sao</h3>

      <div className="mt-4 space-y-0">
        <TimelineStep
          icon={ShoppingBag}
          color="emerald"
          step="BƯỚC 1 · TẠO LINK"
          title="Tạo link & mua hàng"
          badge="Hôm nay"
          desc="Dán link sản phẩm, lấy link riêng và tiến hành mua hàng như bình thường."
          isLast={false}
        />
        <TimelineStep
          icon={PackageCheck}
          color="amber"
          step="BƯỚC 2 · ĐỐI SOÁT"
          title="Đơn được ghi nhận"
          badge="Vài ngày"
          desc="Sàn xác nhận đơn hàng hợp lệ, hoa hồng tạm tính hiển thị trong lịch sử."
          isLast={false}
        />
        <TimelineStep
          icon={Wallet2}
          color="emerald"
          step="BƯỚC 3 · THỰC NHẬN"
          title="Nhận Sao vào ví"
          badge="~60 ngày"
          desc="Sau khi đơn được duyệt hoàn tất, Sao được cộng thẳng vào ví, có thể đổi Xu hoặc rút tiền."
          isLast={true}
        />
      </div>
    </section>
  );
}

function TimelineStep({ icon: Icon, color, step, title, badge, desc, isLast }) {
  const c = COLOR_MAP[color];
  return (
    <div className="flex gap-3.5">
      <div className="flex flex-col items-center">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${c.bg} text-white ring-4 ${c.ring}`}>
          <Icon size={17} />
        </span>
        {!isLast && <span className="mt-1 w-[2px] flex-1 bg-[#E5E7EB]" />}
      </div>
      <div className={isLast ? "pb-0" : "pb-5"}>
        <p className="text-[10px] font-bold tracking-wide text-[#9CA3AF]">{step}</p>
        <div className="mt-0.5 flex items-center gap-2">
          <p className="text-sm font-bold text-[#111827]">{title}</p>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.badgeBg} ${c.badgeText}`}>{badge}</span>
        </div>
        <p className="mt-1 text-xs leading-5 text-[#6B7280]">{desc}</p>
      </div>
    </div>
  );
}

// ===== TRANSACTION HISTORY =====
function TransactionHistory({ userId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (!userId) return;
    supabase
      .from("affiliate_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("transaction_time", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setHistory(data || []);
        setLoading(false);
      });
  }, [userId]);

  const statusMap = {
    0: { label: "Chờ duyệt", icon: Clock3, cls: "bg-amber-50 text-amber-600" },
    1: { label: "Đã duyệt", icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-600" },
    2: { label: "Từ chối", icon: XCircle, cls: "bg-rose-50 text-rose-600" },
  };

  if (loading || history.length === 0) return null;

  return (
    <section className="rounded-[22px] bg-white p-4 shadow-[0_5px_20px_rgba(31,55,40,0.05)] hover:shadow-[0_8px_30px_rgba(31,55,40,0.08)] transition-shadow">
      <p className="mb-3 text-sm font-black text-[#18231D]">Lịch sử đơn hàng</p>
      <div className="space-y-3">
        {history.map((tx) => {
          const status = statusMap[tx.status] || statusMap[0];
          const StatusIcon = status.icon;
          return (
            <div key={tx.id} className="flex items-center justify-between border-b border-[#F3F4F6] pb-3 last:border-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-xs font-black text-[#18231D]">{tx.product_name || tx.merchant || "Đơn hàng"}</p>
                <p className="mt-0.5 text-[11px] text-[#9CA3AF]">
                  {tx.transaction_time ? new Date(tx.transaction_time).toLocaleDateString("vi-VN") : "—"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {tx.credited && <span className="text-xs font-bold text-amber-600">+{formatVND(tx.star_points_awarded)}</span>}
                <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${status.cls}`}>
                  <StatusIcon size={10} /> {status.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
          }

// ===== RULE ITEM =====
function RuleItem({ icon, text }) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-[#FAFCFA] p-2 hover:bg-[#F0F5EE] transition-colors">
      <span className="text-sm shrink-0">{icon}</span>
      <p className="text-[9px] leading-4 text-[#6B7280]">{text}</p>
    </div>
  );
              }
// ============================================
// PHẦN 4: MODALS & MAIN COMPONENT
// ============================================

// ===== GUIDE MODAL =====
function GuideModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-200">
      <div className="max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-[25px] bg-white p-5 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-[#18231D]">Cách nhận Sao trong 3 bước</h3>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors"><X size={18} /></button>
        </div>
        <div className="mt-4 space-y-4">
          <GuideCard number="1" title="Sao chép link sản phẩm" desc="Mở app/web sàn TMĐT, tìm sản phẩm bạn thích rồi sao chép đường dẫn." />
          <GuideCard number="2" title="Dán link & lấy link nhận Sao" desc="Dán link vừa copy vào ô ở trang này để hệ thống tạo link riêng cho bạn." />
          <GuideCard number="3" title="Mua hàng & nhận Sao" desc="Mở link vừa tạo, mua hàng như bình thường. Sao sẽ tự cộng vào ví sau khi đơn được duyệt." />
        </div>
        <button onClick={onClose} className="mt-5 w-full rounded-2xl bg-[#45B967] py-3 text-sm font-black text-white shadow-sm hover:bg-[#3DA85A] transition-colors">Đã hiểu</button>
      </div>
    </div>
  );
}

function GuideCard({ number, title, desc }) {
  return (
    <div className="flex gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#45B967] text-xs font-black text-white">{number}</span>
      <div>
        <p className="text-sm font-black text-[#18231D]">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-[#6B7280]">{desc}</p>
      </div>
    </div>
  );
}

// ===== CONVERT MODAL =====
function ConvertModal({ starPoints, onClose, onDone }) {
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const numAmount = Number(amount) || 0;
  const fee = numAmount * 0.05;
  const netPoints = numAmount - fee;
  const coinsReceived = netPoints * 10;

  const handleConvert = async () => {
    if (numAmount <= 0 || numAmount > starPoints) {
      setError("Số điểm không hợp lệ.");
      return;
    }
    setSaving(true);
    setError("");
    const { data, error: rpcError } = await supabase.rpc("convert_star_to_coin", {
      p_user_id: (await supabase.auth.getUser()).data.user.id,
      p_star_points: numAmount,
    });
    setSaving(false);
    if (rpcError) { setError(rpcError.message); return; }
    const result = Array.isArray(data) ? data[0] : data;
    if (!result?.success) { setError(result?.error || "Đổi điểm thất bại."); return; }
    onDone(result.new_star_balance, result.new_coin_balance);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-[25px] bg-white p-5 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-[#18231D]">Đổi sang Xu</h3>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors"><X size={18} /></button>
        </div>
        <p className="mt-1 text-xs text-[#6B7280]">Số dư khả dụng: {formatCoins(starPoints)} ⭐</p>
        
        <p className="mb-1.5 mt-4 text-xs font-semibold text-[#6B7280]">Số điểm muốn đổi</p>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className="w-full rounded-xl border border-[#E5E7EB] bg-[#F7F9FC] px-3.5 py-3 text-sm font-semibold text-[#111827] outline-none focus:ring-2 focus:ring-[#45B967] transition-all"
        />

        {numAmount > 0 && (
          <div className="mt-3 space-y-1.5 rounded-xl bg-[#F7F9FC] p-3 text-xs">
            <div className="flex justify-between text-[#6B7280]">
              <span>Phí sàn (5%)</span>
              <span className="font-semibold text-rose-500">-{formatVND(fee)}</span>
            </div>
            <div className="flex justify-between font-bold text-[#111827]">
              <span>Xu nhận được</span>
              <span>{formatCoins(coinsReceived)} Xu</span>
            </div>
          </div>
        )}

        {error && <p className="mt-2 text-xs font-semibold text-rose-500">{error}</p>}

        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl bg-[#F3F4F6] py-2.5 text-sm font-semibold text-[#6B7280] hover:bg-[#E5E7EB] transition-colors">Huỷ</button>
          <button onClick={handleConvert} disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#45B967] py-2.5 text-sm font-black text-white shadow-sm hover:bg-[#3DA85A] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {saving ? <Loader2 size={15} className="animate-spin" /> : "Xác nhận"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== WITHDRAW MODAL =====
function WithdrawModal({ starPoints, userId, onClose, onDone }) {
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const numAmount = Number(amount) || 0;

  const handleSubmit = async () => {
    if (numAmount < 20000 || numAmount > starPoints) {
      setError("Số tiền rút phải từ 20.000đ và không vượt quá số dư.");
      return;
    }
    if (!bankName.trim() || !accountNumber.trim() || !accountHolder.trim()) {
      setError("Vui lòng điền đầy đủ thông tin ngân hàng.");
      return;
    }
    setSaving(true);
    setError("");
    const { error: insertError } = await supabase.from("star_withdrawals").insert({
      user_id: userId,
      amount: numAmount,
      bank_name: bankName.trim(),
      account_number: accountNumber.trim(),
      account_holder: accountHolder.trim(),
    });
    if (insertError) { setSaving(false); setError(insertError.message); return; }
    const { error: deductError } = await supabase.from("profiles").update({ star_points: starPoints - numAmount }).eq("id", userId);
    setSaving(false);
    if (deductError) { setError(deductError.message); return; }
    setSuccess(true);
    onDone(starPoints - numAmount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-[25px] bg-white p-5 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-[#18231D]">Rút về ngân hàng</h3>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors"><X size={18} /></button>
        </div>

        {success ? (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-emerald-50 p-4">
            <Check size={17} className="text-emerald-500" />
            <p className="text-sm font-semibold text-emerald-700">Đã gửi yêu cầu, tiền sẽ về trong 1-3 ngày làm việc.</p>
          </div>
        ) : (
          <>
            <p className="mt-1 text-xs text-[#6B7280]">Số dư khả dụng: {formatCoins(starPoints)} ⭐</p>
            
            <p className="mb-1.5 mt-4 text-xs font-semibold text-[#6B7280]">Số tiền rút (tối thiểu 20.000đ)</p>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="20000" className="w-full rounded-xl border border-[#E5E7EB] bg-[#F7F9FC] px-3.5 py-3 text-sm font-semibold text-[#111827] outline-none focus:ring-2 focus:ring-[#45B967] transition-all" />

            <p className="mb-1.5 mt-3 text-xs font-semibold text-[#6B7280]">Ngân hàng</p>
            <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="VD: Agribank, MoMo..." className="w-full rounded-xl border border-[#E5E7EB] bg-[#F7F9FC] px-3.5 py-3 text-sm font-semibold text-[#111827] outline-none focus:ring-2 focus:ring-[#45B967] transition-all" />

            <p className="mb-1.5 mt-3 text-xs font-semibold text-[#6B7280]">Số tài khoản</p>
            <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="w-full rounded-xl border border-[#E5E7EB] bg-[#F7F9FC] px-3.5 py-3 text-sm font-semibold text-[#111827] outline-none focus:ring-2 focus:ring-[#45B967] transition-all" />

            <p className="mb-1.5 mt-3 text-xs font-semibold text-[#6B7280]">Chủ tài khoản</p>
            <input type="text" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value.toUpperCase())} className="w-full rounded-xl border border-[#E5E7EB] bg-[#F7F9FC] px-3.5 py-3 text-sm font-semibold uppercase text-[#111827] outline-none focus:ring-2 focus:ring-[#45B967] transition-all" />

            {error && <p className="mt-2 text-xs font-semibold text-rose-500">{error}</p>}

            <div className="mt-5 flex gap-3">
              <button onClick={onClose} className="flex-1 rounded-xl bg-[#F3F4F6] py-2.5 text-sm font-semibold text-[#6B7280] hover:bg-[#E5E7EB] transition-colors">Huỷ</button>
              <button onClick={handleSubmit} disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#45B967] py-2.5 text-sm font-black text-white shadow-sm hover:bg-[#3DA85A] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                {saving ? <Loader2 size={15} className="animate-spin" /> : "Gửi yêu cầu"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ===== PAY REFUND MODAL =====
function PayRefundModal({ userId, refundAmount, onClose, onDone }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [coinBalance, setCoinBalance] = useState(0);
  const [starBalance, setStarBalance] = useState(0);
  const [coinsNeeded, setCoinsNeeded] = useState(0);

  React.useEffect(() => {
    const fetchBalance = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('coins, star_points')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setCoinBalance(data.coins || 0);
        setStarBalance(data.star_points || 0);
        setCoinsNeeded(Math.ceil(refundAmount * 10));
      }
    };

    fetchBalance();
  }, [userId, refundAmount]);

  const handlePay = async () => {
    setLoading(true);
    setError("");

    const { data, error: rpcError } = await supabase.rpc('pay_refund_with_coins', {
      p_user_id: userId,
      p_amount: refundAmount
    });

    setLoading(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    if (!data?.success) {
      setError(data?.error || data?.message || "Không thể trả nợ");
      return;
    }

    onDone(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-[#18231D]">💳 Trả nợ bằng Xu</h3>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#6B7280]">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div className="rounded-xl bg-orange-50 p-3 border border-orange-100">
            <p className="text-[10px] text-orange-600">Số tiền cần trả</p>
            <p className="text-lg font-bold text-orange-600">{formatVND(refundAmount)}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-[#F5F8F4] p-3 text-center">
              <p className="text-[8px] text-[#7A897F]">Xu hiện có</p>
              <p className="text-sm font-black text-[#18231D]">{formatCoins(coinBalance)} Xu</p>
            </div>
            <div className="rounded-xl bg-[#F5F8F4] p-3 text-center">
              <p className="text-[8px] text-[#7A897F]">⭐ Sao hiện có</p>
              <p className="text-sm font-black text-[#18231D]">{formatCoins(starBalance)} ⭐</p>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 p-3 border border-amber-200">
            <p className="text-[9px] text-amber-700">
               Cần <strong>{formatCoins(coinsNeeded)} Xu</strong> để trả nợ 
              (tương đương <strong>{formatVND(refundAmount)}</strong>)
            </p>
            <p className="mt-1 text-[8px] text-amber-600">
              {coinBalance >= coinsNeeded 
                ? ` Bạn có đủ ${formatCoins(coinsNeeded)} Xu để trả` 
                : ` Bạn thiếu ${formatCoins(coinsNeeded - coinBalance)} Xu. Có thể đổi Sao sang Xu để trả.`}
            </p>
          </div>

          {error && (
            <p className="text-[10px] font-semibold text-rose-500">{error}</p>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-[#F3F4F6] py-2.5 text-sm font-semibold text-[#6B7280] hover:bg-[#E5E7EB] transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handlePay}
            disabled={loading || coinBalance < coinsNeeded}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#45B967] py-2.5 text-sm font-black text-white shadow-sm hover:bg-[#3DA85A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : "Trả nợ"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT: ShopEarn
// ============================================

export default function ShopEarn() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { profile, setProfile } = useProfile();
  const { tasks } = useTasks(session?.user?.id);

  const [platform, setPlatform] = useState("tiktok");
  const [productUrl, setProductUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [resultLink, setResultLink] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showConvert, setShowConvert] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinResult, setCheckinResult] = useState(null);
  const [productInfo, setProductInfo] = useState(null);
  const [pendingPoints, setPendingPoints] = useState(0);
  const [isRefundLocked, setIsRefundLocked] = useState(false);
  const [refundLockReason, setRefundLockReason] = useState("");
  const [showPayRefund, setShowPayRefund] = useState(false);
  const [refundAmount, setRefundAmount] = useState(0);

  // Fetch pending points
  React.useEffect(() => {
    if (!session?.user?.id) return;

    const fetchPendingPoints = async () => {
      const { data, error } = await supabase
        .from('pending_transactions')
        .select('star_points_expected')
        .eq('user_id', session.user.id)
        .eq('status', 'pending');

      if (!error && data) {
        const total = data.reduce((sum, item) => sum + item.star_points_expected, 0);
        setPendingPoints(total);
      }
    };

    fetchPendingPoints();
  }, [session?.user?.id]);
  // Fetch refund lock status
  React.useEffect(() => {
    if (!session?.user?.id) return;

    const fetchLockStatus = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_refund_locked, refund_lock_reason')
        .eq('id', session.user.id)
        .single();

      if (!error && data) {
        setIsRefundLocked(data.is_refund_locked || false);
        setRefundLockReason(data.refund_lock_reason || "");
      }
    };

    fetchLockStatus();
  }, [session?.user?.id]);

  const todayStr = new Date().toDateString();
  const hasCheckedInToday = profile?.last_checkin_date && new Date(profile.last_checkin_date).toDateString() === todayStr;
  const currentStreak = profile?.checkin_streak || 0;
  const starPoints = Number(profile?.star_points || 0);
  const canWithdraw = starPoints >= 20000;

  const daysToNextMilestone = currentStreak < 10 ? 10 - currentStreak : currentStreak < 20 ? 20 - currentStreak : 0;

  const handleCheckin = async () => {
    if (hasCheckedInToday || checkinLoading || isRefundLocked) return;
    setCheckinLoading(true);
    const { data, error } = await supabase.rpc("daily_checkin", { p_user_id: session.user.id });
    setCheckinLoading(false);
    if (error || !data?.success) {
      alert(data?.message || error?.message || "Có lỗi xảy ra.");
      return;
    }
    setCheckinResult(data);
    setProfile((prev) => ({
      ...prev,
      checkin_streak: data.streak,
      last_checkin_date: new Date().toISOString(),
      star_points: (prev.star_points || 0) + data.reward,
    }));
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setProductUrl(text);
    } catch {}
  };

  const handleGenerate = async () => {
    if (isRefundLocked) {
      setGenError("❌ Tài khoản đã bị khóa do nợ hoàn trả. Vui lòng trả nợ để tiếp tục.");
      return;
    }
    
    if (platform !== "tiktok") {
      setGenError("Sàn này chưa khả dụng, vui lòng chọn TikTok Shop.");
      return;
    }
    if (!productUrl.trim()) {
      setGenError("Vui lòng dán link sản phẩm.");
      return;
    }
    setGenerating(true);
    setGenError("");
    setResultLink(null);
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    try {
      const { data, error } = await supabase.functions.invoke("create-affiliate-link", {
        headers: { Authorization: `Bearer ${token}` },
        body: { 
          product_url: productUrl.trim(), 
          platform: "tiktok",
          amount: 100000
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Không tạo được link.");
      const link = data.short_link || data.full_link;
      setResultLink(link);
      setProductInfo({
        name: data.product_name || "Sản phẩm TikTok Shop",
        image: data.product_image || null,
        link,
      });
    } catch (err) {
      setGenError(err.message || "Có lỗi xảy ra, thử lại sau.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8F4] pb-28 text-[#18231D]">
      <Header />
      
      <main className="mx-auto w-full max-w-md space-y-3.5 px-3.5 pt-3.5">
        <PointsCard starPoints={starPoints} pendingPoints={pendingPoints} />
        <CheckinSection 
          currentStreak={currentStreak}
          hasCheckedInToday={hasCheckedInToday}
          checkinLoading={checkinLoading}
          handleCheckin={handleCheckin}
          daysToNextMilestone={daysToNextMilestone}
          isRefundLocked={isRefundLocked}
        />
        <LuckyDraw 
  userId={session?.user?.id}
  isRefundLocked={isRefundLocked}
  onDrawComplete={(reward) => {
    // Refresh điểm sau khi bốc thăm
    setProfile((prev) => ({
      ...prev,
      star_points: (prev.star_points || 0) + reward.value
    }));
  }}
/>
        <RefundLockWarning 
          isLocked={isRefundLocked} 
          reason={refundLockReason}
          onPayRefund={() => {
            // Tính tổng nợ
            setShowPayRefund(true);
          }}
        />
        
        <TaskSection tasks={tasks} />
        <ShopSection 
          platform={platform}
          setPlatform={setPlatform}
          productUrl={productUrl}
          setProductUrl={setProductUrl}
          generating={generating}
          genError={genError}
          handlePaste={handlePaste}
          handleGenerate={handleGenerate}
          setShowGuide={setShowGuide}
          productInfo={productInfo}
          setProductInfo={setProductInfo}
          copied={copied}
          setCopied={setCopied}
          navigate={navigate}
          userId={session?.user?.id}
          isRefundLocked={isRefundLocked}
        />
        <WalletSection 
          starPoints={starPoints}
          canWithdraw={canWithdraw}
          setShowConvert={setShowConvert}
          setShowWithdraw={setShowWithdraw}
          isRefundLocked={isRefundLocked}
          refundLockReason={refundLockReason}
        />
        <Roadmap />
        <TransactionHistory userId={session?.user?.id} />
      </main>

      {/* Modals */}
      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
      {checkinResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xs rounded-[28px] bg-white p-6 text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF3E8]">
              <Flame size={28} className="fill-orange-400 text-orange-500" />
            </div>
            <p className="mt-4 text-lg font-black text-[#18231D]">Điểm danh thành công! 🔥 {checkinResult.streak} ngày</p>
            <p className="mt-1 text-2xl font-black text-amber-500">+{checkinResult.reward} Sao</p>
            <button onClick={() => setCheckinResult(null)} className="mt-5 w-full rounded-2xl bg-[#45B967] py-3 text-sm font-black text-white shadow-sm hover:bg-[#3DA85A] transition-colors">Tuyệt vời</button>
          </div>
        </div>
      )}
      {showConvert && (
        <ConvertModal
          starPoints={starPoints}
          onClose={() => setShowConvert(false)}
          onDone={(newStar, newCoin) => {
            setProfile((prev) => ({ ...prev, star_points: newStar, coins: newCoin }));
            setShowConvert(false);
          }}
        />
      )}
      {showWithdraw && (
        <WithdrawModal
          starPoints={starPoints}
          userId={session?.user?.id}
          onClose={() => setShowWithdraw(false)}
          onDone={(newStar) => {
            setProfile((prev) => ({ ...prev, star_points: newStar }));
            setShowWithdraw(false);
          }}
        />
      )}
      {showPayRefund && (
        <PayRefundModal
          userId={session?.user?.id}
          refundAmount={refundAmount}
          onClose={() => setShowPayRefund(false)}
          onDone={(data) => {
            setShowPayRefund(false);
            // Refresh profile
            window.location.reload();
          }}
        />
      )}
      <BottomNav />
    </div>
  );
        }
