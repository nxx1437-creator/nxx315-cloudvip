// Tranh pixel vẽ bằng code (không cần ảnh). Mỗi hàm nhận ctx 2D của canvas nhỏ rồi tô từng ô vuông.
export function rngOf(seed) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return (s % 100000) / 100000; };
}
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, t) => { const A = hex(a), B = hex(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join(""); };

function mk(ctx, W, H) {
  const px = (x, y, c) => { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= W || y >= H) return; ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); };
  const rect = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x | 0, y | 0, w | 0, h | 0); };
  // đám lá / tán cây: hình tròn mép lởm chởm, sáng góc trên-trái, tối góc dưới-phải
  const blob = (cx, cy, r, pal, rnd, squash = 1) => {
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
      const d = Math.sqrt(x * x + (y / squash) * (y / squash));
      if (d > r + (rnd() - 0.5) * 2.2) continue;
      const lit = (-x - y) / (r * 1.6) + (rnd() - 0.5) * 0.7;
      const i = lit > 0.45 ? 0 : lit > 0.05 ? 1 : lit > -0.4 ? 2 : 3;
      px(cx + x, cy + y, pal[Math.min(i, pal.length - 1)]);
    }
  };
  return { px, rect, blob };
}

const SKY = ["#1b84e6", "#2a92ea", "#3ea1ee", "#5bb2f1", "#7cc3f4", "#a4d6f7"];
function sky(d, W, H, rnd, until) {
  for (let y = 0; y < until; y++) {
    const k = Math.min(SKY.length - 1, Math.floor((y / until) * SKY.length));
    const k2 = Math.min(SKY.length - 1, k + 1);
    for (let x = 0; x < W; x++) d.px(x, y, ((x + y) & 1) && rnd() < 0.5 ? SKY[k2] : SKY[k]);
  }
}
function cloud(d, cx, cy, w, h, rnd) {
  const pal = ["#ffffff", "#f1f8ff", "#d6e9fb", "#b6d6f5"];
  for (let y = -h; y <= h; y++) for (let x = -w; x <= w; x++) {
    const e = (x * x) / (w * w) + (y * y) / (h * h) + (rnd() - 0.5) * 0.35;
    if (e > 1) continue;
    const lit = -y / h + (rnd() - 0.5) * 0.5;
    d.px(cx + x, cy + y, lit > 0.2 ? pal[0] : lit > -0.3 ? pal[1] : lit > -0.7 ? pal[2] : pal[3]);
  }
}
function maple(d, cx, cy, r, rnd) {
  // cành phong lá đỏ-cam-vàng
  const pals = [["#ffd84a", "#f9a521", "#e0701a", "#b4401a"], ["#ff9a3c", "#e8561c", "#c23a1a", "#8f2418"], ["#ffc83a", "#f08a1e", "#d1561a", "#9c3a18"]];
  for (let i = 0; i < r * 1.4; i++) d.blob(cx + (rnd() - 0.5) * r * 2.2, cy + (rnd() - 0.5) * r * 1.5, 3 + rnd() * 5, pals[(rnd() * 3) | 0], rnd);
}

