// src/pages/HelpCenter.jsx — trang chính, ghép các phần (URL: /help, /help?c=tasks, /help?a=t1, /help?q=xu)
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { HELP_ARTICLES } from "../lib/helpArticles";
import { HelpNav, Closing, Landscape, Stripes, useHelpTheme } from "./help/HelpParts";
import { HelpHero, HelpVision, HelpChapter, HelpInvite, HelpTopics } from "./help/HelpHome";
import { ListView, ArticleView } from "./help/HelpViews";
import "./help/helpStyles.css";

export default function HelpCenter() {
  const theme = useHelpTheme();
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState(sp.get("q") || "");
  const [onArt, setOnArt] = useState(true);
  const a = sp.get("a"), c = sp.get("c"), query = sp.get("q") || "";
  const home = !a && !c && !query;

  const counts = HELP_ARTICLES.reduce((m, x) => ((m[x.cat] = (m[x.cat] || 0) + 1), m), {});
  const go = (params) => { setSp(params); window.scrollTo({ top: 0 }); };
  const toHome = () => { setQ(""); go({}); };
  const toTopics = () => {
    if (!home) { setQ(""); setSp({}); setTimeout(() => document.getElementById("gic-topics")?.scrollIntoView({ behavior: "smooth" }), 60); }
    else document.getElementById("gic-topics")?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!home) { setOnArt(false); return undefined; }
    const on = () => setOnArt(window.scrollY < window.innerHeight * 0.8);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [home]);

  return (
    <div className="gic" data-theme={theme}>
      <HelpNav on={onArt ? "art" : "canvas"} onHome={toHome} onTopics={toTopics} />
      <main className="gic-main">
        {home && (
          <>
            <HelpHero q={q} setQ={setQ} onSearch={(v) => v.trim() && go({ q: v.trim() })} />
            <Stripes />
            <HelpVision />
            <HelpChapter />
            <HelpInvite />
            <HelpTopics counts={counts} onOpen={(id) => go({ c: id })} />
          </>
        )}
        {!home && a && (
          <ArticleView id={a} onOpen={(id) => go({ a: id })} onBack={toHome} onCat={(id) => go({ c: id })} />
        )}
        {!home && !a && (
          <ListView cat={c} q={query} onOpen={(id) => go({ a: id })} onBack={toHome}
            onSearch={(v) => setSp(v.trim() ? { q: v } : c ? { c } : {}, { replace: true })} />
        )}
        <Closing />
      </main>
      <Landscape />
    </div>
  );
}
