import React, { useEffect, useMemo, useRef, useState } from "react";
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

export default function StreakCelebration({ taskReward = 0, onDone }) {
  const { lang } = useI18n();
  const en = lang === "en";

  const [phase, setPhase] = useState("loading"); // loading | ready | busy | claimed
  const [info, setInfo] = useState(null);
  const [rewards, setRewards] = useState(null); // 7 mức xu, lấy từ bảng checkin_rewards
  const [result, setResult] = useState(null);
  const [shown, setShown] = useState(0);
  const [msg, setMsg] = useState("");
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (onDone) onDone();
  };

  // Đã điểm danh hôm nay (hoặc lỗi) -> không hiện, trả quyền cho trang
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
          finish();
          return;
        }
        setRewards(rw.data.map((r) => r.coins));
        setInfo(i);
        setPhase("ready");
      } catch {
        if (alive) finish();
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Số xu chạy từ 0 lên mức thưởng
  useEffect(() => {
    if (phase !== "claimed" || !result) return;
    let raf;
    const t0 = performance.now();
    const D = 1100;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / D);
      setShown(Math.round(result.reward * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, result]);

  // Xu bay lên
  const coins = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: 8 + Math.random() * 84,
        delay: Math.random() * 0.5,
        dur: 1.3 + Math.random() * 0.9,
        size: 26 + Math.random() * 20,
        dx: Math.round((Math.random() - 0.5) * 120),
      })),
    []
  );

  if (phase === "loading" || !info || !rewards) return null;

  const aliveStreak = info.last_date === vnDate(-1) ? info.streak || 0 : 0;
  const prev = aliveStreak >= 7 ? 0 : aliveStreak; // đủ 7 ngày -> chuỗi mới
  const dayNow = prev + 1; // ngày đang nhận (1..7)
  const nextReward = rewards[prev];
  const claimed = phase === "claimed";
  const streakShown = claimed && result ? result.streak : dayNow;

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
        setMsg(
          data?.message || (en ? "Could not check in" : "Chưa điểm danh được")
        );
        setPhase("ready");
      }
    } catch {
      setMsg(en ? "Error, please try again" : "Có lỗi, thử lại nhé");
      setPhase("ready");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center overflow-hidden px-5 text-white"
      style={{
        background:
          "linear-gradient(180deg,#ffb23f 0%,#e5505f 34%,#8a4bb0 58%,#5350c8 80%)",
        paddingTop: "max(env(safe-area-inset-top),24px)",
        paddingBottom: "max(env(safe-area-inset-bottom),20px)",
      }}
    >
      <style>{`
        @keyframes skFlame{0%,100%{transform:scale(1) rotate(-2deg)}50%{transform:scale(1.07) rotate(2deg)}}
        @keyframes skPop{0%{transform:scale(.4);opacity:0}70%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
        @keyframes skRise{0%{transform:translate(0,0) scale(.5) rotate(0);opacity:0}15%{opacity:1}100%{transform:translate(var(--dx),-62vh) scale(1.1) rotate(300deg);opacity:0}}
        @keyframes skNum{0%{transform:scale(.8)}60%{transform:scale(1.18)}100%{transform:scale(1)}}
      `}</style>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[6%] h-[420px] w-[420px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle,rgba(255,244,170,.95) 0%,rgba(255,220,120,.5) 35%,rgba(255,200,100,0) 70%)",
        }}
      />

      <div className="relative mt-[6vh] flex flex-1 flex-col items-center">
        <Icon3D
          file="fire_3d.png"
          fallback="🔥"
          className="h-[170px] w-[170px] object-contain text-[120px] leading-none drop-shadow-[0_14px_26px_rgba(255,110,0,.5)]"
          style={{ animation: "skFlame 1.6s ease-in-out infinite" }}
        />
        <div
          key={streakShown}
          className="mt-4 text-[88px] font-extrabold leading-none"
          style={{ animation: "skNum .5s ease-out" }}
        >
          {streakShown}
        </div>
        <div className="mt-1 text-lg font-bold">
          {en ? "Day Streak" : "Ngày liên tiếp"}
        </div>

        {/* 7 ngày thưởng (xu lấy từ bảng checkin_rewards) */}
        <div className="mt-8 grid w-full max-w-md grid-cols-7 gap-1.5">
          {rewards.map((r, i) => {
            const n = i + 1;
            const done = n < dayNow || (claimed && n === dayNow);
            const today = n === dayNow && !claimed;
            return (
              <div key={i} className="flex flex-col items-center">
                <span className="text-[11px] font-bold opacity-70">
                  {en ? `D${n}` : `N${n}`}
                </span>
                <div
                  className={`mt-1.5 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                    done
                      ? "bg-yellow-300 text-slate-900"
                      : today
                      ? "border-2 border-yellow-300 text-yellow-200"
                      : "bg-white/15 text-white/60"
                  }`}
                  style={
                    n === dayNow && claimed
                      ? { animation: "skPop .5s ease-out" }
                      : undefined
                  }
                >
                  {done ? "✓" : ""}
                </div>
                <span className="mt-1 text-[10px] font-semibold opacity-80">
                  {r}
                </span>
              </div>
            );
          })}
        </div>

        {/* 2 ô thông tin */}
        <div className="mt-8 grid w-full max-w-md grid-cols-2 gap-3">
          <div className="rounded-3xl bg-white/15 px-3 py-4 text-center backdrop-blur">
            <div className="text-sm opacity-90">
              {en ? "Earned just now" : "Vừa kiếm được"}
            </div>
            <div className="mt-1 flex items-center justify-center gap-1.5 text-2xl font-bold">
              <Icon3D file="coin_3d.png" fallback="🪙" className="h-8 w-8 object-contain" />
              +{taskReward}
            </div>
          </div>
          <div className="rounded-3xl bg-white/15 px-3 py-4 text-center backdrop-blur">
            <div className="text-sm opacity-90">
              {en ? "Check-in reward" : "Thưởng điểm danh"}
            </div>
            <div className="mt-1 flex items-center justify-center gap-1.5 text-2xl font-bold">
              <Icon3D file="coin_3d.png" fallback="🪙" className="h-8 w-8 object-contain" />
              +{claimed ? shown : nextReward}
            </div>
          </div>
        </div>

        {msg && <p className="mt-3 text-center text-sm font-semibold">{msg}</p>}
      </div>

      {/* Xu 3D bay lên khi nhận */}
      {claimed && (
        <div className="pointer-events-none absolute inset-x-0 bottom-[150px] h-0">
          {coins.map((c) => (
            <span
              key={c.id}
              className="absolute"
              style={{
                left: `${c.left}%`,
                width: c.size,
                height: c.size,
                "--dx": `${c.dx}px`,
                animation: `skRise ${c.dur}s ease-out ${c.delay}s both`,
              }}
            >
              <Icon3D
                file="coin_3d.png"
                fallback="🪙"
                className="h-full w-full object-contain"
                style={{ fontSize: c.size }}
              />
            </span>
          ))}
        </div>
      )}

      <div className="relative w-full max-w-md space-y-3">
        {!claimed ? (
          <>
            <button
              type="button"
              onClick={claim}
              disabled={phase === "busy"}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-white text-base font-bold text-slate-900 transition active:scale-[0.98] disabled:opacity-70"
            >
              {phase === "busy" && <Loader2 size={18} className="animate-spin" />}
              {en ? `Claim +${nextReward} coins` : `Nhận +${nextReward} xu`}
            </button>
            <button
              type="button"
              onClick={finish}
              className="h-14 w-full rounded-full border-2 border-white/80 text-base font-bold text-white transition active:scale-[0.98]"
            >
              {en ? "Later" : "Để sau"}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={finish}
            className="h-14 w-full rounded-full bg-white text-base font-bold text-slate-900 transition active:scale-[0.98]"
          >
            {en ? "Awesome!" : "Tuyệt vời!"}
          </button>
        )}
      </div>
    </div>
  );
}
