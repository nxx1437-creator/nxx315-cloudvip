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

  // ✅ IP đã có tài khoản chưa
  const [ipBlocked, setIpBlocked] = useState(false);
  const [ipChecking, setIpChecking] = useState(false);
  const [ipChecked, setIpChecked] = useState(false);
  const [blockedEmail, setBlockedEmail] = useState(null);

  // ✅ Kiểm tra IP
  const checkIp = async () => {
    if (ipChecking) return;

    setIpChecking(true);
    try {
      const ip = await getClientIp();
      if (!ip) {
        setIpChecking(false);
        setIpChecked(true);
        return;
      }

      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/check-ip-registered`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ ip }),
        }
      );

      const data = await res.json();

      if (data?.exists === true) {
        setIpBlocked(true);
        setBlockedEmail(data.masked_email || "tài khoản trước");
      } else {
        setIpBlocked(false);
      }
    } catch (err) {
      console.error("Check IP error:", err);
    } finally {
      setIpChecking(false);
      setIpChecked(true);
    }
  };

  // ✅ Tự động check IP ngay khi vào trang
  useEffect(() => {
    checkIp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e?.preventDefault();

    // ✅ Chờ check IP xong
    if (!ipChecked || ipChecking) {
      setError("Đang kiểm tra IP, vui lòng đợi...");
      await checkIp();
      return;
    }

    if (ipBlocked) {
      setError(
        "IP của bạn đã có tài khoản. Vui lòng đăng nhập tài khoản cũ hoặc liên hệ Zalo 0865245988."
      );
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
          setError(
            "IP của bạn đã có tài khoản. Vui lòng đăng nhập tài khoản cũ."
          );
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

        // ✅ Áp dụng mã mời nếu có
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
        setError(
          "Không thể tạo tài khoản. Vui lòng thử lại hoặc dùng email khác."
        );
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

    // ✅ Chờ check IP xong
    if (!ipChecked || ipChecking) {
      await checkIp();
    }

    if (ipBlocked) {
      setError(
        "IP của bạn đã có tài khoản. Vui lòng đăng nhập tài khoản cũ hoặc liên hệ Zalo 0865245988."
      );
      setErrorType("ip_blocked");
      return;
    }

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (authError) setError(authError.message);
  };

  return (
    <AuthShell
      title="Tạo tài khoản"
      subtitle="Đăng ký NXX315 Studio Rewards — hoàn toàn miễn phí."
    >
      {/* Cảnh báo quan trọng */}
      <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-3.5">
        <div className="flex items-start gap-2">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
          <div className="text-[12px] leading-5 text-amber-800">
            <p className="font-bold">Lưu ý quan trọng</p>
            <ul className="mt-1 list-inside list-disc space-y-0.5">
              <li>
                Mỗi IP chỉ được tạo <b>1 tài khoản</b>
              </li>
              <li>Nếu cố tạo thêm, hệ thống sẽ khóa</li>
              <li>Đã có tài khoản rồi? Vui lòng đăng nhập</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ✅ Thông báo IP đã có tài khoản */}
      {ipBlocked && (
        <div className="mb-4 rounded-2xl border-2 border-rose-200 bg-rose-50 p-4">
          <div className="flex items-start gap-2">
            <ShieldAlert size={18} className="mt-0.5 shrink-0 text-rose-600" />
            <div>
              <p className="text-[13px] font-bold text-rose-800">
                IP của bạn đã có tài khoản
              </p>
              <p className="mt-1 text-[12px] leading-5 text-rose-700">
                Tài khoản: <b>{blockedEmail}</b>
                <br />
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
              <Link
                to="/login"
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 text-[12px] font-bold text-white"
              >
                <LogIn size={13} />
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          placeholder="Tên hiển thị (tùy chọn)"
          className="w-full rounded-full border border-slate-300 bg-white px-5 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500"
        />

        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email của bạn"
          className="w-full rounded-full border border-slate-300 bg-white px-5 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500"
        />

        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Mật khẩu (ít nhất 6 ký tự)"
          className="w-full rounded-full border border-slate-300 bg-white px-5 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500"
        />

        {/* ✅ Ô nhập mã mời (không bắt buộc) */}
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
            className="w-full rounded-full border border-amber-200 bg-amber-50/50 py-3.5 pl-11 pr-5 text-sm font-semibold tracking-wider text-amber-900 uppercase outline-none transition placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-amber-400 focus:border-amber-400 focus:bg-white"
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
            {errorType === "email_exists" && (
              <div className="mb-1.5 flex items-center gap-1.5 font-bold">
                <AlertTriangle size={14} />
                Email đã được đăng ký
              </div>
            )}
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
          disabled={loading || ipBlocked || ipChecking}
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
              Đang kiểm tra IP...
            </>
          ) : ipBlocked ? (
            "Không thể đăng ký"
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

      <SocialRow onSelect={handleSocial} />

      <p className="mt-6 text-center text-sm text-slate-500">
        Đã có tài khoản?{" "}
        <Link to="/login" className="font-semibold text-slate-900 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </AuthShell>
  );
  }
