import React, { useState } from "react";
import { X, Phone, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";

export default function PhoneVerifyModal({ onClose, onVerified }) {
  const [step, setStep] = useState("phone"); // phone | otp | success
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    if (!/^[0-9]{10,11}$/.test(phone)) {
      setError("Số điện thoại không hợp lệ (10-11 số).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const sessionRes = await supabase.auth.getSession();
      const accessToken = sessionRes.data.session?.access_token;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-phone`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ action: "send", phone }),
        }
      );

      const data = await res.json();
      if (data.success) {
        setStep("otp");
      } else {
        setError(data.error || "Không thể gửi OTP.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError("OTP phải có 6 số.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const sessionRes = await supabase.auth.getSession();
      const accessToken = sessionRes.data.session?.access_token;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-phone`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ action: "verify", otp }),
        }
      );

      const data = await res.json();
      if (data.success) {
        setStep("success");
        setTimeout(() => {
          if (onVerified) onVerified();
          onClose();
        }, 2000);
      } else {
        setError(data.error || "OTP không đúng.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Xác minh số điện thoại
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {step === "phone" && (
          <>
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-600" />
              <p className="text-[11.5px] leading-5 text-amber-700">
                Bạn cần xác minh số điện thoại để tiếp tục làm nhiệm vụ.
                Mỗi SĐT chỉ dùng cho 1 tài khoản.
              </p>
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="0912345678"
                maxLength={11}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-sky-400 focus:bg-white"
              />
            </div>

            {error && (
              <p className="mt-2 text-xs font-bold text-rose-500">{error}</p>
            )}

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-sky-500/30 disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Phone size={16} />}
              Gửi OTP
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <p className="mt-3 text-xs text-slate-500">
              Mã OTP đã được gửi đến <b>{phone}</b>. Vui lòng nhập mã 6 số.
            </p>

            <div className="mt-4">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Nhập OTP 6 số"
                maxLength={6}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-center text-lg font-bold tracking-widest outline-none focus:border-sky-400 focus:bg-white"
              />
            </div>

            {error && (
              <p className="mt-2 text-xs font-bold text-rose-500">{error}</p>
            )}

            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-sky-500/30 disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Xác minh"}
            </button>
          </>
        )}

        {step === "success" && (
          <div className="mt-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 size={28} className="text-emerald-500" />
            </div>
            <p className="mt-3 text-sm font-bold text-slate-900">
              Xác minh thành công!
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Bạn có thể tiếp tục làm nhiệm vụ.
            </p>
          </div>
        )}
      </div>
    </div>
  );
              }
