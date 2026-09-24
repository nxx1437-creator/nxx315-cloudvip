import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

registerSW({
  onNeedRefresh() {
    console.log("[PWA] Có bản mới, sẽ cập nhật khi user rảnh...");

    const doReload = () => {
      console.log("[PWA] Reload ngầm...");
      window.location.reload();
    };

    // Reload khi user chuyển tab / ẩn app
    const handleVisibility = () => {
      if (document.hidden) {
        document.removeEventListener("visibilitychange", handleVisibility);
        doReload();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Fallback: nếu 5 phút không chuyển tab → reload luôn
    setTimeout(() => {
      document.removeEventListener("visibilitychange", handleVisibility);
      doReload();
    }, 5 * 60 * 1000);
  },
  onOfflineReady() {
    console.log("[PWA] App sẵn sàng dùng offline");
  },
  immediate: true,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);