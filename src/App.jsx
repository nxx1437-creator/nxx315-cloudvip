import React from "react";
import { Routes, Route } from "react-router-dom";
import CloudVIPLanding from "./CloudVIPLanding.jsx";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
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
    </Routes>
  );
}
