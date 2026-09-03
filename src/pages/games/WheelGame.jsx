import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Ticket, Coins, X, Sparkles, ChevronRight, RefreshCw } from "lucide-react";

import useSession from "../../hooks/useSession.js";
import useProfile from "../../hooks/useProfile.js";
import { supabase } from "../../lib/supabaseClient.js";

// Danh sách các mức phần thưởng bằng đồng xu tương ứng
const REWARDS = [
  { id: 1, amount: 10, subtitle: "Coin thưởng nhỏ", isBigWin: false },
  { id: 2, amount: 50, subtitle: "Coin thưởng vừa", isBigWin: false },
  { id: 3, amount: 100, subtitle: "Trúng lớn!", isBigWin: true },
  { id: 4, amount: 500, subtitle: "Siêu khủng!", isBigWin: true },
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
  const [result, setResult] = useState(null); // Lưu thông tin phần thưởng trúng
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

    setTimeout(() => {
      setSpinning(false);

      if (rpcError || !data?.success) {
        setError(data?.message || rpcError?.message || "Có lỗi xảy ra.");
        return;
      }

      // Chọn một mức thưởng ngẫu nhiên từ danh sách (hoặc dùng data.reward nếu trả về từ server)
      const randomReward = REWARDS[Math.floor(Math.random() * REWARDS.length)];
      const finalRewardAmount = data.reward || randomReward.amount;
      
      setResult({
        amount: finalRewardAmount,
        isBigWin: finalRewardAmount >= 100,
      });

      setProfile((prev) => ({
        ...prev,
        coins: (prev.coins || 0) + finalRewardAmount,
        game_tickets: data.tickets_left,
      }));
    }, 1500);
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

      {/* Header */}
      <header className="relative z-25 flex items-center justify-between px-4 py-3.5 bg-white/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#374151] shadow-sm">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-[15px] font-bold text-[#111827]">Wheel of Fortune</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">🐵</span>
        </div>
      </header>

      {/* Khu vực vòng quay với icon Đồng xu ở tâm */}
      <div className="relative flex h-64 flex-col items-center overflow-hidden pt-4">
        {/* Kim chỉ định hướng ở trên */}
        <div className="absolute top-2 z-20 h-3 w-6 bg-[#3478F6] rounded-b-full shadow-md" />

        {/* Khối vòng quay mô phỏng */}
        <div 
          className={`relative mt-4 flex h-44 w-44 items-center justify-center rounded-full border-4 border-white bg-gradient-to-tr from-blue-100 to-white shadow-xl ${spinning ? "animate-spin" : ""}`}
          style={{ animationDuration: spinning ? "0.4s" : "0s" }}
        >
          <div className="absolute inset-2 rounded-full border border-dashed border-blue-300" />
          
          {/* Biểu tượng Đồng xu ở giữa vòng quay */}
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-amber-100 to-amber-200 shadow-md"
            style={{ animation: !spinning ? "mascot-bounce 1.8s ease-in-out infinite" : "none" }}
          >
            <Coins size={36} className="text-[#F2A900]" />
          </div>
        </div>
      </div>
      
      {/* Card trắng chứa thông tin chính */}
      <div className="relative z-10 -mt-2 rounded-t-[28px] bg-white px-4 pb-8 pt-5 shadow-[0_-8px_24px_rgba(0,0,0,0.04)]">
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

        {/* Phần "You can get" hiển thị các mức Coin */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm font-bold text-[#111827]">You can get:</p>
          <button className="text-[#9CA3AF] hover:text-[#111827]">
            <RefreshCw size={14} />
          </button>
        </div>

        <div className="mt-3 flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {REWARDS.map((item) => (
            <div
              key={item.id}
              className="flex w-32 shrink-0 flex-col items-center rounded-2xl border border-[#E5E7EB] bg-white p-3 text-center shadow-sm"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#FFF4DB] mb-2 border border-amber-100">
                <Coins size={28} className="text-[#F2A900]" />
              </div>
              <span className="text-xs font-bold text-[#111827]">+{item.amount} Coins</span>
              <span className="text-[10px] text-[#9CA3AF]">{item.subtitle}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Popup kết quả trúng thưởng hiển thị số lượng coin */}
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
        
