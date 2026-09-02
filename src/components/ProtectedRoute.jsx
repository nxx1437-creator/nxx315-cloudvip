import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";
import MfaChallenge from "./MfaChallenge.jsx";
import { useLocation } from "react-router-dom";

function isCurrentlyBanned(profile) {
  if (!profile?.is_banned) return false;

  if (!profile.banned_until) {
    return true;
  }

  return new Date(profile.banned_until).getTime() > Date.now();
}

export default function ProtectedRoute({ children }) {
  const { profile, loading } = useProfile();
  const location = useLocation();

  const [mfaChecked, setMfaChecked] = useState(false);
  const [needsMfa, setNeedsMfa] = useState(false);

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

  useEffect(() => {
    let active = true;

    const checkMfa = async () => {
      const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (!active) return;

      if (data?.nextLevel === "aal2" && data?.currentLevel !== "aal2") {
        setNeedsMfa(true);
      } else {
        setNeedsMfa(false);
      }

      setMfaChecked(true);
    };

    checkMfa();

    return () => {
      active = false;
    };
  }, []);

  if (loading || !mfaChecked) {
    return null;
  }

  if (isCurrentlyBanned(profile)) {
    return <Navigate to="/banned" replace />;
  }
if (
    profile?.onboarding_completed === false &&
    location.pathname !== "/onboarding"
  ) {
    return <Navigate to="/onboarding" replace />;
}
  if (needsMfa) {
    return (
      <MfaChallenge
        onVerified={() => setNeedsMfa(false)}
        onCancel={async () => {
          await supabase.auth.signOut();
          window.location.href = "/login";
        }}
      />
    );
  }

  return children;
}
