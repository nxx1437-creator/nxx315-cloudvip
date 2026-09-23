import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Coins,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";

const RECAPTCHA_SITE_KEY = "6LdDVZQtAAAAAPtq_OTF3sAMkjmUphIIQkRPbwWh";
const CANCEL_TIMEOUT_SECONDS = 30; // Hủy token sau 30s không xác nhận
const MIN_TIME_AWAY_SECONDS = 30; // Phải ở lại tab ít nhất 30s
const REDIRECT_DELAY_MS = 5000; // Chuyển hướng sau 5 giây

export default function TaskCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState({
    status: "idle", // idle → captcha → verifying → success / error / cancelled
    message: "",
    reward: 0,
  });
  const [countdown, setCountdown] = useState(CANCEL_TIMEOUT_SECONDS);
  const [captchaReady, setCaptchaReady] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const widgetIdRef = useRef(null);
  const timerRef = useRef(null);
  const redirectTimerRef = useRef(null);
  const cancelledRef = useRef(false);
  const token = params.get("token");

  // Đo thời gian ở tab này
  const enteredAtRef = useRef(Date.now());

  // ✅ Chỉ bắt đầu đếm ngược khi user bấm "Xác minh và thưởng"
  const startCancelCountdown = () => {
    if (timerRef.current) return; // đã chạy rồi thì thôi

    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          if (!cancelledRef.current) {
            cancelToken("timeout");
          }
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  // Hủy token
  const cancelToken = async (reason) => {
    if (cancelledRef.current) return;
    cancelledRef.current = true;

    try {
      const sessionRes = await supabase.auth.getSession();
      const accessToken = sessionRes.data.session?.access_token;

      await fetch(
        "https://rwglwovohbyqmbbzdvdj.supabase.co/functions/v1/cancel-task",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ token, reason }),
        }
      );
    } catch (err) {
      console.error("cancel-task error:", err);
    }

    setState({
      status: "cancelled",
      message:
        reason === "timeout"
          ? "Đã hết thời gian xác nhận. Token đã bị hủy."
          : "Đã hủy.",
      reward: 0,
    });
  };

  // Mark token as redirected khi vào trang
  useEffect(() => {
    if (!token) {
      setState({
        status: "error",
        message: "Thiếu mã Token trong đường dẫn.",
        reward: 0,
      });
      return;
    }

    const markRedirected = async () => {
      try {
        const sessionRes = await supabase.auth.getSession();
        const accessToken = sessionRes.data.session?.access_token;
        await fetch(
          "https://rwglwovohbyqmbbzdvdj.supabase.co/functions/v1/mark-task-redirected",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ token }),
          }
        );
      } catch (err) {
        console.error("mark-task-redirected error:", err);
      }
    };
    markRedirected();
  }, [token]);

  // ✅ Load reCAPTCHA script trước (chưa render widget)
  useEffect(() => {
    if (window.grecaptcha) {
      setCaptchaReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => setCaptchaReady(true);
    document.body.appendChild(script);
  }, []);

  // ✅ Render captcha khi state = "captcha"
  useEffect(() => {
    if (state.status !== "captcha") return;
    if (!captchaReady) return;
    if (!window.grecaptcha) return;

    window.grecaptcha.ready(() => {
      if (
        document.getElementById("recaptcha-box") &&
        widgetIdRef.current === null
      ) {
        widgetIdRef.current = window.grecaptcha.render("recaptcha-box", {
          sitekey: RECAPTCHA_SITE_KEY,
          callback: handleCaptchaSolved,
        });
      }
    });
  }, [state.status, captchaReady]);

  // ✅ Auto redirect sau 5 giây khi success
  useEffect(() => {
    if (state.status !== "success") return;

    setRedirectCountdown(5);
    redirectTimerRef.current = setInterval(() => {
      setRedirectCountdown((c) => {
        if (c <= 1) {
          clearInterval(redirectTimerRef.current);
          navigate("/tasks");
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(redirectTimerRef.current);
  }, [state.status, navigate]);

  // Cleanup
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(redirectTimerRef.current);
    };
  }, []);

  // ✅ User bấm "Xác minh và thưởng"
  const handleStartVerify = () => {
    setState({ status: "captcha", message: "", reward: 0 });
    startCancelCountdown();
  };

  // ✅ Xử lý khi user tick captcha
  const handleCaptchaSolved = async (captchaToken) => {
    clearInterval(timerRef.current);
    setState({ status: "verifying", message: "", reward: 0 });

    try {
      const timeAway = Math.floor((Date.now() - enteredAtRef.current) / 1000);

      const sessionRes = await supabase.auth.getSession();
      const accessToken = sessionRes.data.session?.access_token;

      const res = await fetch(
        "https://rwglwovohbyqmbbzdvdj.supabase.co/functions/v1/rapid-handler",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            captchaToken: captchaToken,
            token: token,
            time_away_seconds: timeAway,
          }),
        }
      );

      const data = await res.json();

      cancelledRef.current = true;

      if (data?.success) {
        setState({
          status: "success",
          message: data.message || "Hoàn thành nhiệm vụ!",
          reward: data.reward || 0,
        });
      } else {
        setState({
          status: "error",
          message: data?.error || "Xác minh thất bại!",
          reward: 0,
        });
      }
    } catch (err) {
      cancelledRef.current = true;
      setState({ status: "error", message: err.message, reward: 0 });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-sky-50 via-white to-white px-6 text-center font-[Be_Vietnam_Pro]">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        {/* ================= IDLE: Màn hình chờ, có nút "Xác minh và thưởng" ================= */}
        {state.status === "idle" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-50">
              <ShieldCheck size={32} className="text-sky-500" />
            </div>
            <h1 className="mt-4 text-xl font-bold text-slate-900">
              Xác minh nhiệm vụ
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              LINK4M
            </p>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="flex items-center justify-center gap-2 text-lg font-bold text-amber-600">
                <Coins size={20} /> +{state.reward || 360} đ
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Phần thưởng khi xác thực thành công
              </p>
            </div>

            <button
              onClick={handleStartVerify}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-sky-500/30 transition hover:brightness-110"
            >
              <CheckCircle2 size={18} />
              Xác minh và thưởng
            </button>
          </>
        )}

        {/* ================= CAPTCHA ================= */}
        {state.status === "captcha" && (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-50">
              <ShieldCheck size={28} className="text-sky-500" />
            </div>
            <h1 className="mt-4 text-lg font-bold text-slate-900">
              Xác nhận bạn không phải bot
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Tick vào ô bên dưới để nhận thưởng nhé
            </p>

            <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <Clock size={16} className="text-amber-600" />
              <p className="text-sm font-semibold text-amber-700">
                Còn <span className="text-lg font-bold">{countdown}s</span> để
                xác nhận
              </p>
            </div>

            <div id="recaptcha-box" className="mt-5 flex justify-center" />

            {countdown <= 10 && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-left">
                <AlertTriangle
                  size={14}
                  className="mt-0.5 shrink-0 text-rose-500"
                />
                <p className="text-xs font-semibold text-rose-700">
                  Sắp hết thời gian! Xác nhận ngay để không bị hủy.
                </p>
              </div>
            )}
          </>
        )}

        {/* ================= VERIFYING ================= */}
        {state.status === "verifying" && (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-50">
              <Loader2 size={28} className="animate-spin text-sky-500" />
            </div>
            <h1 className="mt-4 text-lg font-bold text-slate-900">
              Đang xác thực...
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Vui lòng đợi trong giây lát
            </p>
          </>
        )}

        {/* ================= SUCCESS ================= */}
        {state.status === "success" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 size={36} className="text-emerald-500" />
            </div>
            <h1 className="mt-4 text-xl font-bold text-slate-900">
              {state.message}
            </h1>
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-4 py-2 text-lg font-bold text-amber-600">
              <Coins size={20} /> +{state.reward} Coin
            </p>
            <p className="mt-3 text-xs text-slate-400">
              Coin đã được cộng vào ví của bạn
            </p>

            {/* ✅ Auto redirect countdown */}
            <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
              <Sparkles size={16} className="text-sky-600" />
              <p className="text-sm font-semibold text-sky-700">
                Tự động quay lại sau{" "}
                <span className="text-lg font-bold">{redirectCountdown}s</span>
              </p>
            </div>
          </>
        )}

        {/* ================= ERROR ================= */}
        {state.status === "error" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
              <XCircle size={36} className="text-rose-500" />
            </div>
            <h1 className="mt-4 text-lg font-bold text-slate-900">
              Không thể nhận thưởng
            </h1>
            <p className="mt-2 text-sm text-slate-500">{state.message}</p>
          </>
        )}

        {/* ================= CANCELLED ================= */}
        {state.status === "cancelled" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Clock size={36} className="text-slate-500" />
            </div>
            <h1 className="mt-4 text-lg font-bold text-slate-900">
              Đã hủy nhiệm vụ
            </h1>
            <p className="mt-2 text-sm text-slate-500">{state.message}</p>
            <p className="mt-3 text-xs text-slate-400">
              Bạn cần xác nhận trong vòng 30 giây sau khi mở trang này
            </p>
          </>
        )}

        {/* ✅ Chỉ hiện nút quay lại khi không phải success */}
        {state.status !== "success" && (
          <button
            onClick={() => navigate("/tasks")}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-sky-500/30 transition hover:brightness-110"
          >
            Quay lại Nhiệm vụ
          </button>
        )}
      </div>
    </div>
  );
  }
