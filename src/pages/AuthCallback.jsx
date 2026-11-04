import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import LoginAlerts from "../components/LoginAlerts.jsx";
import MfaChallenge from "../components/MfaChallenge.jsx";
import { IconSpinner } from "../components/AuthIcons.jsx";
import { AT } from "../components/authText.js";
import { supabase } from "../lib/supabaseClient.js";
import { useI18n } from "../i18n/index.js";

const callFn = async (name, payload) => {
  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

// Trang nhận liên kết từ email: /auth/callback
export default function AuthCallback() {
  const { lang } = useI18n();
  const x = AT[lang] || AT.vi;
  const navigate = useNavigate();
  const ran = useRef(false);
  const dest = useRef("/dashboard");
  const [phase, setPhase] = useState("working"); // working | mfa | ip
  const [ipInfo, setIpInfo] = useState(null);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const expired = () => navigate("/login?error=link_expired", { replace: true });

    (async () => {
      // 1. Liên kết lỗi / hết hạn / đã dùng
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const query = new URLSearchParams(window.location.search);
      if (hash.get("error") || query.get("error")) return expired();

      // 2. Đợi Supabase đọc token trong đường dẫn
      let { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        session = await new Promise((resolve) => {
          let sub = null;
          const timer = setTimeout(() => {
            sub?.subscription.unsubscribe();
            resolve(null);
          }, 6000);
          const r = supabase.auth.onAuthStateChange((_e, s) => {
            if (s) {
              clearTimeout(timer);
              sub?.subscription.unsubscribe();
              resolve(s);
            }
          });
          sub = r.data;
        });
      }
      if (!session) return expired();

      const user = session.user;
      const meta = user.user_metadata || {};
      const isNew = !!meta.device_fingerprint && !meta.setup_done;

      // 3. Tài khoản mới: lưu IP/thiết bị + mã giới thiệu (việc trước đây làm lúc bấm Đăng ký)
      if (isNew) {
        try {
          await callFn("save-registration", {
            userId: user.id,
            fingerprint: meta.device_fingerprint,
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          });
        } catch (err) {
          console.warn("[callback] save-registration:", err);
        }
        const code = String(meta.referral || "").trim().toUpperCase();
        if (code) {
          try {
            await supabase.rpc("apply_referral_code", { p_code: code });
          } catch (err) {
            console.warn("[callback] referral:", err);
          }
        }
        try {
          await supabase.auth.updateUser({ data: { setup_done: true } });
        } catch (err) {
          console.warn("[callback] setup_done:", err);
        }
        dest.current = "/onboarding";
      } else {
        // 4. Tài khoản cũ: kiểm tra IP như khi đăng nhập bằng mật khẩu
        try {
          const d = await callFn("login-guard", { action: "check-ip", userId: user.id });
          if (d && d.allowed === false) {
            await supabase.auth.signOut();
            setIpInfo({
              registeredIp: d.registered_ip,
              currentIp: d.current_ip,
              ageDays: d.account_age_days,
              trustDays: d.trust_after_days,
            });
            setPhase("ip");
            return;
          }
        } catch (err) {
          console.warn("[callback] check-ip:", err);
        }
      }

      // 5. Xác thực 2 lớp nếu tài khoản có bật
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.nextLevel === "aal2" && aal?.currentLevel !== "aal2") {
        setPhase("mfa");
        return;
      }
      window.location.replace(dest.current);
    })();
  }, [navigate]);

  if (phase === "ip") {
    return (
      <AuthLayout title={x.cbIpTitle}>
        <LoginAlerts
          errorType="ip_mismatch"
          isLocked={false}
          remainingSec={0}
          maxAttempts={5}
          ipInfo={ipInfo}
          formatTime={(s) => String(s)}
        />
        <Link
          to="/login"
          className="mt-2 block rounded-2xl border border-slate-200 bg-white py-3 text-center text-[14px] font-semibold text-slate-700 hover:bg-slate-50"
        >
          {x.backLogin}
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={x.cbTitle} subtitle={x.cbBody}>
      <div className="flex justify-center py-6 text-emerald-600">
        <IconSpinner size={34} />
      </div>
      {phase === "mfa" && (
        <MfaChallenge
          onVerified={() => window.location.replace(dest.current)}
          onCancel={async () => {
            await supabase.auth.signOut();
            navigate("/login", { replace: true });
          }}
        />
      )}
    </AuthLayout>
  );
}
