import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Tạo component đơn giản ngay trong file này
function Home() {
  return <div style={{ padding: 40, textAlign: 'center' }}>🏠 Trang chủ</div>;
}

function Login() {
  return <div style={{ padding: 40 }}>🔐 Login</div>;
}

function Signup() {
  return <div style={{ padding: 40 }}>📝 Signup</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}
