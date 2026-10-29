import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { IconGoogle } from "./AuthIcons.jsx";
import { useI18n } from "../i18n/index.js";

/* Nút "Đăng nhập với Google" chính thức: tự hiện ảnh đại diện, tên và email
   của tài khoản Google đang đăng nhập trong trình duyệt (như trang mẫu).
   Cần biến môi trường VITE_GOOGLE_CLIENT_ID. Thiếu hoặc lỗi thì dùng nút cũ. */
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

let gsiPromise = null;
const loadGsi = () => {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!gsiPromise) {
    gsiPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => {
        gsiPromise = null;
        reject(new Error("gsi"));
      };
      document.head.appendChild(s);
    });
  }
  return gsiPromise;
};

// Supabase cần nonce gốc, Google nhận bản băm SHA-256
async function makeNonce() {
  const raw = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  const hashed = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return { raw, hashed };
}

export default function GoogleButton({
  text = "continue_with", // signin_with | signup_with | continue_with
  label,
  onFallbackClick,
  onError,
}) {
  const { lang } = useI18n();
  const boxRef = useRef(null);
  const errRef = useRef(onError);
  errRef.current = onError;
  const [mode, setMode] = useState(CLIENT_ID ? "loading" : "fallback");

  useEffect(() => {
    if (!CLIENT_ID) return undefined;
    let dead = false;
    (async () => {
      try {
        await loadGsi();
        const { raw, hashed } = await makeNonce();
        if (dead || !boxRef.current) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          nonce: hashed,
          callback: async ({ credential }) => {
            const { error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: credential,
              nonce: raw,
            });
            if (error) errRef.current?.(error.message);
            else window.location.href = "/dashboard";
          },
        });
        boxRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(boxRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text,
          shape: "rectangular",
          logo_alignment: "left",
          width: Math.min(400, Math.max(200, boxRef.current.offsetWidth || 320)),
          locale: lang === "en" ? "en" : "vi",
        });
        setMode("gsi");
      } catch (e) {
        console.warn("[google] dùng nút dự phòng:", e);
        if (!dead) setMode("fallback");
      }
    })();
    return () => {
      dead = true;
    };
  }, [lang, text]);

  return (
    <>
      <div
        ref={boxRef}
        className={mode === "fallback" ? "hidden" : "flex min-h-[44px] justify-center"}
      />
      {mode === "fallback" && (
        <button
          type="button"
          onClick={onFallbackClick}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-[14px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
        >
          <IconGoogle size={20} />
          {label}
        </button>
      )}
    </>
  );
}
