import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { StarMark } from "./LandingParts.jsx";

/* Ảnh minh họa lấy từ bucket game_logos trên Supabase: chỉ cần ghi tên file */
const BASE = "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/";
const imgUrl = (n) => (/^(https?:|\/)/.test(n) ? n : BASE + n);
const isVideo = (n) => /\.(mp4|webm)(#.*)?$/i.test(n);

/* Màu chỉ dùng cho icon nhỏ, chấm đầu dòng và nhãn lưu ý. Nền luôn trắng. */
const TONE = {
  orange: "#e2551f", pink: "#d63a68", blue: "#1380d4", green: "#1f9d68",
  purple: "#6a4fd6", amber: "#b7791f", rose: "#c8374b",
};
const CYCLE = ["orange", "pink", "blue", "green", "purple", "amber"];
const NOTE_TONE = { "Nghiêm cấm": "rose", "Hoàn xu": "rose", "Không hoàn xu": "rose", "Biện pháp xử lý": "rose", "Được hoàn xu": "green", "Bảo mật": "rose" };
const vars = (t) => ({ "--fg": TONE[t] });
const pad = (n) => String(n).padStart(2, "0");

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300..500&display=swap');
.lg{--bg:#fdfdfd;--ink:#0f1012;--soft:#5e5e5e;--mute:#8f8f8f;--line:rgba(0,0,0,.08);--blue:#0071e3;
 font-family:'Inter',ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
 font-weight:350;letter-spacing:-.02em;font-feature-settings:"ss01","ss02","cv01","cv11";
 color:var(--ink);background:var(--bg);-webkit-font-smoothing:antialiased}
.lg button{font:inherit;letter-spacing:inherit}
.lg-press{transition:transform .12s ease-out,opacity .2s}.lg-press:active{transform:scale(.97)}
.lg-head{position:fixed;top:0;left:0;right:0;z-index:50;display:flex;justify-content:center;gap:8px;pointer-events:none;padding:calc(env(safe-area-inset-top,0px) + 14px) 12px 0}
@media(min-width:640px){.lg-head{padding-top:calc(env(safe-area-inset-top,0px) + 28px)}}
.lg-head>*{pointer-events:auto}
.lg-glass{background:rgba(253,253,253,.92);-webkit-backdrop-filter:blur(20px) saturate(180%);backdrop-filter:blur(20px) saturate(180%);border:.5px solid var(--line)}
.lg-logo{display:flex;height:44px;width:44px;align-items:center;justify-content:center;border-radius:9999px;color:var(--ink)}
.lg-bar{display:flex;align-items:center;height:44px;border-radius:12px;padding:0 6px}
.lg-link{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:8px;font-size:14px;color:var(--ink);white-space:nowrap}
@media(min-width:640px){.lg-link{padding:8px 16px;font-size:16px}}
.lg-tag{display:inline-flex;align-items:center;border:.5px solid var(--blue);color:var(--blue);border-radius:9999px;padding:3px 11px;font-size:12px;line-height:1.2}
.lg-cta{display:inline-flex;align-items:center;gap:10px;height:48px;padding:0 22px;border-radius:26px;background:rgba(12,13,15,.05);color:#020201;font-size:14px;font-weight:400}
.lg-cta svg{color:var(--blue)}
.lg-photo{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:16px;background:#f2f2f4;border:.5px solid var(--line)}
.lg-wide{aspect-ratio:16/10}@media(min-width:768px){.lg-wide{aspect-ratio:16/8}}
.lg-photo.lg-vid{aspect-ratio:16/9}
.lg-rise{opacity:0;transform:translate3d(0,18px,0);transition:opacity .6s cubic-bezier(.22,1,.36,1),transform .6s cubic-bezier(.22,1,.36,1)}
.lg-rise.is-in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){.lg-rise{transform:none;transition:opacity .3s}}
@media(prefers-reduced-transparency:reduce){.lg-glass{background:#fdfdfd;-webkit-backdrop-filter:none;backdrop-filter:none}}
`;

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
  return <div ref={ref} className={`lg-rise ${on ? "is-in" : ""} ${className}`}>{children}</div>;
}

/* **chữ đậm** → nhấn bằng màu đen, không dùng độ đậm */
const rich = (s) =>
  s.split(/(\*\*[^*]+\*\*)/g).map((x, i) =>
    x.startsWith("**") ? <strong key={i} className="font-[350] text-[var(--ink)]">{x.slice(2, -2)}</strong> : x
  );

const goTo = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  const calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
};

/* Video tự phát, lặp lại. Mặc định tắt tiếng (trình duyệt chặn tự phát có tiếng), bấm loa để bật nhạc nền. */
function Video({ url, label, onError }) {
  const ref = useRef(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  useEffect(() => {
    const v = ref.current;
    if (v && v.play) { const r = v.play(); if (r && r.catch) r.catch(() => setPaused(true)); }
  }, []);
  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) { v.play().catch(() => {}); setPaused(false); } else { v.pause(); setPaused(true); }
  };
  const sound = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted; setMuted(v.muted);
    if (v.paused) { v.play().catch(() => {}); setPaused(false); }
  };
  const btn = "lg-glass lg-press flex h-9 w-9 items-center justify-center rounded-full";
  return (
    <div className="relative">
      <video ref={ref} src={url} muted loop playsInline autoPlay preload="auto" aria-label={label} onError={onError} className="lg-photo lg-vid" />
      <div className="absolute bottom-3 right-3 flex gap-2">
        <button onClick={sound} aria-label={muted ? "Bật nhạc nền" : "Tắt nhạc nền"} className={btn}>
          {muted ? <VolumeX size={14} strokeWidth={1.5} /> : <Volume2 size={14} strokeWidth={1.5} />}
        </button>
        <button onClick={toggle} aria-label={paused ? "Phát video" : "Tạm dừng video"} className={btn}>
          {paused ? <Play size={14} strokeWidth={1.5} /> : <Pause size={14} strokeWidth={1.5} />}
        </button>
      </div>
    </div>
  );
}

/* Ảnh hoặc video: v là "ten-file.jpg" | "/ten-video.mp4" | ["ten-file.jpg", "Tiêu đề", "Mô tả"]. Trống hoặc lỗi thì ẩn. */
function Photo({ v, wide }) {
  const [ok, setOk] = useState(true);
  const [file, t1, t2] = Array.isArray(v) ? v : [v];
  if (!file || !ok) return null;
  const url = imgUrl(file);
  return (
    <figure className="mt-6">
      {isVideo(file) ? (
        <Video url={url} label={t1 || ""} onError={() => setOk(false)} />
      ) : (
        <img src={url} alt={t1 || ""} loading="lazy" onError={() => setOk(false)} className={`lg-photo ${wide ? "lg-wide" : ""}`} />
      )}
      {(t1 || t2) && (
        <figcaption className="mt-3">
          {t1 && <p className="text-[16px] leading-snug">{t1}</p>}
          {t2 && <p className="mt-1 text-[13px] leading-snug text-[var(--mute)]">{t2}</p>}
        </figcaption>
      )}
    </figure>
  );
}

function Items({ items }) {
  return (
    <ul className="mt-4 space-y-2.5">
      {items.map((x) => (
        <li key={x} className="flex gap-3 text-[16px] leading-[1.5] text-[var(--soft)]">
          <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[var(--fg)]" />
          <span>{x}</span>
        </li>
      ))}
    </ul>
  );
}

function Note({ tag, x, items, foot }) {
  return (
    <div className="mt-5 rounded-[14px] bg-[#f6f6f7] p-4 sm:p-5" style={vars(NOTE_TONE[tag] || "amber")}>
      <p className="text-[12px] text-[var(--fg)]">{tag}</p>
      {x && <p className="mt-1.5 text-[16px] leading-[1.5] text-[var(--ink)]">{rich(x)}</p>}
      {items && <Items items={items} />}
      {foot && <p className="mt-3 text-[13px] leading-[1.5] text-[var(--mute)]">{foot}</p>}
    </div>
  );
}

function Block({ b }) {
  if (b.t === "p") return <p className="mt-3 text-[16px] leading-[1.55] text-[var(--soft)]">{rich(b.x)}</p>;
  if (b.t === "list") return <Items items={b.items} />;
  return <Note {...b} />;
}

function useActive(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-25% 0px -65% 0px" });
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [ids]);
  return active;
}

const NO_TOC = [];

/* Trang pháp lý dùng chung: sections = [{ id, title, icon, img, blocks }] */
export default function LegalPage({ title, updated, intro, chips, hero, sections, accept, extra, extraToc = NO_TOC, home = "/dashboard", eyebrow }) {
  const navigate = useNavigate();
  const toc = useMemo(() => [...sections, ...extraToc, ...(accept ? [{ id: accept.id, title: accept.title }] : [])], [sections, accept, extraToc]);
  const ids = useMemo(() => toc.map((s) => s.id), [toc]);
  const active = useActive(ids);

  return (
    <div className="lg min-h-screen">
      <style>{CSS}</style>

      <header className="lg-head">
        <Link to="/" aria-label="NXX315" className="lg-glass lg-press lg-logo"><StarMark /></Link>
        <nav className="lg-glass lg-bar" aria-label="Main">
          <button onClick={() => navigate(-1)} className="lg-link lg-press"><ArrowLeft size={14} strokeWidth={1.5} /> Quay lại</button>
          <Link to={home} className="lg-link lg-press">Trang chủ</Link>
        </nav>
      </header>

      <main className="mx-auto max-w-[1100px] px-5 pb-20 pt-[110px] sm:pb-[94px] sm:pt-[150px]">
        <div className="max-w-[640px]">
          <p className="text-[12px] text-[var(--mute)]">{eyebrow || `Pháp lý · Cập nhật lần cuối ${updated}`}</p>
          <h1 className="mt-3 text-[clamp(27px,3.6vw,40px)] leading-[1.2] tracking-[-0.03em]">{title}</h1>
          <p className="mt-4 text-[16px] leading-[1.55] text-[var(--soft)]">{intro}</p>
          <ul className="mt-6 flex flex-wrap gap-1.5">
            {chips.map((c) => <li key={c} className="lg-tag">{c}</li>)}
          </ul>
        </div>
        {hero && <div className="max-w-[900px]"><Photo v={hero} wide /></div>}

        <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-8 lg:mt-16 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
          <nav aria-label="Mục lục" className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <p className="mb-3 hidden text-[12px] text-[var(--mute)] lg:block">Mục lục</p>
            <ol className="-mx-5 flex gap-1.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0">
              {toc.map((s, i) => (
                <li key={s.id} className="shrink-0">
                  <button onClick={() => goTo(s.id)}
                    className={`lg-press whitespace-nowrap rounded-full border-[.5px] px-3 py-1.5 text-[12px] transition-colors lg:rounded-none lg:border-0 lg:px-0 lg:py-[7px] lg:text-[14px] ${
                      active === s.id ? "border-[var(--blue)] text-[var(--blue)]" : "border-[var(--line)] text-[var(--soft)]"
                    }`}>
                    <span className="mr-1.5 text-[var(--mute)]">{pad(i + 1)}</span>{s.title}
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          <div className="min-w-0 max-w-[720px]">
            {sections.map((s, i) => {
              const Icon = s.icon;
              return (
                <Rise key={s.id}>
                  <section id={s.id} className="scroll-mt-28 border-t-[.5px] border-[var(--line)] py-10 first:border-t-0 first:pt-0 sm:py-12" style={vars(CYCLE[i % CYCLE.length])}>
                    <div className="flex items-center gap-3">
                      {Icon && <Icon size={22} strokeWidth={1.25} className="shrink-0 text-[var(--fg)]" />}
                      <h2 className="flex-1 text-[22px] leading-[1.25] tracking-[-0.44px] sm:text-[24px]">{s.title}</h2>
                      <span className="text-[12px] text-[var(--mute)]">{pad(i + 1)}</span>
                    </div>
                    {s.blocks.map((b, k) => <Block key={k} b={b} />)}
                    <Photo v={s.img} />
                  </section>
                </Rise>
              );
            })}

            {accept && (
              <Rise>
                <section id={accept.id} className="scroll-mt-28 border-t-[.5px] border-[var(--line)] py-10 sm:py-12">
                  <h2 className="text-[22px] leading-[1.25] tracking-[-0.44px] sm:text-[24px]">{accept.title}</h2>
                  <p className="mt-3 text-[16px] leading-[1.55] text-[var(--soft)]">{accept.lead}</p>
                  <ul className="mt-4 space-y-3">
                    {accept.items.map((x) => (
                      <li key={x} className="flex gap-3 text-[16px] leading-[1.5] text-[var(--soft)]">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[.5px] border-[var(--blue)] text-[var(--blue)]"><Check size={12} strokeWidth={1.5} /></span>
                        <span>{x}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 text-[13px] leading-[1.5] text-[var(--mute)]">{accept.foot}</p>
                </section>
              </Rise>
            )}

            {extra}

            <Link to={home} className="lg-cta lg-press mt-2">
              <span>Quay về trang chủ</span><ArrowRight size={16} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
               }
      
                 
  
  
