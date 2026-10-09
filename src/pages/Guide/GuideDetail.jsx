import React, { useState, useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import {
  Menu,
  X,
  ArrowLeft,
  Book,
  ChevronRight,
  MessageCircle,
  Phone,
  Home,
} from "lucide-react";
import { GUIDE_MENU, GUIDE_CONTENT } from "./guideData.js";
import Sidebar from "./Sidebar.jsx";
import "./Guide.css";

// Parser markdown inline
function renderInline(text) {
  if (!text) return null;

  const regex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `inline-${parts.length}`;

    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={key} className="font-bold text-slate-900">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("[") && token.includes("](")) {
      const m = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (m) {
        const [, label, url] = m;
        const isExternal = url.startsWith("http");
        if (isExternal) {
          parts.push(
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#087EA4] underline decoration-[#087EA4]/30 underline-offset-2 hover:decoration-[#087EA4]"
            >
              {label}
            </a>
          );
        } else {
          parts.push(
            <Link
              key={key}
              to={url}
              className="font-semibold text-[#087EA4] underline decoration-[#087EA4]/30 underline-offset-2 hover:decoration-[#087EA4]"
            >
              {label}
            </Link>
          );
        }
      } else {
        parts.push(token);
      }
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

// Render nội dung body
function renderBody(body) {
  if (!body) return null;

  const lines = body.split("\n");
  const blocks = [];
  let currentList = null;

  const flush = () => {
    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (/^[-•]\s+/.test(trimmed)) {
      const content = trimmed.replace(/^[-•]\s+/, "");
      if (!currentList || currentList.type !== "bullet") {
        flush();
        currentList = { type: "bullet", items: [] };
      }
      currentList.items.push(content);
      return;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const content = trimmed.replace(/^\d+\.\s+/, "");
      if (!currentList || currentList.type !== "number") {
        flush();
        currentList = { type: "number", items: [] };
      }
      currentList.items.push(content);
      return;
    }

    flush();

    if (trimmed === "") {
      blocks.push({ type: "br" });
    } else {
      blocks.push({ type: "text", content: line });
    }
  });

  flush();

  return blocks.map((block, idx) => {
    if (block.type === "br") return <div key={idx} className="h-3" />;

    if (block.type === "bullet") {
      return (
        <ul key={idx} className="my-3 space-y-2">
          {block.items.map((item, i) => (
            <li
              key={i}
              className="flex gap-3 text-[14.5px] leading-7 text-slate-700"
            >
              <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-[#087EA4] to-[#0ea5e9]" />
              <span className="flex-1">{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
    }

    if (block.type === "number") {
      return (
        <ol key={idx} className="my-3 space-y-2">
          {block.items.map((item, i) => (
            <li
              key={i}
              className="flex gap-3 text-[14.5px] leading-7 text-slate-700"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#087EA4] to-[#0ea5e9] text-[12px] font-bold text-white shadow-sm">
                {i + 1}
              </span>
              <span className="flex-1">{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
    }

    return (
      <p
        key={idx}
        className="my-2 whitespace-pre-wrap text-[14.5px] leading-7 text-slate-700"
      >
        {renderInline(block.content)}
      </p>
    );
  });
}

export default function GuideDetail() {
  const { id } = useParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const content = GUIDE_CONTENT[id];
  const menu = GUIDE_MENU.find((m) => m.id === id);

  // Auto scroll to top when id changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  if (!content) return <Navigate to="/guide" replace />;

  const currentIdx = GUIDE_MENU.findIndex((m) => m.id === id);
  const prevItem = currentIdx > 0 ? GUIDE_MENU[currentIdx - 1] : null;
  const nextItem =
    currentIdx < GUIDE_MENU.length - 1 ? GUIDE_MENU[currentIdx + 1] : null;

  return (
    <div className="guide-smooth-scroll min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
      {/* HEADER */}
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
        {/* SIDEBAR DESKTOP */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl border border-slate-200/70 bg-white/90 p-3 shadow-sm backdrop-blur">
            <p className="mb-2 px-3 text-[10.5px] font-black uppercase tracking-widest text-slate-400">
              Mục lục
            </p>
            <Sidebar />
          </div>
        </aside>

        {/* SIDEBAR MOBILE */}
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

        {/* MAIN */}
        <main
          key={id}
          className="guide-fade-in min-w-0 flex-1"
        >
          {/* BREADCRUMB */}
          <div className="mb-5 flex items-center gap-1.5 text-[12.5px] text-slate-500">
            <Link to="/guide" className="hover:text-[#087EA4]">
              Hướng dẫn
            </Link>
            <ChevronRight size={13} />
            <span className="font-semibold text-slate-700">
              {menu?.label}
            </span>
          </div>

          {/* HEADER MỤC */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl"
              style={{ backgroundColor: `${menu?.color}25` }}
            />

            <div className="relative flex items-start gap-4">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-sm"
                style={{ backgroundColor: `${menu?.color}15` }}
              >
                <img
                  src={menu?.icon}
                  alt=""
                  className="h-10 w-10 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl">
                  {content.title}
                </h1>
                <p className="mt-2 text-[14px] leading-6 text-slate-500">
                  {content.description}
                </p>
              </div>
            </div>
          </div>

          {/* SECTIONS */}
          <div className="mt-8 space-y-8">
            {content.sections.map((sec, idx) => (
              <section
                key={idx}
                id={`sec-${idx}`}
                className="rounded-2xl border border-slate-200/70 bg-white p-5 sm:p-6"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[12px] font-black text-white shadow-sm"
                    style={{ backgroundColor: menu?.color }}
                  >
                    {idx + 1}
                  </div>
                  <h2 className="flex-1 text-lg font-black tracking-tight text-slate-900 sm:text-xl">
                    {sec.heading}
                  </h2>
                </div>
                <div className="mt-3">{renderBody(sec.body)}</div>
              </section>
            ))}
          </div>

          {/* PREV / NEXT */}
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {prevItem ? (
              <Link
                to={`/guide/${prevItem.id}`}
                className="guide-card group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4"
              >
                <ChevronRight
                  size={18}
                  className="shrink-0 rotate-180 text-slate-300 group-hover:text-[#087EA4]"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[10.5px] font-black uppercase tracking-widest text-slate-400">
                    Trước
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <img
                      src={prevItem.icon}
                      alt=""
                      className="h-5 w-5 shrink-0 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <span className="truncate text-[13.5px] font-bold text-slate-800">
                      {prevItem.label}
                    </span>
                  </div>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {nextItem ? (
              <Link
                to={`/guide/${nextItem.id}`}
                className="guide-card group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row-reverse sm:text-right"
              >
                <ChevronRight
                  size={18}
                  className="shrink-0 text-slate-300 group-hover:text-[#087EA4]"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[10.5px] font-black uppercase tracking-widest text-slate-400">
                    Tiếp theo
                  </p>
                  <div className="mt-1 flex items-center gap-2 sm:justify-end">
                    <img
                      src={nextItem.icon}
                      alt=""
                      className="h-5 w-5 shrink-0 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <span className="truncate text-[13.5px] font-bold text-slate-800">
                      {nextItem.label}
                    </span>
                  </div>
                </div>
              </Link>
            ) : (
              <div />
            )}
          </div>

          {/* CTA cuối */}
          <div className="relative mt-10 overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-200/40 blur-3xl" />

            <div className="relative">
              <h3 className="text-lg font-black tracking-tight text-slate-900">
                💬 Cần hỗ trợ thêm?
              </h3>
              <p className="mt-2 max-w-lg text-[13.5px] leading-6 text-slate-600">
                Không tìm thấy câu trả lời? Đội ngũ hỗ trợ sẵn sàng giúp bạn
                24/7.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to="/support"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#087EA4] to-[#0ea5e9] px-4 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-sky-500/30 transition hover:brightness-110"
                >
                  <MessageCircle size={14} />
                  Chat AI hỗ trợ
                </Link>
                <a
                  href="https://zalo.me/0865245988"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-[13px] font-bold text-amber-700 transition hover:bg-amber-50"
                >
                  <Phone size={14} />
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
