// src/components/LandingBits.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";

export const scrollToId = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

export function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === "undefined") { setSeen(true); return undefined; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); io.disconnect(); }
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen];
}

export function Reveal({ children, delay = 0, className = "" }) {
  const [ref, seen] = useInView(0.12);
  return (
    <div ref={ref} className={`dp-rv ${seen ? "in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export const Wordmark = () => (
  <span className="dp-wm">NXX315<span className="dp-serif">.Studio</span></span>
);

export function FloatingNav({ items, loginLabel, startLabel, langLabel, onLang, onItem }) {
  return (
    <header className="dp-nav">
      <Link to="/"><Wordmark /></Link>
      <nav className="dp-nav-links" aria-label="Main">
        {items.map(([id, label]) => (
          <button key={id} type="button" onClick={() => onItem(id)}>{label}</button>
        ))}
      </nav>
      <div className="dp-nav-actions">
        {onLang && <button type="button" className="dp-nbtn ghost" onClick={onLang}>{langLabel}</button>}
        <Link to="/login" className="dp-nbtn line">{loginLabel}</Link>
        <Link to="/register" className="dp-nbtn fill">{startLabel}</Link>
      </div>
    </header>
  );
}

export function Trail() {
  return (
    <div className="dp-trail" aria-hidden="true">
      <svg viewBox="0 0 260 18" fill="none">
        <defs>
          <linearGradient id="dpTr" x1="0" x2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#fff" stopOpacity=".85" />
          </linearGradient>
        </defs>
        <line x1="0" y1="9" x2="238" y2="9" stroke="url(#dpTr)" strokeWidth="2" style={{ filter: "blur(4px)" }} />
        <line x1="0" y1="9" x2="238" y2="9" stroke="url(#dpTr)" strokeWidth="1.5" />
        <path d="M236 9 L222 3 L226 9 L222 15 Z" fill="#fff" />
        <circle cx="246" cy="9" r="3" fill="#fff" />
      </svg>
    </div>
  );
}

const ytId = (u) => {
  const m = u.match(/(?:youtu\.be\/|v=|\/shorts\/|\/embed\/)([\w-]{11})/);
  return m ? m[1] : null;
};

/* Chỗ dán video: link YouTube hoặc link .mp4. Để trống sẽ hiện khung chờ. */
export function VideoSlot({ url, poster, soon }) {
  const id = url ? ytId(url) : null;
  if (id) {
    return (
      <iframe className="dp-vid" title="Video" loading="lazy" allowFullScreen
        src={`https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`}
        allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen" />
    );
  }
  if (url) return <video className="dp-vid" src={url} poster={poster} controls playsInline preload="metadata" />;
  return (
    <div className="dp-vid dp-vid-empty">
      <span className="dp-play"><Play size={20} fill="currentColor" /></span>
      <p className="dp-mono">{soon}</p>
    </div>
  );
}

export function Barcode() {
  const bars = [3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 2, 4, 1, 2, 3, 1, 2];
  let y = 0;
  return (
    <svg className="dp-bars" viewBox="0 0 18 200" preserveAspectRatio="none" aria-hidden="true">
      {bars.map((h, i) => {
        const r = <rect key={i} x={i % 2 ? 4 : 0} y={y} width={i % 2 ? 14 : 18} height={h} fill="#fff" />;
        y += h * 1.6 + 1.6;
        return r;
      })}
    </svg>
  );
}

export function Flap({ text, kind, target, onId, delay = 0 }) {
  const [ref, seen] = useInView(0.6);
  const letters = [...text].map((ch, i) => (
    <span key={i} className={i % 2 ? "o" : ""}>{ch === " " ? "\u00A0" : ch}</span>
  ));
  const body = (
    <span className="dp-flap-in">
      <span className="dp-fw" aria-label={text}>
        <span className="dp-ft" aria-hidden="true">{letters}</span>
        <span className="dp-fb" aria-hidden="true">{letters}</span>
      </span>
      <ArrowRight className="dp-farrow" strokeWidth={1.25} />
    </span>
  );
  const cls = `dp-flap ${seen ? "in" : ""}`;
  const st = { animationDelay: `${delay}ms` };
  if (kind === "route") return <Link ref={ref} to={target} className={cls} style={st}>{body}</Link>;
  return <button ref={ref} type="button" className={cls} style={st} onClick={() => onId(target)}>{body}</button>;
}

export function timeAgo(iso, ago) {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 1) return ago[0];
  if (m < 60) return `${m} ${ago[1]}`;
  if (m < 1440) return `${Math.floor(m / 60)} ${ago[2]}`;
  return `${Math.floor(m / 1440)} ${ago[3]}`;
}

export function RankTicket({ row, c }) {
  return (
    <article className={`dp-tk t${(row.rank - 1) % 3}`}>
      <div className="shade" />
      <p className="top dp-mono">TOP {row.rank} · {c.week}</p>
      <span className="ghost">0{row.rank}</span>
      <div className="btm">
        <div>
          <p className="nm">{row.name}</p>
          <p className="sub">{Number(row.coins).toLocaleString("vi-VN")} {c.unit}</p>
        </div>
        <ArrowRight size={24} strokeWidth={1.25} />
      </div>
    </article>
  );
}

export function OrderCard({ row, c }) {
  return (
    <article className="dp-oc">
      <span className="dp-badge">{c.approved}</span>
      <p className="it">{row.item}</p>
      <div className="ft">
        <span>{row.name}</span>
        <span>{timeAgo(row.approved_at, c.ago)}</span>
      </div>
    </article>
  );
}

export const Skeletons = ({ n = 3 }) =>
  Array.from({ length: n }, (_, i) => <article key={i} className={`dp-tk sk t${i % 3}`} />);
