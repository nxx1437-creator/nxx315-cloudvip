import React from "react";
import { Link } from "react-router-dom";
import { Coins } from "lucide-react";

export default function AuthShell({ title, subtitle, children, promo }) {
  return (
    <div className="relative min-h-screen bg-[#FAFBFC] font-[Be_Vietnam_Pro] text-slate-900">
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-10">
        {/* Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>

        {/* Promo */}
        {promo && (
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900">
                <Coins size={18} className="text-white" />
              </span>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Nxx315 <span className="text-sky-600">Studio</span> Rewards
              </span>
            </div>
            <h2 className="mt-4 text-base font-semibold text-slate-900">{promo.heading}</h2>
            <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">{promo.body}</p>
            <Link
              to={promo.ctaHref}
              className="mt-5 inline-block w-full rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {promo.ctaLabel}
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 flex flex-col items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <Link to="/terms" className="transition hover:text-slate-600">Điều khoản dịch vụ</Link>
            <span className="h-3 w-px bg-slate-200" />
            <Link to="/privacy" className="transition hover:text-slate-600">Chính sách bảo mật</Link>
            <span className="h-3 w-px bg-slate-200" />
            <Link to="/support" className="transition hover:text-slate-600">Hỗ trợ</Link>
          </div>
          <span className="rounded-md border border-slate-200 bg-white px-3 py-1">🇻🇳 Tiếng Việt</span>
        </div>
      </div>
    </div>
  );
}
