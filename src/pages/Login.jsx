import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import AuthField from "../components/AuthField.jsx";
import LoginAlerts from "../components/LoginAlerts.jsx";
import MagicLinkSent from "../components/MagicLinkSent.jsx";
import { AT, EMAIL_RE, mapAuthError, callbackUrl } from "../components/authText.js";
import { supabase } from "../lib/supabaseClient.js";
import { useI18n } from "../i18n/index.js";
import {
  IconMail,
  IconArrow,
  IconSpinner,
  IconGoogle,
} from "../components/AuthIcons.jsx";

export default function Login() {
  const { t, lang } = useI18n();
  const x = AT[lang] || AT.vi;
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(true);
  // error = { key, vars } | { text, register }
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState("error");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // Lỗi do trang khác chuyển về (liên kết hết hạn, trùng IP, hết phiên)
  useEffect(() => {
    const p = searchParams.get("error");
    if (p === "ip_duplicate") {
      setError({ key: "err.ipDuplicate" });
      setErrorType("ip_duplicate");
    } else if (p === "session_expired") {
      setError({ key: "err.sessionExpired" });
      setErrorType("session_expired");
    } else if (p === "link_expired") {
      setError({ text: x.errExpired });
      setErrorType("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Chỉ cho người đã có tài khoản; người mới đăng ký ở trang Đăng ký (có kiểm tra thiết bị)
  const sendLink = (addr) =>
    supabase.auth.signInWithOtp({
      email: addr,
      options: { shouldCreateUser: false, emailRedirectTo: callbackUrl() },
    });

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const addr = email.trim().toLowerCase();

    if (!addr) {
      setError({ key: "err.fill" });
      setErrorType("error");
      return;
    }
    if (!EMAIL_RE.test(addr)) {
      setError({ text: x.errEmail });
      setErrorType("error");
      return;
    }
    if (!agreed) {
      setError({ key: "err.agree" });
      setErrorType("error");
      return;
    }

    setError(null);
    setErrorType("error");
    setLoading(true);
    const { error: authError } = await sendLink(addr);
    setLoading(false);

    if (authError) {
      setError(mapAuthError(authError, x));
      return;
    }
    setEmail(addr);
    setSent(true);
  };

  const handleGoogle = async () => {
    setError(null);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (authError) setError({ text: authError.message });
  };

  const hideInlineError = ["ip_duplicate", "session_expired"].includes(errorType);

  return (
    <AuthLayout
      title={t("login.title")}
      footer={
        <>
          {t("login.noAccount")}{" "}
          <Link to="/register" className="font-bold text-emerald-700 hover:underline">
            {t("login.signUp")}
          </Link>
        </>
      }
    >
      <LoginAlerts
        errorType={errorType}
        isLocked={false}
        remainingSec={0}
        maxAttempts={5}
        ipInfo={null}
        formatTime={(s) => String(s)}
      />

      {sent ? (
        <MagicLinkSent
          email={email}
          onChangeEmail={() => setSent(false)}
          onResend={async () => {
            const { error: e } = await sendLink(email);
            return e ? mapAuthError(e, x).text : null;
          }}
        />
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <AuthField
              id="login-email"
              label={t("login.email")}
              icon={<IconMail size={18} />}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("login.emailPh")}
              autoComplete="email"
              disabled={loading}
            />
            <p className="text-[12.5px] leading-5 text-slate-500">{x.hintLogin}</p>

            <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-500">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 rounded accent-emerald-600"
              />
              <span>
                {t("login.agreePre")}
                <Link
                  to="/terms"
                  className="font-semibold text-emerald-700 underline decoration-emerald-300 underline-offset-2"
                >
                  {t("login.terms")}
                </Link>
              </span>
            </label>

            {error && !hideInlineError && (
              <p className="rounded-2xl bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-600">
                {error.text ?? t(error.key, error.vars)}
                {error.register && (
                  <Link to="/register" className="ml-1.5 font-bold underline">
                    {x.goRegister}
                  </Link>
                )}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <IconSpinner size={18} />
                  {x.sending}
                </>
              ) : (
                <>
                  {x.sendLogin}
                  <IconArrow size={18} />
                </>
              )}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                {t("login.orContinue")}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-3 text-[14px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
          >
            <IconGoogle size={20} />
            {t("login.google")}
          </button>
        </>
      )}
    </AuthLayout>
  );
}

            
          
