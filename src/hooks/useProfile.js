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

function recordFingerprint(userId) {
  const sessionKey = `fp_recorded_${userId}`;
  try {
    if (sessionStorage.getItem(sessionKey)) return;
  } catch {}

  getDeviceFingerprint()
    .then((fingerprint) => {
      if (!fingerprint) return;
      return getPublicIp().then((ip) =>
        supabase
          .rpc("record_device_fingerprint", {
            p_user_id: userId,
            p_fingerprint: fingerprint,
            p_ip: ip,
          })
          .then(() => {
            try {
              sessionStorage.setItem(sessionKey, "1");
            } catch {}
          })
      );
    })
    .catch((err) => console.warn("[useProfile] fingerprint lỗi:", err));
}

export default function useProfile() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    let alive = true;

    const fetchProfile = async () => {
      try {
        // getSession đọc từ máy (nhanh), không gọi mạng như getUser
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const user = session?.user;

        if (!alive) return;

        if (!user) {
          setProfile(DEFAULT_PROFILE);
          setIsAuthed(false);
          return;
        }
        setIsAuthed(true);

        // Đọc 2 bảng song song cho nhanh
        const [{ data: profileData }, { data: gameData }] = await Promise.all([
          supabase
            .from("user_profiles")
            .select("id, email, full_name, avatar_url, role")
            .eq("id", user.id)
            .maybeSingle(),
          supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle(),
        ]);

        if (!alive) return;

        setProfile({
          ...DEFAULT_PROFILE,
          ...(gameData || {}),
          role: profileData?.role || "user",
          is_admin:
            profileData?.role === "admin" || profileData?.role === "support",
          email: profileData?.email || gameData?.email || "",
          full_name: profileData?.full_name || gameData?.full_name || "",
        });

        recordFingerprint(user.id);
      } catch (err) {
        console.warn("[useProfile] lỗi:", err);
      } finally {
        if (alive) setLoading(false);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event) => {
        // Đã tải lúc mở trang; làm mới token không làm đổi hồ sơ
        if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") return;
        // Không gọi Supabase trực tiếp trong callback này
        setTimeout(fetchProfile, 0);
      }
    );

    fetchProfile();

    return () => {
      alive = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return { profile, loading, setProfile, isAuthed };
}
