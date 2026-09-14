import React from "react";

const SUPABASE_URL = "https://rwglwovohbyqmbbzdvdj.supabase.co";
const STORAGE_BUCKET = "game_logos";
const LOGO_URL = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/logo.png`;

export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <style>{`
        @keyframes spinRing {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .loading-wrap {
          animation: fadeIn 0.4s ease-out;
        }
        .loading-logo {
          animation: scaleIn 0.5s ease-out;
        }
        .loading-ring {
          animation: spinRing 1.2s linear infinite;
          transform-origin: center;
        }
      `}</style>

      <div className="loading-wrap flex flex-col items-center">
        {/* Vòng xoay + logo */}
        <div className="relative flex h-32 w-32 items-center justify-center">
          {/* Vòng tròn xoay */}
          <svg
            className="loading-ring absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            fill="none"
          >
            {/* Vòng mờ (base) — xanh nhạt */}
            <circle
              cx="50"
              cy="50"
              r="46"
              stroke="#BAE6FD"
              strokeWidth="3"
            />
            {/* Vòng xanh xoay (1/4 vòng) — xanh đậm */}
            <circle
              cx="50"
              cy="50"
              r="46"
              stroke="#0EA5E9"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="72 220"
            />
          </svg>

          {/* Logo ở giữa */}
          <img
            src={LOGO_URL}
            alt="NXX315 Studio"
            className="loading-logo h-20 w-20 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>

        {/* Chữ NXX315 bên dưới */}
        <h1 className="mt-6 font-[Baloo_2] text-lg font-bold text-slate-900">
          NXX315 <span className="text-sky-500">Studio</span>
        </h1>

        <p className="mt-1 text-xs text-slate-400">Đang tải...</p>
      </div>
    </div>
  );
}
