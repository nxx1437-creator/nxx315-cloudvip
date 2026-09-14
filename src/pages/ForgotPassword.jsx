import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import AuthShell from "../components/AuthShell.jsx";
import OtpInput from "../components/OtpInput.jsx";
import { supabase } from "../lib/supabaseClient.js";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email"); // "email" | "otp"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Gửi OTP
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

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: false },
    });

    setLoading(false);
    if (otpError) {
      setError("Không thể gửi mã. Vui lòng kiểm tra email và thử lại.");
      return;
    }

    setStep("otp");
  };

  // Xác thực OTP + đổi mật khẩu
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

    // Verify OTP
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp,
      type: "email",
    });

    if (verifyError) {
      setLoading(false);
      setError("Mã OTP không đúng hoặc đã hết hạn.");
      return;
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (updateError) {
      setError("Không thể đổi mật khẩu. Vui lòng thử lại.");
      return;
    }

    // Đăng xuất để user login lại với mật khẩu mới
    await supabase.auth.signOut();

    navigate("/login", {
      state: { message: "Đổi mật khẩu thành công! Vui lòng đăng nhập lại." },
    });
  };

  const handleBackToEmail = () => {
    setStep("email");
    setOtp("");
    setNewPassword("");
    setError("");
  };

  return (
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
            className="flex h-13 w-full items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-wait"
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
          {/* OTP Input */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Mã OTP
            </label>
            <OtpInput value={otp} onChange={setOtp} length={6} disabled={loading} />
          </div>

          {/* New Password */}
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
                className="w-full rounded-full border border-slate-300 bg-white py-3.5 pl-11 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500"
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
            className="flex h-13 w-full items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-wait"
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
        <Link to="/login" className="font-semibold text-slate-900 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </AuthShell>
  );
}
