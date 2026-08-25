import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import MaintenanceBanner from './components/MaintenanceBanner.jsx'; // 👈 Import

// Pages
import Home from './CloudVIPLanding.jsx';
import Tasks from './pages/Tasks.jsx';
import Store from './pages/Store.jsx';
import Admin from './pages/Admin.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Status from './pages/Status.jsx';

export default function App() {
  const MAINTENANCE_MODE = true; // 👈 Bật/tắt bảo trì ở đây

  return (
    <HashRouter>
      {/* 👉 Banner bảo trì hiển thị trên MỌI trang */}
      {MAINTENANCE_MODE && <MaintenanceBanner />}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/store" element={<Store />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/status" element={<Status />} />
      </Routes>
    </HashRouter>
  );
}
