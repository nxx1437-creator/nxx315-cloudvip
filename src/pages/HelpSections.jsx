// src/pages/help/HelpSections.jsx
import React, { useState } from "react";
import Icon from "./HelpIcons.jsx";
import { CATEGORIES, ORDER_STATUS, ZALO_URL, fmtDate, fmtCoins, fold } from "./helpData.js";

const card = "rounded-3xl bg-white shadow-sm ring-1 ring-black/5 dark:bg-slate-900 dark:ring-white/5";

function SectionTitle({ title, action, onAction }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-[17px] font-extrabold text-slate-800 dark:text-white">{title}</h2>
      {action && (
        <button onClick={onAction} className="text-sm font-extrabold text-pink-600">
          {action}
        </button>
      )}
    </div>
  );
}

// ================= GIAO DỊCH =================
export function OrderStrip({ orders, loading, signedIn, onAsk, onAll }) {
  const scroller =
    "-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
  return (
    <section>
      <SectionTitle title="Thắc mắc về giao dịch?" action="Xem tất cả" onAction={onAll} />
      {loading ? (
        <div className={scroller}>
          {[0, 1].map((i) => (
            <div key={i} className={`${card} h-[132px] w-[78%] max-w-[300px] shrink-0 animate-pulse`} />
          ))}
        </div>
      ) : !signedIn ? (
        <div className={`${card} flex items-center gap-3 p-4`}>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-50 text-pink-500">
            <Icon name="lock" size={20} />
          </span>
          <p className="text-[13px] leading-5 text-slate-500">Đăng nhập để xem và hỏi về các đơn đổi thưởng của bạn.</p>
        </div>
      ) : orders.length === 0 ? (
        <div className={`${card} flex items-center gap-3 p-4`}>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-50 text-pink-500">
            <Icon name="box" size={20} />
          </span>
          <p className="text-[13px] leading-5 text-slate-500">Bạn chưa có đơn đổi thưởng nào. Khi có đơn, chúng sẽ hiện ở đây.</p>
        </div>
      ) : (
        <div className={scroller}>
          {orders.map((o) => {
            const st = ORDER_STATUS[o.status] || { label: o.status, cls: "bg-slate-100 text-slate-500" };
            return (
              <button
                key={o.id}
                onClick={() => onAsk({ category: "order", title: `Hỏi về đơn ${o.order_code || ""}`.trim() })}
                className={`${card} w-[78%] max-w-[300px] shrink-0 snap-start text-left transition active:scale-[0.98]`}
              >
                <div className="flex items-start gap-3 p-4 pb-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 text-white">
                    <Icon name="box" size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-extrabold text-slate-800 dark:text-white">{o.package_name}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">{fmtDate(o.created_at)}</p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-500">
                      Mã đơn: <span className="font-bold text-sky-600">{o.order_code || "—"}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-b-3xl border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-800/40">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${st.cls}`}>{st.label}</span>
                  <span className="text-[15px] font-black text-slate-800 dark:text-white">{fmtCoins(o.coins_charged)}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ================= CHỦ ĐỀ =================
export function CategoryGrid({ active, onPick, onTicket }) {
  return (
    <section>
      <SectionTitle title="Trợ giúp theo chủ đề" />
      <div className="grid grid-cols-3 gap-3">
        {CATEGORIES.map((c) => {
          const on = active === c.key;
          return (
            <button
              key={c.key}
              onClick={() => onPick(on ? null : c.key)}
              className={`${card} flex flex-col items-center gap-2 px-2 py-4 text-center transition active:scale-95 ${
                on ? "!bg-pink-50 ring-2 !ring-pink-400 dark:!bg-pink-500/10" : ""
              }`}
            >
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${c.grad} text-white shadow-md`}>
                <Icon name={c.icon} size={22} />
              </span>
              <span className="text-[12px] font-extrabold leading-tight text-slate-700 dark:text-slate-200">{c.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => onTicket()}
          className="flex flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-pink-300 bg-pink-50/50 px-2 py-4 text-center transition active:scale-95 dark:bg-pink-500/5"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-pink-500 shadow-sm">
            <Icon name="send" size={20} />
          </span>
          <span className="text-[12px] font-extrabold leading-tight text-pink-600">Gửi yêu cầu</span>
        </button>
      </div>
    </section>
  );
}

// ================= FAQ =================
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
      <mark key={j} className="rounded bg-pink-200/70 px-0.5 text-inherit dark:bg-pink-500/30">
        {text.slice(j, j + fq.length)}
      </mark>
    );
    i = j + fq.length;
  }
  return <>{parts}</>;
}

function FaqItem({ faq, open, onToggle, query, onAsk }) {
  const [vote, setVote] = useState(null);
  const vbtn = "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition active:scale-95";
  return (
    <div className="border-b border-slate-100 last:border-0 dark:border-slate-800">
      <button onClick={onToggle} aria-expanded={open} className="flex w-full items-start gap-3 px-4 py-4 text-left">
        <span className="flex-1 text-[14px] font-semibold leading-5 text-slate-800 dark:text-slate-100">
          <Hl text={faq.question} q={query} />
        </span>
        <Icon
          name="chevD"
          size={18}
          className={`mt-0.5 shrink-0 text-pink-500 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4">
            <p className="whitespace-pre-line rounded-2xl bg-pink-50/70 p-3.5 text-[13px] leading-6 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
              {faq.answer}
            </p>
            {vote === "yes" ? (
              <p className="mt-3 text-xs font-bold text-emerald-600">Cảm ơn bạn đã phản hồi! 💗</p>
            ) : (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400">Có hữu ích không?</span>
                <button onClick={() => setVote("yes")} className={`${vbtn} border-emerald-200 text-emerald-600`}>
                  <Icon name="thumb" size={13} /> Có
                </button>
                <button onClick={() => setVote("no")} className={`${vbtn} border-slate-200 text-slate-500`}>
                  <Icon name="thumb" size={13} className="rotate-180" /> Chưa
                </button>
              </div>
            )}
            {vote === "no" && (
              <button
                onClick={() => onAsk({ category: faq.category, title: faq.question })}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-fuchsia-500 py-2.5 text-xs font-extrabold text-white"
              >
                <Icon name="send" size={14} /> Chưa giải quyết được? Gửi yêu cầu
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
  const filtering = !!query.trim() || !!cat;
  const shown = filtering || expanded ? faqs : faqs.slice(0, 5);
  const chip = (on) =>
    `shrink-0 rounded-full px-3.5 py-1.5 text-xs font-extrabold transition ${
      on ? "bg-pink-500 text-white shadow" : "bg-white text-slate-600 ring-1 ring-black/5 dark:bg-slate-900 dark:text-slate-300"
    }`;

  return (
    <section id="help-faq" className="scroll-mt-20">
      <SectionTitle title={query.trim() ? "Kết quả tìm kiếm" : "Các vấn đề thường gặp"} />
      {!query.trim() && (
        <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button onClick={() => setCat(null)} className={chip(!cat)}>Tất cả</button>
          {CATEGORIES.map((c) => (
            <button key={c.key} onClick={() => setCat(cat === c.key ? null : c.key)} className={chip(cat === c.key)}>
              {c.label}
            </button>
          ))}
        </div>
      )}

      <div className={`${card} overflow-hidden`}>
        {loading ? (
          <div className="space-y-3 p-4">
            {[0, 1, 2].map((i) => <div key={i} className="h-5 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />)}
          </div>
        ) : shown.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Chưa tìm thấy câu hỏi phù hợp 🥲</p>
            <p className="mt-1 text-xs text-slate-400">Hãy gửi yêu cầu, admin sẽ hỗ trợ bạn sớm nhất.</p>
            <button
              onClick={() => onAsk({ category: cat || "other", title: query.trim().slice(0, 80) })}
              className="mt-4 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-5 py-2.5 text-xs font-extrabold text-white shadow"
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
      </div>

      {!filtering && !loading && faqs.length > 5 && (
        <div className="mt-3 flex justify-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 rounded-full border-2 border-pink-300 bg-white px-5 py-2 text-xs font-extrabold text-pink-600 transition active:scale-95 dark:bg-slate-900"
          >
            <Icon name="chevD" size={14} className={expanded ? "rotate-180" : ""} />
            {expanded ? "Thu gọn" : `Xem thêm (${faqs.length - 5})`}
          </button>
        </div>
      )}
    </section>
  );
}

// ================= GÓP Ý =================
export function FeedbackCard({ onOpen }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-4 dark:border-sky-500/20 dark:from-sky-500/10 dark:via-slate-900 dark:to-indigo-500/10">
      <div className="flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-sky-500 shadow-sm ring-1 ring-sky-100">
          <Icon name="sparkle" size={22} />
        </span>
        <div className="flex-1">
          <p className="text-[15px] font-extrabold text-slate-800 dark:text-white">NXX315 cần bạn góp ý</p>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-300">
            Mỗi đề xuất của bạn là động lực để NXX315 cải thiện từng chút một.
          </p>
          <div className="mt-2.5 flex items-center gap-4 text-xs font-extrabold">
            <button onClick={() => onOpen({ category: "other", title: "Góp ý cho NXX315" })} className="text-sky-600">
              Gửi góp ý →
            </button>
            <a href={ZALO_URL} target="_blank" rel="noopener noreferrer" className="text-slate-400">
              Nhắn Zalo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
