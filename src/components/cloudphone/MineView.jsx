import React from "react";
import { Plus, Smartphone } from "lucide-react";
import PhoneCard from "./PhoneCard.jsx";
import ActiveCard from "./ActiveCard.jsx";
import { CARD } from "./cpUi.jsx";

export default function MineView({ orders, active, now, busy, onRetry, onNew }) {
  const running = orders.filter(
    (o) => o.status === "delivered" && new Date(o.expires_at).getTime() > now
  ).length;
  const ended = orders.filter(
    (o) =>
      (o.status === "delivered" && new Date(o.expires_at).getTime() <= now) ||
      o.status === "failed"
  ).length;

  const stats = [
    { label: "Thiết bị", value: orders.length, tone: "text-slate-900" },
    { label: "Đang chạy", value: running, tone: "text-emerald-600" },
    { label: "Hết hạn", value: ended, tone: "text-slate-400" },
  ];

  return (
    <div className="space-y-5">
      <section className={`p-4 ${CARD}`}>
        <div className="flex items-center gap-3.5">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600">
            <Smartphone size={26} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[20px] font-black leading-tight text-emerald-700">
                Quản lý thiết bị
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live
              </span>
            </div>
            <p className="mt-0.5 text-[13px] text-slate-500">Quản lý thiết bị đang thuê</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-emerald-100 bg-emerald-50/50 px-3 py-2.5"
            >
              <p className={`text-[22px] font-black leading-none tabular-nums ${s.tone}`}>
                {s.value}
              </p>
              <p className="mt-1.5 text-[12px] font-semibold text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

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

