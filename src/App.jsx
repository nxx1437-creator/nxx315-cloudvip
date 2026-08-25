import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';

// Import các trang
import Home from './CloudVIPLanding.jsx';
import Tasks from './pages/Tasks.jsx';
import Store from './pages/Store.jsx';
import Admin from './pages/Admin.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Status from './pages/Status.jsx';  // 👈 Thêm import

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Các trang chính */}
        <Route path="/" element={<Home />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/store" element={<Store />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signup" element={<Register />} />
        
        {/* 👉 Trang trạng thái */}
        <Route path="/status" element={<Status />} />
      </Routes>
    </HashRouter>
  );
}
