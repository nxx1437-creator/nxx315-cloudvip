import React from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import useSession from "../hooks/useSession.js";

export default function ProtectedRoute({ children }) {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 size={24} className="animate-spin text-sky-500" />
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  return children;
}
