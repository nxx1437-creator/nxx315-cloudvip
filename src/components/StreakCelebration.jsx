import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";
import { getImageUrl } from "../lib/storeData.js";
import { useI18n } from "../i18n/index.js";

const vnDate = (offsetDays = 0) =>
  new Date(Date.now() + offsetDays * 86400000).toLocaleDateString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  });

// Ảnh 3D lấy từ bucket game_logos; lỗi thì dùng emoji
function Icon3D({ file, fallback, className = "", style }) {
  const [bad, setBad] = useState(false);
  if (bad)
    return (
      <span className={className} style={style}>
        {fallback}
      </span>
    );
  return (
    <img
      src={getImageUrl(file)}
      alt=""
      draggable={false}
      onError={() => setBad(true)}
      className={className}
      style={style}
    />
  );
}

// Các thứ trong tuần (M, T, W, T, F, S, S)
const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export default function StreakCelebration({ taskReward = 0, onDone }) {
  const { lang } = useI18n();
  const en = lang === "en";

  const [phase, setPhase] = useState("loading"); // loading | ready | busy | claimed
  const [info, setInfo] = useState(null);
  const [rewards, setRewards] = useState(null);
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("no user");

        const [ci, rw] = await Promise.all([
          supabase
            .from("coin_checkins")
            .select("streak, last_date")
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase.from("checkin_rewards").select("day, coins").order("day"),
        ]);
        if (!alive) return;
        if (rw.error || !rw.data || rw.data.length !== 7) throw new Error("rewards");

        const i = ci.data || { streak: 0, last_date: null };
        if (i.last_date === vnDate(0)) {
          if (onDone) onDone();
          return;
        }
        setRewards(rw.data.map((r) => r.coins));
        setInfo(i);
        setPhase("ready");
      } catch {
        if (alive && onDone) onDone();
      }
    })();
    return () => {
      alive = false;
    };
  }, [onDone]);

  if (phase === "loading" || !info || !rewards) return null;

  const aliveStreak = info.last_date === vnDate(-1) ? info.streak || 0 : 0;
  const prev = aliveStreak >= 7 ? 0 : aliveStreak;
  const dayNow = prev + 1; // Ngày hiện tại (1 -> 7)
  const nextReward = rewards[prev];
  const claimed = phase === "claimed";

  const claim = async () => {
    if (phase !== "ready") return;
    setPhase("busy");
    setMsg("");
    try {
      const { data, error } = await supabase.rpc("claim_daily_checkin");
      if (error) throw error;
      if (data?.success) {
        setResult({ reward: data.reward, streak: data.streak });
        setPhase("claimed");
      } else {
        setMsg(data?.message || (en ? "Could not check in" : "Chưa điểm danh được"));
        setPhase("ready");
      }
    } catch {
      setMsg(en ? "Error, please try again" : "Có lỗi, thử lại nhé");
      setPhase("ready");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center overflow-y-auto px-5 text-white font-sans"
      style={{
        background: "linear-gradient(180deg, #ffb23f 0%, #e5505f 35%, #6a3b93 70%, #4a44b5 100%)",
      }}
    >
      {/* HIỆU ỨNG LỬA CHÁY 3D */}
      <style>{`
        @keyframes flameFloat {
          0%, 100% { transform: translateY(0) scale(1); filter: drop-shadow(0 15px 25px rgba(255,100,0,0.5)); }
          50% { transform: translateY(-10px) scale(1.05); filter: drop-shadow(0 25px 35px rgba(255,50,0,0.7)); }
        }
      `}</style>
      
      <div className="relative mt-16 flex flex-col items-center w-full">
        {/* Ngọn lửa 3D */}
        <div style={{ animation: "flameFloat 2.5s ease-in-out infinite" }}>
          <Icon3D
            file="fire_3d.png"
            fallback="🔥"
            className="h-48 w-48 object-contain text-[140px] leading-none"
          />
        </div>

        {/* Số ngày Streak */}
        <div className="mt-4 text-[90px] font-bold leading-none drop-shadow-md">
          {claimed && result ? result.streak : dayNow}
        </div>
        <div className="mt-2 text-xl font-semibold">
          {en ? "Day Streak" : "Ngày liên tiếp"}
        </div>

        {/* 7 Ngày trong tuần (M T W T F S S) */}
        <div className="mt-10 flex w-full max-w-sm justify-between px-2">
          {WEEK_DAYS.map((day, i) => {
            const n = i + 1;
            const isDone = n < dayNow || (claimed && n === dayNow);
            const isToday = n === dayNow && !claimed;

            return (
              <div key={i} className="flex flex-col items-center gap-3">
                <span className="text-sm font-semibold opacity-90">{day}</span>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all
                    ${isDone ? "bg-[#FFD447] text-[#8B4513]" : ""}
                    ${isToday ? "border-2 border-[#FFD447] bg-[#FFD447]/20" : ""}
                    ${!isDone && !isToday ? "bg-white/20" : ""}
                  `}
                >
                  {isDone ? "✓" : isToday ? "" : "."}
                </div>
              </div>
            );
          })}
        </div>

        {/* 2 ô thông tin: Steps today & Earned */}
        <div className="mt-12 grid w-full max-w-sm grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white/10 px-4 py-5 text-center backdrop-blur-md border border-white/10">
            <div className="text-[15px] opacity-90">
              {en ? "Steps today" : "Bước chân hôm nay"}
            </div>
            <div className="mt-2 text-2xl font-bold">2,087</div> {/* Bạn có thể thay bằng biến đếm bước thực tế nếu có */}
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-5 text-center backdrop-blur-md border border-white/10">
            <div className="text-[15px] opacity-90">
              {en ? "Earned" : "Đã kiếm được"}
            </div>
            <div className="mt-2 flex items-center justify-center gap-1 text-2xl font-bold">
              <span className="text-xl">🪙</span> {claimed && result ? result.reward : 0}
            </div>
          </div>
        </div>

        {/* Các nút bấm */}
        <div className="mt-12 mb-8 w-full max-w-sm space-y-4">
          {!claimed ? (
            <>
              <button
                type="button"
                onClick={claim}
                disabled={phase === "busy"}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-white text-[17px] font-bold text-black transition active:scale-[0.98] disabled:opacity-70"
              >
                {phase === "busy" && <Loader2 size={20} className="animate-spin text-black" />}
                {en ? `Claim +${nextReward} coins` : `Nhận +${nextReward} xu`}
              </button>
              <button
                type="button"
                onClick={onDone}
                className="h-14 w-full rounded-full border border-white/80 text-[17px] font-bold text-white transition active:scale-[0.98] bg-transparent"
              >
                {en ? "Got it" : "Để sau"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onDone}
              className="h-14 w-full rounded-full bg-white text-[17px] font-bold text-black transition active:scale-[0.98]"
            >
              {en ? "Got it" : "Tuyệt vời!"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
                 }
