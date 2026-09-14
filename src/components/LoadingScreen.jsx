import React from "react";

const SUPABASE_URL = "https://rwglwovohbyqmbbzdvdj.supabase.co";
const STORAGE_BUCKET = "game_logos";
const LOGO_URL = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/logo.png`;

export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 via-white to-white">
      <style>{`
        @keyframes bounceIn {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatLogo {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .loading-dot {
          animation: bounceIn 1.4s infinite ease-in-out both;
        }
        .loading-dot-1 { animation-delay: -0.32s; }
        .loading-dot-2 { animation-delay: -0.16s; }
        .loading-logo {
          animation: fadeInUp 0.5s ease-out, floatLogo 3s ease-in-out infinite;
        }
        .loading-text {
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>

      <div className="text-center">
        {/* Logo */}
        <img
          src={LOGO_URL}
          alt="NXX315 Studio"
          className="loading-logo mx-auto h-32 w-32 object-contain"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />

        {/* Tên */}
        <h1 className="loading-text mt-2 font-[Baloo_2] text-2xl font-bold text-slate-900">
          NXX315 <span className="text-sky-500">Studio</span>
        </h1>

        <p className="loading-text mt-1 text-xs text-slate-500">
          Nền tảng nhiệm vụ & phần thưởng
        </p>

        {/* 3 chấm loading */}
        <div className="mt-6 flex items-center justify-center gap-1.5">
          <span className="loading-dot loading-dot-1 h-2 w-2 rounded-full bg-sky-500" />
          <span className="loading-dot loading-dot-2 h-2 w-2 rounded-full bg-sky-500" />
          <span className="loading-dot h-2 w-2 rounded-full bg-sky-500" />
        </div>

        <p className="mt-4 text-xs text-slate-400">Đang tải...</p>
      </div>
    </div>
  );
}
