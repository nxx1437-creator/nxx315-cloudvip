import React from "react";

function BagIllustration() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path
        d="M24 26v-5a8 8 0 0 1 16 0v5"
        stroke="#0f766e"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect
        x="12"
        y="24"
        width="34"
        height="30"
        rx="5"
        fill="#5eead4"
        stroke="#0f766e"
        strokeWidth="2.5"
      />
      <circle cx="44" cy="42" r="11" fill="#ffffff" fillOpacity="0.9" stroke="#374151" strokeWidth="3" />
      <path d="M52 50l8 8" stroke="#374151" strokeWidth="4" strokeLinecap="round" />
      <path d="M44 36v8" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
      <circle cx="44" cy="48.5" r="1.8" fill="#ef4444" />
    </svg>
  );
}

export default function NotReceivedBox({ onOpen }) {
  return (
    <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-gray-100 px-4 py-3">
      <div className="min-w-0">
        <p className="text-[14px] text-gray-800">Không nhận được hàng?</p>
        <button
          type="button"
          onClick={onOpen}
          className="mt-0.5 text-[14px] font-semibold text-teal-600 active:opacity-70"
        >
          Xem hướng dẫn
        </button>
      </div>
      <BagIllustration />
    </div>
  );
      }
