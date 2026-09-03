import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Ticket, Coins, X, Sparkles } from "lucide-react";

import useSession from "../../hooks/useSession.js";
import useProfile from "../../hooks/useProfile.js";
import { supabase } from "../../lib/supabaseClient.js";

const SEGMENTS = [0, 10, 20, 30, 50, 100, 200, 500];
const SEGMENT_COLORS = [
  "#64748B", "#3478F6", "#22D3EE", "#0878C9",
  "#38BDF8", "#F2A900", "#FB923C", "#EF4444",
];
const ANGLE_PER_SEGMENT = 360 / SEGMENTS.length;
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

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [idlePulse, setIdlePulse] = useState(0);

  const tickets = profile?.game_tickets || 0;
  const isBigWin = result > 0 && result >= BIG_WIN_THRESHOLD;

  useEffect(() => {
    const t = setInterval(() => setIdlePulse((p) => p + 1), 2000);
    return () => clearInterval(t);
  }, []);

  const gradientStyle = {
    background: `conic-gradient(${SEGMENT_COLORS.map(
      (c, i) => `${c} ${i * ANGLE_PER_SEGMENT}deg ${(i + 1) * ANGLE_PER_SEGMENT}deg`
    ).join(", ")})`,
  };

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

    if (rpcError || !data?.success) {
      setSpinning(false);
      setError(data?.message || rpcError?.message || "Có lỗi xảy ra.");
      return;
    }

    const rewardIndex = SEGMENTS.indexOf(data.reward);
    const segmentCenter = rewardIndex * ANGLE_PER_SEGMENT + ANGLE_PER_SEGMENT / 2;
    const extraSpins = 6 * 360;
    const targetRotation = rotation - (rotation % 360) + extraSpins + (360 - segmentCenter);

    setRotation(targetRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(data.reward);
      setProfile((prev) => ({
        ...prev,
        coins: (prev.coins || 0) + data.reward,
        game_tickets: data.tickets_left,
      }));
    }, 4500);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-b from-[#0B1220] via-[#111827] to-[#0B1220] pb-10 text-white">
      <style>{`
        @keyframes confetti-fly {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0); opacity: 0; }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.06); }
        }
        @keyframes idle-wobble {
          0%, 100% { transform: rotate(var(--base-rot)); }
          50% { transform: rotate(calc(var(--base-rot) + 3deg)); }
        }
        @keyframes shine-sweep {
          0% { transform: translateX(-120%) skewX(-20deg); }
          100% { transform: translateX(220%) skewX(-20deg); }
        }
      `}</style>

      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/10 bg-[#0B1220]/90 px-4 py-3.5 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:bg-white/10">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-[15px] font-bold text-white">Vòng quay may mắn</h1>
      </header>

      <main className="relative mx-auto flex max-w-md flex-col items-center px-4 py-8">
        <div className="flex items-center gap-1.5 rounded-full border border-[#3478F6]/40 bg-[#3478F6]/15 px-4 py-1.5 text-xs font-bold text-sky-300">
          <Ticket size={13} /> {tickets} lượt còn lại
        </div>

        <div className="relative mt-10 flex h-80 w-80 items-center justify-center">
          <div
            className="absolute inset-0 rounded-full bg-[#3478F6] blur-2xl"
            style={{ animation: "glow-pulse 2.4s ease-in-out infinite" }}
          />

          <div className="absolute left-1/2 top-2 z-20 -translate-x-1/2">
            <div className="h-0 w-0 border-l-[12px] border-r-[12px] border-t-[22px] border-l-transparent border-r-transparent border-t-[#F2A900] drop-shadow-lg" />
          </div>

          <div
            className="relative h-72 w-72 rounded-full border-[8px] border-white/90 shadow-[0_0_40px_rgba(52,120,246,0.35)]"
            style={{
              ...gradientStyle,
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? "transform 4.5s cubic-bezier(0.15, 0.65, 0.15, 1)" : "none",
            }}
          >
            {Array.from({ length: 16 }).map((_, i) => (
              <span
                key={i}
                className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-white/80 shadow"
                style={{ transform: `rotate(${i * 22.5}deg) translateY(-138px)` }}
              />
            ))}

            {SEGMENTS.map((val, i) => {
              const angle = i * ANGLE_PER_SEGMENT + ANGLE_PER_SEGMENT / 2;
              return (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2 flex h-full w-0 origin-top justify-center"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <span
                    className="mt-9 flex flex-col items-center text-white drop-shadow-md"
                    style={{ transform: `rotate(180deg)` }}
                  >
                    <span className="text-base font-black">{val}</span>
                    {val >= BIG_WIN_THRESHOLD && <span className="text-[9px]">🔥</span>}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="absolute left-1/2 top-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-[#F2A900] bg-white shadow-lg">
            <Coins size={24} className="text-[#F2A900]" />
          </div>
        </div>

        {error && <p className="mt-5 text-center text-sm font-semibold text-rose-400">{error}</p>}

        <button
          onClick={handleSpin}
          disabled={spinning || tickets < 1}
          className="relative mt-9 flex items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#F2A900] to-[#FB923C] px-10 py-4 text-base font-black text-[#111827] shadow-[0_10px_30px_rgba(242,169,0,0.35)] transition disabled:opacity-40"
        >
          {!spinning && tickets >= 1 && (
            <span
              className="pointer-events-none absolute inset-0 w-1/3 bg-white/40"
              style={{ animation: "shine-sweep 2.2s ease-in-out infinite" }}
            />
          )}
          <span className="relative">{spinning ? "Đang quay..." : "QUAY NGAY"}</span>
        </button>

        <p className="mt-4 text-center text-xs text-white/40">
          Hoàn thành nhiệm vụ để nhận thêm lượt quay miễn phí mỗi ngày
        </p>
      </main>

      {result !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xs overflow-visible rounded-3xl bg-gradient-to-b from-[#1c1848] to-[#0B1220] p-6 text-center shadow-2xl">
            {isBigWin && <ConfettiBurst />}

            <button onClick={() => setResult(null)} className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center text-white/50 hover:text-white">
              <X size={16} />
            </button>

            <div
              className={`relative mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
                isBigWin ? "bg-gradient-to-br from-[#F2A900] to-[#FB923C]" : "bg-white/10"
              }`}
            >
              {isBigWin ? <Sparkles size={32} className="text-white" /> : <Coins size={28} className="text-[#F2A900]" />}
            </div>

            <p className="mt-4 text-xl font-black text-white">
              {result > 0 ? (isBigWin ? "TRÚNG LỚN! 🎉" : "Chúc mừng!") : "Chúc bạn may mắn lần sau!"}
            </p>

            {result > 0 && (
              <p className="mt-1 text-2xl font-black text-[#F2A900]">+{result} Coin</p>
            )}

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
