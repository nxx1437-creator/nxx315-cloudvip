// src/pages/help/HelpSections.jsx
import React from "react";
import Icon from "./HelpIcons.jsx";
import { CATEGORIES, ORDER_STATUS, fmtDate, fmtCoins } from "./helpData.js";

export const surface = "rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900";
const divide = "divide-y divide-slate-100 dark:divide-slate-800";

export function IconBox({ name, size = 18 }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
      <Icon name={name} size={size} />
    </span>
  );
}

export function SectionTitle({ title, action, onAction, hint }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
        {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
      </div>
      {action && (
        <button onClick={onAction} className="shrink-0 text-sm font-medium text-sky-700 hover:underline dark:text-sky-300">
          {action}
        </button>
      )}
    </div>
  );
}

// ================= LIÊN HỆ NHANH =================
export function QuickActions({ onChat, onTicket, onHistory }) {
  const items = [
    { icon: "chat", title: "Chat với trợ lý AI", sub: "Phản hồi ngay, hoạt động 24/7", on: onChat, tag: "Trực tuyến" },
    { icon: "send", title: "Gửi yêu cầu hỗ trợ", sub: "Đội ngũ NXX315 sẽ phản hồi trong hệ thống", on: onTicket },
    { icon: "history", title: "Lịch sử yêu cầu", sub: "Theo dõi trạng thái và phản hồi", on: onHistory },
  ];
  return (
    <section>
      <div className={`${surface} ${divide} overflow-hidden`}>
        {items.map((it) => (
          <button
            key={it.title}
            onClick={() => it.on()}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-slate-800/60"
          >
            <IconBox name={it.icon} />
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-medium text-slate-900 dark:text-white">{it.title}</span>
              <span className="mt-0.5 block truncate text-xs text-slate-500">{it.sub}</span>
            </span>
            {it.tag && (
              <span className="flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {it.tag}
              </span>
            )}
            <Icon name="chevR" size={16} className="shrink-0 text-slate-300" />
          </button>
        ))}
      </div>
    </section>
  );
}

// ================= GIAO DỊCH GẦN ĐÂY =================
export function OrderList({ orders, loading, signedIn, onAsk, onAll }) {
  const note = (icon, text) => (
    <div className="flex items-center gap-3 px-4 py-4">
      <IconBox name={icon} />
      <p className="text-sm leading-5 text-slate-500">{text}</p>
    </div>
  );
  return (
    <section>
      <SectionTitle
        title="Giao dịch gần đây"
        hint="Chọn một đơn để báo vấn đề"
        action={signedIn ? "Xem tất cả" : null}
        onAction={onAll}
      />
      <div className={`${surface} ${divide} overflow-hidden`}>
        {loading ? (
          [0, 1].map((i) => (
            <div key={i} className="flex animate-pulse items-center gap-3 px-4 py-3.5">
              <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-3 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
          ))
        ) : !signedIn ? (
          note("lock", "Đăng nhập để xem và báo vấn đề về các đơn đổi thưởng của bạn.")
        ) : orders.length === 0 ? (
          note("box", "Bạn chưa có đơn đổi thưởng nào.")
        ) : (
          orders.slice(0, 3).map((o) => {
            const st = ORDER_STATUS[o.status] || { label: o.status, cls: "bg-slate-100 text-slate-600" };
            return (
              <button
                key={o.id}
                onClick={() => onAsk({ category: "order", title: `Hỏi về đơn ${o.order_code || ""}`.trim() })}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-slate-800/60"
              >
                <IconBox name="box" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium text-slate-900 dark:text-white">{o.package_name}</span>
                  <span className="mt-0.5 block truncate text-xs text-slate-500">
                    {o.order_code || "—"} · {fmtDate(o.created_at)}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{fmtCoins(o.coins_charged)}</span>
                  <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${st.cls}`}>{st.label}</span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}

// ================= DANH MỤC =================
export function CategoryGrid({ active, onPick }) {
  const tiles = [...CATEGORIES, { key: null, label: "Tất cả chủ đề", icon: "list" }];
  return (
    <section>
      <SectionTitle title="Duyệt theo chủ đề" />
      <div className="grid grid-cols-2 gap-3">
        {tiles.map((c) => {
          const on = (active || null) === c.key;
          return (
            <button
              key={c.label}
              onClick={() => onPick(c.key)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition active:scale-[0.98] ${
                on
                  ? "border-sky-600 bg-sky-50 dark:border-sky-400 dark:bg-sky-500/10"
                  : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
              }`}
            >
              <IconBox name={c.icon} size={17} />
              <span className="text-[13px] font-medium leading-tight text-slate-800 dark:text-slate-100">{c.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
        }
            
