// src/components/LandingFx.jsx
import React, { useEffect, useRef, useState } from "react";

const mq = (q) =>
  typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(q).matches;
const reduced = () => mq("(prefers-reduced-motion: reduce)");
const FINE = "(hover: hover) and (pointer: fine)";

// true = máy tính có chuột. Điện thoại dùng CSS scroll-driven (không cần JS đo cuộn)
function useFancy() {
  const [f, setF] = useState(() => mq(FINE) && !reduced());
  useEffect(() => {
    if (!window.matchMedia) return;
    const m = window.matchMedia(FINE);
    const fn = () => setF(m.matches && !reduced());
    if (m.addEventListener) m.addEventListener("change", fn);
    return () => {
      if (m.removeEventListener) m.removeEventListener("change", fn);
    };
  }, []);
  return f;
}

// chạy fn mỗi khi cuộn / đổi kích thước (gộp theo khung hình), trả về hàm dọn dẹp
function onScroll(fn) {
  let raf = 0;
  const run = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(fn);
  };
  fn();
  window.addEventListener("scroll", run, { passive: true });
  window.addEventListener("resize", run);
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("scroll", run);
    window.removeEventListener("resize", run);
  };
}

/* ---------- hook: thấy trên màn hình thì bật (chỉ một lần) ---------- */
export function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen];
}

/* ---------- bọc bất kỳ thẻ nào, thêm class "in" khi thấy ---------- */
export function InView({ as: Tag = "div", className = "", threshold, children, ...rest }) {
  const [ref, seen] = useInView(threshold ?? 0.15);
  return (
    <Tag ref={ref} className={className + (seen ? " in" : "")} {...rest}>
      {children}
    </Tag>
  );
}

/* ---------- thanh tiến độ cuộn: máy tính dùng JS, điện thoại dùng CSS ---------- */
export function ScrollBar() {
  const fancy = useFancy();
  const r = useRef(null);
  useEffect(() => {
    if (!fancy) return;
    return onScroll(() => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? h.scrollTop / max : 0;
      if (r.current) r.current.style.transform = `scaleX(${p})`;
    });
  }, [fancy]);
  return (
    <div className="fx-bar" aria-hidden="true">
      <i ref={r} />
    </div>
  );
}

/* ---------- chữ "giải mã" kiểu scramble ---------- */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/=;+";

export function Scramble({ text, as: Tag = "p", className = "", style }) {
  const ref = useRef(null);
  const [out, setOut] = useState(text);

  useEffect(() => {
    setOut(text);
    const el = ref.current;
    if (reduced() || !el || !("IntersectionObserver" in window)) return;
    let raf = 0;
    let seen = false;

    const run = () => {
      const t0 = performance.now();
      const D = 800;
      const chars = text.split("");
      let last = 0;
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / D);
        if (t - last > 40 || k === 1) {
          last = t;
          const fixed = Math.floor(k * chars.length);
          setOut(
            k === 1
              ? text
              : chars
                  .map((ch, i) =>
                    ch === " " || i < fixed ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
                  )
                  .join("")
          );
        }
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (es) => {
        if (es[0].isIntersecting && !seen) {
          seen = true;
          run();
        }
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [text]);

  return (
    <Tag ref={ref} className={className} style={style} aria-label={text}>
      {out}
    </Tag>
  );
}

/* ---------- tiêu đề hiện từng chữ (chỉ mờ + trượt, nhẹ cho điện thoại) ---------- */
export function SplitTitle({ a = "", b = "", as: Tag = "h2", className = "dp-h2", style }) {
  const [ref, seen] = useInView(0.3);
  let i = 0;
  const words = (s, serif) =>
    s
      .split(" ")
      .filter(Boolean)
      .map((w) => (
        <React.Fragment key={`${serif ? "b" : "a"}${i}`}>
          <span className={"fx-w" + (serif ? " dp-serif" : "")} style={{ "--i": i++ }}>
            {w}
          </span>{" "}
        </React.Fragment>
      ));
  return (
    <Tag
      ref={ref}
      className={`${className} fx-split${seen ? " in" : ""}`}
      style={style}
      aria-label={`${a} ${b}`.trim()}
    >
      {words(a, false)}
      {words(b, true)}
    </Tag>
  );
}

/* ---------- số chạy từ 0 (15%, 1 mã...) ---------- */
export function CountUp({ value }) {
  const m = String(value).match(/^(\d+)(.*)$/);
  const [ref, seen] = useInView(0.5);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!m || !seen) return;
    const to = Number(m[1]);
    if (reduced()) {
      setN(to);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / 1200);
      setN(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, value]);

  if (!m) return <span ref={ref}>{value}</span>;
  return (
    <span ref={ref}>
      {seen ? n : 0}
      {m[2]}
    </span>
  );
}

