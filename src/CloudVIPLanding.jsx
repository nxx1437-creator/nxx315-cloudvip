import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowDown, Lock, ShieldCheck, Bot, KeyRound } from "lucide-react";
import { LandingFooter, BackToTop, scrollToId } from "./components/LandingNav.jsx";
import { SITE } from "./lib/siteInfo.js";
import { useI18n } from "./i18n/index.js";
import { COPY, LABELS } from "./lib/landingCopy.js";
import { CSS } from "./components/LandingTheme.js";
import {
  FloatingNav, HeroVideo, Reveal, Head, FaqRow, Row,
} from "./components/LandingParts.jsx";

/* Video đầu trang: tải file hero.mp4 lên thư mục public của repo */
const HERO_VIDEO = "/hero.mp4";

const SAFETY = [
  { icon: Lock, t: "ld.b1t", d: "ld.b1d" },
  { icon: ShieldCheck, t: "ld.b2t", d: "ld.b2d" },
  { icon: Bot, t: "ld.b3t", d: "ld.b3d" },
  { icon: KeyRound, t: "ld.b4t", d: "ld.b4d" },
];
const FEATURE_TAGS = ["A¹", "B¹", "C¹", "D¹"];
const FAQ_ORDER = [1, 2, 7, 3, 4, 5, 6];
const SECTION = "mx-auto max-w-[1200px] px-5 py-16 sm:py-[94px]";

