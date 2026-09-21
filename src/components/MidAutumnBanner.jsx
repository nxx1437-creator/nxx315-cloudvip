import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Sparkles } from "lucide-react";

const EVENT_END = new Date("2026-10-07T23:59:59+07:00");

function getCountdown(target) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { d: 0, h: 0, m: 0, ended: true };

  return {
    d: Math.floor(diff / (1000 * 60 * 60 * 24)),
    h: Math.floor((diff / (1000 * 60 * 60)) % 24),
    m: Math.floor((diff / (1000 * 60)) % 60),
    ended: false,
  };
}

export default function MidAutumnBanner() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(getCountdown(EVENT_END));
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdown(EVENT_END));
    }, 60000); // 1 phút update
    return () => clearInterval(interval);
  }, []);

  if (countdown.ended || dismissed) return null;

  return (
    <div
      onClick={() => navigate("/mid-autumn")}
      className="theme-mid-autumn relative cursor-pointer overflow-hidden rounded-2xl shadow-[0_8px_24px_rgba(220,20,60,0.3)] transition active:scale-[0.99]"
    >
      {/* Background gradient đỏ */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-red-600 to-orange-500" />

      {/* Pattern mờ */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-yellow-300/20" />
      <div className="pointer-events-none absolute -bottom-8 -left-4 h-20 w-20 rounded-full bg-yellow-300/20" />

      {/* Lồng đèn lơ lửng */}
      <div className="pointer-events-none absolute -left-2 top-1 text-3xl opacity-60 lantern-glow">
        🏮
      </div>
      <div className="pointer-events-none absolute -right-2 bottom-1 text-3xl opacity-60 lantern-glow" style={{ animationDelay: "0.5s" }}>
        🏮
      </div>

      {/* Mặt trăng */}
      <div className="pointer-events-none absolute right-4 top-4 h-8 w-8 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-400 moon-glow" />

      {/* Nội dung */}
      <div className="relative p-4">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-300/30 backdrop-blur-sm ring-2 ring-yellow-300/50">
            <Sparkles size={22} className="text-yellow-100" strokeWidth={2.4} />
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-black leading-tight text-yellow-100 drop-shadow-sm">
                🌕 TRUNG THU NXX315
              </h3>
            </div>
            <p className="mt-0.5 text-[11.5px] font-medium text-yellow-100/90">
              Đập hộp - Đếm sao - Nhận quà
            </p>

            {/* Countdown mini */}
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full bg-yellow-300/30 px-2 py-0.5 text-[10px] font-black text-yellow-100 backdrop-blur-sm">
                ⏱ Còn {countdown.d}N {countdown.h}H
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10.5px] font-black text-yellow-100">
                Tham gia
                <ChevronRight size={12} strokeWidth={2.8} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
                }
