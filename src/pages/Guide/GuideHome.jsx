import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  ArrowLeft,
  Book,
  MessageCircle,
  Phone,
  ChevronRight,
} from "lucide-react";
import { GUIDE_MENU } from "./guideData.js";
import Sidebar from "./Sidebar.jsx";
import "./Guide.css";

export default function GuideHome() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="guide-smooth-scroll min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
      {/* ============ HEADER ============ */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={20} />
            </button>

            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#087EA4] to-[#0ea5e9] text-white shadow-lg shadow-sky-500/30">
                <Book size={18} />
              </div>
              <div className="leading-none">
                <div className="text-[15px] font-black tracking-tight text-slate-900">
                  NXX315 <span className="text-[#087EA4]">Studio</span>
                </div>
                <div className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Hướng dẫn
                </div>
              </div>
            </Link>
          </div>

          <Link
            to="/"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Về trang chủ</span>
            <span className="sm:hidden">Về</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-6 lg:py-10">
        {/* ============ SIDEBAR DESKTOP ============ */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl border border-slate-200/70 bg-white/90 p-3 shadow-sm backdrop-blur">
            <p className="mb-2 px-3 text-[10.5px] font-black uppercase tracking-widest text-slate-400">
              Mục lục
            </p>
            <Sidebar />
          </div>
        </aside>

        {/* ============ SIDEBAR MOBILE ============ */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="fixed left-0 top-0 z-50 h-full w-[82%] max-w-xs overflow-y-auto bg-white p-4 shadow-2xl lg:hidden">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-black text-slate-900">Mục lục</p>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </aside>
          </>
        )}

        {/* ============ MAIN ============ */}
        <main className="guide-fade-in min-w-0 flex-1">
          {/* HEADER ĐƠN GIẢN */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Hướng dẫn sử dụng NXX315
            </h1>
            <p className="mt-2 max-w-xl text-[14px] leading-6 text-slate-500">
              Tất cả những gì bạn cần biết để bắt đầu kiếm Coin và đổi thưởng.
            </p>
          </div>

          {/* TIÊU ĐỀ MỤC */}
          <div className="mt-2">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Khám phá theo chủ đề
            </h2>
            <p className="mt-1 text-[13px] text-slate-500">
              Chọn mục bạn quan tâm để xem hướng dẫn chi tiết
            </p>
          </div>

          {/* GRID 9 MỤC */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {GUIDE_MENU.map((item, idx) => (
              <Link
                key={item.id}
                to={`/guide/${item.id}`}
                className="guide-card group flex items-start gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                {/* Icon 3D */}
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <img
                    src={item.icon}
                    alt=""
                    className="guide-icon h-8 w-8 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-bold text-slate-900 group-hover:text-[#087EA4]">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-[12px] text-slate-500">
                    Xem hướng dẫn
                  </p>
                </div>

                <ChevronRight
                  size={16}
                  className="mt-1 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#087EA4]"
                />
              </Link>
            ))}
          </div>

          {/* CTA CUỐI */}
          <div className="relative mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                <MessageCircle size={20} className="text-slate-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold tracking-tight text-slate-900">
                  Cần hỗ trợ thêm?
                </h3>
                <p className="mt-1 max-w-lg text-[13.5px] leading-6 text-slate-500">
                  Không tìm thấy câu trả lời? Đội ngũ hỗ trợ sẵn sàng giúp bạn
                  24/7.
                </p>

                <div className="mt-4 flex flex-wrap gap-2.5">
                  <Link
                    to="/support"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#087EA4] px-4 py-2 text-[13px] font-bold text-white transition hover:bg-[#0a6a8a]"
                  >
                    <MessageCircle size={14} />
                    Chat AI hỗ trợ
                  </Link>

                  <a
                    href="https://zalo.me/0865245988"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Phone size={14} />
                    Zalo 0865245988
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
                }
