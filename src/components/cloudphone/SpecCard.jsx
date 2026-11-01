import React from "react";
import { Cpu, HardDrive, Smartphone } from "lucide-react";
import { CARD } from "./cpUi.jsx";
import { SPEC } from "./cpUtils.js";

const ROWS = [
  { icon: Cpu, value: SPEC.cores, label: "NHÂN" },
  { icon: Smartphone, value: SPEC.android, label: "ANDROID" },
  { icon: HardDrive, value: SPEC.ram, label: "RAM (GB)" },
];

// Cấu hình máy: ba con số lớn (muốn thêm thông số thì thêm một dòng ở ROWS)
export default function SpecCard() {
  return (
    <div
      className={`grid grid-cols-3 divide-x divide-emerald-100 bg-gradient-to-b from-emerald-50/70 to-white py-5 ${CARD}`}
    >
      {ROWS.map((r) => (
        <div key={r.label} className="flex flex-col items-center">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
            <r.icon size={17} />
          </span>
          <span className="mt-2.5 text-[34px] font-black leading-none text-slate-900">
            {r.value}
          </span>
          <span className="mt-2 font-mono text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
            {r.label}
          </span>
        </div>
      ))}
    </div>
  );
}



