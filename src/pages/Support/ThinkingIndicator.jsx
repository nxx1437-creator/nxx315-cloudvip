// src/pages/Support/ThinkingIndicator.jsx
// Spinner "cuộn xoắn" + dòng trạng thái hiện dần từ trái sang phải.

import React, { useEffect, useState } from "react";

// Đường xoắn 7 vòng (epitrochoid), tính 1 lần khi nạp module.
const SPIN_PATH = (() => {
  const R = 8;
  const r = 3.2;
  const n = 7;
  const N = 210;
  let d = "";
  for (let i = 0; i <= N; i++) {
    const t = (2 * Math.PI * i) / N;
    const x = R * Math.cos(t) + r * Math.cos(n * t);
    const y = R * Math.sin(t) + r * Math.sin(n * t);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)} `;
  }
  return `${d}Z`;
})();

// 3 lớp vệt (dài/mờ → ngắn/đậm) có cùng "đầu" nên tạo thành đuôi sao chổi.
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

const DEFAULT_TEXT = "Đang suy nghĩ…";
const SLOW_TEXT = " vẫn đang xử lý, bạn chờ chút nhé…";

/**
 * text: dòng trạng thái thật từ backend (nếu có). Khi text đổi, dòng mới
 * sẽ hiện dần từ trái sang phải.
 * Không có text → hiện "Đang suy nghĩ…", quá 9 giây thì đổi sang câu báo chờ
 * (không bịa các bước không có thật).
 */
export default function ThinkingIndicator({ text }) {
  const usingDefault = !text;
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    setSlow(false);
    if (!usingDefault) return undefined;
    const t = setTimeout(() => setSlow(true), 9000);
    return () => clearTimeout(t);
  }, [usingDefault, text]);

  const shown = usingDefault ? (slow ? SLOW_TEXT : DEFAULT_TEXT) : text;

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
  
