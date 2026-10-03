import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  UserPlus,
  Zap,
  Gift,
  Menu,
  X,
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
  MessageCircle,
  Send,
  Mail,
  Facebook,
} from "lucide-react";
import LanguageSwitcher from "../components/LanguageSwitcher.jsx";
import {
  BrandLogo,
  SectionHead,
  FeatureCard,
  SafetyBadge,
  FAQItem,
} from "../components/LandingParts.jsx";
import { useI18n } from "../i18n/index.js";

const NAV = [
  ["how", "ld.nav.how"],
  ["features", "ld.nav.features"],
  ["safety", "ld.nav.safety"],
  ["faq", "ld.nav.faq"],
];

const STEPS = [
  { n: "01", icon: UserPlus, t: "ld.s1t", d: "ld.s1d" },
  { n: "02", icon: Zap, t: "ld.s2t", d: "ld.s2d" },
  { n: "03", icon: Gift, t: "ld.s3t", d: "ld.s3d" },
];

const FEATURES = [
  { icon: CalendarCheck, t: "ld.f1t", d: "ld.f1d" },
  { icon: Flame, t: "ld.f2t", d: "ld.f2d" },
  { icon: Gamepad2, t: "ld.f3t", d: "ld.f3d" },
  { icon: TrendingUp, t: "ld.f4t", d: "ld.f4d" },
  { icon: Share2, t: "ld.f5t", d: "ld.f5d" },
  { icon: Trophy, t: "ld.f6t", d: "ld.f6d" },
];

const SAFETY = [
  { icon: Lock, t: "ld.b1t", d: "ld.b1d" },
  { icon: ShieldCheck, t: "ld.b2t", d: "ld.b2d" },
  { icon: Bot, t: "ld.b3t", d: "ld.b3d" },
  { icon: KeyRound, t: "ld.b4t", d: "ld.b4d" },
];

const SOCIAL_LINKS = [
  { icon: MessageCircle, label: "Zalo", href: "https://zalo.me/0865245988" },
  { icon: Send, label: "Telegram", href: "https://t.me/nxx315" },
  { icon: Mail, label: "Email", href: "mailto:nxx315hub@gmail.com" },
  { icon: Facebook, label: "Facebook", href: "https://facebook.com/nxx315" },
];

const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#087EA4] px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#087EA4]/25 transition hover:bg-[#066a8b] active:scale-[0.99]";
const ghostBtn =
  "inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50";

export default function CloudVIPLanding() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenu(false);
  };

  const legal = [
    ["/terms", "ld.terms"],
    ["/privacy", "ld.privacy"],
    ["/fraud", "ld.fraud"],
    ["/redemption-policy", "ld.redeem"],
  ];

  return (
    <div className="min-h-screen bg-white font-['Be_Vietnam_Pro',sans-serif] text-slate-900">
      {/* ============ NAVBAR ============ */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <BrandLogo />
          </button>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map(([id, key]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="text-sm font-medium text-slate-600 hover:text-slate-950"
              >
                {t(key)}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => navigate("/login")}
              className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:block"
            >
              {t("ld.login")}
            </button>
            <button
              onClick={() => navigate("/register")}
              className="hidden rounded-xl bg-[#087EA4] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#066a8b] sm:block"
            >
              {t("ld.register")}
            </button>
            <button
              onClick={() => setMenu(!menu)}
              aria-label="Menu"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-700 md:hidden"
            >
              {menu ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {menu && (
          <div className="border-t border-slate-200 bg-white px-5 py-3 md:hidden">
            {NAV.map(([id, key]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="block w-full px-2 py-3 text-left text-sm font-medium text-slate-700"
              >
                {t(key)}
              </button>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 pb-2">
              <button
                onClick={() => navigate("/login")}
                className="rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700"
              >
                {t("ld.login")}
              </button>
              <button
                onClick={() => navigate("/register")}
                className="rounded-xl bg-[#087EA4] py-3 text-sm font-semibold text-white"
              >
                {t("ld.register")}
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* ============ HERO ============ */}
        <section className="bg-gradient-to-b from-[#F1F8FA] to-white">
          <div className="mx-auto max-w-3xl px-5 pb-16 pt-14 text-center sm:pb-24 sm:pt-20">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#CDE8EF] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#087EA4] shadow-sm">
              <CheckCircle2 size={13} /> {t("ld.badge")}
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-950 sm:text-6xl">
              {t("ld.h1a")}
              <br />
              <span className="text-[#087EA4]">{t("ld.h1b")}</span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-slate-500 sm:text-base">
              {t("ld.heroSub")}
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button onClick={() => navigate("/register")} className={primaryBtn}>
                {t("ld.ctaStart")} <ArrowRight size={16} />
              </button>
              <button onClick={() => scrollTo("how")} className={ghostBtn}>
                {t("ld.ctaHow")}
              </button>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
              {["ld.check1", "ld.check2", "ld.check3"].map((k) => (
                <span key={k} className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#087EA4]" />
                  {t(k)}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:py-20">
          <SectionHead tag={t("ld.howTag")} title={t("ld.howTitle")} />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map(({ n, icon: Icon, t: tk, d }) => (
              <div
                key={n}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#087EA4] text-white">
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
        <section id="features" className="scroll-mt-20 border-y border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
            <SectionHead
              center
              tag={t("ld.featTag")}
              title={t("ld.featTitle")}
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon, t: tk, d }) => (
                <FeatureCard key={tk} icon={icon} title={t(tk)} desc={t(d)} />
              ))}
            </div>
          </div>
        </section>

        {/* ============ SAFETY ============ */}
        <section id="safety" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:py-20">
          <SectionHead
            center
            tag={t("ld.safeTag")}
            title={t("ld.safeTitle")}
            sub={t("ld.safeSub")}
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SAFETY.map(({ icon, t: tk, d }) => (
              <SafetyBadge key={tk} icon={icon} title={t(tk)} desc={t(d)} />
            ))}
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section id="faq" className="scroll-mt-20 border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
            <SectionHead center tag={t("ld.faqTag")} title={t("ld.faqTitle")} />
            <div className="mt-10 space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <FAQItem key={i} q={t(`ld.faq${i}q`)} a={t(`ld.faq${i}a`)} />
              ))}
            </div>
          </div>
        </section>

        {/* ============ CTA CUỐI ============ */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <div className="rounded-3xl border border-[#CDE8EF] bg-[#F1F8FA] p-8 text-center sm:p-14">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              {t("ld.ctaTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600 sm:text-base">
              {t("ld.ctaSub")}
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <button onClick={() => navigate("/register")} className={primaryBtn}>
                {t("ld.ctaReg")} <ArrowRight size={16} />
              </button>
              <button onClick={() => navigate("/login")} className={ghostBtn}>
                {t("ld.login")}
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <BrandLogo />
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
                {t("ld.footTag")}
              </p>
              <div className="mt-5 flex gap-2">
                {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                {t("ld.footAbout")}
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
                {NAV.map(([id, key]) => (
                  <li key={id}>
                    <button
                      onClick={() => scrollTo(id)}
                      className="hover:text-slate-900"
                    >
                      {t(key)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                {t("ld.footLegal")}
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
                {legal.map(([path, key]) => (
                  <li key={path}>
                    <button
                      onClick={() => navigate(path)}
                      className="hover:text-slate-900"
                    >
                      {t(key)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row">
            <p>{t("ld.rights", { year: new Date().getFullYear() })}</p>
            <p>{t("ld.made")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
                }
