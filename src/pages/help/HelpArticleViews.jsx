// src/pages/help/HelpViews.jsx — danh sách bài, kết quả tìm kiếm, trang bài viết
import { Link } from "react-router-dom";
import { HELP_CATEGORIES, HELP_LINKS } from "../../lib/helpData";
import { HELP_ARTICLES, searchArticles } from "../../lib/helpArticles";
import { Chev } from "./HelpParts";

const catName = (id) => HELP_CATEGORIES.find((c) => c.id === id)?.title || "";

function Rows({ items, onOpen }) {
  if (!items.length) return <div className="gic-empty">Chưa có bài nào khớp. Thử từ khóa khác, hoặc gửi yêu cầu cho chúng mình.</div>;
  return (
    <div className="gic-rows">
      {items.map((a) => (
        <button key={a.id} type="button" className="gic-row" onClick={() => onOpen(a.id)}>
          <span>{a.title}<small>{catName(a.cat)}</small></span><Chev dk />
        </button>
      ))}
    </div>
  );
}

export function ListView({ cat, q, onOpen, onBack, onSearch }) {
  const searching = q.trim().length > 0;
  const info = HELP_CATEGORIES.find((c) => c.id === cat);
  const items = searching ? searchArticles(q) : cat === "all" || !info ? HELP_ARTICLES : HELP_ARTICLES.filter((a) => a.cat === cat);
  const title = searching ? "Kết quả tìm kiếm" : info ? info.title : "Tất cả câu hỏi";
  return (
    <section className="gic-sub"><div className="gic-wrap">
      <div className="gic-crumb"><button type="button" onClick={onBack}>Trợ giúp</button><span>/</span><span>{title}</span></div>
      <h1 className="gic-serif">{title}</h1>
      <p className="gic-p lead">{searching ? `Tìm cho “${q}”: ${items.length} bài.` : info ? info.blurb : "Toàn bộ bài viết, sắp theo chủ đề."}</p>
      <form className="gic-search dk" onSubmit={(e) => e.preventDefault()}>
        <input value={q} onChange={(e) => onSearch(e.target.value)} placeholder="Tìm câu trả lời" aria-label="Tìm câu trả lời" />
        <button type="submit" aria-label="Tìm"><Chev dk /></button>
      </form>
      <div className="gic-list"><Rows items={items} onOpen={onOpen} /></div>
    </div></section>
  );
}

export function ArticleView({ id, onOpen, onBack, onCat, onRequest }) {
  const a = HELP_ARTICLES.find((x) => x.id === id);
  if (!a) return <section className="gic-sub"><div className="gic-wrap"><p className="gic-p">Không tìm thấy bài này.</p>
    <button type="button" className="gic-link" onClick={onBack}><u>Về trung tâm trợ giúp</u></button></div></section>;
  const related = HELP_ARTICLES.filter((x) => x.cat === a.cat && x.id !== a.id).slice(0, 3);
  return (
    <section className="gic-sub">
      <div className="gic-wrap">
        <div className="gic-crumb"><button type="button" onClick={onBack}>Trợ giúp</button><span>/</span>
          <button type="button" onClick={() => onCat(a.cat)}>{catName(a.cat)}</button></div>
      </div>
      <div className="gic-letter">
        <h1 className="gic-serif">{a.title}</h1>
        {a.body.map((p, i) => <p key={i}>{p}</p>)}
        <div className="gic-fb">
          <span>Bài này giúp được bạn chứ?</span>
          <button type="button" onClick={onBack}>Có, cảm ơn</button>
          <button type="button" onClick={() => onRequest(a.title)}>Chưa, nhắn cho chúng mình</button>
        </div>
      </div>
      {related.length > 0 && (
        <div className="gic-related"><h3>Bài liên quan</h3>
          <div className="gic-list" style={{ marginTop: 8 }}><Rows items={related} onOpen={onOpen} /></div></div>
      )}
    </section>
  );
}
