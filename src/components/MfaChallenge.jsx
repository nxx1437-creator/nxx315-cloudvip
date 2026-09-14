import React, { useState, useEffect } from "react";
import { ShieldCheck, X, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";

export default function MfaChallenge({ onVerified, onCancel }) {
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [factorId, setFactorId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFactor = async () => {
      try {
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (error) throw error;

        const verifiedFactor = data.totp?.find((f) => f.status === "verified");
        if (!verifiedFactor) {
          setError("Bạn chưa bật xác thực 2 bước.");
          setLoading(false);
          return;
        }

        setFactorId(verifiedFactor.id);
      } catch (err) {
        console.error("Load MFA factor error:", err);
        setError("Không thể tải thông tin 2FA.");
      } finally {
        setLoading(false);
      }
    };

    loadFactor();
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    if (code.length !== 6) {
      setError("Vui lòng nhập đủ 6 số.");
      return;
    }

    setVerifying(true);

    try {
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId });

      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code,
      });

      if (verifyError) {
        setError("Mã không đúng hoặc đã hết hạn. Vui lòng thử lại.");
        setVerifying(false);
        return;
      }

      onVerified?.();
    } catch (err) {
      console.error("MFA verify error:", err);
      setError(err.message || "Xác thực thất bại.");
      setVerifying(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
    setError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-500/10">
              <ShieldCheck size={20} className="text-sky-600 dark:text-sky-400" />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Xác thực 2 bước
              </h3>
              <p className="text-xs text-slate-500">
                Bảo vệ tài khoản của bạn
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={20} className="animate-spin text-slate-400" />
          </div>
        ) : (
          <form onSubmit={handleVerify} className="mt-5">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Mở ứng dụng <span className="font-semibold text-slate-800 dark:text-slate-200">Google Authenticator</span> và nhập mã 6 số để tiếp tục.
            </p>

            <div className="mt-4">
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Mã xác thực
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={handleCodeChange}
                placeholder="000000"
                maxLength={6}
                autoFocus
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3.5 text-center font-mono text-2xl font-bold tracking-[0.5em] text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-accent-400 focus:bg-white focus:ring-2 focus:ring-accent-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-600 dark:focus:ring-accent-500/20"
              />
              <div className="mt-1.5 flex justify-between text-[10px] text-slate-400">
                <span>{code.length}/6 số</span>
                <span>Mã hết hạn sau 30 giây</span>
              </div>
            </div>

            {error && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-500/30 dark:bg-rose-500/10">
                <AlertTriangle size={14} className="mt-0.5 shrink-0 text-rose-500" />
                <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                  {error}
                </p>
              </div>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={verifying || code.length !== 6}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent-600 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
              >
                {verifying ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Đang xác thực
                  </>
                ) : (
                  "Xác nhận"
                )}
              </button>
            </div>

            <p className="mt-4 text-center text-[11px] text-slate-400">
              Mất quyền truy cập? Liên hệ hỗ trợ để được giúp đỡ.
            </p>
          </form>
        )}
      </div>
    </div>
  );
                 }
