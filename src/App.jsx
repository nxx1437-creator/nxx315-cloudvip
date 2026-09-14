import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import CloudVIPLanding from "./CloudVIPLanding.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import PageSkeleton from "./components/PageSkeleton.jsx";
import VersionChecker from "./VersionChecker";

// =====================================================
// LAZY LOAD — Tải khi user vào route
// =====================================================

const Invite = lazy(() => import("./pages/Invite.jsx"));
const RedirectPage = lazy(() => import("./pages/RedirectPage.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Tasks = lazy(() => import("./pages/Tasks.jsx"));
const Store = lazy(() => import("./pages/Store.jsx"));
const ShopEarn = lazy(() => import("./pages/ShopEarn.jsx"));
const LinkHistory = lazy(() => import("./pages/LinkHistory.jsx"));
const RefundHistoryPage = lazy(() => import("./pages/RefundHistoryPage.jsx"));
const MiniGames = lazy(() => import("./pages/MiniGames.jsx"));
const WheelGame = lazy(() => import("./pages/games/WheelGame.jsx"));
const ScratchGame = lazy(() => import("./pages/games/ScratchGame.jsx"));
const DiceGame = lazy(() => import("./pages/games/DiceGame.jsx"));
const Admin = lazy(() => import("./pages/Admin.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const HelpCenter = lazy(() => import("./pages/HelpCenter.jsx"));
const Support = lazy(() => import("./pages/Support.jsx"));
const Terms = lazy(() => import("./pages/Terms.jsx"));
const Privacy = lazy(() => import("./pages/Privacy.jsx"));
const Fraud = lazy(() => import("./pages/Fraud.jsx"));
const RedemptionPolicy = lazy(() => import("./pages/RedemptionPolicy.jsx"));
const Wallet = lazy(() => import("./pages/Wallet.jsx"));
const ProfilePage = lazy(() => import("./pages/Profile.jsx"));
const TaskCallback = lazy(() => import("./pages/TaskCallback.jsx"));
const Banned = lazy(() => import("./pages/Banned.jsx"));
const AccountReview = lazy(() => import("./pages/AccountReview.jsx"));
const Onboarding = lazy(() => import("./pages/Onboarding.jsx"));
const Feed = lazy(() => import("./pages/Feed.jsx"));
const Roblox = lazy(() => import("./pages/Roblox.jsx"));
const PlayTogether = lazy(() => import("./pages/PlayTogether.jsx"));
const LienQuan = lazy(() => import("./pages/LienQuan.jsx"));
const HistoryPage = lazy(() => import("./pages/History.jsx"));
const HistoryDetail = lazy(() => import("./pages/HistoryDetail.jsx"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<CloudVIPLanding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/invite" element={<ProtectedRoute><Invite /></ProtectedRoute>} />
          <Route path="/redirect" element={<ProtectedRoute><RedirectPage /></ProtectedRoute>} />

          <Route path="/banned" element={<Banned />} />
          <Route path="/account-review" element={<AccountReview />} />
          <Route path="/onboarding" element={<Onboarding />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
          <Route path="/store" element={<ProtectedRoute><Store /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/history/order/:id" element={<ProtectedRoute><HistoryDetail /></ProtectedRoute>} />
          <Route path="/shop-earn" element={<ProtectedRoute><ShopEarn /></ProtectedRoute>} />
          <Route path="/store/roblox" element={<ProtectedRoute><Roblox /></ProtectedRoute>} />
          <Route path="/store/play-together" element={<ProtectedRoute><PlayTogether /></ProtectedRoute>} />
          <Route path="/store/lien-quan" element={<ProtectedRoute><LienQuan /></ProtectedRoute>} />

          <Route path="/link-history" element={<LinkHistory />} />
          <Route path="/refund-history" element={<RefundHistoryPage />} />

          <Route path="/minigames" element={<ProtectedRoute><MiniGames /></ProtectedRoute>} />
          <Route path="/minigames/wheel" element={<ProtectedRoute><WheelGame /></ProtectedRoute>} />
          <Route path="/minigames/scratch" element={<ProtectedRoute><ScratchGame /></ProtectedRoute>} />
          <Route path="/minigames/dice" element={<ProtectedRoute><DiceGame /></ProtectedRoute>} />

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

          <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
        </Routes>
      </Suspense>

      <VersionChecker />
    </BrowserRouter>
  );
}
