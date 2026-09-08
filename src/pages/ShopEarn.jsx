// ============================================
// PHẦN 1: IMPORTS, UTILITIES, HEADER, POINTS CARD
// ============================================

import React, { useState, useEffect } from "react";
import {
  Link2, Copy, Check, Loader2, Star, ArrowLeftRight, Landmark, X,
  Clock3, CheckCircle2, XCircle, ArrowLeft, HelpCircle, Info,
  ShoppingBag, PackageCheck, Wallet2, Flame, CalendarCheck,
  ChevronRight, Sparkles, Gift, AlertTriangle, Lock,
  RefreshCw, Zap, Award, Crown, TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import useTasks from "../hooks/useTasks.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

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
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 shadow-sm">
      <div className="mx-auto flex max-w-md items-center gap-3">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-[16px] font-bold text-gray-900">Mua hàng kiếm sao</h1>
          <p className="text-[11px] text-gray-400">Mua sắm vui vẻ · nhận Sao mỗi ngày ✨</p>
        </div>
        <button onClick={() => navigate("/tasks")} className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
          <Sparkles size={17} />
        </button>
      </div>
    </header>
  );
}

// ===== POINTS CARD =====
function PointsCard({ starPoints, pendingPoints = 0 }) {
  const navigate = useNavigate();
  const progress = Math.min(100, (starPoints / 2000) * 100);
  
  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 p-5 shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium text-emerald-100">Điểm tích lũy</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[28px] font-bold text-white">{formatCoins(starPoints)}</span>
            <Star size={18} className="fill-yellow-300 text-yellow-300" />
          </div>
          <span className="mt-2 inline-block rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            🏆 Tập sự săn sale
          </span>
        </div>
        <div className="rounded-xl bg-white/20 px-3 py-2 text-right backdrop-blur-sm">
          <p className="text-[8px] font-medium text-emerald-100">Điểm chờ duyệt</p>
          <p className="text-[15px] font-bold text-white">{formatCoins(pendingPoints)} ⭐</p>
          {pendingPoints > 0 && (
            <p className="text-[7px] text-emerald-200 animate-pulse">⏳ Đang xử lý...</p>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-white/20 p-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium text-emerald-100">
            Thêm 2.000 ⭐ để nâng hạng 
          </p>
          <ChevronRight size={14} className="text-emerald-200" />
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/30">
          <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <button 
          onClick={() => navigate("/point-history")} 
          className="mt-2 text-[9px] font-medium text-emerald-100 hover:underline"
        >
          Chi tiết lịch sử điểm →
        </button>
      </div>
    </div>
  );
        }
// ============================================
// PHẦN 2: CHECKIN, TASK, SHOP SECTION
// ============================================

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
    <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-gray-400 tracking-wider">CHUỖI ĐIỂM DANH</p>
          <div className="mt-1 flex items-center gap-1.5">
            <Flame size={18} className={isRefundLocked ? 'text-gray-300' : 'text-orange-500'} />
            <span className={`text-xl font-bold ${isRefundLocked ? 'text-gray-400' : 'text-gray-900'}`}>
              {isRefundLocked ? '🔒' : currentStreak}
            </span>
            <span className={`text-xs font-medium ${isRefundLocked ? 'text-gray-400' : 'text-gray-500'}`}>
              {isRefundLocked ? 'bị khóa' : 'ngày'}
            </span>
          </div>
        </div>
        <div className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
          isRefundLocked 
            ? 'bg-gray-100 text-gray-400' 
            : 'bg-emerald-50 text-emerald-600'
        }`}>
          {isRefundLocked ? '🔒 Đã khóa' : `+${nextReward} ⭐ hôm nay`}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {[["N1–N10", "+5"], ["N11–N20", "+10"], ["N21–N30", "+15"], ["N31+", "+15"]].map(([title, reward]) => (
          <div key={title} className={`rounded-xl bg-gray-50 px-1 py-2 text-center ${isRefundLocked ? 'opacity-40' : ''}`}>
            <p className="text-[8px] font-semibold text-gray-400">{title}</p>
            <p className="mt-0.5 text-[10px] font-bold text-emerald-500">{reward}⭐</p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-1.5">
        {Array.from({ length: 5 }).map((_, offset) => {
          const baseDay = Math.max(1, currentStreak - 3);
          const dayNumber = baseDay + offset;
          const isToday = hasCheckedInToday ? offset === 3 : offset === 4;
          const isDone = dayNumber <= currentStreak;
          return (
            <div key={offset} className={`flex flex-1 flex-col items-center rounded-xl border px-1 py-2 transition-all ${
              isDone ? "border-emerald-200 bg-emerald-50" :
              isToday ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-400" :
              "border-gray-100 bg-gray-50"
            } ${isRefundLocked ? 'opacity-40' : ''}`}>
              <span className="text-[7px] font-semibold text-gray-400">{isToday ? "HÔM NAY" : `N${dayNumber}`}</span>
              <span className={`mt-0.5 text-[10px] font-bold ${isDone ? "text-emerald-500" : "text-gray-400"}`}>
                +{rewardForDay(dayNumber)}⭐
              </span>
              {isDone && <Check size={10} className="mt-0.5 text-emerald-500" />}
            </div>
          );
        })}
      </div>

      {isRefundLocked ? (
        <div className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 py-3 text-xs font-semibold text-gray-400">
          <Lock size={14} /> Đã khóa do nợ hoàn trả
        </div>
      ) : (
        <button
          onClick={handleCheckin}
          disabled={hasCheckedInToday || checkinLoading}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 transition active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400"
        >
          {checkinLoading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : hasCheckedInToday ? (
            <><Check size={14} /> Đã điểm danh hôm nay</>
          ) : (
            <><CalendarCheck size={14} /> Điểm danh nhận +{nextReward} Sao</>
          )}
        </button>
      )}

      <p className={`mt-2 text-center text-[9px] font-medium ${isRefundLocked ? 'text-gray-400' : 'text-gray-500'}`}>
        {isRefundLocked 
          ? '🔒 Vui lòng hoàn trả tiền để mở khóa' 
          : daysToNextMilestone > 0 
            ? `Còn ${daysToNextMilestone} ngày để đạt mốc ${currentStreak < 10 ? "10" : "15"} ⭐/ngày`
            : "🔥 Bạn đang ở mốc thưởng cao nhất"}
      </p>
    </div>
  );
}

// ===== TASK SECTION =====
function TaskSection({ tasks }) {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex items-center justify-between px-1 mb-2">
        <p className="text-[10px] font-semibold text-gray-400 tracking-wider">THỬ THÁCH NHẬN ĐIỂM</p>
        <button onClick={() => navigate("/tasks")} className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-500">
          Tất cả <ChevronRight size={13} />
        </button>
      </div>

      <div className="rounded-2xl bg-white p-3 shadow-sm border border-gray-100">
        {tasks.length > 0 ? (
          <div className="space-y-2">
            {tasks.slice(0, 3).map((task) => {
              const isDone = task.remainingToday <= 0;
              return (
                <div key={task.id} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 hover:bg-gray-100 transition-colors">
                  {task.logo_url ? (
                    <img src={task.logo_url} alt={task.provider} className="h-11 w-11 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-xs font-bold text-emerald-600">
                      {task.provider?.slice(0, 2) || "NV"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-gray-900">{task.provider}</p>
                    <p className="mt-0.5 text-[9px] text-gray-400">Nhiệm vụ hàng ngày · {task.remainingToday} lượt còn lại</p>
                  </div>
                  <button
                    onClick={() => navigate("/tasks")}
                    disabled={isDone}
                    className="shrink-0 rounded-xl bg-emerald-500 px-3 py-2 text-[9px] font-bold text-white hover:bg-emerald-600 transition disabled:bg-gray-200 disabled:text-gray-400"
                  >
                    {isDone ? "Đã xong" : `+${task.reward_coins} ⭐`}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <button onClick={() => navigate("/tasks")} className="flex w-full items-center justify-between rounded-xl bg-gray-50 p-4 text-left hover:bg-gray-100 transition">
            <div>
              <p className="text-xs font-bold text-gray-900">Nhiệm vụ hàng ngày</p>
              <p className="mt-1 text-[9px] text-gray-400">Vào xem các thử thách mới để nhận thêm Sao.</p>
            </div>
            <ChevronRight size={16} className="text-emerald-400" />
          </button>
        )}
      </div>
    </div>
  );
}

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
    <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
          <ShoppingBag size={18} />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">MUA HÀNG TÍCH ĐIỂM</p>
          <p className="mt-0.5 text-[10px] text-gray-400">Dán link sản phẩm → lấy link → mua hàng → nhận Sao</p>
        </div>
      </div>

      <div className="mt-2 text-right">
        <button 
          onClick={() => setShowGuide(true)}
          className="text-[9px] font-semibold text-emerald-500 underline"
        >
          Hướng dẫn TẠI ĐÂY
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 focus-within:ring-2 focus-within:ring-emerald-400 transition">
        <Link2 size={15} className="shrink-0 text-gray-400" />
        <input
          type="text"
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
          placeholder="Dán link sản phẩm"
          className="min-w-0 flex-1 bg-transparent text-xs font-medium text-gray-900 outline-none placeholder:text-gray-400"
        />
        <button onClick={handlePaste} className="flex shrink-0 items-center gap-1 rounded-lg bg-gray-200 px-3 py-1.5 text-[9px] font-semibold text-gray-600 hover:bg-gray-300 transition">
          <Copy size={11} /> Dán link
        </button>
      </div>

      {genError && <p className="mt-2 text-[10px] font-medium text-red-500">{genError}</p>}

      {isRefundLocked ? (
        <div className="mt-3 rounded-xl bg-red-50 p-4 text-center border border-red-200">
          <Lock size={16} className="mx-auto text-red-400" />
          <p className="mt-1 text-[11px] font-bold text-red-500">⛔ Tạm khóa</p>
          <p className="text-[9px] text-red-400">Vui lòng hoàn trả tiền để tiếp tục</p>
        </div>
      ) : (
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 transition active:scale-[0.98] disabled:opacity-50"
        >
          {generating ? <Loader2 size={15} className="animate-spin" /> : <><Link2 size={14} /> Lấy link nhận Sao</>}
        </button>
      )}

      <p className="mt-2.5 text-center text-[8px] text-gray-400">
        Đơn sẽ xuất hiện trong Điểm chờ duyệt sau 24-48h
      </p>

      {/* Lịch sử tạo link */}
      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
        <button 
          onClick={() => navigate("/link-history")}
          className="flex items-center gap-1 text-[10px] font-semibold text-emerald-500"
        >
          <Clock3 size={12} /> Lịch sử tạo link
        </button>
        <ChevronRight size={14} className="text-emerald-400" />
      </div>
    </div>
  );
              }
// ============================================
// PHẦN 3: REFUND WARNING, WALLET, PAYMENT RULES, MAIN
// ============================================

// ===== REFUND LOCK WARNING =====
function RefundLockWarning({ isLocked, reason, onPayRefund }) {
  const navigate = useNavigate();
  if (!isLocked) return null;
  
  return (
    <div className="rounded-2xl bg-red-50 border border-red-200 p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle size={17} className="text-red-500" />
        </div>
        <div className="flex-1">
          <p className="text-[12px] font-bold text-red-600">⛔ Tài khoản đã bị khóa</p>
          <p className="mt-0.5 text-[10px] leading-4 text-red-500">
            {reason || 'Chưa hoàn trả tiền cho đơn hàng bị từ chối.'}
          </p>
          <div className="mt-2 flex gap-2">
            <button 
              onClick={() => navigate("/refund-history")}
              className="text-[9px] font-bold text-red-600 underline"
            >
              Xem chi tiết →
            </button>
            {onPayRefund && (
              <button 
                onClick={onPayRefund}
                className="rounded-full bg-red-500 px-3 py-0.5 text-[9px] font-bold text-white hover:bg-red-600 transition"
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
    <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400">
            <Star size={13} className="fill-yellow-400 text-yellow-400" /> SAO CỦA BẠN
          </p>
          <p className="mt-0.5 text-2xl font-bold text-gray-900">{formatCoins(starPoints)} ⭐</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50">
          <Wallet2 size={19} className="text-emerald-500" />
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setShowConvert(true)}
          disabled={starPoints <= 0 || isRefundLocked}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[10px] font-bold transition ${
            isRefundLocked || starPoints <= 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
              : "bg-emerald-500 text-white hover:bg-emerald-600"
          }`}
        >
          <ArrowLeftRight size={13} /> Đổi sang Xu
        </button>
        <button
          onClick={() => canWithdraw && setShowWithdraw(true)}
          disabled={!canWithdraw || isRefundLocked}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-[10px] font-bold transition ${
            isRefundLocked || !canWithdraw
              ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
              : "border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Landmark size={13} /> Rút tiền
        </button>
      </div>

      {isRefundLocked && (
        <div className="mt-2 rounded-xl bg-red-50 p-2 border border-red-200">
          <p className="flex items-center gap-1.5 text-[9px] font-medium text-red-500">
            <Lock size={11} /> Tạm khóa: {refundLockReason || 'Cần hoàn trả tiền'}
          </p>
        </div>
      )}

      {!canWithdraw && !isRefundLocked && (
        <p className="mt-2 text-[9px] text-gray-400">
          💡 Cần tối thiểu 20.000đ để rút
        </p>
      )}
    </div>
  );
}