export default function CloudVIPLanding() {
  const i18n = useI18n();
  const { t, lang } = i18n;
  const setLang = i18n.setLang || i18n.setLanguage || i18n.changeLanguage;
  const c = COPY[lang] || COPY.vi;
  const L = LABELS[lang] || LABELS.vi;
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(0);

  const launchedText =
    typeof SITE.launched === "object" ? SITE.launched[lang] || SITE.launched.vi : SITE.launched;

  return (
    <div className="lp min-h-screen">
      <style>{CSS}</style>

      <FloatingNav
        items={c.nav}
        onItem={scrollToId}
        loginLabel={t("ld.login")}
        onLogin={() => navigate("/login")}
        langLabel={lang === "vi" ? "EN" : "VI"}
        onLang={typeof setLang === "function" ? () => setLang(lang === "vi" ? "en" : "vi") : null}
      />

      <main>
        {/* ============ HERO: video + chữ góc trái dưới ============ */}
        <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[var(--panel)]">
          <div className="relative z-10 flex flex-1 flex-col">
            <div className="lp-rise lp-d2 flex justify-center px-3 pt-[76px] sm:pt-[104px]">
              <Link to="/register" className="lp-banner lp-press">
                <span>{c.banner}</span>
                <span className="lp-arrow"><ArrowRight size={12} strokeWidth={1.5} /></span>
              </Link>
            </div>

            <div className="relative min-h-[300px] flex-1 md:static md:min-h-0">
              <HeroVideo src={HERO_VIDEO} />
            </div>

            <div className="mx-auto w-full max-w-[1200px] px-5 pb-8 sm:pb-12">
              <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                <div className="max-w-[520px]">
                  <p className="lp-rise lp-label">{t("ld.badge")}</p>
                  <h1 className="lp-rise lp-d1 mt-3 text-[clamp(27px,3.6vw,44px)] leading-[1.2] tracking-[-0.03em]">
                    {c.h1a}<br />{c.h1b}
                  </h1>
                  <p className="lp-rise lp-d2 lp-body mt-3">{c.heroSub}</p>
                  <div className="lp-rise lp-d3 mt-5 flex flex-wrap items-center gap-1.5">
                    <span className="mr-1 text-[16px] text-[var(--ash)]">{c.explore}</span>
                    {c.tags.map(([k, label]) => (
                      <button key={k} onClick={() => scrollToId("features")} className="lp-tag lp-press">
                        {k} {label}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => scrollToId("overview")} aria-label="Scroll"
                    className="lp-glass lp-press mt-8 hidden h-10 w-6 md:flex items-center justify-center rounded-full">
                    <ArrowDown size={12} strokeWidth={1.5} />
                  </button>
                </div>

                <button onClick={() => navigate("/register")} className="lp-cta lp-press lp-rise lp-d3 w-fit">
                  <span>{t("ld.ctaStart")}</span>
                  <ArrowRight size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ============ TỔNG QUAN: 3 cột lệch ============ */}
        <section id="overview" className="scroll-mt-24">
          <div className={SECTION}>
            <Reveal>
              <div className="grid gap-6 lg:grid-cols-[180px_1fr_340px] lg:gap-12">
                <p className="lp-label">01 · {L.over}</p>
                <div>
                  <h2 className="lp-h2 max-w-[560px]">{c.overTitle}</h2>
                  <ul className="mt-6 flex flex-wrap gap-1.5">
                    {[t("ld.check1"), t("ld.check2"), t("ld.check3")].map((x) => (
                      <li key={x} className="lp-tag">{x}</li>
                    ))}
                  </ul>
                </div>
                <p className="lp-body">{c.note}</p>
              </div>
            </Reveal>

            <dl className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {c.facts.map(([v, l], i) => (
                <Reveal key={v} delay={i * 60} className="h-full">
                  <div className="lp-card h-full p-6 sm:p-8">
                    <dt className="text-[22px] leading-[1.2] tracking-[-0.44px] sm:text-[27px]">{v}</dt>
                    <dd className="lp-label mt-3 leading-[1.4]">{l}</dd>
                  </div>
                </Reveal>
              ))}
            </dl>
          </div>
        </section>

        {/* ============ TÍNH NĂNG ============ */}
        <section id="features" className="scroll-mt-24">
          <div className={SECTION}>
            <Head n="02" label={L.feat} title={c.featTitle} />
            <div className="mt-12 grid gap-3 sm:gap-4 md:grid-cols-2">
              {c.features.map((f, i) => (
                <Reveal key={f.to} delay={(i % 2) * 70} className="h-full">
                  <div className="lp-card flex h-full flex-col p-7 sm:p-[69px]">
                    <span className="lp-tag w-fit">{FEATURE_TAGS[i]}</span>
                    <h3 className="mt-10 text-[24px] leading-[1.2] tracking-[-0.48px] sm:text-[27px]">{f.title}</h3>
                    <p className="lp-body mt-3 flex-1">{f.body}</p>
                    <Link to={f.to} className="lp-link mt-8 inline-flex items-center gap-1 text-[16px]">
                      {c.guide} <ArrowRight size={14} strokeWidth={1.5} />
                    </Link>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CÁCH HOẠT ĐỘNG ============ */}
        <section id="how" className="scroll-mt-24">
          <div className={SECTION}>
            <Head n="03" label={L.how} title={c.howTitle} />
            <ol className="mt-12 grid gap-3 sm:gap-4 md:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <li key={n}>
                  <Reveal delay={n * 60} className="h-full">
                    <div className="lp-card h-full p-7 sm:p-10">
                      <span className="lp-tag">0{n}</span>
                      <h3 className="mt-10 text-[24px] leading-[1.2] tracking-[-0.48px]">{t(`ld.s${n}t`)}</h3>
                      <p className="lp-body mt-3">{t(`ld.s${n}d`)}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ============ AN TOÀN ============ */}
        <section id="safety" className="scroll-mt-24">
          <div className={SECTION}>
            <Head n="04" label={L.safe} title={t("ld.safeTitle")} sub={t("ld.safeSub")} />
            <Reveal>
              <div className="lp-card mt-12 p-7 sm:p-[69px]">
                <div className="grid gap-x-16 gap-y-10 sm:grid-cols-2">
                  {SAFETY.map(({ icon: Icon, t: tk, d }) => (
                    <div key={tk}>
                      <Icon size={22} strokeWidth={1.1} />
                      <h3 className="lp-sub mt-5">{t(tk)}</h3>
                      <p className="lp-body mt-2">{t(d)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============ MINH BẠCH ============ */}
        <section>
          <div className={`${SECTION} grid gap-12 md:grid-cols-2 md:gap-20`}>
            <div>
              <p className="lp-label">05 · {L.who}</p>
              <h2 className="lp-h2 mt-2">{c.whoTitle}</h2>
              <p className="lp-body mt-5 max-w-md">{c.whoBody}</p>
              <ul className="mt-6 flex flex-wrap gap-1.5">
                {c.whoPoints.map((p) => <li key={p} className="lp-tag !rounded-[14px] !py-1.5">{p}</li>)}
              </ul>
              <Link to="/about" className="lp-link mt-6 inline-flex items-center gap-1 text-[16px]">
                {c.whoMore} <ArrowRight size={14} strokeWidth={1.5} />
              </Link>
              <div className="mt-10 border-t-[.5px] border-[var(--hair)] pt-6">
                <p className="lp-label">{c.whoLegal}</p>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
                  <Link to="/terms" className="lp-link">{c.terms}</Link>
                  <Link to="/privacy" className="lp-link">{c.privacy}</Link>
                  <Link to="/refund" className="lp-link">{c.refund}</Link>
                </div>
              </div>
            </div>

            <Reveal>
              <dl className="lp-card px-7 py-3 sm:px-10">
                <Row k={c.whoOperator}>{SITE.operator}</Row>
                {SITE.address && <Row k={c.address}>{SITE.address}</Row>}
                {SITE.business && <Row k={c.business}>{SITE.business}</Row>}
                {SITE.youtube && (
                  <Row k="YouTube">
                    <a href={SITE.youtube} target="_blank" rel="noopener noreferrer" className="lp-link">
                      {SITE.youtube.replace("https://www.youtube.com/", "")}
                    </a>
                  </Row>
                )}
                <Row k="Zalo">
                  <a href={SITE.zaloUrl} target="_blank" rel="noopener noreferrer" className="lp-link">{SITE.zalo}</a>
                </Row>
                <Row k="Email"><span className="break-all">{SITE.email}</span></Row>
                <Row k={c.whoSince}>{launchedText}</Row>
              </dl>
            </Reveal>
          </div>
        </section>

        {/* ============ HỎI ĐÁP ============ */}
        <section id="faq" className="scroll-mt-24">
          <div className="mx-auto max-w-3xl px-5 py-16 sm:py-[94px]">
            <Head n="06" label={L.faq} title={t("ld.faqTitle")} />
            <div className="mt-10 border-t-[.5px] border-[var(--hair)]">
              {FAQ_ORDER.map((i, idx) => (
                <FaqRow key={i} n={String(idx + 1).padStart(2, "0")} q={t(`ld.faq${i}q`)} a={t(`ld.faq${i}a`)}
                  open={openFaq === idx} onToggle={() => setOpenFaq(openFaq === idx ? -1 : idx)} />
              ))}
            </div>
          </div>
        </section>

        {/* ============ KÊU GỌI CUỐI ============ */}
        <section>
          <div className="mx-auto max-w-[1200px] px-5 pb-16 sm:pb-[94px]">
            <Reveal>
              <div className="lp-card p-7 sm:p-[69px]">
                <h2 className="max-w-[560px] text-[clamp(27px,4vw,44px)] leading-[1.2] tracking-[-0.03em]">{c.ctaTitle}</h2>
                <p className="lp-body mt-4 max-w-md">{t("ld.ctaSub")}</p>
                <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
                  <button onClick={() => navigate("/register")} className="lp-cta lp-press">
                    <span>{t("ld.ctaReg")}</span><ArrowRight size={16} strokeWidth={1.5} />
                  </button>
                  <button onClick={() => navigate("/login")} className="lp-link text-[16px]">{t("ld.login")}</button>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <LandingFooter />
      <BackToTop />
    </div>
  );
                  }
                  
                  
                                

