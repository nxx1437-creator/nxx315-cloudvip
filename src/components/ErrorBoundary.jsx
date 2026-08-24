import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("App crashed:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: "100vh", padding: 20, fontFamily: "monospace", background: "#1e293b", color: "#4ade80" }}>
          <p style={{ color: "white", fontWeight: "bold", marginBottom: 12 }}>💥 Lỗi khi chạy trang</p>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", background: "rgba(0,0,0,0.4)", padding: 12, borderRadius: 8 }}>
            {String(this.state.error?.message || this.state.error)}
            {"\n\n"}
            {String(this.state.error?.stack || "")}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            style={{ marginTop: 16, padding: "8px 16px", borderRadius: 999, background: "#38bdf8", color: "white", border: "none" }}
          >
            Thử lại
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
