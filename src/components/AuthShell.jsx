// src/components/AuthShell.jsx
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun, ChevronDown } from "lucide-react";
import { useI18n } from "../i18n/index.js";
import { AUTH_CSS } from "./AuthStyle.js";
import { AUTH_COPY } from "./authCopy.js";
import { LOGO_STAR } from "./logoStar.js";

const LANGS = [
  ["vi", "🇻🇳", "Tiếng Việt"],
  ["en", "🇬🇧", "English"],
];

const DARK_Q = "(prefers-color-scheme: dark)";
const KEY = "theme_mode"; // cùng khóa với hooks/useTheme.js: "light" | "dark" | "system"

const isBrowser = typeof window !== "undefined";

const sysDark = () =>
  isBrowser && !!window.matchMedia && window.matchMedia(DARK_Q).matches;

const readMode = () => {
  if (!isBrowser) return "system";
  try {
    const v = localStorage.getItem(KEY);
    return v === "dark" || v === "light" || v === "system" ? v : "system";
  } catch {
    return "system";
  }
};

// SSR-safe layout effect (tránh warning "useLayoutEffect does nothing on the server")
const useIsoLayoutEffect = isBrowser ? useLayoutEffect : useEffect;

export default function AuthShell({ title, subtitle, footer, children }) {
  const i18n = useI18n();
  const lang = i18n.lang === "en" ? "en" : "vi";
  const setLang = i18n.setLang || i18n.setLanguage || i18n.changeLanguage;
  const c = AUTH_COPY[lang] || AUTH_COPY.vi || {};

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // lựa chọn đã lưu: đọc ngay lúc tạo trang nên không bị nháy sáng rồi mới tối
  const [mode, setMode] = useState(readMode);

  // chế độ của thiết bị, cập nhật trực tiếp khi thiết bị đổi
  const [sys, setSys] = useState(sysDark);
  useEffect(() => {
    if (!isBrowser || !window.matchMedia) return;
    const m = window.matchMedia(DARK_Q);
    const fn = () => setSys(m.matches);
    fn();
    if (m.addEventListener) m.addEventListener("change", fn);
    else if (m.addListener) m.addListener(fn);
    return () => {
      if (m.removeEventListener) m.removeEventListener("change", fn);
      else if (m.removeListener) m.removeListener(fn);
    };
  }, []);

  // light/dark là lựa chọn rõ ràng, system hoặc chưa chọn thì theo thiết bị
  const dark = mode === "dark" ? true : mode === "light" ? false : sys;

  // áp dụng ngay trước khi vẽ: class "dark" trên <html> + báo cho nút Google
  // cleanup: restore đúng trạng thái class "dark" trước khi mount thay vì để dính
  useIsoLayoutEffect(() => {
    if (!isBrowser) return;
    const el = document.documentElement;
    const prevClass = el.classList.contains("dark");
    const prevDs = el.dataset.auTheme;

    el.classList.toggle("dark", dark);
    el.dataset.auTheme = dark ? "dark" : "light";

    return () => {
      el.classList.toggle("dark", prevClass);
      if (prevDs === undefined) delete el.dataset.auTheme;
      else el.dataset.auTheme = prevDs;
    };
  }, [dark]);

  // bấm ra ngoài thì đóng menu ngôn ngữ + Esc để đóng (a11y)
  useEffect(() => {
    if (!open) return;
    const onPointer = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggleTheme = () => {
    const next = dark ? "light" : "dark";
    setMode(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* trình duyệt chặn lưu: vẫn đổi được trong lần này */
    }
  };

  const cur = LANGS.find((l) => l[0] === lang) || LANGS[0];

  return (
    <div className="au" data-theme={dark ? "dark" : "light"}>
      <style>{AUTH_CSS}</style>
      <div className="au-bg" aria-hidden="true" />

      <main className="au-main">
        <div className="au-top">
          <button
            type="button"
            className="au-tbtn theme"
            onClick={toggleTheme}
            aria-label={c.themeAria || (dark ? "Chuyển sang sáng" : "Chuyển sang tối")}
          >
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="au-lang" ref={menuRef}>
            <button
              type="button"
              className="au-tbtn"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-label={c.langAria || "Chọn ngôn ngữ"}
            >
              <span className="au-flag">{cur[1]}</span>
              <ChevronDown size={16} />
            </button>
            {open && (
              <div className="au-menu" role="listbox">
                {LANGS.map(([code, flag, name]) => (
                  <button
                    key={code}
                    type="button"
                    role="option"
                    aria-selected={code === lang}
                    className={"au-mi" + (code === lang ? " on" : "")}
                    onClick={() => {
                      if (typeof setLang === "function") setLang(code);
                      setOpen(false);
                    }}
                  >
                    <span className="au-flag">{flag}</span>
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="au-brand">
          <Link to="/" className="au-logo" aria-label="NXX315 Studio">
            <img className="au-star" src={LOGO_STAR} alt="" aria-hidden="true" />
            <span>NXX315 Studio</span>
          </Link>
          <p className="au-tag">{c.tagline}</p>
        </div>

        <div className="au-card">
          <h1 className="au-h1">{title}</h1>
          {subtitle ? <p className="au-sub">{subtitle}</p> : null}
          <div className="au-body">{children}</div>
          {footer ? <div className="au-foot">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
            }
