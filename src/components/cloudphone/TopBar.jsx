import React from "react";

const TABS = [
  { k: "buy", t: "Thuê máy" },
  { k: "mine", t: "Máy của tôi" },
];

export default function TopBar({ view, setView }) {
  return (
    <div className="mb-5 flex rounded-full border border-emerald-100 bg-white p-1 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      {TABS.map((x) => (
        <button
          key={x.k}
          onClick={() => setView(x.k)}
          className={`flex-1 rounded-full py-2.5 text-[14px] font-black transition ${
            view === x.k
              ? "bg-gradient-to-r from-emerald-500 to-emerald-400 text-white"
              : "text-slate-500"
          }`}
        >
          {x.t}
        </button>
      ))}
    </div>
  );
}

