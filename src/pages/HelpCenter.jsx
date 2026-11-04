// src/pages/HelpCenter.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";
import TopHeader from "../components/TopHeader.jsx";
import { Hero, PopularFaqs, QuickActions, OrderList, CategoryCards, FaqSection, ContactCard } from "./help/HelpUI.jsx";
import { RequestScreen, HistoryFlow } from "./help/HelpRequest.jsx";
import { fold } from "./help/helpData.js";

export default function HelpCenter() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [view, setView] = useState(null); // {type:"request", preset} | {type:"history"}

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
      const user = s?.session?.user;
      if (!alive) return;
      setSignedIn(!!user);
      if (!user) return setOrdersLoading(false);
      const { data } = await supabase
        .from("redemption_orders")
        .select("id,order_code,package_name,coins_charged,status,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(6);
      if (!alive) return;
      setOrders(data || []);
      setOrdersLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = fold(query.trim());
    return faqs.filter((f) => {
      if (q) return fold(f.question).includes(q) || fold(f.answer || "").includes(q);
      return cat ? f.category === cat : true;
    });
  }, [faqs, query, cat]);

  const scrollToFaq = () =>
    setTimeout(() => document.getElementById("help-faq")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);

  const pickCategory = (key) => {
    setQuery("");
    setOpenId(null);
    setCat(key);
    if (key) scrollToFaq();
  };
  const pickFaq = (f) => {
    setQuery("");
    setCat(null);
    setOpenId(f.id);
    scrollToFaq();
  };

  const openRequest = (preset = {}) => setView({ type: "request", preset });
  const searching = !!query.trim();

  return (
    <div className="min-h-screen bg-slate-100 pb-28 dark:bg-slate-950">
      <TopHeader />
      <Hero query={query} onQuery={setQuery} />

      <main className="mx-auto max-w-md space-y-6 px-4 md:max-w-3xl">
        {!searching && <PopularFaqs faqs={faqs} onPick={pickFaq} />}
        {!searching && (
          <QuickActions onChat={() => navigate("/support")} onRequest={() => openRequest()} onHistory={() => setView({ type: "history" })} />
        )}
        {!searching && (
          <OrderList orders={orders} loading={ordersLoading} signedIn={signedIn} onAsk={openRequest} onAll={() => navigate("/history")} />
        )}
        {!searching && <CategoryCards faqs={faqs} active={cat} onPick={pickCategory} />}
        <FaqSection faqs={filtered} loading={faqLoading} cat={cat} setCat={setCat} query={query}
          openId={openId} setOpenId={setOpenId} onAsk={openRequest} />
        {!searching && <ContactCard onRequest={openRequest} />}
      </main>

      {view?.type === "request" && (
        <RequestScreen
          preset={view.preset}
          orders={orders}
          onClose={() => setView(null)}
          onHistory={() => setView({ type: "history" })}
          onChat={() => navigate("/support")}
        />
      )}
      {view?.type === "history" && <HistoryFlow onClose={() => setView(null)} onNew={() => openRequest()} />}

      <BottomNav />
    </div>
  );
      }


