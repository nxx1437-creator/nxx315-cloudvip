import { useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

const CHECK_INTERVAL = 2 * 60 * 1000; // 2 phút check 1 lần
const TOKEN_KEY = "nxx315_token_issued_at";

export default function useSessionValidator(enabled = true) {
  const checkingRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    // Lưu thời điểm login nếu chưa có
    const initToken = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      if (!sessionStorage.getItem(TOKEN_KEY)) {
        // Lấy token issued_at từ JWT
        const issuedAt = session.expires_at 
          ? session.expires_at - 3600 // JWT thường 1h
          : Math.floor(Date.now() / 1000);
        sessionStorage.setItem(TOKEN_KEY, issuedAt.toString());
      }
    };

    initToken();

    const checkSession = async () => {
      if (checkingRef.current) return;
      checkingRef.current = true;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          checkingRef.current = false;
          return;
        }

        const tokenIssuedAt = parseInt(
          sessionStorage.getItem(TOKEN_KEY) || "0"
        );

        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
        const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/login-guard`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({
              action: "check-session",
              userId: session.user.id,
              tokenIssuedAt,
            }),
          }
        );

        const data = await res.json();

        if (data.valid === false && data.reason === "force_logout") {
          console.log("[SessionValidator] Force logout detected, signing out...");
          sessionStorage.removeItem(TOKEN_KEY);
          await supabase.auth.signOut();
          window.location.href = "/login?error=force_logout";
        }
      } catch (err) {
        console.warn("[SessionValidator] Error:", err);
      } finally {
        checkingRef.current = false;
      }
    };

    // Check ngay
    checkSession();

    // Check định kỳ
    const interval = setInterval(checkSession, CHECK_INTERVAL);

    // Check khi quay lại tab
    const handleVisibility = () => {
      if (document.visibilityState === "visible") checkSession();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [enabled]);
            }
