import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, AlertTriangle } from "lucide-react";
import AuthShell from "../components/AuthShell.jsx";
import SocialRow from "../components/SocialRow.jsx";
import MfaChallenge from "../components/MfaChallenge.jsx";
import { supabase } from "../lib/supabaseClient.js";

// ✅ Dùng cùng FingerprintJS với Register
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

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMfa, setShowMfa] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.email || !form.password) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    setError("");
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (authError) {
      setError("Email hoặc mật khẩu không đúng.");
      setLoading(false);
      return;
    }

    // ✅ Check IP/fingerprint sau khi login thành công
    const accessToken = data?.session?.access_token;
    if (accessToken) {
      try {
        const fp = await getFingerprint();

        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/log-ip`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ fingerprint: fp }),
          }
        );

        const ipData = await res.json();

        if (ipData.allowed === false) {
          await supabase.auth.signOut();
          localStorage.removeItem(STORAGE_KEY);
          setError(
            ipData.reason ||
              "Tài khoản của bạn đã bị chặn do trùng thiết bị với tài khoản khác."
          );
          setLoading(false);
          return;
        }
      } catch (ipErr) {
        console.error("Check IP error:", ipErr);
      }
    }

    setLoading(false);

    if (data.session) {
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData?.nextLevel === "aal2" && aalData?.currentLevel !== "aal2") {
        setShowMfa(true);
        return;
      }
      window.location.href = "/dashboard";
    }
  };

  const handleMfaCancel = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(STORAGE_KEY);
    setShowMfa(false);
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

  return (
    <AuthShell
      title="Chào mừng trở lại"
      subtitle="Đăng nhập vào NXX315 Studio Rewards để tiếp tục."
    >
      <div className="mb-4 rounded-2xl border border-sky-200 bg-sky-50 p-3.5">
        <div className="flex items-start gap-2">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-sky-600" />
          <div className="text-[12px] leading-5 text-sky-800">
            <p className="font-bold">Lưu ý</p>
            <p className="mt-1">
              Nếu bạn đã từng tạo tài khoản trên thiết bị này, vui lòng đăng nhập
              lại tài khoản <b>cũ</b>. Mỗi thiết bị chỉ được dùng 1 tài khoản.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
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
          placeholder="Mật khẩu"
          className="w-full rounded-full border border-slate-300 bg-white px-5 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500"
        />

        {error && (
          <p className="rounded-full bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99] disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
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

      <SocialRow onSelect={handleSocial} />

      <p className="mt-6 text-center text-sm text-slate-500">
        Chưa có tài khoản?{" "}
        <Link to="/register" className="font-semibold text-slate-900 hover:underline">
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
