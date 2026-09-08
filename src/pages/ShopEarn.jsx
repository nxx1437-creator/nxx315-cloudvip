// ============================================
// PHẦN 1: IMPORTS, UTILITIES, HEADER, POINTS CARD
// ============================================

import React, { useState, useEffect } from "react";
import {
  ArrowLeft, Star, Flame, CalendarCheck, Check, ShoppingBag,
  Link2, Copy, Loader2, Clock3, ChevronRight, Sparkles,
  Wallet2, ArrowLeftRight, Landmark, Info, AlertTriangle, Lock,
  Gift, X, HelpCircle, CheckCircle2, XCircle, Home, ListChecks, 
  Gift as GiftIcon, User
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import useTasks from "../hooks/useTasks.js";
import { supabase } from "../lib/supabaseClient.js";

// ========== UTILITIES ==========
const formatCoins = (v) => Number(v || 0).toLocaleString("vi-VN");
const formatVND = (v) => Number(v || 0).toLocaleString("vi-VN") + "đ";
const rewardForDay = (day) => day <= 10 ? 5 : day <= 20 ? 10 : 15;

// ============================================
// BOTTOM NAVIGATION - THEO SCREENSHOT
// ============================================

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const tabs = [
    { key: "/", label: "Trang chủ", icon: Home },
    { key: "/tasks", label: "Nhiệm vụ", icon: ListChecks },
    { key: "/store", label: "Cửa hàng", icon: GiftIcon },
    { key: "/wallet", label: "Ví", icon: Wallet2 },
    { key: "/profile", label: "Cá nhân", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100/80 safe-area-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto h-[62px] px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentPath === tab.key || 
            (tab.key === "/" && currentPath === "/shop-earn");
          
          return (
            <button
              key={tab.key}
              onClick={() => navigate(tab.key)}
              className="flex flex-col items-center gap-0.5 min-w-[44px] py-1 relative"
            >
              <Icon 
                size={20} 
                className={`transition-colors ${
                  isActive ? "text-blue-600" : "text-gray-400"
                }`}
              />
              <span 
                className={`text-[9px] font-medium transition-colors ${
                  isActive ? "text-blue-600 font-semibold" : "text-gray-400"
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute -top-0.5 w-4 h-0.5 rounded-full bg-blue-600" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// HEADER
// ============================================

function Header() {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 bg-white px-4 py-2.5 border-b border-gray-100/80">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-700" />
        </button>
        <div className="flex-1 px-2">
          <h1 className="text-[15px] font-bold text-gray-900">Mua hàng kiếm sao</h1>
          <p className="text-[10px] text-gray-400">Mua sắm · nhận thưởng mỗi ngày</p>
        </div>
        <button 
          onClick={() => navigate("/tasks")} 
          className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 active:bg-blue-200 transition-colors"
        >
          <Sparkles size={17} />
        </button>
      </div>
    </header>
  );
}

// ============================================
// POINTS CARD - THEO SCREENSHOT
// ============================================

function PointsCard({ starPoints, pendingPoints = 0 }) {
  const navigate = useNavigate();
  const progress = Math.min(100, (starPoints / 2000) * 100);
  const remaining = Math.max(0, 2000 - starPoints);
  const level = starPoints >= 2000 ? "Săn sale chuyên nghiệp" : "Tập sự săn sale";

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 via-blue-500 to-blue-600 p-4">
      <div className="absolute -right-8 -top-8 w-20 h-20 rounded-full bg-white/5" />
      <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full bg-white/5" />
      
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[9px] font-medium text-blue-100/80">Điểm tích lũy</p>
            <div className="flex items-end gap-1 mt-0.5">
              <span className="text-[28px] font-black text-white leading-none">
                {formatCoins(starPoints)}
              </span>
              <Star size={16} className="fill-yellow-300 text-yellow-300 mb-1" />
            </div>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-white/15 text-[8px] font-semibold text-white">
              {level}
            </span>
          </div>
          <div className="text-right">
            <p className="text-[7px] font-medium text-blue-100/70">Điểm chờ duyệt</p>
            <p className="text-[14px] font-bold text-white">{formatCoins(pendingPoints)} ⭐</p>
            {pendingPoints > 0 && (
              <p className="text-[6px] text-blue-200/70 animate-pulse">⏳ Đang xử lý</p>
            )}
          </div>
        </div>

        <div className="mt-3 border-t border-white/10 pt-2.5">
          <p className="text-[9px] font-medium text-blue-100/80">
            Thêm {formatCoins(remaining)} ⭐ trước ngày 01-01 để lên hạng nhaaa
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-1 rounded-full bg-white/20 overflow-hidden">
              <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[9px] font-semibold text-white/80">{Math.round(progress)}%</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <button 
              onClick={() => navigate("/point-history")} 
              className="text-[8px] font-medium text-blue-100/60 flex items-center gap-0.5"
            >
              Chi tiết lịch sử <ChevronRight size={10} />
            </button>
            <div className="flex items-center gap-1">
              <span className="text-[8px] font-bold text-yellow-300">×3</span>
              <span className="text-[7px] text-blue-100/50">Đang chờ sử dụng</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
              }
// ============================================
// PHẦN 2: CHECKIN SECTION
// ============================================

function CheckinSection({ 
  currentStreak, hasCheckedInToday, checkinLoading, handleCheckin, 
  daysToNextMilestone, isRefundLocked = false 
}) {
  const nextReward = rewardForDay(currentStreak + 1);

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-blue-500" />
          <p className="text-[11px] font-bold text-gray-900">CHUỖI ĐIỂM DANH</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Flame size={14} className={isRefundLocked ? 'text-gray-300' : 'text-orange-500'} />
          <span className={`text-sm font-bold ${isRefundLocked ? 'text-gray-400' : 'text-gray-900'}`}>
            {isRefundLocked ? '🔒' : currentStreak}
          </span>
          <span className={`text-[10px] font-medium ${isRefundLocked ? 'text-gray-400' : 'text-gray-500'}`}>
            ngày
          </span>
        </div>
      </div>

      {/* Reward tiers */}
      <div className="mt-2.5 flex gap-1">
        {[
          { label: "N1-N10", reward: "5" },
          { label: "N11-N20", reward: "10" },
          { label: "N21-N30", reward: "15" },
          { label: "N31 trở đi", reward: "15" },
        ].map((tier) => (
          <div key={tier.label} className={`flex-1 py-1 rounded-lg text-center ${isRefundLocked ? 'opacity-30' : 'bg-gray-50'}`}>
            <p className="text-[7px] font-medium text-gray-400">{tier.label}</p>
            <p className="text-[9px] font-bold text-blue-500">+{tier.reward}⭐</p>
          </div>
        ))}
      </div>

      {/* Check-in days - THEO SCREENSHOT */}
      <div className="mt-2.5 grid grid-cols-5 gap-1.5">
        {Array.from({ length: 5 }).map((_, offset) => {
          const baseDay = Math.max(1, currentStreak - 3);
          const dayNumber = baseDay + offset;
          const isToday = hasCheckedInToday ? offset === 3 : offset === 4;
          const isDone = dayNumber <= currentStreak;
          const isFuture = dayNumber > currentStreak && !isToday;
          
          return (
            <div 
              key={offset} 
              className={`flex flex-col items-center py-2 rounded-lg transition-all border ${
                isDone ? 'border-green-200 bg-green-50' :
                isToday ? 'border-2 border-blue-500 bg-blue-50' :
                isFuture ? 'border-gray-100 bg-gray-50' :
                'border-gray-100 bg-gray-50'
              } ${isRefundLocked ? 'opacity-30' : ''}`}
            >
              <span className={`text-[8px] font-medium ${
                isToday ? 'text-blue-600' : 
                isDone ? 'text-green-600' : 
                'text-gray-400'
              }`}>
                {isToday ? 'Hôm nay' : `Ngày ${dayNumber}`}
              </span>
              <span className={`text-[9px] font-bold ${
                isDone ? 'text-green-500' : 
                isToday ? 'text-blue-600' : 
                'text-gray-400'
              }`}>
                +{rewardForDay(dayNumber)}⭐
              </span>
              {isDone && <Check size={10} className="text-green-500 mt-0.5" />}
              {isToday && !isDone && (
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-0.5 animate-pulse" />
              )}
            </div>
          );
        })}
      </div>

      {isRefundLocked ? (
        <div className="mt-2.5 w-full py-2.5 rounded-lg bg-gray-100 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-400">
          <Lock size={13} /> Đã khóa
        </div>
      ) : (
        <button
          onClick={handleCheckin}
          disabled={hasCheckedInToday || checkinLoading}
          className="mt-2.5 w-full py-2.5 rounded-lg bg-blue-500 text-white font-bold text-sm active:scale-[0.98] transition-all disabled:bg-gray-200 disabled:text-gray-400 flex items-center justify-center gap-2"
        >
          {checkinLoading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : hasCheckedInToday ? (
            <><Check size={15} /> Đã điểm danh</>
          ) : (
            <><CalendarCheck size={15} /> Điểm danh</>
          )}
        </button>
      )}

      <p className="mt-2 text-center text-[9px] font-medium text-gray-500">
        {isRefundLocked 
          ? '🔒 Hoàn trả tiền để mở khóa'
          : daysToNextMilestone > 0 
            ? `⏳ Còn ${daysToNextMilestone} ngày nữa để đạt mốc ${currentStreak < 10 ? '10' : '15'}⭐/ngày`
            : '🔥 Bạn đang ở mốc thưởng cao nhất'}
      </p>
    </div>
  );
}
// ============================================
// PHẦN 3: TASK, SHOP, REFUND WARNING
// ============================================

// ============================================
// TASK SECTION - THEO SCREENSHOT
// ============================================

function TaskSection({ tasks }) {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-blue-500" />
          <p className="text-[11px] font-bold text-gray-900">THỬ THÁCH NHẬN ĐIỂM</p>
        </div>
        <button 
          onClick={() => navigate("/tasks")} 
          className="text-[10px] font-medium text-blue-500 flex items-center gap-0.5"
        >
          Tất cả <ChevronRight size={13} />
        </button>
      </div>

      <div className="space-y-1.5">
        {tasks.length > 0 ? (
          tasks.slice(0, 3).map((task) => {
            const isDone = task.remainingToday <= 0;
            return (
              <div key={task.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    {task.logo_url ? (
                      <img src={task.logo_url} alt={task.provider} className="w-7 h-7 rounded-lg object-cover" />
                    ) : (
                      <span className="text-[10px] font-bold text-blue-500">{task.provider?.slice(0, 2) || "NV"}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-gray-900">{task.provider}</p>
                    <p className="text-[9px] text-gray-400">Nhiệm vụ hàng ngày</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-blue-500">+{task.reward_coins}⭐</span>
                  <button
                    onClick={() => navigate("/tasks")}
                    disabled={isDone}
                    className="px-3 py-1 rounded-lg text-[9px] font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:bg-gray-200 disabled:text-gray-400"
                  >
                    {isDone ? "Xong" : "Đến"}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
            <p className="text-sm text-gray-400">Chưa có nhiệm vụ nào</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// REFUND LOCK WARNING
// ============================================

function RefundLockWarning({ isLocked, reason, onPayRefund }) {
  const navigate = useNavigate();
  if (!isLocked) return null;

  return (
    <div className="bg-red-50 rounded-xl p-3 border border-red-200 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={14} className="text-red-500" />
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-semibold text-red-600">Tài khoản đã bị khóa</p>
          <p className="text-[9px] text-red-500 leading-relaxed">
            {reason || 'Vui lòng hoàn trả tiền để mở khóa'}
          </p>
        </div>
        <div className="flex gap-1.5">
          <button 
            onClick={() => navigate("/refund-history")}
            className="text-[9px] font-semibold text-red-600 underline"
          >
            Chi tiết
          </button>
          {onPayRefund && (
            <button 
              onClick={onPayRefund}
              className="px-3 py-1 rounded-full bg-red-500 text-[9px] font-semibold text-white hover:bg-red-600 transition-colors"
            >
              Trả nợ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// SHOP SECTION - THEO SCREENSHOT
// ============================================

function ShopSection({ 
  platform, setPlatform, productUrl, setProductUrl,
  generating, genError, handlePaste, handleGenerate,
  setShowGuide, productInfo, setProductInfo, 
  copied, setCopied, navigate, userId, isRefundLocked = false
}) {
  return (
    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50">
      <div className="flex items-center gap-2 mb-3">
        <Star size={14} className="text-blue-500" />
        <p className="text-[12px] font-bold text-gray-900">MUA HÀNG TÍCH ĐIỂM</p>
      </div>

      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-[9px] text-gray-500">Link đã tạo</span>
        <button 
          onClick={() => setShowGuide(true)}
          className="text-[9px] font-medium text-blue-500 hover:text-blue-600"
        >
          TẠI ĐÂY
        </button>
      </div>

      <div className="flex items-center gap-2 bg-white rounded-lg px-2.5 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-400 transition-all">
        <Link2 size={14} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
          placeholder="Link sản phẩm"
          className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 min-w-0"
        />
        <button 
          onClick={handlePaste} 
          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-500 text-white text-[9px] font-medium hover:bg-blue-600 transition-colors"
        >
          <Copy size={11} /> Dán link
        </button>
      </div>

      {genError && <p className="mt-1.5 text-[10px] font-medium text-red-500">{genError}</p>}

      {isRefundLocked ? (
        <div className="mt-2 py-2.5 rounded-lg bg-red-50 border border-red-200 text-center">
          <Lock size={14} className="mx-auto text-red-400 mb-0.5" />
          <p className="text-[10px] font-semibold text-red-500">Tạm khóa</p>
        </div>
      ) : (
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="mt-2 w-full py-2.5 rounded-lg bg-blue-500 text-white font-semibold text-sm active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
        >
          {generating ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <><Link2 size={14} /> Lấy link nhận sao</>
          )}
        </button>
      )}

      <p className="mt-2 text-center text-[8px] text-gray-400">
        Sau khi Nhập link và Mua hàng, đơn sẽ tự động xuất hiện trong Điểm chờ duyệt sau tối đa 48 giờ.
      </p>
    </div>
  );
}
// ============================================
// PHẦN 4: WALLET, PAYMENT RULES, MAIN COMPONENT
// ============================================

// ============================================
// WALLET SECTION
// ============================================

function WalletSection({ 
  starPoints, canWithdraw, setShowConvert, setShowWithdraw,
  isRefundLocked = false, refundLockReason = ""
}) {
  return (
    <div className="bg-white rounded-xl p-3 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star size={14} className="fill-yellow-400 text-yellow-400" />
          <span className="text-[10px] font-medium text-gray-500">Sao của bạn</span>
          <span className="text-base font-bold text-gray-900">{formatCoins(starPoints)}</span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setShowConvert(true)}
            disabled={starPoints <= 0 || isRefundLocked}
            className="px-3 py-1.5 rounded-lg text-[9px] font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:bg-gray-200 disabled:text-gray-400"
          >
            Đổi Xu
          </button>
          <button
            onClick={() => canWithdraw && setShowWithdraw(true)}
            disabled={!canWithdraw || isRefundLocked}
            className="px-3 py-1.5 rounded-lg text-[9px] font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Rút
          </button>
        </div>
      </div>

      {isRefundLocked && (
        <div className="mt-1.5 p-1.5 rounded-lg bg-red-50">
          <p className="text-[8px] text-red-500 flex items-center gap-1">
            <Lock size={10} /> Tạm khóa: {refundLockReason || 'Cần hoàn trả tiền'}
          </p>
        </div>
      )}

      {!canWithdraw && !isRefundLocked && (
        <p className="mt-1 text-[8px] text-gray-400">💡 Cần tối thiểu 20.000đ để rút</p>
      )}
    </div>
  );
}

// ============================================
// PAYMENT RULES
// ============================================

function PaymentRules() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl p-3 border border-gray-100">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="w-1 h-3 rounded-full bg-blue-500" />
          <span className="text-[11px] font-semibold text-gray-900">Quy tắc thanh toán</span>
        </div>
        <ChevronRight 
          size={15} 
          className={`text-gray-400 transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`} 
        />
      </button>

      {expanded && (
        <div className="mt-2.5 pt-2.5 border-t border-gray-100 space-y-2">
          <div className="grid grid-cols-2 gap-1.5">
            <div className="py-2 px-2 rounded-lg bg-gray-50 text-center">
              <p className="text-[8px] text-gray-400">Tổng nhận VND</p>
              <p className="text-[13px] font-bold text-gray-900">0đ</p>
            </div>
            <div className="py-2 px-2 rounded-lg bg-gray-50 text-center">
              <p className="text-[8px] text-gray-400">Đã đổi Main</p>
              <p className="text-[13px] font-bold text-gray-900">0</p>
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-[8px] font-semibold text-gray-400 uppercase tracking-wider">Quy tắc</p>
            <div className="flex items-center gap-2 py-1 px-2 rounded-lg bg-gray-50">
              <span className="text-[10px]">💵</span>
              <p className="text-[10px] text-gray-600">1 sao = 10 VND khi rút tiền</p>
            </div>
            <div className="flex items-center gap-2 py-1 px-2 rounded-lg bg-gray-50">
              <span className="text-[10px]">🔄</span>
              <p className="text-[10px] text-gray-600">Đổi 1.000 mkt → 900 main (phí 10%)</p>
            </div>
            <div className="flex items-center gap-2 py-1 px-2 rounded-lg bg-gray-50">
              <span className="text-[10px]">🏦</span>
              <p className="text-[10px] text-gray-600">Rút bank/ví: phí 20%</p>
            </div>
            <div className="flex items-center gap-2 py-1 px-2 rounded-lg bg-gray-50">
              <span className="text-[10px]">📌</span>
              <p className="text-[10px] text-gray-600">Tối thiểu 10.000 VND</p>
            </div>
            <div className="flex items-center gap-2 py-1 px-2 rounded-lg bg-gray-50">
              <span className="text-[10px]">🔀</span>
              <p className="text-[10px] text-gray-600">Sao tách riêng khỏi Main coin</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
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
    <div className="min-h-screen bg-gray-50/80 pb-[72px]">
      <Header />
      
      <main className="max-w-md mx-auto px-4 pt-3 space-y-3">
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
