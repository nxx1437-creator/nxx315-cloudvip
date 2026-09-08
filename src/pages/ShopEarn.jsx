 // ============================================
// PHẦN 1: IMPORTS, UTILITIES, HEADER, POINTS CARD
// ============================================

import React, { useState, useEffect } from "react";
import {
  ArrowLeft, Star, Flame, CalendarCheck, Check, ShoppingBag, 
  Link2, Copy, Loader2, Clock3, ChevronRight, Sparkles, 
  Wallet2, ArrowLeftRight, Landmark, Info, AlertTriangle, Lock,
  Gift, X, HelpCircle, CheckCircle2, XCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import useTasks from "../hooks/useTasks.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

// ========== UTILITIES ==========
const formatCoins = (v) => Number(v || 0).toLocaleString("vi-VN");
const formatVND = (v) => Number(v || 0).toLocaleString("vi-VN") + "đ";
const rewardForDay = (day) => day <= 10 ? 5 : day <= 20 ? 10 : 15;

const PLATFORMS = [
  { key: "tiktok", label: "TikTok", active: true, mark: "TT" },
  { key: "shopee", label: "Shopee", active: false, mark: "S" },
  { key: "lazada", label: "Lazada", active: false, mark: "L" },
];

// ============================================
// HEADER
// ============================================

function Header() {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm px-4 py-3 border-b border-gray-100/50">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <div className="flex-1 px-3">
          <h1 className="text-[17px] font-semibold text-gray-900 leading-tight">Mua hàng kiếm sao</h1>
          <p className="text-[11px] text-gray-400 font-medium">Mua sắm · nhận thưởng mỗi ngày</p>
        </div>
        <button 
          onClick={() => navigate("/tasks")} 
          className="w-9 h-9 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-500 hover:bg-emerald-100 active:bg-emerald-200 transition-colors"
        >
          <Sparkles size={18} />
        </button>
      </div>
    </header>
  );
}

// ============================================
// POINTS CARD
// ============================================

