import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { getDeviceFingerprint, getPublicIp } from "../lib/deviceFingerprint.js";

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
  role: "user",
  is_admin: false,
};

export default function useProfile() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setProfile(DEFAULT_PROFILE);
        setLoading(false);
        return;
      }

      // ✅ Đọc từ user_profiles (bảng có cột role)
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("id, email, full_name, avatar_url, role")
        .eq("id", user.id)
        .maybeSingle();

      // Đọc thêm thông tin gamification từ bảng profiles (nếu có)
      const { data: gameData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      const merged = {
        ...DEFAULT_PROFILE,
        ...(gameData || {}),
        // Override is_admin từ user_profiles.role
        role: profileData?.role || "user",
        is_admin:
          profileData?.role === "admin" ||
          profileData?.role === "support",
        email: profileData?.email || gameData?.email || "",
        full_name:
          profileData?.full_name || gameData?.full_name || "",
      };

      setProfile(merged);

      const sessionKey = `fp_recorded_${user.id}`;
      if (!sessionStorage.getItem(sessionKey)) {
        getDeviceFingerprint().then((fingerprint) => {
          if (!fingerprint) return;

          getPublicIp().then((ip) => {
            supabase
              .rpc("record_device_fingerprint", {
                p_user_id: user.id,
                p_fingerprint: fingerprint,
                p_ip: ip,
              })
              .then(() => {
                sessionStorage.setItem(sessionKey, "1");
              });
          });
        });
      }
      setLoading(false);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, _session) => {
        fetchProfile();
      }
    );

    fetchProfile();

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return { profile, loading, setProfile };
}
