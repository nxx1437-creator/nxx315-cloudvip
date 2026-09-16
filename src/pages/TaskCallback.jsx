import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ShieldCheck,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Coins,
  ArrowLeft,
} from "lucide-react";

import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { supabase } from "../lib/supabaseClient.js";

// =====================================================
// RECAPTCHA SCRIPT LOADER
// =====================================================

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

function loadRecaptchaScript() {
  if (window.grecaptcha) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector(
      'script[src^="https://www.google.com/recaptcha/api.js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Không tải được reCAPTCHA"));
    document.head.appendChild(script);
  });
}
// =====================================================
// MAIN COMPONENT
// =====================================================

export default function TaskCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");
  const timeFromUrl = parseInt(searchParams.get("time") || "0", 10);

  const [step, setStep] = useState("loading"); // loading | captcha | success | error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reward, setReward] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(timeFromUrl);

  const redirectedRef = useRef(false);

  // =====================================================
  // BƯỚC 1: Đánh dấu user đã qua link provider (redirected)
  // =====================================================
  useEffect(() => {
    if (!token) {
      setStep("error");
      setError("Thiếu token. Vui lòng làm lại nhiệm vụ.");
      return;
    }

    if (redirectedRef.current) return;
    redirectedRef.current = true;

    const markRedirected = async () => {
      try {
        const { error: fnError } = await supabase.functions.invoke(
          "mark-task-redirected",
          {
            body: { token },
          }
        );

        if (fnError) {
          console.error("mark-task-redirected error:", fnError);
          // Không throw — vẫn cho user thử captcha
        }

        setStep("captcha");
      } catch (err) {
        console.error("Mark redirected error:", err);
        setStep("captcha"); // Vẫn cho thử
      }
    };

    markRedirected();
  }, [token]);

  // =====================================================
  // BƯỚC 2: Verify captcha + consume token
  // =====================================================
  const handleVerify = async () => {
    if (!token) {
      setError("Thiếu token.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Load reCAPTCHA
      await loadRecaptchaScript();

      if (!window.grecaptcha) {
        throw new Error("reCAPTCHA chưa sẵn sàng. Vui lòng thử lại.");
      }

      const captchaToken = await new Promise((resolve, reject) => {
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(RECAPTCHA_SITE_KEY, { action: "task_callback" })
            .then(resolve)
            .catch(reject);
        });
      });

      // Gọi rapid-handler
      const { data, error: fnError } = await supabase.functions.invoke(
        "rapid-handler",
        {
          body: {
            captchaToken,
            token,
            time_away_seconds: elapsedTime,
          },
        }
      );

      if (fnError) {
        throw new Error(fnError.message || "Không thể xác thực.");
      }

      if (!data?.success) {
        const msg = data?.error || data?.message || "Xác thực thất bại.";
        setError(msg);
        setStep("error");
        return;
      }

      // Thành công
      setReward(data.reward || 0);
      setStep("success");

      // Xóa localStorage pending
      localStorage.removeItem("pending_task_token");
      localStorage.removeItem("pending_task_time");
      localStorage.removeItem("pending_task_id");
    } catch (err) {
      console.error("Verify error:", err);
      setError(err?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
      setStep("error");
    } finally {
      setLoading(false);
    }
  };
  return (
  <div className="min-h-screen bg-[#F5F7FB] pb-24">
    <TopHeader />

    <main className="mx-auto w-full max-w-md px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate("/tasks")}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Quay lại nhiệm vụ
      </button>

      {/* Card */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-lg shadow-slate-200/50">
        {/* Header */}
        <div className="bg-gradient-to-br from-sky-400 to-blue-600 p-6 text-center text-white">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur">
            {step === "success" ? (
              <CheckCircle2 size={32} />
            ) : step === "error" ? (
              <XCircle size={32} />
            ) : (
              <ShieldCheck size={32} />
            )}
          </div>
          <h1 className="mt-4 text-xl font-black">
            {step === "loading" && "Đang kiểm tra..."}
            {step === "captcha" && "Xác minh nhiệm vụ"}
            {step === "success" && "Hoàn thành!"}
            {step === "error" && "Có lỗi xảy ra"}
          </h1>
          <p className="mt-1 text-sm text-sky-100">
            {step === "loading" && "Vui lòng đợi trong giây lát"}
            {step === "captcha" && "Xác minh bạn không phải robot"}
            {step === "success" && "Coin đã được cộng vào tài khoản"}
            {step === "error" && "Vui lòng thử lại hoặc liên hệ hỗ trợ"}
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* LOADING */}
          {step === "loading" && (
            <div className="flex flex-col items-center py-6">
              <Loader2 size={36} className="animate-spin text-sky-500" />
              <p className="mt-4 text-sm text-slate-500">
                Đang xác minh trạng thái nhiệm vụ...
              </p>
            </div>
          )}

          {/* CAPTCHA */}
          {step === "captcha" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    size={20}
                    className="mt-0.5 shrink-0 text-sky-600"
                  />
                  <div>
                    <p className="text-sm font-bold text-sky-900">
                      Xác minh nhanh
                    </p>
                    <p className="mt-1 text-xs leading-5 text-sky-700">
                      Bấm nút bên dưới để xác minh bạn không phải robot.
                      Hệ thống sẽ kiểm tra và cộng Coin ngay sau đó.
                    </p>
                  </div>
                </div>
              </div>

              {elapsedTime > 0 && (
                <div className="rounded-2xl bg-slate-50 p-3.5 text-center">
                  <p className="text-xs text-slate-500">
                    Thời gian đã ở tab: <b>{elapsedTime}s</b>
                  </p>
                  {elapsedTime < 45 && (
                    <p className="mt-1 text-xs font-semibold text-amber-600">
                      ⚠️ Cần tối thiểu 45s
                    </p>
                  )}
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5">
                  <p className="text-xs font-semibold text-rose-700">
                    {error}
                  </p>
                </div>
              )}

              <button
                onClick={handleVerify}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-600 py-4 text-sm font-black text-white shadow-lg shadow-sky-500/30 transition hover:brightness-110 disabled:cursor-wait disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Đang xác minh...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Xác minh & nhận thưởng
                  </>
                )}
              </button>
            </div>
          )}

          {/* SUCCESS */}
          {step === "success" && (
            <div className="space-y-5">
              <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-center text-white">
                <Coins size={36} className="mx-auto mb-3" />
                <p className="text-sm text-emerald-100">Bạn nhận được</p>
                <p className="mt-1 text-4xl font-black">+{reward}</p>
                <p className="mt-1 text-sm font-bold text-emerald-100">
                  Coin
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />
                  <div>
                    <p className="text-sm font-bold text-emerald-900">
                      Nhiệm vụ hoàn thành!
                    </p>
                    <p className="mt-1 text-xs leading-5 text-emerald-700">
                      Coin đã được cộng vào ví CloudVIP. Bạn có thể tiếp tục
                      làm nhiệm vụ khác.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/tasks")}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Về nhiệm vụ
                </button>
                <button
                  onClick={() => navigate("/wallet")}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-600 py-3.5 text-sm font-bold text-white shadow-md shadow-sky-500/30"
                >
                  Xem ví
                </button>
              </div>
            </div>
          )}
                      {/* ERROR */}
            {step === "error" && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      size={20}
                      className="mt-0.5 shrink-0 text-rose-600"
                    />
                    <div>
                      <p className="text-sm font-bold text-rose-900">
                        Không thể xác minh
                      </p>
                      <p className="mt-1 text-xs leading-5 text-rose-700">
                        {error || "Vui lòng thử lại sau."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setError("");
                      setStep("captcha");
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-600 py-3.5 text-sm font-bold text-white shadow-md shadow-sky-500/30"
                  >
                    <ShieldCheck size={16} />
                    Thử lại
                  </button>

                  <button
                    onClick={() => navigate("/tasks")}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    <ArrowLeft size={16} />
                    Quay lại nhiệm vụ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Help note */}
        <p className="mt-5 text-center text-xs text-slate-400">
          Cần hỗ trợ? Liên hệ bộ phận CSKH qua mục{" "}
          <button
            onClick={() => navigate("/support")}
            className="font-semibold text-sky-500 hover:underline"
          >
            Hỗ trợ
          </button>
        </p>
      </main>

      <BottomNav />
    </div>
  );
}
