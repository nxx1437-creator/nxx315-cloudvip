import React from "react";
import { Sparkles } from "lucide-react";

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
        .loading-dot {
          animation: bounceIn 1.4s infinite ease-in-out both;
        }
        .loading-dot-1 { animation-delay: -0.32s; }
        .loading-dot-2 { animation-delay: -0.16s; }
        .loading-logo {
          animation: fadeInUp 0.5s ease-out;
        }
      `}</style>

      <div className="text-center">
        <div className="loading-logo mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg shadow-sky-500/30">
          <Sparkles size={28} className="text-white" />
        </div>

        <h1 className="loading-logo mt-4 font-[Baloo_2] text-xl font-bold text-slate-900">
          NXX315 <span className="text-sky-500">Studio</span>
        </h1>

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
