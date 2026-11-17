// src/pages/help/HelpArt.jsx — tranh pixel vẽ bằng code, nút mũi tên nhỏ, dải sọc ngang
import React, { useEffect, useRef } from "react";
import { PAINTERS, paint } from "./helpPainters.js";

/* Tranh pixel: có link ảnh (src) thì dùng ảnh của bạn, để trống thì tự vẽ bản pixel có sẵn.
   kind: autumn | avenue | sunflowers | cover | flower */
export function PixelArt({ kind, seed = 7, src = "", position = "50% 50%", alt = "", className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    if (src) return;
    const c = ref.current;
    if (!c) return;
    const { w, h } = PAINTERS[kind];
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, w, h);
    paint(kind, ctx, seed);
  }, [kind, seed, src]);

  if (src) {
    return <img src={src} alt={alt} loading="lazy" draggable={false} className={`hw-art ${className}`} style={{ objectPosition: position }} />;
  }
  return (
    <canvas ref={ref} role={alt ? "img" : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true}
      className={`hw-art hw-pixel ${className}`} style={{ objectPosition: position }} />
  );
}

/* Cây hoa pixel đứng một mình cạnh đoạn văn. Có link ảnh (PNG nền trong suốt) thì dùng ảnh. */
export function PixelFlower({ src = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    if (src) return;
    const c = ref.current;
    if (!c) return;
    const { w, h } = PAINTERS.flower;
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, w, h);
    paint("flower", ctx, 21);
  }, [src]);
  if (src) return <img src={src} alt="" loading="lazy" draggable={false} className="hw-flower hw-flower-img" />;
  return <canvas ref={ref} aria-hidden="true" className="hw-flower hw-pixel" />;
}

/* Mũi tên nhỏ trong viên nang 12x16 (như một phím bấm) */
export function Chev({ dark = false, className = "" }) {
  return (
    <span className={`hw-chev ${dark ? "hw-chev-dark" : ""} ${className}`} aria-hidden="true">
      <svg width="6" height="10" viewBox="0 0 6 10" fill="currentColor"><path d="M1 0l5 5-5 5-1-1 4-4-4-4z" /></svg>
    </span>
  );
}

/* Dải sọc ngang: 6px mỗi sọc, cách nhau 2px trắng */
export function Stripes({ kind = "closing" }) {
  return (
    <div className={`hw-stripes hw-stripes-${kind}`} aria-hidden="true">
      {(kind === "dusk" ? [0, 1, 2, 3, 4] : [0, 1, 2]).map((i) => <i key={i} />)}
    </div>
  );
}

/* Biểu tượng mặt trời mọc bằng ô vuông */
export function Mark({ size = 18 }) {
  const r = [[7, 3], [3, 5], [12, 5], [5, 8], [6, 7], [7, 7], [8, 7], [9, 7], [10, 8], [4, 9], [11, 9], [3, 10], [12, 10]];
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" shapeRendering="crispEdges">
      {r.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="1.2" height="1.2" />)}
      <rect x="2" y="12" width="12" height="1.4" />
      <rect x="5" y="9.5" width="6" height="1.4" />
    </svg>
  );
}
