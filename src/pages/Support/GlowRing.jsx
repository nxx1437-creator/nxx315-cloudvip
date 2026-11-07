// src/pages/Support/GlowRing.jsx
// Viền sáng quét quanh ô nhập. Đặt BÊN TRONG một phần tử có `relative` và bo tròn
// (viền kế thừa border-radius của cha).
//  - active:   lặp liên tục khi AI đang xử lý
//  - pulseKey: mỗi lần đổi giá trị (và không active) sẽ quét thêm đúng 1 lần
import React from "react";

export default function GlowRing({ active, pulseKey = 0 }) {
  if (active) {
    return (
      <>
        <span className="glow-halo glow-halo--loop" aria-hidden="true" />
        <span className="glow-ring glow-ring--loop" aria-hidden="true" />
      </>
    );
  }
  if (pulseKey > 0) {
    return (
      <>
        <span
          key={`h-${pulseKey}`}
          className="glow-halo glow-halo--once"
          aria-hidden="true"
        />
        <span
          key={`r-${pulseKey}`}
          className="glow-ring glow-ring--once"
          aria-hidden="true"
        />
      </>
    );
  }
  return null;
}
