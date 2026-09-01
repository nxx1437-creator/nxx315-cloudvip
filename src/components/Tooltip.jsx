import React, { useState, useRef, useEffect, useId } from "react";
import { Info } from "lucide-react";

let activeId = null;
const listeners = new Set();

function broadcastOpen(id) {
  activeId = id;
  listeners.forEach((fn) => fn(id));
}

export default function Tooltip({ text, children, position = "top" }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handler = (openId) => {
      if (openId !== id) setOpen(false);
    };
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, [id]);

  useEffect(() => {
    if (!open) return;

    const handleOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("touchstart", handleOutside);
    document.addEventListener("mousedown", handleOutside);
    return () => {
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("mousedown", handleOutside);
    };
  }, [open]);

  const toggle = (e) => {
    e.stopPropagation();
    if (!open) broadcastOpen(id);
    setOpen((prev) => !prev);
  };

  const posClass =
    position === "top"
      ? "bottom-full left-1/2 -translate-x-1/2 mb-2"
      : "top-full left-1/2 -translate-x-1/2 mt-2";

  const arrowClass =
    position === "top"
      ? "top-full left-1/2 -translate-x-1/2 border-t-slate-900"
      : "bottom-full left-1/2 -translate-x-1/2 border-b-slate-900";

  return (
    <span ref={wrapRef} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggle}
        aria-label="Xem chú thích"
        aria-expanded={open}
        className="flex h-4 w-4 items-center justify-center text-slate-300 transition hover:text-slate-400"
      >
        {children || <Info size={14} />}
      </button>

      {open && (
        <div
          role="tooltip"
          className={`absolute z-50 w-max max-w-[220px] rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium leading-4 text-white shadow-lg ${posClass}`}
        >
          {text}

          <span
            className={`absolute h-0 w-0 border-x-4 border-x-transparent border-t-4 ${arrowClass}`}
          />
        </div>
      )}
    </span>
  );
}
