import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Pause, Play, Volume2, VolumeX, UserCheck, Coins, Ban, Wallet, RotateCcw, MessageCircle, Users, Mail } from "lucide-react";
import { StarMark } from "../components/LandingParts.jsx";
import { SITE } from "../lib/siteInfo.js";
import { useI18n } from "../i18n/index.js";
import { buildAbout, OFFICIAL_EMAIL } from "../lib/aboutCopy.js";

/* ẢNH THIÊN NHIÊN: tải ảnh thật lên Supabase (bucket game_logos) rồi ghi TÊN FILE,
   hoặc để ảnh trong /public và ghi "/ten-anh.jpg". Để "" thì dùng nền gradient. */
const BASE = "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/";
const imgUrl = (n) => (/^(https?:|\/)/.test(n) ? n : BASE + n);
const NATURE = { sky: "", meadow: "", flowers: "" };
const bg = (name, fallback) => (name ? `url(${imgUrl(name)}) center/cover, ${fallback}` : fallback);

/* VIDEO (luôn ở CUỐI trang). Để VIDEO = "" nếu muốn ẩn. */
const VIDEO = "/about-video.mp4";
const POSTER = "/about-video-poster.jpg";

const SKY = "radial-gradient(60% 40% at 20% 15%,rgba(255,255,255,.55),transparent 70%),radial-gradient(50% 35% at 80% 30%,rgba(255,255,255,.4),transparent 70%),linear-gradient(#1673d1,#5ab0f2 70%,#9fd2f7)";
const MEADOW = "radial-gradient(80% 60% at 50% 110%,#61a133,transparent 70%),linear-gradient(#0e2a12,#2f6a1c)";
const FLOWERS = "radial-gradient(70% 50% at 30% 70%,rgba(255,255,255,.3),transparent 70%),radial-gradient(60% 50% at 75% 80%,#cc7c01,transparent 70%),linear-gradient(#0a1f0d,#2f6a1c)";

const ICONS = { ai: UserCheck, "nguon-xu": Coins, "khong-lam": Ban, "rut-xu": Wallet, "hoan-tien": RotateCcw, "khieu-nai": MessageCircle, "gioi-thieu": Users, "lien-he": Mail };
const GAMES = ["Free Fire", "Liên Quân", "Play Together", "Valorant", "FC Mobile", "Roblox"];
const TONE = { green: "#61a133", rose: "#e5566b", amber: "#cc7c01" };

