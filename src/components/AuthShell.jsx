import React from "react";
import { Link } from "react-router-dom";

export default function AuthShell({ title, subtitle, icon: Icon, children, promo }) {
  return (
    <div className="relative min-h-screen bg-[#F8FAFC] font-[Be_Vietnam_Pro] text-slate-900">
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-10">
        {/* Card */}
        <div className="rounded-3xl border border-slate-200/60 bg-white p-7 shadow-[0_2px_8px_rgba(15,23,42,0.04),0_12px_32px_-8px_rgba(15,23,42,0.08)]">
          {/* Icon vuông bo góc lớn */}
          {Icon && (
            <div className="mb-5 flex justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 shadow-lg shadow-sky-500/30">
                <Icon size={28} className="text-white" strokeWidth={2.2} />
              </span>
            </div>
          )}

          <h1 className="text-center text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-center text-sm leading-relaxed text-slate-500">
              {subtitle}
            </p>
          )}
          <div className="mt-7">{children}</div>
        </div>

        {/* Promo */}
        {promo && (
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              {promo.heading}{" "}
              <Link
                to={promo.ctaHref}
                className="font-semibold text-sky-600 hover:underline"
              >
                {promo.ctaLabel}
              </Link>
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="mt-8 text-center text-[11px] leading-relaxed text-slate-400">
          Bằng việc tiếp tục, bạn đồng ý với{" "}
          <Link to="/terms" className="font-medium text-slate-500 hover:text-sky-600">
            Điều khoản
          </Link>{" "}
          và{" "}
          <Link to="/privacy" className="font-medium text-slate-500 hover:text-sky-600">
            Chính sách bảo mật
          </Link>{" "}
          của chúng tôi.
        </p>
      </div>
    </div>
  );
}
