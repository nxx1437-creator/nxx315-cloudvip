import { useState, useEffect, useRef } from "react";
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
 * Chỉ hiện màn hình chờ toàn màn hình ở LẦN TẢI ĐẦU TIÊN (lúc vừa
 * vào trang). Những lần tải lại sau đó (quay lại tab, focus...) chạy
 * âm thầm phía sau, không che màn hình — tránh làm phiền người dùng.
 */
export default function useProfile(userId) {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const { beginLoad, endLoad } = useGlobalLoading();
  const hasLoadedOnce = useRef(false);

  useEffect(() => {
    if (!userId) {
      setProfile(DEFAULT_PROFILE);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchProfile = () => {
      const isFirstLoad = !hasLoadedOnce.current;
      if (isFirstLoad) {
        setLoading(true);
        beginLoad();
      }
      supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()
        .then(({ data, error }) => {
          if (cancelled) {
            if (isFirstLoad) endLoad();
            return;
          }
          if (!error && data) setProfile(data);
          if (isFirstLoad) {
            setLoading(false);
            endLoad();
            hasLoadedOnce.current = true;
          }
        });
    };

    fetchProfile();

    const handleFocus = () => fetchProfile();
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") handleFocus();
    });

    return () => {
      cancelled = true;
      window.removeEventListener("focus", handleFocus);
    };
  }, [userId]);

  return { profile, loading };
}
