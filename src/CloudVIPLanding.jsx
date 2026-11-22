// src/CloudVIPLanding.jsx — phong cách "midnight optimism" (Copilot Money)
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "./lib/supabaseClient.js";
import { SITE } from "./lib/siteInfo.js";
import { useI18n } from "./i18n/index.js";
import useTheme from "./hooks/useTheme.js";
import { COPY, CREATOR_URL } from "./lib/landingData.js";
import { FX } from "./lib/landingFxCopy.js";
import { timeAgo, scrollToId } from "./components/LandingBits.jsx";

const STAR_URL = "https://i.postimg.cc/HLL0BmN7/1ef9365fbb1cd959265e9bf9ba8c45fb.png";
/* Video nền hero (tuỳ chọn). Để "" là tắt. Nếu bật, video chỉ hiện mờ ~22% trên nền xanh đêm. */
const HERO_VIDEO_URL = "";

/* Viên nang trang trí: [màu, emoji] theo thứ tự fx.marquee */
const CAPS = [["#ff33aa", "🎮"], ["#f27f0c", "🪙"], ["#9019e6", "⚔️"], ["#59cc33", "✅"], ["#5c6f8a", "💎"], ["#e83030", "🎬"]];
const HERO_CAPS = [
  { i: 0, top: "5%", left: "-5%", rot: -18, blur: 3, s: 0.7 },
  { i: 1, top: "3%", right: "-7%", rot: 16, blur: 2, s: 0.7 },
  { i: 2, top: "41%", left: "-24%", rot: -14, blur: 4, s: 0.7 },
  { i: 3, top: "57%", right: "-22%", rot: 20, blur: 3, s: 0.7 },
  { i: 4, bottom: "13%", left: "-9%", rot: 14, blur: 3, s: 0.7 },
  { i: 5, bottom: "7%", right: "-5%", rot: -16, blur: 2, s: 0.7 },
];
const FOOT_CAPS = [[5, -22, -2], [0, 14, 4], [1, -8, 2], [2, 20, 0], [3, -14, 3], [4, 26, 1], [5, -30, 4], [0, 12, 2]];

