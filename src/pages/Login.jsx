import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import SocialRow from "../components/SocialRow.jsx";
import MfaChallenge from "../components/MfaChallenge.jsx";
import { supabase } from "../lib/supabaseClient.js";

const MAX_ATTEMPTS = 5;
const LAST_EMAIL_KEY = "nxx315_last_login_email";

// ==================================================
// ICONS - CẢNH BÁO & TRẠNG THÁI
// ==================================================

const IconWarning = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="warnGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
    <path d="M12 3.5L2.5 20.5h19L12 3.5z" stroke="url(#warnGrad)" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
    <path d="M12 9.5v4" stroke="url(#warnGrad)" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="17" r="1.2" fill="url(#warnGrad)" />
  </svg>
);

const IconShield = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f43f5e" />
        <stop offset="100%" stopColor="#e11d48" />
      </linearGradient>
    </defs>
    <path d="M12 2.5l8 3v6.5c0 5-3.4 8.5-8 9.5-4.6-1-8-4.5-8-9.5V5.5l8-3z" stroke="url(#shieldGrad)" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
    <path d="M12 8v5" stroke="url(#shieldGrad)" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="16.5" r="1.2" fill="url(#shieldGrad)" />
  </svg>
);

const IconLock = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="lockGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#b91c1c" />
      </linearGradient>
    </defs>
    <rect x="4.5" y="10.5" width="15" height="11" rx="3" stroke="url(#lockGrad)" strokeWidth="1.8" fill="none" />
    <path d="M8 10.5V7.5a4 4 0 018 0v3" stroke="url(#lockGrad)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <circle cx="12" cy="15.5" r="1.5" fill="url(#lockGrad)" />
    <path d="M12 17v2.5" stroke="url(#lockGrad)" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const IconWifiOff = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="wifiGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fb923c" />
        <stop offset="100%" stopColor="#ea580c" />
      </linearGradient>
    </defs>
    <path d="M2.5 8.5C5.5 5.8 8.6 4.5 12 4.5c3.4 0 6.5 1.3 9.5 4" stroke="url(#wifiGrad)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <path d="M6 12c1.7-1.5 3.7-2.3 6-2.3 2.3 0 4.3.8 6 2.3" stroke="url(#wifiGrad)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <path d="M9.5 15.5c.7-.6 1.5-.9 2.5-.9 1 0 1.8.3 2.5.9" stroke="url(#wifiGrad)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <circle cx="12" cy="18.5" r="1.3" fill="url(#wifiGrad)" />
    <path d="M3 3l18 18" stroke="url(#wifiGrad)" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const IconClock = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="clockGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="9" stroke="url(#clockGrad)" strokeWidth="1.8" fill="none" />
    <path d="M12 7v5l3 2" stroke="url(#clockGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ==================================================
// ICONS - CHO INPUT
// ==================================================

const IconEmail = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="emailGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
    </defs>
    <rect x="3" y="5" width="18" height="14" rx="3" stroke="url(#emailGrad)" strokeWidth="1.8" fill="none" />
    <path d="M3.5 7l7.4 5.2c.6.4 1.4.4 2 0L20.5 7" stroke="url(#emailGrad)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
  </svg>
);

const IconPassword = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="passGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#a78bfa" />
        <stop offset="100%" stopColor="#7c3aed" />
      </linearGradient>
    </defs>
    <rect x="4.5" y="10.5" width="15" height="10" rx="3" stroke="url(#passGrad)" strokeWidth="1.8" fill="none" />
    <path d="M8 10.5V7.5a4 4 0 018 0v3" stroke="url(#passGrad)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <circle cx="12" cy="15.5" r="1.3" fill="url(#passGrad)" />
  </svg>
);

const IconSpinner = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={{ animation: "spinCustom 0.8s linear infinite" }}
  >
    <defs>
      <linearGradient id="spinGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.15" />
      </linearGradient>
    </defs>
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="url(#spinGrad)"
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
      strokeDasharray="56.55"
      strokeDashoffset="14"
    />
    <style>{`@keyframes spinCustom { to { transform: rotate(360deg); } }`}</style>
  </svg>
);

const IconEye = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="eyeGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>
    </defs>
    <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" stroke="url(#eyeGrad)" strokeWidth="1.8" fill="none" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" stroke="url(#eyeGrad)" strokeWidth="1.8" fill="none" />
  </svg>
);

const IconEyeOff = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="eyeOffGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>
    </defs>
    <path d="M3 3l18 18" stroke="url(#eyeOffGrad)" strokeWidth="2" strokeLinecap="round" />
    <path d="M10.6 6.2A9.9 9.9 0 0112 6c6 0 9.5 6 9.5 6a16.8 16.8 0 01-3.5 4.2M6.6 8.2A17 17 0 002.5 12s3.5 6 9.5 6c1.5 0 2.8-.3 4-.9" stroke="url(#eyeOffGrad)" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.9 9.9a3 3 0 104.2 4.2" stroke="url(#eyeOffGrad)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
  </svg>
);
export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [errorType, setErrorType] = useState("error");
  const [loading, setLoading] = useState(false);
  const [showMfa, setShowMfa] = useState(false);

  const [isLocked, setIsLocked] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [remainingSec, setRemainingSec] = useState(0);
  const [checkingLock, setCheckingLock] = useState(true);
  const lockedUntilRef = useRef(0);
  const [ipInfo, setIpInfo] = useState(null);

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
        setError("");
        setErrorType("error");
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
        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
        const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/login-guard`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({
              action: "check",
              email: lastEmail,
            }),
          }
        );

        const data = await res.json();

        setForm((prev) => ({ ...prev, email: lastEmail }));

        if (!data.allowed) {
          setIsLocked(true);
          setRemainingSec(data.wait_seconds || 60);
          lockedUntilRef.current =
            Date.now() + (data.wait_seconds || 60) * 1000;
          setError(
            "Tài khoản đang bị khoá tạm thời. Vui lòng thử lại sau."
          );
          setErrorType("locked");
        } else {
          const left = Math.max(
            0,
            (data.max || MAX_ATTEMPTS) - (data.ip_attempts || 0)
          );
          setAttemptsLeft(left);
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
      setError(
        "IP của bạn đã có tài khoản khác. Vui lòng đăng nhập tài khoản cũ hoặc liên hệ Zalo 0865245988."
      );
      setErrorType("ip_duplicate");
    } else if (errParam === "session_expired") {
      setError(
        "Phiên làm việc đã hết hạn do không hoạt động. Vui lòng đăng nhập lại."
      );
      setErrorType("session_expired");
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
      setError(
        `Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau ${formatTime(
          remainingSec
        )}.`
      );
      setErrorType("locked");
      return;
    }

    if (!form.email || !form.password) {
      setError("Vui lòng điền đầy đủ thông tin.");
      setErrorType("error");
      return;
    }

    setError("");
    setErrorType("error");
    setIpInfo(null);
    setLoading(true);

    sessionStorage.setItem(LAST_EMAIL_KEY, form.email.toLowerCase());

    try {
      const checkData = await callGuard("check", { email: form.email });

      if (!checkData.allowed) {
        setIsLocked(true);
        setRemainingSec(checkData.wait_seconds || 60);
        lockedUntilRef.current =
          Date.now() + (checkData.wait_seconds || 60) * 1000;
        setError(
          `Bạn đã nhập sai ${checkData.max || MAX_ATTEMPTS} lần. Tài khoản bị khoá tạm thời.`
        );
        setErrorType("locked");
        setLoading(false);
        return;
      }

      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });

      try {
        await callGuard("record", {
          email: form.email,
          success: !authError,
        });
      } catch (logErr) {
        console.warn("[Login] Không ghi được log:", logErr);
      }

      if (authError) {
        try {
          const recheck = await callGuard("check", { email: form.email });

          if (!recheck.allowed) {
            setIsLocked(true);
            setRemainingSec(recheck.wait_seconds || 60);
            lockedUntilRef.current =
              Date.now() + (recheck.wait_seconds || 60) * 1000;
            setError(
              "Bạn đã nhập sai quá nhiều lần. Tài khoản bị khoá tạm thời."
            );
            setErrorType("locked");
          } else {
            const left = Math.max(
              0,
              (recheck.max || MAX_ATTEMPTS) - (recheck.ip_attempts || 0)
            );
            setAttemptsLeft(left);
            setError(
              `Email hoặc mật khẩu không đúng. Còn ${left} lần thử.`
            );
            setErrorType("wrong_password");
          }
        } catch (recheckErr) {
          setError("Email hoặc mật khẩu không đúng.");
          setErrorType("wrong_password");
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
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
      setErrorType("error");
      setLoading(false);
    }
  };

  const handleMfaCancel = async () => {
    await supabase.auth.signOut();
    setShowMfa(false);
  };

  const handleSocial = async (provider, supported) => {
    setError("");
    setErrorType("error");
    if (!supported) {
      setError("Đăng nhập bằng " + provider + " sắp ra mắt.");
      return;
    }
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (authError) setError(authError.message);
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <AuthShell
      title="Chào mừng trở lại"
      subtitle="Đăng nhập vào NXX315 Studio Rewards để tiếp tục."
    >
      {/* Cảnh báo chung */}
      <div className="mb-4 overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 p-3.5">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-100">
            <IconWarning size={18} />
          </div>
          <div className="text-[12px] leading-5 text-sky-800">
            <p className="font-bold">Lưu ý quan trọng</p>
            <p className="mt-1">
              Nếu bạn đã từng tạo tài khoản trên thiết bị này, vui lòng đăng nhập
              lại tài khoản <b>cũ</b>. Mỗi thiết bị chỉ được dùng 1 tài khoản.
            </p>
          </div>
        </div>
      </div>

      {/* Phiên hết hạn */}
      {errorType === "session_expired" && (
        <div className="mb-4 overflow-hidden rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 shadow-sm">
              <IconClock size={22} />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-amber-800">
                Phiên làm việc đã hết hạn
              </p>
              <p className="mt-1 text-[12px] leading-5 text-amber-700">
                Bạn đã không hoạt động trong 30 phút. Vui lòng đăng nhập lại để
                tiếp tục.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* IP trùng */}
      {errorType === "ip_duplicate" && (
        <div className="mb-4 overflow-hidden rounded-2xl border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 shadow-sm">
              <IconShield size={22} />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-rose-800">
                IP đã có tài khoản khác
              </p>
              <p className="mt-1 text-[12px] leading-5 text-rose-700">
                Vui lòng đăng nhập tài khoản cũ hoặc liên hệ Zalo{" "}
                <a
                  href="https://zalo.me/0865245988"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline"
                >
                  0865245988
                </a>{" "}
                để được hỗ trợ.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bị khoá */}
      {isLocked && (
        <div className="mb-4 overflow-hidden rounded-2xl border-2 border-red-300 bg-gradient-to-br from-red-50 to-rose-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 shadow-sm">
              <IconLock size={22} />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-red-800">
                Tài khoản bị khoá tạm thời
              </p>
              <p className="mt-1 text-[12px] leading-5 text-red-700">
                Bạn đã nhập sai mật khẩu quá {MAX_ATTEMPTS} lần liên tiếp.
              </p>
              <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-white/80 px-3 py-2 shadow-sm backdrop-blur">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
                  Mở khoá sau
                </span>
                <span className="text-[16px] font-black tabular-nums tracking-widest text-red-600">
                  {formatTime(remainingSec)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IP không khớp */}
      {errorType === "ip_mismatch" && (
        <div className="mb-4 overflow-hidden rounded-2xl border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 shadow-sm">
              <IconWifiOff size={22} />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-orange-800">
                Không đúng mạng WiFi
              </p>
              <p className="mt-1 text-[12px] leading-5 text-orange-700">
                Tài khoản này được tạo từ một mạng WiFi khác. Vui lòng kết nối
                đúng mạng đã đăng ký ban đầu để đăng nhập.
              </p>
              {ipInfo && (
                <div className="mt-2.5 space-y-1 rounded-xl bg-white/60 p-2.5 text-[11px] leading-5 text-orange-700 backdrop-blur">
                  <p>
                    📍 IP đăng ký: <b>{ipInfo.registeredIp}</b>
                  </p>
                  <p>
                    🌐 IP hiện tại: <b>{ipInfo.currentIp}</b>
                  </p>
                  <p>
                    ⏳ Sau <b>{ipInfo.trustDays} ngày</b> kể từ khi tạo tài
                    khoản, bạn có thể đăng nhập từ mạng bất kỳ.
                  </p>
                </div>
              )}
              <p className="mt-2 text-[11px] leading-5 text-orange-700">
                Cần hỗ trợ? Liên hệ Zalo{" "}
                <a
                  href="https://zalo.me/0865245988"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline"
                >
                  0865245988
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Email input */}
        <div className="relative">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
            <IconEmail size={18} />
          </div>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email của bạn"
            disabled={isLocked || checkingLock}
            className="w-full rounded-full border border-slate-300 bg-white py-3.5 pl-12 pr-5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:opacity-60"
          />
        </div>

        {/* Password input */}
        <div className="relative">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
            <IconPassword size={18} />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Mật khẩu"
            disabled={isLocked || checkingLock}
            className="w-full rounded-full border border-slate-300 bg-white py-3.5 pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-100 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLocked || checkingLock}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 transition hover:bg-slate-100 disabled:opacity-50"
            tabIndex={-1}
          >
            {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
          </button>
        </div>

        {/* Cảnh báo số lần thử */}
        {!isLocked &&
          !checkingLock &&
          attemptsLeft < MAX_ATTEMPTS &&
          attemptsLeft > 0 && (
            <div className="rounded-2xl bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-700">
              ⚠️ Còn <b>{attemptsLeft}</b> lần thử. Nếu sai quá {MAX_ATTEMPTS}{" "}
              lần, tài khoản sẽ bị khoá tạm thời.
            </div>
          )}

        {error &&
          errorType !== "ip_duplicate" &&
          errorType !== "locked" &&
          errorType !== "ip_mismatch" &&
          errorType !== "session_expired" && (
            <p className="rounded-2xl bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-600">
              {error}
            </p>
          )}

        <button
          type="submit"
          disabled={loading || isLocked || checkingLock}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {checkingLock ? (
            <>
              <IconSpinner size={16} />
              Đang kiểm tra...
            </>
          ) : isLocked ? (
            <>
              <IconLock size={16} />
              Đã khoá {formatTime(remainingSec)}
            </>
          ) : loading ? (
            <>
              <IconSpinner size={16} />
              Đang đăng nhập...
            </>
          ) : (
            "Đăng nhập"
          )}
        </button>
      </form>

      <div className="mt-3 text-center">
        <Link
          to="/forgot-password"
          className="text-xs text-slate-500 hover:text-slate-700 hover:underline"
        >
          Quên mật khẩu?
        </Link>
      </div>

      <div className="relative my-7">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs font-medium uppercase tracking-wider text-slate-400">
            Hoặc
          </span>
        </div>
      </div>

      <div
        className={
          isLocked || checkingLock ? "pointer-events-none opacity-50" : ""
        }
      >
        <SocialRow onSelect={handleSocial} />
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Chưa có tài khoản?{" "}
        <Link
          to="/register"
          className="font-semibold text-slate-900 hover:underline"
        >
          Đăng ký
        </Link>
      </p>

      {showMfa && (
        <MfaChallenge
          onVerified={() => {
            window.location.href = "/dashboard";
          }}
          onCancel={handleMfaCancel}
        />
      )}
    </AuthShell>
  );
                                   }
