// src/pages/help/HelpFaq.jsx
import React, { useState } from "react";
import Icon from "./HelpIcons.jsx";
import { CATEGORIES, ZALO_URL, fold } from "./helpData.js";
import { surface, SectionTitle } from "./HelpSections.jsx";

function Hl({ text, q }) {
  const fq = fold((q || "").trim());
  if (!fq) return text;
  const ft = fold(text);
  const parts = [];
  let i = 0;
  for (;;) {
    const j = ft.indexOf(fq, i);
    if (j < 0) {
      parts.push(text.slice(i));
      break;
    }
    parts.push(text.slice(i, j));
    parts.push(
      <mark key={j} className="rounded bg-sky-100 px-0.5 text-inherit dark:bg-sky-500/30">
        {text.slice(j, j + fq.length)}
      </mark>
    );
    i = j + fq.length;
  }
  return <>{parts}</>;
}

function FaqItem({ faq, open, onToggle, query, onAsk }) {
  const [vote, setVote] = useState(null);
  const vbtn =
    "rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 active:bg-slate-100 dark:border-slate-700 dark:text-slate-300";
  return (
    <div className="border-b border-slate-100 last:border-0 dark:border-slate-800">
      <button onClick={onToggle} aria-expanded={open} className="flex w-full items-start gap-3 px-4 py-3.5 text-left">
        <span className="flex-1 text-[14px] font-medium leading-5 text-slate-900 dark:text-slate-100">
          <Hl text={faq.question} q={query} />
        </span>
        <Icon
          name="chevD"
          size={18}
          className={`mt-0.5 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180 text-sky-700" : ""}`}
        />
      </button>
      <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4">
            <p className="whitespace-pre-line border-l-2 border-sky-200 pl-3 text-[14px] leading-6 text-slate-600 dark:border-sky-500/40 dark:text-slate-300">
              {faq.answer}
            </p>
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
              <button
                onClick={() => onAsk({ category: faq.category, title: faq.question })}
                className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-sky-700 hover:underline dark:text-sky-300"
              >
                Gửi yêu cầu hỗ trợ <Icon name="chevR" size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FaqSection({ faqs, loading, cat, setCat, query, onAsk }) {
  const [openId, setOpenId] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const q = query.trim();
  const filtering = !!q || !!cat;
  const shown = filtering || expanded ? faqs : faqs.slice(0, 5);
  const catLabel = CATEGORIES.find((c) => c.key === cat)?.label;

  return (
    <section id="help-faq" className="scroll-mt-4">
      <SectionTitle
        title={q ? `Kết quả cho “${q}”` : catLabel || "Câu hỏi thường gặp"}
        hint={filtering && !loading ? `${faqs.length} câu hỏi` : null}
        action={cat && !q ? "Xoá bộ lọc" : null}
        onAction={() => setCat(null)}
      />
      <div className={`${surface} overflow-hidden`}>
        {loading ? (
          <div className="animate-pulse space-y-4 p-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-4 rounded bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-[15px] font-medium text-slate-900 dark:text-white">Không tìm thấy câu hỏi phù hợp</p>
            <p className="mt-1 text-sm text-slate-500">Hãy gửi yêu cầu để đội ngũ hỗ trợ giúp bạn.</p>
            <button
              onClick={() => onAsk({ category: cat || "other", title: q.slice(0, 80) })}
              className="mt-4 rounded-xl bg-sky-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-sky-800 active:bg-sky-900"
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
        {!filtering && !loading && faqs.length > 5 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-center gap-1.5 border-t border-slate-100 py-3 text-sm font-medium text-sky-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-sky-300"
          >
            {expanded ? "Thu gọn" : `Xem thêm ${faqs.length - 5} câu hỏi`}
            <Icon name="chevD" size={15} className={expanded ? "rotate-180" : ""} />
          </button>
        )}
      </div>
    </section>
  );
}

export function ContactCard({ onAsk }) {
  return (
    <section className="rounded-2xl border border-sky-100 bg-sky-50 p-5 dark:border-sky-500/20 dark:bg-sky-500/10">
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">Vẫn cần hỗ trợ?</h3>
      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
        Nếu chưa tìm được câu trả lời, hãy gửi yêu cầu hoặc nhắn trực tiếp cho NXX315.
      </p>
      <div className="mt-4 flex gap-3">
        <button
          onClick={() => onAsk({ category: "other" })}
          className="flex-1 rounded-xl bg-sky-700 py-2.5 text-sm font-medium text-white transition hover:bg-sky-800 active:bg-sky-900"
        >
          Gửi yêu cầu
        </button>
        <a
          href={ZALO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-xl border border-sky-200 bg-white py-2.5 text-center text-sm font-medium text-sky-700 transition hover:bg-sky-50 dark:border-sky-500/30 dark:bg-transparent dark:text-sky-300"
        >
          Nhắn Zalo
        </a>
      </div>
    </section>
  );
                  }
                
