// src/pages/help/HelpUI.jsx — icon + hero + danh mục + FAQ + liên hệ
// Phong cách Intercom Help Center: hero chuyển trắng, thẻ trắng viền mảnh bo nhẹ, chữ đậm.
// Màu sáng/tối được đổi bởi helpTheme.css (đọc từ profiles.theme_mode).
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES, ZALO_URL, ORDER_STATUS, fmtDate, fmtCoins, fold } from "./helpData.js";
import { useHelpTheme } from "./helpTheme.js";

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
};

export function Icon({ name, size = 20, stroke = 2, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {P[name]}
    </svg>
  );
}

/* ============ DÙNG CHUNG ============ */
export const surface = "rounded-xl border border-[#e4e9f2] bg-white";
export const ring = "shadow-[0_0_0_0.5px_rgba(22,33,62,0.12),0_1px_2px_0_rgba(22,33,62,0.1)]";
export const hairline = "divide-y divide-[#16213e]/10";
const rowHover = "transition active:bg-[#f5f8ff]";
const lift = "shadow-[0_8px_28px_-14px_rgba(22,33,62,0.28)]";

export function StatusDot({ st }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] text-[#4a5368]">
      <span className={`h-2 w-2 rounded-full ${st.dot || "bg-slate-400"}`} />
      {st.label}
    </span>
  );
}

export function IconBox({ name, size = 20 }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf1ff] text-[#2b59e0]">
      <Icon name={name} size={size} />
    </span>
  );
}

export function SectionTitle({ title, hint, action, onAction }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-[20px] font-semibold leading-tight tracking-[-0.02em] text-[#16213e]">{title}</h2>
        {hint && <p className="mt-0.5 text-[13px] text-[#6b7488]">{hint}</p>}
      </div>
      {action && (
        <button onClick={onAction} className="shrink-0 text-[14px] font-medium text-[#2b59e0]">{action}</button>
      )}
    </div>
  );
}

