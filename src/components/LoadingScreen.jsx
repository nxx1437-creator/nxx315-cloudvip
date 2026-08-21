import React from "react";

/**
 * LoadingScreen.jsx
 * Cute Circle Loading Screen (Blue Theme)
 */

export default function LoadingScreen() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#5BA8F5] px-6 text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&display=swap');

        .font-display {
          font-family: 'Baloo 2', sans-serif;
        }

        /* Hiệu ứng vòng tròn lơ lửng */
        @keyframes floatCircle {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        /* Hiệu ứng quầng sáng mờ phía sau */
        @keyframes softPulse {
          0%, 100% {
            transform: scale(1);
            opacity: .4;
          }
          50% {
            transform: scale(1.1);
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
      <div className="absolute left-[18%] top-[22%] text-3xl text-white/90" style={{ animation: "sparkle 2s ease-in-out infinite" }}>✦</div>
      <div className="absolute right-[20%] top-[30%] text-2xl text-white/90" style={{ animation: "sparkle 2.4s ease-in-out infinite .4s" }}>♡</div>
      <div className="absolute bottom-[25%] left-[25%] text-xl text-white/90" style={{ animation: "sparkle 2.2s ease-in-out infinite .8s" }}>✦</div>

      {/* VÒNG TRÒN TRẮNG */}
      <div className="relative flex h-[320px] w-[320px] items-center justify-center">
        
        {/* Quầng sáng mờ phía sau */}
        <div className="absolute h-56 w-56 rounded-full bg-white/30 blur-3xl" style={{ animation: "softPulse 3s ease-in-out infinite" }} />

        {/* Vòng tròn chính */}
        <div 
          className="relative z-10 flex h-[260px] w-[260px] items-center justify-center rounded-full border-4 border-white bg-white shadow-[0_15px_35px_rgba(0,0,0,0.2)]"
          style={{ animation: "floatCircle 3s ease-in-out infinite" }}
        >
          
          {/* 
            NẾU MUỐN ĐẶT ẢNH/GIF VÀO TRONG VÒNG TRÒN:
            1. Bỏ ảnh vào thư mục public.
            2. Bỏ comment ở đoạn dưới và sửa đường dẫn ảnh của bạn.
          */}
          
          {/* <img 
            src="/loading-character.gif" 
            alt="Đang tải..." 
            className="h-[200px] w-[200px] object-contain"
          /> */}

          {/* 
            TẠM THỜI DÙNG ICON LOADING DỄ THƯƠNG NẾU CHƯA CÓ ẢNH:
            Bạn có thể thay bằng emoji, hoặc text mặc định bên trong.
          */}
          <div className="font-display text-6xl font-bold text-[#5BA8F5]">☁️</div>

        </div>
      </div>

      {/* Text */}
      <div className="relative z-10 mt-6 text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
          Đợi xíu nhe... ♡
        </h1>
        <p className="font-display mt-1 text-base font-medium text-white/90 drop-shadow-sm">
          Đang chuẩn bị mọi thứ thật xinh cho bạn
        </p>
      </div>

      {/* Loading dots */}
      <div className="mt-6 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-white shadow-sm" style={{ animation: "dotBounce 1.2s ease-in-out infinite" }} />
        <span className="h-2.5 w-2.5 rounded-full bg-white shadow-sm" style={{ animation: "dotBounce 1.2s ease-in-out infinite .15s" }} />
        <span className="h-2.5 w-2.5 rounded-full bg-white shadow-sm" style={{ animation: "dotBounce 1.2s ease-in-out infinite .3s" }} />
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