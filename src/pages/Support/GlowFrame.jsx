// src/pages/Support/GlowFrame.jsx
//
// Viền màu chạy quanh khung (kiểu video mẫu): một dải màu xanh – vàng – cam – hồng
// chạy theo chiều kim đồng hồ, dài ra gần kín viền rồi thu lại và tắt, lặp lại
// trong lúc `active` = true. Có thêm quầng sáng mờ bám theo viền.
//
// Cách dùng (bọc ngoài khung nhập, bán kính bo phải khớp với khung bên trong):
//
//   <GlowFrame active={busy}>
//     <div className="nxx-composer">...</div>
//   </GlowFrame>
//
// Mặc định (radius="auto") viền tự lấy độ bo góc của phần tử con đầu tiên,
// nên không cần khai báo lại. Muốn ép cố định thì truyền radius="28px".

import React, { useEffect, useLayoutEffect, useRef } from "react";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* ------------------------------------------------------------------ */
/*  Cấu hình hiệu ứng (đo theo video mẫu)                              */
/* ------------------------------------------------------------------ */
const CYCLE = 3.4; // giây / một lượt (dải chạy ra rồi tắt)
const START = 200; // độ: điểm xuất phát, 0 = đỉnh, 90 = bên phải, 180 = đáy
const SWEEP = 340; // độ: đầu dải chạy được bao nhiêu độ trong một lượt

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ease = (x) => {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

// u: 0 → 1 trong một lượt. Trả về góc đuôi và độ dài dải (độ).
// Đầu dải chạy trước, đuôi xuất phát muộn hơn rồi đuổi kịp đầu → dải tắt hẳn.
export function glowAt(u) {
  const head = START + SWEEP * ease(u / 0.4);
  const tail = START + SWEEP * ease((u - 0.3) / 0.35);
  return { tail, len: Math.max(0, head - tail) };
}

// --tail / --len là số độ (không đơn vị) được cập nhật mỗi khung hình.
// Mỗi mốc màu tính theo % độ dài dải nên màu luôn đi cùng với dải.
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
.nxx-glow { position: relative; }
.nxx-glow__ring,
.nxx-glow__halo {
  position: absolute;
  pointer-events: none;
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.3s ease;
  background: ${GRADIENT};
  /* chỉ giữ lại phần viền (đục lõi giữa) */
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
}
.nxx-glow__ring { inset: -1px; padding: 2px; z-index: 2; }
.nxx-glow__halo { inset: -4px; padding: 6px; filter: blur(9px); z-index: 1; }
.nxx-glow[data-on="true"] .nxx-glow__ring { opacity: 1; }
.nxx-glow[data-on="true"] .nxx-glow__halo { opacity: 0.55; }
`;

export default function GlowFrame({
  active = false,
  radius = "auto",
  className = "",
  children,
}) {
  const rootRef = useRef(null);

  // radius="auto": lấy border-radius của phần tử con (khung nhập) cho viền khớp hẳn
  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || radius !== "auto") return;
    const child = root.firstElementChild;
    if (!child) return;
    const r = window.getComputedStyle(child).borderRadius;
    if (r) root.style.borderRadius = r;
  }, [radius]);

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
      const u = (((now - t0) / 1000) / CYCLE) % 1;
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
      className={`nxx-glow ${className}`}
      data-on={active ? "true" : "false"}
      style={{
        borderRadius: radius === "auto" ? "9999px" : radius,
        "--tail": 0,
        "--len": 0,
      }}
    >
      {children}
      <span className="nxx-glow__halo" aria-hidden="true" />
      <span className="nxx-glow__ring" aria-hidden="true" />
      <style>{CSS}</style>
    </div>
  );
}

