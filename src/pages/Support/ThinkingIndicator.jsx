// src/pages/Support/ThinkingIndicator.jsx

import React, { useEffect, useState } from "react";

// Vẽ đường xoắn ốc (dựa theo code gốc ban đầu của bạn)
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

// Tạo các lớp đuôi mờ dần (Comet)
const COMET_LAYERS = [
  { len: 45, opacity: 0.1, width: 3.5 }, // Lớp khói dài nhất
  { len: 25, opacity: 0.3, width: 2.5 }, // Lớp khói vừa
  { len: 10, opacity: 1, width: 1.8 },   // Đầu nét sắc nét
];

export function ThinkingSpinner({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-13 -13 26 26"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        {/* Bộ lọc làm mờ tạo cảm giác khói/mây */}
        <filter id="blur-tail" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
        </filter>
      </defs>

      {/* 1. Nét nền mờ (ghost) */}
      <path
        d={SPIN_PATH}
        pathLength="100"
        className="nxx-spin-ghost"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 2. Các lớp đuôi mờ dần */}
      {COMET_LAYERS.map((l, idx) => {
        const isLast = idx === COMET_LAYERS.length - 1;
        return (
          <path
            key={l.len}
            d={SPIN_PATH}
            pathLength="100"
            className="nxx-spin-comet" // Dùng class từ file CSS của bạn
            style={{ 
              "--L": l.len, 
              opacity: l.opacity,
              filter: isLast ? "none" : "url(#blur-tail)" // Làm mờ các đuôi phía sau
            }}
            stroke="#1b1c24"
            strokeWidth={l.width}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
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
