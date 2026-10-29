import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MessageCircle } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import { useI18n } from "../i18n/index.js";

const ZALO_URL = "https://zalo.me/0865245988";
const HOME = { vi: "Về trang chủ", en: "Back to home" };
const HELP = { vi: "Cần hỗ trợ?", en: "Need help?" };

export default function AuthLayout({ title, subtitle, children, footer }) {
  const { t, lang } = useI18n();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#eef7f3] font-['Be_Vietnam_Pro',sans-serif]">
      {/* nền: xanh sage -> nhạt -> aqua + lưới ô vuông mờ */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(520px 420px at 50% 150px,rgba(255,255,255,.75),transparent 70%),radial-gradient(520px 520px at 100% 700px,rgba(158,219,230,.5),transparent 70%),linear-gradient(180deg,#b4d9cb 0,#e6f4ef 520px,#eef7f3 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[900px] opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(6,78,59,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(6,78,59,.07) 1px,transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-8 pt-3">
        {/* Ngôn ngữ */}
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>

        {/* Thương hiệu */}
        <div className="relative mt-3 text-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-72 -translate-x-1/2 -translate-y-1/2"
            style={{
              background:
                "radial-gradient(closest-side,rgba(16,185,129,.28),transparent)",
            }}
          />
          <Link
            to="/"
            className="relative inline-block font-['Baloo_2',sans-serif] text-[34px] font-extrabold leading-none tracking-tight text-slate-900"
          >
            Nxx315 <span className="text-emerald-600">Studio</span>
          </Link>
          <p className="relative mx-auto mt-2 max-w-xs text-[14px] leading-6 text-slate-500">
            {t("brand.tagline")}
          </p>
        </div>

        {/* Thẻ */}
        <div className="relative mt-5 overflow-hidden rounded-2xl border border-white bg-white/90 shadow-[0_24px_60px_-24px_rgba(6,78,59,0.35)] backdrop-blur">
          <span className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
          <div className="px-5 pb-5 pt-6">
            <div className="mb-5">
              <h1 className="text-[26px] font-extrabold leading-[1.15] tracking-tight text-slate-900">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1.5 text-[14px] leading-6 text-slate-500">{subtitle}</p>
              )}
            </div>
            {children}
          </div>

          {footer && (
            <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-4 text-center text-[14px] text-slate-500">
              {footer}
            </div>
          )}
          <Link
            to="/"
            className="flex items-center justify-center gap-2 border-t border-slate-100 px-5 py-3.5 text-[13.5px] font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-emerald-700"
          >
            <ArrowLeft size={16} /> {HOME[lang] || HOME.vi}
          </Link>
        </div>
      </div>

      <p className="relative pb-6 text-center text-[13px] text-slate-500">
        {HELP[lang] || HELP.vi}{" "}
        <a
          href={ZALO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:underline"
        >
          <MessageCircle size={14} /> Zalo 0865245988
        </a>
      </p>
    </div>
  );
        }

