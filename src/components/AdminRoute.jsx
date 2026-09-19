import React from "react";
import { Navigate } from "react-router-dom";

import useProfile from "../hooks/useProfile.js";

export default function AdminRoute({ children }) {
  const { profile, loading } = useProfile();

  if (loading) {
    return null;
  }

  // ✅ Check role thay vì is_admin
  const role = profile?.role;
  const isAdmin = role === "admin" || role === "support";

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
