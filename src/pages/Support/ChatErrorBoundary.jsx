// src/pages/Support/ChatErrorBoundary.jsx
import React from "react";
import { AlertTriangle } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 text-red-600 h-full flex flex-col items-center justify-center text-center">
          <AlertTriangle size={48} className="mb-4" />
          <h2 className="text-xl font-bold mb-2">Đã xảy ra lỗi giao diện!</h2>
          <p className="text-sm">{this.state.error?.message || "Lỗi không xác định"}</p>
          <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg">Tải lại trang</button>
        </div>
      );
    }
    return this.props.children;
  }
}
