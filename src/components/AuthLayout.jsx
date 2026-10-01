import React from "react";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import { useI18n } from "../i18n/index.js";

export default function AuthLayout({ title, subtitle, children, footer }) {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-slate-50 to-slate-50 font-['Be_Vietnam_Pro',sans-serif]">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-8 pt-4">
        {/* Ngôn ngữ */}
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>

        {/* Tên thương hiệu (chỉ chữ) */}
        <div className="mt-4 text-center">
          <div className="font-['Baloo_2',sans-serif] text-[34px] font-extrabold leading-none tracking-tight text-slate-900">
            Nxx315 <span className="text-teal-600">Studio</span>
          </div>
          <p className="mt-2.5 text-sm text-slate-500">{t("brand.tagline")}</p>
        </div>

        {/* Thẻ */}
        <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="px-6 pb-6 pt-6">
            <div className="mb-6">
              <h1 className="text-[22px] font-extrabold leading-tight text-slate-900">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
              )}
            </div>
            {children}
          </div>
          {footer && (
            <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-center text-sm text-slate-500">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
