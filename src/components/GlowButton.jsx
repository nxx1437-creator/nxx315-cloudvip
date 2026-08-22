import React from "react";

export default function GlowButton({ children, onClick, variant = "primary", disabled = false, className = "" }) {
  const base = "flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-[0_0_20px_rgba(34,211,238,0.5)]",
    secondary: "border border-white/20 bg-white/10 text-white hover:bg-white/20",
    danger: "bg-gradient-to-r from-rose-500 to-red-600 text-white hover:shadow-[0_0_20px_rgba(244,63,94,0.5)]",
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}
