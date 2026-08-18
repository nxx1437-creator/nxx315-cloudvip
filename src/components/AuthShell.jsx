import React, { useState } from "react";
import { Coins, Sun, Moon } from "lucide-react";

/**
 * AuthShell — shared chrome for Login.jsx and Register.jsx.
 * Keeps both pages visually identical (logo, background, theme toggle,
 * card container) without duplicating the same markup twice.
 */
export default function AuthShell({ title, subtitle, children, footer }) {
  const [dark, setDark] = useState(true);

  const pageBg = dark ? "bg-[#050B18] text-sky-100" : "bg-[#F5FAFF] text-sky-950";
  const cardBg = dark
    ? "bg-white/[0.04] border-white/10 backdrop-blur-xl"
    : "bg-white/80 border-sky-200 backdrop-blur-xl";
  const subText = dark ? "text-sky-200/70" : "text-sky-800/80";

  return (
    <div className={`relative min-h-screen w-full font-[Be_Vietnam_Pro] transition-colors duration-500 ${pageBg}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
      `}</style>

      <div
        className="pointer-events-none absolute inset-x-0 top-[-15%] h-[420px] blur-3xl opacity-40"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 30%, rgba(56,189,248,0.35), transparent 70%)",
        }}
      />

      <button
        onClick={() => setDark((d) => !d)}
        aria-label="Đổi giao diện sáng/tối"
        className={`absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border ${
          dark ? "border-white/15 hover:bg-white/10 text-sky-200" : "border-sky-200 hover:bg-sky-50 text-sky-700"
        } transition`}
      >
        {dark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 py-16">
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg shadow-sky-500/30">
            <Coins size={22} className="text-white" />
          </div>
          <span className={`font-display mt-3 text-2xl font-bold ${dark ? "text-sky-50" : "text-sky-950"}`}>
            CloudVIP
          </span>
          <p className={`mt-1 text-sm ${subText}`}>Kiếm Coin, đổi Robux chính hãng</p>
        </div>

        <div className={`w-full rounded-3xl border p-7 sm:p-8 ${cardBg}`}>
          <h1 className={`font-display text-2xl font-bold ${dark ? "text-sky-50" : "text-sky-950"}`}>
            {title}
          </h1>
          {subtitle && <p className={`mt-1.5 text-sm ${subText}`}>{subtitle}</p>}

          <div className="mt-6">{children}</div>
        </div>

        {footer && <div className={`mt-6 text-sm ${subText}`}>{footer}</div>}
      </div>
    </div>
  );
}
