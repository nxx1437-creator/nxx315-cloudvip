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
    <div className={`grid grid-cols-3 divide-x divide-emerald-100 py-5 ${CARD}`}>
      {ROWS.map((r) => (
        <div key={r.label} className="flex flex-col items-center">
          <span className="text-[34px] font-black leading-none text-slate-900">
            {r.value}
          </span>
          <span className="mt-2.5 inline-flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            <r.icon size={13} />
            {r.label}
          </span>
        </div>
      ))}
    </div>
  );
}


