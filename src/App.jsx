import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Pages
import Home from './CloudVIPLanding.jsx';
import Tasks from './pages/Tasks.jsx';
import Store from './pages/Store.jsx';
import Admin from './pages/Admin.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
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
        {/* Public routes - không cần login */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/fraud" element={<Fraud />} />
        <Route path="/redemption-policy" element={<RedemptionPolicy />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<HelpCenter />} />

        {/* Protected routes - cần login + xác nhận điều khoản */}
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/tasks" element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        } />
        <Route path="/store" element={
          <ProtectedRoute>
            <Store />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
      </Routes>
    </HashRouter>
  );
            }
