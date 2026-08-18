import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient.js";

const DEFAULT_PROFILE = {
  username: "",
  coins: 0,
  level: 1,
  exp: 0,
  exp_target: 100,
  streak_days: 0,
  streak_record: 0,
  tasks_completed_today: 0,
  coins_earned_today: 0,
  referrals_count: 0,
};

/**
 * useProfile — fetches the `profiles` row for a given user id.
 * Requires the `supabase/schema.sql` migration to have been run.
 */
export default function useProfile(userId) {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setProfile(DEFAULT_PROFILE);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data) setProfile(data);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { profile, loading };
}
