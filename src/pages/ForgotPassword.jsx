import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import AuthShell from "../components/AuthShell.jsx";
import OtpInput from "../components/OtpInput.jsx";
import MfaChallenge from "../components/MfaChallenge.jsx";
import { supabase } from "../lib/supabaseClient.js";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showMfaModal, setShowMfaModal] = useState(false);

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!email.trim()) {
      setError("Vui lòng nhập email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email không hợp lệ.");
      return;
    }
    setError("");
    setLoading(true);

    // ✅ Dùng resetPasswordForEmail → gửi template "Reset Password"
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim()
    );

    setLoading(false);
    if (resetError) {
      console.error("Send OTP error:", resetError);
      setError(resetError.message || "Không thể gửi mã. Vui lòng thử lại.");
      return;
    }

    setStep("otp");
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    if (otp.length !== 6) {
      setError("Vui lòng nhập đủ 6 số.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      // ✅ Verify OTP cho Reset Password
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp,
        type: "recovery",
      });

      if (verifyError) {
        console.error("Verify OTP error:", verifyError);
        setLoading(false);
        setError(verifyError.message || "Mã OTP không đúng hoặc đã hết hạn.");
        return;
      }

      // Kiểm tra MFA
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const hasMfa = factorsData?.totp?.some((f) => f.status === "verified");

      if (hasMfa) {
        setLoading(false);
        setShowMfaModal(true);
        return;
      }

      await updatePassword();
    } catch (err) {
      console.error("Unexpected error:", err);
      setLoading(false);
      setError(err.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const updatePassword = async () => {
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);
    setShowMfaModal(false);

    if (updateError) {
      console.error("Update password error:", updateError);
      setError(updateError.message || "Không thể đổi mật khẩu. Vui lòng thử lại.");
      return;
    }

    await supabase.auth.signOut();
    navigate("/login", {
      state: { message: "Đổi mật khẩu thành công! Vui lòng đăng nhập lại." },
    });
  };

  const handleMfaVerified = () => {
    setLoading(true);
    updatePassword();
  };

  const handleBackToEmail = () => {
    setStep("email");
    setOtp("");
    setNewPassword("");
    setError("");
    setShowMfaModal(false);
  };

  return (
    <>
      <AuthShell
        title="Khôi phục mật khẩu"
        subtitle={
          step === "email"
            ? "Nhập email để nhận mã xác minh."
            : `Nhập mã OTP đã gửi đến ${email}`
        }
      >
        {step === "email" && (
          <form onSubmit={handleSendOtp} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email của bạn"
              autoFocus
              className="h-14 w-full rounded-full border border-slate-300 bg-white px-5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500"
            />

            {error && (
              <p className="rounded-full bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-14 w-full items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-wait"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                "Gửi mã xác minh"
              )}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Mã OTP
              </label>
              <OtpInput
                value={otp}
                onChange={setOtp}
                length={6}
                disabled={loading}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Mật khẩu mới
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ít nhất 6 ký tự"
                  className="h-14 w-full rounded-full border border-slate-300 bg-white pl-11 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-full bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-14 w-full items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-wait"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                "Xác nhận đổi mật khẩu"
              )}
            </button>

            <button
              type="button"
              onClick={handleBackToEmail}
              className="flex w-full items-center justify-center gap-1.5 py-2 text-xs font-medium text-slate-500 transition hover:text-slate-700"
            >
              <ArrowLeft size={12} />
              Đổi email khác
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          Nhớ mật khẩu rồi?{" "}
          <Link
            to="/login"
            className="font-semibold text-slate-900 hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </AuthShell>

      {showMfaModal && (
        <MfaChallenge
          onVerified={handleMfaVerified}
          onCancel={() => {
            setShowMfaModal(false);
            setError("Bạn đã huỷ xác thực 2 lớp. Vui lòng thử lại.");
          }}
        />
      )}
    </>
  );
  }
