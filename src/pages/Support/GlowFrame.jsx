// src/pages/Support/GlowFrame.jsx

import React, { useEffect, useLayoutEffect, useRef } from "react";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// CSS tạo hiệu ứng viền sáng chạy vòng quanh
const CSS = `
@keyframes nxx-spin-glow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.nxx-glow-container {
  position: relative;
  border-radius: 30px; /* Khớp với khung composer */
}

/* Lớp viền phát sáng */
.nxx-glow-container::before {
  content: "";
  position: absolute;
  inset: -2px; /* Viền dày 2px */
  border-radius: inherit;
  padding: 2px; /* Độ dày của dải màu */
  background: conic-gradient(
    from 0deg,
    rgba(26, 167, 255, 0) 0deg,
    #8fd6ff 45deg,
    #1aa7ff 90deg,
    #ffc857 135deg,
    #ff7a1a 180deg,
    #ff3d1f 225deg,
    #f26bff 270deg,
    rgba(242, 107, 255, 0) 315deg,
    rgba(242, 107, 255, 0) 360deg
  );
  animation: nxx-spin-glow 2.5s linear infinite;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  /* Mặt nạ để chỉ hiện phần viền, khoét lõi giữa */
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  
  z-index: 0;
  pointer-events: none;
}

.nxx-glow-container[data-on="true"]::before {
  opacity: 1;
}

/* Lớp nền trắng bên trong để che viền */
.nxx-glow-container > * {
  position: relative;
  z-index: 1;
  border-radius: inherit;
}
`;

export default function GlowFrame({
  active = false,
  className = "",
  children,
}) {
  return (
    <>
      <style>{CSS}</style>
      <div
        className={`nxx-glow-container ${className}`}
        data-on={active ? "true" : "false"}
      >
        {children}
      </div>
    </>
  );
}

