import React from "react";
import { Link } from "react-router-dom";
import { SearchX, Home, Compass } from "lucide-react";

/**
 * NotFoundPage.jsx — thiết kế gọn, dùng icon chuẩn thay vì nhân vật vẽ tay.
 */
export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-sky-50 via-white to-white px-6 text-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
        @keyframes floaty { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      `}</style>

      <div
        className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-xl shadow-sky-500/30"
        style={{ animation: "floaty 2.6s ease-in-out infinite" }}
      >
        <SearchX size={40} className="text-white" />
      </div>

      <h1 className="font-display mt-6 text-6xl font-extrabold text-sky-500">404</h1>
      <h2 className="mt-2 text-lg font-bold text-slate-800">Không tìm thấy trang</h2>
      <p className="mt-1.5 max-w-xs text-sm text-slate-400">
        Đường dẫn bạn vào không tồn tại, hoặc đã được chuyển đi chỗ khác.
      </p>

      <div className="mt-6 flex w-full max-w-xs flex-col gap-2.5">
        <Link
          to="/dashboard"
          className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition hover:brightness-110"
        >
          <Home size={16} /> Về Trang chủ
        </Link>
        <Link
          to="/tasks"
          className="flex items-center justify-center gap-2 rounded-full border border-sky-100 bg-white py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
        >
          <Compass size={16} /> Khám phá Nhiệm vụ
        </Link>
      </div>
    </div>
  );
}
