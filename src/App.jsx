import ErrorBoundary from "./components/ErrorBoundary.jsx";
import React from "react";
import { Routes, Route } from "react-router-dom";

import CloudVIPLanding from "./CloudVIPLanding.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Tasks from "./pages/Tasks.jsx";
import Store from "./pages/Store.jsx";
import Marketing from "./pages/Marketing.jsx";
import MarketingWallet from "./pages/MarketingWallet.jsx";
import Admin from "./pages/Admin.jsx";
import TaskCallback from "./pages/TaskCallback.jsx";
import Wallet from "./pages/Wallet.jsx";
import ProfilePage from "./pages/Profile.jsx";
import Invite from "./pages/Invite.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import Terms from "./pages/Terms.jsx";
import Privacy from "./pages/Privacy.jsx";
import Fraud from "./pages/Fraud.jsx";
import RedemptionPolicy from "./pages/RedemptionPolicy.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

export default function App() {
  return (
    <ErrorBoundary>
    <Routes>
      <Route path="/" element={<CloudVIPLanding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
      <Route path="/store" element={<ProtectedRoute><Store /></ProtectedRoute>} />
      <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/marketing" element={<ProtectedRoute><Marketing /></ProtectedRoute>} />
      <Route path="/marketing-wallet" element={<ProtectedRoute><MarketingWallet /></ProtectedRoute>} />
      <Route path="/invite" element={<ProtectedRoute><Invite /></ProtectedRoute>} />
      <Route path="/task/callback" element={<ProtectedRoute><TaskCallback /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
      <Route path="*" element={<NotFoundPage />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/fraud" element={<Fraud />} />
      <Route path="/redemption-policy" element={<RedemptionPolicy />} />
    </Routes>
    </ErrorBoundary>
  );
}
