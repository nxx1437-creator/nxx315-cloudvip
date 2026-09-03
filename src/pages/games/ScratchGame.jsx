import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Ticket, Coins, X, Sparkles } from "lucide-react";

import useSession from "../../hooks/useSession.js";
import useProfile from "../../hooks/useProfile.js";
import { supabase } from "../../lib/supabaseClient.js";

const REWARDS = [0, 10, 20, 30, 50, 100, 300];
const BIG_WIN_THRESHOLD = 100;
const CARD_W = 300;
const CARD_H = 180;

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

export default function ScratchGame() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { profile, setProfile } = useProfile();

  const canvasRef = useRef(null);
  const [starting, setStarting] = useState(false);
  const [active, setActive] = useState(false);
  const [reward, setReward] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState("");
  const isScratching = useRef(false);

  const tickets = profile?.game_tickets || 0;
  const isBigWin = reward > 0 && reward >= BIG_WIN_THRESHOLD;

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
    gradient.addColorStop(0, "#CBD5E1");
    gradient.addColorStop(1, "#94A3B8");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CARD_W, CARD_H);

    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "bold 15px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Cào để lộ phần thưởng", CARD_W / 2, CARD_H / 2);
  }, [active]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * CARD_W,
      y: ((clientY - rect.top) / rect.height) * CARD_H,
    };
  };

  const scratchAt = (x, y) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
  };

  const checkRevealProgress = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, CARD_W, CARD_H).data;
    let transparent = 0;
    for (let i = 3; i < imageData.length; i += 4 * 20) {
      if (imageData[i] === 0) transparent++;
    }
    const total = imageData.length / (4 * 20);
    const pct = transparent / total;

    if (pct > 0.55 && !revealed) {
      setRevealed(true);
      ctx.clearRect(0, 0, CARD_W, CARD_H);
    }
  };

  const handlePointerDown = (e) => {
    if (!active || revealed) return;
    isScratching.current = true;
    const pos = getPos(e, canvasRef.current);
    scratchAt(pos.x, pos.y);
  };

  const handlePointerMove = (e) => {
    if (!isScratching.current || !active || revealed) return;
    const pos = getPos(e, canvasRef.current);
    scratchAt(pos.x, pos.y);
    checkRevealProgress();
  };

  const handlePointerUp = () => {
    isScratching.current = false;
  };

  const handleStart = async () => {
    if (starting) return;

    if (tickets < 1) {
      setError("Bạn đã hết lượt chơi. Làm nhiệm vụ để nhận thêm nhé!");
      return;
    }

    setError("");
    setStarting(true);
    setRevealed(false);
    setReward(null);

    const { data, error: rpcError } = await supabase.rpc("play_minigame", {
      p_user_id: session.user.id,
      p_game_type: "scratch",
    });

    setStarting(false);

    if (rpcError || !data?.success) {
      setError(data?.message || rpcError?.message || "Có lỗi xảy ra.");
      return;
    }

    setReward(data.reward);
    setActive(true);
    setProfile((prev) => ({
      ...prev,
      coins: (prev.coins || 0) + data.reward,
      game_tickets: data.tickets_left,
    }));
  };

  const handlePlayAgain = () => {
    setActive(false);
    setRevealed(false);
    setReward(null);
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
      `}</style>

      <header className="relative z-20 flex items-center gap-3 px-4 py-3.5">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-[#374151]">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-[15px] font-bold text-[#111827]">Cào thẻ trúng thưởng</h1>
      </header>

      <div className="relative flex h-56 items-center justify-center overflow-hidden">
        <div className="absolute h-64 w-64 rounded-full bg-gradient-to-br from-[#FDE68A]/50 to-[#F2A900]/20 blur-2xl" />
        <div
          className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-white to-[#FFF4DB] shadow-xl"
          style={{ animation: "mascot-bounce 1.8s ease-in-out infinite" }}
        >
          <Sparkles size={38} className="text-[#F2A900]" />
        </div>
      </div>

      <div className="relative z-10 -mt-4 rounded-t-[28px] bg-white px-4 pb-8 pt-5 shadow-[0_-8px_24px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-black text-[#111827]">Cào thẻ trúng thưởng</p>
            <p className="text-xs text-[#9CA3AF]">Cào lớp phủ để lộ Coin</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-[#F5F7FB] px-3 py-1.5 text-sm font-bold text-[#111827]">
            {tickets} <Ticket size={14} className="text-[#3478F6]" />
          </span>
        </div>

        {error && <p className="mt-3 text-center text-sm font-semibold text-rose-500">{error}</p>}

        {!active ? (
          <button
            onClick={handleStart}
            disabled={starting || tickets < 1}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#F2A900] to-[#FB923C] py-3.5 text-base font-black text-white shadow-[0_10px_24px_rgba(242,169,0,0.3)] disabled:opacity-40"
          >
            {starting ? "Đang chuẩn bị thẻ..." : "Lấy thẻ cào (1 lượt)"}
          </button>
        ) : (
          <div className="mt-5 flex flex-col items-center">
            <div
              className="relative overflow-hidden rounded-2xl border-2 border-[#E5E7EB] shadow-inner"
              style={{ width: CARD_W, height: CARD_H }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FFF8ED]">
                <Coins size={30} className="text-[#F2A900]" />
                <p className="mt-1 text-2xl font-black text-[#F2A900]">
                  {reward > 0 ? `+${reward}` : "0"} Coin
                </p>
              </div>

              <canvas
                ref={canvasRef}
                width={CARD_W}
                height={CARD_H}
                className="absolute inset-0 touch-none"
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onMouseLeave={handlePointerUp}
                onTouchStart={handlePointerDown}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerUp}
              />
            </div>

            {!revealed && (
              <p className="mt-3 text-xs text-[#9CA3AF]">👆 Dùng ngón tay cào lớp bạc phía trên</p>
            )}

            {revealed && (
              <button
                onClick={handlePlayAgain}
                className="mt-4 rounded-xl bg-gradient-to-r from-[#3478F6] to-[#0878C9] px-6 py-2.5 text-sm font-bold text-white"
              >
                Chơi thẻ khác
              </button>
            )}
          </div>
        )}

        {!active && (
          <div className="mt-3 rounded-xl bg-[#F5F7FB] px-4 py-2.5 text-center text-xs text-[#6B7280]">
            Hoàn thành nhiệm vụ để nhận thêm lượt cào miễn phí
          </div>
        )}

        <p className="mb-3 mt-6 text-sm font-bold text-[#111827]">Bạn có thể nhận:</p>
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {REWARDS.map((val, i) => (
            <div key={i} className="flex w-20 shrink-0 flex-col items-center gap-1.5 rounded-2xl border border-[#E5E7EB] bg-white p-3">
              <span className={`flex h-9 w-9 items-center justify-center rounded-full ${val >= BIG_WIN_THRESHOLD ? "bg-[#FFF4DB]" : "bg-[#F5F7FB]"}`}>
                <Coins size={16} className={val >= BIG_WIN_THRESHOLD ? "text-[#F2A900]" : "text-[#9CA3AF]"} />
              </span>
              <span className="text-xs font-bold text-[#111827]">{val}</span>
            </div>
          ))}
        </div>
      </div>

      {revealed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={handlePlayAgain}>
          <div className="relative w-full max-w-xs overflow-visible rounded-3xl bg-white p-6 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {isBigWin && <ConfettiBurst />}

            <button onClick={handlePlayAgain} className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center text-[#9CA3AF]">
              <X size={16} />
            </button>

            <div className={`relative mx-auto flex h-20 w-20 items-center justify-center rounded-full ${isBigWin ? "bg-gradient-to-br from-[#F2A900] to-[#FB923C]" : "bg-[#F5F7FB]"}`}>
              {isBigWin ? <Sparkles size={32} className="text-white" /> : <Coins size={28} className="text-[#F2A900]" />}
            </div>

            <p className="mt-4 text-xl font-black text-[#111827]">
              {reward > 0 ? (isBigWin ? "TRÚNG LỚN! 🎉" : "Chúc mừng!") : "Chúc bạn may mắn lần sau!"}
            </p>

            {reward > 0 && <p className="mt-1 text-2xl font-black text-[#F2A900]">+{reward} Coin</p>}

            <button
              onClick={handlePlayAgain}
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
