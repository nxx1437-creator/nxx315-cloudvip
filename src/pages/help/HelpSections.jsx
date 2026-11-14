// src/pages/help/HelpSections.jsx
import React from "react";
import Icon from "./HelpIcons.jsx";
import { ORDER_STATUS, fmtDate, fmtCoins } from "./helpData.js";
import { IconBox, SectionTitle } from "./HelpUI.jsx";

export function QuickActions({ onChat, onTicket, onHistory }) {
  const items = [
    { icon: "chat", title: "Chat với trợ lý AI", sub: "Phản hồi ngay, hoạt động 24/7", on: onChat, tag: "Trực tuyến" },
    { icon: "send", title: "Gửi yêu cầu hỗ trợ", sub: "Đội ngũ NXX315 sẽ phản hồi trong hệ thống", on: onTicket },
    { icon: "history", title: "Lịch sử yêu cầu", sub: "Theo dõi trạng thái và phản hồi", on: onHistory },
  ];
  return (
    <section className="mt-6">
      <div className="hc-card overflow-hidden">
        {items.map((it) => (
          <button key={it.title} onClick={() => it.on()} className="flex w-full items-center gap-4 px-5 py-4 text-left border-b border-gray-100 last:border-0 hover:bg-gray-50 active:bg-gray-100">
            <IconBox name={it.icon} />
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold text-[#1e1e2f]">{it.title}</span>
              <span className="mt-0.5 block truncate text-[13px] text-gray-500">{it.sub}</span>
            </span>
            {it.tag && (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {it.tag}
              </span>
            )}
            <Icon name="chevR" size={16} className="shrink-0 text-gray-300" />
          </button>
        ))}
      </div>
    </section>
  );
}

export function OrderList({ orders, loading, signedIn, onAsk, onAll }) {
  const note = (icon, text) => (
    <div className="flex items-center gap-4 px-5 py-6">
      <IconBox name={icon} />
      <p className="text-[14px] leading-6 text-gray-500">{text}</p>
    </div>
  );

  return (
    <section className="mt-8">
      <SectionTitle title="Giao dịch gần đây" action={signedIn ? "Xem tất cả" : null} onAction={onAll} />
      <div className="hc-card overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-4"><div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse"/></div>
        ) : !signedIn ? (
          note("lock", "Đăng nhập để xem và báo vấn đề về các đơn đổi thưởng của bạn.")
        ) : orders.length === 0 ? (
          note("box", "Bạn chưa có đơn đổi thưởng nào.")
        ) : (
          orders.slice(0, 3).map((o) => (
            <button key={o.id} onClick={() => onAsk({ category: "order", title: `Hỏi về đơn ${o.order_code || ""}`.trim() })} className="flex w-full items-center gap-4 px-5 py-4 text-left border-b border-gray-100 last:border-0 hover:bg-gray-50">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                 <Icon name="box" size={20} />
              </div>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-bold text-[#1e1e2f]">{o.package_name}</span>
                <span className="mt-0.5 block truncate text-[12px] text-gray-500">{o.order_code || "—"} · {fmtDate(o.created_at)}</span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-[15px] font-bold text-[#1e1e2f]">{fmtCoins(o.coins_charged)}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${ORDER_STATUS[o.status]?.cls || "bg-gray-100 text-gray-600"}`}>
                  {ORDER_STATUS[o.status]?.label || o.status}
                </span>
              </span>
            </button>
          ))
        )}
      </div>
    </section>
  );
                }        
