// src/pages/Support/HomeGuides.jsx
// Các mục hướng dẫn dưới khung nhập: mỗi chủ đề = tiêu đề + thẻ kéo ngang
// + vài câu hỏi thường gặp + nút "Xem thêm". Cuối trang là chân trang liên hệ.

import React, { useEffect, useState } from "react";
import {
  ChevronDown, ChevronRight, HelpCircle, KeyRound, ShieldCheck, Mail,
  CreditCard, RotateCcw, Receipt, Search, XCircle, Truck, Globe,
  Smartphone, ImagePlus, Handshake, AlertTriangle, User, Package, Bug,
  MoreHorizontal,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";
import { CATEGORIES } from "./constants.js";
import "./chat-effects.css";

const ICON_MAP = {
  HelpCircle, KeyRound, ShieldCheck, Mail, CreditCard, RotateCcw,
  Receipt, Search, XCircle, Truck, Globe, Smartphone, ImagePlus,
  Handshake, AlertTriangle, User, Package, Bug, MoreHorizontal,
};

const FAQ_PER_SECTION = 3;

export default function HomeGuides({ onOpenHelp, onPickTopic }) {
  const [cards, setCards] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [cardsRes, faqsRes] = await Promise.all([
          supabase
            .from("support_sub_cards")
            .select("*")
            .eq("is_active", true)
            .order("order", { ascending: true }),
          supabase
            .from("support_faqs")
            .select("*")
            .eq("is_active", true)
            .order("order", { ascending: true }),
        ]);
        if (cancelled) return;
        setCards(cardsRes.data || []);
        setFaqs(faqsRes.data || []);
      } catch (err) {
        console.error("Load guides error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleFaq = (id) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <div className="pt-2">
      {loading ? (
        <div className="space-y-10 px-5">
          {[0, 1].map((i) => (
            <div key={i}>
              <div className="nxx-skel h-7 w-40 rounded-lg" />
              <div className="mt-4 flex gap-3 overflow-hidden">
                <div className="nxx-skel h-[120px] w-[150px] shrink-0 rounded-[22px]" />
                <div className="nxx-skel h-[120px] w-[150px] shrink-0 rounded-[22px]" />
                <div className="nxx-skel h-[120px] w-[150px] shrink-0 rounded-[22px]" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        CATEGORIES.map((cat) => {
          const catCards = cards.filter((c) => c.category === cat.id);
          const catFaqs = faqs
            .filter((f) => f.category === cat.id)
            .slice(0, FAQ_PER_SECTION);
          if (catCards.length === 0 && catFaqs.length === 0) return null;

          const CatIcon = ICON_MAP[cat.icon] || HelpCircle;

          return (
            <section key={cat.id} className="mb-10">
              <div className="flex items-center gap-2.5 px-5">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-[10px]"
                  style={{ backgroundColor: `${cat.color}22` }}
                >
                  <CatIcon
                    size={18}
                    strokeWidth={2.2}
                    style={{ color: cat.color }}
                  />
                </span>
                <h3 className="text-[22px] font-semibold tracking-[-0.02em] text-[#13141a]">
                  {cat.label}
                </h3>
              </div>

              {catCards.length > 0 && (
                <div className="nxx-noscrollbar mt-4 flex gap-3 overflow-x-auto px-5 pb-1">
                  {catCards.map((card) => {
                    const Icon = ICON_MAP[card.icon] || HelpCircle;
                    const color = card.color || cat.color;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => onPickTopic(card.title, cat.id)}
                        className="flex min-h-[132px] w-[156px] shrink-0 flex-col items-start justify-between rounded-[22px] border border-[#e6e8f0] p-4 text-left transition active:scale-[0.97]"
                        style={{ backgroundColor: `${color}12` }}
                      >
                        <span
                          className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-white"
                          style={{ color }}
                        >
                          <Icon size={19} strokeWidth={2.2} />
                        </span>
                        <span className="nxx-serif text-[19px] leading-[1.15] text-[#13141a]">
                          {card.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {catFaqs.length > 0 && (
                <div className="mt-3 px-5">
                  {catFaqs.map((faq) => {
                    const isOpen = openId === faq.id;
                    return (
                      <div
                        key={faq.id}
                        className="border-b border-black/[0.06] last:border-b-0"
                      >
                        <button
                          type="button"
                          onClick={() => toggleFaq(faq.id)}
                          className="flex w-full items-center gap-3 py-3.5 text-left transition active:opacity-60"
                        >
                          <span className="flex-1 text-[15px] font-medium leading-6 text-[#13141a]">
                            {faq.question}
                          </span>
                          <ChevronDown
                            size={18}
                            className={`shrink-0 text-[#8a8d93] transition-transform duration-200 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                            strokeWidth={2.2}
                          />
                        </button>
                        {isOpen && (
                          <p className="nxx-fade whitespace-pre-wrap pb-4 text-[14px] leading-6 text-[#4a4d54]">
                            {faq.answer}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="px-5 pt-3">
                <button
                  type="button"
                  onClick={() => onOpenHelp(cat.id)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-full border border-[#e3e5ee] bg-[#f5f6fb] py-3 text-[14px] font-medium text-[#13141a] transition active:scale-[0.98]"
                >
                  Xem thêm mục
                  <span className="font-semibold" style={{ color: cat.color }}>
                    {cat.label}
                  </span>
                  <ChevronRight size={15} className="text-[#8a8d93]" />
                </button>
              </div>
            </section>
          );
        })
      )}

      <footer className="px-5 pb-12 pt-6 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#13141a] text-[16px] font-bold text-white">
          N
        </div>
        <p className="nxx-serif mt-4 text-[30px] leading-[1.12] tracking-[-0.01em] text-[#13141a]">
          Luôn có NXX
          <br />
          bên bạn.
        </p>
        <p className="mt-6 text-[13px] text-[#7b7e90]">
          Cần thêm trợ giúp? Liên hệ:
        </p>
        <a
          href="mailto:support@nxx315.com"
          className="mt-1 inline-block text-[13px] font-medium text-[#13141a] underline-offset-2 active:opacity-60"
        >
          support@nxx315.com
        </a>
      </footer>
    </div>
  );
  }
