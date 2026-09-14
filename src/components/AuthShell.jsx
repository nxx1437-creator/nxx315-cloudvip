import React from "react";
import { Link } from "react-router-dom";

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-white font-[Be_Vietnam_Pro] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-6 py-10">
        {/* Title */}
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            {subtitle}
          </p>
        )}

        <div className="mt-8">{children}</div>

        {/* Footer */}
        <p className="mt-10 text-center text-xs text-slate-400">
          <Link to="/terms" className="underline hover:text-slate-600">
            Điều khoản sử dụng
          </Link>{" "}
          |{" "}
          <Link to="/privacy" className="underline hover:text-slate-600">
            Chính sách bảo mật
          </Link>
        </p>
      </div>
    </div>
  );
}
