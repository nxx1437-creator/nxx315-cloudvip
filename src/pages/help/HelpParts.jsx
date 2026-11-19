// src/pages/help/HelpParts.jsx — mảnh ghép dùng chung
import { useEffect, useRef, useState } from "react";
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
  <span className={"gic-chev" + (dk ? " dk" : "")} aria-hidden="true">
    <svg viewBox="0 0 6 10"><path d="M0 0l6 5-6 5z" /></svg>
  </span>
);

export const Stripes = ({ kind }) => {
  const c = kind === "mint" ? ["#e7f5f3", "#d0ebe8", "#a0d7d1"] : ["#334444", "#576a6a", "#728383", "#a5afaf", "#cfd3cf"];
  return <div className="gic-stripes" aria-hidden="true">{c.map((x) => <i key={x} style={{ background: x }} />)}</div>;
};

/* Ảnh người dùng tự up; trống thì dùng tranh pixel */
export function ArtSlot({ slot, kind, seed, alt = "" }) {
  const url = imgUrl(HELP_IMAGES[slot]?.src);
  const [ok, setOk] = useState(false);
  const [bad, setBad] = useState(false);
  const ref = useRef(null);
  // ảnh đã có trong cache thì hiện ngay, không chạy hiệu ứng
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth > 0) setOk(true);
  }, [url]);
  return (
    <>
      {/* lớp tạm: tranh pixel hiện ngay, ảnh thật mờ dần đè lên khi tải xong */}
      <PixelScene className="gic-art" kind={kind} seed={seed} />
      {url && !bad && (
        <img
          ref={ref}
          className="gic-art"
          src={url}
          alt={alt}
          decoding="async"
          onLoad={() => setOk(true)}
          onError={() => setBad(true)}
          style={{ opacity: ok ? 1 : 0, transition: "opacity .5s cubic-bezier(.4,0,.2,1)" }}
        />
      )}
    </>
  );
}

const Sun = () => (
  <svg className="mark" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C12 6.6 17.4 12 24 12 17.4 12 12 17.4 12 24 12 17.4 6.6 12 0 12 6.6 12 12 6.6 12 0Z" /></svg>
);

export function HelpNav({ on, onHome, onTopics, onRequest, onHistory }) {
  return (
    <header className="gic-nav" data-on={on}>
      <button type="button" onClick={onHome} aria-label="Trang chủ trợ giúp" style={{ background: "none", border: 0, padding: 0, display: "flex" }}><Sun /></button>
      <button type="button" className="l" onClick={onTopics} style={{ background: "none", border: 0, padding: 0 }}>Chủ đề</button>
      <button type="button" className="l" onClick={onHistory} style={{ background: "none", border: 0, padding: 0 }}>Lịch sử</button>
      <Link className="l hide" to={HELP_LINKS.contact}>Liên hệ</Link>
      <Link className="l hide" to={HELP_LINKS.home}>Về web</Link>
      <button type="button" className="gic-btn" onClick={() => onRequest()}>Gửi yêu cầu <Chev /></button>
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
export function Closing({ onRequest }) {
  return (
    <>
      <footer className="gic-close">
        <div className="center">
          <svg className="gic-emblem" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C12 6.6 17.4 12 24 12 17.4 12 12 17.4 12 24 12 17.4 6.6 12 0 12 6.6 12 12 6.6 12 0Z" /></svg>
          <h2 className="gic-serif gic-h">{HELP_COPY.closing}</h2>
          <p className="gic-p">Chúng mình trả lời trong ứng dụng, thường là trong ngày.{" "}
            <button type="button" className="gic-link" onClick={() => onRequest()} style={{ height: "auto", color: "inherit", background: "none", border: 0, padding: 0 }}><u>Gửi yêu cầu</u></button></p>
        </div>
        <div className="gic-utility">
          <nav>
            <Link to={HELP_LINKS.home}>Trang chủ</Link><Link to={HELP_LINKS.terms}>Điều khoản</Link>
            <Link to={HELP_LINKS.privacy}>Bảo mật</Link><Link to={HELP_LINKS.about}>Về chúng tôi</Link>
          </nav>
          <a className="gic-mailbox" href={`mailto:${HELP_LINKS.email}`}>{HELP_LINKS.email}<Chev dk /></a>
        </div>
      </footer>
      <Stripes kind="mint" />
    </>
  );
}
export function Landscape() {
  return (
    <div className="gic-land" aria-hidden="true">
      <ArtSlot slot="closing" kind="avenue" seed={7} />
      <div className="gic-credit"><span>© Nxx315 Studio</span><span>Trung tâm trợ giúp</span></div>
    </div>
  );
                           }
   
       
 