/* ============ 1. Công viên mùa thu (đầu trang) ============ */
function paintAutumn(ctx, W, H, rnd) {
  const d = mk(ctx, W, H);
  const hz = (H * 0.5) | 0;
  sky(d, W, H, rnd, hz + 8);
  for (let i = 0; i < 6; i++) cloud(d, rnd() * W, 10 + rnd() * hz * 0.5, 14 + rnd() * 20, 2 + rnd() * 3, rnd);
  // toà nhà phía xa
  const cols = ["#4b627f", "#5d7592", "#3d5370", "#6c84a1", "#46607c"];
  let x = -4;
  while (x < W) {
    const w = 9 + ((rnd() * 16) | 0), h = 16 + ((rnd() * (hz * 0.55)) | 0), c = cols[(rnd() * cols.length) | 0];
    d.rect(x, hz - h, w, h + 14, c);
    d.rect(x, hz - h, 1, h + 14, mix(c, "#ffffff", 0.22));
    for (let wy = hz - h + 3; wy < hz; wy += 3) for (let wx = x + 2; wx < x + w - 1; wx += 3) if (rnd() < 0.65) d.px(wx, wy, mix(c, "#cfe6ff", 0.4));
    if (rnd() < 0.3) d.rect(x + (w >> 1), hz - h - 5, 1, 5, c);
    x += w + ((rnd() * 3) | 0);
  }
  // khách sạn mái xanh ở giữa
  const hx = (W * 0.5) | 0;
  d.rect(hx - 22, hz - 16, 44, 22, "#e4e0d2"); d.rect(hx - 24, hz - 20, 48, 5, "#255a52"); d.rect(hx - 20, hz - 24, 40, 4, "#2f6d62");
  for (let wx = hx - 20; wx < hx + 20; wx += 4) { d.rect(wx, hz - 12, 2, 4, "#7d8aa0"); d.rect(wx, hz - 5, 2, 4, "#7d8aa0"); }
  // nền tối sau hàng cây (không để lộ khoảng trắng)
  d.rect(0, hz + 6, W, (H * 0.3) | 0, "#8a4a1c");
  for (let i = 0; i < 160; i++) d.blob(rnd() * W, hz + 10 + rnd() * 26, 4 + rnd() * 6, [["#e8a233", "#c2631a", "#8f3a14", "#6a2a12"], ["#b7a83a", "#7e7a22", "#5a5a1c", "#3c3d14"]][rnd() < 0.7 ? 0 : 1], rnd, 0.9);
  // hàng cây xa
  for (let i = 0; i < 46; i++) { const p = [["#ffd45a", "#f3a22a", "#d5701f", "#a3481a"], ["#f6a53a", "#e1651d", "#b9401a", "#82261a"], ["#c9c244", "#a39a2e", "#7e7a22", "#5a5a1c"]][(rnd() * 3) | 0]; d.blob(rnd() * W, hz + 4 + rnd() * 14, 5 + rnd() * 7, p, rnd, 0.9); }
  // mặt hồ
  const py = hz + 18, ph = (H * 0.15) | 0, px0 = (W * 0.28) | 0, pw = (W * 0.46) | 0;
  for (let y = 0; y < ph; y++) for (let xx = 0; xx < pw; xx++) {
    const edge = Math.min(xx, pw - xx, y * 2.2, (ph - y) * 3);
    if (edge < 1 + rnd() * 3) continue;
    const base = y < ph * 0.4 ? "#7cc3f0" : y < ph * 0.7 ? "#4aa0dd" : "#2f7fc0";
    d.px(px0 + xx, py + y, (y % 3 === 0 && rnd() < 0.5) ? mix(base, "#ffc860", 0.55) : base);
  }
  // mặt đất lá rụng
  const gy = py + ph - 2;
  const ground = ["#e8a233", "#d6821f", "#c2631a", "#a94d17", "#f1b844"];
  const cell = []; for (let i = 0; i < 4000; i++) cell.push(rnd());
  for (let y = gy; y < H; y++) for (let xx = 0; xx < W; xx++) {
    const n = cell[((xx / 5) | 0) * 7 + ((y / 3) | 0) * 13 & 4095];
    const base = ground[Math.min(4, (n * 5) | 0)];
    d.px(xx, y, rnd() < 0.18 ? ground[(rnd() * 5) | 0] : base);
  }
  for (let i = 0; i < 520; i++) { const lx = rnd() * W, ly = gy + rnd() * (H - gy); d.rect(lx, ly, 2, 1, rnd() < 0.5 ? "#ffd876" : rnd() < 0.5 ? "#b9431a" : "#7a2c12"); }
  // bờ hồ
  for (let xx = 0; xx < pw; xx++) d.px(px0 + xx, gy - 1 + ((rnd() * 2) | 0), "#f3b64a");
  // hai người ngồi bên hồ
  const mx = (W * 0.47) | 0, my = gy + 9;
  d.rect(mx, my - 6, 4, 6, "#28325a"); d.rect(mx, my - 10, 4, 4, "#d9a27c"); d.rect(mx, my - 11, 4, 2, "#1d1b24"); d.rect(mx + 6, my - 6, 4, 6, "#7a2e3c"); d.rect(mx + 6, my - 10, 4, 4, "#c98d68"); d.rect(mx + 6, my - 11, 4, 2, "#2a1a14");
  // tán phong lớn ở hai góc trên
  maple(d, 8, 12, 22, rnd); maple(d, W - 10, 8, 26, rnd);
  // cành tối
  for (let i = 0; i < 70; i++) { d.px(i * 0.62, 10 + i * 0.18 + Math.sin(i * 0.4) * 1.5, "#3a1f12"); d.px(W - i * 0.55, 6 + i * 0.2, "#3a1f12"); }
  // bụi cây góc dưới
  for (let i = 0; i < 18; i++) d.blob(W - 4 - rnd() * 30, H - 4 - rnd() * 14, 4 + rnd() * 5, ["#78b14a", "#4e8a32", "#32661f", "#1e4313"], rnd, 0.8);
  for (let i = 0; i < 22; i++) d.blob(rnd() * 24, H - 2 - rnd() * 12, 4 + rnd() * 5, ["#b7c84a", "#7ea23a", "#4a7a24", "#2d5416"], rnd, 0.8);
}

