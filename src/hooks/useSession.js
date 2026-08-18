import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient.js";

/**
 * useSession — tracks the current logged-in user (or null).
 * `loading` is true only during the very first check.
 */
export default function useSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return { session, loading };
}
