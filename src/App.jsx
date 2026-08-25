import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
// import ProtectedRoute from './components/ProtectedRoute.jsx';  // 👈 Comment lại

import Home from './CloudVIPLanding.jsx';
import Tasks from './pages/Tasks.jsx';
import Store from './pages/Store.jsx';
import Admin from './pages/Admin.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Terms from './pages/Terms.jsx';
import Privacy from './pages/Privacy.jsx';
import Fraud from './pages/Fraud.jsx';
import RedemptionPolicy from './pages/RedemptionPolicy.jsx';
import Contact from './pages/Contact.jsx';
import HelpCenter from './pages/HelpCenter.jsx';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/fraud" element={<Fraud />} />
        <Route path="/redemption-policy" element={<RedemptionPolicy />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<HelpCenter />} />

        {/* 👉 Bỏ ProtectedRoute, để nguyên component */}
        <Route path="/" element={<Home />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/store" element={<Store />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </HashRouter>
  );
}