/* ============ HERO: thanh trên + lời chào + tìm kiếm ============ */
export function Hero({ query, onQuery, name, onBack }) {
  useHelpTheme();
  const greet = name ? `Chào ${name}, chúng tôi có thể giúp gì cho bạn?` : "Chúng tôi có thể giúp gì cho bạn?";
  return (
    <header className="pb-24 pt-3 text-white"
      style={{ background: "linear-gradient(180deg,#2347d1 0%,#3359e0 34%,#7f9df0 66%,#ffffff 100%)" }}>
      <div className="mx-auto max-w-md px-4 md:max-w-4xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <button onClick={onBack} aria-label="Quay lại"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 transition active:bg-white/25">
              <Icon name="back" size={18} />
            </button>
            <span className="truncate text-[15px] font-semibold tracking-[-0.01em]">NXX315</span>
            <span className="h-4 w-px shrink-0 bg-white/40" />
            <span className="truncate text-[14px] text-white/85">Trợ giúp</span>
          </div>
          <nav className="flex shrink-0 items-center gap-4 text-[13px] text-white/90">
            <Link to="/guide" className="transition active:opacity-70">Hướng dẫn</Link>
            <Link to="/contact" className="transition active:opacity-70">Liên hệ</Link>
          </nav>
        </div>

        <h1 className="mt-10 max-w-[560px] text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] sm:text-[34px]">{greet}</h1>

        <div className="group relative mt-6 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm transition focus-within:border-transparent focus-within:bg-white focus-within:shadow-lg">
          <Icon name="search" size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/90 group-focus-within:text-[#6b7488]" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Tìm câu hỏi thường gặp..."
            className="h-12 w-full rounded-xl bg-transparent pl-11 pr-11 text-[16px] text-white outline-none placeholder:text-white/85 focus:text-[#16213e] focus:placeholder:text-[#8b93a7]"
          />
          {query && (
            <button onClick={() => onQuery("")} aria-label="Xoá"
              className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-white/80 group-focus-within:text-[#6b7488]">
              <Icon name="x" size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

/* ============ CÂU HỎI PHỔ BIẾN (thẻ nổi lên hero) ============ */
export function PopularFaqs({ faqs, onPick }) {
  const items = faqs.slice(0, 6);
  if (!items.length) return null;
  return (
    <section className={`${surface} ${lift} px-5 pb-2 pt-5`}>
      <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-[#16213e]">Câu hỏi phổ biến</h2>
      <ul className="mt-2 md:grid md:grid-cols-2 md:gap-x-12">
        {items.map((f) => (
          <li key={f.id} className="border-b border-[#16213e]/[0.07] last:border-b-0 md:border-b-0">
            <button onClick={() => onPick(f)} className="flex w-full items-center justify-between gap-4 py-3 text-left text-[15px] leading-6 text-[#16213e]">
              <span className="line-clamp-2">{f.question}</span>
              <Icon name="chevR" size={14} stroke={2.5} className="shrink-0 text-[#2b59e0]" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ============ LIÊN HỆ NHANH ============ */
export function QuickActions({ onChat, onRequest, onHistory }) {
  const items = [
    { icon: "chat", title: "Chat với trợ lý AI", sub: "Phản hồi ngay, hoạt động 24/7", on: onChat, tag: "Trực tuyến" },
    { icon: "send", title: "Gửi yêu cầu hỗ trợ", sub: "Báo lỗi, hỏi đơn hàng hoặc góp ý", on: onRequest },
    { icon: "history", title: "Lịch sử yêu cầu", sub: "Theo dõi trạng thái và phản hồi", on: onHistory },
  ];
  return (
    <section className={`${surface} ${hairline} overflow-hidden`}>
      {items.map((it) => (
        <button key={it.title} onClick={() => it.on()} className={`flex w-full items-center gap-3.5 px-5 py-3.5 text-left ${rowHover}`}>
          <IconBox name={it.icon} />
          <span className="min-w-0 flex-1">
            <span className="block text-[16px] font-semibold leading-6 tracking-[-0.01em] text-[#16213e]">{it.title}</span>
            <span className="block truncate text-[13px] text-[#6b7488]">{it.sub}</span>
          </span>
          {it.tag && <span className="rounded-full bg-[#eaf1ff] px-2.5 py-1 text-[12px] font-medium text-[#2b59e0]">{it.tag}</span>}
          <Icon name="chevR" size={15} className="shrink-0 text-[#8b93a7]" />
        </button>
      ))}
    </section>
  );
}

/* ============ GIAO DỊCH GẦN ĐÂY ============ */
export function OrderList({ orders, loading, signedIn, onAsk, onAll }) {
  const note = (icon, text) => (
    <div className="flex items-center gap-3.5 px-5 py-4">
      <IconBox name={icon} />
      <p className="text-[14px] leading-6 text-[#6b7488]">{text}</p>
    </div>
  );
  return (
    <section>
      <SectionTitle title="Giao dịch gần đây" hint="Chọn một đơn để báo vấn đề" action={signedIn ? "Xem tất cả" : null} onAction={onAll} />
      <div className={`${surface} ${hairline} overflow-hidden`}>
        {loading ? (
          [0, 1].map((i) => (
            <div key={i} className="flex animate-pulse items-center gap-3.5 px-5 py-3.5">
              <div className="h-10 w-10 rounded-xl bg-[#eef2f9]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 rounded bg-[#eef2f9]" />
                <div className="h-3 w-3/4 rounded bg-[#eef2f9]" />
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
              <button key={o.id} onClick={() => onAsk({ category: "order", orderId: o.id })} className={`flex w-full items-center gap-3.5 px-5 py-3.5 text-left ${rowHover}`}>
                <IconBox name="box" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold tracking-[-0.01em] text-[#16213e]">{o.package_name}</span>
                  <span className="block truncate text-[13px] text-[#6b7488]">{o.order_code || "—"} · {fmtDate(o.created_at)}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-[15px] font-semibold text-[#16213e]">{fmtCoins(o.coins_charged)}</span>
                  <StatusDot st={st} />
                </span>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}

/* ============ THẺ CHỦ ĐỀ ============ */
export function CategoryCards({ faqs, active, onPick }) {
  const count = (k) => faqs.filter((f) => f.category === k).length;
  return (
    <section>
      <SectionTitle title="Duyệt theo chủ đề" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {CATEGORIES.map((c) => {
          const on = active === c.key;
          return (
            <button key={c.key} onClick={() => onPick(on ? null : c.key)}
              className={`flex flex-col items-start rounded-xl border p-4 text-left transition active:scale-[0.99] [&:last-child:nth-child(odd)]:col-span-2 md:[&:last-child:nth-child(odd)]:col-span-1 ${on ? "border-[#2b59e0] bg-[#eaf1ff]" : "border-[#e4e9f2] bg-white"}`}>
              <Icon name={c.icon} size={22} className="text-[#2b59e0]" />
              <span className="mt-4 text-[15px] font-semibold leading-tight tracking-[-0.01em] text-[#16213e]">{c.label}</span>
              <span className="mt-1 line-clamp-3 text-[13px] leading-5 text-[#6b7488]">{c.desc}</span>
              <span className="mt-4 text-[12px] text-[#8b93a7]">{count(c.key)} câu hỏi</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ============ FAQ ============ */
function Hl({ text, q }) {
  const fq = fold((q || "").trim());
  if (!fq) return text;
  const ft = fold(text);
  const parts = [];
  let i = 0;
  for (;;) {
    const j = ft.indexOf(fq, i);
    if (j < 0) { parts.push(text.slice(i)); break; }
    parts.push(text.slice(i, j));
    parts.push(<mark key={j} className="rounded-sm bg-[#dbe7ff] px-0.5 text-inherit">{text.slice(j, j + fq.length)}</mark>);
    i = j + fq.length;
  }
  return <>{parts}</>;
}

function FaqItem({ faq, open, onToggle, query, onAsk }) {
  const [vote, setVote] = useState(null);
  const vbtn = "rounded-lg border border-[#e4e9f2] bg-white px-4 py-2 text-[14px] font-medium text-[#16213e] transition active:bg-[#f5f8ff]";
  return (
    <div>
      <button onClick={onToggle} aria-expanded={open} className="flex w-full items-start gap-4 px-5 py-4 text-left">
        <span className="flex-1 text-[16px] font-medium leading-6 text-[#16213e]"><Hl text={faq.question} q={query} /></span>
        <Icon name="chevD" size={18} className={`mt-1 shrink-0 text-[#2b59e0] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5">
            <p className="whitespace-pre-line text-[15px] leading-7 text-[#4a5368]">{faq.answer}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {vote === "yes" ? (
                <span className="text-[14px] font-medium text-[#16213e]">Cảm ơn bạn đã phản hồi.</span>
              ) : (
                <>
                  <span className="mr-1 text-[14px] text-[#6b7488]">Câu trả lời này có hữu ích không?</span>
                  <button onClick={() => setVote("yes")} className={vbtn}>Có</button>
                  <button onClick={() => setVote("no")} className={vbtn}>Không</button>
                </>
              )}
            </div>
            {vote === "no" && (
              <button onClick={() => onAsk({ category: faq.category, about: faq.question })}
                className="mt-4 text-[15px] font-semibold text-[#2b59e0]">
                Gửi yêu cầu hỗ trợ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FaqSection({ faqs, loading, cat, setCat, query, openId, setOpenId, onAsk }) {
  const [expanded, setExpanded] = useState(false);
  const q = query.trim();
  const filtering = !!q || !!cat;
  const openIdx = openId ? faqs.findIndex((f) => f.id === openId) : -1;
  const showAll = filtering || expanded || openIdx >= 5;
  const shown = showAll ? faqs : faqs.slice(0, 5);
  const catLabel = CATEGORIES.find((c) => c.key === cat)?.label;

  return (
    <section id="help-faq" className="scroll-mt-4">
      <SectionTitle
        title={q ? `Kết quả cho “${q}”` : catLabel || "Tất cả câu hỏi"}
        hint={filtering && !loading ? `${faqs.length} câu hỏi` : null}
        action={cat && !q ? "Xoá bộ lọc" : null}
        onAction={() => setCat(null)}
      />
      <div className={`${surface} ${hairline} overflow-hidden`}>
        {loading ? (
          <div className="animate-pulse space-y-5 p-5">
            {[0, 1, 2].map((i) => <div key={i} className="h-4 rounded bg-[#eef2f9]" />)}
          </div>
        ) : shown.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-[17px] font-semibold tracking-[-0.01em] text-[#16213e]">Không tìm thấy câu hỏi phù hợp</p>
            <p className="mt-1 text-[14px] text-[#6b7488]">Gửi yêu cầu để đội ngũ hỗ trợ giúp bạn.</p>
            <button onClick={() => onAsk({ category: cat || null, description: q })}
              className="mt-5 rounded-xl bg-[#2b59e0] px-6 py-3 text-[15px] font-semibold text-white transition active:scale-[0.98]">
              Gửi yêu cầu hỗ trợ
            </button>
          </div>
        ) : (
          shown.map((f) => (
            <FaqItem key={f.id} faq={f} open={openId === f.id} onToggle={() => setOpenId(openId === f.id ? null : f.id)} query={query} onAsk={onAsk} />
          ))
        )}
        {!filtering && !loading && faqs.length > 5 && openIdx < 5 && (
          <button onClick={() => setExpanded(!expanded)} className="flex w-full items-center justify-center gap-1.5 py-3.5 text-[15px] font-semibold text-[#2b59e0]">
            {expanded ? "Thu gọn" : `Xem thêm ${faqs.length - 5} câu hỏi`}
            <Icon name="chevD" size={15} className={expanded ? "rotate-180" : ""} />
          </button>
        )}
      </div>
    </section>
  );
}

/* ============ VẪN CẦN HỖ TRỢ (thẻ màu duy nhất ở cuối trang) ============ */
export function ContactCard({ onRequest }) {
  return (
    <section className="rounded-xl px-6 pb-6 pt-7 text-white" style={{ background: "linear-gradient(160deg,#2347d1 0%,#3b63e6 100%)" }}>
      <h3 className="text-[24px] font-semibold leading-[1.15] tracking-[-0.02em]">Vẫn cần hỗ trợ?</h3>
      <p className="mt-2 text-[15px] leading-6 text-white/85">Chưa tìm được câu trả lời? Gửi yêu cầu hoặc nhắn trực tiếp cho NXX315.</p>
      <div className="mt-5 flex gap-3">
        <button onClick={() => onRequest()} className="flex-1 rounded-xl bg-white py-3 text-[15px] font-semibold text-[#2347d1] transition active:scale-[0.98]">
          Gửi yêu cầu
        </button>
        <a href={ZALO_URL} target="_blank" rel="noopener noreferrer"
          className="flex-1 rounded-xl border border-white/50 py-3 text-center text-[15px] font-semibold text-white transition active:scale-[0.98]">
          Nhắn Zalo
        </a>
      </div>
    </section>
  );
          }
