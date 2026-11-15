// src/components/AuthShell.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun, ChevronDown } from "lucide-react";
import useTheme from "../hooks/useTheme.js";
import { useI18n } from "../i18n/index.js";
import { AUTH_CSS } from "./AuthStyle.js";
import { AUTH_COPY } from "./authCopy.js";

const readDark = () =>
  typeof document !== "undefined" && document.documentElement.classList.contains("dark");

const LANGS = [
  ["vi", "🇻🇳", "Tiếng Việt"],
  ["en", "🇬🇧", "English"],
];

export default function AuthShell({ title, subtitle, footer, children }) {
  const { setThemeMode } = useTheme();
  const i18n = useI18n();
  const lang = i18n.lang === "en" ? "en" : "vi";
  const setLang = i18n.setLang || i18n.setLanguage || i18n.changeLanguage;
  const c = AUTH_COPY[lang];

  const [dark, setDark] = useState(readDark);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // theo dõi chế độ sáng/tối hiện tại (class "dark" trên <html>)
  useEffect(() => {
    const mo = new MutationObserver(() => setDark(readDark()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  // bấm ra ngoài thì đóng menu ngôn ngữ
  useEffect(() => {
    if (!open) return;
    const off = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", off);
    return () => document.removeEventListener("pointerdown", off);
  }, [open]);

  const toggleTheme = () => {
    if (typeof setThemeMode === "function") setThemeMode(dark ? "light" : "dark");
  };

  const cur = LANGS.find((l) => l[0] === lang) || LANGS[0];

  return (
    <div className="au">
      <style>{AUTH_CSS}</style>
      <div className="au-bg" aria-hidden="true" />

      <main className="au-main">
        <div className="au-top">
          <button
            type="button"
            className="au-tbtn theme"
            onClick={toggleTheme}
            aria-label={c.themeAria}
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
          <Link to="/" className="au-logo">
            NXX315<em>.Studio</em>
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
