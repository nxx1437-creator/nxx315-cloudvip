import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";
import { getImageUrl } from "../lib/storeData.js";
import { useI18n } from "../i18n/index.js";

const vnDate = (offsetDays = 0) =>
  new Date(Date.now() + offsetDays * 86400000).toLocaleDateString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  });

function Icon3D({ file, fallback, className = "", style }) {
  const [bad, setBad] = useState(false);
  if (bad) return <span className={className} style={style}>{fallback}</span>;
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
    // Thêm font-sans để nó dùng font chữ hiện đại của Tailwind (Inter/San Francisco)
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 px-5 backdrop-blur-sm font-sans">
      
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-80px) scale(1.1); opacity: 0; }
        }
        @keyframes popIn {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div 
        className="relative w-full max-w-[320px] rounded-[32px] bg-white overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
        style={{ animation: "popIn 0.3s ease-out" }}
      >
        
        {/* PHẦN TRÊN: Nền cam + Lửa */}
        <div className={`relative flex justify-center pt-8 pb-10 transition-colors duration-500 ${phase === 'claimed' ? 'bg-[#FFEBE1]' : 'bg-[#FFF4EE]'}`}>
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-[#FFD8C2]">
            <Icon3D 
              file="fire_3d.png" 
              fallback="🔥" 
              className="relative z-10 h-[95px] w-[95px] object-contain drop-shadow-lg"
            />
            <span 
              className="absolute bottom-[12px] z-20 text-[36px] font-extrabold text-white"
              style={{ textShadow: "0px 2px 4px rgba(0,0,0,0.4)" }}
            >
              {streak}
            </span>

            {phase === "claimed" && (
              <>
                <img src={getImageUrl("coin_3d.png")} alt="" className="absolute top-0 -left-4 h-8 w-8 object-contain drop-shadow-md" style={{ animation: "floatUp 1.5s ease-out 0.1s both" }} onError={(e) => e.target.style.display='none'} />
                <img src={getImageUrl("coin_3d.png")} alt="" className="absolute top-4 -right-2 h-7 w-7 object-contain drop-shadow-md" style={{ animation: "floatUp 1.8s ease-out 0.3s both" }} onError={(e) => e.target.style.display='none'} />
                <img src={getImageUrl("coin_3d.png")} alt="" className="absolute -top-3 right-6 h-10 w-10 object-contain drop-shadow-md" style={{ animation: "floatUp 2s ease-out 0.5s both" }} onError={(e) => e.target.style.display='none'} />
              </>
            )}
          </div>
        </div>

        {/* PHẦN DƯỚI: Nội dung và Nút */}
        <div className="px-6 pb-7 pt-5 text-center">
          {/* Đổi font-extrabold thành font-bold và tracking-tight để nhìn mềm mại hơn */}
          <h2 className="text-[22px] font-bold tracking-tight text-gray-900 leading-tight">
            {phase === "claimed" 
              ? (en ? "Check-in Successful!" : "Điểm danh thành công!") 
              : (en ? "Daily Check-in" : "Điểm danh hằng ngày")}
          </h2>

          <p className="mt-2 text-[15px] text-gray-500 font-normal">
            {phase === "claimed" 
              ? (en ? `You received +${reward} coins!` : `Bạn nhận được +${reward} xu! 🪙`) 
              : (en ? `Current streak: ${streak} days` : `Chuỗi hiện tại: ${streak} ngày`)}
          </p>

          {msg && <p className="mt-2 text-sm font-semibold text-red-500">{msg}</p>}

          <div className="mt-7 flex flex-col gap-3">
            {phase === "ready" && (
              <>
                {/* Nút chính: Bo tròn hoàn toàn (rounded-full), chữ font-medium, bóng đổ mềm */}
                <button
                  onClick={claim}
                  className="flex h-[50px] w-full items-center justify-center gap-2 rounded-full bg-[#3B82F6] text-[15px] font-medium text-white transition-all active:scale-95 shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:bg-blue-600"
                >
                  {en ? "Claim now" : "Nhận ngay"}
                </button>
                {/* Nút phụ: Bo tròn, màu xám nhạt */}
                <button
                  onClick={onDone}
                  className="h-[50px] w-full rounded-full bg-[#F3F4F6] text-[15px] font-medium text-gray-600 transition-all active:scale-95 hover:bg-gray-200"
                >
                  {en ? "Later" : "Để sau"}
                </button>
              </>
            )}

            {phase === "busy" && (
              <button disabled className="flex h-[50px] w-full items-center justify-center rounded-full bg-blue-400 font-medium text-white">
                <Loader2 size={22} className="animate-spin" />
              </button>
            )}

            {phase === "claimed" && (
              <button
                onClick={onDone}
                className="h-[50px] w-full rounded-full bg-[#3B82F6] text-[15px] font-medium text-white transition-all active:scale-95 shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:bg-blue-600"
              >
                {en ? "Awesome!" : "Tuyệt vời!"}
              </button>
        </div>
      </div>
    </div>
  );
                }
