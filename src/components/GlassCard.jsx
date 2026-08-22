import React from "react";

export default function GlassCard({ children, className = "", onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.37)] transition-all hover:border-cyan-300/30 ${className}`}
    >
      {children}
    </div>
  );
}