/* ============ 2. Đại lộ xanh lúc nắng lên (cuối trang) ============ */
function paintAvenue(ctx, W, H, rnd) {
  const d = mk(ctx, W, H);
  const cx = (W * 0.5) | 0, hz = (H * 0.46) | 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dist = Math.hypot((x - cx) / (W * 0.42), (y - hz) / (H * 0.7));
    const t = Math.min(1, dist);
    const c = t < 0.18 ? "#f4f6b0" : t < 0.32 ? "#bfe29a" : t < 0.5 ? "#4fae7a" : t < 0.7 ? "#1f7a68" : t < 0.88 ? "#12504f" : "#0a2d33";
    d.px(x, y, ((x + y) & 1) && rnd() < 0.3 ? "#2b9a86" : c);
  }
  // toà nhà mờ ở phía xa
  for (let i = 0; i < 8; i++) { const bx = cx - 40 + rnd() * 80, bh = 18 + rnd() * 30; d.rect(bx, hz - bh, 6 + rnd() * 6, bh, mix("#5fb89a", "#c9eeb0", rnd() * 0.35)); }
  // khối tán cây hai bên (tối ở mép, sáng dần về giữa)
  for (const side of [-1, 1]) for (let i = 0; i < 90; i++) {
    const k = rnd(), x = side < 0 ? k * k * W * 0.42 : W - k * k * W * 0.42, y = rnd() * hz * 1.15, edge = Math.abs(x - cx) / (W * 0.5);
    const pal = edge > 0.7 ? ["#1d7a5e", "#0f5648", "#0a3b38", "#06262a"] : ["#7fcf74", "#3f9a5a", "#1f6f50", "#0f4a45"];
    d.blob(x, y, 5 + rnd() * 9, pal, rnd);
  }
  // lối đi sáng
  for (let y = hz + 2; y < H; y++) { const t = (y - hz) / (H - hz), half = 2 + t * W * 0.34; for (let x = cx - half; x < cx + half; x++) d.px(x, y, mix("#f6f8b4", "#bcd77a", t * 0.8 + (rnd() - 0.5) * 0.12)); }
  for (const side of [-1, 1]) for (let y = hz + 2; y < H; y++) { const t = (y - hz) / (H - hz), half = 2 + t * W * 0.34; for (let k = 0; k < 5 + t * 14; k++) d.px(cx + side * (half + k), y, mix("#79c668", "#2e7d3e", Math.min(1, k / 18) + (rnd() - 0.5) * 0.2)); }
  // cột đèn, người đi bộ, chó
  for (const [lx, h] of [[cx - 56, 26], [cx + 58, 26], [cx - 22, 14], [cx + 24, 14]]) { d.rect(lx, hz + 12 - h * 0.5, 1, h, "#0b2a2a"); d.rect(lx - 1, hz + 10 - h * 0.5, 3, 3, "#fff6c8"); }
  const ppl = [[cx - 30, "#d96b3c"], [cx + 8, "#e4a13a"], [cx + 34, "#c8512e"], [cx - 8, "#3a5fb0"]];
  ppl.forEach(([x, c], i) => { const y = hz + 20 + i * 5, s = 1 + i * 0.4; d.rect(x, y - 6 * s, 2 * s, 5 * s, c); d.rect(x, y - 8 * s, 2 * s, 2 * s, "#d8a07a"); d.rect(x, y - s, 2 * s, 2 * s, "#2a2f4a"); });
  d.rect(cx + 44, hz + 38, 8, 4, "#15161c"); d.rect(cx + 51, hz + 36, 3, 3, "#15161c");
  // bóng tối chân khung
  for (let y = (H * 0.85) | 0; y < H; y++) for (let x = 0; x < W; x++) if (rnd() < (y - H * 0.85) / (H * 0.15)) d.px(x, y, "#041c20");
}

