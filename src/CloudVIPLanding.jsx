import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  UserPlus,
  Zap,
  Gift,
  Lock,
  ShieldCheck,
  Bot,
  KeyRound,
  CalendarCheck,
  Flame,
  Gamepad2,
  TrendingUp,
  Share2,
  Trophy,
  ShoppingBag,
  Wallet,
  Bell,
  Smartphone,
  Check,
} from "lucide-react";
import {
  SectionHead,
  Chip,
  PreviewCard,
  SafetyCard,
  FAQItem,
  DOT_BG,
  primaryBtn,
  ghostBtn,
} from "./components/LandingKit.jsx";
import {
  PvStore,
  PvCheckin,
  PvStreak,
  PvGames,
  PvLevel,
  PvRank,
  PvRefer,
  PvWallet,
  PvNotify,
  PvPhone,
  HeroShowcase,
} from "./components/LandingPreviews.jsx";
import {
  LandingHeader,
  LandingFooter,
  BackToTop,
  scrollToId,
} from "./components/LandingChrome.jsx";
import { useI18n } from "./i18n/index.js";

const STEPS = [
  {
    n: "01",
    icon: UserPlus,
    t: "ld.s1t",
    d: "ld.s1d",
    chips: [{ raw: "Email" }, { raw: "Google" }],
  },
  {
    n: "02",
    icon: Zap,
    t: "ld.s2t",
    d: "ld.s2d",
    chips: [{ k: "dash.qaTasks" }, { k: "dash.minigame" }, { k: "ld.f5t" }],
  },
  {
    n: "03",
    icon: Gift,
    t: "ld.s3t",
    d: "ld.s3d",
    chips: [{ k: "ld.chipRobux" }, { k: "ld.chipPhone" }, { k: "ld.chipGift" }],
  },
];

const SAFETY = [
  { icon: Lock, t: "ld.b1t", d: "ld.b1d" },
  { icon: ShieldCheck, t: "ld.b2t", d: "ld.b2d" },
  { icon: Bot, t: "ld.b3t", d: "ld.b3d" },
  { icon: KeyRound, t: "ld.b4t", d: "ld.b4d" },
];

const FAQ_ORDER = [1, 2, 7, 3, 4, 5, 6];

