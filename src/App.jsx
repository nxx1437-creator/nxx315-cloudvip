import React from "react";
import { Routes, Route } from "react-router-dom";
import CloudVIPLanding from "./CloudVIPLanding.jsx";
import Login from "./Login.jsx";
import Register from "./Register.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CloudVIPLanding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}
