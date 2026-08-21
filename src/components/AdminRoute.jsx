import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useSession from "../hooks/useSession.js";
import { supabase } from "../lib/supabaseClient.js";

/**
 * AdminRoute — tự truy vấn is_admin trực tiếp (không qua useProfile) để
 * tránh bị nuốt lỗi âm thầm. Nếu Supabase trả lỗi thật, hiện ra màn hình
 * luôn thay vì đá về Dashboard trong im lặng — giúp debug dễ hơn.
 */
export default function AdminRoute({ children }) {
  const { session, loading: sessionLoading } = useSession();
  const userId = session?.user?.id;

  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [queryError, setQueryError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setChecking(false);
      return;
    }
    setChecking(true);
    supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          setQueryError(error.message);
        } else {
          setIsAdmin(!!data?.is_admin);
        }
        setChecking(false);
      });
  }, [userId]);

  if (sessionLoading || (userId && checking)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  if (queryError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="font-bold text-rose-500">Lỗi khi kiểm tra quyền admin:</p>
        <p className="text-sm text-slate-600">{queryError}</p>
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return children;
}
