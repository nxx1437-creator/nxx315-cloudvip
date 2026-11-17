// src/pages/help/HelpLanding.jsx — trung tâm trợ giúp kiểu "thế giới pixel": phong cảnh, khung kính, khung đôi, đường chân trời
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES, ZALO_URL, fold } from "./helpData.js";
import { Icon, IconBox, HELP_IMAGES } from "./HelpUI.jsx";
import { PixelArt, PixelFlower, Chev, Stripes, Mark } from "./HelpArt.jsx";

const SUPPORT_EMAIL = "support@nxx315.com";

/* ============ THANH ĐIỀU HƯỚNG NỔI (vừa khít nội dung) ============ */
export function FloatingNav({ onBack, onRequest }) {
  const [light, setLight] = useState(false);
  useEffect(() => {
    const check = () => {
      const h = document.getElementById("hw-hero");
      setLight(h ? h.getBoundingClientRect().bottom < 72 : window.scrollY > 480);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);
  return (
    <nav className={`hw-nav ${light ? "is-light" : ""}`} aria-label="Điều hướng trợ giúp">
      <button type="button" onClick={onBack} aria-label="Quay lại" className="hw-nav-back">
        <Icon name="back" size={17} />
      </button>
      <span className="hw-nav-mark" aria-hidden="true"><Mark size={20} /></span>
      <Link to="/guide" className="hw-nav-link">Hướng dẫn</Link>
      <Link to="/contact" className="hw-nav-link">Liên hệ</Link>
      <button type="button" onClick={() => onRequest()} className="hw-btn">
        <span>Gửi yêu cầu</span>
        <Chev />
      </button>
    </nav>
  );
}

/* ============ MÀN ĐẦU: phong cảnh + ô kính ở góc dưới trái ============ */
export function Hero({ query, onQuery, name, canSearch = true, compact = false, onChat }) {
  const go = (e) => {
    e?.preventDefault();
    if (!canSearch) return;
    document.getElementById("help-faq")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <header id="hw-hero" className={`hw-hero ${compact ? "is-compact" : ""}`}>
      <PixelArt kind="autumn" seed={11} src={HELP_IMAGES.hero} position="50% 62%" alt="Công viên mùa thu" />
      <div className="hw-hero-veil" />
      <p className="hw-identity">Trung tâm trợ giúp<br />NXX315 Studio Rewards</p>

      <div className="hw-glass">
        <h1 className="hw-promise">Giải đáp mọi thắc mắc, từ xu đến đơn thưởng</h1>
        <p className="hw-support">
          {name ? `Chào ${name}. ` : ""}Tìm câu trả lời trong vài giây, hoặc nhờ trợ lý AI và đội ngũ NXX315 giúp bạn.
        </p>
        <form className="hw-field" onSubmit={go} role="search">
          <Icon name="search" size={16} className="shrink-0 opacity-60" />
          <input type="text" value={query} onChange={(e) => onQuery(e.target.value)}
            placeholder="Tìm câu hỏi thường gặp" aria-label="Tìm câu hỏi thường gặp" />
          {query && (
            <button type="button" onClick={() => onQuery("")} aria-label="Xoá" className="hw-field-x">
              <Icon name="x" size={14} />
            </button>
          )}
          <button type="submit" disabled={!canSearch} className="hw-btn">
            <span>Tìm</span>
            <Chev />
          </button>
        </form>
        <button type="button" onClick={onChat} className="hw-textaction">
          <span>Chat với trợ lý AI</span>
          <Chev />
        </button>
      </div>
      <Stripes kind="dusk" />
    </header>
  );
}

/* ============ MẪU VẬT PIXEL + LỜI TẦM NHÌN ============ */
export function Vision() {
  return (
    <section className="hw-section">
      <div className="hw-pair">
        <PixelFlower src={HELP_IMAGES.flower} />
        <div>
          <p className="hw-body hw-narrow">Chúng tôi xây NXX315 để việc nhận thưởng đơn giản như chơi một ván game.</p>
          <p className="hw-body hw-narrow">Khi có điều gì chưa rõ, bạn không phải đoán. Câu trả lời nằm ngay đây, hoặc chỉ cách một tin nhắn.</p>
          <h2 className="hw-h2">Có thắc mắc thì cứ hỏi, bạn không phải loay hoay một mình.</h2>
        </div>
      </div>
    </section>
  );
}

/* ============ BA "CỬA SỔ" LIÊN HỆ ============ */
export function ContactWindows({ onRequest, onHistory }) {
  const items = [
    { key: "req", title: "Gửi yêu cầu hỗ trợ", src: "Báo lỗi, hỏi đơn hàng hoặc góp ý", img: HELP_IMAGES.cardRequest, seed: 3, on: () => onRequest() },
    { key: "his", title: "Lịch sử yêu cầu", src: "Theo dõi trạng thái và phản hồi", img: HELP_IMAGES.cardHistory, seed: 5, on: () => onHistory() },
    ZALO_URL ? { key: "zalo", title: "Nhắn Zalo", src: "Trò chuyện trực tiếp với đội ngũ", img: HELP_IMAGES.cardZalo, seed: 9, href: ZALO_URL } : null,
  ].filter(Boolean);
  return (
    <section className="hw-section hw-section-tight">
      <div className="hw-wide">
        <div className="hw-sechead hw-sechead-lg">
          <h2 className="hw-h2">Chọn cách liên hệ bạn thích</h2>
        </div>
        <div className="hw-windows">
          {items.map((it) => {
            const inner = (
              <>
                <PixelArt kind="cover" seed={it.seed} src={it.img} />
                <span className="hw-cap">
                  <span className="hw-cap-title">{it.title}</span>
                  <span className="hw-cap-src">{it.src}</span>
                </span>
              </>
            );
            return it.href ? (
              <a key={it.key} href={it.href} target="_blank" rel="noopener noreferrer" className="hw-win">{inner}</a>
            ) : (
              <button key={it.key} type="button" onClick={it.on} className="hw-win">{inner}</button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============ CHỦ ĐỀ: khung đôi, mỗi chủ đề là một dòng ============ */
export function TopicFrame({ faqs, active, onPick, children }) {
  const counts = useMemo(() => {
    const m = Object.create(null);
    for (const c of CATEGORIES) m[c.key] = 0;
    for (const f of faqs) m[f.category] = (m[f.category] || 0) + 1;
    return m;
  }, [faqs]);
  return (
    <section className="hw-section">
      <div className="hw-split">
        <div className="hw-split-copy">
          <p className="hw-caption hw-figure">Chủ đề</p>
          <h2 className="hw-h2">Chọn chủ đề bạn đang quan tâm.</h2>
          <p className="hw-body hw-narrow mt-6">Mỗi chủ đề gom những câu hỏi thường gặp nhất, để bạn đi thẳng đến câu trả lời.</p>
        </div>
        <div className="hw-split-body">
          <div className="hw-tray">
            <div className="hw-sheet">
              {CATEGORIES.map((c) => {
                const on = active === c.key;
                return (
                  <button type="button" key={c.key} aria-pressed={on} onClick={() => onPick(on ? null : c.key)} className="hw-row">
                    <IconBox name={c.icon} />
                    <span className="min-w-0 flex-1">
                      <span className="hw-rowtitle block">{c.label}</span>
                      <span className="hw-caption block">{c.desc}</span>
                    </span>
                    <span className="hw-count">{counts[c.key] || 0}</span>
                    <Chev dark />
                  </button>
                );
              })}
            </div>
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}
export const CategoryCards = TopicFrame;

/* ============ KHUNG XANH LỚN: hỏi trợ lý AI ============ */
export function InviteBanner({ onChat }) {
  return (
    <section className="hw-invite">
      <PixelArt kind="sunflowers" seed={4} src={HELP_IMAGES.invite} position="100% 100%" />
      <div className="hw-invite-copy">
        <h2 className="hw-display">Hỏi trợ lý AI, nhận câu trả lời ngay</h2>
        <p className="hw-support">Trợ lý trả lời về đơn hàng, xu và tài khoản bất cứ lúc nào, kể cả ban đêm.</p>
        <button type="button" onClick={onChat} className="hw-btn hw-btn-glass">
          <span>Chat với trợ lý AI</span>
          <Chev />
        </button>
        <p className="hw-aside"><Icon name="chat" size={18} /><span>Trực tuyến 24/7.<br />Cần người thật thì gửi yêu cầu.</span></p>
      </div>
      <div className="hw-notif" aria-hidden="true">
        <span className="hw-notif-icon"><Icon name="chat" size={16} /></span>
        <span>
          <b>Trợ lý AI NXX315</b>
          <em>Đơn của bạn đang được xử lý. Với Robux, thường trong 24 giờ làm việc.</em>
        </span>
      </div>
    </section>
  );
}

/* ============ FAQ phẳng, kẻ mảnh ============ */
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
    parts.push(<mark key={`${j}-${k++}`} className="hw-mark">{text.slice(j, j + fq.length)}</mark>);
    i = j + fq.length;
  }
  return <>{parts}</>;
}

function FaqItem({ faq, open, onToggle, query, onAsk }) {
  const [vote, setVote] = useState(null);
  return (
    <div className="hw-faq">
      <button type="button" onClick={onToggle} aria-expanded={open} className="hw-faq-q">
        <span className="flex-1"><Hl text={faq.question} q={query} /></span>
        <Chev dark className={`hw-faq-chev ${open ? "is-open" : ""}`} />
      </button>
      <div className={`hw-faq-a ${open ? "is-open" : ""}`}>
        <div className="overflow-hidden">
          <div className="hw-faq-body">
            <p className="hw-body hw-faq-text">{faq.answer}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {vote === "yes" ? (
                <span className="hw-body">Cảm ơn bạn đã phản hồi.</span>
              ) : (
                <>
                  <span className="hw-caption mr-1">Câu trả lời này có hữu ích không?</span>
                  <button type="button" onClick={() => setVote("yes")} className="hw-mini">Có</button>
                  <button type="button" onClick={() => setVote("no")} className="hw-mini">Không</button>
                </>
              )}
            </div>
            {vote === "no" && (
              <button type="button" onClick={() => onAsk({ category: faq.category, about: faq.question })} className="hw-textaction hw-textaction-ink mt-3">
                <span>Gửi yêu cầu hỗ trợ</span>
                <Chev dark />
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
  const showAll = filtering || expanded || openIdx >= 6;
  const shown = showAll ? faqs : faqs.slice(0, 6);
  const catLabel = CATEGORIES.find((c) => c.key === cat)?.label;

  return (
    <section id="help-faq" className="hw-section hw-faqsec">
      <div className="hw-faqwrap">
        <div className="hw-sechead hw-sechead-lg">
          <div>
            <h2 className="hw-h2">{q ? `Kết quả cho “${q}”` : catLabel || "Câu hỏi thường gặp"}</h2>
            {filtering && !loading && <p className="hw-caption mt-3">{faqs.length} câu hỏi</p>}
          </div>
        </div>

        {!q && (
          <div className="hw-tabs" role="tablist" aria-label="Lọc theo chủ đề">
            <button type="button" role="tab" aria-selected={!cat} onClick={() => setCat(null)} className="hw-tab">Tất cả</button>
            {CATEGORIES.map((c) => (
              <button type="button" role="tab" key={c.key} aria-selected={cat === c.key} onClick={() => setCat(cat === c.key ? null : c.key)} className="hw-tab">{c.label}</button>
            ))}
          </div>
        )}

        <div className="hw-faqlist">
          {loading ? (
            <div className="animate-pulse space-y-5 py-5">
              {[0, 1, 2].map((i) => <div key={i} className="hc-skel h-4 rounded" />)}
            </div>
          ) : shown.length === 0 ? (
            <div className="py-12 text-center">
              <p className="hw-card-heading">Không tìm thấy câu hỏi phù hợp</p>
              <p className="hw-body mt-2">Gửi yêu cầu để đội ngũ hỗ trợ giúp bạn.</p>
              <button type="button" onClick={() => onAsk({ category: cat || null, description: q })} className="hw-btn mt-6">
                <span>Gửi yêu cầu hỗ trợ</span>
                <Chev />
              </button>
            </div>
          ) : (
            shown.map((f) => (
              <FaqItem key={f.id} faq={f} open={openId === f.id}
                onToggle={() => setOpenId(openId === f.id ? null : f.id)} query={query} onAsk={onAsk} />
            ))
          )}
          {!filtering && !loading && faqs.length > 6 && openIdx < 6 && (
            <button type="button" onClick={() => setExpanded(!expanded)} className="hw-textaction hw-textaction-ink hw-more">
              <span>{expanded ? "Thu gọn" : `Xem thêm ${faqs.length - 6} câu hỏi`}</span>
              <Chev dark className={expanded ? "is-up" : "is-down"} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/* ============ KHÉP TRANG: lời mời nhẹ nhàng, hàng link nhỏ, sọc mint, đại lộ nắng ============ */
export function ContactCard({ onRequest }) {
  const links = [
    ["/guide", "Hướng dẫn"], ["/contact", "Liên hệ"], ["/terms", "Điều khoản"],
    ["/privacy", "Chính sách bảo mật"], ["/redemption-policy", "Quy định đổi thưởng"], ["/fraud", "Cảnh báo lừa đảo"],
  ];
  return (
    <>
      <section className="hw-closeband">
        <span className="hw-emblem" aria-hidden="true"><Mark size={26} /></span>
        <h2 className="hw-h2 hw-center">Nếu bạn cần người thật,<br />cứ nhắn cho chúng tôi</h2>
        <p className="hw-body hw-center-p">
          Đội ngũ NXX315 luôn sẵn lòng giúp.{" "}
          <button type="button" onClick={() => onRequest()} className="hw-inline-link">Gửi yêu cầu hỗ trợ</button>
          {ZALO_URL ? (<>{" "}hoặc{" "}<a href={ZALO_URL} target="_blank" rel="noopener noreferrer" className="hw-inline-link">nhắn Zalo</a></>) : null}.
        </p>
        <div className="hw-util">
          <ul className="hw-util-links">
            {links.map(([to, label]) => (
              <li key={to}><Link to={to} className="hw-util-link">{label}</Link></li>
            ))}
          </ul>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="hw-mailfield">
            <span>{SUPPORT_EMAIL}</span>
            <Chev dark />
          </a>
        </div>
      </section>
      <Stripes kind="closing" />
      <footer className="hw-horizon">
        <PixelArt kind="avenue" seed={6} src={HELP_IMAGES.closing} position="50% 50%" alt="Đại lộ ngập nắng" />
        <div className="hw-horizon-veil" />
        <div className="hw-credits">
          <span>© 2026 NXX315 Studio Rewards</span>
          <span>Không liên kết với Roblox hay Garena</span>
        </div>
      </footer>
    </>
  );
    }
