import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Menu, X } from "lucide-react";
import Sidebar from "./Sidebar.jsx";
import "./Guide.css";

export default function GuideLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="guide-dark guide-smooth-scroll min-h-screen bg-[#0b0d10] text-zinc-100">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0d10]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 hover:bg-white/5 lg:hidden"
            >
              <Menu size={20} />
            </button>

            <Link to="/" className="leading-none">
              <div className="text-[16px] font-bold tracking-tight text-zinc-50">
                NXX315 <span className="text-blue-500">Studio</span>
              </div>
              <div className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500">
                Hướng dẫn
              </div>
            </Link>
          </div>

          <Link
            to="/"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-[13px] font-semibold text-zinc-300 transition hover:bg-white/5"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Về trang chủ</span>
            <span className="sm:hidden">Về</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-6">
        {/* SIDEBAR DESKTOP */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl border border-white/10 bg-[#101318] p-3">
            <p className="mb-2 px-3 font-mono text-[10.5px] font-semibold uppercase tracking-[0.25em] text-zinc-500">
              Mục lục
            </p>
            <Sidebar />
          </div>
        </aside>

        {/* SIDEBAR MOBILE */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="fixed left-0 top-0 z-50 h-full w-[82%] max-w-xs overflow-y-auto border-r border-white/10 bg-[#0b0d10] p-4 shadow-2xl lg:hidden">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-500">
                  Mục lục
                </p>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/5"
                >
                  <X size={18} />
                </button>
              </div>
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </aside>
          </>
        )}

        {/* CONTENT */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
