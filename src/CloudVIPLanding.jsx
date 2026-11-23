// src/CloudVIPLanding.jsx — phong cách "thiên nhiên + giao diện" (Origin)
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "./lib/supabaseClient.js";
import { SITE } from "./lib/siteInfo.js";
import { useI18n } from "./i18n/index.js";
import useTheme from "./hooks/useTheme.js";
import { COPY, CREATOR_URL } from "./lib/landingData.js";
import { FX } from "./lib/landingFxCopy.js";
import { timeAgo, scrollToId } from "./components/LandingBits.jsx";

const STAR_URL = "https://i.postimg.cc/HLL0BmN7/1ef9365fbb1cd959265e9bf9ba8c45fb.png";
/* Video bầu trời ở hero: hiện nguyên bản, căn giữa, KHÔNG phủ lớp mờ. Nên dùng file 1080p. */
const HERO_VIDEO_URL = "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/Video-hero2.mp4";
/* Ảnh thiên nhiên cho các khung: dán link ảnh (để "" thì dùng nền gradient có ánh sáng dưới đáy). */
const NATURE = {
  flowers: "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/flowers.jpg",
  meadow: "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/meadow.jpg",
  dunes: "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/dunes.jpg",
  closing: "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/Hoa-cuc.jpg",
};
const FALLBACK = {
  sky: "linear-gradient(#1673d1,#5ab0f2 70%,#9fd2f7)",
  flowers: "radial-gradient(70% 55% at 30% 75%,#e9a31a,transparent 70%),radial-gradient(60% 60% at 80% 25%,#7a4b00,transparent 70%),#3a2a05",
  meadow: "radial-gradient(80% 60% at 50% 110%,#7cc043,transparent 70%),linear-gradient(#0e2a12,#2f6a1c)",
  dunes: "radial-gradient(90% 55% at 50% 115%,#d47a3a,transparent 70%),linear-gradient(#5b2f12,#a7612e)",
  closing: "radial-gradient(70% 50% at 30% 70%,rgba(255,255,255,.3),transparent 70%),radial-gradient(60% 50% at 75% 80%,#cc7c01,transparent 70%),linear-gradient(#0a1f0d,#2f6a1c)",
};
const bgOf = (key) => (NATURE[key] ? `url(${NATURE[key]}) center/cover, ${FALLBACK[key]}` : FALLBACK[key]);

const GAMES = ["Free Fire", "Liên Quân", "Play Together", "Valorant", "FC Mobile", "Roblox"];

