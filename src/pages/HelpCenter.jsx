// src/pages/HelpCenter.jsx — URL: /help, /help?c=tasks, /help?a=t1, /help?q=xu, /help?r=new, /help?r=history
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import { HELP_ARTICLES } from "../lib/helpArticles";
import { HelpNav, Closing, Landscape, Stripes, useHelpTheme } from "./help/HelpParts";
import { HelpHero, HelpVision, HelpChapter, HelpInvite, HelpTopics } from "./help/HelpHome";
import { ListView, ArticleView } from "./help/HelpArticleViews";
import { RequestScreen, HistoryFlow } from "./help/HelpRequest.jsx";
import "./help/helpTheme.css";
import "./help/helpWriter.css";
import "./help/helpStyles.css";
import "./help/helpOverlay.css";
import "../pages/help/helpOverlay.css";

export default function HelpCenter() {
  const theme = useHelpTheme();
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState(sp.get("q") || "");
  const [onArt, setOnArt] = useState(true);
  const [orders, setOrders] = useState([]);
  const a = sp.get("a"), c = sp.get("c"), query = sp.get("q") || "", r = sp.get("r"), about = sp.get("about") || "";
  const home = !a && !c && !query;

  const counts = HELP_ARTICLES.reduce((m, x) => ((m[x.cat] = (m[x.cat] || 0) + 1), m), {});
  const go = (params) => { setSp(params); window.scrollTo({ top: 0 }); };
  const toHome = () => { setQ(""); go({}); };
  const toTopics = () => {
    if (!home) { setQ(""); setSp({}); setTimeout(() => document.getElementById("gic-topics")?.scrollIntoView({ behavior: "smooth" }), 60); }
    else document.getElementById("gic-topics")?.scrollIntoView({ behavior: "smooth" });
  };

  // mở form gửi yêu cầu / lịch sử (giữ nguyên trang đang xem bên dưới)
  const withR = (val, extra = {}) => {
    const next = {};
    ["a", "c", "q"].forEach((k) => { if (sp.get(k)) next[k] = sp.get(k); });
    setSp({ ...next, r: val, ...extra });
  };
  const openRequest = (aboutText = "") => withR("new", aboutText ? { about: aboutText } : {});
  const closeRequest = () => {
    const next = {};
    ["a", "c", "q"].forEach((k) => { if (sp.get(k)) next[k] = sp.get(k); });
    setSp(next);
  };

  useEffect(() => {
    if (r !== "new") return;
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      const uid = s?.session?.user?.id;
      if (!uid) return;
      const { data } = await supabase.from("orders").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(3);
      setOrders(data || []);
    })();
  }, [r]);

  useEffect(() => {
    if (!home) { setOnArt(false); return undefined; }
    const on = () => setOnArt(window.scrollY < window.innerHeight * 0.8);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [home]);

  return (
    <div className="gic" data-theme={theme}>
      <HelpNav on={onArt ? "art" : "canvas"} onHome={toHome} onTopics={toTopics} onRequest={() => openRequest()} onHistory={() => withR("history")} />
      <main className="gic-main">
        {home && (
          <>
            <HelpHero q={q} setQ={setQ} onSearch={(v) => v.trim() && go({ q: v.trim() })} />
            <Stripes />
            <HelpVision />
            <HelpChapter />
            <HelpInvite onRequest={openRequest} />
            <HelpTopics counts={counts} onOpen={(id) => go({ c: id })} />
          </>
        )}
        {!home && a && (
          <ArticleView id={a} onOpen={(id) => go({ a: id })} onBack={toHome} onCat={(id) => go({ c: id })} onRequest={openRequest} />
        )}
        {!home && !a && (
          <ListView cat={c} q={query} onOpen={(id) => go({ a: id })} onBack={toHome}
            onSearch={(v) => setSp(v.trim() ? { q: v } : c ? { c } : {}, { replace: true })} />
        )}
        <Closing onRequest={openRequest} />
      </main>
      <Landscape />

      {r === "new" && (
        <RequestScreen preset={{ about }} orders={orders} onClose={closeRequest}
          onHistory={() => withR("history")} onChat={() => nav("/support")} />
      )}
      {r === "history" && <HistoryFlow onClose={closeRequest} onNew={() => openRequest()} />}
    </div>
  );
        }
    

