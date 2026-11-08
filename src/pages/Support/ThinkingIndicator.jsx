// src/pages/Support/ThinkingIndicator.jsx

import React, { useEffect, useState } from "react";

// Vẽ ngôi sao 4 cánh (nhìn sẽ mềm mại và hiện đại hơn 8 cánh)
const STAR_PATH = (() => {
  const points = 4; // 4 cánh
  const outerR = 10; 
  const innerR = 3.5; // Kẽ cánh sâu hơn tạo hình ngôi sao sắc nét
  let d = "";
  
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI * i) / points - Math.PI / 2; 
    // Dùng đường cong (Q) thay vì đường thẳng (L) để cánh sao mềm mại hơn
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)} `;
  }
  return `${d}Z`;
})();

export function ThinkingSpinner({ size = 40 }) { // Tăng size lên 40
  return (
    <svg
      width={size}
      height={size}
      viewBox="-15 -15 30 30" 
      fill="none"
      aria-hidden="true"
      className="shrink-0" 
      style={{ animation: "spin 2.5s linear infinite" }}
    >
      <defs>
        {/* Làm mờ đuôi (tạo khói/mây) */}
        <filter id="blur-tail" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
        </filter>

        {/* Gradient tạo hiệu ứng mờ dần từ đuôi đến đầu */}
        <linearGradient id="comet-fade" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#13141a" stopOpacity="1" />
          <stop offset="40%" stopColor="#13141a" stopOpacity="0.8" />
          <stop offset="80%" stopColor="#13141a" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#13141a" stopOpacity="0" />
        </linearGradient>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </defs>

      {/* Lớp 1: Cái đuôi (to, mờ, dùng gradient) */}
      <path
        d={STAR_PATH}
        stroke="url(#comet-fade)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        // 80 là độ dài đuôi chiếm 80% vòng tròn
        strokeDasharray="80 100" 
        filter="url(#blur-tail)" 
      />

      {/* Lớp 2: Đầu sao sắc nét (Đè lên trên) */}
      <path
        d={STAR_PATH}
        stroke="#13141a"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="20 100" // Chỉ vẽ phần đầu sao
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
