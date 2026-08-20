import React from "react";
import { Navigate } from "react-router-dom";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";

/**
 * AdminRoute — giống ProtectedRoute nhưng còn kiểm tra profile.is_admin.
 * Không phải admin (hoặc chưa đăng nhập) -> đá về /dashboard.
 */
export default function AdminRoute({ children }) {
  const { session, loading: sessionLoading } = useSession();
  const userId = session?.user?.id;
  const { profile, loading: profileLoading } = useProfile(userId);

  if (sessionLoading || (userId && profileLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;
  if (!profile?.is_admin) return <Navigate to="/dashboard" replace />;

  return children;
}
