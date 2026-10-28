import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ArrowUp, ArrowUpRight, ChevronRight } from "lucide-react";
import { useI18n } from "../i18n/index.js";

export const scrollToId = (id) =>
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });

const NAV = [
  ["how", "ld.nav.how"],
  ["features", "ld.nav.features"],
  ["safety", "ld.nav.safety"],
  ["faq", "ld.nav.faq"],
];

const SHORT = { vi: "Đăng ký", en: "Sign up" };

/* Dùng chung màu với trang chủ: trang chủ khai báo --ac / --ac2,
   các trang khác (about, terms...) không có thì tự dùng xanh dương. */
const NAV_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@500;700&display=swap');
.nv-mono { font-family:'Roboto Mono',ui-monospace,monospace; text-transform:uppercase; letter-spacing:.14em; }
.nv-acc { color:var(--ac,#2563eb); }
.nv-br { position:relative; }
.nv-br::before, .nv-br::after { content:""; position:absolute; width:9px; height:9px; border:2px solid var(--ac,#2563eb); pointer-events:none; }
.nv-br::before { top:-2px; left:-2px; border-right:0; border-bottom:0; }
.nv-br::after { bottom:-2px; right:-2px; border-left:0; border-top:0; }
.nv-btn { background:var(--ac,#2563eb); color:#fff; transition:background .2s, transform .2s; }
.nv-btn:hover { background:var(--ac2,#1d4ed8); }
.nv-btn:active { transform:scale(.97); }
.nv-hov:hover { color:var(--ac,#2563eb); }
.nv-stroke { color:transparent; -webkit-text-stroke:1.5px var(--ac,#2563eb); }
`;
const NavStyle = () => <style>{NAV_CSS}</style>;

const Logo = () => (
  <span className="shrink-0 whitespace-nowrap text-[18px] font-extrabold tracking-tight text-slate-900 sm:text-[19px]">
    Nxx315 <span className="nv-acc">Studio</span>
  </span>
);

export function LandingHeader() {
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const go = (id) => {
    setOpen(false);
    // ở trang khác (ví dụ /about) thì về trang chủ trước
    if (document.getElementById(id)) scrollToId(id);
    else navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <NavStyle />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-5">
        <button
          onClick={() => {
            if (window.location.pathname === "/")
              window.scrollTo({ top: 0, behavior: "smooth" });
            else navigate("/");
          }}
          aria-label="Nxx315 Studio"
          className="shrink-0"
        >
          <Logo />
        </button>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map(([id, k]) => (
            <button
              key={id}
              onClick={() => go(id)}
              className="nv-mono nv-hov whitespace-nowrap text-[11.5px] font-bold text-slate-500 transition"
            >
              {t(k)}
            </button>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={() => setLang(lang === "vi" ? "en" : "vi")}
            className="inline-flex items-center gap-1.5 px-2 py-1.5 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-100"
            aria-label="Language"
          >
            <span className="text-[16px] leading-none">
              {lang === "vi" ? "🇻🇳" : "🇺🇸"}
            </span>
            <span className="nv-mono hidden text-[11px] sm:inline">
              {lang === "vi" ? "VI" : "EN"}
            </span>
          </button>

          <button
            onClick={() => navigate("/login")}
            className="nv-mono nv-hov hidden whitespace-nowrap px-3 py-2 text-[11.5px] font-bold text-slate-700 transition md:inline-flex"
          >
            {t("ld.login")}
          </button>

          <button
            onClick={() => navigate("/register")}
            className="nv-btn nv-br whitespace-nowrap px-3.5 py-2.5 text-[12px] font-extrabold uppercase tracking-[0.1em] sm:px-4"
          >
            <span className="sm:hidden">{SHORT[lang] || SHORT.vi}</span>
            <span className="hidden sm:inline">{t("ld.ctaReg")}</span>
          </button>

          <button
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            className="flex h-10 w-10 items-center justify-center border border-slate-200 text-slate-700 hover:bg-slate-100 md:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white px-5 pb-5 pt-2 md:hidden">
          {NAV.map(([id, k], i) => (
            <button
              key={id}
              onClick={() => go(id)}
              className="flex w-full items-center gap-3 border-b border-slate-100 py-3.5 text-left"
            >
              <span className="nv-mono w-8 text-[11px] font-bold text-slate-300">
                {String(i + 1).padStart(3, "0")}
              </span>
              <span className="flex-1 text-[15px] font-semibold text-slate-800">
                {t(k)}
              </span>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
          ))}
          <button
            onClick={() => {
              setOpen(false);
              navigate("/login");
            }}
            className="nv-br nv-mono nv-hov mt-5 w-full border border-slate-300 py-3 text-[12px] font-bold text-slate-800 transition"
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
    about: "Về chúng tôi",
    help: "Trung tâm trợ giúp",
    contact: "Liên hệ",
    chat: "Chat hỗ trợ",
    terms: "Điều khoản",
    privacy: "Quyền riêng tư",
    fraud: "Chống gian lận",
    redeem: "Chính sách đổi thưởng",
    rights: "Mọi quyền được bảo lưu.",
    top: "Lên đầu trang",
  },
  en: {
    product: "Product",
    support: "Support",
    legal: "Legal",
    guide: "Guide",
    about: "About us",
    help: "Help center",
    contact: "Contact",
    chat: "Support chat",
    terms: "Terms",
    privacy: "Privacy",
    fraud: "Anti-fraud",
    redeem: "Redemption policy",
    rights: "All rights reserved.",
    top: "Back to top",
  },
};

const FLink = ({ to, children }) => (
  <Link
    to={to}
    className="nv-hov group flex items-center gap-1 py-1.5 text-[14px] text-slate-500 transition"
  >
    {children}
    <ArrowUpRight
      size={13}
      className="opacity-0 transition group-hover:opacity-100"
    />
  </Link>
);

const FHead = ({ n, children }) => (
  <p className="nv-mono text-[11px] font-bold text-slate-900">
    <span className="mr-2 text-slate-300">{n}</span>
    {children}
  </p>
);

export function LandingFooter() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const f = FOOT[lang] || FOOT.vi;

  const go = (id) => {
    if (document.getElementById(id)) scrollToId(id);
    else navigate("/");
  };

  const contactCls =
    "nv-br nv-mono nv-hov inline-flex items-center gap-2 border border-slate-200 bg-white px-3.5 py-2.5 text-[11px] font-bold text-slate-600 transition";

  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-slate-50">
      <NavStyle />
      <div className="relative mx-auto max-w-6xl px-5 pt-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-[14px] leading-6 text-slate-500">
              {t("ld.heroSub")}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="https://zalo.me/0865245988"
                target="_blank"
                rel="noopener noreferrer"
                className={contactCls}
              >
                Zalo <ArrowUpRight size={13} />
              </a>
              <a href="mailto:nxx315hub@gmail.com" className={contactCls}>
                Email <ArrowUpRight size={13} />
              </a>
            </div>
          </div>

          <div>
            <FHead n="001">{f.product}</FHead>
            <div className="mt-2">
              {NAV.map(([id, k]) => (
                <button
                  key={id}
                  onClick={() => go(id)}
                  className="nv-hov block py-1.5 text-left text-[14px] text-slate-500 transition"
                >
                  {t(k)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <FHead n="002">{f.support}</FHead>
            <div className="mt-2">
              <FLink to="/about">{f.about}</FLink>
              <FLink to="/guide">{f.guide}</FLink>
              <FLink to="/help">{f.help}</FLink>
              <FLink to="/support">{f.chat}</FLink>
              <FLink to="/contact">{f.contact}</FLink>
            </div>
          </div>

          <div>
            <FHead n="003">{f.legal}</FHead>
            <div className="mt-2">
              <FLink to="/terms">{f.terms}</FLink>
              <FLink to="/privacy">{f.privacy}</FLink>
              <FLink to="/fraud">{f.fraud}</FLink>
              <FLink to="/redemption-policy">{f.redeem}</FLink>
            </div>
          </div>
        </div>

        <div className="nv-mono mt-10 flex flex-col gap-2 border-t border-slate-200 pt-6 text-[10.5px] font-bold text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} NXX315 Studio · {f.rights}
          </p>
          <p>
            Zalo 0865245988 · nxx315hub@gmail.com
          </p>
        </div>
      </div>

      {/* chữ lớn mờ ở đáy, trang trí */}
      <p
        aria-hidden="true"
        className="nv-stroke pointer-events-none mt-4 select-none text-center text-[24vw] font-black leading-[0.8] tracking-tighter opacity-[0.14] sm:text-[170px]"
      >
        NXX315
      </p>
    </footer>
  );
}

export function BackToTop() {
  const { lang } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const on = () => setShow(window.scrollY > 700);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={(FOOT[lang] || FOOT.vi).top}
      className={`nv-br nv-acc fixed bottom-5 right-4 z-40 flex h-11 w-11 items-center justify-center border border-slate-200 bg-white shadow-md transition hover:-translate-y-0.5 sm:right-6 ${
        show ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <ArrowUp size={18} />
    </button>
  );
    }
                         
