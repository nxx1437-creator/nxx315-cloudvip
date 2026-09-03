import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Ticket } from "lucide-react";

// DỮ LIỆU CHUẨN - CHỈ 6 SỐ
const PRIZES = [10, 20, 50, 100, 200, 500];

export default function WheelGame() {
  const navigate = useNavigate();
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    const idx = Math.floor(Math.random() * PRIZES.length);
    const angle = 360 / PRIZES.length;
    const newRot = rotation + 360 * 4 + (360 - idx * angle);
    setRotation(newRot);
    setTimeout(() => setSpinning(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#EAF3FC]">
      <header className="flex items-center px-4 py-4">
        <button onClick={() => navigate(-1)} className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-md">
          <ArrowLeft size={23} />
        </button>
        <h1 className="ml-3 text-lg font-bold">Wheel of Fortune</h1>
      </header>

      <div className="flex justify-center items-center h-[420px] relative">
        <div className="absolute top-8 z-10">
          <div className="w-0 h-0 border-l-[18px] border-r-[18px] border-t-[30px] border-l-transparent border-r-transparent border-t-red-500 drop-shadow-lg" />
        </div>

        <div className="relative h-80 w-80">
          <div
            className="w-full h-full rounded-full border-8 border-white shadow-xl transition-all duration-[3000ms] ease-out"
            style={{
              transform: `rotate(${rotation}deg)`,
              background: `conic-gradient(from -30deg, #1a56db 0deg 60deg, #ffffff 60deg 120deg, #1a56db 120deg 180deg, #ffffff 180deg 240deg, #1a56db 240deg 300deg, #ffffff 300deg 360deg)`,
            }}
          >
            {PRIZES.map((amount, i) => {
              const a = -30 + i * 60;
              const isBlue = i % 2 === 0;
              return (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2"
                  style={{ transform: `rotate(${a}deg)` }}
                >
                  <span
                    className={`absolute font-bold text-xl whitespace-nowrap ${isBlue ? 'text-white' : 'text-[#1a56db]'}`}
                    style={{
                      transform: `translateX(-50%) translateY(-115px) rotate(${-a}deg)`,
                      left: '50%',
                    }}
                  >
                    +{amount}
                  </span>
                </div>
              );
            })}

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-24 w-24 rounded-full bg-yellow-500 border-8 border-white flex items-center justify-center shadow-lg z-10">
                <span className="font-bold text-white text-xl tracking-wider">SPIN</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-t-3xl p-6 min-h-[280px] shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-lg font-bold">Fortune Wheel</p>
            <p className="text-sm text-gray-400">Get free coins</p>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
            <span className="font-bold">10</span>
            <Ticket size={20} className="text-blue-600" />
          </div>
        </div>

        <button
          onClick={spin}
          disabled={spinning}
          className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-300 rounded-2xl font-bold text-white text-lg shadow-lg disabled:opacity-50 transition active:scale-95"
        >
          {spinning ? "Đang quay..." : "Add spins"}
        </button>

        <div className="mt-4 p-4 bg-gray-50 rounded-xl text-center text-sm text-gray-500">
          Activate promo codes and get more spins!
        </div>
      </div>
    </div>
  );
}
