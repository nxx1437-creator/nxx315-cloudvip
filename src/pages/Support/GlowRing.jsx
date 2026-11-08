// src/pages/Support/GlowRing.jsx
// Viền sáng quét quanh ô nhập khi AI đang suy nghĩ / trả lời.
// Đặt BÊN TRONG <div className="nxx-composer is-busy"> ... </div>
// (class is-busy bật khi AI đang bận; hết bận thì viền tự tắt)
import React from "react";

export default function GlowRing() {
  return <span className="nxx-glow" aria-hidden="true" />;
}
