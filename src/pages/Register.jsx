import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, AlertTriangle, ShieldAlert, LogIn } from "lucide-react";
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
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [errorType, setErrorType] = useState("error");
  const [loading, setLoading] = useState(false);

  const [deviceBlocked, setDeviceBlocked] = useState(false);
  const [existingEmail, setExistingEmail] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkDevice = async () => {
      try {
        const fp = await getFingerprint();
        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
        const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/check-device-public`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({ fingerprint: fp }),
          }
        );

        const data = await res.json();

        if (data.exists === true) {
          setDeviceBlocked(true);
          setExistingEmail(data.masked_email || "tài khoản trước");
        }
      } catch (err) {
        console.error("Check device error:", err);
      } finally {
        setChecking(false);
      }
    };

    checkDevice();
  }, []);

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (deviceBlocked) {
      setError(
        "Thiết bị này đã có tài khoản. Vui lòng đăng nhập lại tài khoản cũ."
      );
      setErrorType("device_blocked");
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

      setLoading(false);

      if (authError) {
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
        } else if (msg.includes("invalid email")) {
          setError("Email không hợp lệ. Vui lòng kiểm tra lại.");
          setErrorType("error");
        } else if (msg.includes("password")) {
          setError("Mật khẩu không hợp lệ. Vui lòng dùng mật khẩu mạnh hơn.");
          setErrorType("error");
        } else if (msg.includes("rate limit") || msg.includes("too many")) {
          setError("Bạn thao tác quá nhanh. Vui lòng đợi 1 phút rồi thử lại.");
          setErrorType("error");
        } else {
          setError(authError.message);
          setErrorType("error");
        }
        return;
      }

      if (data.user) {
        const isExistingUser =
          !data.user.identities || data.user.identities.length === 0;

        if (isExistingUser) {
          setError(
            `Email "${form.email}" đã được đăng ký trước đó.\n\n` +
              `Vui lòng:\n` +
              `• Đăng nhập nếu đây là tài khoản của bạn\n` +
              `• Hoặc dùng email khác để đăng ký`
          );
          setErrorType("email_exists");
          return;
        }

        navigate("/verify-email", { state: { email: form.email } });
      } else {
        setError(
          "Không thể tạo tài khoản. Vui lòng thử lại hoặc dùng email khác."
        );
        setErrorType("error");
      }
    } catch (err) {
      console.error("[register] error:", err);
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
      setErrorType("error");
      setLoading(false);
    }
  };

  const handleSocial = async (provider, supported) => {
    setError("");
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

  // Nếu thiết bị đã có tài khoản → hiện màn hình chặn
  if (!checking && deviceBlocked) {
    return (
      <AuthShell
        title="Thiết bị đã có tài khoản"
        subtitle="Mỗi thiết bị chỉ được tạo 1 tài khoản duy nhất."
      >
        <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
            <ShieldAlert size={28} className="text-rose-600" strokeWidth={2.2} />
          </div>

          <h3 className="mt-3 text-[15px] font-black text-rose-800">
            Không thể tạo tài khoản mới
          </h3>

          <p className="mt-2 text-[13px] leading-6 text-rose-700">
            Thiết bị này đã có tài khoản:{" "}
            <b>{existingEmail}</b>
            <br />
            <br />
            Vui lòng đăng nhập lại tài khoản cũ để tiếp tục sử dụng.
          </p>
        </div>

        <Link
          to="/login"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 py-3.5 text-sm font-bold text-white shadow-md shadow-sky-500/30 transition hover:brightness-110 active:scale-[0.98]"
        >
          <LogIn size={16} strokeWidth={2.4} />
          Đăng nhập tài khoản cũ
        </Link>

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
          <p className="text-[12px] leading-5 text-amber-700">
            <b>Lưu ý:</b> Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ Zalo{" "}
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
      </AuthShell>
    );
  }

  // Đang check fingerprint
  if (checking) {
    return (
      <AuthShell
        title="Đang kiểm tra thiết bị"
        subtitle="Vui lòng chờ trong giây lát..."
      >
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 size={32} className="animate-spin text-slate-400" />
        </div>
      </AuthShell>
    );
  }

  // Form bình thường + cảnh báo
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
              <li>Mỗi thiết bị chỉ được tạo <b>1 tài khoản</b></li>
              <li>Nếu cố tạo thêm, hệ thống sẽ khóa</li>
              <li>Đã có tài khoản rồi? Vui lòng đăng nhập</li>
            </ul>
          </div>
        </div>
      </div>

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
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99] disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Đang tạo tài khoản...
            </>
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
