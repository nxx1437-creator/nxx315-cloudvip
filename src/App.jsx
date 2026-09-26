import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ✅ Page public — load ngay
import CloudVIPLanding from "./CloudVIPLanding.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

// ✅ Page chính — lazy load
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Tasks = lazy(() => import("./pages/Tasks.jsx"));
const Store = lazy(() => import("./pages/Store.jsx"));
const ProfilePage = lazy(() => import("./pages/Profile.jsx"));
const Invite = lazy(() => import("./pages/Invite.jsx"));
const Level = lazy(() => import("./pages/Level.jsx"));
const Wallet = lazy(() => import("./pages/Wallet.jsx"));
const Withdraw = lazy(() => import("./pages/Withdraw.jsx"));
const WithdrawHistory = lazy(() => import("./pages/WithdrawHistory.jsx"));
const HistoryPage = lazy(() => import("./pages/History.jsx"));
const HistoryDetail = lazy(() => import("./pages/HistoryDetail.jsx"));
const Leaderboard = lazy(() => import("./pages/Leaderboard.jsx"));
const MiniGames = lazy(() => import("./pages/MiniGames.jsx"));
const WheelGame = lazy(() => import("./pages/games/WheelGame.jsx"));
const ScratchGame = lazy(() => import("./pages/games/ScratchGame.jsx"));
const DiceGame = lazy(() => import("./pages/games/DiceGame.jsx"));
const Notifications = lazy(() => import("./pages/Notifications.jsx"));
const TaskCallback = lazy(() => import("./pages/TaskCallback.jsx"));
const Feed = lazy(() => import("./pages/Feed.jsx"));
const Videos = lazy(() => import("./pages/Videos.jsx"));

// Store games
const Roblox = lazy(() => import("./pages/Roblox.jsx"));
const PlayTogether = lazy(() => import("./pages/PlayTogether.jsx"));
const LienQuan = lazy(() => import("./pages/LienQuan.jsx"));
const FreeFire = lazy(() => import("./pages/FreeFire.jsx"));
const PubgMobile = lazy(() => import("./pages/PubgMobile.jsx"));
const FcMobile = lazy(() => import("./pages/FcMobile.jsx"));
const Valorant = lazy(() => import("./pages/Valorant.jsx"));

// Khác
const ShopEarn = lazy(() => import("./pages/ShopEarn.jsx"));
const LinkHistory = lazy(() => import("./pages/LinkHistory.jsx"));
const RefundHistoryPage = lazy(() => import("./pages/RefundHistoryPage.jsx"));
const NapThanhCong = lazy(() => import("./pages/NapThanhCong.jsx"));
const AccountReview = lazy(() => import("./pages/AccountReview.jsx"));
const Banned = lazy(() => import("./pages/Banned.jsx"));
const Onboarding = lazy(() => import("./pages/Onboarding.jsx"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail.jsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const HelpCenter = lazy(() => import("./pages/HelpCenter.jsx"));
const Support = lazy(() => import("./pages/Support.jsx"));
const Community = lazy(() => import("./pages/Community.jsx"));
const Terms = lazy(() => import("./pages/Terms.jsx"));
const Privacy = lazy(() => import("./pages/Privacy.jsx"));
const Fraud = lazy(() => import("./pages/Fraud.jsx"));
const RedemptionPolicy = lazy(() => import("./pages/RedemptionPolicy.jsx"));
const MarketingVideo = lazy(() => import("./pages/MarketingVideo.jsx"));
const MarketingWallet = lazy(() => import("./pages/MarketingWallet.jsx"));
const Admin = lazy(() => import("./pages/Admin.jsx"));
const AdminNotifications = lazy(() => import("./pages/AdminNotifications.jsx"));
const AdminChat = lazy(() => import("./pages/AdminChat.jsx"));

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import BanGate from "./components/BanGate";
import DeviceChecker from "./components/DeviceChecker.jsx";
import VersionChecker from "./components/VersionChecker.jsx"; // ✅ MỚI

export default function App() {
  return (
    <BanGate>
      <BrowserRouter>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<CloudVIPLanding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/banned" element={<Banned />} />
            <Route path="/account-review" element={<AccountReview />} />
            <Route path="/onboarding" element={<Onboarding />} />

            <Route path="/invite" element={<ProtectedRoute><Invite /></ProtectedRoute>} />
            <Route path="/level" element={<ProtectedRoute><Level /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
            <Route path="/store" element={<ProtectedRoute><Store /></ProtectedRoute>} />
            <Route path="/videos" element={<ProtectedRoute><Videos /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
            <Route path="/history/order/:id" element={<ProtectedRoute><HistoryDetail /></ProtectedRoute>} />
            <Route path="/shop-earn" element={<ProtectedRoute><ShopEarn /></ProtectedRoute>} />

            <Route path="/store/roblox" element={<ProtectedRoute><Roblox /></ProtectedRoute>} />
            <Route path="/store/play-together" element={<ProtectedRoute><PlayTogether /></ProtectedRoute>} />
            <Route path="/store/lien-quan" element={<ProtectedRoute><LienQuan /></ProtectedRoute>} />
            <Route path="/store/free-fire" element={<ProtectedRoute><FreeFire /></ProtectedRoute>} />
            <Route path="/store/pubg-mobile" element={<ProtectedRoute><PubgMobile /></ProtectedRoute>} />
            <Route path="/store/fc-mobile" element={<ProtectedRoute><FcMobile /></ProtectedRoute>} />
            <Route path="/store/valorant" element={<ProtectedRoute><Valorant /></ProtectedRoute>} />

            <Route path="/nap-thanh-cong/:orderId" element={<ProtectedRoute><NapThanhCong /></ProtectedRoute>} />
            <Route path="/link-history" element={<LinkHistory />} />
            <Route path="/refund-history" element={<RefundHistoryPage />} />

            <Route path="/minigames" element={<ProtectedRoute><MiniGames /></ProtectedRoute>} />
            <Route path="/minigames/wheel" element={<ProtectedRoute><WheelGame /></ProtectedRoute>} />
            <Route path="/minigames/scratch" element={<ProtectedRoute><ScratchGame /></ProtectedRoute>} />
            <Route path="/minigames/dice" element={<ProtectedRoute><DiceGame /></ProtectedRoute>} />

            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/admin/notifications" element={<AdminRoute><AdminNotifications /></AdminRoute>} />
            <Route path="/admin/chat/:conversationId" element={<AdminRoute><AdminChat /></AdminRoute>} />

            <Route path="/contact" element={<Contact />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/support" element={<Support />} />
            <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/fraud" element={<Fraud />} />
            <Route path="/redemption-policy" element={<RedemptionPolicy />} />

            <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
            <Route path="/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
            <Route path="/withdraw/history" element={<ProtectedRoute><WithdrawHistory /></ProtectedRoute>} />

            <Route path="/marketing-video" element={<ProtectedRoute><MarketingVideo /></ProtectedRoute>} />
            <Route path="/marketing-wallet" element={<ProtectedRoute><MarketingWallet /></ProtectedRoute>} />

            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/task/callback" element={<TaskCallback />} />
            <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          </Routes>
        </Suspense>

        {/* ✅ Auto reload khi có bản mới */}
        <VersionChecker />

        <DeviceChecker />
      </BrowserRouter>
    </BanGate>
  );
              }
