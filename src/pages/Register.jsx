import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Loader2,
  AlertTriangle,
  ShieldAlert,
  LogIn,
  Gift,
} from "lucide-react";
import AuthShell from "../components/AuthShell.jsx";
import SocialRow from "../components/SocialRow.jsx";
import { supabase, getClientIp } from "../lib/supabaseClient.js";

const FP_CDN = "https://openfpcdn.io/fingerprintjs/v4/iife.min.js";
const STORAGE_KEY = "nxx315_fingerprint";

let fpPromise = null;
function loadFingerprintJS() {
  if (fpPromise) return fpPromise;
  fpPromise = new Promise((resolve, reject) => {
    if (window.FingerprintJS) {
      resolve(window.FingerprintJS);
      return;
    }
    const script = document.createElement("script");
    script.src = FP_CDN;
    script.async = true;
    script.onload = () => {
      if (window.FingerprintJS) resolve(window.FingerprintJS);
      else reject(new Error("FingerprintJS không load được"));
    };
    script.onerror = () => reject(new Error("CDN load fail"));
    document.head.appendChild(script);
  });
  return fpPromise;
}

async function getFingerprint() {
  let fp = localStorage.getItem(STORAGE_KEY);
  if (fp) return fp;
  const FP = await loadFingerprintJS();
  const fpInstance = await FP.load();
  const result = await fpInstance.get();
  fp = result.visitorId;
  localStorage.setItem(STORAGE_KEY, fp);
  return fp;
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    referral: "",
  });
  const [error, setError] = useState("");
  const [errorType, setErrorType] = useState("error");
  const [loading, setLoading] = useState(false);

  const [ipBlocked, setIpBlocked] = useState(false);
  const [ipChecking, setIpChecking] = useState(true);
  const [ipChecked, setIpChecked] = useState(false);
  const [ipError, setIpError] = useState(false);
  const [blockedEmail, setBlockedEmail] = useState(null);

  const checkIp = async () => {
    if (ipChecking && ipChecked) return;
    if (ipChecked && !ipError) return;

    setIpChecking(true);
    setIpError(false);

    try {
      const ip = await Promise.race([
        getClientIp(),
        new Promise((resolve) => setTimeout(() => resolve(null), 5000)),
      ]);

      if (!ip) {
        console.warn("[checkIp] Không lấy được IP");
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
          body: JSON.stringify({ ip }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      if (data?.exists === true) {
        setIpBlocked(true);
        setBlockedEmail(data.masked_email || "tài khoản trước");
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

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (ipChecking) {
      setError("Đang kiểm tra IP, vui lòng đợi...");
      setErrorType("error");
      return;
    }

    if (ipError) {
      setError("Không thể kiểm tra IP. Vui lòng thử lại.");
      setErrorType("ip_error");
      return;
    }

    if (ipBlocked) {
      setError("IP của bạn đã có tài khoản.");
      setErrorType("ip_blocked");
      return;
    }

    if (!form.email || !form.password) {
      setError("Vui lòng điền đầy đủ thông tin.");
      setErrorType("error");
      return;
    }
    if (form.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      setErrorType("error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Email không hợp lệ. Vui lòng kiểm tra lại.");
      setErrorType("error");
      return;
    }

    setError("");
    setErrorType("error");
    setLoading(true);

    try {
      const ip = await getClientIp();
      const fp = await getFingerprint();

      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            username: form.username || form.email.split("@")[0],
            registration_ip: ip || null,
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
          setError(
            `Email "${form.email}" đã được đăng ký trước đó.\n\n` +
              `Vui lòng:\n` +
              `• Đăng nhập nếu đây là tài khoản của bạn\n` +
              `• Hoặc dùng email khác để đăng ký`
          );
          setErrorType("email_exists");
        } else if (msg.includes("ip_already_registered")) {
          setError("IP của bạn đã có tài khoản.");
          setErrorType("ip_blocked");
        } else if (msg.includes("invalid email")) {
          setError("Email không hợp lệ. Vui lòng kiểm tra lại.");
        } else if (msg.includes("password")) {
          setError("Mật khẩu không hợp lệ. Vui lòng dùng mật khẩu mạnh hơn.");
        } else if (msg.includes("rate limit") || msg.includes("too many")) {
          setError("Bạn thao tác quá nhanh. Vui lòng đợi 1 phút rồi thử lại.");
        } else {
          setError(authError.message);
        }
        return;
      }

      if (data.user) {
        const isExistingUser =
          !data.user.identities || data.user.identities.length === 0;

        if (isExistingUser) {
          setLoading(false);
          setError(
            `Email "${form.email}" đã được đăng ký trước đó.\n\n` +
              `Vui lòng:\n` +
              `• Đăng nhập nếu đây là tài khoản của bạn\n` +
              `• Hoặc dùng email khác để đăng ký`
          );
          setErrorType("email_exists");
          return;
        }

        if (form.referral.trim() && data.user) {
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
        setError("Không thể tạo tài khoản. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("[register] error:", err);
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  const handleSocial = async (provider, supported) => {
    setError("");
    if (!supported) {
      setError("Đăng nhập bằng " + provider + " sắp ra mắt.");
      return;
    }

    if (ipChecking) {
      setError("Đang kiểm tra IP, vui lòng đợi...");
      return;
    }

    if (ipError) {
      setError("Không thể kiểm tra IP. Vui lòng thử lại.");
      setErrorType("ip_error");
      return;
    }

    if (ipBlocked) {
      setError("IP của bạn đã có tài khoản.");
      setErrorType("ip_blocked");
      return;
    }

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (authError) setError(authError.message);
  };

  // ✅ Chỉ hiển thị 1 cảnh báo duy nhất theo ưu tiên
  const renderAlert = () => {
    // Ưu tiên 1: Lỗi check IP
    if (ipError) {
      return (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
            <div className="flex-1">
              <p className="text-[13px] font-bold text-amber-800">
                Không thể kiểm tra thiết bị
              </p>
              <p className="mt-1 text-[12px] leading-5 text-amber-700">
                Vui lòng kiểm tra kết nối mạng và thử lại.
              </p>
              <button
                onClick={() => {
                  setIpChecked(false);
                  setIpError(false);
                  checkIp();
                }}
                className="mt-3 rounded-lg bg-amber-500 px-4 py-2 text-[12px] font-bold text-white transition hover:bg-amber-600"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Ưu tiên 2: IP trùng
    if (ipBlocked) {
      return (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert size={18} className="mt-0.5 shrink-0 text-rose-600" />
            <div className="flex-1">
              <p className="text-[13px] font-bold text-rose-800">
                Thiết bị này đã có tài khoản
              </p>
              <p className="mt-1 text-[12px] leading-5 text-rose-700">
                Tài khoản: <b>{blockedEmail}</b>. Mỗi thiết bị chỉ được tạo 1
                tài khoản.
              </p>
              <Link
                to="/login"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-rose-500 px-4 py-2 text-[12px] font-bold text-white transition hover:bg-rose-600"
              >
                <LogIn size={13} />
                Đăng nhập tài khoản cũ
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // Ưu tiên 3: Lưu ý chung (chỉ hiện khi không có lỗi)
    return (
      <div className="mb-4 rounded-2xl border border-sky-100 bg-sky-50/60 p-3.5">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100">
            <span className="text-[11px] font-bold text-sky-600">i</span>
          </div>
          <p className="text-[12px] leading-5 text-sky-800">
            Mỗi thiết bị chỉ được tạo <b>1 tài khoản</b>. Đã có tài khoản?{" "}
            <Link to="/login" className="font-bold underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    );
  };

  return (
    <AuthShell
      title="Tạo tài khoản"
      subtitle="Đăng ký NXX315 Studio Rewards — hoàn toàn miễn phí."
    >
      {/* ✅ Chỉ 1 cảnh báo duy nhất */}
      {renderAlert()}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          placeholder="Tên hiển thị (tùy chọn)"
          disabled={ipChecking}
          className="w-full rounded-full border border-slate-300 bg-white px-5 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 disabled:bg-slate-50 disabled:opacity-60"
        />

        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email của bạn"
          disabled={ipChecking}
          className="w-full rounded-full border border-slate-300 bg-white px-5 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 disabled:bg-slate-50 disabled:opacity-60"
        />

        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Mật khẩu (ít nhất 6 ký tự)"
          disabled={ipChecking}
          className="w-full rounded-full border border-slate-300 bg-white px-5 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 disabled:bg-slate-50 disabled:opacity-60"
        />

        <div className="relative">
          <Gift
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500"
          />
          <input
            type="text"
            value={form.referral}
            onChange={(e) =>
              setForm({ ...form, referral: e.target.value.toUpperCase() })
            }
            placeholder="Mã mời (tùy chọn) — nhận +200 xu"
            maxLength={10}
            disabled={ipChecking}
            className="w-full rounded-full border border-amber-200 bg-amber-50/50 py-3.5 pl-11 pr-5 text-sm font-semibold tracking-wider text-amber-900 uppercase outline-none transition placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-amber-400 focus:border-amber-400 focus:bg-white disabled:opacity-60"
          />
        </div>

        {error && (
          <div
            className={`rounded-2xl border px-4 py-3 text-xs font-medium whitespace-pre-line ${
              errorType === "email_exists"
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-rose-200 bg-rose-50 text-rose-600"
            }`}
          >
            {errorType === "email_exists" ? (
              <>
                <p className="whitespace-pre-line">{error}</p>
                <Link
                  to="/login"
                  className="mt-2 inline-block font-bold text-amber-800 underline"
                >
                  → Đăng nhập ngay
                </Link>
              </>
            ) : (
              error
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || ipBlocked || ipError || ipChecking}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Đang tạo tài khoản...
            </>
          ) : ipChecking ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Đang kiểm tra...
            </>
          ) : ipError ? (
            "Không thể kiểm tra thiết bị"
          ) : ipBlocked ? (
            "Thiết bị đã có tài khoản"
          ) : (
            "Đăng ký"
          )}
        </button>
      </form>

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
          ipBlocked || ipError || ipChecking
            ? "pointer-events-none opacity-50"
            : ""
        }
      >
        <SocialRow onSelect={handleSocial} />
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Đã có tài khoản?{" "}
        <Link to="/login" className="font-semibold text-slate-900 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </AuthShell>
  );
        }
