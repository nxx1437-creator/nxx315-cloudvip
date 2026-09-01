import React from "react";
import { Navigate } from "react-router-dom";

import useProfile from "../hooks/useProfile.js";

export default function AdminRoute({ children }) {
  const { profile, loading } = useProfile();

  if (loading) {
    return null;
  }

  if (!profile?.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