const EXTRA = {
  vi: {
    brand: "NXX315 Studio",
    mSub: "Dùng ngay trên điện thoại và máy tính, tại nxx315.com.",
    tasks: ["Nhiệm vụ mỗi ngày", "Nhận xu miễn phí hằng ngày hoặc tham gia các sự kiện.", ["Nhiệm vụ hằng ngày", "Nhiệm vụ đối tác", "Sự kiện"], "+ xu"],
    games: ["Nạp game *bằng Coin*", "Dùng Coin nạp thẳng vào các game bạn chơi mỗi ngày."],
    gifts: ["Đổi quà *thật*", "Robux, Quân Huy, Kim Cương và nhiều quà khác. Đơn được kiểm tra trước khi giao.", ["Robux", "Quân Huy", "Kim Cương"]],
    steps: "Các bước", panelRank: "Xếp hạng", panelGames: "Game", ifaceGames: "Game nạp bằng Coin", ifaceGifts: "Quà có thể đổi",
    transparent: "Minh bạch", transparentText: "Biết ai vận hành, xu đến từ đâu, hoàn tiền và khiếu nại thế nào.", aboutLink: "Đọc trang Giới thiệu",
    demo: "Minh họa", rows: ["Video #1", "Video #2", "Video #3"], ok: "Đã duyệt", live: "Trực tiếp",
  },
  en: {
    brand: "NXX315 Studio",
    mSub: "Use it right on your phone or computer, at nxx315.com.",
    tasks: ["Daily tasks", "Earn free coins every day or join events.", ["Daily task", "Partner task", "Event"], "+ coins"],
    games: ["Top up games *with Coins*", "Use Coins to top up the games you play every day."],
    gifts: ["Real *rewards*", "Robux, game currency and more. Orders are checked before delivery.", ["Robux", "Game currency", "More rewards"]],
    steps: "Steps", panelRank: "Leaderboard", panelGames: "Games", ifaceGames: "Games you can top up", ifaceGifts: "Rewards you can redeem",
    transparent: "Transparent", transparentText: "Know who runs it, where coins come from, and how refunds and complaints work.", aboutLink: "Read the About page",
    demo: "Demo", rows: ["Video #1", "Video #2", "Video #3"], ok: "Approved", live: "Live",
  },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&family=Inter:wght@300;400;500&family=Roboto+Mono:wght@400;500&display=swap');
.og{--serif:"Lyondisplay App","Cormorant Garamond",Georgia,serif;--sans:"Inter",Arial,sans-serif;--mono:"Roboto Mono",monospace;background:#050505;color:#fff;font-family:var(--sans);font-weight:300;overflow-x:hidden;min-height:100vh;-webkit-font-smoothing:antialiased}
.og a{color:inherit;text-decoration:none}
.og em{font-style:italic}
.og .serif{font-family:var(--serif);font-weight:300}
.og .wrap{max-width:1280px;margin:0 auto;padding:0 20px}
.og .hero-t{font:300 clamp(44px,9.2vw,96px)/1.15 var(--serif);margin:0;color:#fff;text-shadow:0 2px 24px rgba(8,30,60,.35),0 1px 3px rgba(8,30,60,.25)}
.og .chap{font:300 clamp(40px,7vw,80px)/1 var(--serif);letter-spacing:-.01em;color:#fafafa;margin:0}
.og .small-h{font:300 38px/.9 var(--serif);margin:0;color:#fafafa}
.og .promise{font:300 clamp(32px,4.4vw,48px)/1.15 var(--serif);margin:0;color:#fafafa}
.og .body{font:300 16px/1.5 var(--sans);color:#9b9b9b;margin:0}
.og .cap{font:400 11px/1.4 var(--mono);letter-spacing:.182em;text-transform:uppercase;color:#555}
.og .sec{padding:100px 0}
.og .btn{display:inline-flex;align-items:center;gap:8px;height:48px;padding:0 20px;border:0;border-radius:8px;background:#fff;color:#000;cursor:pointer;font:500 12px/2 var(--mono);letter-spacing:.021em;text-transform:uppercase;transition:background-color .2s}
.og .btn:hover{background:#e6e6e6}
.og .btn2{background:#131313;color:#fff;border:1px solid rgba(255,255,255,.08)}
.og .btn2:hover{background:#222}
.og .btn.sm{height:36px;padding:0 14px}
.og .rise{opacity:0;transform:translate3d(0,18px,0);transition:opacity .6s cubic-bezier(.22,1,.36,1),transform .6s cubic-bezier(.22,1,.36,1)}
.og .rise.in{opacity:1;transform:none}
.og .fin{animation:fin 1s cubic-bezier(.22,1,.36,1) both}
@keyframes fin{from{opacity:0;filter:blur(12px);transform:translate3d(0,8px,0)}to{opacity:1;filter:blur(0);transform:none}}
@keyframes pulse{50%{opacity:.35}}
@keyframes drift{from{transform:translate3d(-3%,0,0) scale(1)}to{transform:translate3d(3%,-2%,0) scale(1.08)}}
.og .dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#61a133;animation:pulse 2s infinite}

/* thanh đầu nổi: cảnh vật nhìn xuyên qua */
.og .nav{position:fixed;top:0;left:0;right:0;z-index:60;display:flex;justify-content:space-between;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 12px) 12px 0;pointer-events:none}
.og .isle{pointer-events:auto;display:flex;align-items:center;gap:2px;height:48px;padding:0 6px;border-radius:12px;background:rgba(8,10,12,.55);border:1px solid rgba(255,255,255,.1)}
.og .isle-l{width:48px;padding:0;justify-content:center;border-radius:999px}
.og .nl{display:none;padding:6px 12px;border:0;background:none;color:#fff;cursor:pointer;white-space:nowrap;font:400 12px/1.5 var(--mono);letter-spacing:.021em;text-transform:uppercase;transition:color .3s}
.og .nl:hover{color:#9b9b9b}
.og .nl-on{display:inline-flex}
.og .brand-t{display:none;font:400 15px/1 var(--sans);padding-right:10px}

/* hero */
.og .hero-sub{max-width:420px;margin:24px auto 0;font:400 16px/1.5 var(--sans);color:#fff;text-shadow:0 1px 14px rgba(0,0,0,.45),0 1px 2px rgba(0,0,0,.3)}
.og .hero{position:relative;overflow:hidden;text-align:center;padding:150px 0 0;background:#2b7fd0}
.og .hero video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 50%}
.og .hero{position:relative;overflow:hidden;text-align:center;padding:150px 0 0;background:#2b7fd0}
.og .hero-in{position:relative;z-index:2}
.og .pill{display:inline-flex;align-items:center;gap:8px;margin-bottom:24px;padding:6px 14px;border-radius:999px;background:rgba(255,255,255,.6);color:#000;font:400 11px/1.4 var(--mono);letter-spacing:.12em;text-transform:uppercase}
.og .pill{display:inline-flex;align-items:center;gap:8px;margin-bottom:24px;padding:6px 14px;border-radius:999px;background:rgba(8,24,44,.35);border:1px solid rgba(255,255,255,.25);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);color:#fff;font:400 11px/1.4 var(--mono);letter-spacing:.12em;text-transform:uppercase}
.og .hero-fade{position:absolute;left:0;right:0;bottom:0;height:90px;z-index:4;background:linear-gradient(rgba(5,5,5,0),#050505);pointer-events:none}

/* điện thoại trong suốt: chỉ có viền, cảnh vật nhìn xuyên màn hình */
.og .phone{--p:.3;position:relative;z-index:3;width:min(630px,calc(100% - 40px));height:470px;margin:56px auto 0;border:10px solid #0b0b0b;border-bottom:0;border-radius:64px 64px 0 0;box-shadow:inset 0 0 0 1px rgba(255,255,255,.14),0 0 0 1px rgba(255,255,255,.1);overflow:hidden;text-align:center;transform:translate3d(0,calc((1 - var(--p)) * 56px),0)}
.og .ph-in{padding:36px 22px 0}
.og .ph-ico{display:inline-flex;width:44px;height:44px;align-items:center;justify-content:center;border-radius:12px;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.3)}
.og .ph-t{font:300 clamp(28px,5vw,40px)/1.12 var(--serif);margin:16px auto 0;max-width:420px}
.og .glass{text-align:left;color:#fff;border-radius:16px;padding:16px 18px;background:linear-gradient(rgba(255,255,255,.2),rgba(255,255,255,.07));border:1px solid rgba(255,255,255,.3)}
.og .glass .cap{color:rgba(255,255,255,.75)}
.og .glass h4{font:300 clamp(22px,4.4vw,28px)/1.1 var(--serif);margin:8px 0 6px}
.og .glass p{font:300 14px/1.4 var(--sans);margin:0;color:rgba(255,255,255,.92)}
.og .g1{max-width:420px;margin:28px auto 0;transform:translate3d(0,calc((1 - var(--p)) * 28px),0)}
.og .g2{max-width:420px;margin:14px auto 0;opacity:calc(.35 + var(--p) * .65);transform:translate3d(calc((1 - var(--p)) * 70px),calc((1 - var(--p)) * 90px),0) rotate(calc((1 - var(--p)) * 9deg - 2deg))}
.og .g2 .r{display:flex;justify-content:space-between;gap:12px;padding:6px 0;font:300 14px/1.3 var(--sans);border-top:1px solid rgba(255,255,255,.2)}
.og .g2 .r:first-of-type{border-top:0}

/* chương tối */
.og .glowline{position:absolute;left:0;right:0;bottom:0;height:240px;pointer-events:none;background:radial-gradient(60% 100% at 50% 100%,rgba(33,159,248,.4),rgba(132,125,255,.16) 50%,transparent 75%)}
.og .seam{position:absolute;left:8%;right:8%;top:0;height:1px;background:linear-gradient(90deg,transparent,#219ff8,#847dff,transparent)}
.og .words{display:flex;flex-wrap:wrap;justify-content:center;gap:12px 40px;font:400 12px/1.5 var(--mono);letter-spacing:.021em;text-transform:uppercase;color:#555}
.og .card{border-radius:24px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);overflow:hidden}
.og .frags{display:grid;gap:24px;grid-template-columns:1fr;margin-top:64px}
.og .frag{display:flex;flex-direction:column;min-height:380px;padding:32px 32px 0}
.og .frag h3{font:300 20px/1.08 var(--sans);letter-spacing:-.01em;margin:12px 0 8px;color:#fff}
.og .frag p{font:300 16px/1.35 var(--sans);letter-spacing:-.01em;margin:0;color:#9b9b9b;max-width:320px}
.og .mini{margin-top:auto;padding-top:28px;display:grid;gap:8px;position:relative;max-height:200px;overflow:hidden}
.og .mini:after{content:"";position:absolute;left:0;right:0;bottom:0;height:50%;background:linear-gradient(rgba(10,10,10,0),#0a0a0a);pointer-events:none}
.og .frag{background:#0a0a0a}
.og .row{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);font:300 14px/1.2 var(--sans);color:#fafafa}
.og .row .r{margin-left:auto;font:400 11px/1.2 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:#9b9b9b;white-space:nowrap}
.og .row .n{width:22px;font:400 12px var(--mono);color:#555}

/* chồng thông báo */
.og .stack{max-width:760px;margin:56px auto 0;display:grid}
.og .noti{display:flex;align-items:center;gap:14px;padding:18px 24px;border-radius:24px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);box-shadow:inset 0 2px 0 -1px rgba(255,255,255,.15);font:300 18px/1.3 var(--sans);color:rgba(255,255,255,.92);margin-top:-12px;transform-origin:50% 0}
.og .noti:first-child{margin-top:0}
.og .noti .t{margin-left:auto;font:300 13px/1 var(--sans);color:#555;white-space:nowrap}
.og .noti .ic{display:flex;width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.08);align-items:center;justify-content:center;flex-shrink:0}

/* cặp thiên nhiên / giao diện */
.og .pair{display:grid;gap:24px;grid-template-columns:1fr;margin-bottom:24px}
.og .nat{position:relative;overflow:hidden;border-radius:24px;min-height:520px;padding:64px 24px 40px;display:flex;flex-direction:column;justify-content:space-between;align-items:center;text-align:center}
.og .nat:before{content:"";position:absolute;inset:0;background:rgba(0,0,0,.2)}
.og .nat-glow{position:absolute;left:50%;bottom:-300px;width:541px;height:541px;margin-left:-270px;opacity:.6;pointer-events:none}
.og .nat-t{position:relative;font:300 clamp(36px,5vw,48px)/1.1 var(--serif);margin:0}
.og .nat-p{position:relative;font:300 20px/1.35 var(--sans);letter-spacing:-.01em;margin:0;max-width:380px;color:rgba(255,255,255,.95)}
.og .iface{min-height:520px;padding:32px;display:flex;flex-direction:column;justify-content:center;gap:10px}
.og .num{font:400 50px/1.1 var(--sans);color:#fff}
.og .num-l{font:300 20px/1.5 var(--sans);color:#9b9b9b}

/* xếp hạng: số liệu phẳng trên nền đen */
.og .stats{display:grid;gap:48px;grid-template-columns:1fr;margin-top:64px;padding-top:32px;border-top:1px solid rgba(255,255,255,.14)}
.og .lrow{display:flex;align-items:center;gap:16px;padding:16px 0;border-bottom:1px solid rgba(255,255,255,.14);font:300 16px/1.3 var(--sans)}

/* tường chứng minh phẳng, không đóng khung */
.og .wall{display:grid;gap:56px 48px;grid-template-columns:1fr;margin-top:72px}
.og .wall .it{font:300 22px/1.3 var(--sans);color:#fafafa;margin:12px 0 8px}

.og .panel{padding:32px}
.og .perks{list-style:none;margin:20px 0 0;padding:0;display:grid;gap:10px}
.og .perks li{display:flex;gap:10px;font:300 16px/1.4 var(--sans);color:#9b9b9b}
.og .perks li:before{content:"";flex-shrink:0;width:4px;height:4px;margin-top:9px;border-radius:50%;background:#fff}

.og .cols{display:grid;gap:48px;grid-template-columns:1fr;margin-top:64px}
.og .cols h3{font:300 20px/1.08 var(--sans);letter-spacing:-.01em;margin:0 0 12px}
.og .cols p{font:300 16px/1.5 var(--sans);color:#9b9b9b;margin:0}
.og details{border-top:1px solid rgba(255,255,255,.14)}
.og details:last-child{border-bottom:1px solid rgba(255,255,255,.14)}
.og summary{cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:16px;padding:20px 0;font:400 16px/1.5 var(--sans)}
.og summary::-webkit-details-marker{display:none}
.og summary:after{content:"+";font:400 18px/1 var(--mono);color:#9b9b9b}
.og details[open] summary:after{content:"−"}
.og details p{margin:0;padding:0 0 20px;font:300 16px/1.5 var(--sans);color:#9b9b9b;max-width:620px}

.og .close{position:relative;overflow:hidden;text-align:center;padding:153px 0 120px}
.og .close-t{font:300 clamp(48px,9vw,96px)/.9 var(--serif);margin:0 auto;max-width:900px}
.og footer{background:#050505;padding:80px 0 40px}
.og .fgrid{display:grid;gap:48px 24px;grid-template-columns:1fr 1fr}
.og .fbrand{grid-column:1/-1}
.og .fh{font:400 14px/1.41 var(--sans);color:#fff;margin:0 0 12px}
.og .fl{list-style:none;margin:0;padding:0}
.og .fl li{font:300 15px/2 var(--sans)}
.og .fl a,.og .fl button{color:#9b9b9b;background:none;border:0;padding:0;font:inherit;cursor:pointer;text-align:left;transition:color .2s}
.og .fl a:hover,.og .fl button:hover{color:#fff}

@media(min-width:768px){
  .og .wrap{padding:0 32px}
  .og .sec{padding:100px 0}
  .og .nav{padding:calc(env(safe-area-inset-top,0px) + 24px) 24px 0}
  .og .isle{height:56px;background:rgba(15,16,17,.06);-webkit-backdrop-filter:blur(24px);backdrop-filter:blur(24px)}
  .og .isle-l{width:auto;padding:0 12px;justify-content:flex-start;border-radius:12px}
  .og .nl{display:inline-flex}
  .og .brand-t{display:block}
  .og .hero{padding-top:200px}
  .og .hero-sub{margin-top:24px}
  .og .phone{height:560px;margin-top:64px}
  .og .glass{-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}
  .og .frags{grid-template-columns:repeat(3,1fr)}
  .og .pair{grid-template-columns:1fr 1fr}
  .og .pair.rev .nat{order:2}
  .og .nat{padding:96px 32px 48px}
  .og .stats{grid-template-columns:repeat(3,1fr)}
  .og .wall{grid-template-columns:repeat(4,1fr)}
  .og .cols{grid-template-columns:repeat(4,1fr)}
  .og .fgrid{grid-template-columns:1.4fr 1fr 1fr 1fr 1fr}
  .og .fbrand{grid-column:auto}
  .og .split{display:grid;gap:48px;grid-template-columns:1fr 1.2fr;align-items:start}
}
@media(prefers-reduced-motion:reduce){.og .fin{animation:none}.og .rise{transform:none;transition:opacity .3s}.og .dot{animation:none}}
`;

const nf = (n, lang) => Number(n).toLocaleString(lang === "en" ? "en-US" : "vi-VN");
const plain = (s) => s.replace(/\*/g, "");
/* *cụm* nghiêng thật */
const rt = (s) => s.split(/(\*[^*]+\*)/g).map((x, i) => (x.length > 2 && x.startsWith("*") && x.endsWith("*") ? <em key={i}>{x.slice(1, -1)}</em> : x));
/* chữ có dấu * ở đầu từ sẽ nghiêng (định dạng của landingFxCopy) */
const story = (s) => s.split(" ").map((w, i) => (w.startsWith("*") ? <em key={i}>{w.slice(1)} </em> : <span key={i}>{w} </span>));

const Logo = ({ size = 28 }) => (
  <img src={STAR_URL} alt="NXX315 Studio" width={size} height={size} style={{ width: size, height: size, objectFit: "contain", display: "block" }} />
);

function Rise({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setOn(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`rise ${on ? "in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

/* Tiến độ cuộn của điện thoại → biến --p (0..1). Chỉ chạy khi điện thoại đang trong màn hình. */
function usePhoneScroll(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el.style.setProperty("--p", "1"); return undefined; }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.95)));
      el.style.setProperty("--p", p.toFixed(3));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    if (typeof IntersectionObserver === "undefined") { update(); return undefined; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { window.addEventListener("scroll", onScroll, { passive: true }); onScroll(); }
      else window.removeEventListener("scroll", onScroll);
    }, { rootMargin: "120px" });
    io.observe(el);
    return () => { io.disconnect(); window.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [ref]);
}

function Nature({ img, glow, title, text, id }) {
  return (
    <div id={id} className="nat" style={{ background: bgOf(img), scrollMarginTop: 90 }}>
      <div className="nat-glow" style={{ background: `radial-gradient(closest-side,${glow},transparent)` }} />
      <h3 className="nat-t">{rt(title)}</h3>
      <p className="nat-p">{text}</p>
    </div>
  );
}

export default function CloudVIPLanding() {
  useTheme();
  const i18n = useI18n();
  const lang = i18n.lang === "en" ? "en" : "vi";
  const setLang = i18n.setLang || i18n.setLanguage || i18n.changeLanguage;
  const c = COPY[lang];
  const fx = FX[lang];
  const x = EXTRA[lang];
  const [board, setBoard] = useState(undefined);
  const [orders, setOrders] = useState(undefined);
  const vid = useRef(null);
  const phone = useRef(null);
  usePhoneScroll(phone);

  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    v.muted = true;
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
  }, []);

  useEffect(() => {
    let off = false;
    (async () => {
      try {
        const [lb, od] = await Promise.all([
          supabase.rpc("get_landing_leaderboard", { p_limit: 10 }),
          supabase.rpc("get_landing_recent_orders", { p_limit: 8 }),
        ]);
        if (off) return;
        setBoard(lb.error ? null : lb.data || []);
        setOrders(od.error ? null : od.data || []);
      } catch {
        if (!off) { setBoard(null); setOrders(null); }
      }
    })();
    return () => { off = true; };
  }, []);

  const st = (v) => (v === undefined ? "load" : v === null ? "err" : v.length ? "ok" : "empty");
  const labels = fx.marquee;
  const rankTitle = `${c.rTitleA} ${c.rTitleB}`;
  const top3 = Array.isArray(board) ? board.slice(0, 3) : [];
  const rest = Array.isArray(board) ? board.slice(3) : [];
  const rankRows = (n) => (st(board) === "ok"
    ? board.slice(0, n).map((r) => <div key={r.rank} className="row"><span className="n">{String(r.rank).padStart(2, "0")}</span><span>{r.name}</span><span className="r">{nf(r.coins, lang)} {c.unit}</span></div>)
    : [0, 1, 2].slice(0, n).map((k) => <div key={k} className="row"><span className="n">{String(k + 1).padStart(2, "0")}</span><span className="dot" style={{ background: "#555" }} /></div>));
  const stackOrders = st(orders) === "ok" ? orders.slice(0, 4) : [];

  return (
    <div className="og">
      <style>{CSS}</style>

      {/* THANH ĐẦU NỔI */}
      <header className="nav">
        <div className="isle isle-l">
          <Link to="/" aria-label="NXX315 Studio" style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 4px" }}><Logo size={28} /><span className="brand-t">{x.brand}</span></Link>
          {c.nav.map(([id, l]) => <button key={id} type="button" className="nl" onClick={() => scrollToId(id)}>{l}</button>)}
        </div>
        <div className="isle">
          {typeof setLang === "function" && <button type="button" className="nl nl-on" style={{ color: "#9b9b9b" }} onClick={() => setLang(lang === "vi" ? "en" : "vi")}>{c.langBtn}</button>}
          <Link to="/login" className="nl nl-on">{c.login}</Link>
          <Link to="/register" className="btn sm">{c.start}</Link>
        </div>
      </header>

      <main>
        {/* 1. MỞ ĐẦU: bầu trời + điện thoại trong suốt */}
        <section className="hero">
          <video ref={vid} src={HERO_VIDEO_URL} autoPlay muted loop playsInline preload="auto" aria-hidden="true" />
          <div className="wrap hero-in">
            <span className="pill fin"><i className="dot" />{c.ticketMeta}</span>
            <h1 className="hero-t fin" style={{ animationDelay: ".1s", maxWidth: 830, margin: "0 auto" }}>
              {c.h1a} <em>{c.h1b}</em>,<br />{c.h1c.toLowerCase()}, {c.h1d}
            </h1>
            <p className="hero-sub fin" style={{ animationDelay: ".25s" }}>{c.heroSub}</p>
            <div className="fin" style={{ animationDelay: ".4s", marginTop: 32 }}><Link to="/register" className="btn">{c.ctaAccount}<span aria-hidden>→</span></Link></div>
          </div>

          <div ref={phone} className="phone">
            <div className="ph-in">
              <span className="ph-ico"><Logo size={24} /></span>
              <p className="ph-t">{plain(c.ticketTitle)}</p>
              <div className="glass g1">
                <span className="cap">{labels[3]}</span>
                <h4>{x.tasks[0]}</h4>
                <p>{x.tasks[1]}</p>
              </div>
              <div className="glass g2">
                <span className="cap">{labels[1]} · {c.week}</span>
                <h4>{rankTitle}</h4>
                {st(board) === "ok"
                  ? board.slice(0, 2).map((r) => <div key={r.rank} className="r"><span>{String(r.rank).padStart(2, "0")} · {r.name}</span><span>{nf(r.coins, lang)} {c.unit}</span></div>)
                  : <p>{c.ticketNote}</p>}
              </div>
            </div>
          </div>
          <div className="hero-fade" />
        </section>

        {/* 2. LỜI HỨA: nền tối + ánh xanh dưới đáy */}
        <section style={{ position: "relative", overflow: "hidden", padding: "140px 0 200px", textAlign: "center" }}>
          <div className="wrap">
            <Rise>
              <p className="promise" style={{ maxWidth: 760, margin: "0 auto" }}>{story(fx.story)}</p>
              <p className="body" style={{ maxWidth: 420, margin: "24px auto 0" }}>{x.mSub}</p>
            </Rise>
          </div>
          <div className="glowline" />
        </section>

        {/* 3. TỪ KHÓA (thay dải logo) */}
        <div className="wrap" style={{ paddingBottom: 24 }}><div className="words">{labels.map((l) => <span key={l}>{l}</span>)}</div></div>

        {/* 4. BẮT ĐẦU: tiêu đề + ba mảnh giao diện */}
        <section id="onboarding" className="sec">
          <div className="wrap">
            <Rise style={{ textAlign: "center" }}>
              <h2 className="chap" style={{ textAlign: "center", maxWidth: 900, margin: "0 auto" }}>{c.obTitleA} <em>{c.obTitleB}</em></h2>
              <p className="body" style={{ textAlign: "center", maxWidth: 480, margin: "24px auto 0" }}>{c.obBody}</p>
              <div style={{ textAlign: "center", marginTop: 32 }}><Link to="/register" className="btn btn2">{c.obCta}<span aria-hidden>→</span></Link></div>
            </Rise>
            <div className="frags">
              <Rise><div className="card frag" style={{ height: "100%" }}>
                <span className="cap">{x.tasks[0]}</span><h3>{x.tasks[0]}</h3><p>{x.tasks[1]}</p>
                <div className="mini">{x.tasks[2].map((t) => <div key={t} className="row"><span>{t}</span><span className="r">{x.tasks[3]}</span></div>)}</div>
              </div></Rise>
              <Rise delay={80}><div className="card frag" style={{ height: "100%" }}>
                <span className="cap">{x.panelRank}</span><h3>{rankTitle}</h3><p>{c.rSub}</p>
                <div className="mini">{rankRows(4)}</div>
              </div></Rise>
              <Rise delay={160}><div className="card frag" style={{ height: "100%" }}>
                <span className="cap">{x.steps}</span><h3>{c.obTitleA} {c.obTitleB}</h3><p>{c.obBody}</p>
                <div className="mini">{c.obSteps.map(([n, t]) => <div key={n} className="row"><span className="n">{String(n).replace(/\D/g, "") || n}</span><span>{t}</span></div>)}</div>
              </div></Rise>
            </div>
          </div>
        </section>

        {/* 5. CHỒNG THÔNG BÁO: đơn đã duyệt */}
        <section id="orders" className="sec" style={{ textAlign: "center" }}>
          <div className="wrap">
            <Rise>
              <span className="dot" style={{ marginBottom: 32 }} />
              <h2 className="chap" style={{ maxWidth: 900, margin: "0 auto" }}>{c.oTitleA} <em>{c.oTitleB}</em></h2>
              <p className="body" style={{ maxWidth: 440, margin: "24px auto 0" }}>{c.oSub}</p>
            </Rise>
            {stackOrders.length > 0 && (
              <Rise>
                <div className="stack">
                  {stackOrders.map((o, k) => (
                    <div key={`${o.approved_at}-${k}`} className="noti" style={{ transform: `scale(${1 - k * 0.04})`, opacity: 1 - k * 0.22, zIndex: 10 - k }}>
                      <span className="ic"><Logo size={20} /></span>
                      <span style={{ textAlign: "left" }}><strong style={{ fontWeight: 400 }}>{o.item}</strong> · {o.name} · {c.approved}</span>
                      <span className="t">{timeAgo(o.approved_at, c.ago)}</span>
                    </div>
                  ))}
                </div>
              </Rise>
            )}
            {st(orders) === "load" && <p className="body" style={{ marginTop: 48 }}>…</p>}
            {(st(orders) === "empty" || st(orders) === "err") && <p className="body" style={{ marginTop: 48 }}>{st(orders) === "err" ? c.failed : c.empty}</p>}
          </div>
        </section>

        {/* 6. CẶP THIÊN NHIÊN / GIAO DIỆN */}
        <section className="sec" style={{ paddingTop: 40 }}>
          <div className="wrap">
            <Rise><div className="pair">
              <Nature img="flowers" glow="#cc7c01" title={x.games[0]} text={x.games[1]} />
              <div className="card iface">
                <span className="cap" style={{ marginBottom: 6 }}>{x.ifaceGames}</span>
                {GAMES.map((g) => <div key={g} className="row"><span>{g}</span><span className="r">Coin</span></div>)}
              </div>
            </div></Rise>

            <Rise><div className="pair rev">
              <Nature id="invite" img="meadow" glow="#61a133" title={`${c.iTitleA} *${c.iTitleB}*`} text={c.iBody} />
              <div className="card iface" style={{ gap: 36 }}>
                {c.iCols.map(([big, d]) => <div key={big}><div className="num">{big}</div><p className="num-l" style={{ margin: "4px 0 0" }}>{d}</p></div>)}
              </div>
            </div></Rise>

            <Rise><div className="pair">
              <Nature img="dunes" glow="#a7612e" title={x.gifts[0]} text={x.gifts[1]} />
              <div className="card iface">
                <span className="cap" style={{ marginBottom: 6 }}>{x.ifaceGifts}</span>
                {x.gifts[2].map((g) => <div key={g} className="row"><span>{g}</span><span className="r">→</span></div>)}
              </div>
            </div></Rise>
          </div>
        </section>

        {/* 7. XẾP HẠNG: số liệu phẳng */}
        <section id="rank" className="sec">
          <div className="wrap">
            <Rise>
              <p className="cap" style={{ marginBottom: 20 }}>{c.rLabel}</p>
              <h2 className="chap" style={{ maxWidth: 900 }}>{c.rTitleA} <em>{c.rTitleB}</em></h2>
              <p className="body" style={{ maxWidth: 440, marginTop: 24 }}>{c.rSub}</p>
            </Rise>
            {st(board) === "ok" && (
              <div className="stats">
                {top3.map((r, k) => (
                  <Rise key={r.rank} delay={k * 80}>
                    <p className="cap">TOP {r.rank} · {c.week}</p>
                    <div className="num" style={{ marginTop: 16 }}>{nf(r.coins, lang)}</div>
                    <p className="num-l">{c.unit}</p>
                    <p style={{ font: "300 20px/1.3 var(--sans)", margin: "16px 0 0" }}>{r.name}</p>
                  </Rise>
                ))}
              </div>
            )}
            {rest.length > 0 && <div style={{ marginTop: 40 }}>{rest.map((r) => <div key={r.rank} className="lrow"><span className="cap" style={{ width: 32 }}>{String(r.rank).padStart(2, "0")}</span><span style={{ flex: 1 }}>{r.name}</span><span style={{ color: "#9b9b9b" }}>{nf(r.coins, lang)} {c.unit}</span></div>)}</div>}
            {st(board) === "load" && <p className="body" style={{ marginTop: 48 }}>…</p>}
            {(st(board) === "empty" || st(board) === "err") && <p className="body" style={{ marginTop: 48 }}>{st(board) === "err" ? c.failed : c.empty}</p>}
          </div>
        </section>

        {/* 8. CREATOR */}
        <section id="creator" className="sec" style={{ paddingTop: 20 }}>
          <div className="wrap">
            <Rise><div className="card panel split" style={{ padding: 32 }}>
              <div>
                <p className="cap">{c.cLabel}</p>
                <h2 className="small-h" style={{ marginTop: 16 }}>{c.cTitleA} <em>{c.cTitleB}</em></h2>
                <p className="body" style={{ marginTop: 20, color: "#fafafa" }}>{c.cH3}</p>
                <p className="body" style={{ marginTop: 12 }}>{c.cBody}</p>
                <ul className="perks">{c.cPerks.map((t) => <li key={t}>{t}</li>)}</ul>
                <div style={{ marginTop: 32 }}><a href={CREATOR_URL} className="btn">{c.cCta}<span aria-hidden>→</span></a></div>
              </div>
              <div style={{ marginTop: 32 }}>
                <div className="card" style={{ background: "#0a0a0a" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
                    <span className="cap">creator.nxx315.com</span><span className="cap">{x.demo}</span>
                  </div>
                  <div style={{ padding: 16, display: "grid", gap: 8 }}>
                    {x.rows.map((r) => <div key={r} className="row"><span>{r}</span><span className="r" style={{ color: "#61a133" }}>{x.ok}</span></div>)}
                    <div className="row"><span>+ {c.mockGift}</span></div>
                  </div>
                </div>
              </div>
            </div></Rise>
          </div>
        </section>

        {/* 9. CHI TIẾT + HỎI ĐÁP */}
        <section id="details" className="sec">
          <div className="wrap">
            <Rise><h2 className="chap" style={{ textAlign: "center", maxWidth: 900, margin: "0 auto" }}>{c.dTitleA} <em>{c.dTitleB}</em></h2></Rise>
            <div className="cols">
              {c.dItems.map(([t, d], k) => <Rise key={t} delay={k * 80}><h3>{t}</h3><p>{d}</p></Rise>)}
            </div>
            <Rise><div className="cols" style={{ marginTop: 56 }}>
              <div><h3>{x.transparent}</h3><p>{x.transparentText}</p><Link to="/about" style={{ display: "inline-block", marginTop: 12, textDecoration: "underline", textUnderlineOffset: 4 }}>{x.aboutLink} →</Link></div>
            </div></Rise>
            <div className="split" style={{ marginTop: 100 }}>
              <h3 className="small-h" style={{ marginBottom: 32 }}>{c.faqTitle}</h3>
              <div>{c.faq.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
            </div>
          </div>
        </section>

        {/* 10. KẾT: ảnh thiên nhiên + vệt sáng xanh tím */}
        <section className="close" style={{ background: bgOf("closing") }}>
          <div className="seam" />
          <div style={{ position: "absolute", left: "8%", right: "8%", top: 0, height: 90, background: "linear-gradient(90deg,transparent,#219ff8,#847dff,transparent)", opacity: 0.35, filter: "blur(30px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#050505,rgba(5,5,5,.15) 28%,rgba(5,5,5,.1) 60%,#050505)", pointerEvents: "none" }} />
          <div className="wrap" style={{ position: "relative" }}>
            <Rise>
              <h2 className="close-t">{c.closeA} <em>{c.closeB}</em></h2>
              <p className="hero-sub" style={{ marginTop: 28 }}>{c.closeSub}</p>
              <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <Link to="/register" className="btn">{c.ctaAccount}<span aria-hidden>→</span></Link>
                <a href={CREATOR_URL} className="btn btn2">{c.ctaCreator}<span aria-hidden>→</span></a>
              </div>
            </Rise>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <div className="fgrid">
            <div className="fbrand">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}><Logo size={36} /><span style={{ font: "400 17px/1 var(--sans)" }}>{x.brand}</span></div>
              <p style={{ font: "300 15px/1.5 var(--sans)", color: "#9b9b9b", margin: "20px 0 0", maxWidth: 300 }}>{c.manifesto}</p>
            </div>
            <div><h4 className="fh">{c.fCols[0]}</h4><ul className="fl">{c.fExplore.map(([id, l]) => <li key={id}><button type="button" onClick={() => scrollToId(id)}>{l}</button></li>)}</ul></div>
            <div><h4 className="fh">{c.fCols[1]}</h4><ul className="fl">{c.fAccount.map(([to, l]) => <li key={to}><Link to={to}>{l}</Link></li>)}</ul></div>
            <div><h4 className="fh">{c.fCols[2]}</h4><ul className="fl">{c.fLegal.map(([to, l]) => <li key={to}><Link to={to}>{l}</Link></li>)}</ul></div>
            <div><h4 className="fh">{c.fCols[3]}</h4>
              <ul className="fl">
                {SITE?.youtube && <li><a href={SITE.youtube} target="_blank" rel="noopener noreferrer">YouTube</a></li>}
                {SITE?.zaloUrl && <li><a href={SITE.zaloUrl} target="_blank" rel="noopener noreferrer">Zalo</a></li>}
                {SITE?.email && <li><a href={`mailto:${SITE.email}`} style={{ wordBreak: "break-all" }}>{SITE.email}</a></li>}
                <li><a href={CREATOR_URL}>Creator</a></li>
              </ul>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, marginTop: 64, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,.14)", font: "300 13px/1.4 var(--sans)", color: "#9b9b9b" }}>
            <span>© {new Date().getFullYear()} Nxx315 Studio</span><span>Roblox · Creator</span>
          </div>
        </div>
      </footer>
    </div>
  );
                           }