function PointsCard({ starPoints, pendingPoints = 0 }) {
  const navigate = useNavigate();
  const progress = Math.min(100, (starPoints / 2000) * 100);
  const level = starPoints >= 2000 ? "Săn sale chuyên nghiệp" : "Tập sự săn sale";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-500 to-emerald-600 p-5">
      {/* Decorative elements */}
      <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-white/5" />
      <div className="absolute -bottom-12 -left-12 w-24 h-24 rounded-full bg-white/5" />
      
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium text-emerald-100/80">Điểm tích lũy</p>
          <div className="flex items-end gap-1.5 mt-0.5">
            <span className="text-[32px] font-bold text-white leading-none tracking-tight">
              {formatCoins(starPoints)}
            </span>
            <Star size={18} className="fill-yellow-300 text-yellow-300 mb-1" />
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-semibold text-white backdrop-blur-sm">
              {level}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-medium text-emerald-100/70">Chờ duyệt</p>
          <p className="text-[16px] font-bold text-white">{formatCoins(pendingPoints)} ⭐</p>
          {pendingPoints > 0 && (
            <p className="text-[8px] text-emerald-200/70 animate-pulse">⏳ Đang xử lý</p>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-medium text-emerald-100/80">
            {starPoints >= 2000 ? "Đã đạt hạng cao nhất 🎉" : `Còn ${formatCoins(2000 - starPoints)} ⭐ để lên hạng`}
          </p>
          <span className="text-[10px] font-semibold text-emerald-100/80">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
          <div 
            className="h-full rounded-full bg-white transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <button 
          onClick={() => navigate("/point-history")} 
          className="mt-2.5 text-[9px] font-medium text-emerald-100/70 hover:text-emerald-100 transition-colors flex items-center gap-1"
        >
          Chi tiết lịch sử <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}
// ============================================
// PHẦN 2: CHECKIN, TASK, SHOP SECTIONS
// ============================================

// ============================================
// CHECKIN SECTION
// ============================================

function CheckinSection({ 
  currentStreak, hasCheckedInToday, checkinLoading, handleCheckin, 
  daysToNextMilestone, isRefundLocked = false 
}) {
  const nextReward = rewardForDay(currentStreak + 1);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <Flame size={20} className={isRefundLocked ? 'text-gray-300' : 'text-orange-500'} />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Chuỗi điểm danh</p>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-xl font-bold ${isRefundLocked ? 'text-gray-400' : 'text-gray-900'}`}>
                {isRefundLocked ? '🔒' : currentStreak}
              </span>
              <span className={`text-xs font-medium ${isRefundLocked ? 'text-gray-400' : 'text-gray-500'}`}>
                {isRefundLocked ? 'đã khóa' : 'ngày'}
              </span>
            </div>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-[11px] font-semibold ${
          isRefundLocked 
            ? 'bg-gray-100 text-gray-400' 
            : 'bg-emerald-50 text-emerald-600'
        }`}>
          {isRefundLocked ? '🔒 Khóa' : `+${nextReward} ⭐`}
        </div>
      </div>

      {/* Reward tiers */}
      <div className="mt-3 flex gap-1.5">
        {[
          { label: "N1–10", reward: "5⭐" },
          { label: "N11–20", reward: "10⭐" },
          { label: "N21–30", reward: "15⭐" },
          { label: "N31+", reward: "15⭐" },
        ].map((tier) => (
          <div key={tier.label} className={`flex-1 py-1.5 rounded-lg text-center ${isRefundLocked ? 'opacity-30' : 'bg-gray-50'}`}>
            <p className="text-[8px] font-medium text-gray-400">{tier.label}</p>
            <p className="text-[10px] font-bold text-emerald-500">{tier.reward}</p>
          </div>
        ))}
      </div>

      {/* Check-in days */}
      <div className="mt-3 flex gap-1.5">
        {Array.from({ length: 5 }).map((_, offset) => {
          const baseDay = Math.max(1, currentStreak - 3);
          const dayNumber = baseDay + offset;
          const isToday = hasCheckedInToday ? offset === 3 : offset === 4;
          const isDone = dayNumber <= currentStreak;
          const isFuture = dayNumber > currentStreak && !isToday;
          
          return (
            <div 
              key={offset} 
              className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all ${
                isDone ? 'bg-emerald-50 border border-emerald-200' :
                isToday ? 'bg-emerald-50 border-2 border-emerald-400 ring-2 ring-emerald-400/20' :
                isFuture ? 'bg-gray-50 border border-gray-100' :
                'bg-gray-50 border border-gray-100'
              } ${isRefundLocked ? 'opacity-30' : ''}`}
            >
              <span className={`text-[7px] font-semibold ${isToday ? 'text-emerald-600' : isDone ? 'text-emerald-500' : 'text-gray-400'}`}>
                {isToday ? 'HÔM NAY' : `N${dayNumber}`}
              </span>
              <span className={`text-[10px] font-bold ${isDone ? 'text-emerald-500' : isFuture ? 'text-gray-400' : 'text-gray-400'}`}>
                +{rewardForDay(dayNumber)}⭐
              </span>
              {isDone && <Check size={10} className="text-emerald-500 mt-0.5" />}
            </div>
          );
        })}
      </div>

      {/* Check-in button */}
      {isRefundLocked ? (
        <div className="mt-3 w-full py-3 rounded-xl bg-gray-100 flex items-center justify-center gap-2 text-xs font-semibold text-gray-400">
          <Lock size={14} /> Đã khóa do nợ hoàn trả
        </div>
      ) : (
        <button
          onClick={handleCheckin}
          disabled={hasCheckedInToday || checkinLoading}
          className="mt-3 w-full py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm active:scale-[0.98] transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:active:scale-100 flex items-center justify-center gap-2"
        >
          {checkinLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : hasCheckedInToday ? (
            <><Check size={16} /> Đã điểm danh hôm nay</>
          ) : (
            <><CalendarCheck size={16} /> Điểm danh nhận +{nextReward}⭐</>
          )}
        </button>
      )}

      <p className="mt-2.5 text-center text-[10px] font-medium text-gray-400">
        {isRefundLocked 
          ? '🔒 Hoàn trả tiền để mở khóa điểm danh'
          : daysToNextMilestone > 0 
            ? `${daysToNextMilestone} ngày đến mốc ${currentStreak < 10 ? '10' : '15'}⭐/ngày`
            : '🔥 Đang ở mốc thưởng cao nhất'}
      </p>
    </div>
  );
}

// ============================================
// TASK SECTION
// ============================================

function TaskSection({ tasks }) {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-[12px] font-semibold text-gray-900">Thử thách nhận điểm</p>
        <button 
          onClick={() => navigate("/tasks")} 
          className="text-[11px] font-medium text-emerald-500 flex items-center gap-0.5"
        >
          Tất cả <ChevronRight size={14} />
        </button>
      </div>

      <div className="space-y-2">
        {tasks.length > 0 ? (
          tasks.slice(0, 3).map((task) => {
            const isDone = task.remainingToday <= 0;
            return (
              <div key={task.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100/60 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  {task.logo_url ? (
                    <img src={task.logo_url} alt={task.provider} className="w-9 h-9 rounded-lg object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-emerald-500">{task.provider?.slice(0, 2) || "NV"}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{task.provider}</p>
                  <p className="text-[10px] text-gray-400">{task.remainingToday} lượt còn lại</p>
                </div>
                <button
                  onClick={() => navigate("/tasks")}
                  disabled={isDone}
                  className="px-3.5 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 transition-colors disabled:bg-gray-100 disabled:text-gray-400"
                >
                  {isDone ? "Đã xong" : `+${task.reward_coins}⭐`}
                </button>
              </div>
            );
          })
        ) : (
          <div className="bg-white p-4 rounded-xl border border-gray-100/60">
            <p className="text-sm text-gray-400 text-center">Chưa có nhiệm vụ nào</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// SHOP SECTION
// ============================================

function ShopSection({ 
  platform, setPlatform, productUrl, setProductUrl,
  generating, genError, handlePaste, handleGenerate,
  setShowGuide, productInfo, setProductInfo, 
  copied, setCopied, navigate, userId, isRefundLocked = false
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100/60 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <ShoppingBag size={18} className="text-emerald-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Mua hàng tích điểm</p>
          <p className="text-[10px] text-gray-400">Dán link → lấy link → mua → nhận sao</p>
        </div>
      </div>

      <div className="mt-3 text-right">
        <button 
          onClick={() => setShowGuide(true)}
          className="text-[10px] font-medium text-emerald-500 hover:text-emerald-600 transition-colors"
        >
          Hướng dẫn
        </button>
      </div>

      <div className="mt-2 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100 focus-within:ring-2 focus-within:ring-emerald-400 transition-all">
        <Link2 size={15} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
          placeholder="Dán link sản phẩm"
          className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 min-w-0"
        />
        <button 
          onClick={handlePaste} 
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-200 text-gray-600 text-[10px] font-medium hover:bg-gray-300 active:bg-gray-400 transition-colors"
        >
          <Copy size={12} /> Dán
        </button>
      </div>

      {genError && <p className="mt-2 text-[11px] font-medium text-red-500">{genError}</p>}

      {isRefundLocked ? (
        <div className="mt-3 py-3 rounded-xl bg-red-50 border border-red-200 text-center">
          <Lock size={16} className="mx-auto text-red-400 mb-1" />
          <p className="text-[11px] font-semibold text-red-500">Tạm khóa</p>
          <p className="text-[9px] text-red-400">Hoàn trả tiền để tiếp tục</p>
        </div>
      ) : (
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="mt-3 w-full py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
        >
          {generating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <><Link2 size={15} /> Lấy link nhận sao</>
          )}
        </button>
      )}

      <p className="mt-2.5 text-center text-[9px] text-gray-400">
        Đơn sẽ xuất hiện trong Điểm chờ duyệt sau 24–48h
      </p>

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <button 
          onClick={() => navigate("/link-history")}
          className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-500"
        >
          <Clock3 size={14} /> Lịch sử tạo link
        </button>
        <ChevronRight size={14} className="text-emerald-400" />
      </div>
    </div>
  );
        }
// ============================================
// PHẦN 3: REFUND WARNING, WALLET, PAYMENT RULES
// ============================================

// ============================================
// REFUND LOCK WARNING
// ============================================

function RefundLockWarning({ isLocked, reason, onPayRefund }) {
  const navigate = useNavigate();
  if (!isLocked) return null;

  return (
    <div className="bg-red-50 rounded-xl p-4 border border-red-200 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={16} className="text-red-500" />
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-red-600">Tài khoản đã bị khóa</p>
          <p className="text-[10px] text-red-500 leading-relaxed">
            {reason || 'Vui lòng hoàn trả tiền để mở khóa tính năng'}
          </p>
          <div className="flex gap-2 mt-2">
            <button 
              onClick={() => navigate("/refund-history")}
              className="text-[10px] font-semibold text-red-600 underline"
            >
              Xem chi tiết
            </button>
            {onPayRefund && (
              <button 
                onClick={onPayRefund}
                className="px-3 py-0.5 rounded-full bg-red-500 text-[10px] font-semibold text-white hover:bg-red-600 transition-colors"
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

// ============================================
// WALLET SECTION
// ============================================

function WalletSection({ 
  starPoints, canWithdraw, setShowConvert, setShowWithdraw,
  isRefundLocked = false, refundLockReason = ""
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100/60 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star size={16} className="fill-yellow-400 text-yellow-400" />
          <span className="text-[11px] font-semibold text-gray-500">Sao của bạn</span>
          <span className="text-lg font-bold text-gray-900">{formatCoins(starPoints)}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowConvert(true)}
            disabled={starPoints <= 0 || isRefundLocked}
            className="px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 transition-colors disabled:bg-gray-200 disabled:text-gray-400"
          >
            Đổi Xu
          </button>
          <button
            onClick={() => canWithdraw && setShowWithdraw(true)}
            disabled={!canWithdraw || isRefundLocked}
            className="px-3 py-1.5 rounded-lg text-[10px] font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Rút
          </button>
        </div>
      </div>

      {isRefundLocked && (
        <div className="mt-2 p-2 rounded-lg bg-red-50 border border-red-200">
          <p className="text-[9px] text-red-500 flex items-center gap-1.5">
            <Lock size={11} /> Tạm khóa: {refundLockReason || 'Cần hoàn trả tiền'}
          </p>
        </div>
      )}

      {!canWithdraw && !isRefundLocked && (
        <p className="mt-2 text-[9px] text-gray-400">💡 Cần tối thiểu 20.000đ để rút</p>
      )}
    </div>
  );
}

// ============================================
// PAYMENT RULES
// ============================================

function PaymentRules() {
  const [expanded, setExpanded] = useState(false);
  const rules = [
    { icon: "💵", text: "1 sao = 10 VND khi rút tiền" },
    { icon: "🔄", text: "Đổi 1.000 mkt → 900 main (phí 10%)" },
    { icon: "🏦", text: "Rút bank/ví: phí 20%" },
    { icon: "📌", text: "Tối thiểu 10.000 VND" },
    { icon: "🔀", text: "Sao tách riêng khỏi Main coin" },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100/60 shadow-sm">
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
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 py-2.5 px-3 rounded-xl bg-gray-50 text-center">
              <p className="text-[9px] text-gray-400">Tổng nhận VND</p>
              <p className="text-[15px] font-bold text-gray-900">0đ</p>
            </div>
            <div className="flex-1 py-2.5 px-3 rounded-xl bg-gray-50 text-center">
              <p className="text-[9px] text-gray-400">Đã đổi Main</p>
              <p className="text-[15px] font-bold text-gray-900">0</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Quy tắc</p>
            {rules.map((rule, i) => (
              <div key={i} className="flex items-center gap-2.5 py-1.5 px-2.5 rounded-lg bg-gray-50">
                <span className="text-[13px]">{rule.icon}</span>
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
// PHẦN 4: MAIN COMPONENT
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

  return (
    <div className="min-h-screen bg-gray-50/80 pb-20">
      <Header />
      
      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
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

      <BottomNav />
    </div>
  );
        }
