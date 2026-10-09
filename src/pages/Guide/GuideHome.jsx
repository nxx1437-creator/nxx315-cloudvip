import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  ArrowLeft,
  Search,
  MessageCircle,
  Phone,
  ChevronRight,
} from "lucide-react";
import { GUIDE_MENU } from "./guideData.js";
import Sidebar from "./Sidebar.jsx";
import "./Guide.css";

export default function GuideHome() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  // Ctrl/⌘ + K để nhảy vào ô tìm kiếm
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const kw = query.trim().toLowerCase();
  const filtered = kw
    ? GUIDE_MENU.filter((i) => i.label.toLowerCase().includes(kw))
    : GUIDE_MENU;

  return (
    <div className="guide-dark guide-smooth-scroll min-h-screen bg-[#0b0d10] text-zinc-100">
      {/* ============ HEADER ============ */}
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

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-6 lg:py-10">
        {/* ============ SIDEBAR DESKTOP ============ */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl border border-white/10 bg-[#101318] p-3">
            <p className="mb-2 px-3 font-mono text-[10.5px] font-semibold uppercase tracking-[0.25em] text-zinc-500">
              Mục lục
            </p>
            <Sidebar />
          </div>
        </aside>

        {/* ============ SIDEBAR MOBILE ============ */}
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

        {/* ============ MAIN ============ */}
        <main className="guide-fade-in min-w-0 flex-1">
          {/* HERO */}
          <div className="mb-8 text-center sm:text-left">
            <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.3em] text-blue-500">
              Hướng dẫn sử dụng
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-zinc-50 sm:text-5xl">
              Bạn cần hướng dẫn gì<span className="text-blue-500">?</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-zinc-400 sm:mx-0">
              Tất cả những gì bạn cần biết để bắt đầu kiếm Coin và đổi thưởng
              trên NXX315 Studio.
            </p>
          </div>

          {/* Ô TÌM KIẾM */}
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#101318] px-4 py-3.5 transition focus-within:border-blue-500/50">
            <Search size={18} className="shrink-0 text-zinc-500" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm hướng dẫn…"
              className="w-full bg-transparent text-[15px] text-zinc-100 outline-none placeholder:text-zinc-500"
            />
            <kbd className="shrink-0 rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-[11px] text-zinc-400">
              ⌘K
            </kbd>
          </div>

          {/* TIÊU ĐỀ MỤC */}
          <div className="mt-8 flex items-center justify-between">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-500">
              Khám phá theo chủ đề
            </p>
            <p className="font-mono text-[11px] text-zinc-600">
              {filtered.length} mục
            </p>
          </div>

          {/* GRID MỤC */}
          {filtered.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-[#101318] p-8 text-center text-[14px] text-zinc-500">
              Không tìm thấy mục phù hợp.
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item, idx) => (
                <Link
                  key={item.id}
                  to={`/guide/${item.id}`}
                  className="guide-card group flex items-start gap-3.5 rounded-2xl border border-white/10 bg-[#101318] p-4"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition"
                    style={{ backgroundColor: `${item.color}22` }}
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
                    <p className="text-[14.5px] font-bold text-zinc-100 group-hover:text-blue-400">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-[12px] text-zinc-500">
                      Xem hướng dẫn
                    </p>
                  </div>

                  <ChevronRight
                    size={16}
                    className="mt-1 shrink-0 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-blue-400"
                  />
                </Link>
              ))}
            </div>
          )}

          {/* CTA CUỐI */}
          <div className="mt-10 rounded-2xl border border-white/10 bg-[#101318] p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5">
                <MessageCircle size={20} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold tracking-tight text-zinc-100">
                  Cần hỗ trợ thêm?
                </h3>
                <p className="mt-1 max-w-lg text-[13.5px] leading-6 text-zinc-400">
                  Không tìm thấy câu trả lời? Đội ngũ hỗ trợ sẵn sàng giúp bạn
                  24/7.
                </p>

                <div className="mt-4 flex flex-wrap gap-2.5">
                  <Link
                    to="/support"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-[13px] font-bold text-white transition hover:bg-blue-500"
                  >
                    <MessageCircle size={14} />
                    Chat AI hỗ trợ
                  </Link>

                  <a
                    href="https://zalo.me/0865245988"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-[13px] font-bold text-zinc-200 transition hover:bg-white/5"
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
