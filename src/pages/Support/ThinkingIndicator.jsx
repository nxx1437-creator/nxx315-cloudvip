// src/pages/Support/ThinkingIndicator.jsx

import React, { useEffect, useState } from "react";

// Vẽ ngôi sao 8 cánh (tâm ở 0,0)
const STAR_PATH = (() => {
  const points = 8; 
  const outerR = 10; 
  const innerR = 4.5; 
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

// Tạo hiệu ứng đuôi (comet tail) với độ dài và độ mờ khác nhau
const COMET_LAYERS = [
  { len: 70, opacity: 0.05, width: 4.5 }, // Đuôi rất dài, cực mờ
  { len: 55, opacity: 0.15, width: 3.5 }, // Đuôi dài
  { len: 35, opacity: 0.4, width: 2.5 },  // Đuôi vừa
  { len: 15, opacity: 0.9, width: 1.8 },  // Đầu sao
];

export function ThinkingSpinner({ size = 32 }) { // Tăng size lên 32 cho dễ nhìn
  return (
    <svg
      width={size}
      height={size}
      viewBox="-14 -14 28 28" 
      fill="none"
      aria-hidden="true"
      className="shrink-0 nxx-star-spin" 
      style={{ animation: "spin 3s linear infinite" }} // Chậm lại còn 3s/vòng
    >
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Lớp nền mờ (ghost) của ngôi sao */}
      <path
        d={STAR_PATH}
        stroke="#e5e7eb"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Các lớp tạo đuôi sao chổi */}
      {COMET_LAYERS.map((l, idx) => (
        <path
          key={idx}
          d={STAR_PATH}
          stroke="#1b1c24"
          strokeWidth={l.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            opacity: l.opacity,
            // Cắt bớt nét vẽ để tạo hình cung đuôi
            strokeDasharray: `${l.len} 100`,
            strokeDashoffset: 0, 
          }}
        />
      ))}
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
  
