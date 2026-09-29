import React from "react";
import useSession from "../hooks/useSession";
import useSessionTimeout from "../hooks/useSessionTimeout";
import SessionWarningModal from "./SessionWarningModal";

export default function SessionGuard() {
  const { session } = useSession();
  const isLoggedIn = !!session?.user;

  const { showWarning, secondsLeft, continueSession, logoutNow } =
    useSessionTimeout(isLoggedIn);

  if (!showWarning) return null;

  return (
    <SessionWarningModal
      secondsLeft={secondsLeft}
      onContinue={continueSession}
      onLogout={logoutNow}
    />
  );
}
