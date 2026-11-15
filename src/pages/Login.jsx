import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import AuthInput from "../components/AuthInput.jsx";
import AuthNotice from "../components/AuthNotice.jsx";
import AuthSent from "../components/AuthSent.jsx";
import GoogleButton from "../components/GoogleButton.jsx";
import { AT, EMAIL_RE, mapAuthError, callbackUrl } from "../components/authText.js";
import { supabase } from "../lib/supabaseClient.js";
import { useI18n } from "../i18n/index.js";
import {
  IconMail,
  IconArrow,
  IconSpinner,
  IconWarning,
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
  const errText = error ? error.text ?? t(error.key, error.vars) : null;

  return (
    <AuthShell
      mode="login"
      title={t("login.title")}
      footer={
        <>
          {t("login.noAccount")}{" "}
          <Link to="/register" className="au-link">
            {t("login.signUp")}
          </Link>
        </>
      }
    >
      {/* Cảnh báo do trang khác chuyển về (trùng IP, hết phiên) */}
      {error && hideInlineError && (
        <AuthNotice tone="warn" icon={<IconWarning size={18} />}>
          {errText}
        </AuthNotice>
      )}

      {sent ? (
        <AuthSent
          email={email}
          onChangeEmail={() => setSent(false)}
          onResend={async () => {
            const { error: e } = await sendLink(email);
            return e ? mapAuthError(e, x).text : null;
          }}
        />
      ) : (
        <>
          <form onSubmit={handleSubmit} className="au-form">
            <AuthInput
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
            <p className="au-hint">{x.hintLogin}</p>

            <label className="au-check">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span>
                {t("login.agreePre")}
                <Link to="/terms" className="au-link">
                  {t("login.terms")}
                </Link>
              </span>
            </label>

            {error && !hideInlineError && (
              <AuthNotice tone="error">
                {errText}
                {error.register && (
                  <Link to="/register" className="au-link" style={{ marginLeft: 6 }}>
                    {x.goRegister}
                  </Link>
                )}
              </AuthNotice>
            )}

            <button type="submit" disabled={loading} className="au-btn">
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

          <div className="au-or">{t("login.orContinue")}</div>

          <div className="au-google">
            <GoogleButton
              text="signin_with"
              label={t("login.google")}
              onFallbackClick={handleGoogle}
              onError={(m) => setError({ text: m })}
            />
          </div>
        </>
      )}
    </AuthShell>
  );
        }
