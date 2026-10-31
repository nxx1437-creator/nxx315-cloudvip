import React from "react";
import { Plus } from "lucide-react";
import PhoneCard from "./PhoneCard.jsx";
import ActiveCard from "./ActiveCard.jsx";

export default function MineView({ orders, active, now, busy, onRetry, onNew }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {orders.map((o) => (
          <PhoneCard key={o.id} o={o} now={now} />
        ))}
        <div>
          <button
            onClick={onNew}
            aria-label="Thuê máy mới"
            className="flex h-44 w-full items-center justify-center rounded-[1.75rem] border-2 border-dashed border-emerald-200 bg-white/60 transition active:scale-[0.98]"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Plus size={28} strokeWidth={3} />
            </span>
          </button>
        </div>
      </div>

      {active && (
        <ActiveCard
          key={active.id + active.status}
          order={active}
          busy={busy}
          onRetry={onRetry}
        />
      )}
    </div>
  );
}
