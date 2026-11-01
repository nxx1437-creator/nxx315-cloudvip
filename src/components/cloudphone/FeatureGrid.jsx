import React from "react";
import { Cloud, Smartphone, Gamepad2, Check } from "lucide-react";
import { CARD } from "./cpUi.jsx";

const ITEMS = [
  { icon: Cloud, label: "Online 24/24" },
  { icon: Smartphone, label: "Không tốn pin, data" },
  { icon: Gamepad2, label: "Nhiều game Android" },
];

export default function FeatureGrid() {
  return (
    <div className={`grid grid-cols-3 gap-2 px-2 py-5 ${CARD}`}>
      {ITEMS.map((f) => (
        <div key={f.label} className="flex flex-col items-center text-center">
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <f.icon size={24} />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white">
              <Check size={11} strokeWidth={3.5} />
            </span>
          </span>
          <p className="mt-2.5 px-1 text-[12.5px] font-semibold leading-tight text-slate-800">
            {f.label}
          </p>
        </div>
      ))}
    </div>
  );
}
