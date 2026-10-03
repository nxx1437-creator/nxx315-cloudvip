import React from "react";
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
} from "lucide-react";
import {
  SectionHead,
  BentoCard,
  Chip,
  SafetyBadge,
  StepCard,
  FAQItem,
  HeroConsole,
  Corners,
  primaryBtn,
  ghostBtn,
} from "./components/LandingParts.jsx";
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

const BENTO = [
  {
    icon: ShoppingBag,
    t: "ld.f7t",
    d: "ld.f7d",
    featured: true,
    span: "sm:col-span-2",
    chips: ["ld.chipRobux", "ld.chipPhone", "ld.chipGift"],
  },
  {
    icon: CalendarCheck,
    t: "ld.f1t",
    d: "ld.f1d",
    featured: true,
    span: "sm:col-span-2",
  },
  { icon: Flame, t: "ld.f2t", d: "ld.f2d" },
  {
    icon: Gamepad2,
    t: "ld.f3t",
    d: "ld.f3d",
    chips: ["dash.wheel", "dash.scratch", "dash.dice"],
  },
  { icon: TrendingUp, t: "ld.f4t", d: "ld.f4d" },
  { icon: Trophy, t: "ld.f6t", d: "ld.f6d" },
  { icon: Share2, t: "ld.f5t", d: "ld.f5d" },
  { icon: Wallet, t: "ld.f8t", d: "ld.f8d" },
  { icon: Bell, t: "ld.f9t", d: "ld.f9d" },
  { icon: Smartphone, t: "ld.f10t", d: "ld.f10d" },
];

const SAFETY = [
  { icon: Lock, t: "ld.b1t", d: "ld.b1d" },
  { icon: ShieldCheck, t: "ld.b2t", d: "ld.b2d" },
  { icon: Bot, t: "ld.b3t", d: "ld.b3d" },
  { icon: KeyRound, t: "ld.b4t", d: "ld.b4d" },
];

const GRID_BG = {
  backgroundImage:
    "linear-gradient(rgba(5,150,105,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(5,150,105,0.06) 1px, transparent 1px)",
  backgroundSize: "44px 44px",
};

export default function CloudVIPLanding() {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-['Be_Vietnam_Pro',sans-serif] text-slate-900">
      <LandingHeader />

      <main>
        {/* ============ HERO ============ */}
        <section
          className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 to-white"
          style={GRID_BG}
        >
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-12 pt-10 lg:grid-cols-[1.05fr_.95fr] lg:pb-20 lg:pt-16">
            <div className="text-center lg:text-left">
              <span className="relative inline-flex items-center gap-2.5 border border-emerald-600/25 bg-white px-3.5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700 sm:text-[11px]">
                <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                {t("ld.badge")}
                <Corners />
              </span>

              {/* --- PHẦN CHỮ ĐÃ ĐƯỢC SỬA --- */}
              <h1 className="mt-6 text-[34px] font-black uppercase leading-[1.25] tracking-[-0.02em] text-slate-950 sm:text-6xl">
                <span className="[text-wrap:balance]">{t("ld.h1a")}</span>{" "}
                <span className="text-emerald-600 [text-wrap:balance]">
                  {t("ld.h1b")}
                </span>
              </h1>
              {/* --------------------------- */}

              <p className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-slate-500 lg:mx-0">
                {t("ld.heroSub")}
              </p>

              <div className="mx-auto mt-7 flex max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center lg:justify-start">
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
            </div>

            <HeroConsole />
          </div>
        </section>

        {/* ============ DẢI TIN CẬY ============ */}
        <div className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2.5 px-5 py-5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
            {["ld.check1", "ld.check2", "ld.check3"].map((k) => (
              <span key={k} className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {t(k)}
              </span>
            ))}
          </div>
        </div>

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
          <div className="mt-12 grid gap-12 md:grid-cols-3 md:gap-8">
            {STEPS.map(({ n, icon, t: tk, d, chips }) => (
              <StepCard
                key={n}
                n={n}
                icon={icon}
                title={t(tk)}
                desc={t(d)}
              >
                {chips.map((c) => (
                  <Chip key={c.k || c.raw}>{c.raw ?? t(c.k)}</Chip>
                ))}
              </StepCard>
            ))}
          </div>
        </section>

        {/* ============ 002 TÍNH NĂNG ============ */}
        <section
          id="features"
          className="scroll-mt-24 border-t border-slate-200 bg-slate-50"
          style={GRID_BG}
        >
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
            <SectionHead
              index="002"
              tag={t("ld.nav.features")}
              title={t("ld.bentoTitle")}
              sub={t("ld.bentoSub")}
            />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {BENTO.map(({ icon, t: tk, d, span, featured, chips }) => (
                <BentoCard
                  key={tk}
                  icon={icon}
                  title={t(tk)}
                  desc={t(d)}
                  featured={featured}
                  className={span || ""}
                >
                  {chips?.map((c) => (
                    <Chip key={c}>{t(c)}</Chip>
                  ))}
                </BentoCard>
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
              <SafetyBadge key={tk} icon={icon} title={t(tk)} desc={t(d)} />
            ))}
          </div>
        </section>

        {/* ============ 004 FAQ ============ */}
        <section
          id="faq"
          className="scroll-mt-24 border-t border-slate-200 bg-slate-50"
        >
          <div className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
            <SectionHead
              index="004"
              tag={t("ld.nav.faq")}
              title={t("ld.faqTitle")}
              sub={t("ld.faqTag")}
            />
            <div className="mt-10 space-y-3">
              {[1, 2, 7, 3, 4, 5, 6].map((i) => (
                <FAQItem key={i} q={t(`ld.faq${i}q`)} a={t(`ld.faq${i}a`)} />
              ))}
            </div>
          </div>
        </section>

        {/* ============ CTA CUỐI ============ */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <div className="relative bg-emerald-600 p-8 text-center text-white shadow-xl shadow-emerald-600/20 sm:p-14">
            <h2 className="text-[28px] font-black uppercase leading-[1.1] tracking-[-0.02em] sm:text-5xl">
              {t("ld.ctaTitle")}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[15px] leading-7 text-emerald-50">
              {t("ld.ctaSub")}
            </p>
            <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
              <button
                onClick={() => navigate("/register")}
                className="inline-flex w-full items-center justify-center gap-2 bg-white px-6 py-4 text-[13px] font-extrabold uppercase tracking-[0.16em] text-emerald-700 transition hover:bg-emerald-50 sm:w-auto"
              >
                {t("ld.ctaReg")} <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="inline-flex w-full items-center justify-center border-2 border-white/60 px-6 py-4 text-[13px] font-extrabold uppercase tracking-[0.16em] text-white transition hover:bg-white/10 sm:w-auto"
              >
                {t("ld.login")}
              </button>
            </div>
            <Corners className="border-white" />
          </div>
        </section>
      </main>

      <LandingFooter />
      <BackToTop />
    </div>
  );
              }
