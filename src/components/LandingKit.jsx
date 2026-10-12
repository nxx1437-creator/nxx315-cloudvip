import { Plus } from "lucide-react";

export const DOT_BG = {
  backgroundImage: "radial-gradient(rgba(15,23,42,0.10) 1px, transparent 1px)",
  backgroundSize: "18px 18px",
};

export const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-7 py-4 text-[14px] font-bold text-white shadow-lg shadow-blue-500/30 transition hover:brightness-110 active:scale-[0.98]";

export const ghostBtn =
  "inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-7 py-4 text-[14px] font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98]";

export function SectionHead({ index, tag, title, sub }) {
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-blue-600">
        {index} · {tag}
      </p>
      <h2 className="mt-3 text-[28px] font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h2>
      {sub && (
        <p className="mt-3 text-[15px] leading-7 text-slate-500">{sub}</p>
      )}
    </div>
  );
}

export function Chip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-600">
      {children}
    </span>
  );
}

// Thẻ có khung minh họa nền chấm bi ở trên, chữ ở dưới
export function PreviewCard({
  icon: Icon,
  title,
  desc,
  index,
  preview,
  className = "",
}) {
  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 ${className}`}
    >
      <div
        className="flex min-h-[170px] flex-1 items-center justify-center p-5"
        style={{ ...DOT_BG, backgroundColor: "#f8fafc" }}
      >
        {preview}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Icon size={16} />
            </span>
            <h3 className="text-[16px] font-bold tracking-tight text-slate-900">
              {title}
            </h3>
          </div>
          <span className="mt-1.5 font-mono text-[10px] font-semibold tracking-[0.2em] text-slate-300">
            {index}
          </span>
        </div>
        <p className="mt-2 text-[13.5px] leading-6 text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

// Thẻ an toàn kiểu callout có vạch màu bên trái
export function SafetyCard({ icon: Icon, title, desc }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 pl-6 transition hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5">
      <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-sky-400 to-blue-600" />
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Icon size={20} />
        </span>
        <div>
          <h3 className="text-[15px] font-bold text-slate-900">{title}</h3>
          <p className="mt-1 text-[13.5px] leading-6 text-slate-500">{desc}</p>
        </div>
      </div>
    </div>
  );
}

export function FAQItem({ q, a, open, onToggle }) {
  return (
    <div
      className={`rounded-2xl border bg-white transition ${
        open
          ? "border-blue-300 shadow-lg shadow-blue-500/5"
          : "border-slate-200"
      }`}
    >
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-[15px] font-bold text-slate-900">{q}</span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition ${
            open
              ? "rotate-45 border-blue-500 bg-blue-500 text-white"
              : "border-slate-200 text-slate-500"
          }`}
        >
          <Plus size={16} />
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-[14.5px] leading-7 text-slate-600">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
      }
