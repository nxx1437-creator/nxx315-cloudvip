// src/CloudVIPLanding.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "./lib/supabaseClient.js";
import { SITE } from "./lib/siteInfo.js";
import { useI18n } from "./i18n/index.js";
import useTheme from "./hooks/useTheme.js";
import { COPY, CREATOR_URL } from "./lib/landingData.js";
import { FX } from "./lib/landingFxCopy.js";
import { timeAgo, scrollToId } from "./components/LandingBits.jsx";

/* Logo ngôi sao (đầu trang và chân trang) */
const STAR_URL = "https://i.postimg.cc/HLL0BmN7/1ef9365fbb1cd959265e9bf9ba8c45fb.png";
/* Hero: video tự phát. HERO_IMAGE_URL để "" thì hiện bầu trời gradient trong lúc video tải. */
const HERO_VIDEO_URL = "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/Video-hero.mp4";
const HERO_IMAGE_URL = "";
const MEADOW_URL = "";
/* Ảnh lời kêu gọi cuối trang */
const FLOWERS_URL = "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/Hoa-cuc.jpg";

const SKY = "radial-gradient(60% 40% at 20% 15%,rgba(255,255,255,.5),transparent 70%),radial-gradient(50% 35% at 80% 30%,rgba(255,255,255,.35),transparent 70%),linear-gradient(#1673d1,#5ab0f2 70%,#9fd2f7)";
const MEADOW = "radial-gradient(80% 60% at 50% 110%,#61a133,transparent 70%),linear-gradient(#0e2a12,#2f6a1c)";
const FLOWERS = "radial-gradient(70% 50% at 30% 70%,rgba(255,255,255,.3),transparent 70%),radial-gradient(60% 50% at 75% 80%,#cc7c01,transparent 70%),linear-gradient(#0a1f0d,#2f6a1c)";
const bg = (url, fb, shade) => (url ? `${shade ? `linear-gradient(rgba(0,0,0,${shade}),rgba(0,0,0,${shade})),` : ""}url(${url}) center/cover, ${fb}` : fb);

const GAMES = ["Free Fire", "Liên Quân", "Play Together", "Valorant", "FC Mobile", "Roblox"];

