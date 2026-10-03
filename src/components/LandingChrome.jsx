import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, MessageCircle, Send, Mail, Facebook } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import { BrandLogo } from "./LandingParts.jsx";
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
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <BrandLogo />
        </button>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map(([id, key]) => (
            <button
              key={id}
              onClick={() => go(id)}
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
            className="hidden rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 sm:block"
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
              onClick={() => go(id)}
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
              className="rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white"
            >
              {t("ld.register")}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export function LandingFooter() {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
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
                    onClick={() => scrollToId(id)}
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
              {LEGAL.map(([path, key]) => (
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
  );
   }
