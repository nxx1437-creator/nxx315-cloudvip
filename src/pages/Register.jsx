import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import AuthField from "../components/AuthField.jsx";
import {
  IconUser,
  IconMail,
  IconLock,
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
  const { t } = useI18n();
  const navigate = useNavigate();

  // Đọc mã ref từ URL
  const [searchParams] = useSearchParams();
  const refFromUrl = searchParams.get("ref") || "";

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    referral: refFromUrl.toUpperCase(),
  });

  // error = { key, vars } hoặc { raw } -> dịch lúc hiển thị
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState("error");
  const [loading, setLoading] = useState(false);

  const [ipBlocked, setIpBlocked] = useState(false);
  const [ipChecking, setIpChecking] = useState(true);
  const [ipChecked, setIpChecked] = useState(false);
  const [ipError, setIpError] = useState(false);
  const [blockedEmail, setBlockedEmail] = useState(null);

  const fail = (key, vars, type = "error") => {
    setError({ key, vars });
    setErrorType(type);
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
      fail("reg.err.checkFail", null, "ip_error");
      return true;
    }
    if (ipBlocked) {
      fail("reg.err.deviceUsed", null, "ip_blocked");
      return true;
    }
    return false;
  };

  const emailExists = () =>
    fail("reg.err.emailExists", { email: form.email }, "email_exists");

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (deviceGuard()) return;

    if (!form.email || !form.password) {
      fail("err.fill");
      return;
    }
    if (form.password.length < 6) {
      fail("reg.err.pwShort");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      fail("reg.err.email");
      return;
    }

    setError(null);
    setErrorType("error");
    setLoading(true);

    try {
      const fp = await getFingerprint();

      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            username: form.username || form.email.split("@")[0],
            device_fingerprint: fp || null,
          },
        },
      });

      if (authError) {
        setLoading(false);
        const msg = authError.message?.toLowerCase() || "";

        if (
          msg.includes("already registered") ||
          msg.includes("already been registered") ||
          msg.includes("user already exists") ||
          msg.includes("email address is already") ||
          msg.includes("email already exists")
        ) {
          emailExists();
        } else if (msg.includes("ip_already_registered")) {
          fail("reg.err.deviceUsed", null, "ip_blocked");
        } else if (msg.includes("invalid email")) {
          fail("reg.err.email");
        } else if (msg.includes("password")) {
          fail("reg.err.weakPw");
        } else if (msg.includes("rate limit") || msg.includes("too many")) {
          fail("reg.err.rate");
        } else {
          setError({ raw: authError.message });
        }
        return;
      }

      if (data.user) {
        const isExistingUser =
          !data.user.identities || data.user.identities.length === 0;

        if (isExistingUser) {
          setLoading(false);
          emailExists();
          return;
        }

        // Lưu IP + fingerprint + device info
        try {
          const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
          const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

          const saveRes = await fetch(
            `${SUPABASE_URL}/functions/v1/save-registration`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                apikey: SUPABASE_ANON_KEY,
              },
              body: JSON.stringify({
                userId: data.user.id,
                fingerprint: fp,
                screen_resolution: `${window.screen.width}x${window.screen.height}`,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              }),
            }
          );

          if (saveRes.ok) {
            console.log("Đã lưu IP + fingerprint + device info");
          } else {
            console.warn("save-registration trả về lỗi:", saveRes.status);
          }
        } catch (err) {
          console.warn("Không lưu được IP:", err);
        }

        // Xử lý mã giới thiệu
        if (form.referral.trim()) {
          try {
            const { data: refResult, error: refError } = await supabase.rpc(
              "apply_referral_code",
              { p_code: form.referral.trim().toUpperCase() }
            );

            if (refError) {
              console.warn("Apply referral error:", refError);
            } else if (
              refResult?.[0]?.success === false ||
              refResult?.success === false
            ) {
              console.warn("Referral fail:", refResult);
            }
          } catch (err) {
            console.warn("Referral exception:", err);
          }
        }

        setLoading(false);
        navigate("/onboarding", { replace: true });
      } else {
        setLoading(false);
        fail("reg.err.createFail");
      }
    } catch (err) {
      console.error("[register] error:", err);
      fail("err.generic");
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setErrorType("error");
    if (deviceGuard()) return;

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (authError) setError({ raw: authError.message });
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
          <Link
            to="/login"
            className="font-bold text-teal-700 hover:underline"
          >
            {t("reg.signIn")}
          </Link>
        </>
      }
    >
      {renderAlert()}

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField
          id="reg-username"
          label={t("reg.username")}
          labelRight={
            <span className="text-[11px] font-medium text-slate-400">
              {t("common.optional")}
            </span>
          }
          icon={<IconUser size={18} />}
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          placeholder={t("reg.usernamePh")}
          autoComplete="nickname"
          disabled={ipChecking}
        />

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
          id="reg-password"
          label={t("login.password")}
          icon={<IconLock size={18} />}
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder={t("reg.passwordPh")}
          autoComplete="new-password"
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

        {/* Lỗi */}
        {error && (
          <div
            className={`whitespace-pre-line rounded-xl border px-4 py-3 text-xs font-medium ${
              errorType === "email_exists"
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-rose-200 bg-rose-50 text-rose-600"
            }`}
          >
            {error.raw ?? t(error.key, error.vars)}
            {errorType === "email_exists" && (
              <Link
                to="/login"
                className="mt-2 block font-bold text-amber-800 underline"
              >
                {t("reg.err.emailExistsCta")}
              </Link>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || blocked}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3.5 text-[15px] font-bold text-white transition hover:bg-teal-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <IconSpinner size={18} />
              {t("reg.creating")}
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
              {t("reg.submit")}
              <IconArrow size={18} />
            </>
          )}
        </button>

        <p className="text-center text-[12px] leading-5 text-slate-500">
          {t("reg.agree")}
          <Link
            to="/terms"
            className="font-semibold text-teal-700 underline decoration-teal-300 underline-offset-2"
          >
            {t("login.terms")}
          </Link>
        </p>
      </form>

      {/* Hoặc tiếp tục với */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {t("login.orContinue")}
          </span>
        </div>
      </div>

      <div className={blocked ? "pointer-events-none opacity-50" : ""}>
        <button
          type="button"
          onClick={handleGoogle}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
        >
          <IconGoogle size={20} />
          {t("reg.google")}
        </button>
      </div>
    </AuthLayout>
  );
}
