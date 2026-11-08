// src/pages/Support/ThinkingIndicator.jsx

import React, { useEffect, useMemo, useRef, useState } from "react";

let maskCounter = 0; // id mask riêng cho từng spinner

// Ngôi sao 4 cánh (cạnh lõm, 4 mũi hướng lên / phải / xuống / trái)
const SPIN_PATH = (() => {
  const R = 10.5; // bán kính tới đầu mũi
  const P = 2.6; // 3 = sao nhọn mảnh (astroid), nhỏ hơn thì cánh đầy hơn
  const N = 160;
  const pw = (v) => Math.sign(v) * Math.abs(v) ** P;
  let d = "";
  for (let i = 0; i <= N; i++) {
    const t = (2 * Math.PI * i) / N - Math.PI / 2; // bắt đầu từ mũi trên
    const x = R * pw(Math.cos(t));
    const y = R * pw(Math.sin(t));
    d += `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)} `;
  }
  return `${d}Z`;
})();

/* ------------------------------------------------------------------ */
/*  Cấu hình hiệu ứng (đo theo video mẫu)                              */
/* ------------------------------------------------------------------ */
const DURATION = 2.2; // giây / vòng: đầu sao chổi chạy hết 1 vòng
const SEGMENTS = 40; // số đoạn chia đuôi (càng nhiều càng mượt)
const TAIL_MIN = 40; // đuôi ngắn nhất (% độ dài đường)
const TAIL_MAX = 68; // đuôi dài nhất (% độ dài đường)
const STROKE = 1.5;
const COLOR = "#13141a"; // màu đầu sao chổi
const OVERLAP = 0.3; // các đoạn chồng nhẹ để không hở khe

// Đuôi được vẽ vào một <mask>: trắng = hiện rõ (đầu), đen = trong suốt (cuối đuôi).
// Các đoạn trong mask là màu đặc nên chồng lên nhau không bị sậm / vằn như dùng opacity.
const SEG_GRAY = Array.from({ length: SEGMENTS }, (_, i) => {
  const v = Math.round(255 * Math.pow(1 - i / (SEGMENTS - 1), 1.3));
  return `rgb(${v} ${v} ${v})`;
});

// Vẽ đoạn đuôi trước, đoạn đầu sau cùng để đầu luôn nằm trên
const DRAW_ORDER = Array.from({ length: SEGMENTS }, (_, i) => SEGMENTS - 1 - i);

// Tính dasharray / dashoffset của từng đoạn tại thời điểm `ms`.
// pathLength = 100 nên mọi giá trị là % của đường xoắn.
function layout(ms, duration, breathing) {
  const phase = ((ms / 1000) / duration) % 1;
  const head = phase * 100;
  // đuôi dài ra rồi co lại theo từng vòng, giống video
  const breathe = breathing ? 0.5 - 0.5 * Math.cos(2 * Math.PI * phase) : 0.5;
  const tail = TAIL_MIN + (TAIL_MAX - TAIL_MIN) * breathe;
  const seg = tail / SEGMENTS;

  return Array.from({ length: SEGMENTS }, (_, i) => {
    const start = head - (i + 1) * seg; // đoạn i nằm sau đầu i*seg
    const offset = -(((start % 100) + 100) % 100);
    const len = seg + (i === 0 ? 0 : OVERLAP);
    return { dash: `${len.toFixed(3)} ${(100 - len).toFixed(3)}`, offset };
  });
}

export function ThinkingSpinner({ size = 36 }) {
  const refs = useRef([]);
  const initial = useMemo(() => layout(0, DURATION, true), []);
  const maskId = useMemo(() => `spin-mask-${++maskCounter}`, []);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduce ? DURATION * 2.5 : DURATION;

    let raf = 0;
    let t0 = null;

    const tick = (now) => {
      if (t0 === null) t0 = now;
      const frame = layout(now - t0, duration, !reduce);
      for (let i = 0; i < SEGMENTS; i++) {
        const el = refs.current[i];
        if (!el) continue;
        el.setAttribute("stroke-dasharray", frame[i].dash);
        el.setAttribute("stroke-dashoffset", frame[i].offset.toFixed(3));
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

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
        {/* Mask: nhiều đoạn nhỏ, sáng dần về phía đầu, tối hẳn ở cuối đuôi */}
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x="-13"
          y="-13"
          width="26"
          height="26"
        >
          {DRAW_ORDER.map((i) => (
            <path
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              d={SPIN_PATH}
              pathLength="100"
              stroke={SEG_GRAY[i]}
              strokeWidth={STROKE}
              strokeLinecap={i === 0 ? "round" : "butt"}
              strokeLinejoin="round"
              strokeDasharray={initial[i].dash}
              strokeDashoffset={initial[i].offset.toFixed(3)}
            />
          ))}
        </mask>
      </defs>

      {/* Không còn lớp viền: chỉ hiện phần mask cho qua */}
      <rect
        x="-13"
        y="-13"
        width="26"
        height="26"
        fill={COLOR}
        mask={`url(#${maskId})`}
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

                          

