import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, User } from "lucide-react";
import AuthShell from "../components/AuthShell.jsx";
import { supabase } from "../lib/supabaseClient.js";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  const handleSendCode = async (e) => {
    e?.preventDefault();
    if (!email.trim()) {
      setError("Vui lòng nhập email.");
      return;
    }
    setError("");
    setLoading(true);

    const { error: sendError } = await supabase.auth.resetPasswordForEmail(email.trim());

    setLoading(false);
    if (sendError) {
      setError(sendError.message);
      return;
    }

    setStep(2);
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) {
          clearInterval(timer);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const handleDigitChange = (index, value) => {
    const clean = value.replace(/\D/g, "").slice(0, 1);
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    setError("");
    if (clean && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = text.split("");
    while (next.length < 6) next.push("");
    setDigits(next);
    inputRefs.current[Math.min(text.length, 5)]?.focus();
  };

  const handleVerifyCode = async (e) => {
    e?.preventDefault();
    const code = digits.join("");
    if (code.length !== 6) {
      setError("Vui lòng nhập đủ 6 số.");
      return;
    }

    setError("");
    setLoading(true);

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code,
      type: "recovery",
    });

    setLoading(false);

    if (verifyError) {
      setError("Mã không đúng hoặc đã hết hạn. Kiểm tra lại hoặc gửi mã mới.");
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", data.user.id)
      .single();

    setUsername(profileData?.username || data.user.email.split("@")[0]);
    setStep(3);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setError("");
    const { error: resendError } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);
    if (resendError) {
      setError(resendError.message);
      return;
    }
    setDigits(["", "", "", "", "", ""]);
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) {
          clearInterval(timer);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const handleUpdatePassword = async (e) => {
    e?.preventDefault();
    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setError("");
    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setStep(4);
    setTimeout(() => navigate("/dashboard"), 1500);
  };

  return (
    <AuthShell title="Khôi phục mật khẩu" subtitle="Chỉ vài bước là xong">
      {step === 1 && (
        <form onSubmit={handleSendCode} className="mt-6 space-y-4">
          <p className="text-sm text-sky-100/60">
            Nhập email đã đăng ký, mình sẽ gửi mã xác minh đến đó.
          </p>
          <div className="relative">
            <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sky-300/50" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-sky-200/30 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
            />
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Gửi mã xác minh"}
          </button>

          <div className="text-center">
            <Link to="/login" className="text-xs text-sky-400 hover:underline">
              Quay lại đăng nhập
            </Link>
          </div>
        </form>
      )}

      {step === 2 && (
        <>
          <div className="mt-2 flex items-start gap-2.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <Mail size={16} className="mt-0.5 shrink-0 text-sky-300/70" />
            <p className="text-xs leading-5 text-sky-100/70">
              Đã gửi mã 6 số đến <span className="font-semibold text-white">{email}</span>. Sai email?{" "}
              <button onClick={() => setStep(1)} className="text-sky-400 hover:underline">
                Nhập lại
              </button>
            </p>
          </div>

          <form onSubmit={handleVerifyCode} className="mt-6">
            <div className="flex justify-between gap-2">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  maxLength={1}
                  className="h-14 w-12 rounded-2xl border border-white/10 bg-white/[0.04] text-center text-xl font-bold text-white outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
                />
              ))}
            </div>

            {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition hover:brightness-110 disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Xác minh"}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || loading}
              className="mt-3 w-full text-center text-xs font-semibold text-sky-400 hover:underline disabled:cursor-not-allowed disabled:text-sky-400/40 disabled:no-underline"
            >
              {resendCooldown > 0 ? `Gửi lại mã sau ${resendCooldown}s` : "Gửi lại mã"}
            </button>
          </form>
        </>
      )}

      {step === 3 && (
        <>
          <div className="mt-4 flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-lg font-bold text-white">
              {username.charAt(0).toUpperCase()}
            </div>
            <p className="text-sm font-bold text-white">{username}</p>
            <p className="text-xs text-sky-100/50">{email}</p>
          </div>

          <form onSubmit={handleUpdatePassword} className="mt-5 space-y-4">
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sky-300/50" />
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mật khẩu mới"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-11 text-sm text-white placeholder:text-sky-200/30 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sky-300/50 hover:text-sky-200"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sky-300/50" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Xác nhận mật khẩu mới"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-sky-200/30 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
              />
            </div>

            {error && <p className="text-sm text-rose-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition hover:brightness-110 disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Cập nhật mật khẩu"}
            </button>
          </form>
        </>
      )}

      {step === 4 && (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-8 text-center">
          <CheckCircle2 size={36} className="text-emerald-400" />
          <p className="text-sm font-semibold text-emerald-300">
            Đổi mật khẩu thành công! Đang chuyển vào trang chủ...
          </p>
        </div>
      )}
    </AuthShell>
  );
    }
