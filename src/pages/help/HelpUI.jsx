// src/pages/help/HelpUI.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES, ZALO_URL, ORDER_STATUS, fmtDate, fmtCoins, fold } from "./helpData.js";
import { useHelpTheme } from "./helpTheme.jsx";

/* Ảnh minh hoạ: tải lên Supabase Storage rồi dán link vào đây (để trống = không hiện) */
export const HELP_IMAGES = {
  hero: "",
  cta: "",
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

export const surface = "rounded-2xl border border-[#e5e7eb] bg-white";
export const ring = "shadow-[0_0_0_0.5px_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.05)]";
export const hairline = "divide-y divide-gray-100";

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

export function SectionTitle({ title, hint, action, onAction }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h2 className="hc-text text-[20px] font-bold leading-tight tracking-[-0.02em] text-[#1e1e2f]">{title}</h2>
        {hint && <p className="hc-muted mt-1 text-[13px]">{hint}</p>}
      </div>
      {action && (
        <button onClick={onAction} className="text-[#625df5] shrink-0 text-[14px] font-semibold hover:underline">{action}</button>
      )}
    </div>
  );
}

/* ============ HERO: thanh trên + lời chào + tìm kiếm ============ */
export function Hero({ query, onQuery, name, onBack }) {
  useHelpTheme();
  return (
    <header className="hc-hero relative overflow-hidden pb-16 pt-6">
      {HELP_IMAGES.hero && (
        <img src={HELP_IMAGES.hero} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-overlay" />
      )}
      <div className="relative mx-auto max-w-md px-4 md:max-w-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <button onClick={onBack} aria-label="Quay lại" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/60 shadow-sm hover:bg-white">
              <Icon name="back" size={18} />
            </button>
            <span className="truncate text-[16px] font-bold tracking-[-0.01em] text-[#1e1e2f]">NXX315</span>
          </div>
          <nav className="flex shrink-0 items-center gap-4 text-[14px] font-medium text-gray-600">
            <Link to="/guide" className="hover:text-[#625df5]">Hướng dẫn</Link>
            <Link to="/contact" className="hover:text-[#625df5]">Liên hệ</Link>
          </nav>
        </div>

        <div className="mt-10 text-center">
          <h1 className="mx-auto mt-2 max-w-[520px] text-[32px] font-bold leading-[1.1] tracking-tight text-[#1e1e2f] sm:text-[40px]">
            {name ? `Chào ${name}, ` : ""}Chúng tôi có thể <span className="text-[#625df5]">giúp gì?</span>
          </h1>

          <div className="mx-auto mt-8 max-w-[540px]">
            <div className="hc-search">
              <Icon name="search" size={20} className="text-gray-400 shrink-0 ml-1" />
              <input
                type="text"
                value={query}
                onChange={(e) => onQuery(e.target.value)}
                placeholder="Tìm kiếm bài viết, câu hỏi..."
              />
              {query && (
                <button onClick={() => onQuery("")} aria-label="Xoá" className="text-gray-400 hover:text-gray-600 flex h-8 w-8 items-center justify-center rounded-full">
                  <Icon name="x" size={16} />
                </button>
              )}
              <button type="button" onClick={() => document.getElementById("help-faq")?.scrollIntoView({ behavior: "smooth" })} className="hc-btn-solid">
                Tìm
              </button>
            </div>
            <div className="mt-4 text-center text-[13px] text-gray-500">
              Chủ đề phổ biến: <span className="underline cursor-pointer hover:text-[#625df5]">Đơn hàng</span>, <span className="underline cursor-pointer hover:text-[#625df5]">Nạp tiền</span>, <span className="underline cursor-pointer hover:text-[#625df5]">Tài khoản</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ============ CÂU HỎI PHỔ BIẾN ============ */
export function PopularFaqs({ faqs, onPick }) {
  const items = faqs.slice(0, 4);
  if (!items.length) return null;
  return (
    <section className="hc-card relative z-10 -mt-8 px-5 pb-2 pt-5 shadow-lg">
      <h2 className="mb-2 text-[18px] font-bold text-[#1e1e2f]">Câu hỏi phổ biến</h2>
      <ul>
        {items.map((f) => (
          <li key={f.id} className="border-b border-gray-100 last:border-0">
            <button onClick={() => onPick(f)} className="flex w-full items-center justify-between gap-4 py-3 text-left text-[15px] font-medium leading-6 text-[#1e1e2f] hover:text-[#625df5]">
              <span className="line-clamp-2">{f.question}</span>
              <Icon name="chevR" size={16} stroke={2.5} className="text-gray-400 shrink-0" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ============ THẺ CHỦ ĐỀ ============ */
export function CategoryCards({ faqs, active, onPick }) {
  const count = (k) => faqs.filter((f) => f.category === k).length;
  const tileColors = ["tile-blue", "tile-purple", "tile-green", "tile-orange", "tile-pink"];

  return (
    <section className="mt-8">
      <SectionTitle title="Duyệt theo chủ đề" />
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((c, i) => {
          const on = active === c.key;
          const colorClass = tileColors[i % tileColors.length];
          return (
            <button key={c.key} onClick={() => onPick(on ? null : c.key)} className={`hc-tile-loom ${colorClass} ${on ? "ring-2 ring-[#625df5] ring-offset-2" : ""}`}>
              <Icon name={c.icon} size={28} stroke={1.8} />
              <span className="text-[14px] font-bold leading-tight mt-1 text-center">{c.label}</span>
              <span className="text-[11px] opacity-70">{count(c.key)} câu hỏi</span>
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
    parts.push(<mark key={j} className="rounded-sm px-0.5 bg-[#e0e7ff] text-[#625df5]">{text.slice(j, j + fq.length)}</mark>);
    i = j + fq.length;
  }
  return <>{parts}</>;
}

function FaqItem({ faq, open, onToggle, query, onAsk }) {
  const [vote, setVote] = useState(null);
  const vbtn = "hc-chip rounded-full px-4 py-1.5 text-[14px] font-medium transition active:scale-95";
  return (
    <div className="hc-rule border-b-[0.5px] last:border-b-0">
      <button onClick={onToggle} aria-expanded={open} className="flex w-full items-start gap-4 px-5 py-4 text-left">
        <span className="hc-text flex-1 text-[16px] font-medium leading-6"><Hl text={faq.question} q={query} /></span>
        <Icon name="chevD" size={18} className={`text-[#625df5] mt-1 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5">
            <p className="hc-text2 whitespace-pre-line text-[15px] font-normal leading-7">{faq.answer}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {vote === "yes" ? (
                <span className="hc-text text-[14px] font-medium">Cảm ơn bạn đã phản hồi.</span>
              ) : (
                <>
                  <span className="hc-muted mr-1 text-[14px]">Câu trả lời này có hữu ích không?</span>
                  <button onClick={() => setVote("yes")} className={vbtn}>Có</button>
                  <button onClick={() => setVote("no")} className={vbtn}>Không</button>
                </>
              )}
            </div>
            {vote === "no" && (
              <button onClick={() => onAsk({ category: faq.category, about: faq.question })}
                className="text-[#625df5] mt-4 text-[15px] font-semibold hover:underline">
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
    <section id="help-faq" className="scroll-mt-4 mt-8">
      <SectionTitle
        title={q ? `Kết quả cho “${q}”` : catLabel || "Tất cả câu hỏi"}
        hint={filtering && !loading ? `${faqs.length} câu hỏi` : null}
        action={cat && !q ? "Xoá bộ lọc" : null}
        onAction={() => setCat(null)}
      />
      <div className="hc-card overflow-hidden">
        {loading ? (
          <div className="animate-pulse space-y-5 p-5">
            {[0, 1, 2].map((i) => <div key={i} className="hc-skel h-4 rounded" />)}
          </div>
        ) : shown.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="hc-text text-[17px] font-bold tracking-[-0.01em]">Không tìm thấy câu hỏi phù hợp</p>
            <p className="hc-muted mt-2 text-[14px]">Gửi yêu cầu để đội ngũ hỗ trợ giúp bạn.</p>
            <button onClick={() => onAsk({ category: cat || null, description: q })}
              className="hc-btn-solid mt-5 h-12 px-6 text-[15px] rounded-xl">
              Gửi yêu cầu hỗ trợ
            </button>
          </div>
        ) : (
          shown.map((f) => (
            <FaqItem key={f.id} faq={f} open={openId === f.id} onToggle={() => setOpenId(openId === f.id ? null : f.id)} query={query} onAsk={onAsk} />
          ))
        )}
        {!filtering && !loading && faqs.length > 5 && openIdx < 5 && (
          <button onClick={() => setExpanded(!expanded)} className="text-[#625df5] flex w-full items-center justify-center gap-1.5 py-4 text-[15px] font-semibold hover:bg-gray-50 transition-colors">
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
    <section className="hc-cta mt-8 px-6 pb-10 pt-12 text-center relative overflow-hidden">
      <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-[#625df5] blur-[80px] opacity-40 pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-[#818cf8] blur-[80px] opacity-20 pointer-events-none"></div>
      
      {HELP_IMAGES.cta && (
        <img src={HELP_IMAGES.cta} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-overlay" />
      )}
      <div className="relative z-10">
        <h3 className="text-[28px] font-bold leading-[1.1] tracking-[-0.02em] text-white">
          Bạn cần <span className="text-[#818cf8]">hỗ trợ thêm?</span>
        </h3>
        <p className="hc-cta-sub mx-auto mt-3 max-w-[320px] text-[15px] font-normal leading-6">
          Đội ngũ NXX315 luôn sẵn sàng giải đáp mọi thắc mắc của bạn.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button onClick={() => onRequest()} className="hc-btn-cta h-12 px-8 text-[15px]">
            Gửi yêu cầu hỗ trợ
          </button>
          <a href={ZALO_URL} target="_blank" rel="noopener noreferrer"
            className="hc-btn-ghost flex h-12 items-center justify-center px-8 text-[15px]">
            Nhắn Zalo
          </a>
        </div>
      </div>
    </section>
  );
  }
