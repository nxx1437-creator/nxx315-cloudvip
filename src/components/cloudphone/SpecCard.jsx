import React from "react";
import { Cpu, HardDrive, Smartphone } from "lucide-react";
import { CARD } from "./cpUi.jsx";

const SPEC_ROWS = [
  { icon: Cpu, label: "CORE", value: "8 nhân" },
  { icon: HardDrive, label: "RAM", value: "5.4GB" },
  { icon: Smartphone, label: "ANDROID", value: "13" },
];

// Bảng cấu hình máy (một cấu hình duy nhất, muốn thêm gói thì thêm cột ở đây)
export default function SpecCard() {
  return (
    <div className={`p-4 ${CARD}`}>
      <p className="mb-3 text-lg font-black text-slate-900">Cấu hình máy</p>
      <div className="grid grid-cols-[92px_1fr] gap-3">
        <div className="pt-[54px]">
          {SPEC_ROWS.map((s) => (
            <div
              key={s.label}
              className="flex h-14 items-center gap-1.5 text-xs font-bold text-slate-400"
            >
              <s.icon size={14} />
              {s.label}
            </div>
          ))}
        </div>
        <div>
          <div className="mb-2 flex h-10 items-center justify-center gap-1.5 rounded-xl border-2 border-emerald-500 bg-emerald-50 text-sm font-black text-emerald-800">
            <Smartphone size={15} />
            Tiêu chuẩn
          </div>
          <div className="rounded-2xl border-2 border-emerald-500 bg-white">
            {SPEC_ROWS.map((s) => (
              <div
                key={s.label}
                className="flex h-14 items-center justify-center text-xl font-black text-slate-900"
              >
                {s.value}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
