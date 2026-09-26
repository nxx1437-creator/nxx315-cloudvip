
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

// ✅ Silent update — không hiện gì với user
registerSW({
  onNeedRefresh() {
    // Chunk mới sẽ tự load khi user chuyển trang
    console.log("[PWA] Có bản mới, chunk sẽ load khi chuyển trang");
  },
  onOfflineReady() {
    console.log("[PWA] App sẵn sàng offline");
  },
  onRegisterError(error) {
    console.error("[PWA] Lỗi đăng ký Service Worker:", error);
  },
  immediate: true,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
