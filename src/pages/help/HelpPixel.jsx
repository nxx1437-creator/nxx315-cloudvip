// src/pages/help/HelpPixel.jsx — tranh pixel vẽ bằng SVG (dùng khi chưa có ảnh riêng)
import { useMemo } from "react";

const W = 160, H = 90;
const rng = (seed) => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (c1, c2, t) => {
  const a = hex(c1), b = hex(c2);
  return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, "0")).join("");
};
const GREEN = ["#1f6b3a", "#2f8f46", "#58b858", "#3aa655"];
const AUTUMN = ["#e8731f", "#c93a1d", "#f2b134", "#d9541e"];

function build(kind, seed) {
  const r = rng(seed), o = [];
  const pick = (a) => a[Math.floor(r() * a.length)];
  const R = (x, y, w, h, c) => o.push(`<rect x="${x | 0}" y="${y | 0}" width="${(w | 0) || 1}" height="${(h | 0) || 1}" fill="${c}"/>`);
  const sky = (a, b) => { for (let y = 0; y < H; y += 3) R(0, y, W, 3, mix(a, b, y / H)); };
  const clouds = (n, y0 = 4, yr = 26) => {
    for (let i = 0; i < n; i++) {
      const x = r() * 130, y = y0 + r() * yr, w = 12 + r() * 16;
      R(x + 2, y, w - 5, 3, "#fff"); R(x, y + 2, w, 3, "#fff"); R(x + 1, y + 5, w - 2, 1, "#d7ecfb");
    }
  };
  const leaves = (cx, cy, sx, sy, n, cols) => {
    for (let i = 0; i < n; i++) {
      const s = 2 + ((r() * 3) | 0);
      R(cx + (r() - 0.5) * sx, cy + (r() - 0.5) * sy, s, s - (r() > 0.5 ? 1 : 0), pick(cols));
    }
  };
  const flower = (cx, cy, rad) => {
    R(cx - 1, cy + rad, 2, H - cy - rad, "#2f8f46");
    R(cx - 7, cy + rad + 8, 6, 2, "#3aa655"); R(cx + 1, cy + rad + 15, 7, 2, "#3aa655");
    for (let a = 0; a < 16; a++) {
      const g = (a / 16) * Math.PI * 2;
      R(cx + Math.cos(g) * rad * 0.95 - 1, cy + Math.sin(g) * rad * 0.95 - 1, 3, 3, a % 2 ? "#f6c326" : "#f2a516");
    }
    R(cx - rad * 0.55, cy - rad * 0.55, rad * 1.1, rad * 1.1, "#6b3d1b");
    R(cx - rad * 0.25, cy - rad * 0.25, rad * 0.5, rad * 0.5, "#4a2a12");
  };

  if (kind === "dawn") {
    sky("#1779d0", "#9ad0f2"); clouds(3);
    for (let i = 0; i < 9; i++) {
      const x = 14 + i * 14 + r() * 4, w = 9 + r() * 6, h = 22 + r() * 34;
      R(x, 62 - h, w, h, pick(["#8da2b6", "#a7b8c8", "#7b8fa4"]));
      for (let k = 0; k < 5; k++) R(x + 1 + r() * (w - 3), 62 - h + 3 + r() * (h - 6), 1, 2, "#dbe6ee");
    }
    R(0, 62, W, 28, "#d19a2e"); R(28, 70, 104, 12, "#3f95b8");
    for (let i = 0; i < 18; i++) R(30 + r() * 98, 71 + r() * 10, 5, 1, pick(["#e8731f", "#9ad0f2"]));
    R(64, 72, 2, 3, "#2c2c2c"); R(68, 72, 2, 3, "#2c2c2c");
    leaves(14, 10, 44, 34, 80, AUTUMN); leaves(148, 10, 44, 34, 80, AUTUMN);
    leaves(80, 87, 170, 8, 70, ["#a8461a", "#d9a233", "#7a2e12"]); R(0, 88, W, 2, "#4a1f0e");
  } else if (kind === "flowers") {
    sky("#0081c0", "#5fb8e4"); clouds(4, 48, 14);
    flower(122, 46, 13); flower(146, 62, 9); flower(98, 66, 8); flower(64, 76, 7); flower(24, 82, 6);
    leaves(80, 88, 170, 8, 70, GREEN);
  } else if (kind === "avenue") {
    R(0, 0, W, H, "#0b3333");
    for (let i = 0; i <= 14; i++) {
      const w = 150 - i * 9, h = 84 - i * 5;
      R(80 - w / 2, 40 - h / 2, w, h, mix("#0e3d3a", "#fbe9a6", i / 14));
    }
    leaves(12, 40, 34, 90, 170, ["#0a2a26", "#0f4a3a", "#145a3c", "#0b3a2e"]);
    leaves(148, 40, 34, 90, 170, ["#0a2a26", "#0f4a3a", "#145a3c", "#0b3a2e"]);
    for (let y = 50; y < H; y++) { const hw = 2 + (y - 50) * 1.4; R(80 - hw, y, hw * 2, 1, mix("#f6e3a0", "#e7c97a", (y - 50) / 40)); }
    R(62, 70, 2, 4, "#e8a33d"); R(66, 71, 2, 3, "#d9541e"); R(96, 72, 2, 4, "#2c7fb8"); R(99, 75, 3, 2, "#6b3d1b");
  } else {
    sky("#1d86d8", "#8fcdf2"); clouds(4);
    leaves(8, 84, 26, 18, 30, GREEN); leaves(152, 84, 26, 18, 30, GREEN);
  }
  return o.join("");
}

export function PixelScene({ kind = "cover", seed = 1, className = "", style }) {
  const html = useMemo(() => build(kind, seed), [kind, seed]);
  return (
    <svg className={className} style={style} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice"
      shapeRendering="crispEdges" aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />
  );
}

export function PixelFlower({ className = "" }) {
  const html = useMemo(() => {
    const o = [], R = (x, y, w, h, c) => o.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`);
    for (let dy = -18; dy <= 18; dy += 2) for (let dx = -18; dx <= 18; dx += 2) {
      const d = Math.hypot(dx, dy);
      if (d > 18) continue;
      R(30 + dx, 24 + dy, 2, 2, d < 6 ? "#b8741a" : d < 12 ? ((dx + dy) % 4 ? "#f6c326" : "#f2a516") : (dx % 4 ? "#fbe9a6" : "#f6c326"));
    }
    for (let x = 18; x < 42; x += 2) R(x, 44, 2, 2, x % 4 ? "#b8741a" : "#8f5a14");
    R(29, 46, 3, 44, "#4f9a3a");
    for (let i = 0; i < 8; i++) { R(14 + i * 2, 66 - i * 2, 3, 2, "#6bb544"); R(33 + i * 2, 74 - i * 2, 3, 2, "#6bb544"); }
    return o.join("");
  }, []);
  return <svg className={className} viewBox="0 0 60 90" shapeRendering="crispEdges" aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />;
      }
                                             
