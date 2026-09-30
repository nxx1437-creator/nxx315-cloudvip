// src/pages/HelpCenter.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";
import TopHeader from "../components/TopHeader.jsx";
import { Hero, SearchBar } from "./help/HelpHero.jsx";
import { QuickActions, OrderList, CategoryGrid } from "./help/HelpSections.jsx";
import { FaqSection, ContactCard } from "./help/HelpFaq.jsx";
import { TicketSheet, HistorySheet } from "./help/HelpSheets.jsx";
import { fold } from "./help/helpData.js";

export default function HelpCenter() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [sheet, setSheet] = useState(null); // {type:"ticket", preset} | {type:"history"}

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
    if (key) {
      setTimeout(() => document.getElementById("help-faq")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  };

  const openTicket = (preset = {}) => setSheet({ type: "ticket", preset });
  const searching = !!query.trim();

  return (
    <div className="min-h-screen bg-slate-50 pb-28 dark:bg-slate-950">
      <TopHeader />
      <Hero onBack={() => navigate(-1)} onHome={() => navigate("/")} />

      <main className="relative z-10 mx-auto -mt-7 max-w-md space-y-7 px-4 md:max-w-3xl">
        <SearchBar value={query} onChange={setQuery} />
        {!searching && (
          <QuickActions
            onChat={() => navigate("/support")}
            onTicket={() => openTicket()}
            onHistory={() => setSheet({ type: "history" })}
          />
        )}
        {!searching && (
          <OrderList
            orders={orders}
            loading={ordersLoading}
            signedIn={signedIn}
            onAsk={openTicket}
            onAll={() => navigate("/history")}
          />
        )}
        {!searching && <CategoryGrid active={cat} onPick={pickCategory} />}
        <FaqSection faqs={filtered} loading={faqLoading} cat={cat} setCat={setCat} query={query} onAsk={openTicket} />
        {!searching && <ContactCard onAsk={openTicket} />}
      </main>

      {sheet?.type === "ticket" && (
        <TicketSheet preset={sheet.preset} onClose={() => setSheet(null)} onHistory={() => setSheet({ type: "history" })} />
      )}
      {sheet?.type === "history" && <HistorySheet onClose={() => setSheet(null)} onNew={() => openTicket()} />}

      <BottomNav />
    </div>
  );
}