import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import { Loader2, ShieldCheck } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMFA, setShowMFA] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaError, setMfaError] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session) {
        // Kiểm tra MFA
        const { data: mfaData } = await supabase.auth.mfa.listFactors();
        const verifiedFactors = mfaData.totp?.filter(f => f.status === 'verified');
        
        if (verifiedFactors && verifiedFactors.length > 0) {
          const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
          if (aalData.currentLevel === 'aal1') {
            setMfaFactorId(verifiedFactors[0].id);
            setShowMFA(true);
          }
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleVerifyMFA = async (e) => {
    e?.preventDefault();
    if (!mfaCode || mfaCode.length !== 6) {
      setMfaError("Vui lòng nhập đúng mã 6 số.");
      return;
    }
    setMfaError("");
    setMfaLoading(true);

    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: mfaFactorId,
    });

    if (challengeError) {
      setMfaLoading(false);
      setMfaError("Lỗi xác minh: " + challengeError.message);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: mfaFactorId,
      challengeId: challengeData.id,
      code: mfaCode,
    });

    setMfaLoading(false);
    if (verifyError) {
      setMfaError("Mã không đúng hoặc đã hết hạn.");
      return;
    }
    setShowMFA(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b1220]">
        <Loader2 size={32} className="animate-spin text-sky-400" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Nếu cần MFA, hiện form nhập mã
  if (showMFA) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b1220] px-4 text-white">
        <div className="w-full max-w-sm rounded-3xl bg-white/10 p-6 text-center backdrop-blur-md">
          <ShieldCheck size={40} className="mx-auto text-sky-400" />
          <h1 className="mt-4 text-xl font-bold">Xác minh 2 bước</h1>
          <p className="mt-2 text-sm text-gray-400">Nhập mã 6 số từ Google Authenticator</p>
          
          <form onSubmit={handleVerifyMFA} className="mt-6 space-y-4">
            <input
              type="text"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Mã 6 số"
              maxLength={6}
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 text-center text-lg tracking-[0.5em] outline-none focus:border-sky-400"
            />
            {mfaError && <p className="text-sm text-rose-400">{mfaError}</p>}
            <button
              type="submit"
              disabled={mfaLoading}
              className="w-full rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 py-3.5 font-bold shadow-lg disabled:opacity-60"
            >
              {mfaLoading ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Xác nhận"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
