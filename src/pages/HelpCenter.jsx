// src/pages/HelpCenter.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import BottomNav from "../components/BottomNav.jsx";
import { Hero, SearchBar, ChatCard } from "./help/HelpHero.jsx";
import { OrderStrip, CategoryGrid, FaqSection, FeedbackCard } from "./help/HelpSections.jsx";
import { TicketSheet, HistorySheet } from "./help/HelpSheets.jsx";
import { fold } from "./help/helpData.js";

export default function HelpCenter() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [sheet, setSheet] = useState(null); // {type:"ticket", preset} | {type:"history"}

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from("support_faqs")
        .select("id,category,question,answer,order")
        .eq("is_active", true)
        .order("order", { ascending: true });
      if (!alive) return;
      setFaqs(data || []);
      setFaqLoading(false);
    })();
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      const uid = s?.session?.user?.id;
      if (!alive) return;
      setSignedIn(!!uid);
      if (!uid) return setOrdersLoading(false);
      const { data } = await supabase
        .from("redemption_orders")
        .select("id,order_code,package_name,coins_charged,status,created_at")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(6);
      if (!alive) return;
      setOrders(data || []);
      setOrdersLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = fold(query.trim());
    return faqs.filter((f) => {
      if (q) return fold(f.question).includes(q) || fold(f.answer || "").includes(q);
      return cat ? f.category === cat : true;
    });
  }, [faqs, query, cat]);

  const pickCategory = (key) => {
    setQuery("");
    setCat(key);
    if (key) setTimeout(() => document.getElementById("help-faq")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const openTicket = (preset = {}) => setSheet({ type: "ticket", preset });

  return (
    <div className="relative min-h-screen bg-[#FBF8FB] pb-28 dark:bg-slate-950">
      <Hero scrolled={scrolled} onBack={() => navigate(-1)} onHome={() => navigate("/")} />

      <main className="relative mx-auto max-w-md space-y-6 px-4 pt-2 md:max-w-3xl">
        <SearchBar value={query} onChange={setQuery} onHistory={() => setSheet({ type: "history" })} />
        {!query.trim() && <ChatCard />}
        {!query.trim() && (
          <OrderStrip
            orders={orders}
            loading={ordersLoading}
            signedIn={signedIn}
            onAsk={openTicket}
            onAll={() => navigate("/history")}
          />
        )}
        {!query.trim() && <CategoryGrid active={cat} onPick={pickCategory} onTicket={openTicket} />}
        <FaqSection faqs={filtered} loading={faqLoading} cat={cat} setCat={setCat} query={query} onAsk={openTicket} />
        {!query.trim() && <FeedbackCard onOpen={openTicket} />}
      </main>

      {sheet?.type === "ticket" && (
        <TicketSheet
          preset={sheet.preset}
          onClose={() => setSheet(null)}
          onHistory={() => setSheet({ type: "history" })}
        />
      )}
      {sheet?.type === "history" && (
        <HistorySheet onClose={() => setSheet(null)} onNew={() => openTicket()} />
      )}

      <BottomNav />
    </div>
  );
}
