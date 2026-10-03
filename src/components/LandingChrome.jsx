import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ArrowUp,
  MessageCircle,
  Send,
  Mail,
  Facebook,
} from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import { BrandLogo, Corners } from "./LandingParts.jsx";
import { useI18n } from "../i18n/index.js";

export const NAV = [
  ["how", "ld.nav.how"],
  ["features", "ld.nav.features"],
  ["safety", "ld.nav.safety"],
  ["faq", "ld.nav.faq"],
];

const LEGAL = [
  ["/terms", "ld.terms"],
  ["/privacy", "ld.privacy"],
  ["/fraud", "ld.fraud"],
  ["/redemption-policy", "ld.redeem"],
];

const SOCIAL_LINKS = [
  { icon: MessageCircle, label: "Zalo", href: "https://zalo.me/0865245988" },
  { icon: Send, label: "Telegram", href: "https://t.me/nxx315" },
  { icon: Mail, label: "Email", href: "mailto:nxx315hub@gmail.com" },
  { icon: Facebook, label: "Facebook", href: "https://facebook.com/nxx315" },
];

export const scrollToId = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export function LandingHeader() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);

  const go = (id) => {
    scrollToId(id);
    setMenu(false);
  };

  return (
    <header className="sticky top-0 z-50 px-3 pt-3">
      <div className="relative border border-white/10 bg-[#070D1A]/90 backdrop-blur">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <BrandLogo />
          </button>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map(([id, key]) => (
              <button
                key={id}
                onClick={() => go(id)}
                className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-slate-400 transition hover:text-emerald-400"
              >
                {t(key)}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:block">
              <LanguageSwitcher dark />
            </div>
            <button
              onClick={() => navigate("/login")}
              className="hidden px-3 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.15em] text-slate-300 transition hover:text-white lg:block"
            >
              {t("ld.login")}
            </button>
            <button
              onClick={() => navigate("/register")}
              className="relative bg-emerald-500 px-4 py-3 text-[11px] font-extrabold uppercase tracking-[0.15em] text-slate-950 transition hover:bg-emerald-400"
            >
              {t("ld.register")}
              <Corners className="border-slate-950/60" />
            </button>
            <button
              onClick={() => setMenu(!menu)}
              aria-label="Menu"
              className="flex h-11 w-11 items-center justify-center text-white md:hidden"
            >
              {menu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {menu && (
          <div className="border-t border-white/10 px-4 py-3 md:hidden">
            <div className="flex items-center justify-between py-2 sm:hidden">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
                Language
              </span>
              <LanguageSwitcher dark />
            </div>
            {NAV.map(([id, key]) => (
              <button
                key={id}
                onClick={() => go(id)}
                className="block w-full py-3.5 text-left font-mono text-xs font-bold uppercase tracking-[0.2em] text-slate-300"
              >
                {t(key)}
              </button>
            ))}
            <button
              onClick={() => navigate("/login")}
              className="mt-1 w-full border border-white/15 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-slate-200"
            >
              {t("ld.login")}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Top"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center border border-emerald-500/30 bg-[#070D1A]/95 text-emerald-400 backdrop-blur transition hover:bg-emerald-500/10"
    >
      <ArrowUp size={22} />
      <Corners />
    </button>
  );
}

export function LandingFooter() {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <footer className="border-t border-white/10 bg-[#03070F]">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-10 md:grid-cols-4">
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
                  className="flex h-10 w-10 items-center justify-center border border-white/10 text-slate-400 transition hover:border-emerald-500/50 hover:text-emerald-400"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
              {t("ld.footAbout")}
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              {NAV.map(([id, key]) => (
                <li key={id}>
                  <button
                    onClick={() => scrollToId(id)}
                    className="transition hover:text-white"
                  >
                    {t(key)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
              {t("ld.footLegal")}
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              {LEGAL.map(([path, key]) => (
                <li key={path}>
                  <button
                    onClick={() => navigate(path)}
                    className="transition hover:text-white"
                  >
                    {t(key)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 font-mono text-[11px] uppercase tracking-wider text-slate-600 sm:flex-row">
          <p>{t("ld.rights", { year: new Date().getFullYear() })}</p>
          <p>{t("ld.made")}</p>
        </div>
      </div>
    </footer>
  );
  }
