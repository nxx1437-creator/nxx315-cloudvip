import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";
import { useI18n } from "../i18n/index.js";

const vnDate = (offsetDays = 0) =>
  new Date(Date.now() + offsetDays * 86400000).toLocaleDateString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  });

export default function StreakCelebration({ onDone }) {
  const { lang } = useI18n();
  const en = lang === "en";

  const [phase, setPhase] = useState("loading");
  const [reward, setReward] = useState(0);
  const [streak, setStreak] = useState(0);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("no user");

        const { data: ci } = await supabase
          .from("coin_checkins")
          .select("streak, last_date")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!alive) return;
        
        // Nếu hôm nay đã điểm danh rồi thì tự động đóng luôn
        if (ci?.last_date === vnDate(0)) {
          if (onDone) onDone();
          return;
        }

        setStreak((ci?.streak || 0) + 1);
        setPhase("ready");
      } catch {
        if (alive && onDone) onDone();
      }
    })();
    return () => { alive = false; };
  }, [onDone]);

  if (phase === "loading") return null;

  const claim = async () => {
    if (phase !== "ready") return;
    setPhase("busy");
    setMsg("");
    try {
      const { data, error } = await supabase.rpc("claim_daily_checkin");
      if (error) throw error;
      
      if (data?.success) {
        setReward(data.reward);
        setStreak(data.streak);
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
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
        
        {/* Icon lửa đơn giản */}
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-4xl">
          🔥
        </div>

        <h2 className="text-xl font-bold text-gray-900">
          {phase === "claimed" 
            ? (en ? "Check-in Successful!" : "Điểm danh thành công!") 
            : (en ? "Daily Check-in" : "Điểm danh hằng ngày")}
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          {phase === "claimed" 
            ? (en ? `You earned ${reward} coins!` : `Bạn nhận được ${reward} xu!`) 
            : (en ? `Current streak: ${streak} days` : `Chuỗi hiện tại: ${streak} ngày`)}
        </p>

        {msg && <p className="mt-3 text-sm font-semibold text-red-500">{msg}</p>}

        <div className="mt-6 flex flex-col gap-3">
          {phase === "ready" && (
            <>
              <button
                onClick={claim}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 font-semibold text-white transition active:scale-95"
              >
                {en ? "Claim now" : "Nhận ngay"}
              </button>
              <button
                onClick={onDone}
                className="h-12 w-full rounded-xl bg-gray-100 font-semibold text-gray-700 transition active:scale-95"
              >
                {en ? "Later" : "Để sau"}
              </button>
            </>
          )}

          {phase === "busy" && (
            <button disabled className="flex h-12 w-full items-center justify-center rounded-xl bg-blue-400 font-semibold text-white">
              <Loader2 size={20} className="animate-spin" />
            </button>
          )}

          {phase === "claimed" && (
            <button
              onClick={onDone}
              className="h-12 w-full rounded-xl bg-blue-600 font-semibold text-white transition active:scale-95"
            >
              {en ? "Awesome!" : "Tuyệt vời!"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
