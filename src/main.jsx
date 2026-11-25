import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { initUpdater } from "./lib/updater";

initUpdater();

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("🔥 React Error:", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 20, fontFamily: "monospace" }}>
          <h2 style={{ color: "red" }}>🔥 LỖI REACT</h2>
          <pre
            style={{
              background: "#f1f5f9",
              padding: 12,
              borderRadius: 8,
              fontSize: 11,
              whiteSpace: "pre-wrap",
            }}
          >
            {this.state.error.message}
            {"\n\n"}
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Lỗi tải file JS (thường do service worker giữ bản cũ sau deploy):
// chỉ reload 1 lần / 30 giây, xóa service worker + cache cũ trước khi reload.
window.addEventListener("vite:preloadError", async (e) => {
  e.preventDefault();
  const KEY = "preload_reload_at";
  try {
    const last = Number(sessionStorage.getItem(KEY) || 0);
    if (Date.now() - last < 30000) return;
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {}
  try {
    const regs = (await navigator.serviceWorker?.getRegistrations?.()) || [];
    await Promise.all(regs.map((r) => r.unregister()));
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  } catch {}
  window.location.reload();
});
