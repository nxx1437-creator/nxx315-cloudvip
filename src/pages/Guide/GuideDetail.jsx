import React, { useState, useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import {
  Menu,
  X,
  ArrowLeft,
  ChevronRight,
  MessageCircle,
  Phone,
} from "lucide-react";
import { GUIDE_MENU, GUIDE_CONTENT } from "./guideData.js";
import Sidebar from "./Sidebar.jsx";
import "./Guide.css";

const LINK_CLS =
  "font-semibold text-blue-400 underline decoration-blue-400/30 underline-offset-2 hover:decoration-blue-400";

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
        <strong key={key} className="font-bold text-zinc-50">
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
              className={LINK_CLS}
            >
              {label}
            </a>
          );
        } else {
          parts.push(
            <Link key={key} to={url} className={LINK_CLS}>
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
              className="flex gap-3 text-[14.5px] leading-7 text-zinc-300"
            >
              <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
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
              className="flex gap-3 text-[14.5px] leading-7 text-zinc-300"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-blue-500/40 bg-blue-500/15 font-mono text-[12px] font-bold text-blue-400">
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
        className="my-2 whitespace-pre-wrap text-[14.5px] leading-7 text-zinc-300"
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

  // Tự cuộn lên đầu khi đổi mục
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  if (!content) return <Navigate to="/guide" replace />;

  const currentIdx = GUIDE_MENU.findIndex((m) => m.id === id);
  const prevItem = currentIdx > 0 ? GUIDE_MENU[currentIdx - 1] : null;
  const nextItem =
    currentIdx < GUIDE_MENU.length - 1 ? GUIDE_MENU[currentIdx + 1] : null;

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

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-6 lg:py-10">
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

        {/* MAIN */}
        <main key={id} className="guide-fade-in min-w-0 flex-1">
          {/* BREADCRUMB */}
          <div className="mb-5 flex items-center gap-1.5 font-mono text-[11.5px] uppercase tracking-wider text-zinc-500">
            <Link to="/guide" className="hover:text-blue-400">
              Hướng dẫn
            </Link>
            <ChevronRight size={13} />
            <span className="font-semibold text-zinc-300">{menu?.label}</span>
          </div>

          {/* HEADER MỤC */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#101318] p-6 sm:p-8">
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl"
              style={{ backgroundColor: `${menu?.color}30` }}
            />

            <div className="relative flex items-start gap-4">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${menu?.color}22` }}
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
                <h1 className="text-2xl font-bold leading-tight tracking-tight text-zinc-50 sm:text-3xl">
                  {content.title}
                </h1>
                <p className="mt-2 text-[14px] leading-6 text-zinc-400">
                  {content.description}
                </p>
              </div>
            </div>
          </div>

          {/* SECTIONS */}
          <div className="mt-8 space-y-6">
            {content.sections.map((sec, idx) => (
              <section
                key={idx}
                id={`sec-${idx}`}
                className="rounded-2xl border border-white/10 bg-[#101318] p-5 sm:p-6"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-[12px] font-bold text-white"
                    style={{ backgroundColor: menu?.color }}
                  >
                    {idx + 1}
                  </div>
                  <h2 className="flex-1 text-lg font-bold tracking-tight text-zinc-50 sm:text-xl">
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
                className="guide-card group flex items-center gap-3 rounded-2xl border border-white/10 bg-[#101318] p-4"
              >
                <ChevronRight
                  size={18}
                  className="shrink-0 rotate-180 text-zinc-600 group-hover:text-blue-400"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
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
                    <span className="truncate text-[13.5px] font-bold text-zinc-100">
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
                className="guide-card group flex items-center gap-3 rounded-2xl border border-white/10 bg-[#101318] p-4 sm:flex-row-reverse sm:text-right"
              >
                <ChevronRight
                  size={18}
                  className="shrink-0 text-zinc-600 group-hover:text-blue-400"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
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
                    <span className="truncate text-[13.5px] font-bold text-zinc-100">
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
