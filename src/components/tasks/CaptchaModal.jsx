import React, { useEffect, useRef, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";
import { SUPABASE_URL, RECAPTCHA_SITE_KEY } from "../../lib/taskHelpers.js";
import { useI18n } from "../../i18n/index.js";

// Hiện khi người dùng bấm "Làm nhiệm vụ". Xác minh xong gọi onSolved(task).
export default function CaptchaModal({ task, onClose, onSolved, showToast }) {
  const { t } = useI18n();
  const [ready, setReady] = useState(!!window.grecaptcha);
  const [verifying, setVerifying] = useState(false);
  const widgetRef = useRef(null);
  const taskRef = useRef(task);
  const handlerRef = useRef(null);
  taskRef.current = task;

  // Tải script reCAPTCHA (1 lần cho cả trang)
  useEffect(() => {
    if (window.grecaptcha) {
      setReady(true);
      return;
    }
    const existing = document.querySelector('script[data-recaptcha="tasks"]');
    if (existing) {
      const onLoad = () => setReady(true);
      existing.addEventListener("load", onLoad);
      return () => existing.removeEventListener("load", onLoad);
    }
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js";
    script.async = true;
    script.defer = true;
    script.dataset.recaptcha = "tasks";
    script.onload = () => setReady(true);
    document.body.appendChild(script);
  }, []);

  const handleSolved = async (captchaToken) => {
    setVerifying(true);
    try {
      const sessionRes = await supabase.auth.getSession();
      const accessToken = sessionRes.data.session?.access_token;
      const res = await fetch(`${SUPABASE_URL}/functions/v1/rapid-handler`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ captchaToken }),
      });
      const data = await res.json();

      if (data?.success) {
        onSolved(taskRef.current);
      } else {
        showToast(data?.error || t("tk.t.captchaFail"), "error");
        onClose();
      }
    } catch (err) {
      showToast(t("tk.t.verifyErr", { msg: err.message }), "error");
      onClose();
    }
  };
  handlerRef.current = handleSolved;

  // Vẽ ô tick reCAPTCHA
  useEffect(() => {
    if (!ready || !window.grecaptcha) return;
    window.grecaptcha.ready(() => {
      if (
        document.getElementById("tasks-recaptcha-box") &&
        widgetRef.current === null
      ) {
        widgetRef.current = window.grecaptcha.render("tasks-recaptcha-box", {
          sitekey: RECAPTCHA_SITE_KEY,
          callback: (tok) => handlerRef.current(tok),
        });
      }
    });
    return () => {
      if (window.grecaptcha && widgetRef.current !== null) {
        try {
          window.grecaptcha.reset(widgetRef.current);
        } catch (e) {}
      }
      widgetRef.current = null;
    };
  }, [ready]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/20 px-6 backdrop-blur-sm">
      <div className="w-full max-w-xs rounded-2xl bg-white p-6 text-center shadow-2xl">
        {verifying ? (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-50">
              <Loader2 size={26} className="animate-spin text-sky-500" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">
              {t("tk.m.verifying")}
            </h3>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-50">
              <ShieldCheck size={26} className="text-sky-500" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">
              {t("tk.m.botTitle")}
            </h3>
            <p className="mt-1.5 text-sm text-slate-500">{t("tk.m.botSub")}</p>
            <div id="tasks-recaptcha-box" className="mt-4 flex justify-center" />
            <button
              onClick={onClose}
              className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500"
            >
              {t("tk.m.cancel")}
            </button>
          </>
        )}
      </div>
    </div>
  );
      }
