// src/pages/HelpCenter.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";
import { Hero, PopularFaqs, QuickActions, OrderList, CategoryCards } from "./help/HelpUI.jsx";
import { FaqSection, ContactCard } from "./help/HelpFaq.jsx";
import { RequestScreen, HistoryFlow } from "./help/HelpRequest.jsx";
import { fold } from "./help/helpData.js";

// Tên gọi: lấy từ tài khoản đăng nhập (tên Việt thì lấy chữ cuối). Không có thì chào chung.
const givenName = (u) => {
  const full = (u?.user_metadata?.full_name || u?.user_metadata?.name || "").trim();
  return full ? full.split(/\s+/).slice(-1)[0] : "";
};

export default function HelpCenter() {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [name, setName] = useState("");
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
      setName(givenName(user));
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

  // Mở thẳng đúng màn khi đi từ trang Hồ sơ: location.state.open = "idea" | "faq" | "history" | "chat"
  useEffect(() => {
    const open = location.state?.open;
    if (!open || open === "home") return;
    navigate(location.pathname, { replace: true, state: null }); // dùng xong thì xóa, tránh mở lại khi tải lại trang
    if (open === "chat") navigate("/support", { replace: true });
    else if (open === "idea") openRequest({ type: "idea" });
    else if (open === "history") setView({ type: "history" });
    else if (open === "faq") setTimeout(scrollToFaq, 250);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const searching = !!query.trim();
  const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate("/"));
  // Thẻ đầu tiên nổi lên che nửa dưới hero; khi đang tìm kiếm thì để cách ra để tiêu đề không bị đè lên nền xanh
  const overlap = !searching && faqs.length > 0 ? "-mt-14" : "mt-6";

  return (
    <div className="min-h-screen bg-white pb-28">
      <Hero query={query} onQuery={setQuery} name={name} onBack={goBack} />

      <main className={`relative mx-auto max-w-md space-y-8 px-4 md:max-w-4xl ${overlap}`}>
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
