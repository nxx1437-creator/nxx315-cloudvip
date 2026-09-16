import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, Coins, ShieldCheck, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";

const RECAPTCHA_SITE_KEY = "6LdDVZQtAAAAAPtq_OTF3sAMkjmUphIIQkRPbwWh";
const CANCEL_TIMEOUT_SECONDS = 30;   // Hủy token sau 30s không xác nhận
const MIN_TIME_AWAY_SECONDS = 30;    // Phải ở lại tab ít nhất 30s

export default function TaskCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: "captcha", message: "", reward: 0 });
  const [countdown, setCountdown] = useState(CANCEL_TIMEOUT_SECONDS);
  const widgetIdRef = useRef(null);
  const timerRef = useRef(null);
  const cancelledRef = useRef(false);
  const token = params.get("token");

  // Đo thời gian ở tab này — user vào là tính (coi như "đã rời tab Tasks")
  const enteredAtRef = useRef(Date.now());

  // Đếm ngược 30s — nếu không xác nhận thì hủy token
  useEffect(() => {
    if (!token) return;

    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          // Hết giờ — hủy token (nếu chưa xác nhận)
          if (!cancelledRef.current) {
            cancelToken("timeout");
          }
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [token]);

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
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ token, reason }),
        }
      );
    } catch (err) {
      console.error("cancel-task error:", err);
    }

    setState({
      status: "cancelled",
      message: reason === "timeout" ? "Đã hết thời gian xác nhận. Token đã bị hủy." : "Đã hủy.",
      reward: 0,
    });
  };

  // Load reCAPTCHA
  useEffect(() => {
    if (!token) {
      setState({ status: "error", message: "Thiếu mã Token trong đường dẫn.", reward: 0 });
      return;
    }

    // Đánh dấu token đã được provider redirect về (bắt buộc để consume_task_token chấp nhận)
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
              "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ token }),
          }
        );
      } catch (err) {
        console.error("mark-task-redirected error:", err);
      }
    };
    markRedirected();

    const renderWidget = () => {
      window.grecaptcha.ready(() => {
        if (document.getElementById("recaptcha-box") && widgetIdRef.current === null) {
          widgetIdRef.current = window.grecaptcha.render("recaptcha-box", {
            sitekey: RECAPTCHA_SITE_KEY,
            callback: handleCaptchaSolved,
          });
        }
      });
    };

    if (window.grecaptcha) {
      renderWidget();
    } else {
      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js";
      script.async = true;
      script.defer = true;
      script.onload = renderWidget;
      document.body.appendChild(script);
    }
  }, [token]);
    // Xử lý khi user tick captcha
  const handleCaptchaSolved = async (captchaToken) => {
    clearInterval(timerRef.current);
    setState({ status: "verifying", message: "", reward: 0 });

    try {
      // Tính thời gian user đã ở lại trang này
      const timeAway = Math.floor((Date.now() - enteredAtRef.current) / 1000);

      const sessionRes = await supabase.auth.getSession();
      const accessToken = sessionRes.data.session?.access_token;

      const res = await fetch(
        "https://rwglwovohbyqmbbzdvdj.supabase.co/functions/v1/rapid-handler",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            captchaToken: captchaToken,
            token: token,
            time_away_seconds: timeAway,
          }),
        }
      );

      const data = await res.json();

      // Đánh dấu là đã xác nhận — không cho cancel nữa
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

            {/* Đếm ngược */}
            <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
              <Clock size={16} className="text-amber-600" />
              <p className="text-sm font-semibold text-amber-700">
                Còn <span className="text-lg font-bold">{countdown}s</span> để xác nhận
              </p>
            </div>

            <div id="recaptcha-box" className="mt-5 flex justify-center" />

            {countdown <= 10 && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-left">
                <AlertTriangle size={14} className="mt-0.5 shrink-0 text-rose-500" />
                <p className="text-xs font-semibold text-rose-700">
                  Sắp hết thời gian! Xác nhận ngay để không bị hủy.
                </p>
              </div>
            )}
          </>
        )}

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
          </>
        )}

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

        <button
          onClick={() => navigate("/tasks")}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-sky-500/30 transition hover:brightness-110"
        >
          Quay lại Nhiệm vụ
        </button>
      </div>
    </div>
  );
  }
