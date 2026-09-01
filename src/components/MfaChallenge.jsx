import React, { useEffect, useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";

import { supabase } from "../lib/supabaseClient.js";

export default function MfaChallenge({ onVerified, onCancel }) {
  const [factorId, setFactorId] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data, error: listError } = await supabase.auth.mfa.listFactors();

      if (listError) {
        setError(listError.message);
        setLoading(false);
        return;
      }

      const factor = data?.totp?.find((f) => f.status === "verified");

      if (!factor) {
        setError("Không tìm thấy phương thức xác thực.");
        setLoading(false);
        return;
      }

      setFactorId(factor.id);

      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId: factor.id });

      if (challengeError) {
        setError(challengeError.message);
        setLoading(false);
        return;
      }

      setChallengeId(challengeData.id);
      setLoading(false);
    };

    init();
  }, []);

  const handleVerify = async (e) => {
    e?.preventDefault();

    if (code.length !== 6) {
      setError("Vui lòng nhập đủ 6 số.");
      return;
    }

    setVerifying(true);
    setError("");

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code,
    });

    setVerifying(false);

    if (verifyError) {
      setError("Mã không đúng hoặc đã hết hạn.");
      setCode("");
      return;
    }

    onVerified();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl dark:bg-slate-900">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-500/10">
          <ShieldCheck size={24} className="text-accent-600" />
        </div>

        <h3 className="mt-3 font-display text-lg font-bold text-slate-900 dark:text-white">
          Xác thực 2 bước
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Nhập mã 6 số từ ứng dụng Authenticator để tiếp tục.
        </p>

        {loading ? (
          <div className="mt-6 flex justify-center">
            <Loader2 size={22} className="animate-spin text-accent-500" />
          </div>
        ) : (
          <form onSubmit={handleVerify} className="mt-4">
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              autoFocus
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-center text-xl font-bold tracking-[0.4em] outline-none focus:border-accent-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />

            {error && <p className="mt-2 text-xs font-medium text-rose-500">{error}</p>}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 rounded-full bg-slate-100 py-2.5 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={verifying || code.length !== 6}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-accent-600 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {verifying ? <Loader2 size={15} className="animate-spin" /> : "Xác nhận"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
             }
