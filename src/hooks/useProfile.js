import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

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
  is_admin: false,
};

export function useProfile() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile(DEFAULT_PROFILE);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, _session) => {
      fetchProfile();
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return { profile, loading, setProfile };
}
