// src/pages/Support/GlowFrame.jsx

import React, { useEffect, useLayoutEffect, useRef } from "react";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Định nghĩa CSS cho hiệu ứng
const CSS = `
.nxx-glow-wrapper {
  position: relative;
  display: flex;
  border-radius: 9999px;
  overflow: hidden;
  isolation: isolate;
}

.nxx-glow-wrapper[data-on="true"]::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 150%; /* Rộng hơn khung để khi xoay không bị lộ góc */
  aspect-ratio: 1 / 1;
  margin-left: -75%;
  margin-top: -75%;
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
  animation: nxx-rotate-glow 2.5s linear infinite;
  z-index: -1;
}

.nxx-glow-wrapper[data-on="false"]::before {
  display: none;
}

/* Hiệu ứng quầng sáng mờ bên ngoài */
.nxx-glow-wrapper::after {
  content: "";
  position: absolute;
  inset: 2px;
  border-radius: inherit;
  background: #fff;
  z-index: -1;
}

@keyframes nxx-rotate-glow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

export default function GlowFrame({
  active = false,
  radius = "auto",
  className = "",
  children,
}) {
  const rootRef = useRef(null);

  // Lấy border-radius của phần tử con để bo góc cho khớp
  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || radius !== "auto") return;
    const child = root.firstElementChild;
    if (!child) return;
    const r = window.getComputedStyle(child).borderRadius;
    if (r) root.style.borderRadius = r;
  }, [radius]);

  return (
    <>
      <style>{CSS}</style>
      <div
        ref={rootRef}
        className={`nxx-glow-wrapper ${className}`}
        data-on={active ? "true" : "false"}
        style={{
          borderRadius: radius === "auto" ? "9999px" : radius,
          padding: active ? "2px" : "0px", // Tạo viền dày 2px khi active
        }}
      >
        {children}
      </div>
    </>
  );
}

