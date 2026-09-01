import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";
import AuthShell from "../components/AuthShell.jsx";
import { supabase } from "../lib/supabaseClient.js";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  const locked = attempts >= 5;

  useEffect(() => {
    if (!email) navigate("/register", { replace: true });
  }, [email, navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleDigitChange = (index, value) => {
    const clean = value.replace(/\D/g, "").slice(0, 1);
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    setError("");

    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
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

  const handleVerify = async (e) => {
    e?.preventDefault();
    const code = digits.join("");

    if (code.length !== 6) {
      setError("Vui lòng nhập đủ 6 số.");
      return;
    }

    if (locked) return;

    setVerifying(true);
    setError("");

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "signup",
    });

    setVerifying(false);

    if (verifyError) {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();

      if (nextAttempts >= 5) {
        setError("Bạn đã nhập sai quá 5 lần. Vui lòng đợi ít phút hoặc liên hệ hỗ trợ.");
      } else if (verifyError.message?.toLowerCase().includes("expired")) {
        setError("Mã đã hết hạn. Bấm \"Gửi lại mã\" để nhận mã mới.");
      } else {
        setError(`Mã không đúng. Còn ${5 - nextAttempts} lần thử.`);
      }
      return;
    }

    setSuccess(true);
    setTimeout(() => navigate("/dashboard"), 1500);
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;

    setResending(true);
    setError("");

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    setResending(false);

    if (resendError) {
      setError(resendError.message);
      return;
    }

    setAttempts(0);
    setDigits(["", "", "", "", "", ""]);
    setResendCooldown(60);
  };

  if (!email) return null;

  return (
    <AuthShell
      title="Xác minh email"
      subtitle="Chỉ còn 1 bước nữa thôi"
    >
      {success ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-8 text-center">
          <CheckCircle2 size={36} className="text-emerald-400" />
          <p className="text-sm font-semibold text-emerald-300">
            Xác minh thành công! Đang chuyển vào trang chủ...
          </p>
        </div>
      ) : (
        <>
          <div className="mt-2 flex items-start gap-2.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <Mail size={16} className="mt-0.5 shrink-0 text-sky-300/70" />
            <p className="text-xs leading-5 text-sky-100/70">
              Để đảm bảo đúng là bạn tạo tài khoản, mình đã gửi mã 6 số đến{" "}
              <span className="font-semibold text-white">{email}</span>.{" "}
              Sai email?{" "}
              <Link to="/register" className="text-sky-400 hover:underline">
                Quay lại đăng ký
              </Link>
            </p>
          </div>

          <form onSubmit={handleVerify} className="mt-6">
            <div className="flex justify-between gap-2">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  disabled={locked}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  maxLength={1}
                  className="h-14 w-12 rounded-2xl border border-white/10 bg-white/[0.04] text-center text-xl font-bold text-white outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 disabled:opacity-40"
                />
              ))}
            </div>

            {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}

            <button
              type="submit"
              disabled={verifying || locked}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition hover:brightness-110 disabled:opacity-60"
            >
              {verifying ? <Loader2 size={16} className="animate-spin" /> : "Xác minh"}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || resending}
              className="mt-3 w-full text-center text-xs font-semibold text-sky-400 hover:underline disabled:cursor-not-allowed disabled:text-sky-400/40 disabled:no-underline"
            >
              {resending
                ? "Đang gửi..."
                : resendCooldown > 0
                ? `Gửi lại mã sau ${resendCooldown}s`
                : "Gửi lại mã"}
            </button>
          </form>
        </>
      )}
    </AuthShell>
  );
    }
