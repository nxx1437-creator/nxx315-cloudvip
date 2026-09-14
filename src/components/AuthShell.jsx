import React from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function AuthShell({ title, subtitle, children, promo }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAFBFC] font-[Be_Vietnam_Pro] text-slate-900">
      {/* Gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-x-0 top-0 h-[500px] opacity-60 blur-3xl"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 0%, rgba(56,189,248,0.25), transparent 70%)",
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-10">
        {/* Logo on top — chỉ chữ */}
        <div className="mb-6 flex items-center justify-center">
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Nxx315 <span className="text-sky-600">Studio</span> Rewards
          </span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_8px_32px_rgba(15,23,42,0.06)]">
          {/* Badge */}
          <div className="mb-4 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold text-sky-700">
              <Sparkles size={11} />
              Miễn phí 100% — Không cần nạp tiền
            </span>
          </div>

          <h1 className="text-center text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-center text-sm text-slate-500">{subtitle}</p>
          )}
          <div className="mt-6">{children}</div>
        </div>

        {/* Promo */}
        {promo && (
          <div className="mt-8 text-center">
            <h2 className="text-base font-semibold text-slate-900">
              {promo.heading}
            </h2>
            <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">
              {promo.body}
            </p>
            <Link
              to={promo.ctaHref}
              className="mt-5 inline-block w-full rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
            >
              {promo.ctaLabel}
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 flex flex-col items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <Link to="/terms" className="transition hover:text-sky-600">
              Điều khoản
            </Link>
            <span className="h-3 w-px bg-slate-200" />
            <Link to="/privacy" className="transition hover:text-sky-600">
              Bảo mật
            </Link>
            <span className="h-3 w-px bg-slate-200" />
            <Link to="/support" className="transition hover:text-sky-600">
              Hỗ trợ
            </Link>
          </div>
          <span className="rounded-md border border-slate-200 bg-white px-3 py-1">
            🇻🇳 Tiếng Việt
          </span>
        </div>
      </div>
    </div>
  );
}
