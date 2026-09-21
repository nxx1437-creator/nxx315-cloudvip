import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Gift,
  Trophy,
  Share2,
  Coins,
  Ticket,
  Package,
  Star,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  X,
  Clock3,
} from "lucide-react";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { supabase } from "../lib/supabaseClient.js";

const SUPABASE_URL = "https://rwglwovohbyqmbbzdvdj.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Sự kiện: 21/9/2026 → 26/9/2026
const EVENT_START = new Date("2026-09-21T00:00:00+07:00");
const EVENT_END = new Date("2026-09-26T23:59:59+07:00");

function formatMoney(v) {
  return new Intl.NumberFormat("vi-VN").format(Number(v || 0));
}

function getCountdown(target) {
  const now = Date.now();
  const start = EVENT_START.getTime();
  const diff = target.getTime() - now;

  if (now < start) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: false, notStarted: true };
  }
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true, notStarted: false };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    ended: false,
    notStarted: false,
  };
}
export default function MidAutumn() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [countdown, setCountdown] = useState(getCountdown(EVENT_END));

  const [activeGame, setActiveGame] = useState(null);
  const [pickingLantern, setPickingLantern] = useState(false);
  const [lanternResult, setLanternResult] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUser(user);

      const [profRes, statusRes, lbRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("coins, username, avatar_url")
          .eq("id", user.id)
          .single(),
        supabase.rpc("get_mid_autumn_status", { p_user_id: user.id }),
        supabase.rpc("get_star_leaderboard", { p_limit: 10 }),
      ]);

      if (profRes.data) setProfile(profRes.data);
      if (statusRes.data) setStatus(statusRes.data);
      if (lbRes.data) setLeaderboard(lbRes.data);
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdown(EVENT_END));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const playLantern = async (lanternIndex) => {
    if (pickingLantern || status?.played_today) return;

    setPickingLantern(true);
    setLanternResult(null);

    try {
      const { data, error } = await supabase.rpc("play_lantern", {
        p_user_id: user.id,
      });

      if (error) throw error;
      if (data?.error) {
        setLanternResult({ error: data.error });
        setPickingLantern(false);
        return;
      }

      setTimeout(() => {
        setLanternResult({
          success: true,
          picked_lantern: data.picked_lantern,
          clicked_lantern: lanternIndex,
          reward_type: data.reward_type,
          reward_value: data.reward_value,
          reward_label: data.reward_label,
        });
        setPickingLantern(false);
        loadData();
      }, 800);
    } catch (err) {
      console.error("Play lantern error:", err);
      setLanternResult({ error: "Có lỗi xảy ra. Thử lại sau." });
      setPickingLantern(false);
    }
  };

  const submitStarScore = async (score, starsClicked) => {
    try {
      const { data, error } = await supabase.rpc("submit_star_score", {
        p_user_id: user.id,
        p_score: score,
        p_stars_clicked: starsClicked,
      });

      if (error) throw error;
      if (data?.success) {
        loadData();
      }
      return data;
    } catch (err) {
      console.error("Submit star error:", err);
      return null;
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/mid-autumn`;
    const text = "🌕 Mình vừa tham gia sự kiện Trung Thu NXX315! Đập hộp nhận quà cực hot!";

    if (navigator.share) {
      navigator.share({ title: "Trung Thu NXX315", text, url });
    } else {
      navigator.clipboard?.writeText(`${text}\n${url}`);
      alert("Đã copy link! Dán vào Zalo/Facebook để chia sẻ nhé.");
    }
  };
       if (loading) {
    return (
      <div className="min-h-screen bg-white pb-24">
        <TopHeader />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white pb-24">
        <TopHeader />
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <AlertCircle size={40} className="mx-auto text-amber-500" strokeWidth={2} />
          <h2 className="mt-4 text-lg font-bold">Vui lòng đăng nhập</h2>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 rounded-lg bg-red-600 px-6 py-3 font-bold text-white"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-mid-autumn theme-mid-autumn-bg min-h-screen pb-24 text-slate-900">
      <TopHeader />

      {/* HEADER ĐỎ */}
      <div className="header-mid relative overflow-hidden px-4 py-5">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-yellow-300/20 moon-glow" />
        <div className="pointer-events-none absolute -left-4 top-8 text-4xl opacity-30 lantern-glow">
          🏮
        </div>

        <div className="relative mx-auto flex max-w-2xl items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-yellow-100 backdrop-blur-sm"
          >
            <ArrowLeft size={20} strokeWidth={2.4} />
          </button>
          <div className="flex-1">
            <h1 className="flex items-center gap-2 text-[17px] font-black tracking-tight text-yellow-100">
              🌕 TRUNG THU NXX315
            </h1>
            <p className="mt-0.5 text-[11.5px] font-medium text-yellow-200/90">
              Đập hộp - Đếm sao - Đón trăng
            </p>
          </div>
          <button
            onClick={handleShare}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-yellow-100 backdrop-blur-sm"
          >
            <Share2 size={18} strokeWidth={2.4} />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4">
        {/* COUNTDOWN */}
        <div className="mt-4 rounded-2xl border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 p-4 shadow-lg">
          <div className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider text-red-600">
            <Clock3 size={13} strokeWidth={2.6} />
            Sự kiện kết thúc sau
          </div>

          {countdown.ended ? (
            <div className="mt-3 text-center text-[18px] font-black text-red-600">
              🎉 Sự kiện đã kết thúc!
            </div>
          ) : countdown.notStarted ? (
            <div className="mt-3 text-center">
              <p className="text-[16px] font-black text-red-600">
                🎁 Sự kiện sắp bắt đầu!
              </p>
              <p className="mt-1 text-[12px] text-red-500">
                Quay lại vào 21/9/2026 nhé
              </p>
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {[
                { label: "Ngày", value: countdown.days },
                { label: "Giờ", value: countdown.hours },
                { label: "Phút", value: countdown.minutes },
                { label: "Giây", value: countdown.seconds },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl bg-gradient-to-br from-red-500 to-red-700 p-2 text-center shadow-md countdown-pulse"
                >
                  <div className="text-[22px] font-black leading-none text-yellow-100">
                    {String(item.value).padStart(2, "0")}
                  </div>
                  <div className="mt-1 text-[9.5px] font-bold uppercase tracking-wider text-yellow-200">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2 MENU GAME */}
        <div className="mt-4 space-y-3">
          {/* Đoán đèn lồng */}
          <button
            onClick={() => setActiveGame("lantern")}
            className="card-mid group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl p-4 text-left transition active:scale-[0.98]"
          >
            <div className="pointer-events-none absolute -right-6 -top-6 text-7xl opacity-20">
              🏮
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg">
              <Gift size={24} className="text-yellow-100" strokeWidth={2.4} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-black text-red-700">
                Đoán đèn lồng
              </p>
              <p className="mt-0.5 text-[11.5px] text-red-600/80">
                {status?.played_today
                  ? "Hôm nay đã chơi rồi, mai quay lại nhé!"
                  : "Chọn 1 trong 3 đèn, nhận quà liền tay!"}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-[9.5px] font-bold text-red-700">
                  🎁 Xu / Voucher / Quà
                </span>
                {status?.played_today && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9.5px] font-bold text-emerald-700">
                    ✓ Đã chơi
                  </span>
                )}
              </div>
            </div>

            <ChevronRight size={20} className="shrink-0 text-red-500" />
          </button>

          {/* Đếm sao */}
          <button
            onClick={() => setActiveGame("star")}
            className="card-mid group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl p-4 text-left transition active:scale-[0.98]"
          >
            <div className="pointer-events-none absolute -right-6 -top-6 text-7xl opacity-20">
              ⭐
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
              <Star size={24} className="text-red-700" strokeWidth={2.4} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-black text-red-700">
                Đếm sao
              </p>
              <p className="mt-0.5 text-[11.5px] text-red-600/80">
                Bấm sao rơi trong 30 giây, đua top nhận quà!
              </p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-[9.5px] font-bold text-red-700">
                  🏆 Top 10 nhận quà
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[9.5px] font-bold text-orange-700">
                  ⚡ Chơi không giới hạn
                </span>
              </div>
            </div>

            <ChevronRight size={20} className="shrink-0 text-red-500" />
          </button>
        </div>

        {/* BẢNG XẾP HẠNG */}
        <div className="card-mid mt-4 rounded-2xl p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[14px] font-black text-red-700">
              <Trophy size={16} className="text-yellow-500" strokeWidth={2.6} />
              Bảng xếp hạng
            </h3>
            <span className="text-[10.5px] font-bold text-red-500">
              Top 10 cao nhất
            </span>
          </div>

          {leaderboard.length === 0 ? (
            <div className="py-8 text-center text-[12px] text-red-500/70">
              Chưa có ai chơi. Bạn là người đầu tiên nhé!
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.slice(0, 10).map((item, idx) => {
                const medal = ["🥇", "🥈", "🥉"][idx] || `${idx + 1}.`;
                const isMe = item.user_id === user.id;
                return (
                  <div
                    key={item.user_id}
                    className={`flex items-center gap-3 rounded-xl p-2.5 transition ${
                      isMe
                        ? "bg-gradient-to-r from-yellow-100 to-orange-100 ring-2 ring-yellow-400"
                        : "bg-white/60"
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center text-[16px] font-black">
                      {idx < 3 ? medal : (
                        <span className="text-red-500">{medal}</span>
                      )}
                    </div>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-red-400 to-orange-400">
                      {item.avatar_url ? (
                        <img
                          src={item.avatar_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[12px] font-black text-white">
                          {(item.username || "U").slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-black text-red-700">
                        {item.username || "Ẩn danh"}
                        {isMe && (
                          <span className="ml-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[8.5px] font-bold text-white">
                            BẠN
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-[10px] text-red-500/70">
                        {item.best_stars} sao
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[16px] font-black text-red-600">
                        {formatMoney(item.best_score)}
                      </p>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-red-400">
                        điểm
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="mt-3 text-center text-[10px] text-red-500/70">
            🏆 Top 10 sẽ nhận quà đặc biệt khi sự kiện kết thúc
          </p>
        </div>

        {/* QUÀ CÓ THỂ NHẬN */}
        <div className="card-mid mt-4 mb-6 rounded-2xl p-4">
          <h3 className="mb-3 flex items-center gap-2 text-[14px] font-black text-red-700">
            <Sparkles size={16} className="text-yellow-500" strokeWidth={2.6} />
            Quà có thể nhận
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Coins, label: "100 - 2000 xu", color: "#F59E0B" },
              { icon: Ticket, label: "Voucher 10-50%", color: "#DC143C" },
              { icon: Package, label: "Bánh trung thu", color: "#8B4513" },
              { icon: Gift, label: "Lồng đèn", color: "#FF8C00" },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-xl bg-white/70 p-2.5"
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <Icon size={16} style={{ color: item.color }} strokeWidth={2.4} />
                  </div>
                  <span className="text-[11px] font-bold text-red-700">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODAL: LANTERN GAME */}
      {activeGame === "lantern" && (
        <LanternGameModal
          status={status}
          pickingLantern={pickingLantern}
          lanternResult={lanternResult}
          onPick={playLantern}
          onClose={() => {
            setActiveGame(null);
            setLanternResult(null);
          }}
        />
      )}

      {/* MODAL: STAR GAME */}
      {activeGame === "star" && (
        <StarGameModal
          onClose={() => setActiveGame(null)}
          onSubmitScore={submitStarScore}
        />
      )}

      <BottomNav />
    </div>
  );
          }
      // =====================================================
// MINIGAME 1: ĐOÁN ĐÈN LỒNG
// =====================================================
function LanternGameModal({
  status,
  pickingLantern,
  lanternResult,
  onPick,
  onClose,
}) {
  const playedToday = status?.played_today;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center">
      <div className="theme-mid-autumn relative w-full max-w-lg overflow-hidden rounded-t-3xl bg-gradient-to-b from-red-50 to-yellow-50 p-6 sm:rounded-3xl">
        <div className="pointer-events-none absolute -top-4 -right-4 text-8xl opacity-10">
          🏮
        </div>

        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-red-600 shadow-md"
        >
          <X size={18} strokeWidth={2.4} />
        </button>

        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-red-500">
            Minigame Trung thu
          </p>
          <h2 className="mt-1 text-[22px] font-black text-red-700">
            🏮 Đoán đèn lồng 🏮
          </h2>
          <p className="mt-1 text-[12.5px] text-red-600/80">
            {playedToday
              ? "Hôm nay đã chơi. Quay lại vào ngày mai nhé!"
              : "Chọn 1 trong 3 đèn để nhận quà may mắn!"}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {[1, 2, 3].map((idx) => {
            const isPicked = lanternResult?.picked_lantern === idx;
            const isClicked = lanternResult?.clicked_lantern === idx;
            const isRevealed = lanternResult && isPicked;
            const isWrong = lanternResult && isClicked && !isPicked;

            return (
              <button
                key={idx}
                onClick={() => onPick(idx)}
                disabled={pickingLantern || playedToday || !!lanternResult}
                className={`relative aspect-[3/4] overflow-hidden rounded-2xl border-4 transition active:scale-95 disabled:cursor-not-allowed ${
                  isRevealed
                    ? "border-yellow-400 bg-gradient-to-b from-yellow-200 to-orange-200 shadow-[0_0_40px_rgba(255,215,0,0.6)]"
                    : isWrong
                    ? "border-slate-300 bg-slate-100 opacity-60"
                    : "border-red-400 bg-gradient-to-b from-red-400 to-red-600 hover:border-yellow-400 hover:shadow-[0_0_30px_rgba(255,215,0,0.4)]"
                }`}
              >
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-2">
                  {isRevealed ? (
                    <>
                      <div className="text-5xl">🎁</div>
                      <div className="text-[10px] font-black uppercase text-red-700">
                        {lanternResult.reward_label}
                      </div>
                    </>
                  ) : isWrong ? (
                    <>
                      <div className="text-5xl opacity-40">🏮</div>
                      <div className="text-[10px] font-bold text-slate-500">
                        Hụt rồi!
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-5xl lantern-glow">🏮</div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-yellow-100">
                        Đèn {idx}
                      </div>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {pickingLantern && (
          <div className="mt-4 flex items-center justify-center gap-2 text-[13px] font-bold text-red-600">
            <Loader2 size={16} className="animate-spin" />
            Đang mở đèn...
          </div>
        )}

        {lanternResult && !pickingLantern && (
          <div className="mt-5 rounded-2xl border-2 border-yellow-400 bg-white p-4 text-center shadow-lg">
            {lanternResult.error ? (
              <div className="flex items-center justify-center gap-2 text-[13px] font-bold text-red-600">
                <AlertCircle size={16} />
                {lanternResult.error}
              </div>
            ) : (
              <>
                <p className="text-[11px] font-bold uppercase tracking-widest text-red-500">
                  🎉 Chúc mừng bạn!
                </p>
                <p className="mt-2 text-[24px] font-black text-red-700">
                  {lanternResult.reward_label}
                </p>
                <p className="mt-1 text-[12px] text-red-600/80">
                  {lanternResult.reward_type === "coins" &&
                    "Đã cộng vào tài khoản của bạn"}
                  {lanternResult.reward_type === "voucher" &&
                    "Voucher sẽ được gửi trong 24h"}
                  {lanternResult.reward_type === "physical" &&
                    "Admin sẽ liên hệ để gửi quà"}
                </p>
              </>
            )}

            <button
              onClick={onClose}
              className="btn-mid-primary mt-4 w-full rounded-xl py-3 text-[14px] font-black"
            >
              Đóng
            </button>
          </div>
        )}

        {!playedToday && !lanternResult && (
          <p className="mt-4 text-center text-[11px] text-red-500/70">
            💡 Mỗi người được chơi 1 lần/ngày
          </p>
        )}
      </div>
    </div>
  );
            }
// =====================================================
// MINIGAME 2: ĐẾM SAO
// =====================================================
function StarGameModal({ onClose, onSubmitScore }) {
  const GAME_DURATION = 30;
  const SPAWN_INTERVAL = 500;

  const [playing, setPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [stars, setStars] = useState([]);
  const [score, setScore] = useState(0);
  const [clicked, setClicked] = useState(0);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState(null);

  // ✅ REF — luôn có giá trị mới nhất, không bị closure cũ
  const scoreRef = useRef(0);
  const clickedRef = useRef(0);
  const playingRef = useRef(false);

  // Timer countdown
  useEffect(() => {
    if (!playing) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [playing]);

  // Spawn stars
  useEffect(() => {
    if (!playing) return;

    const spawner = setInterval(() => {
      const id = Date.now() + Math.random();
      const newStar = {
        id,
        x: Math.random() * 85 + 5,
        y: -10,
        size: Math.random() * 20 + 40,
        speed: Math.random() * 1000 + 2500,
      };

      setStars((prev) => [...prev, newStar]);

      setTimeout(() => {
        setStars((prev) => prev.filter((s) => s.id !== id));
      }, newStar.speed);
    }, SPAWN_INTERVAL);

    return () => clearInterval(spawner);
  }, [playing]);

  const startGame = () => {
    setPlaying(true);
    setTimeLeft(GAME_DURATION);
    setStars([]);
    setScore(0);
    setClicked(0);
    setFinished(false);
    setResult(null);

    scoreRef.current = 0;
    clickedRef.current = 0;
    playingRef.current = true;
  };

  const endGame = async () => {
    playingRef.current = false;
    setPlaying(false);
    setFinished(true);

    const finalScore = scoreRef.current;
    const finalClicked = clickedRef.current;

    console.log('[StarGame] End — score:', finalScore, 'clicked:', finalClicked);

    const data = await onSubmitScore(finalScore, finalClicked);
    if (data?.success) {
      setResult(data);
    }
  };

  const handleStarClick = React.useCallback((star) => {
    if (!playingRef.current) return;

    setStars((prev) => prev.filter((s) => s.id !== star.id));

    const points = 100;
    setScore((prev) => prev + points);
    setClicked((prev) => prev + 1);

    scoreRef.current += points;
    clickedRef.current += 1;
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="theme-mid-autumn relative w-full max-w-lg overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-900">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-yellow-100 backdrop-blur-sm"
        >
          <X size={18} strokeWidth={2.4} />
        </button>

        <div className="relative z-10 border-b border-white/10 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-300/80">
                Minigame Trung thu
              </p>
              <h2 className="mt-0.5 flex items-center gap-1.5 text-[18px] font-black text-yellow-100">
                <Star size={18} className="text-yellow-400" fill="#FBBF24" />
                Đếm sao
              </h2>
            </div>

            {playing && (
              <div className="rounded-full bg-yellow-400/20 px-3 py-1 text-[14px] font-black text-yellow-300 ring-2 ring-yellow-400/50">
                {timeLeft}s
              </div>
            )}
          </div>
        </div>

        <div className="relative h-[400px] overflow-hidden bg-gradient-to-b from-indigo-950 to-purple-950">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white/30 star-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}

          <div className="absolute right-8 top-6 h-16 w-16 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-400 moon-glow" />

          {playing &&
            stars.map((star) => (
              <div
                key={star.id}
                onPointerDown={() => handleStarClick(star)}
                className="absolute cursor-pointer select-none"
                style={{
                  left: `${star.x}%`,
                  top: -60,
                  width: star.size,
                  height: star.size,
                  animationName: 'starFall',
                  animationDuration: `${star.speed}ms`,
                  animationTimingFunction: 'linear',
                  animationFillMode: 'forwards',
                  animationIterationCount: 1,
                  zIndex: 20,
                  pointerEvents: 'auto',
                  touchAction: 'manipulation',
                }}
              >
                <Star
                  size={star.size}
                  className="pointer-events-none text-yellow-400 drop-shadow-[0_0_12px_#FBBF24]"
                  fill="#FBBF24"
                />
              </div>
            ))}

          {!playing && !finished && (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <div className="text-6xl">⭐</div>
              <h3 className="mt-3 text-[18px] font-black text-yellow-100">
                Sẵn sàng chưa?
              </h3>
              <p className="mt-1 text-[12px] text-yellow-200/70">
                Bấm vào các ngôi sao rơi trong 30 giây
              </p>
              <p className="mt-1 text-[12px] text-yellow-200/70">
                Mỗi sao = <b className="text-yellow-300">100 điểm</b>
              </p>
              <button
                onClick={startGame}
                className="btn-mid-gold mt-5 rounded-2xl px-8 py-3 text-[15px]"
              >
                🚀 Bắt đầu chơi
              </button>
            </div>
          )}

                    {playing && (
            <div className="absolute left-4 top-4 z-30 space-y-1.5">
              <div className="rounded-full bg-black/40 px-3 py-1 backdrop-blur-sm">
                <span className="text-[11px] font-bold text-yellow-300">
                  ⭐ {clicked} sao
                </span>
              </div>
              <div className="rounded-full bg-black/40 px-3 py-1 backdrop-blur-sm">
                <span className="text-[11px] font-bold text-yellow-300">
                  🏆 {score} điểm
                </span>
              </div>
            </div>
          )}

          {finished && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 px-6 backdrop-blur-sm">
              <div className="text-6xl">🎉</div>
              <h3 className="mt-3 text-[20px] font-black text-yellow-100">
                Hoàn thành!
              </h3>
              <div className="mt-4 space-y-1.5 text-center">
                <p className="text-[14px] text-yellow-200">
                  Bạn bắt được{" "}
                  <b className="text-yellow-300">{clicked}</b> sao
                </p>
                <p className="text-[16px] font-black text-yellow-400">
                  {score} điểm
                </p>
                {result?.rank && (
                  <p className="text-[12px] text-yellow-200/80">
                    Xếp hạng #{result.rank}
                  </p>
                )}
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={startGame}
                  className="btn-mid-gold rounded-xl px-5 py-2.5 text-[13px]"
                >
                  🔄 Chơi lại
                </button>
                <button
                  onClick={onClose}
                  className="rounded-xl bg-white/20 px-5 py-2.5 text-[13px] font-black text-yellow-100 backdrop-blur-sm"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative z-10 border-t border-white/10 px-5 py-3 text-center">
          <p className="text-[11px] text-yellow-200/60">
            🏆 Top 10 điểm cao nhất sẽ nhận quà đặc biệt cuối sự kiện
          </p>
        </div>
      </div>
    </div>
  );
}

