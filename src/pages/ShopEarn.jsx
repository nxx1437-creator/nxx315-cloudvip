// src/pages/ShopEarn.jsx - PHẦN 1
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Star, Flame, CalendarCheck, Check, ShoppingBag,
  Link2, Copy, Loader2, Clock3, ChevronRight, Sparkles,
  Wallet2, AlertTriangle, Lock, X, HelpCircle, Gift
} from "lucide-react";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import useTasks from "../hooks/useTasks.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

const formatCoins = (v) => Number(v || 0).toLocaleString("vi-VN");
const rewardForDay = (day) => day <= 10 ? 5 : day <= 20 ? 10 : 15;

// ============================================
// HEADER
// ============================================
function Header() {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 bg-white px-4 py-3 border-b border-gray-100">
      <div className="flex items-center gap-3 max-w-md mx-auto">
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <div className="flex-1">
          <h1 className="text-[16px] font-bold text-gray-900">Mua hàng kiếm sao</h1>
          <p className="text-[12px] text-gray-400">Mua sắm vui vẻ · nhận Sao mỗi ngày ✨</p>
        </div>
        <button onClick={() => navigate("/tasks")} className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 transition">
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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 p-5 shadow-lg shadow-blue-500/20">
      <div className="absolute -right-10 -top-10 w-24 h-24 rounded-full bg-white/5" />
      <div className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full bg-white/5" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[12px] font-medium text-blue-100">Điểm tích lũy</p>
          <div className="flex items-end gap-1 mt-0.5">
            <span className="text-[34px] font-bold text-white">{formatCoins(starPoints)}</span>
            <Star size={18} className="fill-yellow-300 text-yellow-300 mb-1" />
          </div>
          <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-white/20 text-[11px] font-semibold text-white">
            {level}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-medium text-blue-100">Điểm chờ duyệt</p>
          <p className="text-[16px] font-bold text-white">{formatCoins(pendingPoints)} ⭐</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/10">
        <p className="text-[11px] font-medium text-blue-100">
          Thêm {formatCoins(Math.max(0, 2000 - starPoints))} ⭐ để nâng hạng
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-[11px] font-medium text-white">{Math.round(progress)}%</span>
        </div>
        <button onClick={() => navigate("/point-history")} className="mt-1.5 text-[10px] font-medium text-blue-100 hover:text-white transition">
          Chi tiết lịch sử điểm →
        </button>
      </div>
    </div>
  );
}

