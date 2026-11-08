// src/pages/Support/GradientHeadline.jsx
// Tiêu đề serif đổi chữ: chữ cũ tan dần từ trái sang phải, chữ mới hiện ra
// trong dải màu gradient rồi ngả về màu mực.

import React, { useEffect, useState } from "react";

export default function GradientHeadline({ phrases, interval = 4200 }) {
  const [s, setS] = useState({ cur: 0, prev: null, tick: 0 });

  useEffect(() => {
    if (!phrases || phrases.length < 2) return undefined;
    const id = setInterval(() => {
      setS((p) => ({
        cur: (p.cur + 1) % phrases.length,
        prev: p.cur,
        tick: p.tick + 1,
      }));
    }, interval);
    return () => clearInterval(id);
  }, [phrases, interval]);

  useEffect(() => {
    if (s.prev === null) return undefined;
    const t = setTimeout(() => setS((p) => ({ ...p, prev: null })), 1000);
    return () => clearTimeout(t);
  }, [s.tick, s.prev]);

  return (
    <h2
      className="nxx-serif nxx-hl-stack min-h-[2.3em] text-center text-[34px] font-normal leading-[1.14] tracking-[-0.01em] text-[#13141a]"
      aria-label={phrases[s.cur]}
    >
      {s.prev !== null && (
        <span key={`o${s.tick}`} className="nxx-hl nxx-hl--out" aria-hidden="true">
          {phrases[s.prev]}
        </span>
      )}
      <span
        key={`i${s.tick}`}
        className={`nxx-hl ${s.tick > 0 ? "nxx-hl--in" : ""}`}
        aria-hidden="true"
      >
        {phrases[s.cur]}
      </span>
    </h2>
  );
}