/* Nội dung mới giới thiệu về web (chỉ ghi những gì web có) */
const EXTRA = {
  vi: {
    fCap: "Trên web", fTitle: "Mọi thứ trong *một tài khoản*.",
    fSub: "Làm nhiệm vụ, nạp game, đổi quà và theo dõi đơn, tất cả ở nxx315.com.",
    cards: [
      ["Nhiệm vụ mỗi ngày", "Nhận xu miễn phí hằng ngày hoặc tham gia các sự kiện."],
      ["Đổi quà thật", "Robux, Quân Huy, Kim Cương và nhiều quà khác. Đơn được kiểm tra trước khi giao."],
      ["Tài khoản gọn nhẹ", "Đăng nhập bằng Google hoặc liên kết gửi qua email, không cần mật khẩu."],
      ["Minh bạch", "Biết ai vận hành, xu đến từ đâu, hoàn tiền và khiếu nại thế nào."],
    ],
    aboutLink: "Đọc trang Giới thiệu",
    gameTitle: "Nạp game *bằng Coin*.", gameText: "Dùng Coin nạp thẳng vào các game bạn chơi mỗi ngày.",
    gameCap: "6 game",
    mockRows: ["Video #1", "Video #2", "Video #3"], mockOk: "Đã duyệt",
    bottom: "Roblox · Creator",
  },
  en: {
    fCap: "On the site", fTitle: "Everything in *one account*.",
    fSub: "Do tasks, top up games, redeem rewards and track orders, all at nxx315.com.",
    cards: [
      ["Daily tasks", "Earn free coins every day or join events."],
      ["Real rewards", "Robux, game currency and more. Orders are checked before delivery."],
      ["Light account", "Sign in with Google or an emailed link, no password needed."],
      ["Transparent", "Know who runs it, where coins come from, and how refunds and complaints work."],
    ],
    aboutLink: "Read the About page",
    gameTitle: "Top up games *with Coins*.", gameText: "Use Coins to top up the games you play every day.",
    gameCap: "6 games",
    mockRows: ["Video #1", "Video #2", "Video #3"], mockOk: "Approved",
    bottom: "Roblox · Creator",
  },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&family=Inter:wght@300;400&family=Roboto+Mono:wght@400;500&display=swap');
.nl{--serif:"Lyondisplay App","Cormorant Garamond",Georgia,serif;background:#050505;color:#fff;font-family:"Inter",Arial,sans-serif;font-weight:300;overflow-x:hidden;min-height:100vh;-webkit-font-smoothing:antialiased}
.nl a{color:inherit;text-decoration:none}
.nl .serif{font-family:var(--serif);font-weight:300}
.nl em{font-style:italic}
.nl .mono{font-family:"Roboto Mono",monospace}
.nl .h1{font-size:clamp(48px,8vw,96px);line-height:1.15}
.nl .h1,.nl .h2{text-wrap:balance}
.nl .h2{font-size:clamp(44px,6.6vw,80px);line-height:1;letter-spacing:-.01em;color:#fafafa}
.nl .h3{font-size:clamp(32px,4vw,48px);line-height:1.15}
.nl .h4{font-size:38px;line-height:.9}
.nl .btn{display:inline-flex;align-items:center;gap:8px;height:48px;padding:0 20px;border:0;border-radius:8px;background:#fff;color:#000;cursor:pointer;font:500 12px/2 "Roboto Mono",monospace;letter-spacing:.021em;text-transform:uppercase;transition:background-color .2s}
.nl .btn:hover{background:#e6e6e6}
.nl .btn2{background:#131313;color:#fff;border:1px solid rgba(255,255,255,.08)}
.nl .btn2:hover{background:#222}
.nl .sm{height:36px;padding:0 14px}
.nl .card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:24px}
.nl .nav{font:400 12px/1.5 "Roboto Mono",monospace;letter-spacing:.021em;text-transform:uppercase;background:none;border:0;color:#fff;cursor:pointer;padding:0}
.nl .cap{font:400 11px/1.4 "Roboto Mono",monospace;letter-spacing:.182em;text-transform:uppercase;color:#9b9b9b}
.nl .wrap{max-width:1280px;margin:0 auto;padding:0 32px}
.nl .sup{color:#9b9b9b}
.nl .sec{padding:112px 0}
.nl .rise{opacity:0;transform:translate3d(0,18px,0);transition:opacity .6s cubic-bezier(.22,1,.36,1),transform .6s cubic-bezier(.22,1,.36,1)}
.nl .rise.in{opacity:1;transform:none}
.nl details{border-top:1px solid rgba(255,255,255,.14)}
.nl details:last-child{border-bottom:1px solid rgba(255,255,255,.14)}
.nl summary{cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:16px;padding:20px 0;font-weight:400}
.nl summary::-webkit-details-marker{display:none}
.nl summary::after{content:"+";font-family:"Roboto Mono",monospace;color:#9b9b9b}
.nl details[open] summary::after{content:"−"}
.nl details p{padding-bottom:20px;color:#9b9b9b;max-width:640px;line-height:1.5}
.nl .fh{font:500 13px/1.4 "Roboto Mono",monospace;letter-spacing:.08em;text-transform:uppercase;color:#fff;margin-bottom:12px}
.nl .fl{list-style:none;margin:0;padding:0}
.nl .fl li{font-size:17px;line-height:2.3;color:#9b9b9b}
.nl .fl a,.nl .fl button{color:inherit;background:none;border:0;padding:0;font:inherit;cursor:pointer;text-align:left;transition:color .2s}
.nl .fl a:hover,.nl .fl button:hover{color:#fff}
@keyframes drift{from{transform:translate3d(-3%,0,0) scale(1)}to{transform:translate3d(3%,-2%,0) scale(1.08)}}
@keyframes slide{to{transform:translateX(-50%)}}
@keyframes pulse{50%{opacity:.35}}
.nl .drift{animation:drift 24s ease-in-out infinite alternate}
.nl .track{display:flex;width:max-content;animation:slide 40s linear infinite}
.nl .dot{animation:pulse 2s infinite}
@media(prefers-reduced-motion:reduce){.nl .drift,.nl .track,.nl .dot{animation:none}.nl .rise{transform:none;transition:opacity .3s}}
/* === HEADER MỚI === */
.nl .topbar-wrap { padding-top: 16px; padding-left: 16px; padding-right: 16px; }
.nl .topbar { 
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  border-radius: 999px; padding: 6px 6px 6px 16px; border: 1px solid #e6e6df; box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}
.nl .topbar-logo { display: flex; align-items: center; gap: 10px; color: #2b2b2b; text-decoration: none; }
.nl .topbar-logo img { width: 28px; height: 28px; border-radius: 50%; background: #f2f2ee; padding: 4px; }
.nl .topbar-logo span { font-weight: 600; font-size: 15px; letter-spacing: -0.01em; }
.nl .topbar-menu { display: flex; align-items: center; gap: 8px; }
.nl .topbar-link { 
  font-size: 14px; font-weight: 500; color: #555; padding: 8px 14px; border-radius: 999px; 
  transition: background 0.2s, color 0.2s; cursor: pointer; background: none; border: 0;
}
.nl .topbar-link:hover { background: #f2f2ee; color: #000; }
.nl .topbar-btn { 
  display: inline-flex; align-items: center; justify-content: center; height: 36px; padding: 0 18px; 
  border-radius: 999px; background: #2b2b2b; color: #fff; font-size: 13px; font-weight: 600; 
  text-transform: uppercase; letter-spacing: 0.05em; transition: transform 0.15s;
}
.nl .topbar-btn:active { transform: scale(0.95); }

@media (max-width: 767px) {
  .nl .topbar-wrap { padding-top: 12px; padding-left: 12px; padding-right: 12px; }
  .nl .topbar-logo span { display: none; } /* Ẩn chữ trên mobile, chỉ giữ logo */
  .nl .topbar-menu { gap: 4px; }
  .nl .topbar-link { font-size: 12px; padding: 6px 10px; }
  .nl .topbar-btn { height: 32px; padding: 0 14px; font-size: 11px; }
}
@media(max-width:767px){.nl .wrap{padding:0 20px}.nl .sec{padding:80px 0}.nl .links{display:none}}
`;

const Em = ({ t }) => { const w = t.split(" "); return <>{w.slice(0, -1).join(" ")}{w.length > 1 ? " " : ""}<em>{w[w.length - 1]}</em></>; };
const rt = (s) => s.split(/(\*[^*]+\*)/g).map((x, i) => (x.length > 2 && x.startsWith("*") && x.endsWith("*") ? <em key={i}>{x.slice(1, -1)}</em> : x));
const story = (s) => s.split(" ").map((w, i) => (w.startsWith("*") ? <em key={i}>{w.slice(1)} </em> : <span key={i}>{w} </span>));
const nf = (n, lang) => Number(n).toLocaleString(lang === "en" ? "en-US" : "vi-VN");

const Logo = ({ size = 32 }) => (
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

const Head = ({ cap, a, b, sub }) => (
  <Rise>
    <p className="cap">{cap}</p>
    <h2 className="serif h2 mt-4 max-w-[900px]">{a} <em>{b}</em></h2>
    {sub && <p className="sup mt-5 max-w-[460px] leading-normal">{sub}</p>}
  </Rise>
);

function Scene({ bgImage, glow, title, text, children }) {
  return (
    <div className="relative flex min-h-[460px] flex-col justify-between overflow-hidden rounded-3xl p-8" style={{ background: bgImage }}>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2" style={{ background: `radial-gradient(70% 100% at 50% 100%,${glow},transparent)`, opacity: 0.6 }} />
      <h3 className="serif h3 relative mt-4 text-center">{rt(title)}</h3>
      <div className="relative">{children}</div>
      <p className="relative mx-auto max-w-[420px] text-center text-xl leading-[1.35] tracking-[-.01em]" style={{ color: "rgba(255,255,255,.92)" }}>{text}</p>
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
  const heroVid = useRef(null);

  /* Ép video hero tự phát (một số trình duyệt điện thoại cần gọi play()) */
  useEffect(() => {
    const v = heroVid.current;
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

  const top3 = Array.isArray(board) ? board.slice(0, 3) : [];
  const rest = Array.isArray(board) ? board.slice(3) : [];
  const st = (v) => (v === undefined ? "load" : v === null ? "err" : v.length ? "ok" : "empty");
  const marquee = useMemo(() => [...fx.marquee, ...fx.marquee], [fx.marquee]);

  return (
    <div className="nl">
      <style>{CSS}</style>

      {/* THANH ĐIỀU HƯỚNG MỚI (Dạng viên thuốc bo tròn) */}
<div className="topbar-wrap fixed inset-x-0 top-0 z-50 flex justify-center pointer-events-none">
  <div className="topbar pointer-events-auto w-full max-w-[1280px]">
    <Link to="/" aria-label="NXX315 Studio" className="topbar-logo">
      <Logo size={28} />
      <span>NXX315 Studio</span>
    </Link>
    
    <nav className="hidden md:flex items-center gap-1" aria-label="Main">
      {c.nav.map(([id, l]) => (
        <button key={id} type="button" className="topbar-link" onClick={() => scrollToId(id)}>{l}</button>
      ))}
    </nav>

    <div className="topbar-menu">
      {typeof setLang === "function" && (
        <button type="button" className="topbar-link" onClick={() => setLang(lang === "vi" ? "en" : "vi")}>
          {c.langBtn}
        </button>
      )}
      <Link to="/login" className="topbar-link">{c.login}</Link>
      <Link to="/register" className="topbar-btn">{c.start}</Link>
    </div>
  </div>
</div>
        {/* 1. MỞ ĐẦU */}
        <section className="relative overflow-hidden pt-40 text-center" style={{ background: bg(HERO_IMAGE_URL, SKY, 0.2) }}>
          {HERO_VIDEO_URL && (
            <>
              <video ref={heroVid} className="absolute inset-0 h-full w-full object-cover" src={HERO_VIDEO_URL} autoPlay muted loop playsInline preload="auto" aria-hidden="true" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(rgba(0,0,0,.35),rgba(0,0,0,.25))" }} />
            </>
          )}
          <div className="wrap relative">
            <h1 className="serif h1 mx-auto max-w-[830px]">
              {c.h1a} <em>{c.h1b}</em>, {c.h1c.toLowerCase()}, {c.h1d}
            </h1>
            <p className="mx-auto mt-6 max-w-[420px] rounded-xl px-5 py-3 leading-normal" style={{ color: "#fff", background: "rgba(255,255,255,.12)", backdropFilter: "blur(14px) saturate(140%)", WebkitBackdropFilter: "blur(14px) saturate(140%)", border: "1px solid rgba(255,255,255,.22)", textShadow: "0 1px 8px rgba(0,0,0,.35)" }}>{c.heroSub}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/register" className="btn">{c.ctaAccount}<span aria-hidden>→</span></Link>
              <a href={CREATOR_URL} className="btn btn2">{c.ctaCreator}<span aria-hidden>→</span></a>
            </div>

            <div className="relative mx-auto mt-16 h-[340px] w-[min(560px,92vw)] overflow-hidden rounded-t-[56px] border-[10px] border-b-0 border-[#0b0b0b] bg-[#050505] text-left">
              <div className="absolute left-1/2 top-3 h-6 w-24 -translate-x-1/2 rounded-full border border-white/10 bg-black" />
              <div className="px-7 pt-20">
                <p className="cap flex items-center gap-2"><i className="dot inline-block h-1.5 w-1.5 rounded-full bg-[#61a133]" />{c.ticketMeta}</p>
                <p className="serif mt-4 text-[40px] leading-[1.1]"><Em t={c.ticketTitle} /></p>
                <p className="mt-3 text-base leading-normal sup">{c.ticketNote}</p>
                {top3[0] && (
                  <div className="card mt-5 flex items-center justify-between p-4">
                    <span className="mono text-[12px] uppercase tracking-[.021em]">TOP 1 · {c.week}</span>
                    <span className="text-sm">{top3[0].name} · {nf(top3[0].coins, lang)} {c.unit}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24" style={{ background: "linear-gradient(transparent,#050505)" }} />
        </section>

        {/* 2. CÂU DẪN */}
        <section className="wrap py-32 text-center">
          <Rise><p className="serif h3 mx-auto max-w-[820px]">{story(fx.story)}</p></Rise>
        </section>

        {/* CHỮ CHẠY NGANG */}
        <div className="overflow-hidden border-y border-white/[.08] py-6" aria-hidden="true">
          <div className="track">
            {marquee.map((m, i) => <span key={i} className="serif px-8 text-[38px] leading-[.9]" style={{ color: "rgba(255,255,255,.32)" }}>{m}</span>)}
          </div>
        </div>

        {/* 3. BẮT ĐẦU */}
        <section id="onboarding" className="sec">
          <div className="wrap">
            <Head cap={c.obLabel} a={c.obTitleA} b={c.obTitleB} sub={c.obBody} />
            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {c.obSteps.map(([n, t, d], i) => (
                <Rise key={n} delay={i * 80}>
                  <div className="card flex h-full min-h-[260px] flex-col justify-between p-6">
                    <span className="cap">{n}</span>
                    <div>
                      <h3 className="serif h4"><Em t={t} /></h3>
                      <p className="mt-4 text-base leading-normal sup">{d}</p>
                    </div>
                  </div>
                </Rise>
              ))}
            </div>
            <div className="mt-10"><Link to="/register" className="btn">{c.obCta}<span aria-hidden>→</span></Link></div>
          </div>
        </section>

        {/* 4. TRÊN WEB */}
        <section id="features" className="sec pt-0">
          <div className="wrap">
            <Rise className="mb-16 text-center">
              <p className="cap">{x.fCap}</p>
              <h2 className="serif h2 mx-auto mt-4 max-w-[900px]">{rt(x.fTitle)}</h2>
              <p className="sup mx-auto mt-5 max-w-[460px] leading-normal">{x.fSub}</p>
            </Rise>

            <div className="grid gap-6 md:grid-cols-2">
              <Scene bgImage={bg(MEADOW_URL, MEADOW)} glow="#61a133" title={x.gameTitle} text={x.gameText}>
                <p className="cap mb-3 text-center" style={{ color: "rgba(255,255,255,.8)" }}>{x.gameCap}</p>
                <div className="mx-auto grid max-w-[360px] grid-cols-2 gap-2">
                  {GAMES.map((g) => <div key={g} className="rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-center text-sm backdrop-blur-sm">{g}</div>)}
                </div>
              </Scene>
              <div className="grid gap-6 sm:grid-cols-2">
                {x.cards.map(([t, d], i) => (
                  <Rise key={t} delay={i * 80} className="h-full">
                    <div className="card flex h-full min-h-[220px] flex-col justify-between p-6">
                      <span className="cap">{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        <h3 className="serif text-[28px] leading-[1]">{t}</h3>
                        <p className="mt-3 text-[15px] leading-snug sup">{d}</p>
                        {i === 3 && <Link to="/about" className="mt-3 inline-block text-sm underline underline-offset-4">{x.aboutLink} →</Link>}
                      </div>
                    </div>
                  </Rise>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. MỜI BẠN */}
        <section id="invite" className="sec">
          <div className="wrap">
            <Head cap={c.iLabel} a={c.iTitleA} b={c.iTitleB} sub={c.iBody} />
            <div className="mt-16 grid gap-12 md:grid-cols-3">
              {c.iCols.map(([big, d], i) => (
                <Rise key={big} delay={i * 80}>
                  <div className="text-[50px] font-normal leading-[1.1]">{big}</div>
                  <p className="mt-2 text-xl leading-normal sup">{d}</p>
                </Rise>
              ))}
            </div>
            <div className="mt-12"><Link to="/register" className="btn btn2">{c.iCta}<span aria-hidden>→</span></Link></div>
          </div>
        </section>

        {/* 6. XẾP HẠNG */}
        <section id="rank" className="relative overflow-hidden sec">
          <div className="drift pointer-events-none absolute -top-40 left-1/2 h-[400px] w-[900px] -translate-x-1/2 opacity-30 blur-3xl" style={{ background: "radial-gradient(closest-side,#847dff,transparent)" }} />
          <div className="wrap relative">
            <Head cap={c.rLabel} a={c.rTitleA} b={c.rTitleB} sub={c.rSub} />
            {st(board) === "load" && (
              <div className="mt-16 grid gap-6 md:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="card dot h-[240px]" />)}</div>
            )}
            {st(board) === "ok" && (
              <div className="mt-16 grid gap-6 md:grid-cols-3">
                {top3.map((r, i) => (
                  <Rise key={r.rank} delay={i * 80}>
                    <div className="card flex h-full min-h-[240px] flex-col justify-between p-6">
                      <div className="flex items-start justify-between">
                        <span className="cap">TOP {r.rank} · {c.week}</span>
                        <span className="serif text-[64px] leading-[.9]" style={{ color: "rgba(255,255,255,.2)" }}>0{r.rank}</span>
                      </div>
                      <div>
                        <p className="text-xl leading-tight">{r.name}</p>
                        <p className="mt-2 text-[50px] font-normal leading-[1.1]">{nf(r.coins, lang)}</p>
                        <p className="sup">{c.unit}</p>
                      </div>
                    </div>
                  </Rise>
                ))}
              </div>
            )}
            {(st(board) === "empty" || st(board) === "err") && <p className="sup mt-12">{st(board) === "err" ? c.failed : c.empty}</p>}
            {rest.length > 0 && (
              <div className="mt-10 border-t border-white/[.14]">
                {rest.map((r) => (
                  <div key={r.rank} className="flex items-center gap-4 border-b border-white/[.14] py-4">
                    <span className="mono w-8 text-[12px] sup">{String(r.rank).padStart(2, "0")}</span>
                    <span className="flex-1 text-base">{r.name}</span>
                    <span className="text-base sup">{nf(r.coins, lang)} {c.unit}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 7. ĐƠN ĐÃ DUYỆT */}
        <section id="orders" className="sec">
          <div className="wrap">
            <Head cap={c.oLabel} a={c.oTitleA} b={c.oTitleB} sub={c.oSub} />
            {st(orders) === "ok" && (
              <div className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
                {orders.map((o, i) => (
                  <Rise key={`${o.approved_at}-${i}`} delay={(i % 4) * 60}>
                    <p className="mono flex items-center gap-2 text-[12px] uppercase tracking-[.021em]" style={{ color: "#61a133" }}>
                      <i className="inline-block h-1.5 w-1.5 rounded-full bg-[#61a133]" />{c.approved}
                    </p>
                    <p className="mt-3 text-xl leading-snug">{o.item}</p>
                    <p className="mt-2 text-sm sup">{o.name} · {timeAgo(o.approved_at, c.ago)}</p>
                  </Rise>
                ))}
              </div>
            )}
            {st(orders) === "load" && <p className="sup mt-12">…</p>}
            {(st(orders) === "empty" || st(orders) === "err") && <p className="sup mt-12">{st(orders) === "err" ? c.failed : c.empty}</p>}
          </div>
        </section>

        {/* 8. CHI TIẾT + HỎI ĐÁP */}
        <section id="details" className="sec">
          <div className="wrap">
            <Head cap={c.dLabel} a={c.dTitleA} b={c.dTitleB} />
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {c.dItems.map(([t, d], i) => (
                <Rise key={t} delay={i * 80}>
                  <div className="card h-full p-6">
                    <h3 className="text-xl leading-tight tracking-[-.01em]">{t}</h3>
                    <p className="mt-3 text-base leading-snug sup">{d}</p>
                  </div>
                </Rise>
              ))}
            </div>
            <h3 className="serif h4 mb-8 mt-28">{c.faqTitle}</h3>
            <div className="max-w-[860px]">
              {c.faq.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
            </div>
          </div>
        </section>

        {/* 9. CREATOR */}
        <section id="creator" className="sec">
          <div className="wrap">
            <div className="card relative overflow-hidden p-8 md:p-14">
              <div className="drift pointer-events-none absolute -right-20 -top-20 h-[360px] w-[360px] opacity-30 blur-3xl" style={{ background: "radial-gradient(closest-side,#847dff,transparent)" }} />
              <div className="relative">
                <p className="cap">{c.cLabel}</p>
                <h2 className="serif h2 mt-4 max-w-[800px]">{c.cTitleA} <em>{c.cTitleB}</em></h2>
              </div>
              <div className="relative mt-14 grid items-center gap-12 md:grid-cols-2">
                <div>
                  <h3 className="serif h4">{c.cH3}</h3>
                  <p className="mt-5 text-base leading-normal sup">{c.cBody}</p>
                  <ul className="mt-6 space-y-2.5">
                    {c.cPerks.map((t) => (
                      <li key={t} className="flex gap-3 text-base leading-normal sup"><span className="mt-[10px] h-1 w-1 shrink-0 rounded-full bg-white/60" />{t}</li>
                    ))}
                  </ul>
                  <div className="mt-8"><a href={CREATOR_URL} className="btn">{c.cCta}<span aria-hidden>→</span></a></div>
                </div>
                <div className="rounded-3xl border border-white/[.08] bg-[#0f0f0f] p-5">
                  <div className="flex items-center justify-between">
                    <span className="mono text-[12px] sup">creator.nxx315.com</span>
                    <span className="cap">{c.mockTag}</span>
                  </div>
                  <div className="mt-5 space-y-2">
                    {x.mockRows.map((r) => (
                      <div key={r} className="card !rounded-xl flex items-center justify-between px-4 py-3 text-sm">
                        <span>{r}</span>
                        <span className="mono text-[12px] uppercase tracking-[.021em]" style={{ color: "#61a133" }}>{x.mockOk}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mono mt-5 inline-block rounded-lg bg-white px-3 py-2 text-[12px] uppercase tracking-[.021em] text-black">+ {c.mockGift}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* LỜI KÊU GỌI CUỐI + CHÂN TRANG */}
      <footer>
        <section className="relative overflow-hidden py-48 text-center" style={{ background: bg(FLOWERS_URL, FLOWERS, 0.3) }}>
          <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(#050505,transparent 25%,transparent 60%,#050505)" }} />
          <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg,transparent,#219ff8,#847dff,transparent)" }} />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-40 blur-2xl" style={{ background: "linear-gradient(90deg,transparent,#219ff8,#847dff,transparent)" }} />
          <div className="wrap relative">
            <h2 className="serif h2 mx-auto max-w-[900px] !text-[clamp(52px,9vw,96px)] !leading-[.9]">{c.closeA} <em>{c.closeB}</em></h2>
            <p className="mx-auto mt-6 max-w-[420px] text-lg" style={{ color: "rgba(255,255,255,.92)" }}>{c.closeSub}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/register" className="btn">{c.ctaAccount}<span aria-hidden>→</span></Link>
              <a href={CREATOR_URL} className="btn btn2">{c.ctaCreator}<span aria-hidden>→</span></a>
            </div>
          </div>
        </section>

        <div className="wrap pb-12 pt-10">
          <div className="flex flex-col gap-5 md:max-w-[460px]">
            <div className="flex items-center gap-3">
              <Logo size={44} />
              <span className="mono text-[15px] font-medium uppercase tracking-[.08em]">NXX315 Studio</span>
            </div>
            <p className="text-lg leading-[1.5]" style={{ color: "#c9c9c9" }}>{c.manifesto}</p>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
            <div>
              <h4 className="fh">{c.fCols[0]}</h4>
              <ul className="fl">
                {c.fExplore.map(([id, l]) => <li key={id}><button type="button" onClick={() => scrollToId(id)}>{l}</button></li>)}
              </ul>
            </div>
            <div>
              <h4 className="fh">{c.fCols[1]}</h4>
              <ul className="fl">{c.fAccount.map(([to, l]) => <li key={to}><Link to={to}>{l}</Link></li>)}</ul>
            </div>
            <div>
              <h4 className="fh">{c.fCols[2]}</h4>
              <ul className="fl">{c.fLegal.map(([to, l]) => <li key={to}><Link to={to}>{l}</Link></li>)}</ul>
            </div>
            <div>
              <h4 className="fh">{c.fCols[3]}</h4>
              <ul className="fl">
                {SITE?.youtube && <li><a href={SITE.youtube} target="_blank" rel="noopener noreferrer">YouTube</a></li>}
                {SITE?.zaloUrl && <li><a href={SITE.zaloUrl} target="_blank" rel="noopener noreferrer">Zalo</a></li>}
                {SITE?.email && <li><a href={`mailto:${SITE.email}`} className="break-all">{SITE.email}</a></li>}
                <li><a href={CREATOR_URL}>Creator</a></li>
              </ul>
            </div>
          </div>

          <div className="mono mt-14 flex flex-wrap justify-between gap-3 border-t border-white/[.14] pt-6 text-[13px] uppercase tracking-[.08em] sup">
            <span>© {new Date().getFullYear()} Nxx315 Studio</span>
            <span>{x.bottom}</span>
          </div>
        </div>
      </footer>
    </div>
  );
      }
