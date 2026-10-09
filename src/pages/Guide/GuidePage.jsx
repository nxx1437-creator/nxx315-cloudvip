import React from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import GuideLayout from "./GuideLayout.jsx";
import { GUIDE_CONTENT, GUIDE_MENU } from "./guideData.js";

// Parser markdown inline đơn giản
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
              className="font-semibold text-sky-600 underline underline-offset-2 hover:text-sky-700"
            >
              {label}
            </a>
          );
        } else {
          parts.push(
            <Link
              key={key}
              to={url}
              className="font-semibold text-sky-600 underline underline-offset-2 hover:text-sky-700"
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

// Render nội dung — xử lý bullet list + số thứ tự
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
              <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
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
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[12px] font-bold text-sky-700">
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

export default function GuidePage() {
  const { id } = useParams();
  const content = GUIDE_CONTENT[id];

  if (!content) {
    return <Navigate to="/guide" replace />;
  }

  const menu = GUIDE_MENU.find((m) => m.id === id);
  const currentIdx = GUIDE_MENU.findIndex((m) => m.id === id);
  const prevItem = currentIdx > 0 ? GUIDE_MENU[currentIdx - 1] : null;
  const nextItem =
    currentIdx < GUIDE_MENU.length - 1 ? GUIDE_MENU[currentIdx + 1] : null;

  return (
    <GuideLayout>
      {/* BREADCRUMB */}
      <div className="mb-6 flex flex-wrap items-center gap-1.5 text-[13px] text-slate-500">
        <Link to="/guide" className="hover:text-slate-800">
          Hướng dẫn
        </Link>
        <ChevronRight size={13} />
        <span className="font-semibold text-slate-800">
          {menu?.icon} {content.title}
        </span>
      </div>

      {/* TITLE */}
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        {content.title}
      </h1>
      <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-500">
        {content.description}
      </p>

      <hr className="my-8 border-slate-200" />

      {/* SECTIONS */}
      <div className="space-y-8">
        {content.sections.map((sec, idx) => (
          <section key={idx} id={`sec-${idx}`}>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              {sec.heading}
            </h2>
            <div className="mt-3">{renderBody(sec.body)}</div>
          </section>
        ))}
      </div>

      <hr className="my-10 border-slate-200" />

      {/* NAV PREV / NEXT */}
      <div className="grid gap-3 sm:grid-cols-2">
        {prevItem ? (
          <Link
            to={`/guide/${prevItem.id}`}
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-sky-300"
          >
            <ChevronRight
              size={18}
              className="shrink-0 rotate-180 text-slate-400 group-hover:text-sky-500"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Trước
              </p>
              <p className="truncate text-[14px] font-semibold text-slate-800">
                {prevItem.icon} {prevItem.label}
              </p>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {nextItem ? (
          <Link
            to={`/guide/${nextItem.id}`}
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-sky-300 sm:text-right"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Tiếp theo
              </p>
              <p className="truncate text-[14px] font-semibold text-slate-800">
                {nextItem.icon} {nextItem.label}
              </p>
            </div>
            <ChevronRight
              size={18}
              className="shrink-0 text-slate-400 group-hover:text-sky-500"
            />
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* CTA cuối */}
      <div className="mt-8 rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 p-6">
        <p className="text-sm font-semibold text-slate-700">
          Không tìm thấy câu trả lời?
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            to="/support"
            className="rounded-lg bg-sky-600 px-4 py-2 text-[13px] font-bold text-white transition hover:bg-sky-700"
          >
            💬 Chat AI hỗ trợ
          </Link>
          <a
            href="https://zalo.me/0865245988"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-sky-300 bg-white px-4 py-2 text-[13px] font-bold text-sky-700 transition hover:bg-sky-50"
          >
            📞 Zalo 0865245988
          </a>
        </div>
      </div>
    </GuideLayout>
  );
  }
