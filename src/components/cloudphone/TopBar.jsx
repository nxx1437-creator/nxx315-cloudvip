import React from "react";
import { ArrowLeft } from "lucide-react";
import { RoundBtn } from "./cpUi.jsx";

const TABS = [
  { k: "buy", t: "Thuê máy" },
  { k: "mine", t: "Máy của tôi" },
];

export default function TopBar({ view, setView, onBack }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <RoundBtn onClick={onBack} label="Back">
        <ArrowLeft size={20} />
      </RoundBtn>
      <div className="flex rounded-full border border-emerald-100 bg-white p-1 shadow-sm">
        {TABS.map((x) => (
          <button
            key={x.k}
            onClick={() => setView(x.k)}
            className={`rounded-full px-4 py-2 text-sm font-black transition ${
              view === x.k
                ? "bg-gradient-to-r from-emerald-500 to-emerald-400 text-white"
                : "text-slate-500"
            }`}
          >
            {x.t}
          </button>
        ))}
      </div>
      <div className="w-11" />
    </div>
  );
}
