// src/CloudVIPLanding.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Video, Sparkles, UserPlus, PlaySquare, Gift } from "lucide-react";
import { supabase } from "./lib/supabaseClient.js";
import { SITE } from "./lib/siteInfo.js";
import { useI18n } from "./i18n/index.js";
import useTheme from "./hooks/useTheme.js";
import { COPY, CREATOR_URL } from "./lib/landingData.js";
import { FX } from "./lib/landingFxCopy.js";
import { CSS } from "./components/LandingStyle.js";
import {
  FloatingNav, Reveal, Trail, RankTicket, OrderCard,
  Skeletons, Wordmark, scrollToId,
} from "./components/LandingBits.jsx";
import {
  ScrollBar, Scramble, SplitTitle, CountUp, Tilt, Magnetic, ParallaxImg,
  Spotlight, ScrollWords, PinnedSteps, Marquee, InView,
  RevealUp, AutoCarousel, // <-- Thêm 2 component mới
} from "./components/LandingFx.jsx";

const HERO_IMAGE_URL = "https://i.postimg.cc/SspRfjP1/2820b7c3993087b1613784521f440e45.jpg";
const CREATOR_IMAGE_URL = "";

const STEP_ICONS = [UserPlus, PlaySquare, Gift];
const PERK_ICONS = [Sparkles, Video, ArrowUpRight];

