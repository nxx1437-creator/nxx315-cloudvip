import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Ticket, Coins, X, Sparkles, ChevronRight, RefreshCw } from "lucide-react";

import useSession from "../../hooks/useSession.js";
import useProfile from "../../hooks/useProfile.js";
import { supabase } from "../../lib/supabaseClient.js";

const SEGMENTS = [
  { id: 1, amount: 10, isBigWin: false },
  { id: 2, amount: 20, isBigWin: false },
  { id: 3, amount: 50, isBigWin: false },
  { id: 4, amount: 100, isBigWin: true },
  { id: 5, amount: 200, isBigWin: true },
  { id: 6, amount: 500, isBigWin: true },
];

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
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const tickets = profile?.game_tickets || 0;

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

    const randomIndex = Math.floor(Math.random() * SEGMENTS.length);
    const selectedSegment = SEGMENTS[randomIndex];
    const degreesPerSegment = 360 / SEGMENTS.length;
    const targetRotation = rotation + 1800 + (randomIndex * degreesPerSegment);

    setRotation(targetRotation);

    setTimeout(() => {
      setSpinning(false);

      if (rpcError || !data?.success) {
        setError(data?.message || rpcError?.message || "Có lỗi xảy ra.");
        return;
      }

      const finalAmount = data.reward || selectedSegment.amount;
      setResult({
        amount: finalAmount,
        isBigWin: finalAmount >= 100,
      });

      setProfile((prev) => ({
        ...prev,
        coins: (prev.coins || 0) + finalAmount,
        game_tickets: data.tickets_left,
      }));
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#EAF2FB] pb-10 text-[#111827]">
      <style>{`
        @keyframes confetti-fly {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0); opacity: 0; }
        }
      `}</style>

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-4 py-3.5 bg-transparent">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#374151] shadow-sm">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-[15px] font-bold text-[#111827]">Wheel of Fortune</h1>
        </div>
      </header>

      {/* Khu vực vòng quay tròn trịa, cân đối phía trên */}
      <div className="relative flex h-64 w-full flex-col items-center justify-center overflow-hidden px-4">
        {/* Kim chỉ định hướng phía trên */}
        <div className="absolute top-2 z-30 h-3.5 w-8 bg-[#3478F6] rounded-b-full shadow-md" />

        {/* Vòng quay chuẩn hình tròn (dùng aspect-square và w-72 max-w-[280px]) */}
        <div 
          className="relative aspect-square w-72 max-w-[280px] rounded-full border-[12px] border-white bg-[#EBF3FE] shadow-md transition-all ease-out"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: spinning ? "3s" : "0s",
          }}
        >
          {SEGMENTS.map((seg, idx) => {
            const angle = (360 / SEGMENTS.length) * idx;
            return (
              <div
                key={seg.id}
                className="absolute inset-0"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <div className="absolute left-1/2 top-2 -translate-x-1/2 h-3.5 w-9 rounded-full bg-[#3478F6]" />
                <div 
                  className="absolute left-1/2 top-11 -translate-x-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-blue-50"
                  style={{ transform: `rotate(-${angle + rotation}deg)` }}
                >
                  <Coins size={20} className="text-[#F2A900]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Card trắng chứa thông tin tương tác bên dưới */}
      <div className="relative z-10 rounded-t-[28px] bg-white px-4 pb-8 pt-5 shadow-[0_-8px_24px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-black text-[#111827]">Fortune Wheel</p>
            <p className="text-xs text-[#9CA3AF]">Get free coins</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-[#F5F7FB] px-3 py-1.5 text-sm font-bold text-[#111827] shadow-inner">
            {tickets} <Ticket size={14} className="text-[#3478F6]" />
          </span>
        </div>

        {error && <p className="mt-3 text-center text-sm font-semibold text-rose-500">{error}</p>}

        <button
          onClick={handleSpin}
          disabled={spinning || tickets < 1}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FB923C] to-[#F2A900] py-3.5 text-base font-black text-white shadow-[0_10px_24px_rgba(242,169,0,0.3)] transition active:scale-95 disabled:opacity-40"
        >
          {spinning ? "Đang quay..." : "Add spins"}
          {!spinning && <ChevronRight size={18} />}
        </button>

        <div className="mt-3 rounded-xl bg-[#F5F7FB] px-4 py-2.5 text-center text-xs text-[#6B7280]">
          Activate promo codes and get more spins!
        </div>

        {/* Danh sách mốc thưởng */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm font-bold text-[#111827]">You can get:</p>
          <button className="text-[#9CA3AF] hover:text-[#111827]">
            <RefreshCw size={14} />
          </button>
        </div>

        <div className="mt-3 flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {SEGMENTS.map((item) => (
            <div
              key={item.id}
              className="flex w-28 shrink-0 flex-col items-center rounded-2xl border border-[#E5E7EB] bg-white p-3 text-center shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF4DB] mb-2 border border-amber-100">
                <Coins size={22} className="text-[#F2A900]" />
              </div>
              <span className="text-xs font-bold text-[#111827]">+{item.amount} Coins</span>
            </div>
          ))}
        </div>
      </div>

      {/* Popup kết quả trúng thưởng */}
      {result !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xs overflow-visible rounded-3xl bg-white p-6 text-center shadow-2xl animate-in fade-in zoom-in duration-200">
            {result.isBigWin && <ConfettiBurst />}

            <button onClick={() => setResult(null)} className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center text-[#9CA3AF] hover:text-black">
              <X size={16} />
            </button>

            <div
              className={`relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 ${
                result.isBigWin ? "border-amber-400 bg-amber-50" : "border-blue-100 bg-blue-50"
              }`}
            >
              {result.isBigWin ? <Sparkles size={32} className="text-amber-500" /> : <Coins size={36} className="text-[#F2A900]" />}
            </div>

            <p className="mt-4 text-xl font-black text-[#111827]">
              {result.isBigWin ? "TRÚNG LỚN! 🎉" : "Chúc mừng bạn!"}
            </p>

            <p className="mt-2 text-2xl font-black text-[#F2A900]">+{result.amount} Coins</p>
            <p className="text-xs text-[#9CA3AF] mt-1">Số dư đã được cộng vào tài khoản của bạn</p>

            <button
              onClick={() => setResult(null)}
              className="relative mt-6 w-full rounded-xl bg-gradient-to-r from-[#3478F6] to-[#0878C9] py-3 text-sm font-bold text-white shadow-md active:scale-95"
            >
              Tuyệt vời
            </button>
          </div>
        </div>
      )}
    </div>
  );
      }
            
