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
          {/* HERO */}
<div className="relative overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-[#087EA4] via-[#0ea5e9] to-[#38bdf8] p-6 sm:p-10">
  {/* Blob trang trí */}
  <div className="guide-blob pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
  <div
    className="guide-blob pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-cyan-200/30 blur-3xl"
    style={{ animationDelay: "2s" }}
  />

  {/* Nội dung hero */}
  <div className="relative">
    <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur">
      <Sparkles size={12} />
      Trung tâm hướng dẫn
    </div>

    <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
      Hướng dẫn sử dụng
      <br />
      NXX315 Studio 🌸
    </h1>

    <p className="mt-4 max-w-xl text-[14.5px] leading-7 text-white/90">
      Tất cả những gì bạn cần biết để bắt đầu kiếm Coin, đổi thưởng
      và tận dụng tối đa NXX315. Đọc trong 5 phút — dùng cả đời.
    </p>

    {/* Stats nhỏ */}
    <div className="mt-6 flex flex-wrap gap-4">
      <div className="flex items-center gap-2 rounded-xl bg-white/15 px-3.5 py-2 backdrop-blur">
        <Zap size={14} className="text-yellow-300" />
        <span className="text-[12.5px] font-bold text-white">
          4 cách kiếm Coin
        </span>
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-white/15 px-3.5 py-2 backdrop-blur">
        <Shield size={14} className="text-emerald-300" />
        <span className="text-[12.5px] font-bold text-white">
          Bảo mật 100%
        </span>
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-white/15 px-3.5 py-2 backdrop-blur">
        <Gift size={14} className="text-pink-300" />
        <span className="text-[12.5px] font-bold text-white">
          Rút tiền 24h
        </span>
      </div>
    </div>
  </div>
</div>
          {/* TIÊU ĐỀ MỤC */}
          <div className="mt-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                Khám phá theo chủ đề
              </h2>
              <p className="mt-1 text-[13.5px] text-slate-500">
                Chọn mục bạn quan tâm để xem hướng dẫn chi tiết
              </p>
            </div>
          </div>

          {/* GRID 9 MỤC */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
          <div className="relative mt-10 overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-200/40 blur-3xl" />

            <div className="relative">
              <h3 className="text-xl font-black tracking-tight text-slate-900">
                💬 Cần hỗ trợ thêm?
              </h3>
              <p className="mt-2 max-w-lg text-[14px] leading-6 text-slate-600">
                Không tìm thấy câu trả lời? Đội ngũ hỗ trợ sẵn sàng giúp bạn
                24/7 qua nhiều kênh.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to="/support"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#087EA4] to-[#0ea5e9] px-4 py-2.5 text-[13.5px] font-bold text-white shadow-lg shadow-sky-500/30 transition hover:brightness-110"
                >
                  <MessageCircle size={15} />
                  Chat AI hỗ trợ
                </Link>

                <a
                  href="https://zalo.me/0865245988"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-[13.5px] font-bold text-amber-700 transition hover:bg-amber-50"
                >
                  <Phone size={15} />
                  Zalo 0865245988
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
