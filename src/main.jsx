import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

// ✅ Cập nhật ngầm khi user không để ý
registerSW({
  onNeedRefresh() {
    console.log("[PWA] Có bản mới, sẽ cập nhật khi user rảnh...");

    // Chờ đến khi user chuyển tab hoặc đóng app
    const handleVisibility = () => {
      if (document.hidden) {
        console.log("[PWA] User không để ý, đang cập nhật...");
        window.location.reload();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    // Fallback: nếu user không chuyển tab trong 5 phút, reload luôn
    setTimeout(() => {
      console.log("[PWA] Đã 5 phút, cập nhật luôn...");
      window.location.reload();
    }, 5 * 60 * 1000);
  },
  onOfflineReady() {
    console.log("[PWA] App sẵn sàng dùng offline");
  },
  onRegistered(registration) {
    console.log("[PWA] Service Worker đã đăng ký");
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