export default function CloudVIPLanding() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(0);

  const bento = [
    {
      k: "f7",
      icon: ShoppingBag,
      span: "sm:col-span-2",
      pv: (
        <PvStore
          labels={[t("ld.chipRobux"), t("ld.chipPhone"), t("ld.chipGift")]}
        />
      ),
    },
    { k: "f1", icon: CalendarCheck, span: "sm:col-span-2", pv: <PvCheckin /> },
    { k: "f2", icon: Flame, pv: <PvStreak /> },
    {
      k: "f3",
      icon: Gamepad2,
      pv: (
        <PvGames
          labels={[t("dash.wheel"), t("dash.scratch"), t("dash.dice")]}
        />
      ),
    },
    { k: "f4", icon: TrendingUp, pv: <PvLevel /> },
    { k: "f6", icon: Trophy, pv: <PvRank /> },
    { k: "f5", icon: Share2, pv: <PvRefer /> },
    { k: "f8", icon: Wallet, pv: <PvWallet /> },
    { k: "f9", icon: Bell, pv: <PvNotify /> },
    { k: "f10", icon: Smartphone, pv: <PvPhone /> },
  ];

  return (
    <div className="min-h-screen bg-white font-['Be_Vietnam_Pro',sans-serif] text-slate-900">
      <LandingHeader />

      <main>
        {/* ============ HERO ============ */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              ...DOT_BG,
              WebkitMaskImage:
                "radial-gradient(ellipse at 50% 20%, black, transparent 70%)",
              maskImage:
                "radial-gradient(ellipse at 50% 20%, black, transparent 70%)",
            }}
          />
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-sky-200/40 blur-3xl" />

          <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-16 pt-10 lg:grid-cols-[1.05fr_.95fr] lg:pb-24 lg:pt-16">
            <div className="text-left">
              <span className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-4 py-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-600 shadow-sm sm:text-[11px]">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                {t("ld.badge")}
              </span>

              <h1 className="mt-6 text-[36px] font-extrabold leading-[1.12] tracking-tight text-slate-900 sm:text-6xl">
                <span className="block">{t("ld.h1a")}</span>
                <span className="block bg-gradient-to-r from-sky-500 to-blue-700 bg-clip-text text-transparent">
                  {t("ld.h1b")}
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-[15px] leading-7 text-slate-500 sm:text-base">
                {t("ld.heroSub")}
              </p>

              <div className="mt-8 flex max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row">
                <button
                  onClick={() => navigate("/register")}
                  className={`${primaryBtn} w-full sm:w-auto`}
                >
                  {t("ld.ctaStart")} <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => scrollToId("how")}
                  className={`${ghostBtn} w-full sm:w-auto`}
                >
                  {t("ld.ctaHow")}
                </button>
              </div>

              <div className="mt-7 flex flex-wrap gap-2">
                {["ld.check1", "ld.check2", "ld.check3"].map((k) => (
                  <span
                    key={k}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600"
                  >
                    <Check size={13} className="text-emerald-500" />
                    {t(k)}
                  </span>
                ))}
              </div>
            </div>

            <HeroShowcase chip={t("ld.chipRobux")} />
          </div>
        </section>

        {/* ============ 001 CÁCH HOẠT ĐỘNG ============ */}
        <section
          id="how"
          className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 sm:py-24"
        >
          <SectionHead
            index="001"
            tag={t("ld.nav.how")}
            title={t("ld.howTitle")}
            sub={t("ld.howTag")}
          />

          <div className="relative mt-14 grid gap-8 md:grid-cols-3 md:gap-6">
            {/* đường nối: dọc ở điện thoại, ngang ở máy tính */}
            <div className="pointer-events-none absolute bottom-6 left-5 top-6 w-px bg-gradient-to-b from-blue-200 via-blue-400 to-blue-200 md:hidden" />
            <div className="pointer-events-none absolute left-[16%] right-[16%] top-5 hidden h-px bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 md:block" />

            {STEPS.map(({ n, icon: Icon, t: tk, d, chips }) => (
              <div
                key={n}
                className="relative flex gap-4 md:flex-col md:items-center"
              >
                <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 font-mono text-sm font-bold text-white shadow-lg shadow-blue-500/30 ring-4 ring-white">
                  {n}
                </span>
                <div className="flex-1 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 md:w-full">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon size={19} />
                  </span>
                  <h3 className="mt-4 text-[17px] font-bold tracking-tight text-slate-900">
                    {t(tk)}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-6 text-slate-500">
                    {t(d)}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {chips.map((c) => (
                      <Chip key={c.k || c.raw}>{c.raw ?? t(c.k)}</Chip>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============ 002 TÍNH NĂNG (BENTO) ============ */}
        <section
          id="features"
          className="scroll-mt-24 border-y border-slate-200 bg-slate-50/70"
        >
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
            <SectionHead
              index="002"
              tag={t("ld.nav.features")}
              title={t("ld.bentoTitle")}
              sub={t("ld.bentoSub")}
            />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {bento.map(({ k, icon, span, pv }, i) => (
                <PreviewCard
                  key={k}
                  icon={icon}
                  title={t(`ld.${k}t`)}
                  desc={t(`ld.${k}d`)}
                  index={String(i + 1).padStart(2, "0")}
                  preview={pv}
                  className={span || ""}
                />
              ))}
            </div>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">
              {t("ld.storeNote")}
            </p>
          </div>
        </section>

        {/* ============ 003 AN TOÀN ============ */}
        <section
          id="safety"
          className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 sm:py-24"
        >
          <SectionHead
            index="003"
            tag={t("ld.nav.safety")}
            title={t("ld.safeTitle")}
            sub={t("ld.safeSub")}
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {SAFETY.map(({ icon, t: tk, d }) => (
              <SafetyCard key={tk} icon={icon} title={t(tk)} desc={t(d)} />
            ))}
          </div>
        </section>

        {/* ============ 004 FAQ ============ */}
        <section
          id="faq"
          className="scroll-mt-24 border-t border-slate-200 bg-slate-50/70"
        >
          <div className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
            <SectionHead
              index="004"
              tag={t("ld.nav.faq")}
              title={t("ld.faqTitle")}
              sub={t("ld.faqTag")}
            />
            <div className="mt-10 space-y-3">
              {FAQ_ORDER.map((i, idx) => (
                <FAQItem
                  key={i}
                  q={t(`ld.faq${i}q`)}
                  a={t(`ld.faq${i}a`)}
                  open={openFaq === idx}
                  onToggle={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ============ CTA CUỐI ============ */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 p-8 text-center text-white shadow-2xl shadow-blue-600/25 sm:p-14">
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.55) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            />
            <div className="relative">
              <h2 className="text-[28px] font-extrabold leading-[1.15] tracking-tight sm:text-5xl">
                {t("ld.ctaTitle")}
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-[15px] leading-7 text-sky-50">
                {t("ld.ctaSub")}
              </p>
              <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
                <button
                  onClick={() => navigate("/register")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-[14px] font-bold text-blue-700 shadow-lg transition hover:bg-sky-50 active:scale-[0.98] sm:w-auto"
                >
                  {t("ld.ctaReg")} <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="inline-flex w-full items-center justify-center rounded-full border border-white/50 px-7 py-4 text-[14px] font-bold text-white transition hover:bg-white/10 active:scale-[0.98] sm:w-auto"
                >
                  {t("ld.login")}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
      <BackToTop />
    </div>
  );
    }