const EXTRA = {
  vi: {
    brand: "NXX315 Studio",
    mSub: "Dùng ngay trên điện thoại và máy tính, tại nxx315.com.",
    bTitle: "Một nơi cho nhiệm vụ, xu và quà.",
    tasks: ["Nhiệm vụ mỗi ngày", "Nhận xu miễn phí hằng ngày hoặc tham gia các sự kiện.", ["Nhiệm vụ hằng ngày", "Nhiệm vụ đối tác", "Sự kiện"], "+ xu"],
    games: ["Nạp game bằng Coin", "Dùng Coin nạp thẳng vào các game bạn chơi mỗi ngày."],
    gifts: ["Đổi quà thật", "Robux, Quân Huy, Kim Cương và nhiều quà khác. Đơn được kiểm tra trước khi giao.", ["Robux", "Quân Huy", "Kim Cương"]],
    about: [["Minh bạch", "Biết ai vận hành, xu đến từ đâu, hoàn tiền và khiếu nại thế nào."], ["Tài khoản gọn nhẹ", "Đăng nhập bằng Google hoặc liên kết gửi qua email, không cần mật khẩu."]],
    aboutLink: "Đọc trang Giới thiệu",
    demo: "Minh họa", rows: ["Video #1", "Video #2", "Video #3"], ok: "Đã duyệt",
    footCaps: ["TOP 1", "XẾP HẠNG"],
    legal: "Nxx315 Studio",
  },
  en: {
    brand: "NXX315 Studio",
    mSub: "Use it right on your phone or computer, at nxx315.com.",
    bTitle: "One place for tasks, coins and rewards.",
    tasks: ["Daily tasks", "Earn free coins every day or join events.", ["Daily task", "Partner task", "Event"], "+ coins"],
    games: ["Top up games with Coins", "Use Coins to top up the games you play every day."],
    gifts: ["Real rewards", "Robux, game currency and more. Orders are checked before delivery.", ["Robux", "Game currency", "More rewards"]],
    about: [["Transparent", "Know who runs it, where coins come from, and how refunds and complaints work."], ["Light account", "Sign in with Google or an emailed link, no password needed."]],
    aboutLink: "Read the About page",
    demo: "Demo", rows: ["Video #1", "Video #2", "Video #3"], ok: "Approved",
    footCaps: ["TOP 1", "LEADERBOARD"],
    legal: "Nxx315 Studio",
  },
};
const GAMES = ["Free Fire", "Liên Quân", "Play Together", "Valorant", "FC Mobile", "Roblox"];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Inter:wght@100;200;300;700&display=swap');
.cp{--f:"Jokker","DM Sans",sans-serif;--m:"Matter Variable","Inter",sans-serif;--muted:#597caa;--ink:#11263b;--lm:#7f8ba4;background:#000814;color:#e6e6e8;font-family:var(--f);font-weight:500;overflow-x:hidden;min-height:100vh;-webkit-font-smoothing:antialiased}
.cp a{color:inherit;text-decoration:none}
.cp button{font-family:inherit}
.cp .stage{max-width:1200px;margin:0 auto;padding:0 20px}
.cp .sec{padding:96px 0}
.cp .hd{font:600 clamp(34px,6vw,64px)/1.05 var(--f);color:#e6e6e8;margin:0;text-wrap:balance}
.cp .lead{font:500 clamp(18px,3vw,32px)/1.2 var(--f);color:#ccced0;margin:0}
.cp .sub{font:400 clamp(16px,2.2vw,24px)/1.4 var(--f);color:var(--muted);margin:0}
.cp .rise{opacity:0;transform:translate3d(0,18px,0);transition:opacity .6s cubic-bezier(.44,0,.56,1),transform .6s cubic-bezier(.44,0,.56,1)}
.cp .rise.in{opacity:1;transform:none}

/* thanh đầu: hai đảo kính */
.cp .nav{position:fixed;top:0;left:0;right:0;z-index:50;display:flex;justify-content:space-between;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 12px) 12px 0;pointer-events:none}
.cp .isle{pointer-events:auto;display:flex;align-items:center;gap:4px;height:48px;padding:0 6px;border-radius:16px;background:rgba(8,27,54,.62);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border:1px solid rgba(28,108,255,.2)}
.cp .isle-l{width:48px;padding:0;justify-content:center;border-radius:999px}
.cp .nl-link{display:none;padding:6px 12px;font:500 16px/1.6 var(--f);letter-spacing:-.01em;color:rgba(255,255,255,.9);background:none;border:0;cursor:pointer;white-space:nowrap;transition:color .4s cubic-bezier(.44,0,.56,1)}
.cp .nl-link:hover{color:var(--muted)}
.cp .isle .nl-always{display:inline-flex}
.cp .brand-t{display:none;font:600 17px/1 var(--f);letter-spacing:-.01em;padding-right:10px}
.cp .light{display:inline-flex;align-items:center;white-space:nowrap;padding:6px 12px;border-radius:14px;background:linear-gradient(#f9fafb,#f6f7f9);color:var(--ink);font:500 15px/1.6 var(--f);letter-spacing:-.01em}

/* nút xanh như phím phần cứng */
.cp .rim{display:inline-flex;padding:2px;border-radius:22px;background:rgba(0,71,204,.4)}
.cp .key{display:flex;align-items:center;gap:12px;background:#1a66ff;color:#fff;border-radius:20px;padding:16px 18px 16px 16px;font:500 clamp(18px,4.6vw,24px)/1 var(--f);box-shadow:rgba(255,255,255,.16) 4px 4px 16px -4px inset,rgba(0,0,0,.2) -4px -4px 16px -4px inset,rgba(255,255,255,.08) 4px 4px 8px 0 inset,rgba(255,255,255,.4) 1px 1px 1px -.5px inset;white-space:nowrap}
.cp .key.sm{border-radius:16px;padding:12px 16px 12px 14px;gap:10px;font:500 20px/24px var(--f)}
.cp .rim.sm{border-radius:18px}
.cp .mark{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;background:#eef3fb;flex-shrink:0}

/* viên nang bóng */
.cp .capsule{--s:.7;display:inline-flex;align-items:center;justify-content:center;gap:calc(var(--s)*12px);border-radius:40px;padding:calc(var(--s)*16px) calc(var(--s)*32px) calc(var(--s)*16px) calc(var(--s)*24px);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);box-shadow:rgba(255,255,255,.16) 0 24px 64px -12px inset,rgba(0,0,0,.16) 0 -24px 40px -12px inset,rgba(255,255,255,.16) 0 .6px 1.1px -.5px inset,rgba(255,255,255,.17) 0 1.9px 3.5px -1px inset,rgba(255,255,255,.19) 0 5.1px 9.2px -1.5px inset,rgba(255,255,255,.24) 0 16px 28.8px -2px inset;white-space:nowrap}
.cp .capsule b{font:700 calc(var(--s)*28px)/1 "Inter",sans-serif;letter-spacing:.04em;text-transform:uppercase;background:linear-gradient(rgba(255,255,255,.92),rgba(255,255,255,.7));-webkit-background-clip:text;background-clip:text;color:transparent}
.cp .capsule i{font-style:normal;font-size:calc(var(--s)*44px);line-height:1;filter:drop-shadow(0 4px 6px rgba(0,0,0,.28))}

/* hero */
.cp .hero{position:relative;overflow:hidden;text-align:center;padding:150px 0 120px;background:radial-gradient(60% 45% at 50% 0%,#00265c 0%,rgba(0,8,20,0) 70%),radial-gradient(50% 50% at 50% 55%,rgba(0,85,204,.14) 0%,rgba(0,85,204,0) 100%),#000814}
.cp .display{font:600 clamp(40px,11vw,132px)/.9 var(--f);letter-spacing:-.02em;margin:0 auto;max-width:1000px;background:linear-gradient(#dfe4ed 15%,#8795ad 100%);-webkit-background-clip:text;background-clip:text;color:transparent;padding-bottom:.08em}
.cp .h-line{display:block}
.cp .hero-cap{position:absolute;pointer-events:none}

/* khối thiết bị */
.cp .scene{position:relative;max-width:900px;margin:56px auto 0;padding-bottom:72px}
.cp .win{border-radius:16px;overflow:hidden;background:#000d1f;border:1px solid rgba(28,108,255,.22);text-align:left}
.cp .win-bar{display:flex;align-items:center;gap:6px;padding:12px 14px;background:#010d1e;border-bottom:1px solid rgba(28,108,255,.14)}
.cp .win-bar i{width:9px;height:9px;border-radius:50%;background:#1a2a44}
.cp .win-bar span{margin-left:10px;font:500 12px var(--f);color:var(--muted)}
.cp .win-body{padding:18px;display:grid;gap:8px}
.cp .phone{position:absolute;right:-6px;bottom:0;width:min(250px,56%);border-radius:36px;border:8px solid #0b1424;background:#000814;padding:30px 16px 18px;text-align:left;box-shadow:0 0 0 1px rgba(28,108,255,.25)}
.cp .phone:before{content:"";position:absolute;top:8px;left:50%;width:70px;height:18px;margin-left:-35px;border-radius:99px;background:#000}
.cp .phone .tag{font:500 11px var(--f);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.cp .phone .t{font:600 22px/1.15 var(--f);margin:8px 0 6px;color:#e6e6e8}
.cp .phone .n{font:400 13px/1.4 var(--f);color:var(--muted);margin:0}

/* bento */
.cp .bento{display:grid;gap:16px;grid-template-columns:1fr}
.cp .panel{position:relative;display:flex;flex-direction:column;overflow:hidden;min-height:320px;padding:28px 32px 0 32px;border-radius:24px;background:radial-gradient(79% 75% at 79% 82.5%,#000f24 0%,#000d1f 100%);border:1px solid rgba(28,108,255,.14);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
.cp .panel h3{font:600 24px/1.2 var(--f);margin:0;color:#e6e6e8}
.cp .panel p.d{font:500 16px/1.4 var(--f);color:var(--muted);margin:8px 0 0;max-width:360px}
.cp .frag{margin-top:auto;padding-top:24px;display:grid;gap:8px;-webkit-mask-image:linear-gradient(#000 72%,transparent);mask-image:linear-gradient(#000 72%,transparent);padding-bottom:0;max-height:210px;overflow:hidden}
.cp .ui{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.045);font:500 14px/1.2 var(--f);color:#dfe4ed}
.cp .sq{width:28px;height:28px;border-radius:8px;flex-shrink:0}
.cp .chip{margin-left:auto;border-radius:8px;padding:4px 8px;background:rgba(89,204,51,.16);color:#7ee05a;font:600 12px/1 var(--f);white-space:nowrap}
.cp .rk{width:22px;font:600 13px var(--f);color:var(--muted)}
.cp .num{font:100 clamp(44px,8vw,56px)/1.2 var(--m);letter-spacing:.01em;color:#e6e6e8;font-feature-settings:"ss07"}
.cp .dot{animation:pulse 2s infinite}
@keyframes pulse{50%{opacity:.35}}

/* các bước, không đóng khung */
.cp .steps{display:grid;gap:48px;grid-template-columns:1fr;margin-top:64px}
.cp .pic{display:flex;width:44px;height:44px;border-radius:14px;align-items:center;justify-content:center;background:rgba(223,228,237,.1);font:600 16px var(--f);color:#dfe4ed}
.cp .steps h3{font:600 24px/1.2 var(--f);margin:16px 0 8px}
.cp .steps p{font:500 16px/1.4 var(--f);color:var(--muted);margin:0;max-width:340px}

/* tường đánh giá */
.cp .wall{columns:1;column-gap:16px;margin-top:56px;-webkit-mask-image:linear-gradient(#000 80%,transparent);mask-image:linear-gradient(#000 80%,transparent)}
.cp .rev{break-inside:avoid;margin-bottom:16px;border-radius:20px;overflow:hidden;background:radial-gradient(79% 75% at 79% 82.5%,#01122d 0%,#000f24 100%);border:1px solid rgba(28,108,255,.12)}
.cp .rev-h{display:flex;align-items:center;gap:12px;padding:16px 20px}
.cp .av{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1a66ff,#5c6f8a);font:600 14px var(--f);color:#fff}
.cp .rev-b{padding:0 20px 20px;font:100 16px/1.4 var(--m);color:#e6e6e8}
.cp .rev-b strong{display:block;font:300 20px/1.3 var(--m);margin-bottom:6px}

/* dải sáng tương phản */
.cp .pale{background:linear-gradient(160deg,#f9fafb 0%,#f6f7f9 100%);border-radius:32px;padding:56px 20px;color:var(--ink)}
.cp .pale .hd{color:var(--ink)}
.cp .pgrid{display:grid;gap:16px;grid-template-columns:1fr;margin-top:48px}
.cp .porc{border-radius:24px;padding:28px 32px 40px 32px;background:linear-gradient(135deg,#fff 0%,#fcfcfd 100%);box-shadow:rgba(0,0,0,.03) 0 .5px 1.3px -1px,rgba(0,0,0,.04) 0 4px 10.4px -2px}
.cp .porc h3{font:600 24px/1.2 var(--f);margin:0;color:var(--ink)}
.cp .porc p{font:500 16px/1.4 var(--f);color:var(--lm);margin:12px 0 0}
.cp .porc a{display:inline-block;margin-top:14px;font:600 15px var(--f);color:#1a66ff}

/* hỏi đáp */
.cp details{border-top:1px solid rgba(89,124,170,.25)}
.cp details:last-child{border-bottom:1px solid rgba(89,124,170,.25)}
.cp summary{cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:16px;padding:20px 0;font:500 18px/1.3 var(--f);color:#e6e6e8}
.cp summary::-webkit-details-marker{display:none}
.cp summary:after{content:"+";color:var(--muted);font-size:22px;line-height:1}
.cp details[open] summary:after{content:"−"}
.cp details p{margin:0;padding:0 0 20px;font:500 16px/1.5 var(--f);color:var(--muted);max-width:640px}

/* chân trang */
.cp footer{position:relative;background:#010d1e;padding-top:80px;overflow:hidden}
.cp .fgrid{display:grid;gap:40px;grid-template-columns:1fr 1fr}
.cp .fbrand{grid-column:1/-1}
.cp .fh{font:500 17px/1.4 var(--f);color:#e6e6e8;margin:0 0 12px}
.cp .fl{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}
.cp .fl a,.cp .fl button{font:500 17px/1.4 var(--f);color:var(--muted);background:none;border:0;padding:0;cursor:pointer;text-align:left;transition:color .3s}
.cp .fl a:hover,.cp .fl button:hover{color:rgba(255,255,255,.8)}
.cp .pile{position:relative;height:230px;margin-top:40px}
.cp .pile .capsule{position:absolute;bottom:-34px}

@media(min-width:768px){
  .cp .stage{padding:0 32px}
  .cp .sec{padding:112px 0}
  .cp .nl-link{display:inline-flex}
  .cp .isle-l{width:auto;padding:0 6px;border-radius:16px;justify-content:flex-start}
  .cp .brand-t{display:block}
  .cp .light{font-size:17px}
  .cp .h-line{white-space:nowrap}
  .cp .capsule{--s:.9}
  .cp .bento{grid-template-columns:repeat(4,1fr)}
  .cp .s2{grid-column:span 2}
  .cp .steps{grid-template-columns:repeat(3,1fr)}
  .cp .wall{columns:3}
  .cp .pale{padding:80px 56px}
  .cp .pgrid{grid-template-columns:repeat(3,1fr)}
  .cp .fgrid{grid-template-columns:1.4fr 1fr 1fr 1fr 1fr}
  .cp .fbrand{grid-column:auto}
  .cp .pile{height:260px}
}
@media(min-width:1100px){.cp .capsule{--s:1}}
@media(prefers-reduced-motion:reduce){.cp .rise{transform:none;transition:opacity .3s}.cp .dot{animation:none}}
`;

const nf = (n, lang) => Number(n).toLocaleString(lang === "en" ? "en-US" : "vi-VN");
const plain = (s) => s.replace(/\*/g, "");

const Logo = ({ size = 26 }) => (
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

const Capsule = ({ i, label, rot = 0, blur = 0, s, style }) => (
  <span className="capsule" aria-hidden="true" style={{ background: CAPS[i % CAPS.length][0], transform: `rotate(${rot}deg)`, filter: blur ? `blur(${blur}px)` : undefined, ...(s ? { "--s": s } : null), ...style }}>
    <i>{CAPS[i % CAPS.length][1]}</i><b>{label}</b>
  </span>
);

const Key = ({ to, href, children, sm }) => {
  const inner = (
    <span className={`rim ${sm ? "sm" : ""}`}>
      <span className={`key ${sm ? "sm" : ""}`}><span className="mark"><Logo size={18} /></span>{children}</span>
    </span>
  );
  return to ? <Link to={to}>{inner}</Link> : <a href={href}>{inner}</a>;
};

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
  const rows = Array.isArray(board) ? board.slice(0, 4) : [];
  const labels = fx.marquee;
  const footLabels = useMemo(() => [...labels, ...x.footCaps], [labels, x.footCaps]);
  const rankTitle = `${c.rTitleA} ${c.rTitleB}`;

  const Skel = ({ n = 3 }) => Array.from({ length: n }).map((_, k) => <div key={k} className="ui dot"><span className="sq" style={{ background: "#0c2140" }} /><span style={{ height: 8, width: `${50 + k * 12}%`, background: "#0c2140", borderRadius: 4 }} /></div>);
  const RankRows = () => (st(board) === "ok" ? rows.map((r) => (
    <div key={r.rank} className="ui"><span className="rk">{String(r.rank).padStart(2, "0")}</span><span>{r.name}</span><span className="chip" style={{ background: "rgba(26,102,255,.18)", color: "#8fb3ff" }}>{nf(r.coins, lang)} {c.unit}</span></div>
  )) : <Skel n={4} />);

  return (
    <div className="cp">
      <style>{CSS}</style>

      {/* THANH ĐẦU: hai đảo kính */}
      <header className="nav">
        <div className="isle isle-l">
          <Link to="/" aria-label="NXX315 Studio" style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 4px" }}><Logo size={28} /><span className="brand-t">{x.brand}</span></Link>
          {c.nav.map(([id, l]) => <button key={id} type="button" className="nl-link" onClick={() => scrollToId(id)}>{l}</button>)}
        </div>
        <div className="isle">
          {typeof setLang === "function" && <button type="button" className="nl-link nl-always" onClick={() => setLang(lang === "vi" ? "en" : "vi")} style={{ color: "#597caa" }}>{c.langBtn}</button>}
          <Link to="/login" className="nl-link nl-always">{c.login}</Link>
          <Link to="/register" className="light">{c.start}</Link>
        </div>
      </header>

      <main>
             {/* 1. MỞ ĐẦU: lời hứa bạc khổng lồ + viên nang */}
        <section className="hero">
          {HERO_VIDEO_URL && <video ref={vid} src={HERO_VIDEO_URL} autoPlay muted loop playsInline preload="auto" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.22 }} />}
          {HERO_CAPS.map((p, k) => <span key={k} className="hero-cap" style={{ top: p.top, bottom: p.bottom, left: p.left, right: p.right }}><Capsule i={p.i} label={labels[p.i]} rot={p.rot} blur={p.blur} s={p.s} /></span>)}
          <div className="stage" style={{ position: "relative" }}>
            <h1 className="display">
              <span className="h-line">{c.h1a} {c.h1b},</span>
              <span className="h-line">{c.h1c.toLowerCase()},</span>
              <span className="h-line">{c.h1d}</span>
            </h1>
            <p className="lead" style={{ margin: "32px auto 0", maxWidth: 560 }}>{c.heroSub}</p>
            <div style={{ marginTop: 40, display: "flex", justifyContent: "center" }}><Key to="/register">{c.ctaAccount}</Key></div>
          </div>
        </section>

        {/* 2. TUYÊN NGÔN + THIẾT BỊ */}
        <section className="stage" style={{ padding: "64px 20px 0", textAlign: "center" }}>
          <Rise>
            <span className="mark" style={{ margin: "0 auto 32px", width: 44, height: 44, borderRadius: 14 }}><Logo size={26} /></span>
            <p className="hd" style={{ fontWeight: 500, lineHeight: 1.2, maxWidth: 880, margin: "0 auto" }}>{plain(fx.story)}</p>
            <p className="lead" style={{ marginTop: 48 }}>{x.mSub}</p>
          </Rise>
          <Rise>
            <div className="scene">
              <div className="win">
                <div className="win-bar"><i /><i /><i /><span>nxx315.com</span></div>
                <div className="win-body">
                  <p style={{ margin: "0 0 6px", font: "600 15px var(--f)", color: "#dfe4ed" }}>{rankTitle}</p>
                  <RankRows />
                </div>
              </div>
              <div className="phone">
                <span className="tag">{c.ticketMeta}</span>
                <p className="t">{plain(c.ticketTitle)}</p>
                <p className="n">{c.ticketNote}</p>
              </div>
            </div>
          </Rise>
        </section>

        {/* 3. BẮT ĐẦU: các bước, không đóng khung */}
        <section id="onboarding" className="sec stage">
          <Rise><p className="sub" style={{ marginBottom: 16 }}>{c.obLabel}</p><h2 className="hd" style={{ maxWidth: 820 }}>{c.obTitleA} {c.obTitleB}</h2><p className="sub" style={{ marginTop: 16, maxWidth: 560, fontSize: 20 }}>{c.obBody}</p></Rise>
          <div className="steps">
            {c.obSteps.map(([n, t, d], k) => (
              <Rise key={n} delay={k * 80}><div className="pic">{n}</div><h3>{t}</h3><p>{d}</p></Rise>
            ))}
          </div>
          <div style={{ marginTop: 48 }}><Key to="/register" sm>{c.obCta}</Key></div>
        </section>

        {/* 4. BENTO: mỗi thẻ một mảnh giao diện khác nhau */}
        <section className="stage" style={{ paddingBottom: 96 }}>
          <Rise><h2 className="hd" style={{ textAlign: "center", maxWidth: 820, margin: "0 auto 56px" }}>{x.bTitle}</h2></Rise>
          <div className="bento">
            <Rise className="s2"><div className="panel" style={{ height: "100%" }}>
              <h3>{x.tasks[0]}</h3><p className="d">{x.tasks[1]}</p>
              <div className="frag">
                {x.tasks[2].map((t, k) => (
                  <div key={t} className="ui"><span className="sq" style={{ background: ["#1a66ff", "#9019e6", "#f27f0c"][k] }} /><span>{t}</span><span className="chip">{x.tasks[3]}</span></div>
                ))}
              </div>
            </div></Rise>

            <Rise className="s2" delay={80}><div id="rank" className="panel" style={{ height: "100%", scrollMarginTop: 90 }}>
              <h3>{rankTitle}</h3><p className="d">{c.rSub}</p>
              <div className="frag"><RankRows /></div>
            </div></Rise>

            <Rise delay={80}><div className="panel" style={{ height: "100%" }}>
              <h3>{x.games[0]}</h3><p className="d">{x.games[1]}</p>
              <div className="frag" style={{ gridTemplateColumns: "1fr 1fr" }}>
                {GAMES.map((g) => <div key={g} className="ui" style={{ fontSize: 13 }}>{g}</div>)}
              </div>
            </div></Rise>

            <Rise delay={160}><div className="panel" style={{ height: "100%" }}>
              <h3>{x.gifts[0]}</h3><p className="d">{x.gifts[1]}</p>
              <div className="frag">
                {x.gifts[2].map((g, k) => <div key={g} className="ui"><span className="sq" style={{ background: ["#e83030", "#f27f0c", "#59cc33"][k] }} /><span>{g}</span><span className="chip">{x.ok}</span></div>)}
              </div>
            </div></Rise>

            <Rise className="s2" delay={80}><div id="invite" className="panel" style={{ height: "100%", scrollMarginTop: 90, paddingBottom: 32 }}>
              <h3>{c.iTitleA} {c.iTitleB}</h3><p className="d">{c.iBody}</p>
              <div style={{ marginTop: "auto", paddingTop: 24, display: "grid", gap: 16, gridTemplateColumns: `repeat(${c.iCols.length},1fr)` }}>
                {c.iCols.map(([big, d]) => (
                  <div key={big}><div className="num">{big}</div><p style={{ margin: "4px 0 0", font: "500 13px/1.3 var(--f)", color: "var(--muted)" }}>{d}</p></div>
                ))}
              </div>
            </div></Rise>
          </div>
        </section>

        {/* 5. TƯỜNG ĐƠN ĐÃ DUYỆT */}
        <section id="orders" className="stage" style={{ paddingBottom: 96 }}>
          <Rise style={{ textAlign: "center" }}><h2 className="hd" style={{ textAlign: "center", maxWidth: 820, margin: "0 auto" }}>{c.oTitleA} {c.oTitleB}</h2><p className="sub" style={{ textAlign: "center", margin: "16px auto 0", maxWidth: 520, fontSize: 20 }}>{c.oSub}</p></Rise>
          {st(orders) === "ok" && (
            <div className="wall">
              {orders.map((o, k) => (
                <div key={`${o.approved_at}-${k}`} className="rev">
                  <div className="rev-h"><span className="av">{String(o.name || "?").charAt(0).toUpperCase()}</span>
                    <div><div style={{ font: "600 15px/1.2 var(--f)" }}>{o.name}</div><div style={{ font: "500 12px/1.4 var(--f)", color: "var(--muted)" }}>{timeAgo(o.approved_at, c.ago)}</div></div>
                    <span className="chip" style={{ marginLeft: "auto" }}>{c.approved}</span></div>
                  <div className="rev-b"><strong>{o.item}</strong></div>
                </div>
              ))}
            </div>
          )}
          {st(orders) === "load" && <p className="sub" style={{ textAlign: "center", marginTop: 48 }}>…</p>}
          {(st(orders) === "empty" || st(orders) === "err") && <p className="sub" style={{ textAlign: "center", marginTop: 48 }}>{st(orders) === "err" ? c.failed : c.empty}</p>}
        </section>

        {/* 6. CREATOR: thẻ nổi bật có mảnh giao diện bị cắt */}
        <section id="creator" className="stage" style={{ paddingBottom: 96 }}>
          <Rise>
            <div className="panel" style={{ minHeight: 0, padding: "40px 32px 0", display: "grid", gap: 32 }}>
              <div>
                <p className="sub" style={{ fontSize: 16 }}>{c.cLabel}</p>
                <h2 className="hd" style={{ marginTop: 8 }}>{c.cTitleA} {c.cTitleB}</h2>
                <p className="lead" style={{ fontSize: 22, marginTop: 16, color: "#ccced0" }}>{c.cH3}</p>
                <p className="sub" style={{ fontSize: 16, marginTop: 12, maxWidth: 520 }}>{c.cBody}</p>
                <ul style={{ listStyle: "none", margin: "20px 0 0", padding: 0, display: "grid", gap: 8 }}>
                  {c.cPerks.map((t) => <li key={t} style={{ font: "500 16px/1.4 var(--f)", color: "#ccced0", display: "flex", gap: 10 }}><span style={{ color: "#59cc33" }}>✓</span>{t}</li>)}
                </ul>
                <div style={{ marginTop: 32 }}><Key href={CREATOR_URL} sm>{c.cCta}</Key></div>
              </div>
              <div className="win" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, marginBottom: 0, alignSelf: "end" }}>
                <div className="win-bar"><i /><i /><i /><span>creator.nxx315.com · {x.demo}</span></div>
                <div className="win-body">
                  {x.rows.map((r) => <div key={r} className="ui"><span className="sq" style={{ background: "#1a66ff" }} /><span>{r}</span><span className="chip">{x.ok}</span></div>)}
                  <div className="ui" style={{ background: "rgba(26,102,255,.14)", color: "#8fb3ff" }}>+ {c.mockGift}</div>
                </div>
              </div>
            </div>
          </Rise>
        </section>

        {/* 7. DẢI SÁNG: chi tiết + minh bạch */}
        <section id="details" className="stage" style={{ paddingBottom: 96 }}>
          <Rise>
            <div className="pale">
              <h2 className="hd" style={{ textAlign: "center", maxWidth: 820, margin: "0 auto" }}>{c.dTitleA} {c.dTitleB}</h2>
              <div className="pgrid">
                {c.dItems.map(([t, d]) => <div key={t} className="porc"><h3>{t}</h3><p>{d}</p></div>)}
                {x.about.map(([t, d], k) => <div key={t} className="porc"><h3>{t}</h3><p>{d}</p>{k === 0 && <Link to="/about">{x.aboutLink} →</Link>}</div>)}
              </div>
            </div>
          </Rise>
          <div style={{ maxWidth: 860, margin: "88px auto 0" }}>
            <h3 className="hd" style={{ fontSize: "clamp(30px,5vw,48px)", marginBottom: 32 }}>{c.faqTitle}</h3>
            {c.faq.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
          </div>
        </section>

        {/* 8. KẾT: lời kêu gọi */}
        <section style={{ position: "relative", textAlign: "center", padding: "96px 0 120px", background: "radial-gradient(50% 50% at 50% 50%,rgba(0,85,204,.12) 0%,rgba(0,85,204,0) 100%)" }}>
          <div className="stage">
            <Rise>
              <span className="mark" style={{ margin: "0 auto 32px", width: 44, height: 44, borderRadius: 14 }}><Logo size={26} /></span>
              <h2 className="hd" style={{ maxWidth: 820, margin: "0 auto" }}>{c.closeA} {c.closeB}</h2>
              <p className="sub" style={{ margin: "20px auto 0", maxWidth: 520 }}>{c.closeSub}</p>
              <div style={{ marginTop: 40, display: "flex", justifyContent: "center" }}><Key to="/register" sm>{c.ctaAccount}</Key></div>
            </Rise>
          </div>
        </section>
      </main>

      {/* CHÂN TRANG + ĐỐNG VIÊN NANG */}
      <footer>
        <div className="stage">
          <div className="fgrid">
            <div className="fbrand">
              <Logo size={40} />
              <p style={{ font: "500 16px/1.5 var(--f)", color: "var(--muted)", margin: "16px 0 0", maxWidth: 300 }}>{c.manifesto}</p>
              <p style={{ font: "500 14px/1.4 var(--f)", color: "var(--muted)", margin: "20px 0 0" }}>© {new Date().getFullYear()} {x.legal}</p>
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
        </div>
        <div className="pile" aria-hidden="true">
          {FOOT_CAPS.map(([ci, rot, ox], k) => (
            <Capsule key={k} i={ci} label={footLabels[k % footLabels.length]} rot={rot} s={1} style={{ left: `${k * 13 - 4 + ox}%`, zIndex: k % 3 }} />
          ))}
        </div>
      </footer>
    </div>
  );
                                                                                                                                                                                                                                                    }
