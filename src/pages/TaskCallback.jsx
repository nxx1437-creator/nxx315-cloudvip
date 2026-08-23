import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, Coins, ShieldCheck } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";

// Site Key CÔNG KHAI của reCAPTCHA — an toàn khi để lộ trong code frontend.
const RECAPTCHA_SITE_KEY = "6LeWCZQtAAAAAHFMcZ7gCgrmRvkuiIrqWq7Odmrm";

export default function TaskCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: "captcha", message: "", reward: 0 });
  const widgetIdRef = useRef(null);
  const token = params.get("token");

  // Tải script reCAPTCHA của Google và vẽ ô checkbox
  useEffect(() => {
    if (!token) {
      setState({ status: "error", message: "Thiếu mã Token trong đường dẫn.", reward: 0 });
      return;
    }

    const renderWidget = () => {
      if (window.grecaptcha && document.getElementById("recaptcha-box") && widgetIdRef.current === null) {
        widgetIdRef.current = window.grecaptcha.render("recaptcha-box", {
          sitekey: RECAPTCHA_SITE_KEY,
          callback: handleCaptchaSolved,
        });
      }
    };

    if (window.grecaptcha && window.grecaptcha.render) {
      renderWidget();
    } else {
      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js";
      script.async = true;
      script.defer = true;
      window.onRecaptchaLoad = renderWidget;
      script.onload = renderWidget;
      document.body.appendChild(script);
    }
  }, [token]);

  const handleCaptchaSolved = async (captchaToken) => {
    setState({ status: "verifying", message: "", reward: 0 });

    const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-recaptcha", {
      body: { captchaToken },
    });

    if (verifyError || !verifyData?.success) {
      setState({ status: "error", message: "Xác minh captcha thất bại, vui lòng thử lại.", reward: 0 });
      return;
    }

    const { data, error } = await supabase.rpc("consume_task_token", { p_token: token });
    if (error) {
      setState({ status: "error", message: error.message, reward: 0 });
      return;
    }
    const row = data?.[0];
    if (row?.success) {
      setState({ status: "success", message: row.message, reward: row.reward_coins });
    } else {
      setState({ status: "error", message: row?.message || "Xác thực thất bại.", reward: 0 });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-sky-50 via-white to-white px-6 text-center font-[Be_Vietnam_Pro]">
      {state.status === "captcha" && (
        <>
          <ShieldCheck size={36} className="text-sky-500" />
          <h1 className="mt-4 text-lg font-bold text-slate-900">Xác nhận bạn không phải bot</h1>
          <p className="mt-1.5 text-sm text-slate-500">Tick vào ô bên dưới để nhận thưởng nhé</p>
          <div id="recaptcha-box" className="mt-5" />
        </>
      )}

      {state.status === "verifying" && (
        <>
          <Loader2 size={36} className="animate-spin text-sky-500" />
          <p className="mt-4 text-sm text-slate-500">Đang xác thực...</p>
        </>
      )}

      {state.status === "success" && (
        <>
          <CheckCircle2 size={48} className="text-emerald-500" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">{state.message}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-lg font-semibold text-amber-600">
            <Coins size={18} /> +{state.reward} Coin
          </p>
        </>
      )}

      {state.status === "error" && (
        <>
          <XCircle size={48} className="text-rose-500" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">Không thể nhận thưởng</h1>
          <p className="mt-2 text-sm text-slate-500">{state.message}</p>
        </>
      )}

      <button
        onClick={() => navigate("/tasks")}
        className="mt-8 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/30"
      >
        Quay lại Nhiệm vụ
      </button>
    </div>
  );
                }
