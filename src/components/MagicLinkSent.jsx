import React, { useEffect, useState } from "react";
import { MailCheck } from "lucide-react";
import { IconSpinner } from "./AuthIcons.jsx";
import { useI18n } from "../i18n/index.js";
import { AT } from "./authText.js";

// Hiện sau khi đã gửi liên kết. onResend() trả về chuỗi lỗi hoặc null.
export default function MagicLinkSent({ email, onResend, onChangeEmail }) {
  const { lang } = useI18n();
  const x = AT[lang] || AT.vi;
  const [left, setLeft] = useState(60);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (left <= 0) return undefined;
    const id = setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);

  const resend = async () => {
    setBusy(true);
    setErr("");
    const msg = await onResend();
    setBusy(false);
    if (msg) setErr(msg);
    else setLeft(60);
  };

  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <MailCheck size={30} />
      </div>
      <h2 className="mt-4 text-[20px] font-extrabold text-slate-900">{x.sentTitle}</h2>
      <p className="mt-2 text-[14px] leading-6 text-slate-500">{x.sentTo}</p>
      <p className="mt-1 break-all text-[15px] font-bold text-slate-900">{email}</p>
      <p className="mx-auto mt-4 max-w-sm rounded-2xl bg-emerald-50 px-4 py-3 text-[13px] leading-5 text-emerald-800">
        {x.sentNote}
      </p>
      <p className="mt-3 text-[12px] text-slate-400">{x.spam}</p>

      {err && (
        <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-600">
          {err}
        </p>
      )}

      <button
        type="button"
        onClick={resend}
        disabled={left > 0 || busy}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-[14px] font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? <IconSpinner size={16} /> : null}
        {left > 0 ? x.resendIn.replace("{s}", left) : x.resend}
      </button>
      <button
        type="button"
        onClick={onChangeEmail}
        className="mt-3 text-[13px] font-semibold text-emerald-700 hover:underline"
      >
        {x.other}
      </button>
    </div>
  );
}
