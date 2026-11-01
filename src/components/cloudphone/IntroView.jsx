import React from "react";
import { Cloud, Smartphone, Gamepad2, Check, Plus, Cpu, HardDrive } from "lucide-react";
import { CARD, GRAD } from "./cpUi.jsx";
import { SPEC, fmt, hoursLabel } from "./cpUtils.js";

const FEATURES = [
  { icon: Cloud, text: "Online 24/24, tắt app vẫn treo tiếp" },
  { icon: Smartphone, text: "Không tốn pin, không tốn data máy bạn" },
  { icon: Gamepad2, text: "Chạy được nhiều game Android" },
];

const CSS = `
@keyframes cp-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
.cp-float { animation: cp-float 4.6s ease-in-out infinite; }
.cp-float2 { animation: cp-float 5.6s ease-in-out -2s infinite; }
`;

// Hình minh hoạ: đám mây + điện thoại tia chớp
function Illustration() {
  return (
    <div className="relative mx-auto h-[190px] w-[260px]">
      <style>{CSS}</style>
      <svg viewBox="0 0 260 190" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="cp-cloud" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d1fae5" />
            <stop offset="1" stopColor="#a7f3d0" />
          </linearGradient>
          <linearGradient id="cp-screen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#34d399" />
            <stop offset="1" stopColor="#059669" />
          </linearGradient>
        </defs>
        <ellipse cx="130" cy="176" rx="82" ry="9" fill="#064e3b" opacity=".08" />
        <g fill="url(#cp-cloud)">
          <circle cx="82" cy="112" r="38" />
          <circle cx="132" cy="88" r="50" />
          <circle cx="184" cy="116" r="34" />
          <rect x="82" y="112" width="104" height="38" rx="19" />
        </g>
        <rect x="98" y="28" width="64" height="118" rx="15" fill="#fff" />
        <rect x="103" y="33" width="54" height="108" rx="11" fill="url(#cp-screen)" />
        <path d="M134 58 L114 96 H128 L123 122 L147 82 H133 Z" fill="#fff" />
      </svg>
      <span className="cp-float absolute left-0 top-6 rounded-full border border-emerald-100 bg-white px-3 py-1.5 font-mono text-[11px] font-bold text-emerald-700 shadow-sm">
        24/7
      </span>
      <span className="cp-float2 absolute bottom-10 right-0 rounded-full border border-emerald-100 bg-white px-3 py-1.5 font-mono text-[11px] font-bold text-emerald-700 shadow-sm">
        Android {SPEC.android}
      </span>
    </div>
  );
}

export default function IntroView({ onStart, from }) {
  return (
    <div className="space-y-4">
      <section className={`relative overflow-hidden px-5 pb-6 pt-5 text-center ${CARD}`}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-56"
          style={{
            background:
              "radial-gradient(closest-side at 50% 45%,rgba(16,185,129,.16),transparent)",
          }}
        />
        <div className="relative">
          <Illustration />
          <h1 className="mt-3 text-[28px] font-black leading-tight tracking-tight text-slate-900">
            Cloud phone mới
            <br />
            <span className="text-emerald-600">của riêng bạn</span>
          </h1>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {[
              [Cpu, SPEC.cores],
              [HardDrive, `${SPEC.ram} RAM`],
              [Smartphone, `Android ${SPEC.android}`],
            ].map(([Icon, label]) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-700"
              >
                <Icon size={13} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className={`divide-y divide-slate-100 px-4 ${CARD}`}>
        {FEATURES.map((f) => (
          <div key={f.text} className="flex items-center gap-3.5 py-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <f.icon size={20} />
            </span>
            <p className="flex-1 text-[15px] font-semibold leading-snug text-slate-800">
              {f.text}
            </p>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check size={14} strokeWidth={3} />
            </span>
          </div>
        ))}
      </section>

      <div>
        <button
          onClick={onStart}
          className={`flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r ${GRAD} text-base font-black text-white transition active:scale-[0.98]`}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/25">
            <Plus size={16} />
          </span>
          Nhận thiết bị mới
        </button>
        {from && (
          <p className="mt-2.5 text-center text-[13px] text-slate-500">
            Chỉ từ{" "}
            <span className="font-bold text-amber-600">{fmt(from.price_coins)} Coin</span>{" "}
            cho {hoursLabel(from.duration_hours)}
          </p>
        )}
      </div>
    </div>
  );
}

