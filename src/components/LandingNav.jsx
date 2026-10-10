import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useI18n } from "../i18n/index.js";
import { scrollToId } from "./LandingChrome.jsx";

const NAV = [
  ["how", "ld.nav.how"],
  ["features", "ld.nav.features"],
  ["safety", "ld.nav.safety"],
  ["faq", "ld.nav.faq"],
];

const Logo = () => (
  <span className="text-[19px] font-extrabold tracking-tight text-slate-900">
    Nxx315 <span className="text-blue-600">Studio</span>
  </span>
);

export function LandingHeader() {
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const go = (id) => {
    setOpen(false);
    scrollToId(id);
  };

  const langBtn = (
    <button
      onClick={() => setLang(lang === "vi" ? "en" : "vi")}
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-100"
    >
      <span className="text-[15px] leading-none">
        {lang === "vi" ? "🇻🇳" : "🇺🇸"}
      </span>
      {lang === "vi" ? "VI" : "EN"}
    </button>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Nxx315 Studio"
        >
          <Logo />
        </button>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map(([id, k]) => (
            <button
              key={id}
              onClick={() => go(id)}
              className="text-[14px] font-medium text-slate-600 transition hover:text-slate-900"
            >
              {t(k)}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          {langBtn}
          <button
            onClick={() => navigate("/login")}
            className="hidden px-3 py-2 text-[14px] font-semibold text-slate-700 transition hover:text-blue-600 md:inline-flex"
          >
            {t("ld.login")}
          </button>
          <button
            onClick={() => navigate("/register")}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-blue-700 active:scale-95"
          >
            {t("ld.ctaReg")}
          </button>
          <button
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 md:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white px-5 pb-5 pt-2 md:hidden">
          {NAV.map(([id, k]) => (
            <button
              key={id}
              onClick={() => go(id)}
              className="block w-full border-b border-slate-100 py-3.5 text-left text-[15px] font-medium text-slate-700"
            >
              {t(k)}
            </button>
          ))}
          <button
            onClick={() => {
              setOpen(false);
              navigate("/login");
            }}
            className="mt-4 w-full rounded-xl border border-slate-300 py-3 text-[15px] font-semibold text-slate-800"
          >
            {t("ld.login")}
          </button>
        </div>
      )}
    </header>
  );
}

const FOOT = {
  vi: {
    product: "Sản phẩm",
    support: "Hỗ trợ",
    legal: "Pháp lý",
    guide: "Hướng dẫn",
    help: "Trung tâm trợ giúp",
    contact: "Liên hệ",
    chat: "Chat hỗ trợ",
    terms: "Điều khoản",
    privacy: "Quyền riêng tư",
    fraud: "Chống gian lận",
    redeem: "Chính sách đổi thưởng",
    rights: "Mọi quyền được bảo lưu.",
  },
  en: {
    product: "Product",
    support: "Support",
    legal: "Legal",
    guide: "Guide",
    help: "Help center",
    contact: "Contact",
    chat: "Support chat",
    terms: "Terms",
    privacy: "Privacy",
    fraud: "Anti-fraud",
    redeem: "Redemption policy",
    rights: "All rights reserved.",
  },
};

const FLink = ({ to, children }) => (
  <Link
    to={to}
    className="block py-1.5 text-[14px] text-slate-500 transition hover:text-blue-600"
  >
    {children}
  </Link>
);

export function LandingFooter() {
  const { t, lang } = useI18n();
  const f = FOOT[lang] || FOOT.vi;

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-[14px] leading-6 text-slate-500">
              {t("ld.heroSub")}
            </p>
          </div>

          <div>
            <p className="text-[14px] font-semibold text-slate-900">
              {f.product}
            </p>
            <div className="mt-2">
              {NAV.map(([id, k]) => (
                <button
                  key={id}
                  onClick={() => scrollToId(id)}
                  className="block py-1.5 text-left text-[14px] text-slate-500 transition hover:text-blue-600"
                >
                  {t(k)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[14px] font-semibold text-slate-900">
              {f.support}
            </p>
            <div className="mt-2">
              <FLink to="/guide">{f.guide}</FLink>
              <FLink to="/help">{f.help}</FLink>
              <FLink to="/support">{f.chat}</FLink>
              <FLink to="/contact">{f.contact}</FLink>
            </div>
          </div>

          <div>
            <p className="text-[14px] font-semibold text-slate-900">
              {f.legal}
            </p>
            <div className="mt-2">
              <FLink to="/terms">{f.terms}</FLink>
              <FLink to="/privacy">{f.privacy}</FLink>
              <FLink to="/fraud">{f.fraud}</FLink>
              <FLink to="/redemption-policy">{f.redeem}</FLink>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-[13px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} NXX315 Studio. {f.rights}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a
              href="https://zalo.me/0865245988"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600"
            >
              Zalo 0865245988
            </a>
            <a
              href="mailto:nxx315hub@gmail.com"
              className="hover:text-blue-600"
            >
              nxx315hub@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
