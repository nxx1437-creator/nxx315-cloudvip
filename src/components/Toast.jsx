import React, { useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2">
      <div className={`flex items-center gap-3 rounded-2xl border px-5 py-3 shadow-2xl backdrop-blur-xl ${
        type === "success" 
          ? "border-emerald-400/30 bg-emerald-500/20 text-emerald-100" 
          : "border-rose-400/30 bg-rose-500/20 text-rose-100"
      }`}>
        {type === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}
