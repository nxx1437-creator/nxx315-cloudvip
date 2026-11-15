import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import AuthInput from "../components/AuthInput.jsx";
import AuthNotice from "../components/AuthNotice.jsx";
import AuthSent from "../components/AuthSent.jsx";
import GoogleButton from "../components/GoogleButton.jsx";
import { AT, EMAIL_RE, mapAuthError, callbackUrl } from "../components/authText.js";
import {
  IconMail,
  IconGift,
  IconArrow,
  IconSpinner,
  IconWarning,
  IconShield,
} from "../components/AuthIcons.jsx";
import { supabase } from "../lib/supabaseClient.js";
import { getFingerprint } from "../lib/fingerprint.js";
import { useI18n } from "../i18n/index.js";

export default function Register() {
  const { t, lang } = useI18n();
  const x = AT[lang] || AT.vi;

  // Đọc mã ref từ URL
  const [searchParams] = useSearchParams();
  const refFromUrl = searchParams.get("ref") || "";

  const [form, setForm] = useState({
    email: "",
    referral: refFromUrl.toUpperCase(),
  });

  // error = { key, vars } hoặc { text }
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const [ipBlocked, setIpBlocked] = useState(false);
  const [ipChecking, setIpChecking] = useState(true);
  const [ipChecked, setIpChecked] = useState(false);
  const [ipError, setIpError] = useState(false);
  const [blockedEmail, setBlockedEmail] = useState(null);

  const fail = (key, vars) => {
    setError({ key, vars });
  };

  // Chỉ gửi fingerprint — server tự lấy IP
  const checkIp = async () => {
    if (ipChecking && ipChecked) return;
    if (ipChecked && !ipError) return;

    setIpChecking(true);
    setIpError(false);

    try {
      let fp = null;
      try {
        fp = await getFingerprint();
      } catch (e) {
        console.warn("[checkIp] Không lấy được fingerprint:", e);
      }

      if (!fp) {
        console.warn("[checkIp] Không lấy được fingerprint");
        setIpError(true);
        return;
      }

      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/check-ip-registered`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ fingerprint: fp }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      if (data?.exists === true) {
        setIpBlocked(true);
        setBlockedEmail(data.masked_email || null);
      } else {
        setIpBlocked(false);
      }
    } catch (err) {
      console.warn("[checkIp] Lỗi:", err.message);
      setIpError(true);
    } finally {
      setIpChecking(false);
      setIpChecked(true);
    }
  };

  useEffect(() => {
    checkIp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dùng chung cho submit + Google: trả true nếu bị chặn
  const deviceGuard = () => {
    if (ipChecking) {
      fail("reg.err.waitCheck");
      return true;
    }
    if (ipError) {
      fail("reg.err.checkFail");
      return true;
    }
    if (ipBlocked) {
      fail("reg.err.deviceUsed");
      return true;
    }
    return false;
  };

  // Gửi liên kết: tạo tài khoản nếu chưa có, đã có thì đăng nhập
  const sendLink = async (addr) => {
    let fp = null;
    try {
      fp = await getFingerprint();
    } catch (e) {
      console.warn("[register] fingerprint:", e);
    }
    return supabase.auth.signInWithOtp({
      email: addr,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: callbackUrl(),
        // Lưu vào hồ sơ để trang nhận liên kết hoàn tất việc đăng ký (IP, mã giới thiệu)
        data: {
          username: addr.split("@")[0],
          device_fingerprint: fp || null,
          referral: form.referral.trim().toUpperCase() || null,
        },
      },
    });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (deviceGuard()) return;

    const addr = form.email.trim().toLowerCase();
    if (!addr) {
      fail("err.fill");
      return;
    }
    if (!EMAIL_RE.test(addr)) {
      fail("reg.err.email");
      return;
    }

    setError(null);
    setLoading(true);
    const { error: authError } = await sendLink(addr);
    setLoading(false);

    if (authError) {
      const msg = (authError.message || "").toLowerCase();
      if (msg.includes("ip_already_registered")) fail("reg.err.deviceUsed");
      else setError(mapAuthError(authError, x));
      return;
    }
    setForm((f) => ({ ...f, email: addr }));
    setSent(true);
  };

  const handleGoogle = async () => {
    setError(null);
    if (deviceGuard()) return;

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (authError) setError({ text: authError.message });
  };

  // Chỉ hiển thị 1 cảnh báo duy nhất
  const renderAlert = () => {
    if (ipError) {
      return (
        <AuthNotice
          tone="warn"
          icon={<IconWarning size={18} />}
          title={t("reg.checkTitle")}
          action={
            <button
              type="button"
              className="au-mini"
              onClick={() => {
                setIpChecked(false);
                setIpError(false);
                checkIp();
              }}
            >
              {t("reg.retry")}
            </button>
          }
        >
          {t("reg.checkBody")}
        </AuthNotice>
      );
    }

    if (ipBlocked) {
      return (
        <AuthNotice
          tone="bad"
          icon={<IconShield size={18} />}
          title={t("reg.blockedTitle")}
          action={
            <Link to="/login" className="au-mini">
              {t("reg.loginOld")}
              <IconArrow size={13} />
            </Link>
          }
        >
          {t("reg.blockedBody", { email: blockedEmail || t("reg.prevAccount") })}
        </AuthNotice>
      );
    }

    return (
      <AuthNotice tone="info" icon={<IconWarning size={16} />}>
        {t("reg.info")}
      </AuthNotice>
    );
  };

  const blocked = ipBlocked || ipError || ipChecking;

  return (
    <AuthShell
      mode="register"
      title={t("reg.title")}
      subtitle={t("reg.subtitle")}
      footer={
        <>
          {t("reg.haveAccount")}{" "}
          <Link to="/login" className="au-link">
            {t("reg.signIn")}
          </Link>
        </>
      }
    >
      {renderAlert()}

      {sent ? (
        <AuthSent
          email={form.email}
          onChangeEmail={() => setSent(false)}
          onResend={async () => {
            const { error: e } = await sendLink(form.email);
            return e ? mapAuthError(e, x).text : null;
          }}
        />
      ) : (
        <>
          <form onSubmit={handleSubmit} className="au-form">
            <AuthInput
              id="reg-email"
              label={t("login.email")}
              icon={<IconMail size={18} />}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder={t("login.emailPh")}
              autoComplete="email"
              disabled={ipChecking}
            />

            <AuthInput
              id="reg-referral"
              label={t("reg.referral")}
              labelRight={<span style={{ fontWeight: 400, opacity: 0.8 }}>{t("common.optional")}</span>}
              icon={<IconGift size={18} />}
              variant="gift"
              uppercase
              value={form.referral}
              onChange={(e) => setForm({ ...form, referral: e.target.value.toUpperCase() })}
              placeholder={t("reg.referralPh")}
              maxLength={10}
              disabled={ipChecking}
            />

            <p className="au-hint">{x.hintReg}</p>

            {error && (
              <AuthNotice tone="error" pre>
                {error.text ?? t(error.key, error.vars)}
              </AuthNotice>
            )}

            <button type="submit" disabled={loading || blocked} className="au-btn">
              {loading ? (
                <>
                  <IconSpinner size={18} />
                  {x.sending}
                </>
              ) : ipChecking ? (
                <>
                  <IconSpinner size={18} />
                  {t("reg.checking")}
                </>
              ) : ipError ? (
                t("reg.deviceError")
              ) : ipBlocked ? (
                t("reg.deviceUsed")
              ) : (
                <>
                  {x.sendReg}
                  <IconArrow size={18} />
                </>
              )}
            </button>

            <p className="au-center">
              {t("reg.agree")}
              <Link to="/terms" className="au-link">
                {t("login.terms")}
              </Link>
            </p>
          </form>

          <div className="au-or">{t("login.orContinue")}</div>

          <div className={"au-google" + (blocked ? " off" : "")}>
            <GoogleButton
              text="signup_with"
              label={t("reg.google")}
              onFallbackClick={handleGoogle}
              onError={(m) => setError({ text: m })}
            />
          </div>
        </>
      )}
    </AuthShell>
  );
    }
