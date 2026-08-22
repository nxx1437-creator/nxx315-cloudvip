import React from "react";
import { Routes, Route } from "react-router-dom";

import CloudVIPLanding from "./CloudVIPLanding.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Tasks from "./pages/Tasks.jsx";
import Store from "./pages/Store.jsx";
import Wallet from "./pages/Wallet.jsx";
import ProfilePage from "./pages/Profile.jsx";
import Marketing from "./pages/Marketing.jsx";
import MarketingWallet from "./pages/MarketingWallet.jsx";

import Admin from "./pages/Admin.jsx";
import TaskCallback from "./pages/TaskCallback.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CloudVIPLanding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/marketing" element={<ProtectedRoute><Marketing /></ProtectedRoute>} /> {/* 👈 Thêm dòng này */}
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      {/* ... Các route khác giữ nguyên ... */}
      
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
<Route
  path="/marketing"
  element={
    <ProtectedRoute>
      <Marketing />
    </ProtectedRoute>
  }
/>

<Route
  path="/marketing-wallet"
  element={
    <ProtectedRoute>
      <MarketingWallet />
    </ProtectedRoute>
  }
/>
