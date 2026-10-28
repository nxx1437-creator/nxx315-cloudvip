import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import AuthField from "../components/AuthField.jsx";
import MagicLinkSent from "../components/MagicLinkSent.jsx";
import { AT, EMAIL_RE, mapAuthError, callbackUrl } from "../components/authText.js";
import {
  IconMail,
  IconGift,
  IconArrow,
  IconSpinner,
  IconWarning,
  IconShield,
  IconGoogle,
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
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 shrink-0 text-amber-600">
              <IconWarning size={18} />
            </span>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-amber-800">
                {t("reg.checkTitle")}
              </p>
              <p className="mt-1 text-[12px] leading-5 text-amber-700">
                {t("reg.checkBody")}
              </p>
              <button
                type="button"
                onClick={() => {
                  setIpChecked(false);
                  setIpError(false);
                  checkIp();
                }}
                className="mt-3 rounded-lg bg-amber-500 px-4 py-2 text-[12px] font-bold text-white transition hover:bg-amber-600"
              >
                {t("reg.retry")}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (ipBlocked) {
      return (
        <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 shrink-0 text-rose-600">
              <IconShield size={18} />
            </span>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-rose-800">
                {t("reg.blockedTitle")}
              </p>
              <p className="mt-1 text-[12px] leading-5 text-rose-700">
                {t("reg.blockedBody", {
                  email: blockedEmail || t("reg.prevAccount"),
                })}
              </p>
              <Link
                to="/login"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-rose-500 px-4 py-2 text-[12px] font-bold text-white transition hover:bg-rose-600"
              >
                {t("reg.loginOld")}
                <IconArrow size={13} />
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <p className="mb-5 flex items-start gap-2 text-[12px] leading-5 text-slate-500">
        <span className="mt-0.5 shrink-0">
          <IconWarning size={14} />
        </span>
        <span>{t("reg.info")}</span>
      </p>
    );
  };

  const blocked = ipBlocked || ipError || ipChecking;

  return (
    <AuthLayout
      title={t("reg.title")}
      subtitle={t("reg.subtitle")}
      footer={
        <>
          {t("reg.haveAccount")}{" "}
          <Link to="/login" className="font-bold text-emerald-700 hover:underline">
            {t("reg.signIn")}
          </Link>
        </>
      }
    >
      {renderAlert()}

      {sent ? (
        <MagicLinkSent
          email={form.email}
          onChangeEmail={() => setSent(false)}
          onResend={async () => {
            const { error: e } = await sendLink(form.email);
            return e ? mapAuthError(e, x).text : null;
          }}
        />
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <AuthField
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

            <AuthField
              id="reg-referral"
              label={t("reg.referral")}
              labelRight={
                <span className="text-[11px] font-medium text-slate-400">
                  {t("common.optional")}
                </span>
              }
              icon={<IconGift size={18} />}
              variant="gift"
              uppercase
              value={form.referral}
              onChange={(e) =>
                setForm({ ...form, referral: e.target.value.toUpperCase() })
              }
              placeholder={t("reg.referralPh")}
              maxLength={10}
              disabled={ipChecking}
            />

            <p className="text-[12.5px] leading-5 text-slate-500">{x.hintReg}</p>

            {error && (
              <div className="whitespace-pre-line rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-600">
                {error.text ?? t(error.key, error.vars)}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || blocked}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
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

            <p className="text-center text-[12px] leading-5 text-slate-500">
              {t("reg.agree")}
              <Link
                to="/terms"
                className="font-semibold text-emerald-700 underline decoration-emerald-300 underline-offset-2"
              >
                {t("login.terms")}
              </Link>
            </p>
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

          <div className={blocked ? "pointer-events-none opacity-50" : ""}>
            <button
              type="button"
              onClick={handleGoogle}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-3 text-[14px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
            >
              <IconGoogle size={20} />
              {t("reg.google")}
            </button>
          </div>
        </>
      )}
    </AuthLayout>
  );
    }
    
