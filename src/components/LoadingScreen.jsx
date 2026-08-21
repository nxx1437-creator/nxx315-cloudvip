import React from "react";

/**
 * LoadingScreen.jsx
 * Cute pastel loading screen (Deep Blue & White Theme)
 *
 * Đặt file GIF nhân vật vào:
 * public/loading-character.gif
 */

export default function LoadingScreen() {
  return (
    // Đổi màu nền từ #A8D5E2 (xanh pastel) sang #1E88E5 (xanh nước biển)
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#1E88E5] px-6 text-white">
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
        className="absolute left-[18%] top-[22%] text-3xl text-white/90"
        style={{ animation: "sparkle 2s ease-in-out infinite" }}
      >
        ✦
      </div>

      <div
        className="absolute right-[20%] top-[30%] text-2xl text-white/90"
        style={{ animation: "sparkle 2.4s ease-in-out infinite .4s" }}
      >
        ♡
      </div>

      <div
        className="absolute bottom-[25%] left-[25%] text-xl text-white/90"
        style={{ animation: "sparkle 2.2s ease-in-out infinite .8s" }}
      >
        ✦
      </div>

      {/* Character */}
      <div className="relative flex h-[320px] w-[320px] items-center justify-center sm:h-[360px] sm:w-[360px]">
        {/* Soft glow behind character */}
        <div
          className="absolute h-64 w-64 rounded-full bg-white/20 blur-3xl"
          style={{ animation: "softPulse 3s ease-in-out infinite" }}
        />

        {/* Character shadow */}
        <div className="absolute bottom-8 h-8 w-40 rounded-full bg-black/20 blur-xl" />

        {/* GIF nhân vật - CÓ BO TRÒN VÀ VIỀN TRẮNG */}
        <div className="relative z-10 h-[280px] w-[280px] overflow-hidden rounded-[40px] border-4 border-white bg-white p-3 shadow-[0_12px_25px_rgba(0,0,0,0.2)] sm:h-[320px] sm:w-[320px] flex items-center justify-center">
            {/* Đã sửa lại đoạn img bị lỗi */}
            <img
              src="https://pin.it/2VjKKT14J/loading.gif" 
              alt="Đang tải..."
              className="h-full w-full object-contain"
              style={{
                animation: "floatCharacter 3s ease-in-out infinite",
              }}
              onError={(e) => {
                 // Nếu ảnh chính bị lỗi, tự động thay bằng ảnh dự phòng
                 e.target.src = "https://media.tenor.com/0AVbKGY_MxMAAAAi/loading-buffering.gif"; 
              }}
            />
        </div>
      </div>

      {/* Text */}
      <div className="relative z-10 mt-4 text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
          Đợi xíu nhe... ♡
        </h1>

        <p className="font-display mt-1 text-base font-medium text-white/90 drop-shadow-sm">
          Đang chuẩn bị mọi thứ thật xinh cho bạn
        </p>
      </div>

      {/* Loading dots */}
      <div className="mt-6 flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full bg-white shadow-sm"
          style={{
            animation: "dotBounce 1.2s ease-in-out infinite",
          }}
        />

        <span
          className="h-2.5 w-2.5 rounded-full bg-white shadow-sm"
          style={{
            animation: "dotBounce 1.2s ease-in-out infinite .15s",
          }}
        />

        <span
          className="h-2.5 w-2.5 rounded-full bg-white shadow-sm"
          style={{
            animation: "dotBounce 1.2s ease-in-out infinite .3s",
          }}
        />
      </div>

      {/* Bottom loading pill */}
      <div className="mt-5 rounded-full border border-white/40 bg-white/20 px-5 py-2 backdrop-blur-md shadow-md">
        <span className="font-display text-sm font-semibold text-white">
          Loading...
        </span>
      </div>
    </div>
  );
}
