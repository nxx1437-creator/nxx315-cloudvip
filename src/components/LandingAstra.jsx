import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Coins,
  ListChecks,
  Signal,
  Wifi,
  BatteryFull,
} from "lucide-react";

const ICON_BASE =
  "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/icons";

// ---------- hiện dần khi cuộn tới ----------
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, shown];
}

export function Reveal({ children, className = "", delay = 0 }) {
  const [ref, shown] = useInView();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
        shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ---------- chữ ----------
export function Eyebrow({ children }) {
  return (
    <p className="text-center font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-blue-600">
      {children}
    </p>
  );
}

export function TwoTone({ dim, strong, className = "" }) {
  return (
    <h2
      className={`text-center text-[30px] font-extrabold leading-[1.15] tracking-tight sm:text-5xl ${className}`}
    >
      <span className="text-slate-400">{dim}</span>{" "}
      <span className="text-slate-900">{strong}</span>
    </h2>
  );
}

// ---------- icon 3D (ảnh trên Supabase, lỗi thì dùng icon dự phòng) ----------
export function Icon3D({ name, Fallback, size = "h-16 w-16" }) {
  const [ok, setOk] = useState(true);
  if (!ok) return <Fallback size={30} className="text-blue-600" />;
  return (
    <img
      src={`${ICON_BASE}/${name}.png`}
      alt=""
      loading="lazy"
      className={`${size} object-contain drop-shadow-lg`}
      onError={() => setOk(false)}
    />
  );
}

export function IconTile({ name, Fallback, label }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex aspect-square w-full items-center justify-center rounded-[1.75rem] border border-slate-200 bg-gradient-to-b from-white to-slate-100 shadow-sm">
        <Icon3D name={name} Fallback={Fallback} />
      </div>
      <p className="text-center font-mono text-[10.5px] font-semibold uppercase leading-5 tracking-[0.2em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

// ---------- khung điện thoại + quả cầu ----------
export function PhoneMock({ caption }) {
  return (
    <div className="relative mx-auto mt-14 w-[270px] sm:w-[310px]">
      <style>{`@keyframes lpOrb{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}`}</style>
      <div className="relative h-[430px] overflow-hidden rounded-t-[3rem] border-x-[10px] border-t-[10px] border-slate-900 bg-white shadow-2xl shadow-blue-900/20 sm:h-[470px]">
        <div className="absolute left-1/2 top-2 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-slate-900" />
        <div className="flex items-center justify-between px-6 pt-3 font-mono text-[11px] font-bold text-slate-800">
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <Signal size={12} />
            <Wifi size={12} />
            <BatteryFull size={14} />
          </span>
        </div>

        <div className="mt-14 flex flex-col items-center">
          <div className="relative flex h-32 w-32 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-blue-400/25 blur-2xl" />
            <span
              className="relative h-28 w-28 rounded-full shadow-[0_0_60px_rgba(59,130,246,0.5)]"
              style={{
                background:
                  "radial-gradient(circle at 35% 30%, #ffffff 0%, #bfdbfe 22%, #3b82f6 62%, #1e3a8a 100%)",
                animation: "lpOrb 4s ease-in-out infinite",
              }}
            />
          </div>
          <p
            className="mt-10 px-8 text-center text-[16px] font-semibold leading-snug text-slate-800"
            style={{ textWrap: "balance" }}
          >
            {caption}
          </p>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-transparent" />
      </div>
    </div>
  );
}

// ---------- thẻ tính năng (bấm ✦ để mở mô tả) ----------
export function FeatureCard({ dim, strong, desc, children }) {
  const [open, setOpen] = useState(false);
  return (
    <Reveal>
      <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-gradient-to-b from-white to-slate-50 px-6 pb-8 pt-10 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <h3 className="text-[26px] font-extrabold leading-[1.15] tracking-tight sm:text-3xl">
          <span className="text-slate-400">{dim}</span>{" "}
          <span className="text-slate-900">{strong}</span>
        </h3>

        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Xem thêm"
          className="mx-auto mt-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition hover:bg-slate-200 active:scale-95"
        >
          <Sparkles
            size={18}
            className={`transition-transform duration-300 ${
              open ? "rotate-90 scale-110 text-blue-600" : ""
            }`}
          />
        </button>

        <div
          className={`grid transition-all duration-300 ${
            open ? "mt-4 grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <p className="text-[14.5px] leading-7 text-slate-500">{desc}</p>
          </div>
        </div>

        <div className="mt-8 flex justify-center">{children}</div>
      </div>
    </Reveal>
  );
}

// ---------- minh họa riêng ----------
export function PvTasks() {
  const grads = [
    "from-sky-400 to-blue-600",
    "from-emerald-400 to-teal-500",
    "from-amber-400 to-orange-500",
  ];
  return (
    <div className="w-full max-w-[290px] space-y-2.5 rounded-3xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/5">
      {grads.map((g, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 ${
            i === 0 ? "border-blue-200 bg-blue-50" : "border-slate-100"
          }`}
        >
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white ${g}`}
          >
            <ListChecks size={16} />
          </span>
          <div className="flex-1 space-y-1.5">
            <div className="h-2 w-24 rounded-full bg-slate-300" />
            <div className="h-2 w-14 rounded-full bg-slate-200" />
          </div>
          <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1">
            <Coins size={13} className="text-amber-500" />
            <span className="h-1.5 w-7 rounded-full bg-amber-300" />
          </span>
        </div>
      ))}
    </div>
  );
}

export function PvWeek({ title, range, days }) {
  const hs = [88, 48, 68, 36, 96, 22, 6];
  return (
    <div className="w-full max-w-[300px] rounded-3xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-[12.5px]">
        <span className="font-bold text-slate-800">{title}</span>
        <span className="text-slate-400">{range}</span>
      </div>
      <div className="mt-3 flex h-[110px] items-end justify-between gap-2">
        {hs.map((h, i) => (
          <div
            key={i}
            className="w-full rounded-t-md bg-gradient-to-t from-sky-500 to-blue-600"
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between gap-2">
        {days.map((d) => (
          <span
            key={d}
            className="w-full text-center font-mono text-[10px] font-semibold tracking-wider text-slate-400"
          >
            {d}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------- các bước (timeline dọc) ----------
export function ProgressBar({ label }) {
  const [ref, shown] = useInView(0.4);
  return (
    <div ref={ref} className="mx-auto w-full max-w-sm text-center">
      <div className="h-3 w-full rounded-full border border-slate-200 bg-slate-100 p-0.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600 transition-all duration-1000 ease-out"
          style={{ width: shown ? "100%" : "6%" }}
        />
      </div>
      <p className="mt-3 font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

export function StepCard({ n, label, title, Icon }) {
  return (
    <Reveal>
      <div className="flex items-center gap-5 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700">
          <Icon size={24} />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">
            {label} {n}
          </p>
          <p className="mt-1 text-[19px] font-bold leading-snug text-slate-900">
            {title}
          </p>
        </div>
      </div>
    </Reveal>
  );
}

export const Connector = () => (
  <div className="mx-auto h-8 w-px bg-gradient-to-b from-blue-300 to-blue-500" />
);

// ---------- thanh nút cố định ở đáy (chỉ điện thoại) ----------
export function StickyCta({ primary, secondary, onPrimary, onSecondary }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 520);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 px-4 pt-10 transition-all duration-300 md:hidden ${
        show
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-6 opacity-0"
      }`}
      style={{
        background: "linear-gradient(to top, #fff 45%, rgba(255,255,255,0))",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
      }}
    >
      <div className="mx-auto flex max-w-md gap-3">
        <button
          onClick={onPrimary}
          className="flex-1 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3.5 text-[14px] font-bold text-white shadow-lg shadow-blue-500/30 active:scale-[0.98]"
        >
          {primary}
        </button>
        <button
          onClick={onSecondary}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full border-2 border-blue-500 bg-white px-4 py-3.5 text-[14px] font-bold text-slate-900 active:scale-[0.98]"
        >
          {secondary}
          <Sparkles size={15} className="text-amber-500" />
        </button>
      </div>
    </div>
  );
      }
