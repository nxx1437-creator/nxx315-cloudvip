import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import LoginAlerts from "../components/LoginAlerts.jsx";
import MfaChallenge from "../components/MfaChallenge.jsx";
import { supabase } from "../lib/supabaseClient.js";
import { useI18n } from "../i18n/index.js";
import {
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconArrow,
  IconSpinner,
  IconWarning,
  IconGoogle,
} from "../components/AuthIcons.jsx";

const MAX_ATTEMPTS = 5;
const LAST_EMAIL_KEY = "nxx315_last_login_email";

const formatTime = (sec) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 disabled:bg-slate-100 disabled:opacity-60";

const labelCls =
  "text-[12px] font-bold uppercase tracking-wider text-slate-700";

export default function Login() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);

  // error = { key, vars } hoặc { raw } -> dịch lúc hiển thị để đổi ngôn ngữ không bị lệch
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState("error");
  const [loading, setLoading] = useState(false);
  const [showMfa, setShowMfa] = useState(false);

  const [isLocked, setIsLocked] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [remainingSec, setRemainingSec] = useState(0);
  const [checkingLock, setCheckingLock] = useState(true);
  const lockedUntilRef = useRef(0);
  const [ipInfo, setIpInfo] = useState(null);

  const fail = (key, vars, type = "error") => {
    setError({ key, vars });
    setErrorType(type);
  };
  const clearError = () => {
    setError(null);
    setErrorType("error");
  };

  const lockFor = (seconds) => {
    const wait = seconds || 60;
    setIsLocked(true);
    setRemainingSec(wait);
    lockedUntilRef.current = Date.now() + wait * 1000;
  };

  // Đếm ngược khi bị khoá
  useEffect(() => {
    if (!isLocked || remainingSec <= 0) return;

    const interval = setInterval(() => {
      const left = Math.max(
        0,
        Math.ceil((lockedUntilRef.current - Date.now()) / 1000)
      );
      setRemainingSec(left);

      if (left <= 0) {
        setIsLocked(false);
        setAttemptsLeft(MAX_ATTEMPTS);
        clearError();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked, remainingSec]);

  // Check lock khi mount (F5 vẫn giữ)
  useEffect(() => {
    const checkLockOnMount = async () => {
      const lastEmail = sessionStorage.getItem(LAST_EMAIL_KEY);
      if (!lastEmail) {
        setCheckingLock(false);
        return;
      }

      try {
        const data = await callGuard("check", { email: lastEmail });
        setForm((prev) => ({ ...prev, email: lastEmail }));

        if (!data.allowed) {
          lockFor(data.wait_seconds);
          fail("err.lockedMount", null, "locked");
        } else {
          setAttemptsLeft(
            Math.max(0, (data.max || MAX_ATTEMPTS) - (data.ip_attempts || 0))
          );
        }
      } catch (err) {
        console.warn("[Login] Check mount error:", err);
      } finally {
        setCheckingLock(false);
      }
    };

    checkLockOnMount();
  }, []);

  // Xử lý query params
  useEffect(() => {
    const errParam = searchParams.get("error");
    if (errParam === "ip_duplicate") {
      fail("err.ipDuplicate", null, "ip_duplicate");
    } else if (errParam === "session_expired") {
      fail("err.sessionExpired", null, "session_expired");
    }
  }, [searchParams]);

  const callGuard = async (action, payload = {}) => {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const res = await fetch(`${SUPABASE_URL}/functions/v1/login-guard`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ action, ...payload }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };

  const handleIpCheck = async (userId) => {
    try {
      const data = await callGuard("check-ip", { userId });

      if (!data.allowed) {
        await supabase.auth.signOut();
        setIpInfo({
          registeredIp: data.registered_ip,
          currentIp: data.current_ip,
          ageDays: data.account_age_days,
          trustDays: data.trust_after_days,
        });
        setErrorType("ip_mismatch");
        return false;
      }

      console.log("[Login] IP check OK:", data.reason);
      return true;
    } catch (err) {
      console.warn("[Login] IP check failed:", err);
      return true;
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (isLocked) {
      fail("err.lockedWait", { time: formatTime(remainingSec) }, "locked");
      return;
    }
    if (!form.email || !form.password) {
      fail("err.fill");
      return;
    }
    if (!agreed) {
      fail("err.agree");
      return;
    }

    clearError();
    setIpInfo(null);
    setLoading(true);

    sessionStorage.setItem(LAST_EMAIL_KEY, form.email.toLowerCase());

    try {
      const checkData = await callGuard("check", { email: form.email });

      if (!checkData.allowed) {
        lockFor(checkData.wait_seconds);
        fail("err.lockedMax", { max: checkData.max || MAX_ATTEMPTS }, "locked");
        setLoading(false);
        return;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword(
        { email: form.email, password: form.password }
      );

      try {
        await callGuard("record", { email: form.email, success: !authError });
      } catch (logErr) {
        console.warn("[Login] Không ghi được log:", logErr);
      }

      if (authError) {
        try {
          const recheck = await callGuard("check", { email: form.email });

          if (!recheck.allowed) {
            lockFor(recheck.wait_seconds);
            fail("err.lockedMany", null, "locked");
          } else {
            const left = Math.max(
              0,
              (recheck.max || MAX_ATTEMPTS) - (recheck.ip_attempts || 0)
            );
            setAttemptsLeft(left);
            fail("err.wrongLeft", { n: left }, "wrong_password");
          }
        } catch (recheckErr) {
          fail("err.wrong", null, "wrong_password");
        }
        setLoading(false);
        return;
      }

      if (data.session && data.user) {
        const ipOk = await handleIpCheck(data.user.id);
        if (!ipOk) {
          setLoading(false);
          return;
        }

        sessionStorage.removeItem(LAST_EMAIL_KEY);
        setLoading(false);
        setAttemptsLeft(MAX_ATTEMPTS);

        const { data: aalData } =
          await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (
          aalData?.nextLevel === "aal2" &&
          aalData?.currentLevel !== "aal2"
        ) {
          setShowMfa(true);
          return;
        }
        window.location.href = "/dashboard";
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("[Login] Error:", err);
      fail("err.generic");
      setLoading(false);
    }
  };

  const handleMfaCancel = async () => {
    await supabase.auth.signOut();
    setShowMfa(false);
  };

  const handleGoogle = async () => {
    clearError();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (authError) setError({ raw: authError.message });
  };

  const disabled = isLocked || checkingLock;
  const hideInlineError = [
    "ip_duplicate",
    "locked",
    "ip_mismatch",
    "session_expired",
  ].includes(errorType);

  return (
    <AuthLayout
      title={t("login.title")}
      footer={
        <>
          {t("login.noAccount")}{" "}
          <Link
            to="/register"
            className="font-bold text-teal-700 hover:underline"
          >
            {t("login.signUp")}
          </Link>
        </>
      }
    >
      <LoginAlerts
        errorType={errorType}
        isLocked={isLocked}
        remainingSec={remainingSec}
        maxAttempts={MAX_ATTEMPTS}
        ipInfo={ipInfo}
        formatTime={formatTime}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="login-email" className={labelCls}>
            {t("login.email")}
          </label>
          <div className="relative mt-2">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <IconMail size={18} />
            </span>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder={t("login.emailPh")}
              disabled={disabled}
              className={`${inputCls} pr-4`}
            />
          </div>
        </div>

        {/* Mật khẩu */}
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className={labelCls}>
              {t("login.password")}
            </label>
            <Link
              to="/forgot-password"
              className="text-[13px] font-semibold text-teal-700 hover:underline"
            >
              {t("login.forgot")}
            </Link>
          </div>
          <div className="relative mt-2">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <IconLock size={18} />
            </span>
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={t("login.passwordPh")}
              disabled={disabled}
              className={`${inputCls} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={disabled}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
            >
              {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
        </div>

        {/* Điều khoản */}
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-500">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-5 w-5 shrink-0 rounded accent-teal-600"
          />
          <span>
            {t("login.agreePre")}
            <Link
              to="/terms"
              className="font-semibold text-teal-700 underline decoration-teal-300 underline-offset-2"
            >
              {t("login.terms")}
            </Link>
          </span>
        </label>

        {/* Cảnh báo số lần thử */}
        {!isLocked &&
          !checkingLock &&
          !error &&
          attemptsLeft < MAX_ATTEMPTS &&
          attemptsLeft > 0 && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-[12px] font-medium leading-5 text-amber-800">
              <span className="mt-0.5 shrink-0">
                <IconWarning size={16} />
              </span>
              <span>
                {t("login.attempts", { n: attemptsLeft, max: MAX_ATTEMPTS })}
              </span>
            </div>
          )}

        {/* Lỗi */}
        {error && !hideInlineError && (
          <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-600">
            {error.raw ?? t(error.key, error.vars)}
          </p>
        )}

        {/* Nút đăng nhập */}
        <button
          type="submit"
          disabled={loading || disabled}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-teal-600/25 transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {checkingLock ? (
            <>
              <IconSpinner size={18} />
              {t("login.checking")}
            </>
          ) : isLocked ? (
            <>
              <IconLock size={18} />
              {t("login.lockedBtn", { time: formatTime(remainingSec) })}
            </>
          ) : loading ? (
            <>
              <IconSpinner size={18} />
              {t("login.loading")}
            </>
          ) : (
            <>
              {t("login.submit")}
              <IconArrow size={18} />
            </>
          )}
        </button>
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

      <div className={disabled ? "pointer-events-none opacity-50" : ""}>
        <button
          type="button"
          onClick={handleGoogle}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
        >
          <IconGoogle size={20} />
          {t("login.google")}
        </button>
      </div>

      {showMfa && (
        <MfaChallenge
          onVerified={() => {
            window.location.href = "/dashboard";
          }}
          onCancel={handleMfaCancel}
        />
      )}
    </AuthLayout>
  );
           }
