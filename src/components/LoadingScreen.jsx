import React from "react";

/**
 * LoadingScreen.jsx
 * Cute Cloud Loading Screen (Blue Theme)
 */

export default function LoadingScreen() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#5BA8F5] px-6 text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&display=swap');

        .font-display {
          font-family: 'Baloo 2', sans-serif;
        }

        /* Hiệu ứng đám mây lơ lửng */
        @keyframes floatCloud {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        /* Hiệu ứng mưa tim rơi */
        @keyframes rainHeart {
          0% {
            transform: translateY(0) scale(0.8);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            transform: translateY(130px) scale(1);
            opacity: 0;
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

      {/* ĐÁM MÂY */}
      <div className="relative flex h-[300px] w-[320px] items-center justify-center">
        
        {/* Mưa tim rơi quanh mây */}
        <div className="absolute top-10 left-8 text-xl" style={{ animation: "rainHeart 1.5s linear infinite" }}>💗</div>
        <div className="absolute top-0 right-10 text-lg" style={{ animation: "rainHeart 1.8s linear infinite .3s" }}>💙</div>
        <div className="absolute top-12 right-4 text-sm" style={{ animation: "rainHeart 2s linear infinite .6s" }}>💗</div>
        <div className="absolute top-5 left-20 text-sm" style={{ animation: "rainHeart 2.2s linear infinite .9s" }}>💙</div>

        {/* Quầng sáng mờ phía sau */}
        <div className="absolute h-56 w-56 rounded-full bg-white/20 blur-3xl" style={{ animation: "softPulse 3s ease-in-out infinite" }} />

        {/* Hình dáng đám mây (CSS thuần) */}
        <div 
          className="relative z-10"
          style={{ animation: "floatCloud 3s ease-in-out infinite" }}
        >
          {/* Thân mây */}
          <div className="relative h-[120px] w-[220px] rounded-full bg-white shadow-[0_15px_25px_rgba(0,0,0,0.15)]">
            
            {/* Các khối tròn tạo thành mây */}
            <div className="absolute -top-10 -left-8 h-[90px] w-[90px] rounded-full bg-white" />
            <div className="absolute -top-14 left-10 h-[110px] w-[110px] rounded-full bg-white" />
            <div className="absolute -top-8 right-0 h-[80px] w-[80px] rounded-full bg-white" />
            
            {/* Mắt, miệng và má hồng */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="flex gap-5">
                <div className="h-3 w-3 rounded-full bg-[#704b4d]"></div>
                <div className="h-3 w-3 rounded-full bg-[#704b4d]"></div>
              </div>
              <div className="mt-1.5 h-1.5 w-5 rounded-full border-b-2 border-[#704b4d]"></div>
            </div>
            <div className="absolute bottom-2 left-8 h-4 w-6 rounded-full bg-pink-200/80"></div>
            <div className="absolute bottom-2 right-8 h-4 w-6 rounded-full bg-pink-200/80"></div>

          </div>
        </div>
      </div>

      {/* Text */}
      <div className="relative z-10 mt-2 text-center">
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
