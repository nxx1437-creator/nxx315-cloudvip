// src/pages/help/HelpUI.jsx — icon + hero + danh mục + FAQ + liên hệ (gộp từ HelpIcons/HelpHero/HelpSections/HelpFaq)
import React, { useState } from "react";
import { CATEGORIES, ZALO_URL, ORDER_STATUS, fmtDate, fmtCoins, fold } from "./helpData.js";

/* ============ ICON ============ */
const P = {
  back: <path d="M19 12H5M12 19l-7-7 7-7" />,
  home: <path d="M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />,
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
  folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  info: (<><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>),
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
export const surface = "rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900";
const divide = "divide-y divide-slate-100 dark:divide-slate-800";
const rowHover = "transition hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-slate-800/60";

export function IconBox({ name, size = 18 }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
      <Icon name={name} size={size} />
    </span>
  );
}

export function SectionTitle({ title, hint, action, onAction }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
        {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
      </div>
      {action && (
        <button onClick={onAction} className="shrink-0 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-300">
          {action}
        </button>
      )}
    </div>
  );
}

/* ============ HERO + TÌM KIẾM (kiểu Intercom) ============ */
export function Hero({ query, onQuery }) {
  return (
    <header className="bg-gradient-to-b from-emerald-600 to-slate-100 pb-5 pt-7 dark:from-emerald-800 dark:to-slate-950">
      <div className="mx-auto max-w-md px-4 md:max-w-3xl">
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-white">Chúng tôi có thể giúp gì cho bạn?</h1>
        <div className="relative mt-5">
          <Icon name="search" size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Tìm câu hỏi thường gặp"
            className="h-[52px] w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-[15px] text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          {query && (
            <button onClick={() => onQuery("")} aria-label="Xoá"
              className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <Icon name="x" size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

/* ============ CÂU HỎI PHỔ BIẾN ============ */
export function PopularFaqs({ faqs, onPick }) {
  const items = faqs.slice(0, 6);
  if (!items.length) return null;
  return (
    <section className={`${surface} p-4`}>
      <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white">Câu hỏi phổ biến</h2>
      <ul className="mt-1 md:grid md:grid-cols-2 md:gap-x-8">
        {items.map((f) => (
          <li key={f.id}>
            <button onClick={() => onPick(f)}
              className="flex w-full items-center justify-between gap-3 border-b border-slate-100 py-3 text-left text-[13.5px] leading-5 text-slate-700 transition hover:text-emerald-700 dark:border-slate-800 dark:text-slate-200">
              <span className="line-clamp-2">{f.question}</span>
              <Icon name="chevR" size={15} className="shrink-0 text-emerald-600" />
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
    <section className={`${surface} ${divide} overflow-hidden`}>
      {items.map((it) => (
        <button key={it.title} onClick={() => it.on()} className={`flex w-full items-center gap-3 px-4 py-3.5 text-left ${rowHover}`}>
          <IconBox name={it.icon} />
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-medium text-slate-900 dark:text-white">{it.title}</span>
            <span className="mt-0.5 block truncate text-xs text-slate-500">{it.sub}</span>
          </span>
          {it.tag && (
            <span className="flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{it.tag}
            </span>
          )}
          <Icon name="chevR" size={16} className="shrink-0 text-slate-300" />
        </button>
      ))}
    </section>
  );
}

/* ============ GIAO DỊCH GẦN ĐÂY ============ */
export function OrderList({ orders, loading, signedIn, onAsk, onAll }) {
  const note = (icon, text) => (
    <div className="flex items-center gap-3 px-4 py-4">
      <IconBox name={icon} />
      <p className="text-sm leading-5 text-slate-500">{text}</p>
    </div>
  );
  return (
    <section>
      <SectionTitle title="Giao dịch gần đây" hint="Chọn một đơn để báo vấn đề" action={signedIn ? "Xem tất cả" : null} onAction={onAll} />
      <div className={`${surface} ${divide} overflow-hidden`}>
        {loading ? (
          [0, 1].map((i) => (
            <div key={i} className="flex animate-pulse items-center gap-3 px-4 py-3.5">
              <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800" />
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
              <button key={o.id} onClick={() => onAsk({ category: "order", orderId: o.id })}
                className={`flex w-full items-center gap-3 px-4 py-3.5 text-left ${rowHover}`}>
                <IconBox name="box" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium text-slate-900 dark:text-white">{o.package_name}</span>
                  <span className="mt-0.5 block truncate text-xs text-slate-500">{o.order_code || "—"} · {fmtDate(o.created_at)}</span>
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

/* ============ THẺ CHỦ ĐỀ (kiểu Intercom) ============ */
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
              className={`flex flex-col items-start rounded-xl border p-4 text-left transition active:scale-[0.98] [&:last-child:nth-child(odd)]:col-span-2 md:[&:last-child:nth-child(odd)]:col-span-1 ${
                on ? "border-emerald-600 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-500/10"
                   : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"}`}>
              <span className="text-emerald-700 dark:text-emerald-300"><Icon name={c.icon} size={22} /></span>
              <span className="mt-3 text-[14px] font-semibold leading-tight text-slate-900 dark:text-white">{c.label}</span>
              <span className="mt-1 line-clamp-3 text-[12.5px] leading-[18px] text-slate-500">{c.desc}</span>
              <span className="mt-3 text-[11.5px] text-slate-400">{count(c.key)} câu hỏi</span>
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
    parts.push(
      <mark key={j} className="rounded bg-emerald-100 px-0.5 text-inherit dark:bg-emerald-500/30">{text.slice(j, j + fq.length)}</mark>
    );
    i = j + fq.length;
  }
  return <>{parts}</>;
}

function FaqItem({ faq, open, onToggle, query, onAsk }) {
  const [vote, setVote] = useState(null);
  const vbtn = "rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 active:bg-slate-100 dark:border-slate-700 dark:text-slate-300";
  return (
    <div className="border-b border-slate-100 last:border-0 dark:border-slate-800">
      <button onClick={onToggle} aria-expanded={open} className="flex w-full items-start gap-3 px-4 py-3.5 text-left">
        <span className="flex-1 text-[14px] font-medium leading-5 text-slate-900 dark:text-slate-100"><Hl text={faq.question} q={query} /></span>
        <Icon name="chevD" size={18} className={`mt-0.5 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180 text-emerald-700" : ""}`} />
      </button>
      <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4">
            <p className="whitespace-pre-line border-l-2 border-emerald-200 pl-3 text-[14px] leading-6 text-slate-600 dark:border-emerald-500/40 dark:text-slate-300">{faq.answer}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {vote === "yes" ? (
                <span className="text-xs font-medium text-emerald-700">Cảm ơn bạn đã phản hồi.</span>
              ) : (
                <>
                  <span className="text-xs text-slate-500">Câu trả lời này có hữu ích không?</span>
                  <button onClick={() => setVote("yes")} className={vbtn}>Có</button>
                  <button onClick={() => setVote("no")} className={vbtn}>Không</button>
                </>
              )}
            </div>
            {vote === "no" && (
              <button onClick={() => onAsk({ category: faq.category, about: faq.question })}
                className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-emerald-700 hover:underline dark:text-emerald-300">
                Gửi yêu cầu hỗ trợ <Icon name="chevR" size={14} />
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
      <div className={`${surface} overflow-hidden`}>
        {loading ? (
          <div className="animate-pulse space-y-4 p-4">
            {[0, 1, 2].map((i) => <div key={i} className="h-4 rounded bg-slate-100 dark:bg-slate-800" />)}
          </div>
        ) : shown.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-[15px] font-medium text-slate-900 dark:text-white">Không tìm thấy câu hỏi phù hợp</p>
            <p className="mt-1 text-sm text-slate-500">Hãy gửi yêu cầu để đội ngũ hỗ trợ giúp bạn.</p>
            <button onClick={() => onAsk({ category: cat || null, description: q })}
              className="mt-4 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 active:bg-emerald-800">
              Gửi yêu cầu hỗ trợ
            </button>
          </div>
        ) : (
          shown.map((f) => (
            <FaqItem key={f.id} faq={f} open={openId === f.id} onToggle={() => setOpenId(openId === f.id ? null : f.id)} query={query} onAsk={onAsk} />
          ))
        )}
        {!filtering && !loading && faqs.length > 5 && openIdx < 5 && (
          <button onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-center gap-1.5 border-t border-slate-100 py-3 text-sm font-medium text-emerald-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-emerald-300">
            {expanded ? "Thu gọn" : `Xem thêm ${faqs.length - 5} câu hỏi`}
            <Icon name="chevD" size={15} className={expanded ? "rotate-180" : ""} />
          </button>
        )}
      </div>
    </section>
  );
}

/* ============ VẪN CẦN HỖ TRỢ ============ */
export function ContactCard({ onRequest }) {
  return (
    <section className="rounded-xl border border-emerald-100 bg-emerald-50 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">Vẫn cần hỗ trợ?</h3>
      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">Chưa tìm được câu trả lời? Gửi yêu cầu hoặc nhắn trực tiếp cho NXX315.</p>
      <div className="mt-4 flex gap-3">
        <button onClick={() => onRequest()} className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 active:bg-emerald-800">
          Gửi yêu cầu
        </button>
        <a href={ZALO_URL} target="_blank" rel="noopener noreferrer"
          className="flex-1 rounded-lg border border-emerald-200 bg-white py-2.5 text-center text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-500/30 dark:bg-transparent dark:text-emerald-300">
          Nhắn Zalo
        </a>
      </div>
    </section>
  );
      }
                                 

