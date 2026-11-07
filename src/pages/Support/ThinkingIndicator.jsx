// src/pages/Support/ThinkingIndicator.jsx
// Icon nét vẽ nguệch ngoạc tự chạy + chữ shimmer, đổi nhãn theo thời gian.
import React, { useEffect, useState } from "react";

const DEFAULT_LABELS = [
  "Đang suy nghĩ…",
  "Đang đọc câu hỏi của bạn…",
  "Đang tìm thông tin phù hợp…",
  "Đang soạn câu trả lời…",
];

const SCRIBBLE =
  "M9 21C4 19 4 12 10 11C15 10 17 15 13 17C10 18.5 8 15.5 10.5 14C14 12 20 12 23 15C26 18 22 23 17 22.5C14 22 13 20 15 19";

function ScribbleIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      className="shrink-0"
      aria-hidden="true"
    >
      <path
        d={SCRIBBLE}
        pathLength="100"
        stroke="#111418"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="scribble-base"
      />
      <path
        d={SCRIBBLE}
        pathLength="100"
        stroke="#111418"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="scribble-head"
      />
    </svg>
  );
}

// `label` (tuỳ chọn): nếu backend gửi tin "status" thì hiển thị đúng nội dung đó.
export default function ThinkingIndicator({ label }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (label) return undefined;
    const t = setInterval(
      () => setI((p) => Math.min(p + 1, DEFAULT_LABELS.length - 1)),
      2400
    );
    return () => clearInterval(t);
  }, [label]);

  const text = label || DEFAULT_LABELS[i];

  return (
    <div
      className="msg-in flex items-center gap-2.5 py-1"
      role="status"
      aria-live="polite"
    >
      <ScribbleIcon />
      <span
        key={text}
        className="shimmer-text label-in text-[15px] font-medium tracking-[-0.005em]"
      >
        {text}
      </span>
    </div>
  );
}
