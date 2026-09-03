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
        <button onClick={() => navigate(-1)} className="h-[46px] w-[46px] rounded-full bg-white flex items-center justify-center">
          <ArrowLeft size={23} />
        </button>
        <h1 className="ml-3 text-[18px] font-black">Wheel of Fortune</h1>
      </header>

      <div className="flex justify-center py-10">
        <div className="relative h-[320px] w-[320px]">
          <div
            className="w-full h-full rounded-full border-8 border-white transition-transform duration-3000"
            style={{
              transform: `rotate(${rotation}deg)`,
              background: `conic-gradient(from -30deg, #1a56db 0deg 60deg, #fff 60deg 120deg, #1a56db 120deg 180deg, #fff 180deg 240deg, #1a56db 240deg 300deg, #fff 300deg 360deg)`,
            }}
          >
            {SEGMENTS.map((amount, i) => {
              const angle = -90 + i * 60;
              return (
                <div key={i} className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="absolute text-white font-bold text-xl"
                    style={{
                      transform: `rotate(${angle}deg) translateY(-120px)`,
                    }}
                  >
                    +{amount}
                  </span>
                </div>
              );
            })}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-[100px] w-[100px] rounded-full bg-yellow-400 border-8 border-white flex items-center justify-center">
                <span className="font-bold text-white text-xl">SPIN</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-t-3xl p-6 min-h-[300px]">
        <button
          onClick={handleSpin}
          disabled={spinning}
          className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-300 rounded-2xl font-bold text-white disabled:opacity-50"
        >
          {spinning ? "Đang quay..." : "Add spins"}
        </button>
      </div>
    </div>
  );
}
