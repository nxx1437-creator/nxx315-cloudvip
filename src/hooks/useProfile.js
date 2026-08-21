import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const DEFAULT_PROFILE = {
  username: "Khách",
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

export default function useProfile() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Nếu chưa có user, hiện dữ liệu mẫu để trang không bị trống
        setProfile({ ...DEFAULT_PROFILE, username: "Khách", coins: 1250, streak_days: 3 });
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
      } else {
        // Nếu user mới đăng ký chưa có data, hiện dữ liệu mẫu
        setProfile({ ...DEFAULT_PROFILE, username: "Thành viên mới", coins: 500, streak_days: 1 });
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
