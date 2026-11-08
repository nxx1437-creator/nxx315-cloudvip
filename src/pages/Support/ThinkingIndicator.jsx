// src/pages/Support/ThinkingIndicator.jsx

import React, { useEffect, useState } from "react";

// Vẽ đường xoắn ốc
const SPIN_PATH = (() => {
  const R = 8;
  const r = 3.2;
  const n = 7;
  const N = 150;
  let d = "";
  for (let i = 0; i <= N; i++) {
    const t = (2 * Math.PI * i) / N;
    const x = R * Math.cos(t) + r * Math.cos(n * t);
    const y = R * Math.sin(t) + r * Math.sin(n * t);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)} `;
  }
  return `${d}Z`;
})();

export function ThinkingSpinner({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-13 -13 26 26"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
      style={{ animation: "spin-smooth 1.5s linear infinite" }} // LỆNH QUAY TỔNG THỂ
    >
      <defs>
        {/* Tạo màu mờ dần cho đuôi sao chổi */}
        <linearGradient id="spin-fade" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#13141a" stopOpacity="1" />
          <stop offset="60%" stopColor="#13141a" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#13141a" stopOpacity="0" />
        </linearGradient>

        <style>{`
          @keyframes spin-smooth {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </defs>

      {/* Lớp nền mờ (ghost) */}
      <path
        d={SPIN_PATH}
        stroke="#e5e7eb"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Lớp đuôi mờ dần (Dùng Gradient và cắt nét) */}
      <path
        d={SPIN_PATH}
        pathLength="100"
        stroke="url(#spin-fade)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="85 100" // Đuôi dài 85%
      />
      
      {/* Lớp lõi sắc nét ở đầu */}
      <path
        d={SPIN_PATH}
        pathLength="100"
        stroke="#13141a"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="15 100" // Chỉ vẽ 15% đầu
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
