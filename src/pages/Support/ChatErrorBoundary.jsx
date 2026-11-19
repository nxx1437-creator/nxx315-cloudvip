// src/pages/Support/ChatErrorBoundary.jsx
import React from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

const isDev = import.meta.env?.DEV ?? false;

export default class ChatErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorId: null };
    this.handleReset = this.handleReset.bind(this);
    this.handleReload = this.handleReload.bind(this);
    this.handleGoHome = this.handleGoHome.bind(this);
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
      errorId: `NXX-${Date.now().toString(36).toUpperCase()}`,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ChatErrorBoundary]", error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.handleReset();
    }
  }

  handleReset() {
    this.setState({ hasError: false, error: null, errorId: null });
  }

  handleReload() {
    window.location.reload();
  }

  handleGoHome() {
    window.location.href = "/";
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="fixed inset-0 flex flex-col items-center justify-center bg-red-50 p-6 text-center text-red-600"
        >
          <AlertTriangle size={48} className="mb-4" aria-hidden="true" />
          <h2 className="mb-2 text-xl font-bold">Đã xảy ra lỗi giao diện</h2>
          <p className="max-w-sm text-sm">
            {isDev
              ? this.state.error?.message || "Lỗi không xác định"
              : "Rất tiếc, có lỗi xảy ra. Bạn thử lại hoặc liên hệ hỗ trợ kèm mã lỗi bên dưới."}
          </p>
          {this.state.errorId && (
            <p className="mt-2 text-[12px] text-red-500/80">
              Mã lỗi: <b>{this.state.errorId}</b>
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white"
            >
              <RotateCcw size={16} aria-hidden="true" />
              Thử lại
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-red-600"
            >
              Tải lại trang
            </button>
            <button
              type="button"
              onClick={this.handleGoHome}
              className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-red-600"
            >
              <Home size={16} aria-hidden="true" />
              Về trang chủ
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
  }
