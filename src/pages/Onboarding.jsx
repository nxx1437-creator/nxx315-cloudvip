import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, ArrowRight, Loader2, ShieldCheck, CheckCircle2, Info, Gift } from "lucide-react";
import useSession from "../hooks/useSession.js";
import { supabase } from "../lib/supabaseClient.js";

export default function Onboarding() {
  const navigate = useNavigate();
  const { session, loading: sessionLoading } = useSession();

  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [renameNotice, setRenameNotice] = useState("");

  useEffect(() => {
    if (!sessionLoading && !session) {
      navigate("/login", { replace: true });
    }
  }, [sessionLoading, session, navigate]);

  const handleNext = () => {
    if (!username.trim()) {
      setError("Vui lòng nhập tên hiển thị.");
      return;
    }
    if (username.trim().length < 2) {
      setError("Tên hiển thị quá ngắn.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleFinish = async () => {
    if (!agreed) {
      setError("Vui lòng đồng ý với Điều khoản sử dụng để tiếp tục.");
      return;
    }

    setSubmitting(true);
    setError("");

    const { data, error: rpcError } = await supabase.rpc("complete_onboarding", {
      p_user_id: session.user.id,
      p_username: username.trim(),
      p_referral_code: referralCode.trim() || null,
    });
    
    setSubmitting(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    const result = Array.isArray(data) ? data[0] : data;

    if (result?.was_renamed) {
      setRenameNotice(
        `Tên "${username.trim()}" không phù hợp với quy định, hệ thống đã đổi thành "${result.final_username}". Bạn có thể đổi tên khác trong Cài đặt sau.`
      );
      setTimeout(() => navigate("/dashboard"), 2800);
    } else if (result?.referral_bonus > 0) {
      setRenameNotice(`🎉 Bạn nhận được +${result.referral_bonus} Coin từ mã giới thiệu!`);
      setTimeout(() => navigate("/dashboard"), 2200);
    } else {
      navigate("/dashboard");
    }
  if (sessionLoading || !session) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
        <div className="mb-5 flex items-center gap-2">
          <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-sky-400" : "bg-white/10"}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-sky-400" : "bg-white/10"}`} />
        </div>

        {renameNotice ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Info size={32} className="text-amber-400" />
            <p className="text-sm leading-6 text-amber-200">{renameNotice}</p>
            <Loader2 size={18} className="mt-2 animate-spin text-sky-400" />
          </div>
        ) : step === 1 ? (
          <>
            <h1 className="text-xl font-bold text-white">Chào mừng bạn 👋</h1>
            <p className="mt-1 text-sm text-sky-100/60">
              Bạn muốn được gọi là gì trong NXX315 Studio?
            </p>

            <div className="relative mt-5">
              <User size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sky-300/50" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNext()}
                placeholder="Tên hiển thị"
                autoFocus
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-sky-200/30 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
              />
            </div>

            <div className="relative mt-3">
              <Gift size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sky-300/50" />
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="Mã giới thiệu (không bắt buộc)"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm uppercase text-white placeholder:text-sky-200/30 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
              />
            </div>

            {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}

            <button
              onClick={handleNext}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition hover:brightness-110"
            >
              Tiếp tục
              <ArrowRight size={16} />
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={20} className="text-sky-400" />
              <h1 className="text-xl font-bold text-white">Điều khoản sử dụng</h1>
            </div>
            <p className="mt-1 text-sm text-sky-100/60">
              Xin chào <span className="font-semibold text-white">{username.trim()}</span>, trước khi tiếp tục hãy đọc và đồng ý với điều khoản của chúng mình.
            </p>

            <div className="mt-4 max-h-40 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-5 text-sky-100/50">
              Bằng việc sử dụng NXX315 Studio Rewards, bạn đồng ý tuân thủ{" "}
              <a href="/terms" target="_blank" className="text-sky-400 hover:underline">Điều khoản sử dụng</a>{" "}
              và{" "}
              <a href="/privacy" target="_blank" className="text-sky-400 hover:underline">Chính sách quyền riêng tư</a>{" "}
              của chúng mình. Tên hiển thị của bạn có thể bị hệ thống tự động điều chỉnh nếu vi phạm quy định cộng đồng.
            </div>

            <label className="mt-4 flex items-start gap-2.5 text-sm text-sky-100/70">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 accent-sky-500"
              />
              Tôi đã đọc và đồng ý với Điều khoản sử dụng & Chính sách quyền riêng tư.
            </label>

            {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="rounded-2xl border border-white/10 px-4 py-3.5 text-sm font-semibold text-sky-100/70"
              >
                Quay lại
              </button>
              <button
                onClick={handleFinish}
                disabled={submitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition hover:brightness-110 disabled:opacity-60"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : (
                  <>
                    <CheckCircle2 size={16} />
                    Hoàn tất
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
        }
