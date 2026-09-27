import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

registerSW({
  onNeedRefresh() {},
  onOfflineReady() {},
  onRegisterError(e) { console.error(e); },
  immediate: true,
});

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
