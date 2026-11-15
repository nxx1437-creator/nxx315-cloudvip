// src/CloudVIPLanding.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react"; 
import { supabase } from "./lib/supabaseClient.js"; 
import { SITE } from "./lib/siteInfo.js";
import { useI18n } from "./i18n/index.js";
import { COPY, CREATOR_URL } from "./lib/landingData.js";
import { CSS } from "./components/LandingStyle.js";
import {
  FloatingNav, Reveal, Trail, Barcode, Flap, RankTicket, OrderCard,
  Skeletons, Wordmark, scrollToId,
} from "./components/LandingBits.jsx";

const HERO_VIDEO_URL = "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/video-hero.mp4"; 
const HERO_POSTER = "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/Banner-hero.gif";

export default function CloudVIPLanding() {
  const i18n = useI18n();
  const lang = i18n.lang === "en" ? "en" : "vi";
  const setLang = i18n.setLang || i18n.setLanguage || i18n.changeLanguage;
  const c = COPY[lang];
  const navigate = useNavigate();
  const [board, setBoard] = useState(undefined);
  const [orders, setOrders] = useState(undefined);

  useEffect(() => {
    let off = false;
    (async () => {
      try {
        const [lb, od] = await Promise.all([
          supabase.rpc("get_landing_leaderboard", { p_limit: 10 }),
          supabase.rpc("get_landing_recent_orders", { p_limit: 8 }),
        ]);
        if (off) return;
        setBoard(lb.error ? null : lb.data || []);
        setOrders(od.error ? null : od.data || []);
      } catch {
        if (!off) { setBoard(null); setOrders(null); }
      }
    })();
    return () => { off = true; };
  }, []);

  const top3 = Array.isArray(board) ? board.slice(0, 3) : [];
  const rest = Array.isArray(board) ? board.slice(3) : [];
  const state = (v) => (v === undefined ? "load" : v === null ? "err" : v.length ? "ok" : "empty");

  return (
    <div className="dp">
      <style>{CSS}</style>

      <FloatingNav items={c.nav} onItem={scrollToId} loginLabel={c.login} startLabel={c.start}
        langLabel={c.langBtn} onLang={typeof setLang === "function" ? () => setLang(lang === "vi" ? "en" : "vi") : undefined} />

      <main>
        {/* ===== HERO ===== */}
        <section className="dp-stage">
          
          {/* LỚP VIDEO NỀN TRÀN VIỀN */}
          <video 
            className="dp-hero-bg-video" 
            autoPlay 
            loop 
            muted 
            playsInline
            poster={HERO_POSTER}
          >
            <source src={HERO_VIDEO_URL} type="video/mp4" />
          </video>
          
          {/* LỚP PHỦ TỐI (Đã làm mỏng, chỉ tối bên trái) */}
          <div className="dp-hero-overlay"></div>

          {/* ĐÃ XÓA TOÀN BỘ MÂY VÀ HẠT SÁNG (dp-sky) Ở ĐÂY */}
          
          <Trail />
          
          <div className="dp-wrap dp-hero">
            {/* CỘT TRÁI: CHỮ */}
            <div className="dp-hero-text-container">
              <h1 className="dp-h1">
                <span>{c.h1a} <em className="dp-serif">{c.h1b}</em></span>
                <span>{c.h1c}</span>
                <span className="dp-serif dim">{c.h1d}</span>
              </h1>
              <p className="dp-hs">{c.heroSub}</p>
            </div>

            {/* CỘT PHẢI: VÉ THAM GIA */}
            <aside className="dp-ticket">
              <p className="meta dp-mono"><span>{c.ticketMeta}</span><span>No. 01</span></p>
              <h3>{c.ticketTitle}</h3>
              <p className="note">{c.ticketNote}</p>
              <Link to="/register" className="dp-pill"><span>{c.ctaAccount}</span><ArrowRight size={18} strokeWidth={1.5} /></Link>
              <a href={CREATOR_URL} className="dp-pill"><span>{c.ctaCreator}</span><ArrowUpRight size={18} strokeWidth={1.5} /></a>
              <Barcode />
            </aside>
          </div>
          
          <div className="dp-wrap dp-tele dp-mono"><span>+ NXX315 · STUDIO REWARDS</span><span>↓ {c.scroll}</span></div>
        </section>

        {/* ===== CÁC PHẦN CÒN LẠI GIỮ NGUYÊN ===== */}
        <section className="dp-sec">
          <div className="dp-wrap">
            <p className="dp-lbl">{c.flapLabel}</p>
            <div className="dp-board">
              {c.flap.map(([text, kind, target], i) => (
                <Flap key={text} text={text} kind={kind} target={target} onId={scrollToId} delay={i * 80} />
              ))}
            </div>
          </div>
        </section>

        <section id="video" className="dp-sec">
          <div className="dp-wrap">
            <Reveal className="dp-head">
              <p className="dp-lbl">{c.vLabel}</p>
              <h2 className="dp-h2">{c.vTitleA} <span className="dp-serif">{c.vTitleB}</span></h2>
              <p className="dp-body" style={{ marginTop: 20 }}>{c.vBody}</p>
            </Reveal>

            <Reveal>
              <div className="dp-scene">
                <div className="dp-console">
                  <div className="dp-cbar">
                    <i /><i /><i />
                    <span className="dp-url dp-mono">creator.nxx315.com</span>
                    <span className="dp-badge">{c.mockTag}</span>
                  </div>
                  <div className="dp-cbody">
                    {[["ok", 1], ["wait", 2], ["ok", 3]].map(([k, n]) => (
                      <div key={n} className="dp-crow">
                        <span className="dp-mono" style={{ opacity: 0.5 }}>0{n}</span>
                        <span className="dp-line" />
                        <span className={`dp-chip ${k}`}>{c.st[k]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <span className="dp-float f1 dp-badge">+ {c.mockGift}</span>
                <span className="dp-float f2 dp-badge">{c.mockScan}</span>
              </div>
            </Reveal>

            <div className="dp-trip">
              {c.vSteps.map(([t, d], i) => (
                <Reveal key={t} delay={i * 80}>
                  <p className="num dp-mono">0{i + 1}</p>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </Reveal>
              ))}
            </div>
            <div className="dp-cta-row">
              <a href={CREATOR_URL} className="dp-pill big"><span>{c.vCta}</span><ArrowUpRight size={20} strokeWidth={1.5} /></a>
            </div>
          </div>
        </section>

        <section id="invite" className="dp-sec">
          <div className="dp-wrap">
            <Reveal className="dp-head">
              <p className="dp-lbl">{c.iLabel}</p>
              <h2 className="dp-h2">{c.iTitleA} <span className="dp-serif">{c.iTitleB}</span></h2>
              <p className="dp-body" style={{ marginTop: 20 }}>{c.iBody}</p>
            </Reveal>
            <div className="dp-trip">
              {c.iCols.map(([big, d], i) => (
                <Reveal key={big} delay={i * 80}>
                  <h3 style={{ fontSize: "clamp(40px,7vw,64px)" }}>{big}</h3>
                  <p>{d}</p>
                </Reveal>
              ))}
            </div>
            <div className="dp-cta-row">
              <button type="button" className="dp-pill big" onClick={() => navigate("/register")}>
                <span>{c.iCta}</span><ArrowRight size={20} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </section>

        <section id="rank" className="dp-sec">
          <div className="dp-wrap">
            <Reveal className="dp-head">
              <p className="dp-lbl">{c.rLabel}</p>
              <h2 className="dp-h2">{c.rTitleA} <span className="dp-serif">{c.rTitleB}</span></h2>
              <p className="dp-body" style={{ marginTop: 20 }}>{c.rSub}</p>
            </Reveal>
          </div>
          {state(board) === "load" && <div className="dp-rail"><Skeletons /></div>}
          {state(board) === "ok" && <div className="dp-rail">{top3.map((r) => <RankTicket key={r.rank} row={r} c={c} />)}</div>}
          {(state(board) === "empty" || state(board) === "err") && (
            <p className="dp-note">{state(board) === "err" ? c.failed : c.empty}</p>
          )}
          {rest.length > 0 && (
            <div className="dp-list">
              {rest.map((r) => (
                <div key={r.rank} className="dp-row">
                  <span className="rk dp-mono">{String(r.rank).padStart(2, "0")}</span>
                  <span className="nm">{r.name}</span>
                  <span className="cn">{Number(r.coins).toLocaleString("vi-VN")} {c.unit}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section id="orders" className="dp-sec">
          <div className="dp-wrap">
            <Reveal className="dp-head">
              <p className="dp-lbl">{c.oLabel}</p>
              <h2 className="dp-h2">{c.oTitleA} <span className="dp-serif">{c.oTitleB}</span></h2>
              <p className="dp-body" style={{ marginTop: 20 }}>{c.oSub}</p>
            </Reveal>
          </div>
          {state(orders) === "load" && <div className="dp-rail"><Skeletons n={4} /></div>}
          {state(orders) === "ok" && (
            <div className="dp-rail">{orders.map((o, i) => <OrderCard key={`${o.approved_at}-${i}`} row={o} c={c} />)}</div>
          )}
          {(state(orders) === "empty" || state(orders) === "err") && (
            <p className="dp-note">{state(orders) === "err" ? c.failed : c.empty}</p>
          )}
        </section>
      </main>

      <footer className="dp-end">
        <div className="dp-glow" /><div className="dp-grain" /><div className="dp-horizon" />
        <div className="dp-close">
          <Reveal>
            <h2>{c.closeA} <span className="dp-serif">{c.closeB}</span></h2>
            <p>{c.closeSub}</p>
            <div className="acts">
              <Link to="/register" className="dp-pill big"><span>{c.ctaAccount}</span><ArrowRight size={20} strokeWidth={1.5} /></Link>
              <a href={CREATOR_URL} className="dp-pill big"><span>{c.ctaCreator}</span><ArrowUpRight size={20} strokeWidth={1.5} /></a>
            </div>
          </Reveal>
        </div>

        <div className="dp-wrap">
          <div className="dp-foot">
            <div className="brand"><Wordmark /><p>{c.manifesto}</p></div>
            <div>
              <h4>{c.fCols[0]}</h4>
              <ul>{c.fExplore.map(([id, l]) => <li key={id}><button type="button" onClick={() => scrollToId(id)}>{l}</button></li>)}</ul>
            </div>
            <div>
              <h4>{c.fCols[1]}</h4>
              <ul>{c.fAccount.map(([to, l]) => <li key={to}><Link to={to}>{l}</Link></li>)}</ul>
              <h4 style={{ marginTop: 24 }}>{c.fCols[2]}</h4>
              <ul>{c.fLegal.map(([to, l]) => <li key={to}><Link to={to}>{l}</Link></li>)}</ul>
            </div>
            <div>
              <h4>{c.fCols[3]}</h4>
              <ul>
                {SITE?.youtube && <li><a href={SITE.youtube} target="_blank" rel="noopener noreferrer">YouTube</a></li>}
                {SITE?.zaloUrl && <li><a href={SITE.zaloUrl} target="_blank" rel="noopener noreferrer">Zalo</a></li>}
                {SITE?.email && <li><a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>}
                <li><a href={CREATOR_URL}>Creator</a></li>
              </ul>
            </div>
          </div>
          <div className="dp-bottom dp-mono">
            <span>© {new Date().getFullYear()} Nxx315 Studio</span>
            <span>Roblox · Creator · Rewards</span>
          </div>
        </div>
      </footer>
    </div>
  );
          }
            