// ===== PAYMENT RULES =====
function PaymentRules() {
  const [expanded, setExpanded] = useState(false);
  const rules = [
    { text: "1 sao = 10 VND khi rút tiền" },
    { text: "Đổi 1.000 mkt → 900 main (phí 10%)" },
    { text: "Rút bank/ví: phí 20%" },
    { text: "Tối thiểu 10.000 VND" },
    { text: "Sao tách riêng khỏi Main coin" },
  ];

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Info size={15} className="text-emerald-500" />
          <span className="text-[13px] font-semibold text-gray-900">Quy tắc thanh toán</span>
        </div>
        <ChevronRight 
          size={16} 
          className={`text-gray-400 transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`} 
        />
      </button>

      {expanded && (
        <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-gray-50 p-2.5 text-center">
              <p className="text-[9px] text-gray-400">Tổng nhận VND</p>
              <p className="text-[14px] font-bold text-gray-900">0đ</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-2.5 text-center">
              <p className="text-[9px] text-gray-400">Đã đổi Main</p>
              <p className="text-[14px] font-bold text-gray-900">0</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Quy tắc</p>
            {rules.map((rule, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5">
                <span className="text-[12px]">{rule.icon}</span>
                <p className="text-[11px] text-gray-600">{rule.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
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
  useEffect(() => {
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
  useEffect(() => {
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
    setProfile(prev => ({
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
      setGenError("Tài khoản bị khóa do nợ hoàn trả.");
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
        body: { product_url: productUrl.trim(), platform: "tiktok", amount: 100000 },
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

  // PaymentRules component được định nghĩa ở trên

  return (
    <div className="min-h-screen bg-gray-50 pb-24 text-gray-900">
      <Header />
      <main className="mx-auto max-w-md space-y-3 px-4 pt-3">
        <PointsCard starPoints={starPoints} pendingPoints={pendingPoints} />
        <CheckinSection 
          currentStreak={currentStreak}
          hasCheckedInToday={hasCheckedInToday}
          checkinLoading={checkinLoading}
          handleCheckin={handleCheckin}
          daysToNextMilestone={daysToNextMilestone}
          isRefundLocked={isRefundLocked}
        />
        <RefundLockWarning 
          isLocked={isRefundLocked} 
          reason={refundLockReason}
          onPayRefund={() => setShowPayRefund(true)}
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
        <PaymentRules />
      </main>

      {/* Modals - Guide, Convert, Withdraw, PayRefund - Tối ưu sau */}

      <BottomNav />
    </div>
  );
          }
