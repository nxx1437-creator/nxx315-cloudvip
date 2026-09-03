import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Ticket, Coins, X, Sparkles, ChevronRight } from "lucide-react";

import useSession from "../../hooks/useSession.js";
import useProfile from "../../hooks/useProfile.js";
import { supabase } from "../../lib/supabaseClient.js";

const SEGMENTS = [0, 10, 20, 30, 50, 100, 200, 500];
const BIG_WIN_THRESHOLD = 100;

function ConfettiBurst() {
  const pieces = Array.from({ length: 24 });
  const colors = ["#F2A900", "#3478F6", "#EF4444", "#22C55E", "#FB923C"];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((_, i) => {
        const angle = (360 / pieces.length) * i;
        const distance = 90 + Math.random() * 60;
        const color = colors[i % colors.length];
        const x = Math.cos((angle * Math.PI) / 180) * distance;
        const y = Math.sin((angle * Math.PI) / 180) * distance;
        return (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 h-2 w-2 rounded-sm"
            style={{
              backgroundColor: color,
              animation: `confetti-fly 900ms ease-out forwards`,
              "--tx": `${x}px`,
              "--ty": `${y}px`,
            }}
          />
        );
      })}
    </div>
  );
}

export default function WheelGame() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { profile, setProfile } = useProfile();

  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const tickets = profile?.game_tickets || 0;
  const isBigWin = result > 0 && result >= BIG_WIN_THRESHOLD;

  const handleSpin = async () => {
    if (spinning) return;

    if (tickets < 1) {
      setError("Bạn đã hết lượt chơi. Làm nhiệm vụ để nhận thêm nhé!");
      return;
    }

    setError("");
    setSpinning(true);
    setResult(null);

    const { data, error: rpcError } = await supabase.rpc("play_minigame", {
      p_user_id: session.user.id,
      p_game_type: "wheel",
    });

    setTimeout(() => {
      setSpinning(false);

      if (rpcError || !data?.success) {
        setError(data?.message || rpcError?.message || "Có lỗi xảy ra.");
        return;
      }

      setResult(data.reward);
      setProfile((prev) => ({
        ...prev,
        coins: (prev.coins || 0) + data.reward,
        game_tickets: data.tickets_left,
      }));
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#EAF2FB] pb-10 text-[#111827]">
      <style>{`
        @keyframes confetti-fly {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0); opacity: 0; }
        }
        @keyframes mascot-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes cone-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <header className="relative z-20 flex items-center gap-3 px-4 py-3.5">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-[#374151]">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-[15px] font-bold text-[#111827]">Vòng quay may mắn</h1>
      </header>

      {/* Khu vực trang trí phối cảnh */}
      <div className="relative flex h-64 flex-col items-center overflow-hidden pt-6">
        <div className="h-1.5 w-10 rounded-full bg-[#3478F6]" />

        <span className="absolute left-[20%] top-14 h-10 w-1.5 rotate-[35deg] rounded-full bg-[#3478F6]/70" />
        <span className="absolute right-[20%] top-14 h-10 w-1.5 -rotate-[35deg] rounded-full bg-[#3478F6]/70" />

        <div
          className="relative mt-3"
          style={{
            width: "280px",
            height: "160px",
            clipPath: "polygon(50% 0%, 12% 100%, 88% 100%)",
            background: "linear-gradient(180deg, rgba(147,197,253,0.85), rgba(52,120,246,0.55))",
          }}
        />

        <div className="relative -mt-6 h-9 w-56 rounded-[50%] bg-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.06)]" />

        <div
          className="absolute bottom-8 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-white to-[#EAF2FB] shadow-xl"
          style={{ animation: "mascot-bounce 1.8s ease-in-out infinite" }}
        >
          <Coins size={40} className="text-[#F2A900]" />
        </div>
      </div>
      
      {/* Card trắng */}
      <div className="relative z-10 -mt-4 rounded-t-[28px] bg-white px-4 pb-8 pt-5 shadow-[0_-8px_24px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-black text-[#111827]">Vòng quay may mắn</p>
            <p className="text-xs text-[#9CA3AF]">Nhận Coin miễn phí</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-[#F5F7FB] px-3 py-1.5 text-sm font-bold text-[#111827]">
            {tickets} <Ticket size={14} className="text-[#3478F6]" />
          </span>
        </div>

        {error && <p className="mt-3 text-center text-sm font-semibold text-rose-500">{error}</p>}

        <button
          onClick={handleSpin}
          disabled={spinning || tickets < 1}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FB923C] to-[#F2A900] py-3.5 text-base font-black text-white shadow-[0_10px_24px_rgba(242,169,0,0.3)] transition disabled:opacity-40"
        >
          {spinning ? "Đang quay..." : "Quay ngay"}
          {!spinning && <ChevronRight size={18} />}
        </button>

        <div className="mt-3 rounded-xl bg-[#F5F7FB] px-4 py-2.5 text-center text-xs text-[#6B7280]">
          Hoàn thành nhiệm vụ để nhận thêm lượt quay miễn phí
        </div>

        <p className="mb-3 mt-6 text-sm font-bold text-[#111827]">Bạn có thể nhận:</p>
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {SEGMENTS.map((val, i) => (
            <div
              key={i}
              className="flex w-20 shrink-0 flex-col items-center gap-1.5 rounded-2xl border border-[#E5E7EB] bg-white p-3"
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-full ${val >= BIG_WIN_THRESHOLD ? "bg-[#FFF4DB]" : "bg-[#F5F7FB]"}`}>
                <Coins size={16} className={val >= BIG_WIN_THRESHOLD ? "text-[#F2A900]" : "text-[#9CA3AF]"} />
              </span>
              <span className="text-xs font-bold text-[#111827]">{val}</span>
            </div>
          ))}
        </div>
      </div>

      {result !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xs overflow-visible rounded-3xl bg-white p-6 text-center shadow-2xl">
            {isBigWin && <ConfettiBurst />}

            <button onClick={() => setResult(null)} className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center text-[#9CA3AF]">
              <X size={16} />
            </button>

            <div
              className={`relative mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
                isBigWin ? "bg-gradient-to-br from-[#F2A900] to-[#FB923C]" : "bg-[#F5F7FB]"
              }`}
            >
              {isBigWin ? <Sparkles size={32} className="text-white" /> : <Coins size={28} className="text-[#F2A900]" />}
            </div>

            <p className="mt-4 text-xl font-black text-[#111827]">
              {result > 0 ? (isBigWin ? "TRÚNG LỚN! 🎉" : "Chúc mừng!") : "Chúc bạn may mắn lần sau!"}
            </p>

            {result > 0 && <p className="mt-1 text-2xl font-black text-[#F2A900]">+{result} Coin</p>}

            <button
              onClick={() => setResult(null)}
              className="relative mt-6 w-full rounded-xl bg-gradient-to-r from-[#3478F6] to-[#0878C9] py-3 text-sm font-bold text-white"
            >
              Tuyệt vời
            </button>
          </div>
        </div>
      )}
    </div>
  );
        }