/* ---------- thẻ nghiêng 3D theo con trỏ (chỉ chuột) ---------- */
export function Tilt({ children, max = 8, className = "" }) {
  const ref = useRef(null);
  const move = (e) => {
    if (e.pointerType === "touch") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg)`;
    el.style.setProperty("--gx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--gy", `${(y + 0.5) * 100}%`);
  };
  const leave = () => {
    if (ref.current) ref.current.style.transform = "";
  };
  return (
    <div ref={ref} className={"fx-tilt " + className} onPointerMove={move} onPointerLeave={leave}>
      {children}
    </div>
  );
}

/* ---------- nút "hút" về phía con trỏ (chỉ chuột) ---------- */
export function Magnetic({ children }) {
  const ref = useRef(null);
  const move = (e) => {
    if (e.pointerType === "touch") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) * 0.22;
    const dy = (e.clientY - (r.top + r.height / 2)) * 0.3;
    el.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
  };
  const leave = () => {
    if (ref.current) ref.current.style.transform = "";
  };
  return (
    <span ref={ref} className="fx-mag" onPointerMove={move} onPointerLeave={leave}>
      {children}
    </span>
  );
}

/* ---------- ảnh nền hero: máy tính dùng JS, điện thoại dùng CSS ---------- */
export function ParallaxImg({ src, alt, className }) {
  const fancy = useFancy();
  const ref = useRef(null);
  useEffect(() => {
    if (!fancy) return;
    return onScroll(() => {
      const y = Math.min(window.scrollY, window.innerHeight);
      if (ref.current)
        ref.current.style.transform = `translate3d(0,${(y * 0.25).toFixed(1)}px,0) scale(1.12)`;
    });
  }, [fancy]);
  return (
    <img
      ref={ref}
      className={className}
      src={src}
      alt={alt}
      style={fancy ? { transform: "scale(1.12)", willChange: "transform" } : undefined}
    />
  );
}

/* ---------- vệt sáng theo con trỏ trong hero (chỉ máy tính) ---------- */
export function Spotlight() {
  const fancy = useFancy();
  const ref = useRef(null);
  useEffect(() => {
    if (!fancy) return;
    const host = ref.current && ref.current.parentElement;
    if (!host) return;
    const mv = (e) => {
      const r = host.getBoundingClientRect();
      host.style.setProperty("--mx", `${e.clientX - r.left}px`);
      host.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    host.addEventListener("pointermove", mv);
    return () => host.removeEventListener("pointermove", mv);
  }, [fancy]);
  if (!fancy) return null;
  return <div ref={ref} className="fx-spot" aria-hidden="true" />;
}

/* ---------- câu dẫn: máy tính ghim + sáng dần (JS), điện thoại sáng dần bằng CSS ---------- */
export function ScrollWords({ text }) {
  const fancy = useFancy();
  const ref = useRef(null);
  const inRef = useRef(null);
  const words = text.split(" ").filter(Boolean);
  const [lit, setLit] = useState(0);

  useEffect(() => {
    if (!fancy) return;
    return onScroll(() => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = inRef.current ? inRef.current.offsetHeight : window.innerHeight;
      const total = r.height - vh;
      const p = Math.min(1, Math.max(0, -r.top / (total > 0 ? total : 1)));
      const l = Math.min(words.length, Math.ceil(p * 1.15 * words.length));
      setLit((a) => (a === l ? a : l));
    });
  }, [fancy, words.length]);

  const render = (allOn) =>
    words.map((w, i) => {
      const serif = w.startsWith("*");
      return (
        <React.Fragment key={i}>
          <span className={(allOn || i < lit ? "on" : "") + (serif ? " dp-serif" : "")}>
            {serif ? w.slice(1) : w}
          </span>{" "}
        </React.Fragment>
      );
    });

  if (!fancy) {
    return (
      <div className="fx-sw-static">
        <p className="fx-sw-p">{render(true)}</p>
      </div>
    );
  }

  return (
    <div className="fx-sw" ref={ref}>
      <div className="fx-sw-in" ref={inRef}>
        <p className="fx-sw-p">{render(false)}</p>
      </div>
    </div>
  );
}

/* ---------- các bước: máy tính ghim + đổi theo cuộn, điện thoại là thẻ chồng lên nhau ---------- */
export function PinnedSteps({ steps, icons }) {
  const fancy = useFancy();
  const ref = useRef(null);
  const inRef = useRef(null);
  const fill = useRef(null);
  const [active, setActive] = useState(0);

  const measure = () => {
    const el = ref.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const vh = inRef.current ? inRef.current.offsetHeight : window.innerHeight;
    return { r, total: r.height - vh };
  };

  useEffect(() => {
    if (!fancy) return;
    return onScroll(() => {
      const m = measure();
      if (!m) return;
      const p = Math.min(1, Math.max(0, -m.r.top / (m.total > 0 ? m.total : 1)));
      if (fill.current) fill.current.style.transform = `scaleY(${p})`;
      const idx = Math.min(steps.length - 1, Math.floor(p * steps.length));
      setActive((a) => (a === idx ? a : idx));
    });
  }, [fancy, steps.length]);

  const jump = (i) => {
    const m = measure();
    if (!m) return;
    const top = m.r.top + window.scrollY;
    window.scrollTo({ top: top + (i / steps.length) * m.total + 4, behavior: "smooth" });
  };

  const bigOf = (num, i) => (num.match(/\d+/) || [String(i + 1).padStart(2, "0")])[0];

  // ===== điện thoại: thẻ dính trên đầu, thẻ sau trượt đè lên thẻ trước =====
  if (!fancy) {
    return (
      <div className="fx-pin-static">
        {steps.map(([num, title, desc], i) => {
          const Icon = icons[i];
          return (
            <div key={num} className="fx-pin-card" style={{ "--i": i }}>
              <span className="fx-big" aria-hidden="true">{bigOf(num, i)}</span>
              <div className="ico-wrap"><Icon size={28} strokeWidth={1.5} /></div>
              <p className="dp-mono fx-num">{num}</p>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          );
        })}
      </div>
    );
  }

  // ===== máy tính: ghim màn hình =====
  const Icon = icons[active];
  const [num, title, desc] = steps[active];

  return (
    <div className="fx-pin" ref={ref} style={{ "--n": steps.length }}>
      <div className="fx-pin-in" ref={inRef}>
        <div className="fx-pin-list">
          <div className="fx-track" aria-hidden="true"><i ref={fill} /></div>
          {steps.map(([n, t], i) => (
            <button
              key={n}
              type="button"
              onClick={() => jump(i)}
              className={"fx-step" + (i === active ? " on" : i < active ? " done" : "")}
            >
              <b>{bigOf(n, i)}</b>
              <span>{t}</span>
            </button>
          ))}
        </div>

        <div className="fx-pin-card" key={active}>
          <span className="fx-big" aria-hidden="true">{bigOf(num, active)}</span>
          <div className="ico-wrap"><Icon size={30} strokeWidth={1.5} /></div>
          <p className="dp-mono fx-num">{num}</p>
          <h3>{title}</h3>
          <p>{desc}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------- 2 hàng chữ chạy ngang ngược chiều ---------- */
export function Marquee({ items }) {
  const set = [...items, ...items];
  const row = (rev, k) => (
    <div className={"fx-mq" + (rev ? " rev" : "")} key={k}>
      <div className="fx-mq-track">
        {[0, 1].map((d) => (
          <div className="fx-mq-set" key={d} aria-hidden={d ? "true" : undefined}>
            {set.map((t, i) => (
              <span key={i} className={(i + (rev ? 1 : 0)) % 2 ? "fill" : "line"}>
                {t}
                <b>✦</b>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
  return <div className="fx-marquee">{row(false, 0)}{row(true, 1)}</div>;
          }
