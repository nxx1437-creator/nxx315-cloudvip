import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import AuthShell from "../components/AuthShell.jsx";
import SocialRow from "../components/SocialRow.jsx";
import { supabase } from "../lib/supabaseClient.js";
import { getDeviceId } from "../lib/deviceId.js";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // State cho màn hình MFA
  const [showMFA, setShowMFA] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaFactorId, setMfaFactorId] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);

  // Hàm kiểm tra và xử lý MFA sau khi đăng nhập thành công
  const handlePostLogin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: mfaData } = await supabase.auth.mfa.listFactors();
    const verifiedFactors = mfaData.totp?.filter(f => f.status === 'verified');

    if (verifiedFactors && verifiedFactors.length > 0) {
      setMfaFactorId(verifiedFactors[0].id);
      setShowMFA(true);
    } else {
      navigate("/dashboard");
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.email || !form.password) {
      setError("Vui lòng nhập đầy đủ Email và mật khẩu.");
      return;
    }
    setError("");
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    setLoading(false);
    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "Email hoặc mật khẩu không đúng."
          : authError.message
      );
      return;
    }
    supabase.functions.invoke("record-device", {
      body: { deviceId: getDeviceId(), userAgent: navigator.userAgent },
    }).catch(() => {});
    navigate("/dashboard");

  const handleSocial = async (provider, supported) => {
    setError("");
    if (!supported) {
      setError("Đăng nhập bằng TikTok sắp ra mắt, bạn dùng cách khác giúp mình nhé.");
      return;
    }
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      // 👇 ĐỔI THÀNH /login ĐỂ NÓ QUAY LẠI KIỂM TRA MFA
      options: { redirectTo: `${window.location.origin}/login` }, 
    });
    if (authError) setError(authError.message);
  };

  // Xác nhận mã MFA
  const handleVerifyMFA = async (e) => {
    e?.preventDefault();
    if (!mfaCode || mfaCode.length !== 6) {
      setError("Vui lòng nhập đúng mã 6 số.");
      return;
    }
    setError("");
    setMfaLoading(true);

    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: mfaFactorId,
    });

    if (challengeError) {
      setMfaLoading(false);
      setError("Lỗi xác minh: " + challengeError.message);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: mfaFactorId,
      challengeId: challengeData.id,
      code: mfaCode,
    });

    setMfaLoading(false);
    if (verifyError) {
      setError("Mã xác minh không đúng hoặc đã hết hạn.");
      return;
    }

    navigate("/dashboard");
  };

  // Nếu đang ở màn hình MFA, hiển thị form nhập mã
  if (showMFA) {
    return (
      <AuthShell
        title="Xác minh 2 bước"
        subtitle="Nhập mã từ ứng dụng Google Authenticator"
        promo={{
          heading: "Bảo mật nâng cao",
          body: "Tài khoản của bạn đang được bảo vệ bằng xác minh 2 bước.",
          ctaLabel: "Quay lại đăng nhập",
          ctaHref: "/login",
        }}
      >
        <form onSubmit={handleVerifyMFA} className="mt-6 space-y-4">
          <div className="relative">
            <ShieldCheck size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sky-300/50" />
            <input
              type="text"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Mã 6 số"
              maxLength={6}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-center text-lg tracking-[0.5em] text-white placeholder:text-sky-200/30 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
            />
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={mfaLoading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition hover:brightness-110 disabled:opacity-60"
          >
            {mfaLoading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
            Xác nhận và đăng nhập
          </button>
        </form>
      </AuthShell>
    );
  }

  // Giao diện đăng nhập thông thường
  return (
    <AuthShell
      title="Đăng nhập"
      subtitle="Đăng nhập với tài khoản mạng xã hội"
      promo={{
        heading: "Một tài khoản cho mọi nhiệm vụ",
        body: "Lần đầu tiên ở đây? Tạo tài khoản để bắt đầu kiếm Coin ngay hôm nay.",
        ctaLabel: "Đăng ký",
        ctaHref: "/register",
      }}
    >
      <SocialRow onSelect={handleSocial} />

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="relative">
          <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sky-300/50" />
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-sky-200/30 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <Lock size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sky-300/50" />
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Mật khẩu"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-11 text-sm text-white placeholder:text-sky-200/30 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sky-300/50 hover:text-sky-200"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            aria-label="Đăng nhập"
            className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-sky-500/30 transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
          </button>
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <div className="text-right">
          <Link to="/forgot-password" className="text-xs font-medium text-sky-400 hover:underline">
            Quên mật khẩu?
          </Link>
        </div>
      </form>
    </AuthShell>
  );
    }
