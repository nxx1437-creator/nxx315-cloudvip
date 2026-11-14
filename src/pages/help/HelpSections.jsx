// src/pages/help/HelpSections.jsx
import React from "react";
import Icon from "./HelpIcons.jsx";
import { CATEGORIES, ORDER_STATUS, fmtDate, fmtCoins } from "./helpData.js";
import { IconBox, SectionTitle, StatusDot } from "./HelpUI.jsx"; // Tận dụng lại các component chung

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
          <button
            key={it.title}
            onClick={() => it.on()}
            className="hc-row flex w-full items-center gap-4 px-5 py-4 text-left border-b-[0.5px] border-[var(--h-line)] last:border-0"
          >
            <IconBox name={it.icon} />
            <span className="min-w-0 flex-1">
              <span className="hc-text block text-[16px] font-semibold text-[#1e1e2f]">{it.title}</span>
              <span className="hc-muted mt-0.5 block truncate text-[13px]">{it.sub}</span>
            </span>
            {it.tag && (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 border border-emerald-100">
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
      <SectionTitle
        title="Giao dịch gần đây"
        hint="Chọn một đơn để báo vấn đề"
        action={signedIn ? "Xem tất cả" : null}
        onAction={onAll}
      />
      <div className="hc-card overflow-hidden">
        {loading ? (
          [0, 1].map((i) => (
            <div key={i} className="flex animate-pulse items-center gap-4 px-5 py-4">
              <div className="h-11 w-11 rounded-full bg-gray-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 rounded bg-gray-100" />
                <div className="h-3 w-3/4 rounded bg-gray-100" />
              </div>
            </div>
          ))
        ) : !signedIn ? (
          note("lock", "Đăng nhập để xem và báo vấn đề về các đơn đổi thưởng của bạn.")
        ) : orders.length === 0 ? (
          note("box", "Bạn chưa có đơn đổi thưởng nào.")
        ) : (
          orders.slice(0, 3).map((o) => {
            const st = ORDER_STATUS[o.status] || { label: o.status, dot: "bg-slate-400" };
            return (
              <button
                key={o.id}
                onClick={() => onAsk({ category: "order", title: `Hỏi về đơn ${o.order_code || ""}`.trim() })}
                className="hc-row flex w-full items-center gap-4 px-5 py-4 text-left border-b-[0.5px] border-[var(--h-line)] last:border-0"
              >
                {/* Icon box bo tròn nhẹ, màu xanh nhạt */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                   <Icon name="box" size={20} />
                </div>
                <span className="min-w-0 flex-1">
                  <span className="hc-text block truncate text-[15px] font-bold text-[#1e1e2f]">{o.package_name}</span>
                  <span className="hc-muted mt-0.5 block truncate text-[13px]">
                    {o.order_code || "—"} · {fmtDate(o.created_at)}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="text-[15px] font-bold text-[#1e1e2f]">{fmtCoins(o.coins_charged)}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ORDER_STATUS[o.status]?.cls || "bg-gray-100 text-gray-600"}`}>
                    {ORDER_STATUS[o.status]?.label || o.status}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}

export function CategoryGrid({ active, onPick }) {
  // Component này có thể bỏ qua nếu bạn dùng CategoryCards bên HelpUI, 
  // nhưng mình giữ lại phòng trường hợp bạn dùng ở chỗ khác.
  return null; 
                    }
            
