// src/components/AuthShell.jsx
import React from "react";
import { Link } from "react-router-dom";
import useTheme from "../hooks/useTheme.js";
import { useI18n } from "../i18n/index.js";
import { AUTH_CSS } from "./AuthStyle.js";
import { AUTH_COPY } from "./authCopy.js";

export default function AuthShell({ mode = "login", title, subtitle, footer, children }) {
  useTheme(); // áp dụng chế độ sáng/tối đã chọn trong Hồ sơ
  const i18n = useI18n();
  const lang = i18n.lang === "en" ? "en" : "vi";
  const setLang = i18n.setLang || i18n.setLanguage || i18n.changeLanguage;
  const c = AUTH_COPY[lang];
  const side = c.side[mode] || c.side.login;

  return (
    <div className="au">
      <style>{AUTH_CSS}</style>
      <div className="au-bg" aria-hidden="true" />

      <header className="au-top">
        <Link to="/" className="au-wm">NXX315<em>.Studio</em></Link>
        <div className="au-top-r">
          <Link to="/" className="au-ghost">← {c.home}</Link>
          {typeof setLang === "function" && (
            <button
              type="button"
              className="au-ghost"
              onClick={() => setLang(lang === "vi" ? "en" : "vi")}
            >
              {c.langBtn}
            </button>
          )}
        </div>
      </header>

      <main className="au-main">
        <section className="au-side">
          <p className="au-eyebrow">+ {side.eyebrow}</p>
          <h2 className="au-big">
            {side.a}
            <em>{side.b}</em>
          </h2>
          <ul className="au-perks">
            {c.perks.map((p) => (
              <li key={p}><span className="au-dot" />{p}</li>
            ))}
          </ul>
        </section>

        <section>
          <div className="au-card">
            <h1 className="au-h1">{title}</h1>
            {subtitle ? <p className="au-sub">{subtitle}</p> : null}
            <div className="au-body">{children}</div>
            {footer ? <div className="au-foot">{footer}</div> : null}
          </div>
        </section>
      </main>
    </div>
  );
}
