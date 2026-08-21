// src/components/AdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";

export default function AdminRoute({ children }) {
  const { session, loading: sessionLoading } = useSession();
  const { profile, loading: profileLoading } = useProfile();

  // Đang chờ lấy dữ liệu
  if (sessionLoading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F6FF]">
        <div className="text-slate-500">Đang kiểm tra quyền...</div>
      </div>
    );
  }

  // Chưa đăng nhập -> Về trang đăng nhập
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Không phải admin -> Chặn lại
  if (!profile?.is_admin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F0F6FF] text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Truy cập bị từ chối</h1>
        <p className="text-slate-500 mb-6">Bạn không có quyền truy cập vào trang quản trị này.</p>
        <a href="/" className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-500">
          Về trang chủ
        </a>
      </div>
    );
  }

  // Là admin -> Hiển thị nội dung con
  return <>{children}</>;
}
