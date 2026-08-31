import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";

import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";

function isCurrentlyBanned(profile) {
  if (!profile?.is_banned) return false;

  if (!profile.banned_until) {
    return true;
  }

  return new Date(profile.banned_until).getTime() > Date.now();
}

export default function ProtectedRoute({ children }) {
  const { profile, loading } = useProfile();

  const banExpired =
    profile?.is_banned &&
    profile?.banned_until &&
    new Date(profile.banned_until).getTime() <= Date.now();

  useEffect(() => {
    if (!banExpired || !profile?.id) return;

    supabase
      .from("profiles")
      .update({
        is_banned: false,
        ban_reason: null,
        ban_note: null,
        banned_until: null,
        banned_at: null,
      })
      .eq("id", profile.id)
      .then(() => {});
  }, [banExpired, profile?.id]);

  if (loading) {
    return null;
  }

  if (isCurrentlyBanned(profile)) {
    return <Navigate to="/banned" replace />;
  }

  return children;
}
