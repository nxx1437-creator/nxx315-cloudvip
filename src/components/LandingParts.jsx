import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

const REDUCE = "(prefers-reduced-motion: reduce)";
const prefersReduced = () =>
  typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(REDUCE).matches;

/* Ngôi sao 8 cánh (đã quay lại như cũ) */
export function StarMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.1" strokeLinecap="round" aria-hidden="true">
      {[0, 45, 90, 135, 180, 225, 270, 315].map((d) => (
        <line key={d} x1="12" y1="2.6" x2="12" y2="8.4" transform={`rotate(${d} 12 12)`} />
      ))}
    </svg>
  );
}

/* Thanh điều hướng nổi */
export function FloatingNav({ items, onItem, loginLabel, onLogin, langLabel, onLang }) {
  return (
    <header className="lp-nav">
      <Link to="/" aria-label="NXX315" className="lp-glass lp-press lp-nav-logo">
        <StarMark />
      </Link>
      <nav className="lp-glass lp-nav-bar" aria-label="Main">
        {items.map(([id, label, mobile]) => (
          <button key={id} type="button" onClick={() => onItem?.(id)}
            className={`lp-nav-link lp-press ${mobile ? "" : "hidden sm:inline-flex"}`}>
            {label}
          </button>
        ))}
        <button type="button" onClick={onLogin} className="lp-nav-link lp-press">{loginLabel}</button>
        {typeof onLang === "function" && (
          <button type="button" onClick={onLang} className="lp-nav-link lp-press" aria-label="Language">
            {langLabel}
          </button>
        )}
      </nav>
    </header>
  );
}

const isVideoSrc = (src) => /\.(mp4|webm|mov|ogv)(\?|$)/i.test(src || "");

/* Media đầu trang */
export function HeroVideo({ src, poster }) {
  const wrap = useRef(null);
  const [reduce] = useState(prefersReduced);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (reduce) return undefined;
    const el = wrap.current;
    if (!el) return undefined;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY || 0;
      const h = window.innerHeight || 800;
      const p = Math.min(1, Math.max(0, y / (h * 0.9)));
      el.style.setProperty("--py", `${y * 0.18}px`);
      el.style.setProperty("--ps", String(1 + p * 0.05));
      el.style.setProperty("--po", String(1 - p * 0.85));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduce]);

  if (!src) return <div className="lp-hero-media lp-hero-fallback" aria-hidden="true" />;

  return (
    <div ref={wrap} className="lp-hero-media" aria-hidden="true">
      {isVideoSrc(src) ? (
        !failed && (
          <video
            className="lp-hero-video"
            src={src}
            poster={poster}
            muted loop playsInline
            autoPlay={!reduce}
            preload="metadata"
            onError={() => setFailed(true)}
          />
        )
      ) : (
        <img src={src} alt="" loading="eager" decoding="async" />
      )}
    </div>
  );
}

/* Hiện dần khi cuộn tới */
export function Reveal({ children, className = "", delay = 0, as: Tag = "div" }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setOn(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } },
      { threshold: 0.1, rootMargin: "0px 0px -5% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} style={{ transitionDelay: on ? `${delay}ms` : "0ms" }}
      className={`lp-reveal ${on ? "is-in" : ""} ${className}`}>
      {children}
    </Tag>
  );
}

export function Head({ n, label, title, sub }) {
  return (
    <div className="max-w-[640px]">
      <p className="lp-label">{n} · {label}</p>
      <h2 className="lp-h2 mt-2">{title}</h2>
      {sub && <p className="lp-body mt-4">{sub}</p>}
    </div>
  );
}

export function FaqRow({ id, n, q, a, open, onToggle }) {
  const qId = id ? `faq-q-${id}` : undefined;
  const aId = id ? `faq-a-${id}` : undefined;
  return (
    <div className="border-b-[.5px] border-[var(--hair)]">
      <button type="button" id={qId} aria-expanded={open} aria-controls={aId} onClick={onToggle}
        className="lp-press flex w-full items-center gap-4 py-5 text-left">
        <span className="lp-label w-9 shrink-0">{n}</span>
        <span className="lp-sub flex-1">{q}</span>
        <span aria-hidden="true" className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[.5px] transition-transform duration-300 ${
          open ? "rotate-45 border-[var(--blue)] text-[var(--blue)]" : "border-[var(--ash)] text-[var(--ash)]"
        }`}>
          <Plus size={15} strokeWidth={1.25} />
        </span>
      </button>
      <div id={aId} role="region" aria-labelledby={qId}
        className={`grid transition-[grid-template-rows] duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <p className="lp-body pb-5 pl-[52px] pr-10">{a}</p>
        </div>
      </div>
    </div>
  );
}

export const Row = ({ k, children }) => (
  <div className="flex justify-between gap-4 border-b-[.5px] border-[var(--hair)] py-4 last:border-b-0">
    <dt className="text-[14px] text-[var(--ash)]">{k}</dt>
    <dd className="text-right text-[14px]">{children}</dd>
  </div>
);
