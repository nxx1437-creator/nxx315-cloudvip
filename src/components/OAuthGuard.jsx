import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient.js";

export default function OAuthGuard() {
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Chỉ xử lý khi SIGNED_IN
        if (event !== "SIGNED_IN" || !session?.user) return;

        const user = session.user;
        const provider = user.app_metadata?.provider;

        // Chỉ check OAuth (Google, Facebook...), bỏ qua email/password
        if (provider === "email") return;

        // Bỏ qua nếu đang ở trang login (tránh loop)
        if (window.location.pathname === "/login") return;

        try {
          const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
          const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

          const res = await fetch(
            `${SUPABASE_URL}/functions/v1/check-ip-registered`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                apikey: SUPABASE_ANON_KEY,
              },
              body: JSON.stringify({
                action: "check-oauth",
                userId: user.id,
              }),
            }
          );

          const data = await res.json();

          console.log("[OAuthGuard] Response:", data);

          if (data.action === "block") {
            console.warn("[OAuthGuard] BLOCKED:", data.reason);

            await supabase.auth.signOut();
            window.location.href = "/login?error=oauth_ip_duplicate";
          }
        } catch (err) {
          console.warn("[OAuthGuard] Error:", err);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return null;
}
