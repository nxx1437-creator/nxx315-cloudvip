// src/pages/Support/HelpView.jsx

import React, { useEffect, useState } from "react";
import {
  ArrowLeft, Loader2, ChevronRight, HelpCircle, KeyRound,
  ShieldCheck, Mail, CreditCard, RotateCcw, Receipt, Search,
  XCircle, Truck, Globe, Smartphone, ImagePlus, Handshake,
  AlertTriangle, User, Package, Bug,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";
import { CATEGORIES } from "./constants.js";

const ICON_MAP = {
  HelpCircle, KeyRound, ShieldCheck, Mail, CreditCard, RotateCcw,
  Receipt, Search, XCircle, Truck, Globe, Smartphone, ImagePlus,
  Handshake, AlertTriangle, User, Package, Bug,
};

export default function HelpView({ category, onBack, onStartChat }) {
  const [subCards, setSubCards] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  const cat = CATEGORIES.find((c) => c.id === category);

  useEffect(() => {
    loadData();
  }, [category]);

  const loadData = async () => {
    if (!category) return;
    setLoading(true);
    try {
      const [cardsRes, faqsRes] = await Promise.all([
        supabase
          .from("support_sub_cards")
          .select("*")
          .eq("category", category)
          .eq("is_active", true)
          .order("order", { ascending: true }),
        supabase
          .from("support_faqs")
          .select("*")
          .eq("category", category)
          .eq("is_active", true)
          .order("order", { ascending: true }),
      ]);
      setSubCards(cardsRes.data || []);
      setFaqs(faqsRes.data || []);
    } catch (err) {
      console.error("Load help error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (id) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <div className="min-h-[calc(100vh-72px)] bg-white pb-28">
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-black/[0.06] bg-white/95 px-4 py-3 backdrop-blur-xl">
        <button
          onClick={onBack}
          className="flex h-8 w-8 shrink-0 items-center justify-center text-[#161823]"
        >
          <ArrowLeft size={22} strokeWidth={2.2} />
        </button>
        <h1 className="flex-1 text-[15px] font-bold tracking-[-0.01em] text-[#161823]">
          {cat?.label || "Hỗ trợ"}
        </h1>
      </div>

      <div className="px-5 pb-4 pt-6">
        <h2 className="text-[26px] font-extrabold leading-[1.2] tracking-[-0.03em] text-[#161823]">
          Chúng tôi có thể giúp gì?
        </h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={22} className="animate-spin text-slate-300" />
        </div>
      ) : (
        <>
          {subCards.length > 0 && (
            <div className="mb-6">
              <div
                className="scrollbar-hide flex gap-3 overflow-x-auto px-5 pb-2"
                style={{ scrollbarWidth: "none" }}
              >
                {subCards.map((card) => {
                  const Icon = ICON_MAP[card.icon] || HelpCircle;
                  return (
                    <button
                      key={card.id}
                      onClick={onStartChat}
                      className="flex w-[140px] shrink-0 flex-col items-start gap-3 rounded-[18px] bg-[#f5f5f5] p-4 text-left transition active:scale-[0.97]"
                    >
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-[10px]"
                        style={{ backgroundColor: `${card.color}22` }}
                      >
                        <Icon
                          size={20}
                          style={{ color: card.color }}
                          strokeWidth={2.2}
                        />
                      </div>
                      <span className="text-[13.5px] font-semibold leading-tight text-[#161823]">
                        {card.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {faqs.length > 0 ? (
            <div className="px-5">
              <h3 className="mb-1 text-[20px] font-extrabold tracking-[-0.02em] text-[#161823]">
                Câu hỏi thường gặp
              </h3>
              <div>
                {faqs.map((faq) => {
                  const isOpen = openId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="border-b border-black/[0.06] last:border-b-0"
                    >
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="flex w-full items-center gap-3 py-4 text-left transition active:opacity-60"
                      >
                        <span className="flex-1 text-[15px] font-medium leading-6 text-[#161823]">
                          {faq.question}
                        </span>
                        <ChevronRight
                          size={18}
                          className={`shrink-0 text-[#8a8d93] transition-transform duration-200 ${
                            isOpen ? "rotate-90" : ""
                          }`}
                          strokeWidth={2.2}
                        />
                      </button>
                      {isOpen && (
                        <div className="pb-4">
                          <p className="whitespace-pre-wrap text-[14px] leading-6 text-[#4a4d54]">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <HelpCircle
                size={36}
                className="mx-auto mb-3 text-slate-300"
                strokeWidth={1.8}
              />
              <p className="text-[14px] font-semibold text-[#161823]">
                Chưa có hướng dẫn cho mục này
              </p>
              <p className="mt-1 text-[12.5px] text-[#8a8d93]">
                Bạn có thể chat với AI để được hỗ trợ trực tiếp.
              </p>
            </div>
          )}
        </>
      )}

      <div className="fixed bottom-4 left-1/2 z-30 w-full max-w-2xl -translate-x-1/2 px-4">
        <button
          onClick={onStartChat}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#FE2C55] px-5 py-3.5 text-[15px] font-bold text-white shadow-[0_8px_24px_rgba(254,44,85,0.35)] transition active:scale-[0.98]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Trò chuyện với NXX
        </button>
      </div>
    </div>
  );
}