export default function CloudVIPLanding() {
  useTheme();
  const i18n = useI18n();
  const lang = i18n.lang === "en" ? "en" : "vi";
  const setLang = i18n.setLang || i18n.setLanguage || i18n.changeLanguage;
  const c = COPY[lang];
  const fx = FX[lang];
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
      <ScrollBar />

      <FloatingNav
        items={c.nav}
        onItem={scrollToId}
        loginLabel={c.login}
        startLabel={c.start}
        langLabel={c.langBtn}
        onLang={typeof setLang === "function" ? () => setLang(lang === "vi" ? "en" : "vi") : undefined}
      />

      <main>
        {/* ===== 1. HERO ===== */}
        <section className="dp-stage">
          <ParallaxImg className="dp-hero-bg-image" src={HERO_IMAGE_URL} alt={c.heroAlt} />
          <div className="dp-hero-overlay"></div>
          <Spotlight />
          <Trail />

          <div className="dp-wrap dp-hero">
            <div className="dp-hero-text-container">
              <h1 className="dp-h1">
                <span>{c.h1a} <em className="dp-serif">{c.h1b}</em></span>
                <span>{c.h1c}</span>
                <span className="dp-serif dim">{c.h1d}</span>
              </h1>
              <p className="dp-hs">{c.heroSub}</p>
            </div>

            <aside className="dp-ticket">
              <p className="meta dp-mono"><span>{c.ticketMeta}</span><span>No. 01</span></p>
              <h3>{c.ticketTitle}</h3>
              <p className="note">{c.ticketNote}</p>
              <Link to="/register" className="dp-pill"><span>{c.ctaAccount}</span><ArrowRight size={18} strokeWidth={1.5} /></Link>
              <a href={CREATOR_URL} className="dp-pill"><span>{c.ctaCreator}</span><ArrowUpRight size={18} strokeWidth={1.5} /></a>
            </aside>
          </div>

          <div className="dp-wrap dp-tele dp-mono"><span>+ NXX315 · STUDIO REWARDS</span><span>↓ {c.scroll}</span></div>
        </section>

        {/* ===== 2. CÂU DẪN ===== */}
        <ScrollWords text={fx.story} />

        {/* ===== 3. HƯỚNG DẪN TẠO TÀI KHOẢN ===== */}
        <section id="onboarding" className="dp-sec">
          <div className="dp-wrap">
            <div className="dp-head">
              <Scramble className="dp-lbl" text={c.obLabel} />
              <SplitTitle a={c.obTitleA} b={c.obTitleB} />
              <InView as="p" className="dp-body fx-fade" style={{ marginTop: 20 }}>{c.obBody}</InView>
            </div>

            <PinnedSteps steps={c.obSteps} icons={STEP_ICONS} />

            {/* ĐÃ THÊM HIỆU ỨNG TRƯỢT LÊN (REVEAL UP) CHO NÚT TẠO TÀI KHOẢN */}
            <RevealUp delay={100}>
              <div className="dp-cta-row">
                <Magnetic>
                  <Link to="/register" className="dp-pill big"><span>{c.obCta}</span><ArrowRight size={20} strokeWidth={1.5} /></Link>
                </Magnetic>
              </div>
            </RevealUp>
          </div>
        </section>

        {/* ===== CHỮ CHẠY NGANG ===== */}
        <Marquee items={fx.marquee} />

        {/* ===== 4. MỜI BẠN ===== */}
        <section id="invite" className="dp-sec">
          <div className="dp-wrap">
            <div className="dp-head">
              <Scramble className="dp-lbl" text={c.iLabel} />
              <SplitTitle a={c.iTitleA} b={c.iTitleB} />
              <InView as="p" className="dp-body fx-fade" style={{ marginTop: 20 }}>{c.iBody}</InView>
            </div>
            <div className="dp-trip">
              {c.iCols.map(([big, d], i) => (
                <Reveal key={big} delay={i * 80}>
                  <h3 style={{ fontSize: "clamp(40px,7vw,64px)" }}><CountUp value={big} /></h3>
                  <p>{d}</p>
                </Reveal>
              ))}
            </div>
            <RevealUp delay={150}>
              <div className="dp-cta-row">
                <Magnetic>
                  <button type="button" className="dp-pill big" onClick={() => navigate("/register")}>
                    <span>{c.iCta}</span><ArrowRight size={20} strokeWidth={1.5} />
                  </button>
                </Magnetic>
              </div>
            </RevealUp>
          </div>
        </section>

        {/* ===== 5. BẢNG XẾP HẠNG (TỰ ĐỘNG TRƯỢT 3S) ===== */}
        <section id="rank" className="dp-sec">
          <div className="dp-wrap">
            <div className="dp-head">
              <Scramble className="dp-lbl" text={c.rLabel} />
              <SplitTitle a={c.rTitleA} b={c.rTitleB} />
              <InView as="p" className="dp-body fx-fade" style={{ marginTop: 20 }}>{c.rSub}</InView>
            </div>
          </div>
          
          {state(board) === "load" && <div className="dp-rail"><Skeletons /></div>}
          
          {/* SỬ DỤNG AUTOCAROUSEL ĐỂ TỰ ĐỘNG CHẠY TOP 1-2-3 */}
          {state(board) === "ok" && (
            <AutoCarousel interval={3000}>
              {top3.map((r) => <RankTicket key={r.rank} row={r} c={c} />)}
            </AutoCarousel>
          )}
          
          {(state(board) === "empty" || state(board) === "err") && (
            <p className="dp-note">{state(board) === "err" ? c.failed : c.empty}</p>
          )}
          
          {rest.length > 0 && (
            <div className="dp-list">
              {rest.map((r) => (
                <div key={r.rank} className="dp-row">
                  <span className="rk dp-mono">{String(r.rank).padStart(2, "0")}</span>
                  <span className="nm">{r.name}</span>
                  <span className="cn">{Number(r.coins).toLocaleString(lang === "en" ? "en-US" : "vi-VN")} {c.unit}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ===== 6. ĐƠN ĐÃ DUYỆT ===== */}
        <section id="orders" className="dp-sec">
          <div className="dp-wrap">
            <div className="dp-head">
              <Scramble className="dp-lbl" text={c.oLabel} />
              <SplitTitle a={c.oTitleA} b={c.oTitleB} />
              <InView as="p" className="dp-body fx-fade" style={{ marginTop: 20 }}>{c.oSub}</InView>
            </div>
          </div>
          {state(orders) === "load" && <div className="dp-rail"><Skeletons n={4} /></div>}
          {state(orders) === "ok" && (
            <InView className="dp-rail fx-rise">
              {orders.map((o, i) => <OrderCard key={`${o.approved_at}-${i}`} row={o} c={c} />)}
            </InView>
          )}
          {(state(orders) === "empty" || state(orders) === "err") && (
            <p className="dp-note">{state(orders) === "err" ? c.failed : c.empty}</p>
          )}
        </section>

        {/* ===== 7. THÔNG TIN CHI TIẾT + FAQ ===== */}
        <section id="details" className="dp-sec">
          <div className="dp-wrap">
            <div className="dp-head">
              <Scramble className="dp-lbl" text={c.dLabel} />
              <SplitTitle a={c.dTitleA} b={c.dTitleB} />
            </div>

            <div className="dp-dgrid">
              {c.dItems.map(([t, d], i) => (
                <Reveal key={t} delay={i * 80}>
                  <Tilt>
                    <div className="dp-dcard"><h3>{t}</h3><p>{d}</p></div>
                  </Tilt>
                </Reveal>
              ))}
            </div>

            <SplitTitle as="h3" className="dp-faq-title" a={c.faqTitle} />
            <div className="dp-faq">
              {c.faq.map(([q, a]) => (
                <details key={q}><summary>{q}</summary><p>{a}</p></details>
              ))}
            </div>
          </div>
        </section>

        {/* ===== 8. CREATOR ===== */}
        <section id="creator" className="dp-sec">
          <div className="dp-wrap">
            <div className="dp-feature-box">
              <div className="dp-feature-glow"></div>

              <div className="dp-head" style={{ position: "relative", zIndex: 2 }}>
                <p className="dp-lbl" style={{ color: "#af50ff" }}>
                  <Sparkles size={14} style={{ display: "inline", marginRight: 6 }} />
                  <Scramble as="span" text={c.cLabel} />
                </p>
                <SplitTitle a={c.cTitleA} b={c.cTitleB} />
              </div>

              <div className="dp-creator-showcase" style={{ position: "relative", zIndex: 2 }}>
                <div className="dp-creator-text">
                  <h3>{c.cH3}</h3>
                  <p>{c.cBody}</p>

                  <InView as="ul" className="dp-creator-perks fx-stag">
                    {c.cPerks.map((t, i) => {
                      const Icon = PERK_ICONS[i];
                      return <li key={t}><Icon size={18} /> {t}</li>;
                    })}
                  </InView>

                  <div className="dp-cta-row" style={{ marginTop: 32 }}>
                    <Magnetic>
                      <a href={CREATOR_URL} className="dp-pill big" style={{ width: "fit-content" }}>
                        <span>{c.cCta}</span><ArrowUpRight size={20} strokeWidth={1.5} />
                      </a>
                    </Magnetic>
                  </div>
                </div>

                <div className="dp-creator-visual">
                  <Tilt max={6}>
                    <div className="dp-console">
                      <div className="dp-cbar">
                        <i /><i /><i />
                        <span className="dp-url dp-mono">creator.nxx315.com</span>
                        <span className="dp-badge">{c.mockTag}</span>
                      </div>
                      <div className="dp-cbody" style={{ alignItems: "center", justifyContent: "center" }}>
                        {CREATOR_IMAGE_URL ? (
                          <img src={CREATOR_IMAGE_URL} alt="Creator" loading="lazy" />
                        ) : (
                          <p style={{ opacity: 0.6, fontStyle: "italic", color: "var(--paper)" }}>{c.mockPlaceholder}</p>
                        )}
                      </div>
                    </div>
                  </Tilt>
                  <span className="dp-float f1 dp-badge">+ {c.mockGift}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="dp-end">
        <div className="dp-glow" /><div className="dp-grain" /><div className="dp-horizon" />
        <div className="dp-close">
          <div>
            <SplitTitle as="h2" className="" a={c.closeA} b={c.closeB} />
            <InView as="p" className="fx-fade">{c.closeSub}</InView>
            <div className="acts">
              <Magnetic>
                <Link to="/register" className="dp-pill big"><span>{c.ctaAccount}</span><ArrowRight size={20} strokeWidth={1.5} /></Link>
              </Magnetic>
              <Magnetic>
                <a href={CREATOR_URL} className="dp-pill big"><span>{c.ctaCreator}</span><ArrowUpRight size={20} strokeWidth={1.5} /></a>
              </Magnetic>
            </div>
          </div>
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
