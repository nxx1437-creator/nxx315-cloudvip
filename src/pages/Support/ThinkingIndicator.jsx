// src/pages/Support/ThinkingIndicator.jsx

import React, { useEffect, useState } from "react";

// Vẽ ngôi sao 8 cánh (tâm ở 0,0)
const STAR_PATH = (() => {
  const points = 8; 
  const outerR = 9; 
  const innerR = 4; 
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

export function ThinkingSpinner({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-15 -15 30 30" 
      fill="none"
      aria-hidden="true"
      className="shrink-0" 
      style={{ animation: "spin 2.5s linear infinite" }} // Quay mượt mà
    >
      <defs>
        {/* Tạo hiệu ứng mờ ảo (như mây) */}
        <filter id="blur-tail" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
        </filter>

        {/* Gradient màu tự mờ dần để làm đuôi sao chổi */}
        <linearGradient id="comet-fade" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#13141a" stopOpacity="1" />
          <stop offset="40%" stopColor="#13141a" stopOpacity="0.6" />
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

      {/* 1. Ngôi sao chính (Sáng rõ) */}
      <path
        d={STAR_PATH}
        stroke="#13141a"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* 2. Đuôi sao chổi (Dùng nét đứt dài và gradient để mờ dần) */}
      <path
        d={STAR_PATH}
        stroke="url(#comet-fade)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        // 75 là chiều dài đuôi (trên tổng 100), 25 là khoảng trống
        strokeDasharray="75 100" 
        filter="url(#blur-tail)" // Làm mờ ảo như mây
      />

      {/* 3. Một lớp đuôi mỏng hơn ở trên cùng để tăng độ sắc nét */}
      <path
        d={STAR_PATH}
        stroke="url(#comet-fade)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="60 100" 
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
  
