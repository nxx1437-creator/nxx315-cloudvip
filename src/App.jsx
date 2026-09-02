import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import CloudVIPLanding from "./CloudVIPLanding.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Tasks from "./pages/Tasks.jsx";
import Store from "./pages/Store.jsx";
import ShopEarn from "./pages/ShopEarn.jsx";
import Admin from "./pages/Admin.jsx";
import Contact from "./pages/Contact.jsx";
import HelpCenter from "./pages/HelpCenter.jsx";
import Support from "./pages/Support.jsx";
import Terms from "./pages/Terms.jsx";
import Privacy from "./pages/Privacy.jsx";
import Fraud from "./pages/Fraud.jsx";
import RedemptionPolicy from "./pages/RedemptionPolicy.jsx";
import Wallet from "./pages/Wallet.jsx";
import ProfilePage from "./pages/Profile.jsx";
import TaskCallback from "./pages/TaskCallback.jsx";
import Banned from "./pages/Banned.jsx";
import AccountReview from "./pages/AccountReview.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CloudVIPLanding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/banned" element={<Banned />} />
        <Route path="/account-review" element={<AccountReview />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
        <Route path="/store" element={<ProtectedRoute><Store /></ProtectedRoute>} />
        <Route path="/shop-earn" element={<ProtectedRoute><ShopEarn /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/support" element={<Support />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/fraud" element={<Fraud />} />
        <Route path="/redemption-policy" element={<RedemptionPolicy />} />
        <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/task/callback" element={<TaskCallback />} />
      </Routes>
    </BrowserRouter>
  );
}
