// src/pages/help/HelpUI.jsx — icon + hero + danh mục + FAQ + liên hệ (kiểu Loom, trắng / đen)
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES, ZALO_URL, ORDER_STATUS, fmtDate, fmtCoins, fold } from "./helpData.js";
import { useHelpTheme } from "./helpTheme.jsx";

/* Ảnh minh hoạ: tải lên Supabase Storage (bucket công khai) rồi dán link vào đây.
   rocket = tên lửa phía sau đầu trang (nên dùng PNG/WebP nền trong suốt). Để trống = không hiện. */
export const HELP_IMAGES = {
  rocket: "",
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

export function SectionTitle({ title, hint, action, onAction }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h2 className="hc-text text-[22px] font-semibold leading-tight tracking-[-0.02em]">{title}</h2>
        {hint && <p className="hc-muted mt-0.5 text-[13px]">{hint}</p>}
      </div>
      {action && (
        <button type="button" onClick={onAction} className="hc-accent shrink-0 text-[14px] font-medium">{action}</button>
      )}
    </div>
  );
}

/* ============ HERO: thanh trên + lời chào + tìm kiếm + chủ đề phổ biến ============ */
export function Hero({ query, onQuery, name, onBack, topics = [], onTopic, canSearch = true }) {
  // Gọi hook ở đây để đảm bảo theme áp dụng khi Hero mount. Nếu hook set CSS vars global
  // thì chỉ cần 1 lần; nếu cần chắc chắn, hãy gọi useHelpTheme() ở page cha thay vì ở đây.
  useHelpTheme();

  const handleSearch = () => {
    if (!canSearch) return;
    document.getElementById("help-faq")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="hc-hero relative overflow-hidden pb-10 pt-3">
      {HELP_IMAGES.hero && (
        <img src={HELP_IMAGES.hero} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30" />
      )}
      {HELP_IMAGES.rocket && <img src={HELP_IMAGES.rocket} alt="" className="hc-rocket" />}

      <div className="relative z-10 mx-auto max-w-md px-4 md:max-w-4xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <button type="button" onClick={onBack} aria-label="Quay lại" className="hc-roundbtn">
              <Icon name="back" size={18} />
            </button>
            <span className="hc-text truncate text-[15px] font-bold tracking-[-0.01em]">NXX315</span>
            <span className="hc-vr shrink-0" />
            <span className="hc-muted truncate text-[14px]">Trợ giúp</span>
          </div>
          <nav className="hc-text2 flex shrink-0 items-center gap-4 text-[13px]">
            <Link to="/guide" className="transition active:opacity-70">Hướng dẫn</Link>
            <Link to="/contact" className="transition active:opacity-70">Liên hệ</Link>
          </nav>
        </div>

        <div className="mt-9 text-center">
          <h1 className="hc-text mx-auto max-w-[520px] text-[32px] leading-[1.1] sm:text-[42px]">
            {name ? `Chào ${name}, chúng tôi có thể giúp gì cho bạn?` : "Chúng tôi có thể giúp gì cho bạn?"}
          </h1>

          <div className="hc-search mx-auto mt-6 max-w-[520px] text-left">
            <Icon name="search" size={18} className="hc-muted shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Tìm câu hỏi thường gặp..."
            />
            {query && (
              <button type="button" onClick={() => onQuery("")} aria-label="Xoá"
                className="hc-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                <Icon name="x" size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={handleSearch}
              disabled={!canSearch}
              className="hc-btn-solid shrink-0 text-[14px] disabled:opacity-50"
            >
              Tìm kiếm
            </button>
          </div>

          {topics.length > 0 && onTopic && (
            <p className="hc-muted mt-4 text-[13px]">
              Chủ đề phổ biến:{" "}
              {topics.map((c, i) => (
                <React.Fragment key={c.key}>
                  <button type="button" onClick={() => onTopic(c.key)} className="hc-topic">{c.label}</button>
                  {i < topics.length - 1 ? ", " : ""}
                </React.Fragment>
              ))}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}

/* ============ CÂU HỎI NỔI BẬT (dải tràn bề ngang, kiểu "Trending Articles") ============ */
export function PopularFaqs({ faqs, onPick }) {
  const items = faqs.slice(0, 6);
  if (!items.length) return null;
  return (
    <section className="hc-band">
      <div className="mx-auto max-w-md px-4 md:max-w-4xl">
        <h2 className="hc-text text-center text-[28px] font-bold tracking-[-0.03em]">Câu hỏi nổi bật</h2>
        <ul className="mt-6 grid gap-x-10 md:grid-cols-3">
          {items.map((f) => (
            <li key={f.id}>
              <button type="button" onClick={() => onPick(f)} className="hc-link">{f.question}</button>
            </li>
          ))}
        </ul>
      </div>
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
    <section className="hc-card overflow-hidden">
      {items.map((it) => (
        <button type="button" key={it.title} onClick={() => it.on()}
          className="hc-row hc-rule flex w-full items-center gap-3.5 border-b-[0.5px] px-5 py-3.5 text-left last:border-b-0">
          <IconBox name={it.icon} />
          <span className="min-w-0 flex-1">
            <span className="hc-text block text-[16px] font-medium leading-6 tracking-[-0.01em]">{it.title}</span>
            <span className="hc-muted block truncate text-[13px]">{it.sub}</span>
          </span>
          {it.tag && (
            <span className="hc-badge hc-mono rounded-full px-2.5 py-0.5 text-[11px] uppercase tracking-[0.07em]">{it.tag}</span>
          )}
          <Icon name="chevR" size={15} className="hc-muted shrink-0" />
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
      <p className="hc-muted text-[14px] leading-6">{text}</p>
    </div>
  );
  return (
    <section>
      <SectionTitle title="Giao dịch gần đây" hint="Chọn một đơn để báo vấn đề" action={signedIn ? "Xem tất cả" : null} onAction={onAll} />
      <div className="hc-card overflow-hidden">
        {loading ? (
          [0, 1].map((i) => (
            <div key={i} className="flex animate-pulse items-center gap-3.5 px-5 py-3.5">
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
              <button type="button" key={o.id} onClick={() => onAsk({ category: "order", orderId: o.id })}
                className="hc-row hc-rule flex w-full items-center gap-3.5 border-b-[0.5px] px-5 py-3.5 text-left last:border-b-0">
                <IconBox name="box" />
                <span className="min-w-0 flex-1">
                  <span className="hc-text block truncate text-[15px] font-medium tracking-[-0.01em]">{o.package_name}</span>
                  <span className="hc-muted block truncate text-[13px]">{o.order_code || "—"} · {fmtDate(o.created_at)}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <span className="hc-text text-[15px] font-medium">{fmtCoins(o.coins_charged)}</span>
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

/* ============ THẺ CHỦ ĐỀ (lưới 3 cột, mỗi thẻ một màu, kiểu Loom) ============ */
export function CategoryCards({ faqs, active, onPick }) {
  const counts = useMemo(() => {
    const m = Object.create(null);
    for (const c of CATEGORIES) m[c.key] = 0;
    for (const f of faqs) m[f.category] = (m[f.category] || 0) + 1;
    return m;
  }, [faqs]);

  return (
    <section>
      <div className="grid grid-cols-3 gap-3">
        {CATEGORIES.map((c, i) => {
          const on = active === c.key;
          return (
            <button
              type="button"
              key={c.key}
              aria-pressed={on}
              onClick={() => onPick(on ? null : c.key)}
              className={`hc-tile hc-tile-${i % 6}`}
            >
              <Icon name={c.icon} size={34} stroke={1.5} />
              <span className="text-[13px] font-medium leading-tight">{c.label}</span>
              <span className="hc-tile-sub text-[11px]">{counts[c.key] || 0} câu hỏi</span>
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

  // Nếu fold() làm lệch length (ví dụ Unicode normalize) thì bỏ highlight để tránh cắt sai vị trí.
  if (ft.length !== text.length) return text;

  const parts = [];
  let i = 0;
  let k = 0;
  for (;;) {
    const j = ft.indexOf(fq, i);
    if (j < 0) {
      parts.push(text.slice(i));
      break;
    }
    if (j > i) parts.push(text.slice(i, j));
    parts.push(
      <mark
        key={`${j}-${k++}`}
        className="rounded-sm px-0.5"
        style={{ background: "var(--h-accent-soft2)", color: "inherit" }}
      >
        {text.slice(j, j + fq.length)}
      </mark>
    );
    i = j + fq.length;
  }
  return <>{parts}</>;
}

function FaqItem({ faq, open, onToggle, query, onAsk }) {
  const [vote, setVote] = useState(null);
  const vbtn = "hc-chip rounded-full px-4 py-1.5 text-[14px] font-medium transition active:scale-95";
  return (
    <div className="hc-rule border-b-[0.5px] last:border-b-0">
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-start gap-4 px-5 py-4 text-left">
        <span className="hc-text flex-1 text-[16px] font-medium leading-6"><Hl text={faq.question} q={query} /></span>
        <Icon name="chevD" size={18} className={`hc-accent mt-1 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5">
            <p className="hc-text2 whitespace-pre-line text-[15px] font-light leading-7">{faq.answer}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {vote === "yes" ? (
                <span className="hc-text text-[14px] font-medium">Cảm ơn bạn đã phản hồi.</span>
              ) : (
                <>
                  <span className="hc-muted mr-1 text-[14px]">Câu trả lời này có hữu ích không?</span>
                  <button type="button" onClick={() => setVote("yes")} className={vbtn}>Có</button>
                  <button type="button" onClick={() => setVote("no")} className={vbtn}>Không</button>
                </>
              )}
            </div>
            {vote === "no" && (
              <button
                type="button"
                onClick={() => onAsk({ category: faq.category, about: faq.question })}
                className="hc-accent mt-4 text-[15px] font-medium"
              >
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
      <div className="hc-card overflow-hidden">
        {loading ? (
          <div className="animate-pulse space-y-5 p-5">
            {[0, 1, 2].map((i) => <div key={i} className="hc-skel h-4 rounded" />)}
          </div>
        ) : shown.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="hc-text text-[17px] font-medium tracking-[-0.01em]">Không tìm thấy câu hỏi phù hợp</p>
            <p className="hc-muted mt-1 text-[14px]">Gửi yêu cầu để đội ngũ hỗ trợ giúp bạn.</p>
            <button
              type="button"
              onClick={() => onAsk({ category: cat || null, description: q })}
              className="hc-btn-solid mt-5 h-12 px-6 text-[15px]"
            >
              Gửi yêu cầu hỗ trợ
            </button>
          </div>
        ) : (
          shown.map((f) => (
            <FaqItem
              key={f.id}
              faq={f}
              open={openId === f.id}
              onToggle={() => setOpenId(openId === f.id ? null : f.id)}
              query={query}
              onAsk={onAsk}
            />
          ))
        )}
        {!filtering && !loading && faqs.length > 5 && openIdx < 5 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="hc-accent flex w-full items-center justify-center gap-1.5 py-3.5 text-[15px] font-medium"
          >
            {expanded ? "Thu gọn" : `Xem thêm ${faqs.length - 5} câu hỏi`}
            <Icon name="chevD" size={15} className={expanded ? "rotate-180" : ""} />
          </button>
        )}
      </div>
    </section>
  );
}

/* ============ CẦN THÊM TRỢ GIÚP (dải tối tràn bề ngang ở cuối trang, kiểu Loom) ============ */
export function ContactCard({ onRequest }) {
  return (
    <section className="hc-ctaband">
      {HELP_IMAGES.cta && (
        <img
          src={HELP_IMAGES.cta}
          alt=""
          loading="lazy"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
        />
      )}
      <div className="relative mx-auto max-w-md px-6 text-center md:max-w-4xl">
        <h3 className="text-[32px] font-bold leading-[1.1] tracking-[-0.03em]">Cần thêm trợ giúp?</h3>
        <p className="hc-cta-sub mx-auto mt-3 max-w-[340px] text-[16px] font-light leading-6">
          Kết nối với đội ngũ NXX315. Chúng tôi luôn sẵn sàng hỗ trợ bạn!
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => onRequest()} className="hc-btn-cta h-12 px-7 text-[15px]">
            Gửi yêu cầu
          </button>
          {ZALO_URL ? (
            <a href={ZALO_URL} target="_blank" rel="noopener noreferrer"
              className="hc-btn-ghost flex h-12 items-center px-7 text-[15px]">
              Nhắn Zalo
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
              }
