import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { StarMark } from "./LandingParts.jsx";

/* Ảnh minh họa lấy từ bucket game_logos trên Supabase: chỉ cần ghi tên file */
const BASE = "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/";
const imgUrl = (n) => (/^https?:/.test(n) ? n : BASE + n);

/* [màu chữ/icon, màu nền nhạt] */
const TONE = {
  orange: ["#e2551f", "#fff0e8"], pink: ["#d63a68", "#ffe9f0"], blue: ["#1380d4", "#e5f3ff"],
  green: ["#1f9d68", "#e4f7ee"], purple: ["#6a4fd6", "#efeaff"], amber: ["#b7791f", "#fff6dc"],
  rose: ["#c8374b", "#ffebee"],
};
const CYCLE = ["orange", "pink", "blue", "green", "purple", "amber"];
const NOTE_TONE = { "Nghiêm cấm": "rose", "Hoàn xu": "rose", "Biện pháp xử lý": "rose" };
const vars = (t) => ({ "--fg": TONE[t][0], "--bg2": TONE[t][1] });
const pad = (n) => String(n).padStart(2, "0");

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,400..600&display=swap');
.lg{--bg:#fbf6f0;--ink:#2a2018;--soft:#6e6255;--mute:#a89a8c;--line:#eadfd3;--accent:#f26b3a;
 font-family:'Plus Jakarta Sans',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:var(--ink);
 background:
  radial-gradient(560px 380px at 8% -40px,#ffd9c4 0,rgba(255,217,196,0) 70%),
  radial-gradient(520px 360px at 96% 40px,#ffd0e0 0,rgba(255,208,224,0) 70%),
  radial-gradient(560px 380px at 55% 440px,#d4ecff 0,rgba(212,236,255,0) 70%),
  var(--bg);-webkit-font-smoothing:antialiased}
.lg button{font:inherit}
.lg-press{transition:transform .12s ease-out,opacity .2s}.lg-press:active{transform:scale(.97)}
.lg-head{position:fixed;top:0;left:0;right:0;z-index:50;padding:calc(env(safe-area-inset-top,0px) + 12px) 12px 0;pointer-events:none}
.lg-pill{pointer-events:auto;max-width:1100px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:60px;padding:0 10px 0 11px;border-radius:9999px;background:rgba(255,255,255,.88);-webkit-backdrop-filter:blur(18px) saturate(160%);backdrop-filter:blur(18px) saturate(160%);border:1px solid var(--line);box-shadow:0 10px 30px -14px rgba(80,50,20,.28)}
.lg-logo{display:flex;height:38px;width:38px;align-items:center;justify-content:center;border-radius:9999px;background:var(--accent);color:#fff}
.lg-btn{display:inline-flex;align-items:center;gap:6px;height:38px;padding:0 13px;border-radius:9999px;font-size:14px;font-weight:600;color:var(--ink)}
.lg-card{background:#fff;border:1px solid var(--line);border-radius:28px;padding:24px;box-shadow:0 12px 30px -24px rgba(80,50,20,.3)}
@media(min-width:640px){.lg-card{padding:32px}}
.lg-photo{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:28px;background:#f1e8de;box-shadow:0 22px 40px -22px rgba(70,45,20,.45)}
.lg-wide{aspect-ratio:16/10}@media(min-width:768px){.lg-wide{aspect-ratio:16/8}}
.lg-cta{display:inline-flex;align-items:center;gap:8px;height:52px;padding:0 26px;border-radius:9999px;background:var(--accent);color:#fff;font-weight:700;font-size:15px;box-shadow:0 12px 24px -10px rgba(242,107,58,.65);transition:transform .12s}
.lg-cta:active{transform:scale(.97)}
.lg-rise{opacity:0;transform:translate3d(0,20px,0);transition:opacity .6s cubic-bezier(.22,1,.36,1),transform .6s cubic-bezier(.22,1,.36,1)}
.lg-rise.is-in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){.lg-rise{transform:none;transition:opacity .3s}}
@media(prefers-reduced-transparency:reduce){.lg-pill{background:#fff;-webkit-backdrop-filter:none;backdrop-filter:none}}
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

/* **chữ đậm** */
const rich = (s) =>
  s.split(/(\*\*[^*]+\*\*)/g).map((x, i) =>
    x.startsWith("**") ? <strong key={i} className="font-bold text-[var(--ink)]">{x.slice(2, -2)}</strong> : x
  );

const goTo = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  const calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
};

/* Ảnh: v là "ten-file.jpg" hoặc ["ten-file.jpg", "Tiêu đề", "Mô tả"]. Trống hoặc lỗi thì ẩn. */
function Photo({ v, wide }) {
  const [ok, setOk] = useState(true);
  const [file, t1, t2] = Array.isArray(v) ? v : [v];
  if (!file || !ok) return null;
  return (
    <figure className="mt-6">
      <img src={imgUrl(file)} alt={t1 || ""} loading="lazy" onError={() => setOk(false)} className={`lg-photo ${wide ? "lg-wide" : ""}`} />
      {(t1 || t2) && (
        <figcaption className="mt-4">
          {t1 && <p className="text-[18px] font-bold leading-snug">{t1}</p>}
          {t2 && <p className="mt-1 text-[14px] leading-snug text-[var(--mute)]">{t2}</p>}
        </figcaption>
      )}
    </figure>
  );
}

function Items({ items }) {
  return (
    <ul className="mt-4 space-y-2.5">
      {items.map((x) => (
        <li key={x} className="flex gap-3 text-[16px] leading-[1.55] text-[var(--soft)]">
          <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--fg)]" />
          <span>{x}</span>
        </li>
      ))}
    </ul>
  );
}

function Note({ tag, x, items, foot }) {
  return (
    <div className="mt-5 rounded-[22px] bg-[var(--bg2)] p-5" style={vars(NOTE_TONE[tag] || "amber")}>
      <p className="text-[13px] font-bold uppercase tracking-wide text-[var(--fg)]">{tag}</p>
      {x && <p className="mt-2 text-[16px] leading-[1.6] text-[var(--ink)]">{rich(x)}</p>}
      {items && <Items items={items} />}
      {foot && <p className="mt-4 text-[13px] leading-[1.5] text-[var(--soft)]">{foot}</p>}
    </div>
  );
}

function Block({ b }) {
  if (b.t === "p") return <p className="mt-3 text-[16px] leading-[1.65] text-[var(--soft)]">{rich(b.x)}</p>;
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

/* Trang pháp lý dùng chung: sections = [{ id, title, icon, img, blocks }] */
export default function LegalPage({ title, updated, intro, chips, hero, sections, accept }) {
  const navigate = useNavigate();
  const toc = useMemo(() => (accept ? [...sections, { id: accept.id, title: accept.title }] : sections), [sections, accept]);
  const ids = useMemo(() => toc.map((s) => s.id), [toc]);
  const active = useActive(ids);

  return (
    <div className="lg min-h-screen">
      <style>{CSS}</style>

      <header className="lg-head">
        <div className="lg-pill">
          <Link to="/" aria-label="NXX315" className="lg-press flex items-center gap-2.5">
            <span className="lg-logo"><StarMark size={20} /></span>
            <span className="hidden text-[17px] font-extrabold tracking-tight min-[420px]:inline">nxx315</span>
          </Link>
          <div className="flex items-center gap-0.5">
            <button onClick={() => navigate(-1)} className="lg-btn lg-press"><ArrowLeft size={15} strokeWidth={2} /> Quay lại</button>
            <Link to="/dashboard" className="lg-btn lg-press">Trang chủ</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-5 pb-20 pt-[104px] sm:pb-[94px] sm:pt-[128px]">
        <div className="max-w-[680px]">
          <span className="inline-flex rounded-full border border-[var(--line)] bg-white/70 px-3.5 py-1.5 text-[13px] font-semibold text-[var(--accent)]">
            Pháp lý · Cập nhật lần cuối {updated}
          </span>
          <h1 className="mt-5 text-[34px] font-extrabold leading-[1.1] tracking-[-0.02em] sm:text-[52px]">{title}</h1>
          <p className="mt-5 text-[19px] leading-[1.5] text-[var(--soft)]" style={{ fontFamily: "'Fraunces',Georgia,serif" }}>{intro}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {chips.map((c, i) => (
              <li key={c} style={vars(CYCLE[i % CYCLE.length])} className="rounded-full bg-[var(--bg2)] px-3.5 py-1.5 text-[13px] font-semibold text-[var(--fg)]">{c}</li>
            ))}
          </ul>
        </div>
        {hero && <div className="max-w-[900px]"><Photo v={hero} wide /></div>}

        <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-8 lg:mt-16 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-14">
          <nav aria-label="Mục lục" className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <p className="mb-3 hidden text-[13px] font-bold text-[var(--mute)] lg:block">Mục lục</p>
            <ol className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0">
              {toc.map((s, i) => (
                <li key={s.id} className="shrink-0">
                  <button onClick={() => goTo(s.id)}
                    className={`lg-press whitespace-nowrap rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0 lg:py-[7px] lg:text-[14px] ${
                      active === s.id
                        ? "border-transparent bg-[var(--accent)] text-white lg:text-[var(--accent)]"
                        : "border-[var(--line)] bg-white/70 text-[var(--soft)]"
                    }`}>
                    <span className="mr-1.5 opacity-60">{pad(i + 1)}</span>{s.title}
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          <div className="min-w-0 max-w-[720px] space-y-4">
            {sections.map((s, i) => {
              const Icon = s.icon;
              return (
                <Rise key={s.id}>
                  <section id={s.id} className="lg-card scroll-mt-28" style={vars(CYCLE[i % CYCLE.length])}>
                    <div className="flex items-center gap-3">
                      {Icon && <Icon size={28} strokeWidth={1.75} className="shrink-0 text-[var(--fg)]" />}
                      <h2 className="flex-1 text-[20px] font-bold leading-tight sm:text-[22px]">{s.title}</h2>
                      <span className="text-[13px] font-semibold text-[var(--mute)]">{pad(i + 1)}</span>
                    </div>
                    {s.blocks.map((b, k) => <Block key={k} b={b} />)}
                    <Photo v={s.img} />
                  </section>
                </Rise>
              );
            })}

            {accept && (
              <Rise>
                <section id={accept.id} className="scroll-mt-28 rounded-[28px] border border-[var(--line)] p-6 sm:p-8"
                  style={{ ...vars("green"), background: "linear-gradient(135deg,#fff3ea,#ffe9f0 60%,#e5f3ff)" }}>
                  <h2 className="text-[22px] font-bold leading-tight sm:text-[26px]">{accept.title}</h2>
                  <p className="mt-3 text-[16px] leading-[1.6] text-[var(--soft)]">{accept.lead}</p>
                  <ul className="mt-4 space-y-3">
                    {accept.items.map((x) => (
                      <li key={x} className="flex gap-3 text-[16px] leading-[1.55]">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--fg)] text-white"><Check size={14} strokeWidth={2.5} /></span>
                        <span>{x}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 text-[13px] leading-[1.5] text-[var(--soft)]">{accept.foot}</p>
                </section>
              </Rise>
            )}

            <div className="pt-4">
              <Link to="/dashboard" className="lg-cta">Quay về trang chủ <ArrowRight size={17} strokeWidth={2} /></Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
  }
    
