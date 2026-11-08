// src/pages/Support/ThinkingIndicator.jsx

import React, { useEffect, useState } from "react";

// Vẽ ngôi sao 4 cánh
const STAR_PATH = (() => {
  const points = 4; 
  const outerR = 6; // Thu nhỏ ngôi sao lại một chút
  const innerR = 2; 
  let d = "";
  
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI * i) / points - Math.PI / 2; 
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)} `;
  }
  return `${d}Z`;
})();

export function ThinkingSpinner({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-15 -15 30 30" 
      fill="none"
      aria-hidden="true"
      className="shrink-0" 
      style={{ animation: "spin 1.5s linear infinite" }} // Quay nhanh một chút
    >
      <defs>
        {/* Tạo đuôi mờ dần (tan biến vào không trung) */}
        <linearGradient id="comet-fade" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#13141a" stopOpacity="1" />
          <stop offset="50%" stopColor="#13141a" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#13141a" stopOpacity="0" />
        </linearGradient>

        {/* Làm mờ đuôi (tạo khói) */}
        <filter id="blur-tail" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
        </filter>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </defs>

      {/* 1. Vòng tròn đuôi (Comet Ring) - Làm mờ và dùng gradient */}
      <circle
        cx="0"
        cy="0"
        r="11"
        stroke="url(#comet-fade)"
        strokeWidth="3"
        fill="none"
        strokeDasharray="60 100" // Cắt lấy 60% vòng tròn làm đuôi
        strokeLinecap="round"
        filter="url(#blur-tail)" 
      />

      {/* 2. Vòng tròn sắc nét (Lõi của đuôi) */}
      <circle
        cx="0"
        cy="0"
        r="11"
        stroke="url(#comet-fade)"
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="50 100"
        strokeLinecap="round"
      />

      {/* 3. Ngôi sao ở tâm (Đầu sao chổi) */}
      <path
        d={STAR_PATH}
        fill="#13141a"
        stroke="#13141a"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Các dòng chờ chung
const STEPS = [
  { at: 0, text: "Đang suy nghĩ…" },
  { at: 2400, text: "Đang đọc kỹ câu hỏi của bạn…" },
  { at: 5200, text: "Đang soạn câu trả lời…" },
  { at: 10000, text: "Vẫn đang xử lý, bạn chờ chút nhé…" },
];

export default function ThinkingIndicator({ text }) {
  const usingDefault = !text;
  const [step, setStep] = useState(0);

  useEffect(() => {
    setStep(0);
    if (!usingDefault) return undefined;
    const timers = STEPS.slice(1).map((s, i) =>
      setTimeout(() => setStep(i + 1), s.at)
    );
    return () => timers.forEach(clearTimeout);
  }, [usingDefault, text]);

  const shown = usingDefault ? STEPS[step].text : text;

  return (
    <div
      className="nxx-fade flex items-center gap-3 py-1"
      role="status"
      aria-live="polite"
    >
      <ThinkingSpinner />
      <span
        key={shown}
        className="nxx-reveal text-[17px] leading-6 text-[#7b7e90]"
      >
        {shown}
      </span>
    </div>
  );
}
