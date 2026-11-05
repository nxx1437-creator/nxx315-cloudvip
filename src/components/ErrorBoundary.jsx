// src/components/ErrorBoundary.jsx — bắt lỗi để không bị trắng trang; tự tải lại 1 lần nếu lỗi do bản build cũ (chunk)
import React from "react";

const CHUNK_RE =
  /dynamically imported module|Importing a module script failed|Loading chunk|Failed to fetch dynamically|error loading dynamically/i;
const FLAG = "nxx_chunk_reloaded";

export default class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidMount() {
    // Đã chạy ổn 10 giây thì cho phép tự tải lại lần sau
    this.timer = setTimeout(() => {
      try { sessionStorage.removeItem(FLAG); } catch { /* ignore */ }
    }, 10000);
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  componentDidCatch(error) {
    console.error("[ErrorBoundary]", error);
    if (CHUNK_RE.test(String(error?.message || error))) {
      try {
        if (!sessionStorage.getItem(FLAG)) {
          sessionStorage.setItem(FLAG, "1");
          window.location.reload();
        }
      } catch { /* ignore */ }
    }
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#eef2f9] px-6 text-center">
        <p className="text-[22px] font-bold text-slate-900">Trang gặp lỗi</p>
        <p className="mt-2 max-w-sm text-[15px] text-slate-500">
          Bạn thử tải lại trang nhé. Nếu vẫn lỗi, chụp màn hình này gửi cho admin.
        </p>
        <pre className="mt-4 max-w-full overflow-x-auto rounded-xl bg-white p-3 text-left text-[12px] text-rose-600">
          {String(error?.message || error).slice(0, 300)}
        </pre>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => {
              try { sessionStorage.removeItem(FLAG); } catch { /* ignore */ }
              window.location.reload();
            }}
            className="rounded-xl bg-[#2b59e0] px-6 py-3 text-[15px] font-semibold text-white"
          >
            Tải lại trang
          </button>
          <a href="/" className="rounded-xl bg-white px-6 py-3 text-[15px] font-semibold text-slate-800">
            Về trang chủ
          </a>
        </div>
      </div>
    );
  }
          }
