import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
// import ProtectedRoute from './components/ProtectedRoute.jsx';

// Pages
import Home from './CloudVIPLanding.jsx';
import Tasks from './pages/Tasks.jsx';
import Store from './pages/Store.jsx';
import Admin from './pages/Admin.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';  // hoặc Register.jsx, tùy bạn dùng cái nào
import Terms from './pages/Terms.jsx';
import Privacy from './pages/Privacy.jsx';
import Fraud from './pages/Fraud.jsx';
import RedemptionPolicy from './pages/RedemptionPolicy.jsx';
import Contact from './pages/Contact.jsx';
import HelpCenter from './pages/HelpCenter.jsx';
import Profile from './pages/Profile.jsx';
import Wallet from './pages/Wallet.jsx';
import Support from './pages/Support.jsx';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/register" element={<Signup />} /> {/* Nếu ai vào /register cũng ra Signup */}
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/fraud" element={<Fraud />} />
        <Route path="/redemption-policy" element={<RedemptionPolicy />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<HelpCenter />} />

        {/* Protected routes */}
        <Route path="/" element={<Home />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/store" element={<Store />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/support" element={<Support />} />
      </Routes>
    </HashRouter>
  );
      }
