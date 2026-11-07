// src/pages/Support/ThinkingIndicator.jsx
// Spinner "cuộn xoắn" + dòng trạng thái đổi dần theo thời gian chờ.

import React, { useEffect, useState } from "react";

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

const COMET_LAYERS = [
  { len: 34, opacity: 0.22 },
  { len: 20, opacity: 0.5 },
  { len: 9, opacity: 1 },
];

export function ThinkingSpinner({ size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-12.5 -12.5 25 25"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d={SPIN_PATH}
        pathLength="100"
        className="nxx-spin-ghost"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {COMET_LAYERS.map((l) => (
        <path
          key={l.len}
          d={SPIN_PATH}
          pathLength="100"
          className="nxx-spin-comet"
          style={{ "--L": l.len, opacity: l.opacity }}
          stroke="#1b1c24"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

// Các dòng chờ chung (không khẳng định việc cụ thể nào), đổi theo thời gian
const STEPS = [
  { at: 0, text: "Đang suy nghĩ…" },
  { at: 2400, text: "Đang đọc kỹ câu hỏi của bạn…" },
  { at: 5200, text: "Đang soạn câu trả lời…" },
  { at: 10000, text: "Vẫn đang xử lý, bạn chờ chút nhé…" },
];

/**
 * text: dòng trạng thái thật từ backend (sender_type = "status"). Có text thì
 * hiện đúng text đó. Không có thì chạy các dòng chờ chung ở trên.
 */
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
  
