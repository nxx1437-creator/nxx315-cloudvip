// src/hooks/useProfileSecurity.js — logic bảo mật: 2FA, mã dự phòng, thông báo đẩy, đăng xuất mọi thiết bị
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import {
  getPushPermissionState,
  subscribeToPush,
  unsubscribeFromPush,
} from "../lib/pushNotifications.js";

export default function useProfileSecurity(session) {
  const [showMFA, setShowMFA] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [loadingForceLogout, setLoadingForceLogout] = useState(false);
  const [forceLogoutSuccess, setForceLogoutSuccess] = useState(false);
  const [secret, setSecret] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [factorId, setFactorId] = useState("");
  const [mfaError, setMfaError] = useState("");
  const [mfaSuccess, setMfaSuccess] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [isMFAEnabled, setIsMFAEnabled] = useState(false);
  const [pushState, setPushState] = useState("default");
  const [pushLoading, setPushLoading] = useState(false);
  const [pushError, setPushError] = useState("");

  const checkMFAStatus = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    const verifiedFactors = data.totp?.filter((f) => f.status === "verified");
    setIsMFAEnabled(!!verifiedFactors?.length);
  };

  useEffect(() => {
    getPushPermissionState().then(setPushState);
    checkMFAStatus();
  }, []);

  const handleTogglePush = async () => {
    setPushError("");
    setPushLoading(true);

    try {
      if (pushState === "granted") {
        await unsubscribeFromPush();
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("user_id", session.user.id);
        setPushState("default");
      } else {
        const sub = await subscribeToPush();

        await supabase.from("push_subscriptions").upsert(
          {
            user_id: session.user.id,
            endpoint: sub.endpoint,
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth,
          },
          { onConflict: "endpoint" }
        );

        setPushState("granted");
      }
    } catch (err) {
      setPushError(err.message || "Có lỗi xảy ra.");
    } finally {
      setPushLoading(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (loadingForceLogout) return;

    const confirmed = window.confirm(
      "Đăng xuất khỏi TẤT CẢ thiết bị khác?\n\nBạn sẽ vẫn đăng nhập trên thiết bị này."
    );
    if (!confirmed) return;

    setLoadingForceLogout(true);
    setForceLogoutSuccess(false);

    try {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!currentSession) {
        setLoadingForceLogout(false);
        return;
      }

      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/login-guard`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${currentSession.access_token}`,
          },
          body: JSON.stringify({ action: "force-logout-all" }),
        }
      );

      const data = await res.json();

      if (data.success) {
        sessionStorage.setItem(
          "nxx315_token_issued_at",
          Math.floor(Date.now() / 1000).toString()
        );
        setForceLogoutSuccess(true);
        setTimeout(() => setForceLogoutSuccess(false), 5000);
      } else {
        alert("❌ Lỗi: " + (data.error || "Không rõ"));
      }
    } catch (err) {
      console.error("[Profile] Force logout error:", err);
      alert("❌ Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoadingForceLogout(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleStartMFA = async () => {
    setMfaError("");
    setMfaSuccess("");

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
    });
    if (error) {
      setMfaError("Lỗi khởi tạo: " + error.message);
      return;
    }

    setSecret(data?.totp?.secret || "");
    setFactorId(data?.id || "");
    setIsCopied(false);
    setShowMFA(true);
  };

  const handleVerifyMFA = async (e) => {
    e.preventDefault();
    setMfaError("");
    setMfaSuccess("");

    const { data: challengeData, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) {
      setMfaError("Lỗi xác minh: " + challengeError.message);
      return;
    }

    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code: verifyCode,
    });
    if (error) {
      setMfaError("Mã không đúng hoặc đã hết hạn.");
      return;
    }

    setMfaSuccess("Xác minh 2 bước đã được bật thành công!");
    setVerifyCode("");
    setShowMFA(false);
    checkMFAStatus();
  };

  const generateRecoveryCodes = async () => {
    const codes = Array.from({ length: 10 }, () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "";
      for (let i = 0; i < 8; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
        if (i === 3) code += "-";
      }
      return code;
    });

    const { error } = await supabase
      .from("profiles")
      .update({ recovery_codes: codes })
      .eq("id", session?.user?.id);

    if (error) {
      alert("Lỗi lưu mã: " + error.message);
      return;
    }

    setRecoveryCodes(codes);
    setShowRecovery(true);
  };

  return {
    isMFAEnabled, pushState, pushLoading, pushError, handleTogglePush,
    loadingForceLogout, forceLogoutSuccess, handleLogoutAllDevices,
    showMFA, setShowMFA, secret, verifyCode, setVerifyCode, mfaError, mfaSuccess,
    isCopied, handleCopySecret, handleStartMFA, handleVerifyMFA,
    showRecovery, setShowRecovery, recoveryCodes, generateRecoveryCodes,
  };
}
