// src/components/BanGate.jsx
// Bọc toàn bộ app. Kiểm tra is_banned từ Supabase khi mở app và mỗi 30 giây.
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import PageLoader from "./PageLoader.jsx";

const CHECK_INTERVAL_MS = 30 * 1000;
const MAX_WAIT_MS = 4000;

export default function BanGate({ children }) {
  const [status, setStatus] = useState({
    loading: true,
    banned: false,
    reason: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        // getSession đọc từ máy (nhanh), không gọi mạng như getUser
        const { data } = await supabase.auth.getSession();
        const user = data?.session?.user;

        if (!user) {
          if (!cancelled)
            setStatus({ loading: false, banned: false, reason: "" });
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("is_banned, ban_reason")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (!cancelled) {
          setStatus({
            loading: false,
            banned: !!profile?.is_banned,
            reason: profile?.ban_reason || "Tài khoản của bạn đã bị chặn.",
          });
        }
      } catch (err) {
        console.warn("[BanGate] check lỗi:", err);
        // Lỗi mạng: không khoá cả web, giữ nguyên trạng thái ban trước đó
        if (!cancelled) setStatus((prev) => ({ ...prev, loading: false }));
      }
    }

    check();
    const timer = setInterval(check, CHECK_INTERVAL_MS);

    // Chốt an toàn: tối đa chờ 4 giây rồi cho app hiện lên
    const maxWait = setTimeout(() => {
      if (!cancelled) setStatus((prev) => ({ ...prev, loading: false }));
    }, MAX_WAIT_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
      clearTimeout(maxWait);
    };
  }, []);

  if (status.loading) return <PageLoader />;

  if (status.banned) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: 24,
          textAlign: "center",
          background: "#0f172a",
          color: "#fff",
        }}
      >
        <div style={{ fontSize: 40 }}>🚫</div>
        <h2 style={{ margin: 0 }}>Tài khoản đã bị chặn</h2>
        <p style={{ opacity: 0.8, maxWidth: 400 }}>{status.reason}</p>
        <p style={{ opacity: 0.6, fontSize: 13 }}>
          Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ hỗ trợ.
        </p>
      </div>
    );
  }

  return children;
}