/* ============ 3. Trời xanh + hướng dương (khung lời mời) ============ */
function sunflower(d, x, y, r, rnd, H) {
  // thân + lá mọc từ đáy khung
  for (let yy = y + r; yy < H; yy++) { const sx = x + Math.sin(yy * 0.12) * 1.2; d.px(sx, yy, "#3d7a24"); d.px(sx + 1, yy, "#2c6a1c"); d.px(sx - 1, yy, "#5a9a2a"); }
  for (const s of [-1, 1]) { const ly = y + r * 2.1 + (s > 0 ? 4 : 12); for (let i = 0; i < r * 1.8; i++) for (let j = -3; j <= 3; j++) { const t = i / (r * 1.8), w = Math.sin(t * Math.PI) * (r * 0.32 + 1); if (Math.abs(j) > w) continue; d.px(x + s * (i + 2), ly - i * 0.4 + j, j < -1 ? "#8cc43a" : j < 1 ? "#5f9e2a" : "#336f1e"); } }
  // cánh: 18 cánh, mỗi cánh dày 2-3 ô
  for (let a = 0; a < 18; a++) { const ang = (a / 18) * Math.PI * 2; for (let k = r * 0.5; k < r * 1.32; k += 0.5) for (let w = -1; w <= 1; w++) { const aa = ang + w * 0.09 * (1.4 - k / (r * 1.4)); d.px(x + Math.cos(aa) * k, y + Math.sin(aa) * k, k > r * 1.12 ? "#ffd23a" : (a % 2 ? "#ffbe1f" : "#f59e14")); } }
  for (let yy = -r * 0.62; yy <= r * 0.62; yy++) for (let xx = -r * 0.62; xx <= r * 0.62; xx++) if (xx * xx + yy * yy < r * r * 0.38) { const dd = Math.hypot(xx, yy) / (r * 0.62); d.px(x + xx, y + yy, dd > 0.78 ? "#b9701c" : (rnd() < 0.5 ? "#6b3a14" : "#4a2810")); }
}
function paintSunflowers(ctx, W, H, rnd) {
  const d = mk(ctx, W, H);
  sky(d, W, H, rnd, H);
  for (let i = 0; i < 9; i++) cloud(d, rnd() * W, H * 0.25 + rnd() * H * 0.5, 16 + rnd() * 24, 4 + rnd() * 6, rnd);
  sunflower(d, W * 0.86, H * 0.5, 22, rnd, H); sunflower(d, W * 0.6, H * 0.68, 14, rnd, H); sunflower(d, W * 0.4, H * 0.82, 9, rnd, H);
  for (let i = 0; i < 70; i++) d.blob(W * 0.3 + rnd() * W * 0.75, H - 2 - rnd() * 10, 5 + rnd() * 8, ["#6fb23a", "#3f8a2a", "#276b22", "#154a1a"], rnd, 0.7);
}

