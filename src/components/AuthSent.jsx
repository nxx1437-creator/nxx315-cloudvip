// src/components/AuthSent.jsx
import React, { useEffect, useState } from "react";
import { useI18n } from "../i18n/index.js";
import { IconMail, IconSpinner } from "./AuthIcons.jsx";
import { AUTH_COPY } from "./authCopy.js";

const COOLDOWN = 60;

export default function AuthSent({ email, onChangeEmail, onResend }) {
  const { lang } = useI18n();
  const c = AUTH_COPY[lang === "en" ? "en" : "vi"];
  const [left, setLeft] = useState(COOLDOWN);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);

  const resend = async () => {
    if (left > 0 || busy) return;
    setBusy(true);
    setMsg(null);
    const err = await onResend();
    setBusy(false);
    if (err) {
      setMsg({ bad: true, text: err });
    } else {
      setMsg({ text: c.resent });
      setLeft(COOLDOWN);
    }
  };

  return (
    <div className="au-sent">
      <div className="au-sent-ic"><IconMail size={30} /></div>
      <h2>{c.sentTitle}</h2>
      <p>{c.sentTo}</p>
      <p className="mail">{email}</p>
      <p>{c.sentHint}</p>

      {msg && <p className={msg.bad ? "no" : "ok"}>{msg.text}</p>}

      <button type="button" className="au-btn2" onClick={resend} disabled={left > 0 || busy}>
        {busy ? <IconSpinner size={16} /> : left > 0 ? c.resendIn(left) : c.resend}
      </button>
      <button type="button" className="au-link" onClick={onChangeEmail}>
        {c.changeEmail}
      </button>
    </div>
  );
}
