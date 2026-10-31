import React from "react";
import { ArrowLeft, Cloud, Smartphone, Gamepad2, Zap, Plus } from "lucide-react";
import { RoundBtn, CARD, GRAD } from "./cpUi.jsx";

const FEATURES = [
  { icon: Cloud, text: "Online 24/24, tắt app vẫn treo tiếp" },
  { icon: Smartphone, text: "Không tốn pin, không tốn data máy bạn" },
  { icon: Gamepad2, text: "Chạy được nhiều game Android" },
];

export default function IntroView({ onBack, onStart }) {
  return (
    <div className="relative">
      <div className="absolute left-0 top-0 z-10">
        <RoundBtn onClick={onBack} label="Back">
          <ArrowLeft size={20} />
        </RoundBtn>
      </div>

      <div className="relative mx-auto mt-8 flex h-52 w-52 items-center justify-center">
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(closest-side,rgba(16,185,129,.28),transparent)",
          }}
        />
        <Cloud
          size={200}
          strokeWidth={0}
          fill="currentColor"
          className="absolute text-emerald-100"
        />
        <div className="relative flex h-28 w-20 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-b from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-600/20">
          <Zap size={36} className="fill-white text-white" />
        </div>
      </div>

      <h1 className="mt-6 text-center text-3xl font-black leading-tight text-slate-900">
        Cloud phone mới
        <br />
        của riêng bạn
      </h1>

      <div className={`mt-8 space-y-4 p-4 ${CARD}`}>
        {FEATURES.map((f) => (
          <div key={f.text} className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <f.icon size={20} />
            </div>
            <p className="text-base font-semibold text-slate-800">{f.text}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className={`mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r ${GRAD} text-base font-black text-white transition active:scale-[0.98]`}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/25">
          <Plus size={16} />
        </span>
        Nhận thiết bị mới
      </button>
    </div>
  );
}