/* ============ 4. Trang bìa nhỏ: trời + mây + lá ở hai góc ============ */
function paintCover(ctx, W, H, rnd) {
  const d = mk(ctx, W, H);
  sky(d, W, H, rnd, H);
  for (let i = 0; i < 4; i++) cloud(d, rnd() * W, H * 0.2 + rnd() * H * 0.6, 8 + rnd() * 12, 3 + rnd() * 3, rnd);
  for (let i = 0; i < 14; i++) d.blob(W - 2 - rnd() * 22, rnd() * 18, 3 + rnd() * 5, ["#8fd05a", "#4ea23a", "#2d7a2a", "#175020"], rnd);
  for (let i = 0; i < 16; i++) d.blob(rnd() * 24, H - 2 - rnd() * 14, 4 + rnd() * 6, ["#8fd05a", "#4ea23a", "#2d7a2a", "#175020"], rnd);
}

/* ============ 5. Cây hoa cúc vàng (mẫu vật pixel) ============ */
function paintFlower(ctx, W, H, rnd) {
  const d = mk(ctx, W, H);
  const cx = (W / 2) | 0, hy = (H * 0.27) | 0, R = (W * 0.36) | 0;
  // thân
  for (let y = hy + R - 2; y < H - 2; y++) { d.px(cx, y, "#6a8a1c"); d.px(cx + 1, y, "#4d6b12"); d.px(cx - 1, y, "#8aa828"); }
  // lá
  for (const [sx, sy, dir, len] of [[cx, H * 0.62, 1, R * 1.1], [cx, H * 0.74, -1, R * 0.9]]) for (let i = 0; i < len; i++) for (let j = -3; j <= 3; j++) { const t = i / len, w = Math.sin(t * Math.PI) * 4.2; if (Math.abs(j) > w) continue; d.px(sx + dir * (i + 2), sy - i * 0.35 + j, j < -1 ? "#9ec23a" : j < 1 ? "#6e9a24" : "#46701a"); }
  // đầu hoa: cánh xếp xuyên tâm, sáng ở trên, đậm + chút đỏ ở dưới
  for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) {
    const dd = Math.hypot(x, y * 0.92), ang = Math.atan2(y, x);
    const edge = R * (0.86 + 0.14 * Math.cos(ang * 11));
    if (dd > edge + (rnd() - 0.5) * 1.4) continue;
    const ring = Math.floor((dd / R) * 5);
    const petal = Math.cos(ang * 11) > 0.1 ? 0.12 : -0.12;
    const lit = (-y / R) * 0.7 + (-x / R) * 0.25 + petal - ring * 0.05 + (rnd() - 0.5) * 0.25;
    d.px(cx + x, hy + y, lit > 0.5 ? "#fff3a8" : lit > 0.18 ? "#ffe24a" : lit > -0.12 ? "#f6c52c" : lit > -0.4 ? "#dd9b20" : "#bb5a1c");
  }
}

export const PAINTERS = {
  autumn: { w: 240, h: 150, fn: paintAutumn },
  avenue: { w: 240, h: 110, fn: paintAvenue },
  sunflowers: { w: 200, h: 150, fn: paintSunflowers },
  cover: { w: 120, h: 84, fn: paintCover },
  flower: { w: 60, h: 90, fn: paintFlower },
};
export function paint(kind, ctx, seed = 7) {
  const p = PAINTERS[kind];
  p.fn(ctx, p.w, p.h, rngOf(seed));
}

