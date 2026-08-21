import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import CloudVIPLanding from "./CloudVIPLanding.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Tasks from "./pages/Tasks.jsx";
import Store from "./pages/Store.jsx";
import Admin from "./pages/Admin.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import TaskCallback from "./pages/TaskCallback.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import useSession from "./hooks/useSession.js";

export default function App() {
  const { loading: sessionLoading } = useSession();

  // Đảm bảo loading screen xuất hiện ít nhất 2.5 giây
  const [minimumLoading, setMinimumLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinimumLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Chỉ vào app khi cả 2 điều kiện đều hoàn thành
  if (sessionLoading || minimumLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<CloudVIPLanding />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        }
      />

      <Route
        path="/store"
        element={
          <ProtectedRoute>
            <Store />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        }
      />

      <Route
        path="/task/callback"
        element={
          <ProtectedRoute>
            <TaskCallback />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}