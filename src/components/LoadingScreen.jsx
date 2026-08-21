import React from "react";

/**
 * LoadingScreen.jsx — chỉ 1 vòng tròn xoay to, không chữ, không khối phụ.
 */
export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-400 via-sky-500 to-blue-600">
      <style>{`
        @keyframes ringSpin { to { transform: rotate(360deg); } }
      `}</style>
      <svg width="90" height="90" viewBox="0 0 100 100" style={{ animation: "ringSpin 0.9s linear infinite" }}>
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="8"
          strokeDasharray="264" strokeDashoffset="190" strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
