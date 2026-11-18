// src/pages/help/HelpParts.jsx — mảnh ghép dùng chung
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HELP_IMAGES, HELP_LINKS, HELP_COPY, imgUrl } from "../../lib/helpData";
import { PixelScene } from "./HelpPixel";

/* ---- Đọc chế độ sáng/tối từ Cài đặt ----
   Nếu web của bạn lưu theme khác tên, chỉ cần sửa hàm readTheme() này. */
function readTheme() {
  if (typeof document === "undefined") return "light";
  const el = document.documentElement, b = document.body;
  const has = (v) => el.classList.contains(v) || b.classList.contains(v) || el.dataset.theme === v || b.dataset.theme === v;
  if (has("dark")) return "dark";
  if (has("light")) return "light";
  try {
    const v = ["theme", "nxx315_theme", "nxx_theme", "app-theme"].map((k) => localStorage.getItem(k)).find(Boolean);
    if (v === "dark") return "dark";
  } catch (e) { /* bỏ qua */ }
  return "light";
}
export function useHelpTheme() {
  const [t, setT] = useState(readTheme);
  useEffect(() => {
    const up = () => setT(readTheme());
    const mo = new MutationObserver(up);
    const opt = { attributes: true, attributeFilter: ["class", "data-theme"] };
    mo.observe(document.documentElement, opt); mo.observe(document.body, opt);
    window.addEventListener("storage", up); window.addEventListener("themechange", up);
    return () => { mo.disconnect(); window.removeEventListener("storage", up); window.removeEventListener("themechange", up); };
  }, []);
  return t;
}

export const Chev = ({ dk }) => (
  <span className={"hc-chev" + (dk ? " dk" : "")} aria-hidden="true">
    <svg viewBox="0 0 6 10"><path d="M0 0l6 5-6 5z" /></svg>
  </span>
);

export const Stripes = ({ kind }) => {
  const c = kind === "mint" ? ["#e7f5f3", "#d0ebe8", "#a0d7d1"] : ["#334444", "#576a6a", "#728383", "#a5afaf", "#cfd3cf"];
  return <div className="hc-stripes" aria-hidden="true">{c.map((x) => <i key={x} style={{ background: x }} />)}</div>;
};

/* Ảnh người dùng tự up; trống thì dùng tranh pixel */
export function ArtSlot({ slot, kind, seed, alt = "" }) {
  const url = imgUrl(HELP_IMAGES[slot]?.src);
  return url
    ? <img className="hc-art" src={url} alt={alt} loading="lazy" decoding="async" />
    : <PixelScene className="hc-art" kind={kind} seed={seed} />;
}

const Sun = () => (
  <svg className="mark" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
    <path d="M2 14h14v2H2zM5 11h8v2H5zM7 8h4v2H7zM8 2h2v3H8zM2 6l2-1 1 2-2 1zM16 6l-2-1-1 2 2 1z" />
  </svg>
);

export function HelpNav({ on, onHome, onTopics }) {
  return (
    <header className="hc-nav" data-on={on}>
      <button type="button" onClick={onHome} aria-label="Trang chủ trợ giúp" style={{ background: "none", border: 0, padding: 0, display: "flex" }}><Sun /></button>
      <button type="button" className="l" onClick={onTopics} style={{ background: "none", border: 0, padding: 0 }}>Chủ đề</button>
      <Link className="l hide" to={HELP_LINKS.contact}>Liên hệ</Link>
      <Link className="l hide" to={HELP_LINKS.home}>Về web</Link>
      <Link className="hc-btn" to={HELP_LINKS.support}>Gửi yêu cầu <Chev /></Link>
    </header>
  );
}

/* ---- Sơ đồ nét mảnh trong khay 24px / tờ 12px ---- */
const SQ = [[90, 70, 22], [170, 50, 14], [250, 120, 26], [60, 210, 16], [140, 260, 30], [330, 70, 18], [420, 150, 24], [500, 60, 14], [540, 230, 20], [360, 270, 12], [280, 210, 16]];
export function Schematic({ step }) {
  const fade = (i) => ({ opacity: step === i ? 1 : 0, transition: "opacity .5s cubic-bezier(.4,0,.2,1)" });
  const ring = Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return [320 + Math.cos(a) * 130, 180 + Math.sin(a) * 100]; });
  return (
    <svg viewBox="0 0 640 359" fill="none" stroke="currentColor" strokeWidth="1" role="img" aria-label="Sơ đồ nhiệm vụ, xu, quà">
      <g style={fade(0)}>
        <circle cx="320" cy="180" r="70" strokeDasharray="2 4" /><circle cx="320" cy="180" r="6" />
        {SQ.map(([x, y, s], i) => <rect key={i} x={x} y={y} width={s} height={s} />)}
      </g>
      <g style={fade(1)}>
        <circle cx="320" cy="180" r="26" /><circle cx="320" cy="180" r="70" strokeDasharray="2 4" />
        <ellipse cx="320" cy="180" rx="150" ry="104" strokeDasharray="2 4" />
        {ring.map(([x, y], i) => (
          <g key={i}><line x1="320" y1="180" x2={x} y2={y} /><rect x={x - 9} y={y - 9} width="18" height="18" /></g>
        ))}
      </g>
      <g style={fade(2)}>
        {Array.from({ length: 32 }, (_, i) => <circle key={i} cx={100 + (i % 8) * 63} cy={78 + Math.floor(i / 8) * 68} r="16" />)}
      </g>
    </svg>
  );
}

/* ---- Kết thúc: dải trắng + sọc mint; phong cảnh nằm cố định bên dưới ---- */
export function Closing() {
  return (
    <>
      <footer className="hc-close">
        <div className="center">
          <svg className="hc-emblem" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true"><path d="M2 14h14v2H2zM5 11h8v2H5zM7 8h4v2H7zM8 2h2v3H8z" /></svg>
          <h2 className="hc-serif hc-h">{HELP_COPY.closing}</h2>
          <p className="hc-p">Chúng mình trả lời trong ứng dụng, thường là trong ngày.{" "}
            <Link className="hc-link" to={HELP_LINKS.support} style={{ height: "auto", color: "inherit" }}><u>Gửi yêu cầu</u></Link></p>
        </div>
        <div className="hc-utility">
          <nav>
            <Link to={HELP_LINKS.home}>Trang chủ</Link><Link to={HELP_LINKS.terms}>Điều khoản</Link>
            <Link to={HELP_LINKS.privacy}>Bảo mật</Link><Link to={HELP_LINKS.about}>Về chúng tôi</Link>
          </nav>
          <a className="hc-mailbox" href={`mailto:${HELP_LINKS.email}`}>{HELP_LINKS.email}<Chev dk /></a>
        </div>
      </footer>
      <Stripes kind="mint" />
    </>
  );
}
export function Landscape() {
  return (
    <div className="hc-land" aria-hidden="true">
      <ArtSlot slot="closing" kind="avenue" seed={7} />
      <div className="hc-credit"><span>© Nxx315 Studio</span><span>Trung tâm trợ giúp</span></div>
    </div>
  );
}
