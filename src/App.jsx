import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";

// Import thẳng component Admin đơn giản
function Admin() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <h1 className="text-4xl font-bold text-blue-600">🛡️ Admin Panel</h1>
    </div>
  );
}

function Home() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <h1 className="text-4xl font-bold text-slate-900">🏠 Trang chủ</h1>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </HashRouter>
  );
}