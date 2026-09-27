import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

// ✅ Auto update — tự động lấy bundle mới
const updateSW = registerSW({
  onNeedRefresh() {
    console.log("[PWA] Có bản mới, tự động update...");
    // Tự động reload để lấy bundle mới
    updateSW(true);
  },
  onOfflineReady() {
    console.log("[PWA] App sẵn sàng offline");
  },
  onRegisterError(error) {
    console.error("[PWA] Lỗi đăng ký SW:", error);
  },
  immediate: true,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