/* Nội dung giới thiệu về web (chỉ ghi những gì web thật sự có) */
const WEB = {
  vi: {
    cap: "Về web", title: "Làm nhiệm vụ, nhận Coin, đổi quà.",
    sub: "Mọi thứ nằm trong một tài khoản. Bạn làm đến đâu, nhận đến đó.",
    cards: [
      ["Nhiệm vụ", "Làm nhiệm vụ từ các đối tác và nhận Coin khi nhiệm vụ được xác nhận hợp lệ."],
      ["Bảng xếp hạng", "Bục top 1–2–3 cập nhật trực tiếp. Người đứng top mỗi tháng nhận tiền thưởng."],
      ["Cửa hàng", "Dùng Coin đổi quà game, hoặc mua trực tiếp bằng chuyển khoản."],
    ],
    gameTitle: "Nạp game bằng Coin.", gameText: "Dùng Coin nạp thẳng vào các game bạn chơi mỗi ngày.",
    refCap: "Chương trình giới thiệu", refTitle: "Mời bạn, cùng nhận.",
    refText: "Người được mời nhận 200 xu khi nhập mã. Bạn nhận 15% số xu họ kiếm từ nhiệm vụ, kèm thưởng mốc khi đủ 3, 5, 10 và 20 người.",
    stats: [["6", "game nạp được bằng Coin"], ["200", "xu cho người được mời"], ["15%", "xu bạn nhận từ người bạn mời"]],
    accCap: "Tài khoản & hỗ trợ", accTitle: "Gọn, rõ, không rườm rà.",
    acc: ["Đăng nhập bằng Google hoặc liên kết qua email, không cần mật khẩu.", "Hồ sơ có ảnh bìa, huy hiệu và tích xanh xác minh.", "Có chat hỗ trợ và email hỗ trợ chính thức."],
    trustCap: "Minh bạch", trustTitle: "Điều bạn nên biết trước.",
    closeTitle: "Còn thắc mắc? Hãy hỏi chúng tôi.", closeText: "Chúng tôi trả lời qua các kênh chính thức bên dưới.",
    start: "Bắt đầu", read: "Đọc phần minh bạch", chat: "Chat hỗ trợ", mail: "Gửi email", back: "Quay lại", home: "Trang chủ", toc: "Mục lục",
    vTitle: "Xem nhanh trong 1 phút", vCap: "Tóm tắt trang này bằng video, không cần đọc hết.", sound: "Bật nhạc nền", mute: "Tắt nhạc nền", play: "Phát video", pause: "Tạm dừng video",
  },
  en: {
    cap: "About the site", title: "Do tasks, earn Coins, redeem gifts.",
    sub: "Everything lives in one account. You earn as much as you do.",
    cards: [
      ["Tasks", "Complete tasks from partners and earn Coins once a task is validly confirmed."],
      ["Leaderboard", "A live top 1–2–3 podium. Top ranks each month receive a cash reward."],
      ["Store", "Spend Coins on game gifts, or buy directly by bank transfer."],
    ],
    gameTitle: "Top up games with Coins.", gameText: "Use Coins to top up the games you play every day.",
    refCap: "Referral program", refTitle: "Invite friends, earn together.",
    refText: "A friend who enters your code gets 200 coins. You get 15% of the coins they earn from tasks, plus bonuses at 3, 5, 10 and 20 invites.",
    stats: [["6", "games you can top up with Coins"], ["200", "coins for each invited friend"], ["15%", "of your friends' task coins go to you"]],
    accCap: "Account & support", accTitle: "Simple, clear, no clutter.",
    acc: ["Sign in with Google or an email link, no password needed.", "Profiles have a cover photo, badges and a verified tick.", "Support chat and an official support email."],
    trustCap: "Transparency", trustTitle: "What you should know first.",
    closeTitle: "Questions? Just ask us.", closeText: "We answer through the official channels below.",
    start: "Get started", read: "Read the transparency notes", chat: "Support chat", mail: "Send email", back: "Back", home: "Home", toc: "Contents",
    vTitle: "Watch in one minute", vCap: "A short video summary of this page.", sound: "Turn music on", mute: "Turn music off", play: "Play video", pause: "Pause video",
  },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&family=Inter:wght@300;400&family=Roboto+Mono:wght@400;500&display=swap');
.ab{--serif:"Lyondisplay App","Cormorant Garamond",Georgia,serif;background:#050505;color:#fff;font-family:"Inter",Arial,sans-serif;font-weight:300;overflow-x:hidden;min-height:100vh;-webkit-font-smoothing:antialiased}
.ab .serif{font-family:var(--serif);font-weight:300}
.ab em{font-style:italic}
.ab .mono{font-family:"Roboto Mono",monospace}
.ab .h1{font-size:clamp(48px,8vw,96px);line-height:1.15}
.ab .h2{font-size:clamp(44px,6.6vw,80px);line-height:1;letter-spacing:-.01em;color:#fafafa}
.ab .h3{font-size:clamp(32px,4vw,48px);line-height:1.15}
.ab .h4{font-size:38px;line-height:.9}
.ab .btn{display:inline-flex;align-items:center;gap:8px;height:48px;padding:0 20px;border-radius:8px;background:#fff;color:#000;font:500 12px/2 "Roboto Mono",monospace;letter-spacing:.021em;text-transform:uppercase;transition:background-color .2s}
.ab .btn:hover{background:#e6e6e6}
.ab .btn2{background:#131313;color:#fff;border:1px solid rgba(255,255,255,.08)}
.ab .btn2:hover{background:#222}
.ab .card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:24px}
.ab .nav{font:400 12px/1.5 "Roboto Mono",monospace;letter-spacing:.021em;text-transform:uppercase}
.ab .cap{font:400 11px/1.4 "Roboto Mono",monospace;letter-spacing:.182em;text-transform:uppercase;color:#9b9b9b}
.ab .wrap{max-width:1280px;margin:0 auto;padding:0 32px}
.ab .sup{color:#9b9b9b}
.ab .rise{opacity:0;transform:translate3d(0,18px,0);transition:opacity .6s cubic-bezier(.22,1,.36,1),transform .6s cubic-bezier(.22,1,.36,1)}
.ab .rise.in{opacity:1;transform:none}
@keyframes drift{from{transform:translate3d(-3%,0,0) scale(1)}to{transform:translate3d(3%,-2%,0) scale(1.08)}}
.ab .drift{animation:drift 24s ease-in-out infinite alternate}
@media(prefers-reduced-motion:reduce){.ab .drift{animation:none}.ab .rise{transform:none;transition:opacity .3s}}
@media(max-width:767px){.ab .wrap{padding:0 20px}}
`;

const Em = ({ t }) => { const w = t.split(" "); return <>{w.slice(0, -1).join(" ")}{w.length > 1 ? " " : ""}<em>{w[w.length - 1]}</em></>; };
const pad = (n) => String(n).padStart(2, "0");
const rich = (s) => s.split(/(\*\*[^*]+\*\*)/g).map((x, i) => (x.startsWith("**") ? <strong key={i} className="font-normal text-white">{x.slice(2, -2)}</strong> : x));

function Rise({ children, className = "" }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) { setOn(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.08 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`rise ${on ? "in" : ""} ${className}`}>{children}</div>;
}

const Bullets = ({ items }) => (
  <ul className="mt-4 space-y-2.5">
    {items.map((x) => (
      <li key={x} className="flex gap-3 text-base leading-normal sup">
        <span className="mt-[10px] h-1 w-1 shrink-0 rounded-full bg-white/60" /><span>{x}</span>
      </li>
    ))}
  </ul>
);

function Block({ b }) {
  if (b.t === "p") return <p className="mt-3 text-base leading-[1.55] sup">{rich(b.x)}</p>;
  if (b.t === "list") return <Bullets items={b.items} />;
  if (b.t === "rows") return (
    <dl className="mt-4 border-t border-white/[.14]">
      {b.rows.map(([k, v]) => (
        <div key={k} className="grid gap-1 border-b border-white/[.14] py-3.5 sm:grid-cols-[190px_1fr] sm:gap-6">
          <dt className="text-[13px] sup">{k}</dt>
          <dd className="break-words text-base leading-normal text-white">
            {typeof v === "string" ? v
              : v.to ? <Link to={v.to} className="underline underline-offset-4">{v.text}</Link>
              : <a href={v.href} {...(v.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="break-all underline underline-offset-4">{v.text}</a>}
          </dd>
        </div>
      ))}
    </dl>
  );
  if (b.t === "links") return (
    <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
      {b.items.map(([to, label]) => <Link key={to} to={to} className="inline-flex items-center gap-1 text-base text-white underline underline-offset-4">{label} <ArrowRight size={14} strokeWidth={1.5} /></Link>)}
    </div>
  );
  const c = TONE[b.tone] || TONE.amber;
  return (
    <div className="card mt-5 p-5">
      <p className="mono text-[12px] uppercase tracking-[.021em] flex items-center gap-2" style={{ color: c }}><i className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: c }} />{b.tag}</p>
      {b.x && <p className="mt-2 text-base leading-normal text-white">{rich(b.x)}</p>}
      {b.items && <Bullets items={b.items} />}
    </div>
  );
}

function Video({ src, poster, label, T }) {
  const ref = useRef(null);
  const userPaused = useRef(false);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  useEffect(() => {
    const v = ref.current;
    if (!v) return undefined;
    if (!("IntersectionObserver" in window)) { v.play && v.play().catch(() => setPaused(true)); return undefined; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { if (!userPaused.current && v.paused) v.play().then(() => setPaused(false)).catch(() => setPaused(true)); }
      else if (!v.paused) v.pause();
    }, { threshold: 0.35 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  const toggle = () => {
    const v = ref.current; if (!v) return;
    if (v.paused) { userPaused.current = false; v.play().catch(() => {}); setPaused(false); } else { userPaused.current = true; v.pause(); setPaused(true); }
  };
  const sound = () => {
    const v = ref.current; if (!v) return;
    v.muted = !v.muted; setMuted(v.muted);
    if (v.paused) { v.play().catch(() => {}); setPaused(false); }
  };
  const btn = "flex h-10 w-10 items-center justify-center rounded-lg bg-black/60 border border-white/[.08] backdrop-blur";
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[.08]">
      <video ref={ref} src={src} poster={poster} muted loop playsInline preload="metadata" aria-label={label} className="block w-full aspect-video object-cover bg-[#0f0f0f]" />
      <div className="absolute bottom-3 right-3 flex gap-2">
        <button onClick={sound} aria-label={muted ? T.sound : T.mute} className={btn}>{muted ? <VolumeX size={16} strokeWidth={1.5} /> : <Volume2 size={16} strokeWidth={1.5} />}</button>
        <button onClick={toggle} aria-label={paused ? T.play : T.pause} className={btn}>{paused ? <Play size={16} strokeWidth={1.5} /> : <Pause size={16} strokeWidth={1.5} />}</button>
      </div>
    </div>
  );
}

function Scene({ bgImage, glow, title, text, children }) {
  return (
    <div className="relative flex min-h-[460px] flex-col justify-between overflow-hidden rounded-3xl p-8" style={{ background: bgImage }}>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2" style={{ background: `radial-gradient(70% 100% at 50% 100%,${glow},transparent)`, opacity: 0.6 }} />
      <h3 className="serif h3 relative mt-4 text-center"><Em t={title} /></h3>
      <div className="relative">{children}</div>
      <p className="relative mx-auto max-w-[420px] text-center text-xl leading-[1.35] tracking-[-.01em]" style={{ color: "rgba(255,255,255,.92)" }}>{text}</p>
    </div>
  );
}

export default function About() {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const T = WEB[lang === "en" ? "en" : "vi"];
  const page = useMemo(() => buildAbout(lang, SITE), [lang]);
  const ids = useMemo(() => page.sections.map((s) => s.id), [page]);
  const [active, setActive] = useState(ids[0]);

  useEffect(() => { window.scrollTo({ top: 0 }); }, []);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-25% 0px -65% 0px" });
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [ids]);

  const goTo = (id) => {
    const el = document.getElementById(id); if (!el) return;
    const calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
  };

  return (
    <div className="ab">
      <style>{CSS}</style>

      {/* THANH ĐẦU */}
      <header className="fixed inset-x-0 top-0 z-50" style={{ background: "linear-gradient(rgba(5,5,5,.55),transparent)" }}>
        <div className="wrap flex h-16 items-center justify-between">
          <Link to="/" aria-label="NXX315" className="flex h-10 w-10 items-center justify-center text-white"><StarMark /></Link>
          <nav className="flex items-center gap-5" aria-label="Main">
            <button onClick={() => navigate(-1)} className="nav inline-flex items-center gap-1.5"><ArrowLeft size={14} strokeWidth={1.5} />{T.back}</button>
            <Link to="/" className="nav">{T.home}</Link>
            <Link to="/register" className="btn !h-9 !px-4 hidden sm:inline-flex">{T.start}</Link>
          </nav>
        </div>
      </header>

      {/* MỞ ĐẦU: bầu trời */}
      <section className="relative overflow-hidden pb-28 pt-40 text-center" style={{ background: bg(NATURE.sky, SKY) }}>
        <div className="wrap relative">
          <p className="mono text-[12px] uppercase tracking-[.021em]" style={{ color: "rgba(255,255,255,.9)" }}>{page.eyebrow}</p>
          <h1 className="serif h1 mx-auto mt-5 max-w-[830px]"><Em t={page.title} /></h1>
          <p className="mx-auto mt-6 max-w-[520px] text-base leading-normal" style={{ color: "rgba(255,255,255,.92)" }}>{page.intro}</p>
          <ul className="mt-6 flex flex-wrap justify-center gap-2">
            {page.chips.map((c) => <li key={c} className="mono rounded-lg border border-white/30 bg-black/20 px-3 py-1.5 text-[12px] uppercase tracking-[.021em]">{c}</li>)}
          </ul>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn">{T.start}<span aria-hidden>→</span></Link>
            <button onClick={() => goTo("trust")} className="btn btn2">{T.read}<span aria-hidden>→</span></button>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28" style={{ background: "linear-gradient(transparent,#050505)" }} />
      </section>

      {/* VỀ WEB */}
      <section id="web" className="wrap py-28">
        <Rise>
          <p className="cap text-center">{T.cap}</p>
          <h2 className="serif h2 mx-auto mt-4 max-w-[900px] text-center"><Em t={T.title} /></h2>
          <p className="sup mx-auto mt-4 max-w-[420px] text-center">{T.sub}</p>
        </Rise>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {T.cards.map(([t, d], i) => (
            <Rise key={t}>
              <div className="card flex h-full min-h-[240px] flex-col justify-between p-6">
                <span className="cap">{pad(i + 1)}</span>
                <div>
                  <h3 className="serif h4"><Em t={t} /></h3>
                  <p className="mt-4 text-base leading-normal sup">{d}</p>
                </div>
              </div>
            </Rise>
          ))}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Scene bgImage={bg(NATURE.meadow, MEADOW)} glow="#61a133" title={T.gameTitle} text={T.gameText}>
            <div className="mx-auto grid max-w-[360px] grid-cols-2 gap-2">
              {GAMES.map((g) => <div key={g} className="rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-center text-sm backdrop-blur-sm">{g}</div>)}
            </div>
          </Scene>
          <div className="card flex min-h-[460px] flex-col justify-between p-8">
            <span className="cap">{T.refCap}</span>
            <div>
              <h3 className="serif h3"><Em t={T.refTitle} /></h3>
              <p className="mt-4 max-w-[420px] text-base leading-normal sup">{T.refText}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 border-t border-white/[.14] pt-6">
              {T.stats.map(([n, l]) => (
                <div key={l}>
                  <div className="text-[50px] font-normal leading-[1.1]">{n}</div>
                  <p className="mt-2 text-sm leading-snug sup">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card mt-6 grid gap-8 p-8 md:grid-cols-[1fr_1.2fr] md:items-center">
          <div>
            <span className="cap">{T.accCap}</span>
            <h3 className="serif h3 mt-4"><Em t={T.accTitle} /></h3>
          </div>
          <Bullets items={T.acc} />
        </div>
      </section>

      {/* MINH BẠCH */}
      <section id="trust" className="relative overflow-hidden py-24">
        <div className="drift pointer-events-none absolute -top-40 left-1/2 h-[400px] w-[900px] -translate-x-1/2 opacity-30 blur-3xl" style={{ background: "radial-gradient(closest-side,#847dff,transparent)" }} />
        <div className="wrap relative">
          <p className="cap">{T.trustCap}</p>
          <h2 className="serif h2 mt-4 max-w-[900px]"><Em t={T.trustTitle} /></h2>

          <div className="mt-16 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
            <nav aria-label={T.toc} className="min-w-0 lg:sticky lg:top-24 lg:self-start">
              <p className="cap mb-3 hidden lg:block">{T.toc}</p>
              <ol className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0">
                {page.sections.map((s, i) => (
                  <li key={s.id} className="shrink-0">
                    <button onClick={() => goTo(s.id)}
                      className={`whitespace-nowrap rounded-lg border px-3 py-1.5 text-[12px] transition-colors lg:rounded-none lg:border-0 lg:px-0 lg:py-[7px] lg:text-sm ${active === s.id ? "border-white text-white" : "border-white/[.14] sup"}`}>
                      <span className="mr-1.5 opacity-60">{pad(i + 1)}</span>{s.title}
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
                   <div className="min-w-0 max-w-[720px]">
              {page.sections.map((s, i) => {
                const Icon = ICONS[s.id];
                return (
                  <Rise key={s.id}>
                    <section id={s.id} className="scroll-mt-24 border-t border-white/[.14] py-10 first:border-t-0 first:pt-0 sm:py-12">
                      <div className="flex items-center gap-3">
                        {Icon && <Icon size={20} strokeWidth={1.25} className="shrink-0 text-white/70" />}
                        <h3 className="serif h4 flex-1"><Em t={s.title} /></h3>
                        <span className="cap">{pad(i + 1)}</span>
                      </div>
                      {s.blocks.map((b, k) => <Block key={k} b={b} />)}
                    </section>
                  </Rise>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* LỜI KÊU GỌI CUỐI + VIDEO Ở CUỐI TRANG */}
      <section className="relative overflow-hidden pb-24 pt-44 text-center" style={{ background: bg(NATURE.flowers, FLOWERS) }}>
        <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(#050505,transparent 25%,transparent 55%,#050505)" }} />
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg,transparent,#219ff8,#847dff,transparent)" }} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-40 blur-2xl" style={{ background: "linear-gradient(90deg,transparent,#219ff8,#847dff,transparent)" }} />
        <div className="wrap relative">
          <h2 className="serif mx-auto max-w-[900px] text-[clamp(52px,9vw,96px)] leading-[.9]"><Em t={T.closeTitle} /></h2>
          <p className="mx-auto mt-6 max-w-[420px]" style={{ color: "rgba(255,255,255,.92)" }}>{T.closeText}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/support" className="btn">{T.chat}<span aria-hidden>→</span></Link>
            <a href={`mailto:${OFFICIAL_EMAIL}`} className="btn btn2">{T.mail}<span aria-hidden>→</span></a>
          </div>

          {VIDEO && (
            <div id="video" className="mx-auto mt-28 max-w-[900px] scroll-mt-24 text-left">
              <h3 className="serif h4"><Em t={T.vTitle} /></h3>
              <p className="mb-5 mt-2 text-sm" style={{ color: "rgba(255,255,255,.8)" }}>{T.vCap}</p>
              <Video src={VIDEO} poster={POSTER} label={T.vTitle} T={T} />
            </div>
          )}
        </div>
      </section>

      <footer className="wrap flex flex-wrap justify-between gap-6 py-10 text-[12px] sup">
        <span>© NXX315 Studio</span>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link to="/terms">{lang === "en" ? "Terms" : "Điều khoản"}</Link>
          <Link to="/privacy">{lang === "en" ? "Privacy" : "Quyền riêng tư"}</Link>
          <Link to="/fraud">{lang === "en" ? "Anti-fraud" : "Chống gian lận"}</Link>
          <Link to="/redemption-policy">{lang === "en" ? "Redemption policy" : "Quy định đổi thưởng"}</Link>
        </div>
      </footer>
    </div>
  );
          }

        
