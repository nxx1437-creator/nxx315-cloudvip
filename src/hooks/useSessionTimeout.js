import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

const TIMEOUT_MS = 30 * 60 * 1000;        // 30 phút
const WARNING_MS = 60 * 1000;              // Cảnh báo trước 60 giây
const ACTIVITY_EVENTS = [
  "mousedown",
  "mousemove",
  "keydown",
  "scroll",
  "touchstart",
  "click",
  "visibilitychange",
];

export default function useSessionTimeout(enabled = true) {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);

  const lastActivityRef = useRef(Date.now());
  const warningTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);
  const countdownRef = useRef(null);

  const clearAllTimers = useCallback(() => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    warningTimerRef.current = null;
    logoutTimerRef.current = null;
    countdownRef.current = null;
  }, []);

  const handleLogout = useCallback(async () => {
    clearAllTimers();
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("[SessionTimeout] SignOut error:", err);
    }
    window.location.href = "/login?error=session_expired";
  }, [clearAllTimers]);

  const resetTimers = useCallback(() => {
    clearAllTimers();
    lastActivityRef.current = Date.now();
    setShowWarning(false);

    if (!enabled) return;

    // Timer hiện cảnh báo
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      setSecondsLeft(Math.floor(WARNING_MS / 1000));

      // Đếm ngược
      let remaining = Math.floor(WARNING_MS / 1000);
      countdownRef.current = setInterval(() => {
        remaining -= 1;
        setSecondsLeft(remaining);
        if (remaining <= 0) {
          clearInterval(countdownRef.current);
        }
      }, 1000);
    }, TIMEOUT_MS - WARNING_MS);

    // Timer logout
    logoutTimerRef.current = setTimeout(() => {
      handleLogout();
    }, TIMEOUT_MS);
  }, [enabled, clearAllTimers, handleLogout]);

  // Track user activity
  useEffect(() => {
    if (!enabled) return;

    const handleActivity = () => {
      // Nếu đang hiện cảnh báo → không reset (để user bấm nút "Tiếp tục")
      if (showWarning) return;
      resetTimers();
    };

    // Khởi động lần đầu
    resetTimers();

    // Lắng nghe activity
    ACTIVITY_EVENTS.forEach((evt) => {
      window.addEventListener(evt, handleActivity, { passive: true });
    });

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => {
        window.removeEventListener(evt, handleActivity);
      });
      clearAllTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, showWarning]);

  // User bấm "Tiếp tục"
  const continueSession = useCallback(() => {
    setShowWarning(false);
    resetTimers();
  }, [resetTimers]);

  // User bấm "Đăng xuất ngay"
  const logoutNow = useCallback(() => {
    handleLogout();
  }, [handleLogout]);

  return {
    showWarning,
    secondsLeft,
    continueSession,
    logoutNow,
  };
}
