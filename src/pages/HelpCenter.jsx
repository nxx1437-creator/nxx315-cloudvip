// src/pages/HelpCenter.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";
import { Hero, PopularFaqs, QuickActions, OrderList, CategoryCards } from "./help/HelpUI.jsx";
import { FaqSection, ContactCard } from "./help/HelpFaq.jsx";
import { RequestScreen, HistoryFlow } from "./help/HelpRequest.jsx";
import { CATEGORIES, fold } from "./help/helpData.js";

// Tên gọi: lấy từ tài khoản đăng nhập (tên Việt thì lấy chữ cuối). Không có thì chào chung.
const givenName = (u) => {
  const full = (u?.user_metadata?.full_name || u?.user_metadata?.name || "").trim();
  return full ? full.split(/\s+/).slice(-1)[0] : "";
};

export default function HelpCenter() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [name, setName] = useState("");
  const [preset, setPreset] = useState(() => (params.get("ty") ? { type: params.get("ty") } : {}));

  // Màn đang mở nằm trên đường dẫn: ?m=request | ?m=history  (tải lại trang vẫn ở đúng màn)
  const mode = params.get("m");
  const view = mode === "history" ? { type: "history" } : mode === "request" ? { type: "request", preset } : null;

  const setUrl = (updates) => {
    const next = new URLSearchParams(params);
    Object.entries(updates).forEach(([k, v]) => (v === null ? next.delete(k) : next.set(k, v)));
    setParams(next, { replace: true });
  };
  const closeView = () => setUrl({ m: null, ty: null, g: null, t: null });
  const openHistory = () => setUrl({ m: "history", ty: null, g: null, t: null });
  const openRequest = (p = {}) => {
    setPreset(p);
    setUrl({ m: "request", ty: p.type || null, g: null, t: null });
  };

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

  // Mở thẳng đúng màn khi đi từ trang Hồ sơ: location.state.open = "idea" | "faq" | "history" | "chat"
  useEffect(() => {
    const open = location.state?.open;
    if (!open || open === "home") return;
    const base = location.pathname;
    if (open === "chat") navigate("/support", { replace: true });
    else if (open === "idea") {
      setPreset({ type: "idea" });
      navigate(`${base}?m=request&ty=idea`, { replace: true, state: null });
    } else if (open === "history") navigate(`${base}?m=history`, { replace: true, state: null });
    else {
      navigate(base, { replace: true, state: null }); // dùng xong thì xóa, tránh mở lại khi tải lại trang
      if (open === "faq") setTimeout(scrollToFaq, 250);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const searching = !!query.trim();
  const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate("/"));

  return (
    <div className="min-h-screen bg-white">
      <Hero query={query} onQuery={setQuery} name={name} onBack={goBack}
        topics={CATEGORIES.slice(0, 3)} onTopic={pickCategory} />

      {!searching && (
        <main className="mx-auto max-w-md space-y-4 px-4 pt-2 md:max-w-4xl">
          <CategoryCards faqs={faqs} active={cat} onPick={pickCategory} />
          <QuickActions onChat={() => navigate("/support")} onRequest={() => openRequest()} onHistory={openHistory} />
        </main>
      )}

      {!searching && (
        <div className="mt-10">
          <PopularFaqs faqs={faqs} onPick={pickFaq} />
        </div>
      )}

      <div className={`mx-auto max-w-md space-y-8 px-4 md:max-w-4xl ${searching ? "pt-6" : "pt-10"}`}>
        {!searching && (
          <OrderList orders={orders} loading={ordersLoading} signedIn={signedIn} onAsk={openRequest} onAll={() => navigate("/history")} />
        )}
        <FaqSection faqs={filtered} loading={faqLoading} cat={cat} setCat={setCat} query={query}
          openId={openId} setOpenId={setOpenId} onAsk={openRequest} />
      </div>

      {!searching ? <ContactCard onRequest={openRequest} /> : <div className="h-32" />}

      {view?.type === "request" && (
        <RequestScreen
          preset={view.preset}
          orders={orders}
          onClose={closeView}
          onHistory={openHistory}
          onChat={() => navigate("/support")}
        />
      )}
      {view?.type === "history" && <HistoryFlow onClose={closeView} onNew={() => openRequest()} />}

      <BottomNav />
    </div>
  );
    }
