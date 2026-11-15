// src/components/LandingFx.jsx
import React, { useEffect, useRef, useState } from "react";

const reduced = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

/* ---------- thanh tiến độ cuộn trên cùng ---------- */
export function ScrollBar() {
  const r = useRef(null);
  useEffect(
    () =>
      onScroll(() => {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        const p = max > 0 ? h.scrollTop / max : 0;
        if (r.current) r.current.style.transform = `scaleX(${p})`;
      }),
    []
  );
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
    if (!el || reduced() || !("IntersectionObserver" in window)) return;
    let raf = 0;
    let seen = false;

    const run = () => {
      const t0 = performance.now();
      const D = 900;
      const chars = text.split("");
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / D);
        const fixed = Math.floor(k * chars.length);
        setOut(
          chars
            .map((ch, i) =>
              ch === " " || i < fixed ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
            )
            .join("")
        );
        if (k < 1) raf = requestAnimationFrame(tick);
        else setOut(text);
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

/* ---------- tiêu đề hiện từng chữ (blur -> rõ) ---------- */
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

/* ---------- nút "hút" về phía con trỏ ---------- */
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

/* ---------- ảnh nền hero trôi chậm hơn khi cuộn (parallax) ---------- */
export function ParallaxImg({ src, alt, className }) {
  const ref = useRef(null);
  useEffect(() => {
    if (reduced()) return;
    return onScroll(() => {
      const y = Math.min(window.scrollY, window.innerHeight * 1.2);
      if (ref.current)
        ref.current.style.transform = `translate3d(0,${(y * 0.25).toFixed(1)}px,0) scale(${(1.12 + y * 0.00015).toFixed(4)})`;
    });
  }, []);
  return (
    <img
      ref={ref}
      className={className}
      src={src}
      alt={alt}
      style={{ transform: "scale(1.12)", willChange: "transform" }}
    />
  );
}

/* ---------- vệt sáng theo con trỏ trong hero ---------- */
export function Spotlight() {
  const ref = useRef(null);
  useEffect(() => {
    const host = ref.current && ref.current.parentElement;
    if (!host) return;
    const mv = (e) => {
      const r = host.getBoundingClientRect();
      host.style.setProperty("--mx", `${e.clientX - r.left}px`);
      host.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    host.addEventListener("pointermove", mv);
    return () => host.removeEventListener("pointermove", mv);
  }, []);
  return <div ref={ref} className="fx-spot" aria-hidden="true" />;
}

/* ---------- đoạn chữ sáng dần theo lúc cuộn (ghim màn hình) ---------- */
export function ScrollWords({ text }) {
  const ref = useRef(null);
  const words = text.split(" ").filter(Boolean);
  const [lit, setLit] = useState(0);

  useEffect(
    () =>
      onScroll(() => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const total = r.height - window.innerHeight;
        const p = Math.min(1, Math.max(0, -r.top / (total > 0 ? total : 1)));
        const l = Math.min(words.length, Math.ceil(p * 1.15 * words.length));
        setLit((a) => (a === l ? a : l));
      }),
    [words.length]
  );

  return (
    <div className="fx-sw" ref={ref}>
      <div className="fx-sw-in">
        <p className="fx-sw-p">
          {words.map((w, i) => {
            const serif = w.startsWith("*");
            return (
              <React.Fragment key={i}>
                <span className={(i < lit ? "on" : "") + (serif ? " dp-serif" : "")}>
                  {serif ? w.slice(1) : w}
                </span>{" "}
              </React.Fragment>
            );
          })}
        </p>
      </div>
    </div>
  );
}

/* ---------- các bước được ghim, cuộn để đổi bước ---------- */
export function PinnedSteps({ steps, icons }) {
  const ref = useRef(null);
  const fill = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(
    () =>
      onScroll(() => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const total = r.height - window.innerHeight;
        const p = Math.min(1, Math.max(0, -r.top / (total > 0 ? total : 1)));
        if (fill.current) fill.current.style.transform = `scaleY(${p})`;
        const idx = Math.min(steps.length - 1, Math.floor(p * steps.length));
        setActive((a) => (a === idx ? a : idx));
      }),
    [steps.length]
  );

  const jump = (i) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const total = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (i / steps.length) * total + 4, behavior: "smooth" });
  };

  const Icon = icons[active];
  const [num, title, desc] = steps[active];
  const big = (num.match(/\d+/) || [String(active + 1).padStart(2, "0")])[0];

  return (
    <div className="fx-pin" ref={ref} style={{ "--n": steps.length }}>
      <div className="fx-pin-in">
        <div className="fx-pin-list">
          <div className="fx-track" aria-hidden="true"><i ref={fill} /></div>
          {steps.map(([n, t], i) => (
            <button
              key={n}
              type="button"
              onClick={() => jump(i)}
              className={"fx-step" + (i === active ? " on" : i < active ? " done" : "")}
            >
              <b>{(n.match(/\d+/) || [i + 1])[0]}</b>
              <span>{t}</span>
            </button>
          ))}
        </div>

        <div className="fx-pin-card" key={active}>
          <span className="fx-big" aria-hidden="true">{big}</span>
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
