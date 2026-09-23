import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

// ✅ Tự động cập nhật Service Worker (PWA)
registerSW({
  onNeedRefresh() {
    console.log("[PWA] Có bản mới, đang tự động cập nhật...");

    // Hiện toast nhỏ báo user
    const existing = document.getElementById("pwa-update-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "pwa-update-toast";
    toast.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: #3478F6;
      color: white;
      padding: 12px 20px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      z-index: 9999;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      gap: 6px;
    `;
    toast.innerHTML = " Đang cập nhật phiên bản mới...";
    document.body.appendChild(toast);

    // Tự reload sau 2 giây để load bản mới
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  },
  onOfflineReady() {
    console.log("[PWA] App sẵn sàng dùng offline");
  },
  onRegistered(registration) {
    console.log("[PWA] Service Worker đã đăng ký:", registration);
  },
  onRegisterError(error) {
    console.error("[PWA] Đăng ký Service Worker thất bại:", error);
  },
  immediate: true,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);