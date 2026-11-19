// src/pages/Support/HomeGuides.jsx — chủ đề + câu hỏi thường gặp (dữ liệu từ Supabase) theo kiểu danh sách đánh số có dấu +
import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";
import { CATEGORIES } from "./constants.js";
import { PixelScene } from "../help/HelpPixel.jsx";

const FAQ_PER_SECTION = 4;
const HEADS = {
  order: ["Đơn hàng", "tra cứu và xử lý"],
  payment: ["Thanh toán", "và hoàn tiền"],
  account: ["Tài khoản", "của bạn"],
  bug: ["Báo lỗi", "cho NXX"],
  other: ["Câu hỏi", "khác"],
};

export default function HomeGuides({ onOpenHelp, onPickTopic }) {
  const [cards, setCards] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [c, f] = await Promise.all([
          supabase.from("support_sub_cards").select("*").eq("is_active", true).order("order", { ascending: true }),
          supabase.from("support_faqs").select("*").eq("is_active", true).order("order", { ascending: true }),
        ]);
        if (cancelled) return;
        setCards(c.data || []);
        setFaqs(f.data || []);
      } catch (err) {
        console.error("Load guides error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="nxh-sec" style={{ paddingTop: 56 }}>
        <div className="nxh-acc">{[0, 1, 2, 3].map((k) => <div key={k} className="nxh-sk" />)}</div>
      </div>
    );
  }

  let shown = 0;
  return (
    <>
      {CATEGORIES.map((cat) => {
        const catCards = cards.filter((c) => c.category === cat.id);
        const catFaqs = faqs.filter((f) => f.category === cat.id).slice(0, FAQ_PER_SECTION);
        if (catCards.length === 0 && catFaqs.length === 0) return null;
        shown += 1;
        const n = shown;
        const [main, rest] = HEADS[cat.id] || [cat.label, ""];
        return (
          <section key={cat.id} className="nxh-sec" style={{ paddingTop: 64 }}>
            <div className="nxh-eyebrow">{n}.0 — {cat.label}</div>
            <h2 className="nxh-h">{main} <span>{rest}</span></h2>

            {catFaqs.length > 0 && (
              <div className="nxh-acc">
                {catFaqs.map((faq, k) => {
                  const open = openId === faq.id;
                  return (
                    <div key={faq.id} className="nxh-row" data-open={open}>
                      <button type="button" aria-expanded={open} onClick={() => setOpenId(open ? null : faq.id)}>
                        <span className="nxh-num">{n}.{k + 1}</span>
                        <span className="nxh-q">{faq.question}</span>
                        <span className="nxh-plus" />
                      </button>
                      <div className="nxh-ans"><div><p>{faq.answer}</p></div></div>
                    </div>
                  );
                })}
              </div>
            )}

            {catCards.length > 0 && (
              <div className="nxh-cards">
                {catCards.map((card, k) => (
                  <button key={card.id} type="button" className="nxh-card" onClick={() => onPickTopic(card.title, cat.id)}>
                    <PixelScene className="nxh-art" kind="cover" seed={n * 10 + k + 3} />
                    <span>{card.title}<small>Hỏi NXX →</small></span>
                  </button>
                ))}
              </div>
            )}

            <button type="button" className="nxh-more" onClick={() => onOpenHelp(cat.id)}>
              Xem thêm mục {cat.label} <ArrowRight size={15} />
            </button>
          </section>
        );
      })}
    </>
  );
            }
