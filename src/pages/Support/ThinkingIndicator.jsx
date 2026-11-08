// src/pages/Support/ThinkingIndicator.jsx

import React, { useEffect, useState } from "react";

// Vẽ đường xoắn ốc (giữ nguyên)
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

// Cấu hình hiệu ứng
const DURATION = 1.6; // giây / vòng
const TAIL = 45; // đuôi dài bao nhiêu % đường (pathLength = 100)
const SEGMENTS = 30; // số đoạn chia đuôi (càng nhiều càng mượt)
const SEG_LEN = TAIL / SEGMENTS;
const COLOR = "#13141a";

const TAIL_SEGMENTS = Array.from({ length: SEGMENTS }, (_, i) => {
  const k = i / (SEGMENTS - 1); // 0 = đầu, 1 = cuối đuôi
  return {
    key: i,
    opacity: Math.pow(1 - k, 1.6), // mờ dần, đầu đậm - cuối trong suốt
    width: 2 - k * 0.8, // đuôi thon dần
    // lệch pha để mỗi đoạn bám sau đoạn trước
    delay: -(DURATION - (i * SEG_LEN * DURATION) / 100),
  };
});

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
      <style>{`
        @keyframes spin-comet {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: -100; }
        }
        .spin-seg {
          animation: spin-comet ${DURATION}s linear infinite;
          will-change: stroke-dashoffset;
        }
        @media (prefers-reduced-motion: reduce) {
          .spin-seg { animation-duration: ${DURATION * 3}s; }
        }
      `}</style>

      {/* Lớp nền mờ (ghost) */}
      <path
        d={SPIN_PATH}
        stroke="#e5e7eb"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Đuôi: nhiều đoạn nhỏ, opacity giảm dần dọc theo đường */}
      {TAIL_SEGMENTS.slice(1).map((s) => (
        <path
          key={s.key}
          className="spin-seg"
          d={SPIN_PATH}
          pathLength="100"
          stroke={COLOR}
          strokeOpacity={s.opacity}
          strokeWidth={s.width}
          strokeLinejoin="round"
          // +0.25 để các đoạn chồng nhẹ lên nhau, không bị hở
          strokeDasharray={`${SEG_LEN + 0.25} ${100 - SEG_LEN - 0.25}`}
          style={{ animationDelay: `${s.delay}s` }}
        />
      ))}

      {/* Đầu sao chổi: đậm, bo tròn */}
      <path
        className="spin-seg"
        d={SPIN_PATH}
        pathLength="100"
        stroke={COLOR}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={`${SEG_LEN} ${100 - SEG_LEN}`}
        style={{ animationDelay: `${TAIL_SEGMENTS[0].delay}s` }}
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
