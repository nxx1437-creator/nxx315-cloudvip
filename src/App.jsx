import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

/* =========================================================
 * STATIC IMPORTS — luôn đặt trên đầu file (ESLint import/first)
 * =======================================================*/
import GuideWelcomeModal from "./components/GuideWelcomeModal.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import BanGate from "./components/BanGate";
import DeviceChecker from "./components/DeviceChecker.jsx";
import VersionChecker from "./components/VersionChecker.jsx";
import SessionGuard from "./components/SessionGuard.jsx";
import SessionValidator from "./components/SessionValidator.jsx";
import PageLoader from "./components/PageLoader.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

/* Trang public entry — load eager để LCP nhanh */
import CloudVIPLanding from "./CloudVIPLanding.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import AuthCallback from "./pages/AuthCallback.jsx";

/* CardExchange — eager (giữ nguyên theo yêu cầu cũ của bạn) */
import CardExchange from "./pages/CardExchange.jsx";

/* =========================================================
 * LAZY IMPORTS — tất cả phần còn lại
 * =======================================================*/
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
const PublicProfile = lazy(() => import("./pages/PublicProfile.jsx"));
const MiniGames = lazy(() => import("./pages/MiniGames.jsx"));
const WheelGame = lazy(() => import("./pages/games/WheelGame.jsx"));
const ScratchGame = lazy(() => import("./pages/games/ScratchGame.jsx"));
const DiceGame = lazy(() => import("./pages/games/DiceGame.jsx"));
const Notifications = lazy(() => import("./pages/Notifications.jsx"));
const TaskCallback = lazy(() => import("./pages/TaskCallback.jsx"));
const Feed = lazy(() => import("./pages/Feed.jsx"));
const Videos = lazy(() => import("./pages/Videos.jsx"));

/* Creator */
const CreatorLayout = lazy(() => import("./pages/creator/CreatorLayout.jsx"));
const CreatorOverview = lazy(() => import("./pages/creator/CreatorOverview.jsx"));
const CreatorRanking = lazy(() => import("./pages/creator/CreatorRanking.jsx"));
const CreatorVideos = lazy(() => import("./pages/creator/CreatorVideos.jsx"));
const CreatorRewards = lazy(() => import("./pages/creator/CreatorRewards.jsx"));
const CreatorSettings = lazy(() => import("./pages/creator/CreatorSettings.jsx"));

/* Guide + About */
const GuideHome = lazy(() => import("./pages/Guide/GuideHome.jsx"));
const GuideDetail = lazy(() => import("./pages/Guide/GuideDetail.jsx"));
const About = lazy(() => import("./pages/About.jsx"));

/* Store games */
const Roblox = lazy(() => import("./pages/Roblox.jsx"));
const PlayTogether = lazy(() => import("./pages/PlayTogether.jsx"));
const LienQuan = lazy(() => import("./pages/LienQuan.jsx"));
const FreeFire = lazy(() => import("./pages/FreeFire.jsx"));
const FcMobile = lazy(() => import("./pages/FcMobile.jsx"));
const Valorant = lazy(() => import("./pages/Valorant.jsx"));

/* Khác */
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
const Support = lazy(() => import("./pages/Support/index.jsx"));
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

/* 404 */
const NotFound = lazy(() => import("./pages/NotFoundPage.jsx"));

/* =========================================================
 * APP
 * =======================================================*/
