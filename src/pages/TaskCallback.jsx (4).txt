import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, Coins, ShieldCheck } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";

// Site Key CÔNG KHAI của reCAPTCHA — an toàn khi để lộ trong code frontend.
const RECAPTCHA_SITE_KEY = "6LdDVZQtAAAAAPtq_OTF3sAMkjmUphIIQkRPbwWh";

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

const handleCaptchaSolved = async (captchaToken) => {
  setState({ status: "verifying", message: "", reward: 0 });

  try {
    // Gọi Edge Function rapid-handler với cả captchaToken và token
    const res = await fetch(
      "https://rwglwovohbyqmbbzdvdj.supabase.co/functions/v1/rapid-handler",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ 
          captchaToken: captchaToken,
          token: token 
        }),
      }
    );

    const data = await res.json();

    if (data?.success) {
      setState({ 
        status: "success", 
        message: data.message || "Hoàn thành nhiệm vụ!", 
        reward: data.reward || 0 
      });
    } else {
      setState({ 
        status: "error", 
        message: data?.error || "Xác minh thất bại!", 
        reward: 0 
      });
    }
  } catch (err) {
    setState({ status: "error", message: err.message, reward: 0 });
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
