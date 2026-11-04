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

// Hình minh hoạ: điện thoại tia chớp nằm trên đám mây
function Illustration() {
  return (
    <div className="relative mx-auto h-[170px] w-[250px]">
      <style>{CSS}</style>
      <svg viewBox="0 0 250 170" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="cp-cloud" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#a7f3d0" />
            <stop offset="1" stopColor="#6ee7b7" />
          </linearGradient>
          <linearGradient id="cp-screen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#34d399" />
            <stop offset="1" stopColor="#047857" />
          </linearGradient>
        </defs>
        <g fill="url(#cp-cloud)">
          <circle cx="70" cy="128" r="28" />
          <circle cx="118" cy="112" r="40" />
          <circle cx="170" cy="126" r="30" />
          <rect x="60" y="128" width="130" height="30" rx="15" />
        </g>
        <rect x="95" y="10" width="62" height="118" rx="15" fill="#fff" />
        <rect x="100" y="15" width="52" height="108" rx="11" fill="url(#cp-screen)" />
        <path d="M130 38 L111 76 H125 L120 102 L143 62 H129 Z" fill="#fff" />
      </svg>
      <span className="cp-float absolute left-1 top-4 rounded-full border border-emerald-200 bg-white px-3 py-1.5 font-mono text-[11px] font-bold text-emerald-700 shadow-sm">
        24/7
      </span>
      <span className="cp-float2 absolute right-0 top-14 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-[11px] font-bold text-emerald-700 shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Online
      </span>
    </div>
  );
}

export default function IntroView({ onStart, from }) {
  return (
    <div className="space-y-4">
      <section className={`relative overflow-hidden px-4 pb-5 pt-5 text-center ${CARD}`}>
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
          <div className="mt-4 flex items-center justify-center gap-1.5">
            {[
              [Cpu, `${SPEC.cores} nhân`],
              [HardDrive, `${SPEC.ram}GB RAM`],
              [Smartphone, `Android ${SPEC.android}`],
            ].map(([Icon, label]) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[12px] font-bold text-emerald-700"
              >
                <Icon size={12} />
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
              
          

