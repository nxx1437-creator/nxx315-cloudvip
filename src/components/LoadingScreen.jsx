import React from "react";

/**
 * LoadingScreen.jsx
 * Cute pastel loading screen
 *
 * Đặt file GIF nhân vật vào:
 * public/loading-character.gif
 */

export default function LoadingScreen() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f6a6aa] px-6 text-[#704b4d]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&display=swap');

        .font-display {
          font-family: 'Baloo 2', sans-serif;
        }

        @keyframes floatCharacter {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes softPulse {
          0%, 100% {
            transform: scale(1);
            opacity: .45;
          }
          50% {
            transform: scale(1.08);
            opacity: .7;
          }
        }

        @keyframes dotBounce {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: .45;
          }
          40% {
            transform: translateY(-5px);
            opacity: 1;
          }
        }

        @keyframes sparkle {
          0%, 100% {
            transform: scale(.8) rotate(0deg);
            opacity: .3;
          }
          50% {
            transform: scale(1.15) rotate(15deg);
            opacity: 1;
          }
        }
      `}</style>

      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

      {/* Cute sparkles */}
      <div
        className="absolute left-[18%] top-[22%] text-3xl"
        style={{ animation: "sparkle 2s ease-in-out infinite" }}
      >
        ✦
      </div>

      <div
        className="absolute right-[20%] top-[30%] text-2xl"
        style={{ animation: "sparkle 2.4s ease-in-out infinite .4s" }}
      >
        ♡
      </div>

      <div
        className="absolute bottom-[25%] left-[25%] text-xl"
        style={{ animation: "sparkle 2.2s ease-in-out infinite .8s" }}
      >
        ✦
      </div>

      {/* Character */}
      <div className="relative flex h-[300px] w-[300px] items-center justify-center sm:h-[340px] sm:w-[340px]">
        {/* Soft glow behind character */}
        <div
          className="absolute h-64 w-64 rounded-full bg-white/30 blur-3xl"
          style={{ animation: "softPulse 3s ease-in-out infinite" }}
        />

        {/* Character shadow */}
        <div className="absolute bottom-8 h-8 w-40 rounded-full bg-[#9b6063]/15 blur-xl" />

        {/* GIF nhân vật */}
        <img
          src="/loading-character.gif"
          alt="Đang tải..."
          className="relative z-10 h-[270px] w-[270px] object-contain drop-shadow-[0_12px_15px_rgba(112,75,77,0.12)] sm:h-[310px] sm:w-[310px]"
          style={{
            animation: "floatCharacter 3s ease-in-out infinite",
          }}
        />
      </div>

      {/* Text */}
      <div className="relative z-10 mt-2 text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#704b4d]">
          Đợi xíu nhe... ♡
        </h1>

        <p className="font-display mt-1 text-base font-medium text-[#80595b]/80">
          Đang chuẩn bị mọi thứ thật xinh cho bạn
        </p>
      </div>

      {/* Loading dots */}
      <div className="mt-6 flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full bg-white"
          style={{
            animation: "dotBounce 1.2s ease-in-out infinite",
          }}
        />

        <span
          className="h-2.5 w-2.5 rounded-full bg-white"
          style={{
            animation: "dotBounce 1.2s ease-in-out infinite .15s",
          }}
        />

        <span
          className="h-2.5 w-2.5 rounded-full bg-white"
          style={{
            animation: "dotBounce 1.2s ease-in-out infinite .3s",
          }}
        />
      </div>

      {/* Bottom loading pill */}
      <div className="mt-5 rounded-full border border-white/30 bg-white/20 px-5 py-2 backdrop-blur-md">
        <span className="font-display text-sm font-semibold text-[#704b4d]/75">
          Loading...
        </span>
      </div>
    </div>
  );
}