export default function App() {
  return (
    <BrowserRouter>
      {/*
        BanGate BÊN TRONG BrowserRouter để có thể dùng useNavigate
        nếu cần redirect sang /banned. Nếu BanGate không dùng router
        thì vị trí này vẫn đúng.
      */}
      <BanGate>
        {/*
          ErrorBoundary ôm toàn bộ app (kể cả các checker ở dưới)
          để tránh crash trắng khi 1 component throw.
        */}
        <ErrorBoundary>
          {/* Các checker chạy nền — bọc ErrorBoundary để lỗi không lan */}
          <VersionChecker />
          <DeviceChecker />
          <SessionGuard />
          <SessionValidator />
          <GuideWelcomeModal />

          {/* Suspense chỉ bọc Routes để loader không đè header/layout */}
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ===================== PUBLIC ===================== */}
              <Route path="/" element={<CloudVIPLanding />} />
              <Route path="/about" element={<About />} />
              <Route path="/guide" element={<GuideHome />} />
              <Route path="/guide/:id" element={<GuideDetail />} />

              {/* ===================== AUTH ===================== */}
              <Route path="/login" element={<Login />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/banned" element={<Banned />} />
              <Route path="/account-review" element={<AccountReview />} />
              <Route path="/onboarding" element={<Onboarding />} />

              {/* Info public */}
              <Route path="/contact" element={<Contact />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/support" element={<Support />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/fraud" element={<Fraud />} />
              <Route path="/redemption-policy" element={<RedemptionPolicy />} />

              {/* Callback từ provider — KHÔNG cần auth */}
              <Route path="/task/callback" element={<TaskCallback />} />

              {/* ===================== PROTECTED (gộp) ===================== */}
              {/* ProtectedRoute render <Outlet /> khi pass */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/invite" element={<Invite />} />
                <Route path="/level" element={<Level />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/store" element={<Store />} />
                <Route path="/videos" element={<Videos />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/u/:userId" element={<PublicProfile />} />
                <Route path="/profile" element={<ProfilePage />} />

                {/* History */}
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/history/order/:id" element={<HistoryDetail />} />
                <Route path="/link-history" element={<LinkHistory />} />
                <Route path="/refund-history" element={<RefundHistoryPage />} />
                <Route path="/nap-thanh-cong/:orderId" element={<NapThanhCong />} />

                {/* Wallet */}
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/withdraw" element={<Withdraw />} />
                <Route path="/withdraw/history" element={<WithdrawHistory />} />

                {/* Shop earn */}
                <Route path="/shop-earn" element={<ShopEarn />} />

                {/* Store games */}
                <Route path="/store/roblox" element={<Roblox />} />
                <Route path="/store/play-together" element={<PlayTogether />} />
                <Route path="/store/lien-quan" element={<LienQuan />} />
                <Route path="/store/free-fire" element={<FreeFire />} />
                <Route path="/store/fc-mobile" element={<FcMobile />} />
                <Route path="/store/valorant" element={<Valorant />} />

                {/* Minigames */}
                <Route path="/minigames" element={<MiniGames />} />
                <Route path="/minigames/wheel" element={<WheelGame />} />
                <Route path="/minigames/scratch" element={<ScratchGame />} />
                <Route path="/minigames/dice" element={<DiceGame />} />

                {/* Marketing */}
                <Route path="/marketing-video" element={<MarketingVideo />} />
                <Route path="/marketing-wallet" element={<MarketingWallet />} />

                {/* Community cần auth để tương tác */}
                <Route path="/community" element={<Community />} />

                {/* Creator — nested */}
                <Route path="/creator" element={<CreatorLayout />}>
                  <Route index element={<CreatorOverview />} />
                  <Route path="ranking" element={<CreatorRanking />} />
                  <Route path="videos" element={<CreatorVideos />} />
                  <Route path="rewards" element={<CreatorRewards />} />
                  <Route path="settings" element={<CreatorSettings />} />
                </Route>
              </Route>

              {/* ===================== CARD EXCHANGE ===================== */}
              {/*
                CardExchange trước đây không bọc ProtectedRoute.
                Nếu /cards yêu cầu login (thao tác tài chính), move
                vào block ProtectedRoute ở trên.
                Nếu thực sự public, giữ nguyên đây.
              */}
              <Route path="/cards" element={<CardExchange />} />

              {/* ===================== ADMIN (gộp) ===================== */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/notifications" element={<AdminNotifications />} />
                <Route path="/admin/chat/:conversationId" element={<AdminChat />} />
              </Route>

              {/* ===================== 404 ===================== */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BanGate>
    </BrowserRouter>
  );
      }
              

