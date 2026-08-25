import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';

// Components đơn giản test trước
function Home() {
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h1>🏠 NXX315 Studio</h1>
      <p>Chào mừng bạn!</p>
      <a href="#/login">Đăng nhập</a> | <a href="#/signup">Đăng ký</a>
    </div>
  );
}

function Login() {
  return <div style={{ padding: 40 }}>🔐 Trang đăng nhập</div>;
}

function Signup() {
  return <div style={{ padding: 40 }}>📝 Trang đăng ký</div>;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </HashRouter>
  );
}
