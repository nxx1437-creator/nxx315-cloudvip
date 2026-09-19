// src/components/BanGate.jsx
//
// Bọc component này quanh TOÀN BỘ app (trong App.jsx, bọc ngoài <Routes>/<Router>).
// Nó kiểm tra is_banned trực tiếp từ Supabase mỗi khi app mở lên và mỗi 30 giây,
// nên dù người dùng cố tình gõ thẳng URL vào trình duyệt để né trang login/chặn,
// họ vẫn bị chặn ở MỌI trang vì check này nằm trên toàn bộ cây component.
//
// ⚠️ Sửa dòng import bên dưới cho đúng đường dẫn tới supabase client của bạn.
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient"; // <-- đổi lại đúng path bạn đang dùng

const CHECK_INTERVAL_MS = 30 * 1000;

export default function BanGate({ children }) {
  const [status, setStatus] = useState({ loading: true, banned: false, reason: "" });

  useEffect(() => {
    let cancelled = false;
    let timer;

    async function check() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        if (!cancelled) setStatus({ loading: false, banned: false, reason: "" });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_banned, ban_reason")
        .eq("id", user.id)
        .single();

      if (!cancelled) {
        setStatus({
          loading: false,
          banned: !!profile?.is_banned,
          reason: profile?.ban_reason || "Tài khoản của bạn đã bị chặn.",
        });
      }
    }

    check();
    timer = setInterval(check, CHECK_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  if (status.loading) return null; // hoặc màn hình loading của bạn

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
