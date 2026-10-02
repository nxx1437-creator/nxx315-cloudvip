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

// Bộ nhớ đệm dùng chung cho mọi component
let cache = null; // { userId, profile }
let inflight = null;

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

async function loadProfile() {
  if (inflight) return inflight;

  inflight = (async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      cache = null;
      return null;
    }

    const [{ data: profileData }, { data: gameData }] = await Promise.all([
      supabase
        .from("user_profiles")
        .select("id, email, full_name, avatar_url, role")
        .eq("id", user.id)
        .maybeSingle(),
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    ]);

    const profile = {
      ...DEFAULT_PROFILE,
      ...(gameData || {}),
      role: profileData?.role || "user",
      is_admin:
        profileData?.role === "admin" || profileData?.role === "support",
      email: profileData?.email || gameData?.email || "",
      full_name: profileData?.full_name || gameData?.full_name || "",
    };

    cache = { userId: user.id, profile };
    recordFingerprint(user.id);
    return cache;
  })().finally(() => {
    inflight = null;
  });

  return inflight;
}

export default function useProfile() {
  const [profile, setProfile] = useState(cache?.profile || DEFAULT_PROFILE);
  const [loading, setLoading] = useState(!cache);
  const [isAuthed, setIsAuthed] = useState(!!cache);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      try {
        const res = await loadProfile();
        if (!alive) return;
        if (!res) {
          setProfile(DEFAULT_PROFILE);
          setIsAuthed(false);
        } else {
          setProfile(res.profile);
          setIsAuthed(true);
        }
      } catch (err) {
        console.warn("[useProfile] lỗi:", err);
      } finally {
        if (alive) setLoading(false);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") return;
      setTimeout(run, 0);
    });

    run();

    return () => {
      alive = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Cập nhật hồ sơ (vd cộng coin) và nhớ luôn vào bộ nhớ đệm
  const updateProfile = (updater) => {
    setProfile((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (cache) cache = { ...cache, profile: next };
      return next;
    });
  };

  return { profile, loading, setProfile: updateProfile, isAuthed };
}