// ============================================
// CHECKIN SECTION
// ============================================
function CheckinSection({ currentStreak, hasCheckedInToday, checkinLoading, handleCheckin, daysToNextMilestone }) {
  const nextReward = rewardForDay(currentStreak + 1);

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-blue-500" />
          <p className="text-[12px] font-bold text-gray-400">CHUỖI ĐIỂM DANH</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Flame size={16} className="text-orange-500" />
          <span className="text-base font-bold text-gray-900">{currentStreak}</span>
          <span className="text-[11px] text-gray-400">ngày</span>
        </div>
      </div>

      <div className="mt-2.5 grid grid-cols-4 gap-1">
        {[
          { label: "N1-N10", reward: "5" },
          { label: "N11-N20", reward: "10" },
          { label: "N21-N30", reward: "15" },
          { label: "N31 trở đi", reward: "15" },
        ].map((tier) => (
          <div key={tier.label} className="py-1.5 rounded-lg text-center bg-gray-50">
            <p className="text-[9px] font-medium text-gray-400">{tier.label}</p>
            <p className="text-[11px] font-bold text-blue-500">+{tier.reward}⭐</p>
          </div>
        ))}
      </div>

      <div className="mt-2.5 grid grid-cols-5 gap-1.5">
        {Array.from({ length: 5 }).map((_, offset) => {
          const baseDay = Math.max(1, currentStreak - 3);
          const dayNumber = baseDay + offset;
          const isToday = hasCheckedInToday ? offset === 3 : offset === 4;
          const isDone = dayNumber <= currentStreak;

          return (
            <div key={offset} className={`flex flex-col items-center py-2 rounded-lg border ${
              isToday ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/30' :
              isDone ? 'border-green-200 bg-green-50' :
              'border-gray-100 bg-gray-50'
            }`}>
              <span className={`text-[9px] font-medium ${isToday ? 'text-blue-600' : isDone ? 'text-green-600' : 'text-gray-400'}`}>
                {isToday ? 'Hôm nay' : `Ngày ${dayNumber}`}
              </span>
              <span className={`text-[10px] font-bold ${isToday || isDone ? 'text-blue-600' : 'text-gray-400'}`}>
                +{rewardForDay(dayNumber)}⭐
              </span>
              {isDone && <Check size={10} className="text-green-500 mt-0.5" />}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleCheckin}
        disabled={hasCheckedInToday || checkinLoading}
        className="mt-3 w-full py-3 rounded-xl bg-blue-500 text-white font-semibold text-base hover:bg-blue-600 transition active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400"
      >
        {checkinLoading ? <Loader2 size={18} className="animate-spin" /> : hasCheckedInToday ? ' Đã điểm danh' : 'Điểm danh'}
      </button>

      <p className="mt-2 text-center text-[10px] text-gray-400">
        {daysToNextMilestone > 0 
          ? `⏳ Còn ${daysToNextMilestone} ngày để đạt mốc ${currentStreak < 10 ? '10' : '15'}⭐/ngày` 
          : '🔥 Bạn đang ở mốc thưởng cao nhất'}
      </p>
    </div>
  );
}
// src/pages/ShopEarn.jsx - PHẦN 2
// ============================================
// TASK SECTION
// ============================================
function TaskSection({ tasks }) {
  const navigate = useNavigate();
  if (tasks.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-blue-500" />
          <p className="text-[12px] font-bold text-gray-400">THỬ THÁCH NHẬN ĐIỂM</p>
        </div>
        <button onClick={() => navigate("/tasks")} className="text-[10px] font-medium text-blue-500 flex items-center gap-0.5">
          Tất cả <ChevronRight size={14} />
        </button>
      </div>
      <div className="space-y-2">
        {tasks.slice(0, 3).map((task) => {
          const isDone = task.remainingToday <= 0;
          return (
            <div key={task.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-sm font-bold text-blue-500">
                  {task.logo_url ? (
                    <img src={task.logo_url} alt={task.provider} className="w-8 h-8 rounded-lg object-cover" />
                  ) : (
                    task.provider?.slice(0, 2) || 'NV'
                  )}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-gray-900">{task.provider}</p>
                  <p className="text-[10px] text-gray-400">Nhiệm vụ hàng ngày</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-blue-500">+{task.reward_coins}⭐</span>
                <button 
                  onClick={() => navigate("/tasks")}
                  disabled={isDone}
                  className="px-3 py-1.5 rounded-full bg-blue-500 text-white text-[10px] font-bold hover:bg-blue-600 transition disabled:bg-gray-200 disabled:text-gray-400"
                >
                  {isDone ? 'Xong' : 'Đến'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// SHOP SECTION
// ============================================
function ShopSection({ productUrl, setProductUrl, generating, genError, handlePaste, handleGenerate, setShowGuide }) {
  return (
    <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
      <div className="flex items-center gap-2 mb-1">
        <Star size={16} className="text-blue-500" />
        <p className="text-[13px] font-bold text-gray-900">MUA HÀNG TÍCH ĐIỂM</p>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-gray-400">Link đã tạo</span>
        <button onClick={() => setShowGuide(true)} className="text-[10px] font-medium text-blue-500 underline">
          TẠI ĐÂY
        </button>
      </div>

      <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2.5 border border-gray-200 mt-2 focus-within:ring-2 focus-within:ring-blue-400">
        <Link2 size={16} className="text-gray-400" />
        <input
          type="text"
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
          placeholder="Link sản phẩm"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 min-w-0"
        />
        <button onClick={handlePaste} className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-[10px] font-bold hover:bg-blue-600 transition">
          Dán link
        </button>
      </div>

      {genError && <p className="mt-1 text-[10px] text-red-500">{genError}</p>}

      <button
        onClick={handleGenerate}
        disabled={generating}
        className="mt-2 w-full py-3 rounded-lg bg-blue-500 text-white font-semibold text-base hover:bg-blue-600 transition active:scale-[0.98] disabled:opacity-50"
      >
        {generating ? <Loader2 size={18} className="animate-spin" /> : 'Lấy link nhận sao'}
      </button>

      <p className="mt-2 text-center text-[9px] text-gray-400">
        Sau khi Nhập link và Mua hàng, đơn sẽ xuất hiện trong Điểm chờ duyệt sau 24-48h.
      </p>
    </div>
  );
}

// ============================================
// PRODUCT INFO MODAL
// ============================================
function ProductInfoModal({ productInfo, setProductInfo }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  if (!productInfo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 animate-in slide-in-from-bottom duration-300">
        <div className="mx-auto w-12 h-1 rounded-full bg-gray-300" />
        <div className="flex items-start justify-between mt-3">
          <div>
            <p className="text-[17px] font-bold text-blue-600">Tạo link mua hàng thành công </p>
            <p className="text-[11px] text-gray-400">Mua hàng từ link để tích điểm đổi quà.</p>
          </div>
          <button onClick={() => setProductInfo(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
            <X size={18} />
          </button>
        </div>

        <div className="mt-3 flex gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
          <div className="w-20 h-20 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
            {productInfo.image ? (
              <img src={productInfo.image} alt={productInfo.name} className="w-full h-full rounded-xl object-cover" />
            ) : (
              <ShoppingBag size={28} className="text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 line-clamp-2">{productInfo.name}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-black text-white text-[9px] font-bold rounded">Shopee</span>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <button 
            onClick={async () => {
              await navigator.clipboard.writeText(productInfo.link);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex-1 py-2.5 rounded-xl border border-blue-500 text-blue-500 text-sm font-bold hover:bg-blue-50 transition"
          >
            {copied ? '✅ Đã sao chép' : '📋 Chia sẻ'}
          </button>
          <button 
            onClick={() => navigate(`/redirect?url=${encodeURIComponent(productInfo.link)}&name=${encodeURIComponent(productInfo.name)}&image=${encodeURIComponent(productInfo.image || '')}`)}
            className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-bold hover:bg-blue-600 transition"
          >
            Mua ngay →
          </button>
        </div>

        <div className="mt-3 p-2.5 rounded-xl bg-blue-50 text-center border border-blue-100">
          <p className="text-[10px] font-medium text-blue-600">Đơn hàng của Sếp sẽ được cập nhật điểm sau 24-48h</p>
        </div>

        <div className="mt-3 border-t border-gray-100 pt-3">
          <p className="text-[10px] font-bold text-gray-700">📝 Lưu ý để được ghi nhận đơn</p>
          <div className="mt-1.5 space-y-1">
            {[
              'Sau mỗi lần đặt hàng, nhớ bấm lại link để nhận Sao cho đơn tiếp theo.',
              'Mua đúng sản phẩm được gắn link hoặc sản phẩm cùng shop để nhận Sao chính xác.',
              'Không tính Sao cho sản phẩm được thêm từ livestream/video KOC.'
            ].map((note, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <Check size={11} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-[9px] text-gray-500 leading-relaxed">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// GUIDE MODAL
// ============================================
function GuideModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-900">Cách nhận Sao trong 3 bước</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="space-y-3">
          {[
            { n: '1', title: 'Sao chép link sản phẩm', desc: 'Mở app/web sàn TMĐT, tìm sản phẩm bạn thích rồi sao chép đường dẫn.' },
            { n: '2', title: 'Dán link & lấy link nhận Sao', desc: 'Dán link vừa copy vào ô ở trang này để hệ thống tạo link riêng cho bạn.' },
            { n: '3', title: 'Mua hàng & nhận Sao', desc: 'Mở link vừa tạo, mua hàng như bình thường. Sao sẽ tự cộng vào ví sau khi đơn được duyệt.' },
          ].map((step) => (
            <div key={step.n} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">{step.n}</div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                <p className="text-xs text-gray-500">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-4 w-full py-2.5 rounded-xl bg-blue-500 text-white font-semibold text-sm hover:bg-blue-600 transition">Đã hiểu</button>
      </div>
    </div>
  );
}

// ============================================
// MAIN
// ============================================
export default function ShopEarn() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { profile, setProfile } = useProfile();
  const { tasks } = useTasks(session?.user?.id);

  const [productUrl, setProductUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [pendingPoints, setPendingPoints] = useState(0);
  const [productInfo, setProductInfo] = useState(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchPending = async () => {
      const { data } = await supabase
        .from('pending_transactions')
        .select('star_points_expected')
        .eq('user_id', session.user.id)
        .eq('status', 'pending');
      if (data) setPendingPoints(data.reduce((s, i) => s + i.star_points_expected, 0));
    };
    fetchPending();
  }, [session]);

  const starPoints = Number(profile?.star_points || 0);
  const currentStreak = profile?.checkin_streak || 0;
  const todayStr = new Date().toDateString();
  const hasCheckedInToday = profile?.last_checkin_date && new Date(profile.last_checkin_date).toDateString() === todayStr;
  const daysToNextMilestone = currentStreak < 10 ? 10 - currentStreak : currentStreak < 20 ? 20 - currentStreak : 0;

  const handleCheckin = async () => {
    if (hasCheckedInToday || checkinLoading) return;
    setCheckinLoading(true);
    const { data, error } = await supabase.rpc("daily_checkin", { p_user_id: session.user.id });
    setCheckinLoading(false);
    if (error || !data?.success) return alert(data?.message || "Lỗi");
    setProfile(prev => ({
      ...prev,
      checkin_streak: data.streak,
      last_checkin_date: new Date().toISOString(),
      star_points: (prev.star_points || 0) + data.reward,
    }));
  };

  const handlePaste = async () => {
    try { const text = await navigator.clipboard.readText(); if (text) setProductUrl(text); } catch {}
  };

  const handleGenerate = async () => {
    if (!productUrl.trim()) return setGenError("Vui lòng dán link sản phẩm.");
    setGenerating(true);
    setGenError("");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("create-affiliate-link", {
        headers: { Authorization: `Bearer ${sessionData?.session?.access_token}` },
        body: { product_url: productUrl.trim(), platform: "tiktok" },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Không tạo được link.");
      setProductInfo({
        name: data.product_name || "Sản phẩm TikTok Shop",
        image: data.product_image || null,
        link: data.full_link || data.short_link,
      });
    } catch (err) {
      setGenError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      <div className="max-w-md mx-auto px-4 pt-3 space-y-3">
        <PointsCard starPoints={starPoints} pendingPoints={pendingPoints} />
        <CheckinSection
          currentStreak={currentStreak}
          hasCheckedInToday={hasCheckedInToday}
          checkinLoading={checkinLoading}
          handleCheckin={handleCheckin}
          daysToNextMilestone={daysToNextMilestone}
        />
        <TaskSection tasks={tasks} />
        <ShopSection
          productUrl={productUrl}
          setProductUrl={setProductUrl}
          generating={generating}
          genError={genError}
          handlePaste={handlePaste}
          handleGenerate={handleGenerate}
          setShowGuide={setShowGuide}
        />
      </div>
      
      <ProductInfoModal productInfo={productInfo} setProductInfo={setProductInfo} />
      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
      
      <BottomNav />
    </div>
  );
}