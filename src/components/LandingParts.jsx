import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

export function BrandLogo() {
  return (
    <span className="font-['Baloo_2',sans-serif] text-[22px] font-extrabold leading-none tracking-tight text-slate-900">
      Nxx315 <span className="text-[#087EA4]">Studio</span>
    </span>
  );
}

export function SectionHead({ tag, title, sub, center = false }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#087EA4]">
        {tag}
      </span>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h2>
      {sub && (
        <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
          {sub}
        </p>
      )}
    </div>
  );
}

export function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F1F8FA] text-[#087EA4]">
        <Icon size={19} />
      </div>
      <h3 className="mt-4 text-[15px] font-bold text-slate-950">{title}</h3>
      <p className="mt-1.5 text-sm leading-6 text-slate-500">{desc}</p>
    </div>
  );
}

export function SafetyBadge({ icon: Icon, title, desc }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1F8FA] text-[#087EA4]">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

export function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-slate-900 sm:text-base">
          {q}
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F1F8FA] text-slate-500">
          {open ? <Minus size={15} /> : <Plus size={15} />}
        </span>
      </button>
      {open && (
        <div className="border-t border-slate-100 px-5 pb-5 pt-3">
          <p className="text-sm leading-6 text-slate-600">{a}</p>
        </div>
      )}
    </div>
  );
    }
