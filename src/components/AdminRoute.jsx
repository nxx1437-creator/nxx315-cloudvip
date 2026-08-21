import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useSession from "../hooks/useSession.js";
import { supabase } from "../lib/supabaseClient.js";

export default function AdminRoute({ children }) {
  const { session, loading: sessionLoading } = useSession();
  const userId = session?.user?.id;

  const [checking, setChecking] = useState(true);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    if (!userId) {
      setChecking(false);
      return;
    }
    setChecking(true);
    supabase
      .from("profiles")
      .select("id, username, is_admin")
      .eq("id", userId)
      .single()
      .then(({ data, error }) => {
        setDebugInfo({ userId, data, error: error?.message ?? null });
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

  // TẠM THỜI: luôn hiện debug info thay vì tự đá đi, để xác định lỗi
  const isAdmin = !!debugInfo?.data?.is_admin;

  return (
    <div className="min-h-screen bg-slate-950 p-5 font-mono text-xs text-lime-400">
      <p className="mb-3 text-sm font-bold text-white">🔍 DEBUG AdminRoute</p>
      <pre className="whitespace-pre-wrap break-all rounded-lg bg-black/40 p-3">
{JSON.stringify(debugInfo, null, 2)}
      </pre>
      <p className="mt-3 text-white">isAdmin tính được: <span className={isAdmin ? "text-emerald-400" : "text-rose-400"}>{String(isAdmin)}</span></p>
      {isAdmin ? (
        <div className="mt-4 rounded-lg bg-emerald-950 p-3 text-emerald-300">
          ✅ Là admin — nội dung trang Admin thật sẽ hiện dưới đây:
          <div className="mt-3 rounded-lg bg-white p-2 text-black">{children}</div>
        </div>
      ) : (
        <p className="mt-4 text-rose-400">❌ Không phải admin theo dữ liệu trên.</p>
      )}
    </div>
  );
}
