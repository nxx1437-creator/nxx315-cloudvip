// src/pages/Support/ThinkingIndicator.jsx

import React, { useEffect, useState } from "react";

// Vẽ ngôi sao 8 cánh (tâm ở 0,0)
const STAR_PATH = (() => {
  const points = 8; // 8 cánh
  const outerR = 10; // Bán kính ngoài (đầu cánh sao)
  const innerR = 4; // Bán kính trong (kẽ cánh sao)
  let d = "";
  
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI * i) / points - Math.PI / 2; // Bắt đầu từ đỉnh
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)} `;
  }
  return `${d}Z`;
})();

// Tạo hiệu ứng đuôi thu nhỏ dần (Comet tail)
// Lớp 1: Dài, mờ, nét to
// Lớp 2: Vừa, rõ hơn
// Lớp 3: Ngắn, sáng nhất, nét mảnh
const COMET_LAYERS = [
  { len: 40, opacity: 0.15, width: 3, color: "#1b1c24" },
  { len: 25, opacity: 0.4, width: 2.2, color: "#1b1c24" },
  { len: 12, opacity: 1, width: 1.5, color: "#1b1c24" },
];

export function ThinkingSpinner({ size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-14 -14 28 28" // Mở rộng viewBox để không bị cắt
      fill="none"
      aria-hidden="true"
      className="shrink-0 nxx-star-spin" // Thêm class CSS để quay
      style={{ animation: "spin 1.8s linear infinite" }}
    >
      {/* Nền mờ (ghost) */}
      <path
        d={STAR_PATH}
        pathLength="100"
        stroke="#e5e7eb"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Các lớp đuôi sao chổi */}
      {COMET_LAYERS.map((l, idx) => (
        <path
          key={idx}
          d={STAR_PATH}
          pathLength="100"
          stroke={l.color}
          strokeWidth={l.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            opacity: l.opacity,
            // Hiệu ứng đứt nét tạo hình đuôi
            strokeDasharray: `${l.len} ${100 - l.len}`,
            // Xoay đuôi về phía sau đầu sao
            strokeDashoffset: 0, 
          }}
        />
      ))}

      {/* Thêm CSS nội tuyến cho keyframes xoay */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
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
  
