import React from "react";
import { Link } from "react-router-dom";
import { Coins } from "lucide-react";

export default function AuthShell({ title, subtitle, children, promo }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#040910] font-[Be_Vietnam_Pro] text-sky-50">
      {/* Nền */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(56,189,248,0.18),transparent_60%)]" />
        <div className="absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,9,16,0.2),rgba(4,9,16,0.9))]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-10">
        {/* Thẻ kính */}
        <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-7 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-sky-200/60">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>

        {/* Khối quảng bá */}
        {promo && (
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg shadow-sky-500/30">
                <Coins size={18} className="text-white" />
              </span>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Nxx315 <span className="text-sky-400">Studio</span> Rewards
              </span>
            </div>
            <h2 className="mt-4 text-lg font-bold text-white">{promo.heading}</h2>
            <p className="mx-auto mt-2 max-w-xs text-sm text-sky-200/60">{promo.body}</p>
            <Link
              to={promo.ctaHref}
              className="mt-5 inline-block w-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:brightness-110"
            >
              {promo.ctaLabel}
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 flex flex-col items-center gap-4 text-xs text-sky-200/40">
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-sky-200/70">Điều khoản dịch vụ</Link>
            <span className="h-3 w-px bg-white/10" />
            <Link to="/privacy" className="hover:text-sky-200/70">Chính sách bảo mật</Link>
            <span className="h-3 w-px bg-white/10" />
            <Link to="/support" className="hover:text-sky-200/70">Hỗ trợ</Link>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1">🇻🇳 Tiếng Việt</span>
        </div>
      </div>
    </div>
  );
            }
