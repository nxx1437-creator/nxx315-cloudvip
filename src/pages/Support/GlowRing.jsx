// src/pages/Support/GlowRing.jsx
// Viền sáng quay quanh ô nhập. Đặt BÊN TRONG phần tử có class "nxx-composer".
// Chỉ quay khi ô nhập đang focus hoặc đang bận (is-busy), điều khiển bằng CSS.
import React from "react";

export default function GlowRing() {
  return (
    <span className="nxx-glow" aria-hidden="true">
      <span className="nxx-glow-ring">
        <i className="nxx-glow-rot" />
      </span>
      <span className="nxx-glow-halo">
        <i className="nxx-glow-rot" />
      </span>
    </span>
  );
}
