import React from "react";

export default function AppBackground({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B1120] text-white">
      {/* Background Gradient + Glow Effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-purple-500/20 blur-[100px]" />
        <div className="absolute left-0 top-1/2 h-[200px] w-[200px] rounded-full bg-blue-500/10 blur-[80px]" />
      </div>

      {/* Nội dung chính */}
      <div className="relative z-10 pb-24">{children}</div>
    </div>
  );
}
