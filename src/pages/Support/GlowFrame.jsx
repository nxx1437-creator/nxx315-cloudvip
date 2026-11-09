// src/pages/Support/GlowFrame.jsx
//
// Viền sáng quanh khung nhập khi `active` = true (AI đang trả lời):
// một vệt màu pastel ngắn chạy đều quanh khung.
// Khung bọc có nền là vệt màu, chỉ lộ ra ở đường viền 2px quanh ô nhập
// nên không có lớp nào đè lên ô nhập.
//
//   <GlowFrame active={busy}>
//     <div className="nxx-composer">...</div>
//   </GlowFrame>

import React, { useEffect, useLayoutEffect, useRef } from "react";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const CYCLE = 3.2; // giây / một vòng quanh khung
const ARC = 140; // độ dài vệt sáng (độ), nhỏ hơn thì vệt ngắn hơn

const at = (p) => `${(ARC * p).toFixed(1)}deg`;

const GRADIENT = `conic-gradient(from calc(var(--tail) * 1deg),
  rgba(125, 211, 252, 0) 0deg,
  #7dd3fc ${at(0.2)},
  #a5b4fc ${at(0.45)},
  #d8b4fe ${at(0.7)},
  #f9a8d4 ${at(0.9)},
  rgba(249, 168, 212, 0) ${at(1)},
  rgba(249, 168, 212, 0) 360deg)`;

const CSS = `
.nxx-gframe[data-on="true"] {
  background: ${GRADIENT};
  box-shadow: 0 0 14px rgba(167, 139, 250, 0.16);
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

    // Cố ý KHÔNG tôn trọng "giảm chuyển động": máy bật tiết kiệm pin
    // sẽ làm viền đứng im, trong khi đây là hiệu ứng báo AI đang trả lời.
    let raf = 0;
    let t0 = null;
    const tick = (now) => {
      if (t0 === null) t0 = now;
      const deg = (((now - t0) / 1000 / CYCLE) * 360) % 360;
      root.style.setProperty("--tail", deg.toFixed(1));
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
      style={{ padding: 2, margin: -2, "--tail": 0 }}
    >
      {children}
      <style>{CSS}</style>
    </div>
  );
}
