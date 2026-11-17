// src/pages/help/HelpLanding.jsx — Hero, sân khấu liên hệ, thẻ chủ đề, FAQ, dải cuối trang (kiểu WRITER)
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES, ZALO_URL, fold } from "./helpData.js";
import { useHelpTheme } from "./helpTheme.jsx";
import { Icon, SectionTitle, HELP_IMAGES } from "./HelpUI.jsx";

/* ============ HERO: thanh trên + lời hứa + ô tìm kiếm liền khối ============ */
export function Hero({ query, onQuery, name, onBack, topics = [], onTopic, canSearch = true }) {
  useHelpTheme();

  const handleSearch = () => {
    if (!canSearch) return;
    document.getElementById("help-faq")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="hc-hero relative overflow-hidden pb-12">
      {HELP_IMAGES.hero && (
        <img src={HELP_IMAGES.hero} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30" />
      )}
      {HELP_IMAGES.rocket && <img src={HELP_IMAGES.rocket} alt="" className="hc-rocket" />}

      <div className="relative z-10 mx-auto max-w-md px-4 md:max-w-4xl">
        <div className="hc-herobar flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <button type="button" onClick={onBack} aria-label="Quay lại" className="hc-roundbtn">
              <Icon name="back" size={18} />
            </button>
            <span className="hc-text truncate text-[16px] font-semibold tracking-[-0.01em]">NXX315</span>
          </div>
          <nav className="flex shrink-0 items-center gap-4 text-[14px] font-semibold">
            <Link to="/guide" className="hc-text2 transition active:opacity-70">Hướng dẫn</Link>
            <Link to="/contact" className="hc-navcta">Liên hệ</Link>
          </nav>
        </div>

        <div className="pt-10 text-center md:pt-20">
          <p className="hc-eyebrow">Trung tâm trợ giúp</p>
          <h1 className="hc-display mx-auto mt-4">
            {name ? `Chào ${name}, chúng tôi có thể giúp gì cho bạn?` : "Chúng tôi có thể giúp gì cho bạn?"}
          </h1>

          <div className="hc-search mx-auto mt-8 text-left">
            <Icon name="search" size={18} className="hc-muted shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Tìm câu hỏi thường gặp"
              aria-label="Tìm câu hỏi thường gặp"
            />
            {query && (
              <button type="button" onClick={() => onQuery("")} aria-label="Xoá"
                className="hc-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                <Icon name="x" size={16} />
              </button>
            )}
            <button type="button" onClick={handleSearch} disabled={!canSearch}
              className="hc-btn-solid shrink-0 text-[16px] disabled:opacity-50">
              Tìm
            </button>
          </div>

          {topics.length > 0 && onTopic && (
            <p className="hc-muted mt-5 text-[14px]">
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

/* ============ SÂN KHẤU HẠT MÀU: 3 cách liên hệ là thẻ trắng ============ */
export function QuickActions({ onChat, onRequest, onHistory }) {
  const items = [
    { icon: "chat", title: "Chat với trợ lý AI", sub: "Phản hồi ngay, hoạt động 24/7", on: onChat, tag: "Trực tuyến" },
    { icon: "send", title: "Gửi yêu cầu hỗ trợ", sub: "Báo lỗi, hỏi đơn hàng hoặc góp ý", on: onRequest },
    { icon: "history", title: "Lịch sử yêu cầu", sub: "Theo dõi trạng thái và phản hồi", on: onHistory },
  ];
  return (
    <section className="hc-stage">
      <div className="relative z-10 grid gap-3 md:grid-cols-3">
        {items.map((it) => (
          <button type="button" key={it.title} onClick={() => it.on()} className="hc-wcard">
            <span className="hc-wicon"><Icon name={it.icon} size={22} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[17px] font-medium leading-6 tracking-[-0.01em]">{it.title}</span>
              <span className="hc-wsub block text-[13px] leading-5">{it.sub}</span>
            </span>
            {it.tag && <span className="hc-wtag">{it.tag}</span>}
            <Icon name="chevR" size={16} className="hc-wsub hc-wchev shrink-0" />
          </button>
        ))}
      </div>
    </section>
  );
}

/* ============ CÂU HỎI NỔI BẬT (dải tràn bề ngang) ============ */
export function PopularFaqs({ faqs, onPick }) {
  const items = faqs.slice(0, 6);
  if (!items.length) return null;
  return (
    <section className="hc-band">
      <div className="mx-auto max-w-md px-4 md:max-w-4xl">
        <p className="hc-eyebrow text-center">Phổ biến</p>
        <h2 className="hc-text mt-2 text-center text-[30px] font-medium leading-[1.2] tracking-[-0.02em]">Câu hỏi nổi bật</h2>
        <ul className="mt-8 grid gap-x-10 md:grid-cols-3">
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

/* ============ THẺ CHỦ ĐỀ (đen: thẻ than, trắng: mảng màu phấn) ============ */
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
            <button type="button" key={c.key} aria-pressed={on}
              onClick={() => onPick(on ? null : c.key)} className={`hc-tile hc-tile-${i % 6}`}>
              <Icon name={c.icon} size={30} stroke={1.5} />
              <span className="text-[13px] font-medium leading-tight">{c.label}</span>
              <span className="hc-tile-sub text-[11px]">{counts[c.key] || 0} câu hỏi</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ============ FAQ phẳng, kẻ mảnh (không phải thanh bo tròn lớn) ============ */
function Hl({ text, q }) {
  const fq = fold((q || "").trim());
  if (!fq) return text;
  const ft = fold(text);
  if (ft.length !== text.length) return text;
  const parts = [];
  let i = 0;
  let k = 0;
  for (;;) {
    const j = ft.indexOf(fq, i);
    if (j < 0) { parts.push(text.slice(i)); break; }
    if (j > i) parts.push(text.slice(i, j));
    parts.push(
      <mark key={`${j}-${k++}`} className="rounded-sm px-0.5" style={{ background: "var(--h-accent-soft2)", color: "inherit" }}>
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
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-start gap-4 px-1 py-5 text-left">
        <span className="hc-text flex-1 text-[18px] font-medium leading-7 tracking-[-0.01em]"><Hl text={faq.question} q={query} /></span>
        <Icon name="chevD" size={18} className={`hc-accent mt-1.5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="px-1 pb-6">
            <p className="hc-text2 whitespace-pre-line text-[16px] leading-[1.6]">{faq.answer}</p>
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
              <button type="button" onClick={() => onAsk({ category: faq.category, about: faq.question })}
                className="hc-accent mt-4 text-[15px] font-medium">
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
      <div className="hc-flat">
        {loading ? (
          <div className="animate-pulse space-y-5 py-5">
            {[0, 1, 2].map((i) => <div key={i} className="hc-skel h-4 rounded" />)}
          </div>
        ) : shown.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="hc-text text-[18px] font-medium tracking-[-0.01em]">Không tìm thấy câu hỏi phù hợp</p>
            <p className="hc-muted mt-1 text-[14px]">Gửi yêu cầu để đội ngũ hỗ trợ giúp bạn.</p>
            <button type="button" onClick={() => onAsk({ category: cat || null, description: q })}
              className="hc-btn-solid mt-5 h-12 px-6 text-[15px]">
              Gửi yêu cầu hỗ trợ
            </button>
          </div>
        ) : (
          shown.map((f) => (
            <FaqItem key={f.id} faq={f} open={openId === f.id}
              onToggle={() => setOpenId(openId === f.id ? null : f.id)} query={query} onAsk={onAsk} />
          ))
        )}
        {!filtering && !loading && faqs.length > 5 && openIdx < 5 && (
          <button type="button" onClick={() => setExpanded(!expanded)}
            className="hc-accent flex w-full items-center justify-center gap-1.5 py-4 text-[15px] font-medium">
            {expanded ? "Thu gọn" : `Xem thêm ${faqs.length - 5} câu hỏi`}
            <Icon name="chevD" size={15} className={expanded ? "rotate-180" : ""} />
          </button>
        )}
      </div>
    </section>
  );
}

/* ============ DẢI CUỐI TRANG: lời hứa ngắn + cặp nút tương phản ============ */
export function ContactCard({ onRequest }) {
  return (
    <section className="hc-close">
      {HELP_IMAGES.cta && (
        <img src={HELP_IMAGES.cta} alt="" loading="lazy"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20" />
      )}
      <div className="relative mx-auto max-w-md px-6 text-center md:max-w-4xl">
        <h3 className="hc-closehead">Cần thêm trợ giúp?</h3>
        <p className="hc-closesub mx-auto mt-4 max-w-[420px]">
          Kết nối với đội ngũ NXX315. Chúng tôi luôn sẵn sàng hỗ trợ bạn.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => onRequest()} className="hc-act hc-act-1">Gửi yêu cầu</button>
          {ZALO_URL ? (
            <a href={ZALO_URL} target="_blank" rel="noopener noreferrer" className="hc-act hc-act-2">Nhắn Zalo</a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
