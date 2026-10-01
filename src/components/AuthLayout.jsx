import React from "react";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import { useI18n } from "../i18n/index.js";

// Khung chung cho các trang đăng nhập / đăng ký / quên mật khẩu.
// AuthShell cũ vẫn giữ nguyên để các trang khác không bị ảnh hưởng.
export default function AuthLayout({ title, children, footer }) {
  const { t } = useI18n();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-teal-50 via-white to-cyan-50 font-['Be_Vietnam_Pro',sans-serif]">
      {/* Nền trang trí */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-8 pt-4">
        {/* Thanh trên: ngôn ngữ */}
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>

        {/* Logo + khẩu hiệu */}
        <div className="mt-6 flex flex-col items-center text-center">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 shadow-lg shadow-teal-500/30">
              <span className="font-['Baloo_2',sans-serif] text-2xl font-extrabold text-white">
                N
              </span>
            </div>
            <span className="font-['Baloo_2',sans-serif] text-3xl font-extrabold tracking-tight text-slate-900">
              Nxx315
              <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                {" "}
                Studio
              </span>
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">
            {t("brand.tagline")}
          </p>
        </div>

        {/* Thẻ chính */}
        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 shadow-xl shadow-teal-900/5 backdrop-blur">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
          <div className="px-6 pb-6 pt-7">
            <h1 className="mb-6 text-[26px] font-extrabold leading-tight text-slate-900">
              {title}
            </h1>
            {children}
          </div>
          {footer && (
            <div className="border-t border-slate-100 bg-slate-50/80 px-6 py-5 text-center text-sm text-slate-500">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
              }
