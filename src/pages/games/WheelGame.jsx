import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Ticket, ChevronRight } from "lucide-react";

const SEGMENTS = [10, 20, 50, 100, 200, 500];

export default function WheelGame() {
  const navigate = useNavigate();
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    const randomIndex = Math.floor(Math.random() * SEGMENTS.length);
    const angle = 360 / SEGMENTS.length;
    const targetRotation = rotation + 360 * 5 + (360 - randomIndex * angle);
    setRotation(targetRotation);
    setTimeout(() => setSpinning(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#EAF3FC]">
      <header className="flex items-center px-4 py-4">
        <button onClick={() => navigate(-1)} className="h-[46px] w-[46px] rounded-full bg-white flex items-center justify-center shadow-md">
          <ArrowLeft size={23} />
        </button>
        <h1 className="ml-3 text-[18px] font-black">Wheel of Fortune</h1>
      </header>

      <div className="flex justify-center items-center h-[420px] relative">
        {/* Pointer */}
        <div className="absolute left-1/2 top-[30px] z-10 -translate-x-1/2">
          <div className="w-0 h-0 border-l-[18px] border-r-[18px] border-t-[30px] border-l-transparent border-r-transparent border-t-[#FF4444] drop-shadow-lg" />
        </div>

        {/* Vòng quay */}
        <div className="relative h-[320px] w-[320px]">
          <div
            className="w-full h-full rounded-full border-[8px] border-white shadow-xl transition-all duration-[3000ms] ease-out relative overflow-hidden"
            style={{
              transform: `rotate(${rotation}deg)`,
            }}
          >
            {/* Nền 6 màu */}
            <div className="absolute inset-0">
              {SEGMENTS.map((amount, i) => {
                const colors = ['#2563EB', '#FFFFFF', '#2563EB', '#FFFFFF', '#2563EB', '#FFFFFF'];
                const startAngle = i * 60;
                return (
                  <div
                    key={i}
                    className="absolute inset-0"
                    style={{
                      background: `conic-gradient(from ${startAngle}deg, ${colors[i]} 0deg 60deg, transparent 60deg 360deg)`,
                    }}
                  />
                );
              })}
            </div>

            {/* Số tiền */}
            {SEGMENTS.map((amount, i) => {
              const angle = i * 60;
              const isBlue = i % 2 === 0;
              return (
                <div
                  key={i}
                  className="absolute left-1/2 top-0 w-8 h-8"
                  style={{
                    transform: `translateX(-50%) rotate(${angle}deg)`,
                    transformOrigin: '0 160px',
                  }}
                >
                  <span
                    className={`absolute font-bold text-lg ${isBlue ? 'text-white' : 'text-[#2563EB]'}`}
                    style={{
                      transform: `rotate(${-angle}deg)`,
                      top: '-10px',
                      left: '50%',
                      transform: `translateX(-50%) rotate(${-angle}deg)`,
                    }}
                  >
                    +{amount}
                  </span>
                </div>
              );
            })}

            {/* Tâm */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-[100px] w-[100px] rounded-full bg-[#F59E0B] border-[8px] border-white flex items-center justify-center shadow-lg z-10">
                <span className="font-black text-white text-xl tracking-wider">SPIN</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-t-[32px] p-6 min-h-[300px] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[18px] font-black">Fortune Wheel</p>
            <p className="text-[14px] text-gray-400">Get free coins</p>
          </div>
          <div className="flex items-center gap-2 bg-[#F7F9FC] px-4 py-2 rounded-full">
            <span className="font-bold">10</span>
            <Ticket size={20} className="text-[#3478F6]" />
          </div>
        </div>

        <button
          onClick={handleSpin}
          disabled={spinning}
          className="w-full py-4 bg-gradient-to-r from-[#FFD4A7] to-[#FFE39A] rounded-[20px] font-black text-white text-[17px] shadow-lg disabled:opacity-50 transition active:scale-95"
        >
          {spinning ? "Đang quay..." : "Add spins"}
        </button>

        <div className="mt-4 p-4 bg-[#F6F8FC] rounded-[18px] text-center text-[13px] text-gray-500">
          Activate promo codes and get more spins!
        </div>
      </div>
    </div>
  );
            }
