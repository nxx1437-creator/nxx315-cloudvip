// src/components/cosmetics/Cosmetics.jsx — khung avatar + hiệu ứng hồ sơ (mua bằng xu)
// - useCosmetic(userId): lấy khung/hiệu ứng đang dùng, tự gom nhiều user vào 1 lần gọi RPC
// - CosmeticAvatar: avatar + khung  | CosmeticFrame: chỉ vòng khung (đặt trong khối relative)
// - CosmeticEffect: hiệu ứng nền (đặt trong khối relative + overflow-hidden)
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient.js";
import "./cosmetics.css";

const cache = new Map(); // userId -> hàng cosmetics | null
const pending = new Set();
const subs = new Set();
let timer = null;

function flush() {
  timer = null;
  const ids = [...pending];
  pending.clear();
  for (let i = 0; i < ids.length; i += 200) {
    const chunk = ids.slice(i, i + 200);
    chunk.forEach((id) => cache.set(id, null));
    supabase.rpc("get_user_cosmetics", { p_ids: chunk }).then(({ data }) => {
      (data || []).forEach((r) => cache.set(r.user_id, r));
      subs.forEach((fn) => fn());
    });
  }
}

function request(id) {
  if (!id || cache.has(id) || pending.has(id)) return;
  pending.add(id);
  if (!timer) timer = setTimeout(flush, 30);
}

// gọi sau khi mua / đổi đồ để làm mới ngay
export function refreshCosmetics(id) {
  if (!id) return;
  cache.delete(id);
  request(id);
}

export function useCosmetic(userId) {
  const [, tick] = useState(0);
  useEffect(() => {
    const fn = () => tick((n) => n + 1);
    subs.add(fn);
    return () => subs.delete(fn);
  }, []);
  useEffect(() => {
    request(userId);
  }, [userId]);
  return userId ? cache.get(userId) || null : null;
}

const GLYPH = { snow: "•", hearts: "♥", sparkle: "✦", firefly: "●", confetti: "▮" };
const fileUrl = (f) => supabase.storage.from("game_logos").getPublicUrl(f).data.publicUrl;

// vòng khung — cha phải có position: relative
export function CosmeticFrame({ userId, cosmetic, w = 3 }) {
  const own = useCosmetic(cosmetic ? null : userId);
  const c = cosmetic || own;
  if (c?.frame_image) return <img className="cx-frame-img" src={fileUrl(c.frame_image)} alt="" />;
  if (c?.frame_style) return <span className={`cx-ring cx-f-${c.frame_style}`} style={{ "--w": `${w}px` }} />;
  return null;
}

export function CosmeticAvatar({ src, size = 48, userId, cosmetic, name = "?", className = "" }) {
  const w = Math.max(2.5, Math.round(size * 0.07 * 10) / 10);
  return (
    <span className={`cx-avatar ${className}`} style={{ width: size, height: size }}>
      {src ? (
        <img className="cx-img" src={src} alt="" />
      ) : (
        <span
          className="cx-img"
          style={{ display: "grid", placeItems: "center", background: "#e0f2fe", color: "#0369a1", fontWeight: 700, fontSize: size * 0.4 }}
        >
          {String(name).slice(0, 1).toUpperCase()}
        </span>
      )}
      <CosmeticFrame userId={userId} cosmetic={cosmetic} w={w} />
    </span>
  );
}

export function CosmeticEffect({ userId, cosmetic, count = 14 }) {
  const own = useCosmetic(cosmetic ? null : userId);
  const c = cosmetic || own;
  if (!c?.effect_style && !c?.effect_image) return null;
  if (c.effect_image) {
    return (
      <div className="cx-fx">
        <img className="cx-fx-img" src={fileUrl(c.effect_image)} alt="" />
      </div>
    );
  }
  const t = c.effect_style;
  if (t === "aurora") return <div className="cx-fx cx-e-aurora" />;
  const items = Array.from({ length: count }, (_, i) => ({
    x: `${(i * 37 + 11) % 96}%`,
    y: `${(i * 53 + 7) % 90}%`,
    s: `${8 + ((i * 7) % 10)}px`,
    d: `${4 + ((i * 5) % 6)}s`,
    dl: `${-((i * 3) % 7)}s`,
  }));
  return (
    <div className={`cx-fx cx-e-${t}`}>
      {items.map((p, i) => (
        <span key={i} className="cx-p" style={{ "--x": p.x, "--y": p.y, "--s": p.s, "--d": p.d, "--dl": p.dl }}>
          {GLYPH[t] || "•"}
        </span>
      ))}
    </div>
  );
}
