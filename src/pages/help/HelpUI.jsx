// src/pages/help/HelpUI.jsx — icon + thành phần dùng chung + đơn gần đây
import React from "react";
import { ORDER_STATUS, fmtDate, fmtCoins } from "./helpData.js";
import { Chev } from "./HelpArt.jsx";

/* ============ ẢNH MINH HOẠ — CHỖ DÁN LINK ẢNH CỦA BẠN ============
   Tải ảnh lên Supabase Storage (bucket công khai) rồi dán link vào đúng dòng bên dưới.
   Để trống "" thì trang tự vẽ tranh pixel có sẵn, nên chưa có ảnh cũng không bị trống.

   hero    Ảnh đầu trang, phủ kín cả màn hình. Nên là tranh pixel / minh hoạ phong cảnh ngập nắng, ngang 3:2 (khoảng 1800x1200).
           Phần TRỜI phía trên để thoáng cho dòng chữ nhỏ, góc DƯỚI TRÁI để yên tĩnh vì có ô kính chữ nằm đè lên.
   cardRequest, cardHistory, cardZalo
           Ba ảnh bìa nhỏ cho 3 thẻ liên hệ. Khung 8:7 (khoảng 800x700). Nền trời xanh, mây pixel, lá ở hai góc, giữa để trống.
   invite  Khung xanh lớn "Hỏi trợ lý AI". Ngang 4:3 (khoảng 1600x1200). Trời xanh rộng, nửa TRÊN-TRÁI để trống cho chữ trắng,
           hoa hướng dương / cây cối mọc từ mép DƯỚI và bên PHẢI.
   flower  Một vật thể pixel đứng một mình (bông hoa). PNG nền trong suốt, dọc 2:3 (khoảng 600x900). Không có khung.
   closing Cảnh khép trang. Rất ngang, khoảng 2400x900. Hai bên tối (xanh rêu), GIỮA sáng như đại lộ nắng; đáy tối dần.
   rocket  Không dùng nữa, để "" (giữ lại cho các file cũ). */
export const HELP_IMAGES = {
  hero: "",
  cardRequest: "",
  cardHistory: "",
  cardZalo: "",
  invite: "",
  flower: "",
  closing: "",
  rocket: "",
};

/* ============ ICON ============ */
const P = {
  back: <path d="M19 12H5M12 19l-7-7 7-7" />,
  search: (<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>),
  history: <path d="M3 12a9 9 0 1 0 3-6.7M3 4v4h4M12 7v5l3 2" />,
  chat: <path d="M21 12c0 4.4-4 8-9 8-1.6 0-3-.3-4.3-.9L3 21l1.7-4.5C3.6 15.1 3 13.6 3 12c0-4.4 4-8 9-8s9 3.6 9 8z" />,
  box: <path d="M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8" />,
  card: (<><rect x="2" y="5" width="20" height="14" rx="3" /><path d="M2 10h20M6 15h4" /></>),
  shield: <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6zM9 12l2 2 4-4" />,
  bug: <path d="M8 8a4 4 0 0 1 8 0v6a4 4 0 0 1-8 0zM12 8v10M4 13h4M16 13h4M5 6l3 2M19 6l-3 2M5 20l3-2M19 20l-3-2" />,
  help: (<><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01" /></>),
  send: <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />,
  chevR: <path d="m9 6 6 6-6 6" />,
  chevD: <path d="m6 9 6 6 6-6" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
  camera: (<><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></>),
  lock: (<><rect x="4" y="11" width="16" height="10" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>),
  info: (<><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>),
  folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
};

export function Icon({ name, size = 20, stroke = 2, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {P[name]}
    </svg>
  );
}

/* ============ DÙNG CHUNG (giữ nguyên tên cũ cho các file khác) ============ */
export const surface = "rounded-xl border border-[#e4e9f2] bg-white";
export const ring = "shadow-[0_0_0_0.5px_rgba(22,33,62,0.12),0_1px_2px_0_rgba(22,33,62,0.1)]";
export const hairline = "divide-y divide-[#16213e]/10";

export function StatusDot({ st }) {
  return (
    <span className="hc-text2 inline-flex shrink-0 items-center gap-1.5 text-[13px]">
      <span className={`h-2 w-2 rounded-full ${st.dot || "bg-slate-400"}`} />
      {st.label}
    </span>
  );
}

export function IconBox({ name, size = 20 }) {
  return (
    <span className="hc-iconbox">
      <Icon name={name} size={size} />
    </span>
  );
}

export function SectionTitle({ title, hint, action, onAction, as: Tag = "h2" }) {
  return (
    <div className="hw-sechead">
      <div className="min-w-0">
        <Tag className="hw-h3">{title}</Tag>
        {hint && <p className="hw-caption mt-1">{hint}</p>}
      </div>
      {action && (
        <button type="button" onClick={onAction} className="hw-textaction hw-textaction-ink shrink-0">
          <span>{action}</span>
          <Chev dark />
        </button>
      )}
    </div>
  );
}

/* ============ ĐƠN GẦN ĐÂY: khung đôi (khay ngoài 24px, tờ trong 12px) ============ */
export function OrderList({ orders, loading, signedIn, onAsk, onAll }) {
  const note = (icon, text) => (
    <div className="flex items-center gap-3.5 px-5 py-5">
      <IconBox name={icon} />
      <p className="hw-body">{text}</p>
    </div>
  );
  return (
    <section className="hw-orders">
      <SectionTitle title="Đơn gần đây" hint="Chọn một đơn để báo vấn đề" action={signedIn ? "Xem tất cả" : null} onAction={onAll} as="h3" />
      <div className="hw-tray">
        <div className="hw-sheet">
          {loading ? (
            [0, 1].map((i) => (
              <div key={i} className="flex animate-pulse items-center gap-3.5 px-5 py-4">
                <div className="hc-skel h-10 w-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="hc-skel h-4 w-1/2 rounded" />
                  <div className="hc-skel h-3 w-3/4 rounded" />
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
                <button type="button" key={o.id} onClick={() => onAsk({ category: "order", orderId: o.id })} className="hw-row">
                  <IconBox name="box" />
                  <span className="min-w-0 flex-1">
                    <span className="hw-rowtitle block truncate">{o.package_name}</span>
                    <span className="hw-caption block truncate">{o.order_code || "—"} · {fmtDate(o.created_at)}</span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span className="hw-rowtitle">{fmtCoins(o.coins_charged)}</span>
                    <StatusDot st={st} />
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
   }
