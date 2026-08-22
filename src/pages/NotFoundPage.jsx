import React from "react";
import { Link, useLocation } from "react-router-dom";
import { SearchX, Home } from "lucide-react";

export default function NotFoundPage() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-sky-50 via-white to-white px-6 text-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
      `}</style>

      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-xl shadow-sky-500/30">
        <SearchX size={34} className="text-white" />
      </div>

      <h1 className="font-display mt-6 text-6xl font-extrabold text-sky-500">404</h1>
      <h2 className="mt-2 text-lg font-bold text-slate-800">Không tìm thấy trang</h2>
      <p className="mt-1.5 max-w-xs text-sm text-slate-400">
        Đường dẫn bạn vào không tồn tại, hoặc đã được chuyển đi chỗ khác.
      </p>

      <Link
        to="/dashboard"
        className="mt-6 flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition hover:brightness-110"
      >
        <Home size={16} /> Về Trang chủ
      </Link>

      <p className="mt-8 rounded-full bg-slate-100 px-3.5 py-1.5 font-mono text-xs text-slate-400">
        ID: {location.pathname}
      </p>
    </div>
  );
}
