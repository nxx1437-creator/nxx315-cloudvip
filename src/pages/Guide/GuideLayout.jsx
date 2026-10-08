import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Menu, X, Search, Book } from "lucide-react";
import { GUIDE_MENU } from "./guideData.js";

export default function GuideLayout({ children }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentId = location.pathname.split("/guide/")[1] || "";

  const Sidebar = () => (
    <nav className="space-y-1">
      <Link
        to="/guide"
        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium transition ${
          currentId === "" || currentId === "/"
            ? "bg-sky-50 text-sky-700"
            : "text-slate-600 hover:bg-slate-50"
        }`}
        onClick={() => setMobileOpen(false)}
      >
        <Book size={15} />
        Tổng quan
      </Link>

      {GUIDE_MENU.map((item) => {
        const active = currentId === item.id;
        return (
          <Link
            key={item.id}
            to={`/guide/${item.id}`}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium transition ${
              active
                ? "bg-sky-50 text-sky-700"
                : "text-slate-600 hover:bg-slate-50"
            }`}
            onClick={() => setMobileOpen(false)}
          >
            <span className="text-base leading-none">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={20} />
            </button>

            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white">
                <Book size={18} />
              </div>
              <div className="leading-none">
                <div className="text-[15px] font-extrabold tracking-tight text-slate-900">
                  NXX315 <span className="text-sky-600">DOCS</span>
                </div>
                <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Hướng dẫn sử dụng
                </div>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {}}
              className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-500 hover:bg-slate-50 sm:flex"
            >
              <Search size={14} />
              Tìm kiếm...
            </button>

            <Link
              to="/"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-semibold text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft size={14} />
              Về trang chủ
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        {/* SIDEBAR DESKTOP */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-20">
            <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Mục lục
            </p>
            <Sidebar />
          </div>
        </aside>

        {/* SIDEBAR MOBILE */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="fixed left-0 top-0 z-50 h-full w-[80%] max-w-xs overflow-y-auto bg-white p-4 shadow-2xl lg:hidden">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">Mục lục</p>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>
              <Sidebar />
            </aside>
          </>
        )}

        {/* CONTENT */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
