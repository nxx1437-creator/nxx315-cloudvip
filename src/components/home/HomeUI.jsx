import React from "react";
import { Check } from "lucide-react";

const TONES = {
  white: "bg-white border-[#EDE6DA]",
  orange: "bg-[#FFF1EA] border-[#F9DCCF]",
  sand: "bg-[#FBF3E4] border-[#F0E3C8]",
  sage: "bg-[#EEF4EA] border-[#DCE8D4]",
  sky: "bg-[#EAF2F8] border-[#D5E5F0]",
};

export function Card({
  title,
  right,
  tone = "white",
  className = "",
  bodyClass = "",
  children,
}) {
  return (
    <section
      className={`overflow-hidden rounded-[22px] border ${TONES[tone]} ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between gap-3 px-5 pt-4">
          <h2 className="text-[15px] font-bold tracking-tight text-[#1F1B16]">
            {title}
          </h2>
          {right}
        </div>
      )}
      <div className={bodyClass || (title ? "px-5 pb-5 pt-3" : "p-5")}>
        {children}
      </div>
    </section>
  );
}

const TAG = {
  orange: "bg-[#FFE4D9] text-[#C2410C]",
  green: "bg-[#FFE4D9] text-[#C2410C]",
  amber: "bg-[#FBEBC8] text-[#92600A]",
  slate: "bg-[#F3EEE6] text-[#6B6358]",
};

export function Tag({ tone = "slate", children }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${TAG[tone]}`}
    >
      {children}
    </span>
  );
}

export function Shortcut({ icon: Icon, label, tone = "orange", onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-[18px] border border-[#EDE6DA] bg-white px-1 py-3 transition active:scale-95"
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl border ${TONES[tone]}`}
      >
        <Icon size={19} strokeWidth={1.9} className="text-[#1F1B16]" />
      </span>
      <span className="text-center text-[11.5px] font-semibold leading-tight text-[#3A342C]">
        {label}
      </span>
    </button>
  );
}

export function StatTile({ icon: Icon, tone = "sand", value, label, onClick }) {
  const cls = `flex min-h-[116px] flex-col justify-between rounded-[22px] border p-4 text-left ${TONES[tone]}`;
  const inner = (
    <>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80">
        <Icon size={18} strokeWidth={1.9} className="text-[#1F1B16]" />
      </span>
      <div className="mt-4 min-w-0">
        <p className="truncate text-2xl font-extrabold leading-none tracking-tight tabular-nums text-[#1F1B16]">
          {value}
        </p>
        <p className="mt-1.5 truncate text-xs text-[#7A7164]">{label}</p>
      </div>
    </>
  );
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${cls} transition active:scale-[0.98]`}
      >
        {inner}
      </button>
    );
  }
  return <div className={cls}>{inner}</div>;
}

export function ProgressBar({ pct }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#F1EADF]">
      <div
        className="h-full rounded-full bg-[#F25533] transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function MilestoneRow({
  milestone,
  reward,
  tasksDone,
  claimed,
  claiming,
  onClaim,
  lang,
}) {
  const en = lang === "en";
  const reached = tasksDone >= milestone;

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          claimed || reached
            ? "bg-[#F25533] text-white"
            : "bg-[#F1EADF] text-[#B8AE9E]"
        }`}
      >
        <Check size={14} strokeWidth={3} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-[#1F1B16]">
          {milestone} {en ? "tasks" : "nhiệm vụ"}
        </p>
        <p className="text-[11px] tabular-nums text-[#8A8173]">
          {Math.min(tasksDone, milestone)}/{milestone}
        </p>
      </div>
      <span className="text-[13px] font-bold tabular-nums text-[#C2410C]">
        +{reward}
      </span>
      {claimed ? (
        <span className="w-16 text-right text-[11px] text-[#A39A8A]">
          {en ? "Claimed" : "Đã nhận"}
        </span>
      ) : (
        <button
          type="button"
          disabled={!reached || claiming}
          onClick={() => onClaim(milestone)}
          className="w-16 rounded-full bg-[#F25533] py-1.5 text-xs font-bold text-white transition active:scale-95 disabled:bg-[#F1EADF] disabled:text-[#B8AE9E]"
        >
          {claiming ? "…" : en ? "Claim" : "Nhận"}
        </button>
      )}
    </div>
  );
      }
