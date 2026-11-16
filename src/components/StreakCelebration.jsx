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
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-100px) scale(1.2); opacity: 0; }
        }
      `}</style>

      <div className="relative w-full max-w-[340px] rounded-[28px] bg-white overflow-hidden shadow-2xl">
        
        {/* NỬA TRÊN: Nền cam nhạt + Lửa */}
        <div className={`relative flex justify-center pt-8 pb-14 transition-colors duration-500 ${phase === 'claimed' ? 'bg-[#FFE4D6]' : 'bg-[#FFF3EA]'}`}>
          
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-[#FFD2B7]">
            
            <Icon3D 
              file="fire_3d.png" 
              fallback="🔥" 
              className="relative z-10 h-[90px] w-[90px] object-contain drop-shadow-md"
            />
            
            {/* Số ngày nằm trong lửa */}
            <span className="absolute bottom-[18px] z-20 text-[32px] font-extrabold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
              {streak}
            </span>

            {/* Hiệu ứng bay lên của đồng xu (chỉ khi claim thành công) */}
            {phase === "claimed" && (
              <>
                <img src={getImageUrl("coin_3d.png")} alt="" className="absolute top-0 -left-6 h-8 w-8 object-contain" style={{ animation: "floatUp 1.5s ease-out 0.1s both" }} onError={(e) => e.target.style.display='none'} />
                <img src={getImageUrl("coin_3d.png")} alt="" className="absolute top-2 -right-4 h-6 w-6 object-contain" style={{ animation: "floatUp 1.8s ease-out 0.3s both" }} onError={(e) => e.target.style.display='none'} />
                <img src={getImageUrl("coin_3d.png")} alt="" className="absolute -top-4 right-8 h-10 w-10 object-contain" style={{ animation: "floatUp 2s ease-out 0.5s both" }} onError={(e) => e.target.style.display='none'} />
                {/* Chồng xu 3D bên phải (nếu có ảnh) */}
                <div className="absolute -right-12 bottom-0 h-16 w-16 bg-no-repeat bg-contain" style={{ backgroundImage: `url(${getImageUrl("coin_stack_3d.png")})` }}></div>
              </>
            )}
          </div>
        </div>

        {/* NỬA DƯỚI: Nội dung và Nút */}
        <div className="px-6 pb-8 pt-4 text-center">
          <h2 className="text-xl font-extrabold text-gray-900">
            {phase === "claimed" 
              ? (en ? "Check-in Successful!" : "Điểm danh thành công!") 
              : (en ? "Daily Check-in" : "Điểm danh hằng ngày")}
          </h2>

          <p className="mt-2 text-[15px] text-gray-600">
            {phase === "claimed" 
              ? (en ? `You received +${reward} coins!` : `Bạn nhận được +${reward} xu! 🪙`) 
              : (en ? `Current streak: ${streak} days` : `Chuỗi hiện tại: ${streak} ngày`)}
          </p>

          {msg && <p className="mt-2 text-sm font-semibold text-red-500">{msg}</p>}

          <div className="mt-6 flex flex-col gap-3">
            {phase === "ready" && (
              <>
                <button
                  onClick={claim}
                  className="flex h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#3B82F6] font-bold text-white transition active:scale-95 hover:bg-blue-600"
                >
                  {en ? "Claim now" : "Nhận ngay"}
                </button>
                <button
                  onClick={onDone}
                  className="h-[48px] w-full rounded-xl bg-[#F3F4F6] font-bold text-gray-700 transition active:scale-95 hover:bg-gray-200"
                >
                  {en ? "Later" : "Để sau"}
                </button>
              </>
            )}

            {phase === "busy" && (
              <button disabled className="flex h-[48px] w-full items-center justify-center rounded-xl bg-blue-400 font-bold text-white">
                <Loader2 size={20} className="animate-spin" />
              </button>
            )}

            {phase === "claimed" && (
              <button
                onClick={onDone}
                className="h-[48px] w-full rounded-xl bg-[#3B82F6] font-bold text-white transition active:scale-95 hover:bg-blue-600"
              >
                {en ? "Awesome!" : "Tuyệt vời!"}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
    }
