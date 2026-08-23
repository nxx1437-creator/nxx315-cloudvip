import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBanned, setIsBanned] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_banned")
          .eq("id", session.user.id)
          .single();

        // Kiểm tra xem user có bị ban không
        if (profile?.is_banned) {
          setIsBanned(true);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 via-white to-white">
        <Loader2 size={32} className="animate-spin text-sky-500" />
      </div>
    );
  }

  // Chặn user bị ban
  if (isBanned) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 via-white to-white">
        <div className="max-w-md w-full rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-lg">
          <div className="text-6xl">🚫</div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Tài khoản đã bị khóa</h1>
          <p className="mt-2 text-sm text-slate-500">Tài khoản của bạn đã bị quản trị viên khóa. Vui lòng liên hệ hỗ trợ nếu bạn cho rằng đây là sai lầm.</p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
            className="mt-6 w-full rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
