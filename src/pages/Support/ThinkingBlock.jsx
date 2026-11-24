// Lucian UX/UI Prompt #453 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#453
import { useEffect, useId, useRef, useState } from "react";
import {
  BookOpen,
  Check,
  Gift,
  Image as ImageIcon,
  Lightbulb,
  ListChecks,
  Pencil,
  Receipt,
  RefreshCw,
  Search,
  Wallet,
} from "lucide-react";
import "./ThinkingBlock.css";

const SPIN = 2400;
const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// "Đang tra đơn RBX-1…" -> "Đã tra đơn RBX-1" (bước đã xong)
const pastTense = (t) => String(t).replace(/^Đang /, "Đã ").replace(/(\.{3}|…)$/, "");

// Mỗi bước một icon riêng (như các mục trên GitHub); không khớp từ nào thì dùng dấu tick
function iconFor(text) {
  const t = String(text).toLowerCase();
  if (/thử lại|chậm/.test(t)) return RefreshCw;
  if (/ảnh|hình/.test(t)) return ImageIcon;
  if (/gợi ý|nút/.test(t)) return Lightbulb;
  if (/đơn/.test(t)) return Receipt;
  if (/tiền|ví|nạp|thanh toán/.test(t)) return Wallet;
  if (/thưởng|quà|voucher/.test(t)) return Gift;
  if (/đọc/.test(t)) return BookOpen;
  if (/chọn/.test(t)) return ListChecks;
  if (/soạn|trả lời|viết/.test(t)) return Pencil;
  if (/tra|tìm|kiểm/.test(t)) return Search;
  return Check;
}

// current = bước đang chạy (vòng xoay nhỏ trong nút tròn). Bước đã qua = icon trong nút tròn.
function Line({ text, current }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setOn(true), 40);
    return () => clearTimeout(id);
  }, []);
  const Icon = iconFor(text);
  return (
    <p className={"u453-ln" + (on ? " is-on" : "") + (current ? " is-now" : "")}>
      <i className="u453-nd" aria-hidden="true">
        {current ? <span className="u453-sp" /> : <Icon size={18} strokeWidth={1.9} />}
      </i>
      <span><span>{text}</span></span>
    </p>
  );
}

export default function ThinkingBlock({ lines = [], done = false, seconds }) {
  const empty = lines.length === 0;
  const [open, setOpen] = useState(false);
  const [secs, setSecs] = useState(seconds ?? 0);
  const panelId = useId();
  const iconRef = useRef(null);
  const spinRef = useRef(null);
  const startRef = useRef(Date.now());

  // Chữ trên tiêu đề = bước đang chạy; chưa có bước nào thì hiện "Đang suy nghĩ…"
  const label = lines.length ? lines[lines.length - 1] : "Đang suy nghĩ…";

  useEffect(() => {
    const svg = iconRef.current;
    if (!svg || !svg.animate || prefersReduced()) return;
    if (!done) {
      if (spinRef.current) return;
      spinRef.current = svg.animate(
        [
          { transform: "rotate(0deg) scale(1)" },
          { transform: "rotate(180deg) scale(.78)" },
          { transform: "rotate(360deg) scale(1)" },
        ],
        { duration: SPIN, iterations: Infinity }
      );
      return;
    }
    const spin = spinRef.current;
    if (!spin) return;
    const p = ((spin.currentTime || 0) % SPIN) / SPIN;
    const deg = p * 360;
    const s = p < 0.5 ? 1 - 0.44 * p : 0.78 + 0.44 * (p - 0.5);
    spin.cancel();
    spinRef.current = null;
    svg.animate(
      [
        { transform: `rotate(${deg}deg) scale(${s})` },
        { transform: `rotate(${Math.ceil((deg + 25) / 90) * 90}deg) scale(1)` },
      ],
      { duration: 750, easing: "cubic-bezier(.3,1.45,.5,1)", fill: "forwards" }
    );
  }, [done]);

  useEffect(
    () => () => {
      spinRef.current?.cancel();
      spinRef.current = null;
    },
    []
  );

  useEffect(() => {
    if (!done) return;
    setOpen(false);
    setSecs(seconds ?? Math.max(1, Math.round((Date.now() - startRef.current) / 1000)));
  }, [done, seconds]);

  const onKeyDown = (e) => {
    if (e.key === "Escape" && open) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
    }
  };

  return (
    <div className={"u453" + (done ? " is-done" : "") + (empty ? " is-empty" : "")}>
      <button
        type="button"
        className="u453-h"
        disabled={empty}
        aria-expanded={open && !empty}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKeyDown}
      >
        <span className="u453-ic" aria-hidden="true">
          <svg ref={iconRef} viewBox="0 0 24 24">
            <path d="M12 1.6c.8 5.3 5.1 9.6 10.4 10.4-5.3.8-9.6 5.1-10.4 10.4C11.2 17.1 6.9 12.8 1.6 12 6.9 11.2 11.2 6.9 12 1.6Z" />
          </svg>
        </span>
        <span className="u453-tx">
          {/* key = label: mỗi lần đổi bước, chữ cũ trượt đi và chữ mới hiện lên */}
          <span className="u453-a" key={label} aria-hidden={done}>{label}</span>
          <span className="u453-b" aria-hidden={!done}>Đã suy nghĩ {secs}s</span>
        </span>
        <svg className="u453-cv" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m9.5 6 6 6-6 6" />
        </svg>
      </button>
      <div className="u453-pn" id={panelId}>
        <div className="u453-in">
          <div className="u453-ls">
            {lines.map((t, i) => {
              const finished = done || i < lines.length - 1;
              return (
                <Line key={i} text={finished ? pastTense(t) : t} current={!done && i === lines.length - 1} />
              );
            })}
          </div>
        </div>
      </div>
      <p className="u453-live" role="status">
        {done ? `Đã suy nghĩ ${secs} giây` : ""}
      </p>
    </div>
  );
}
