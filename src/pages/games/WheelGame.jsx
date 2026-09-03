import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Ticket, Coins, X } from "lucide-react";

import useSession from "../../hooks/useSession.js";
import useProfile from "../../hooks/useProfile.js";
import { supabase } from "../../lib/supabaseClient.js";

const SEGMENTS = [0, 10, 20, 30, 50, 100, 200, 500];
const SEGMENT_COLORS = [
  "#94A3B8", "#3478F6", "#60A5FA", "#0878C9",
  "#38BDF8", "#F2A900", "#FB923C", "#EF4444",
];
const ANGLE_PER_SEGMENT = 360 / SEGMENTS.length;

export default function WheelGame() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { profile, setProfile } = useProfile();

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const tickets = profile?.game_tickets || 0;

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
    const extraSpins = 5 * 360;
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
    }, 4200);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] pb-10 text-[#111827]">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[#E5E7EB] bg-white/95 px-4 py-3.5 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full text-[#6B7280] hover:bg-[#F5F7FB]">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-[15px] font-bold text-[#111827]">Vòng quay may mắn</h1>
      </header>

      <main className="mx-auto flex max-w-md flex-col items-center px-4 py-8">
        <div className="flex items-center gap-1.5 rounded-full bg-[#EAF2FE] px-3.5 py-1.5 text-xs font-bold text-[#3478F6]">
          <Ticket size={13} /> {tickets} lượt còn lại
        </div>

        <div className="relative mt-8 h-72 w-72">
          <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1">
            <div className="h-0 w-0 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-[#111827]" />
          </div>

          <div
            className="h-full w-full rounded-full border-[6px] border-white shadow-xl"
            style={{
              ...gradientStyle,
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? "transform 4.2s cubic-bezier(0.17, 0.67, 0.16, 0.99)" : "none",
            }}
          >
            {SEGMENTS.map((val, i) => {
              const angle = i * ANGLE_PER_SEGMENT + ANGLE_PER_SEGMENT / 2;
              return (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2 flex h-full w-0 origin-top justify-center"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <span
                    className="mt-6 text-sm font-black text-white drop-shadow"
                    style={{ transform: `rotate(180deg)` }}
                  >
                    {val}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md">
            <Coins size={22} className="text-[#F2A900]" />
          </div>
        </div>

        {error && <p className="mt-4 text-center text-sm font-semibold text-rose-500">{error}</p>}

        <button
          onClick={handleSpin}
          disabled={spinning || tickets < 1}
          className="mt-8 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#3478F6] to-[#0878C9] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#3478F6]/25 disabled:opacity-50"
        >
          {spinning ? "Đang quay..." : "Quay ngay (1 lượt)"}
        </button>

        <p className="mt-4 text-center text-xs text-[#9CA3AF]">
          Mỗi lượt chơi được cộng khi bạn hoàn thành 1 nhiệm vụ bất kỳ.
        </p>
      </main>

      {result !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xs rounded-3xl bg-white p-6 text-center">
            <button onClick={() => setResult(null)} className="ml-auto flex h-7 w-7 items-center justify-center text-[#9CA3AF]">
              <X size={16} />
            </button>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF4DB]">
              <Coins size={28} className="text-[#F2A900]" />
            </div>
            <p className="mt-4 text-lg font-bold text-[#111827]">
              {result > 0 ? `Chúc mừng! +${result} Coin` : "Chúc bạn may mắn lần sau!"}
            </p>
            <button
              onClick={() => setResult(null)}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#3478F6] to-[#0878C9] py-3 text-sm font-bold text-white"
            >
              Tuyệt vời
            </button>
          </div>
        </div>
      )}
    </div>
  );
  }
