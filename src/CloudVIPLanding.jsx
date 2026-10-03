import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
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
  FAQItem,
  HeroPreview,
  primaryBtn,
  ghostBtn,
} from "./components/LandingParts.jsx";
import {
  LandingHeader,
  LandingFooter,
  scrollToId,
} from "./components/LandingChrome.jsx";
import { useI18n } from "./i18n/index.js";

const STEPS = [
  { n: "01", icon: UserPlus, t: "ld.s1t", d: "ld.s1d" },
  { n: "02", icon: Zap, t: "ld.s2t", d: "ld.s2d" },
  { n: "03", icon: Gift, t: "ld.s3t", d: "ld.s3d" },
];

const BENTO = [
  {
    icon: ShoppingBag,
    tint: "amber",
    t: "ld.f7t",
    d: "ld.f7d",
    span: "sm:col-span-2 lg:col-span-2",
    chips: ["ld.chipRobux", "ld.chipPhone", "ld.chipGift"],
  },
  {
    icon: CalendarCheck,
    tint: "teal",
    t: "ld.f1t",
    d: "ld.f1d",
    span: "sm:col-span-2 lg:col-span-2",
  },
  { icon: Flame, tint: "rose", t: "ld.f2t", d: "ld.f2d" },
  {
    icon: Gamepad2,
    tint: "violet",
    t: "ld.f3t",
    d: "ld.f3d",
    chips: ["dash.wheel", "dash.scratch", "dash.dice"],
  },
  { icon: TrendingUp, tint: "emerald", t: "ld.f4t", d: "ld.f4d" },
  { icon: Trophy, tint: "amber", t: "ld.f6t", d: "ld.f6d" },
  { icon: Share2, tint: "sky", t: "ld.f5t", d: "ld.f5d" },
  { icon: Wallet, tint: "teal", t: "ld.f8t", d: "ld.f8d" },
  { icon: Bell, tint: "rose", t: "ld.f9t", d: "ld.f9d" },
  { icon: Smartphone, tint: "violet", t: "ld.f10t", d: "ld.f10d" },
];

const SAFETY = [
  { icon: Lock, t: "ld.b1t", d: "ld.b1d" },
  { icon: ShieldCheck, t: "ld.b2t", d: "ld.b2d" },
  { icon: Bot, t: "ld.b3t", d: "ld.b3d" },
  { icon: KeyRound, t: "ld.b4t", d: "ld.b4d" },
];

export default function CloudVIPLanding() {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-['Be_Vietnam_Pro',sans-serif] text-slate-900">
      <LandingHeader />

      <main>
        {/* ============ HERO ============ */}
        <section className="overflow-hidden bg-gradient-to-b from-teal-50 via-white to-white">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-12 pt-8 lg:grid-cols-[1.05fr_.95fr] lg:pb-20 lg:pt-16">
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white px-3.5 py-1.5 text-xs font-semibold text-teal-700 shadow-sm">
                <CheckCircle2 size={13} /> {t("ld.badge")}
              </span>

              <h1 className="mt-5 text-[34px] font-extrabold leading-[1.12] tracking-tight text-slate-950 sm:text-6xl">
                {t("ld.h1a")}
                <br />
                <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
                  {t("ld.h1b")}
                </span>
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-slate-500 sm:text-base lg:mx-0">
                {t("ld.heroSub")}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-2.5 sm:flex sm:justify-center lg:justify-start">
                <button
                  onClick={() => navigate("/register")}
                  className={`${primaryBtn} px-3 text-[13px] sm:px-6 sm:text-sm`}
                >
                  {t("ld.ctaStart")} <ArrowRight size={15} />
                </button>
                <button
                  onClick={() => scrollToId("how")}
                  className={`${ghostBtn} px-3 text-[13px] sm:px-6 sm:text-sm`}
                >
                  {t("ld.nav.how")}
                </button>
              </div>

              <div className="mt-7 hidden flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-slate-500 sm:flex sm:justify-center lg:justify-start">
                {["ld.check1", "ld.check2", "ld.check3"].map((k) => (
                  <span key={k} className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-teal-600" />
                    {t(k)}
                  </span>
                ))}
              </div>
            </div>

            <HeroPreview />
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section
          id="how"
          className="mx-auto max-w-6xl scroll-mt-20 px-5 py-14 sm:py-20"
        >
          <SectionHead tag={t("ld.howTag")} title={t("ld.howTitle")} />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map(({ n, icon: Icon, t: tk, d }) => (
              <div
                key={n}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white">
                    <Icon size={18} />
                  </div>
                  <span className="text-2xl font-extrabold text-slate-200">
                    {n}
                  </span>
                </div>
                <h3 className="mt-5 text-base font-bold text-slate-950">
                  {t(tk)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{t(d)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============ FEATURES ============ */}
        <section
          id="features"
          className="scroll-mt-20 border-y border-slate-200 bg-slate-50"
        >
          <div className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
            <SectionHead
              center
              tag={t("ld.bentoTag")}
              title={t("ld.bentoTitle")}
              sub={t("ld.bentoSub")}
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {BENTO.map(({ icon, tint, t: tk, d, span, chips }) => (
                <BentoCard
                  key={tk}
                  icon={icon}
                  tint={tint}
                  title={t(tk)}
                  desc={t(d)}
                  className={span || ""}
                >
                  {chips?.map((c) => (
                    <Chip key={c}>{t(c)}</Chip>
                  ))}
                </BentoCard>
              ))}
            </div>
            <p className="mt-6 text-center text-xs text-slate-400">
              {t("ld.storeNote")}
            </p>
          </div>
        </section>

        {/* ============ SAFETY ============ */}
        <section
          id="safety"
          className="mx-auto max-w-6xl scroll-mt-20 px-5 py-14 sm:py-20"
        >
          <SectionHead
            center
            tag={t("ld.safeTag")}
            title={t("ld.safeTitle")}
            sub={t("ld.safeSub")}
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SAFETY.map(({ icon, t: tk, d }) => (
              <SafetyBadge key={tk} icon={icon} title={t(tk)} desc={t(d)} />
            ))}
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section
          id="faq"
          className="scroll-mt-20 border-t border-slate-200 bg-slate-50"
        >
          <div className="mx-auto max-w-3xl px-5 py-14 sm:py-20">
            <SectionHead center tag={t("ld.faqTag")} title={t("ld.faqTitle")} />
            <div className="mt-8 space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <FAQItem key={i} q={t(`ld.faq${i}q`)} a={t(`ld.faq${i}a`)} />
              ))}
            </div>
          </div>
        </section>

        {/* ============ CTA CUỐI ============ */}
        <section className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
          <div className="rounded-3xl bg-gradient-to-br from-teal-600 to-emerald-500 p-8 text-center text-white shadow-xl shadow-teal-600/20 sm:p-14">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {t("ld.ctaTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/85 sm:text-base">
              {t("ld.ctaSub")}
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={() => navigate("/register")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-teal-700 shadow-md transition hover:bg-teal-50 active:scale-[0.99]"
              >
                {t("ld.ctaReg")} <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center justify-center rounded-xl border border-white/40 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {t("ld.login")}
              </button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
    }
