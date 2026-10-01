import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import AuthField from "../components/AuthField.jsx";
import OtpInput from "../components/OtpInput.jsx";
import MfaChallenge from "../components/MfaChallenge.jsx";
import {
  IconMail,
  IconLock,
  IconArrow,
  IconSpinner,
} from "../components/AuthIcons.jsx";
import { supabase } from "../lib/supabaseClient.js";
import { useI18n } from "../i18n/index.js";

const btnCls =
  "flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3.5 text-[15px] font-bold text-white transition hover:bg-teal-700 active:scale-[0.99] disabled:cursor-wait disabled:opacity-60";

export default function ForgotPassword() {
  const { t } = useI18n();
  const navigate = useNavigate();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  // error = { key } hoặc { raw } -> dịch lúc hiển thị
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMfaModal, setShowMfaModal] = useState(false);

  const fail = (key) => setError({ key });

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!email.trim()) {
      fail("fp.err.email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fail("fp.err.emailInvalid");
      return;
    }
    setError(null);
    setLoading(true);

    // Dùng resetPasswordForEmail -> gửi template "Reset Password"
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim()
    );

    setLoading(false);
    if (resetError) {
      console.error("Send OTP error:", resetError);
      setError(
        resetError.message ? { raw: resetError.message } : { key: "fp.err.sendFail" }
      );
      return;
    }

    setStep("otp");
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    if (otp.length !== 6) {
      fail("fp.err.otp6");
      return;
    }
    if (newPassword.length < 6) {
      fail("fp.err.pwShort");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      // Verify OTP cho Reset Password
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp,
        type: "recovery",
      });

      if (verifyError) {
        console.error("Verify OTP error:", verifyError);
        setLoading(false);
        setError(
          verifyError.message
            ? { raw: verifyError.message }
            : { key: "fp.err.otpWrong" }
        );
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
      setError(err.message ? { raw: err.message } : { key: "err.generic" });
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
      setError(
        updateError.message
          ? { raw: updateError.message }
          : { key: "fp.err.updateFail" }
      );
      return;
    }

    await supabase.auth.signOut();
    navigate("/login", { state: { message: t("fp.success") } });
  };

  const handleMfaVerified = () => {
    setLoading(true);
    updatePassword();
  };

  const handleBackToEmail = () => {
    setStep("email");
    setOtp("");
    setNewPassword("");
    setError(null);
    setShowMfaModal(false);
  };

  const errorBox = error && (
    <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-600">
      {error.raw ?? t(error.key)}
    </p>
  );

  return (
    <>
      <AuthLayout
        title={t("fp.title")}
        subtitle={
          step === "email"
            ? t("fp.subtitleEmail")
            : t("fp.subtitleOtp", { email })
        }
        footer={
          <>
            {t("fp.remember")}{" "}
            <Link
              to="/login"
              className="font-bold text-teal-700 hover:underline"
            >
              {t("reg.signIn")}
            </Link>
          </>
        }
      >
        {step === "email" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <AuthField
              id="fp-email"
              label={t("login.email")}
              icon={<IconMail size={18} />}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("login.emailPh")}
              autoComplete="email"
              autoFocus
            />

            {errorBox}

            <button type="submit" disabled={loading} className={btnCls}>
              {loading ? (
                <IconSpinner size={20} />
              ) : (
                <>
                  {t("fp.send")}
                  <IconArrow size={18} />
                </>
              )}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="mb-2 block text-[12px] font-bold uppercase tracking-wider text-slate-700">
                {t("fp.otp")}
              </label>
              <OtpInput
                value={otp}
                onChange={setOtp}
                length={6}
                disabled={loading}
              />
            </div>

            <AuthField
              id="fp-new-password"
              label={t("fp.newPassword")}
              icon={<IconLock size={18} />}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t("reg.passwordPh")}
              autoComplete="new-password"
              disabled={loading}
            />

            {errorBox}

            <button type="submit" disabled={loading} className={btnCls}>
              {loading ? (
                <IconSpinner size={20} />
              ) : (
                <>
                  {t("fp.confirm")}
                  <IconArrow size={18} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleBackToEmail}
              className="flex w-full items-center justify-center gap-1.5 py-1 text-xs font-semibold text-slate-500 transition hover:text-teal-700"
            >
              <span className="rotate-180">
                <IconArrow size={12} />
              </span>
              {t("fp.changeEmail")}
            </button>
          </form>
        )}
      </AuthLayout>

      {showMfaModal && (
        <MfaChallenge
          onVerified={handleMfaVerified}
          onCancel={() => {
            setShowMfaModal(false);
            fail("fp.err.mfaCancel");
          }}
        />
      )}
    </>
  );
            }
