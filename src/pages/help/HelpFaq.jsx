// src/pages/help/HelpFaq.jsx — danh sách câu hỏi (mở/đóng, tìm kiếm) + thẻ "Vẫn cần hỗ trợ"
import React, { useState } from "react";
import { Icon, SectionTitle, surface, hairline } from "./HelpUI.jsx";
import { CATEGORIES, ZALO_URL, fold } from "./helpData.js";

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

/* ============ VẪN CẦN HỖ TRỢ (thẻ xanh duy nhất ở cuối trang) ============ */
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
