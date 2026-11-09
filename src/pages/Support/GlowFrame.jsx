// src/pages/Support/GlowFrame.jsx
//
// Viền màu chạy quanh khung nhập khi `active` = true (AI đang trả lời).
// Cách làm: khung bọc có nền là dải màu, chỉ lộ ra ở đường viền 2px quanh ô nhập
// (ô nhập có nền đặc nên che phần giữa). Không có lớp phủ nào đè lên ô nhập.
//
//   <GlowFrame active={busy}>
//     <div className="nxx-composer">...</div>
//   </GlowFrame>

import React, { useEffect, useLayoutEffect, useRef } from "react";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const CYCLE = 3.4; // giây / một lượt
const START = 200; // độ: điểm xuất phát (0 = đỉnh, 90 = phải, 180 = đáy)
const SWEEP = 340; // độ: đầu dải chạy được bao nhiêu độ trong một lượt

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ease = (x) => {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

// u: 0 → 1 trong một lượt. Trả về góc đuôi và độ dài dải (độ).
export function glowAt(u) {
  const head = START + SWEEP * ease(u / 0.4);
  const tail = START + SWEEP * ease((u - 0.3) / 0.35);
  return { tail, len: Math.max(0, head - tail) };
}

const stop = (color, p) => `${color} calc(var(--len) * ${p}deg)`;

const GRADIENT = `conic-gradient(from calc(var(--tail) * 1deg),
  rgba(196, 160, 255, 0) 0deg,
  ${stop("#e879f9", 0.12)},
  ${stop("#ff4d1f", 0.32)},
  ${stop("#ff9f1c", 0.5)},
  ${stop("#ffd98a", 0.68)},
  ${stop("#1da1ff", 0.86)},
  ${stop("#1da1ff", 0.96)},
  ${stop("rgba(29, 161, 255, 0)", 1)},
  rgba(29, 161, 255, 0) 360deg)`;

const CSS = `
.nxx-gframe[data-on="true"] {
  background: ${GRADIENT};
  box-shadow: 0 0 20px rgba(29, 161, 255, 0.22);
}
`;

export default function GlowFrame({ active = false, className = "", children }) {
  const rootRef = useRef(null);

  // Lấy độ bo góc của ô nhập (+2px viền) để viền khớp hẳn
  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    const child = root?.firstElementChild;
    if (!root || !child) return;
    const r = parseFloat(window.getComputedStyle(child).borderTopLeftRadius);
    if (!Number.isNaN(r)) root.style.borderRadius = `${r + 2}px`;
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !active) return undefined;

    const apply = (tail, len) => {
      root.style.setProperty("--tail", tail.toFixed(2));
      root.style.setProperty("--len", len.toFixed(2));
    };

    // Người dùng tắt chuyển động: hiện viền kín, đứng yên
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      apply(0, 360);
      return undefined;
    }

    let raf = 0;
    let t0 = null;
    const tick = (now) => {
      if (t0 === null) t0 = now;
      const u = ((now - t0) / 1000 / CYCLE) % 1;
      const g = glowAt(u);
      apply(g.tail, g.len);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return (
    <div
      ref={rootRef}
      className={`nxx-gframe ${className}`}
      data-on={active ? "true" : "false"}
      style={{ padding: 2, margin: -2, "--tail": 0, "--len": 0 }}
    >
      {children}
      <style>{CSS}</style>
    </div>
  );
      }

