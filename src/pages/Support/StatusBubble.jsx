// src/pages/Support/StatusBubble.jsx

import React from "react";
import { Loader2 } from "lucide-react";

export default function StatusBubble({ message }) {
  return (
    <div className="flex justify-center py-1">
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 shadow-sm">
        <Loader2
          size={12}
          className="animate-spin text-slate-400"
          strokeWidth={2.4}
        />
        <span className="text-[11.5px] font-medium text-slate-500">
          {message.message}
        </span>
      </div>
    </div>
  );
}
