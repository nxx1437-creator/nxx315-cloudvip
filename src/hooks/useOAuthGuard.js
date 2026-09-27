import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export function useOAuthGuard() {
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Chỉ xử lý khi SIGNED_IN (login hoặc OAuth callback)
        if (event !== "SIGNED_IN" || !session?.user) return;

        const user = session.user;
        const provider = user.app_metadata?.provider;

        // Chỉ check OAuth (Google, Facebook...), không check email/password
        if (provider === "email") return;

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

          if (data.action === "block") {
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
}
