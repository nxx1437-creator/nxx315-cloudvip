import React from "react";
import { Routes, Route } from "react-router-dom";

import CloudVIPLanding from "./CloudVIPLanding.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Tasks from "./pages/Tasks.jsx";
import Store from "./pages/Store.jsx";
import Admin from "./pages/Admin.jsx";
import TaskCallback from "./pages/TaskCallback.jsx";
import Wallet from "./pages/Wallet.jsx";
import ProfilePage from "./pages/Profile.jsx";
import Invite from "./pages/Invite.jsx";
import Marketing from "./pages/Marketing.jsx";
import MarketingWallet from "./pages/MarketingWallet.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import Terms from "./pages/Terms.jsx";
import Privacy from "./pages/Privacy.jsx";
import Fraud from "./pages/Fraud.jsx";
import RedemptionPolicy from "./pages/RedemptionPolicy.jsx";
import Contact from "./pages/Contact.jsx";
import HelpCenter from "./pages/HelpCenter.jsx";

import ErrorBoundary from "./components/ErrorBoundary.jsx";

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/fraud" element={<Fraud />} />
        <Route path="/redemption-policy" element={<RedemptionPolicy />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/landing" element={<CloudVIPLanding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/store" element={<Store />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/marketing" element={<Marketing />} />
        <Route path="/marketing-wallet" element={<MarketingWallet />} />
        <Route path="/invite" element={<Invite />} />
        <Route path="/task/callback" element={<TaskCallback />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
}
