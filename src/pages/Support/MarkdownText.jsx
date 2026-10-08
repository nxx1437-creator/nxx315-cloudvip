import React from "react";

/**
 * Markdown parser đầy đủ + filter code tool
 * Hỗ trợ:
 * - **bold**, *italic*, `code`
 * - > quote (khối xanh)
 * - - bullet, 1. numbered
 * - [text](url) link
 * - --- hr
 * - TỰ ĐỘNG XOÁ: suggest_action({...}), lookup_order({...}),
 *   list_recent_orders({...}), send_guide_image({...})
 *   và các dòng dạng "Label → /path"
 */
export default function MarkdownText({ text }) {
  if (!text) return null;

  // ==================================================
  // BƯỚC 1: LÀM SẠCH TEXT — XOÁ CODE TOOL
  // ==================================================
  let cleaned = text;

  // Xoá các đoạn gọi tool: suggest_action({...}) v.v.
  const TOOL_NAMES = [
    "suggest_action",
    "lookup_order",
    "list_recent_orders",
    "send_guide_image",
  ];

  for (const toolName of TOOL_NAMES) {
    // Match toolName({ ... }) — có thể nhiều dòng
    const regex = new RegExp(
      `${toolName}\\s*\\(\\s*\\{[\\s\\S]*?\\}\\s*\\)`,
      "gi"
    );
    cleaned = cleaned.replace(regex, "");
  }

  // Xoá các dòng dạng "Label → /path" hoặc "Label -> /path"
  cleaned = cleaned
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return true; // giữ dòng trống

      // Dòng "Label → /path"
      if (
        /^(.*?)\s*(?:→|->|>)\s*(\/[a-z0-9\-\/]+|https?:\/\/[^\s]+)$/i.test(
          trimmed
        )
      ) {
        return false;
      }

      // Dòng chỉ có path
      if (/^\/[a-z0-9\-\/]+$/i.test(trimmed)) {
        return false;
      }

      // Dòng chỉ có URL Zalo
      if (/^https?:\/\/[^\s]+$/i.test(trimmed)) {
        return false;
      }

      // Dòng chứa tên tool
      if (
        /suggest_action|lookup_order|list_recent_orders|send_guide_image/i.test(
          trimmed
        )
      ) {
        return false;
      }

      return true;
    })
    .join("\n");

  // Xoá dòng trống liên tiếp (3+ dòng)
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n").trim();

  if (!cleaned) return null;

  // ==================================================
  // BƯỚC 2: PARSE MARKDOWN
  // ==================================================
  const lines = cleaned.split("\n");
  const blocks = [];
  let currentQuote = [];
  let currentList = null; // { type: 'bullet'|'number', items: [] }

  const flushQuote = () => {
    if (currentQuote.length > 0) {
      blocks.push({ type: "quote", lines: [...currentQuote] });
      currentQuote = [];
    }
  };

  const flushList = () => {
    if (currentList) {
      blocks.push({ type: "list", ...currentList });
      currentList = null;
    }
  };

  const flushAll = () => {
    flushQuote();
    flushList();
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    // --- Đường kẻ ngang
    if (/^-{3,}$/.test(trimmed)) {
      flushAll();
      blocks.push({ type: "hr" });
      return;
    }

    // --- Quote (>)
    if (trimmed.startsWith(">")) {
      flushList();
      currentQuote.push(trimmed.replace(/^>\s?/, ""));
      return;
    }

    // --- Bullet list (- hoặc *)
    if (/^[-*]\s+/.test(trimmed)) {
      flushQuote();
      const content = trimmed.replace(/^[-*]\s+/, "");
      if (!currentList || currentList.type !== "bullet") {
        flushList();
        currentList = { type: "bullet", items: [] };
      }
      currentList.items.push(content);
      return;
    }

    // --- Numbered list (1. 2. 3.)
    if (/^\d+\.\s+/.test(trimmed)) {
      flushQuote();
      const content = trimmed.replace(/^\d+\.\s+/, "");
      if (!currentList || currentList.type !== "number") {
        flushList();
        currentList = { type: "number", items: [] };
      }
      currentList.items.push(content);
      return;
    }

    // --- Dòng bình thường
    flushAll();

    if (trimmed === "") {
      blocks.push({ type: "br" });
    } else {
      blocks.push({ type: "text", content: line });
    }
  });

  flushAll();

  // ==================================================
  // BƯỚC 3: RENDER BLOCKS
  // ==================================================
  return (
    <div className="whitespace-pre-wrap break-words text-[14px] leading-6 text-[#161823]">
      {blocks.map((block, idx) => {
        // BR
        if (block.type === "br") {
          return <div key={idx} className="h-1.5" />;
        }

        // HR
        if (block.type === "hr") {
          return (
            <hr
              key={idx}
              className="my-3 border-0 border-t border-slate-200"
            />
          );
        }

        // QUOTE
        if (block.type === "quote") {
          return (
            <div
              key={idx}
              className="my-2 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-3"
            >
              {block.lines.map((line, i) => (
                <div
                  key={i}
                  className="text-[13.5px] font-medium leading-6 text-sky-900"
                >
                  {renderInline(line)}
                </div>
              ))}
            </div>
          );
        }

        // BULLET LIST
        if (block.type === "bullet") {
          return (
            <ul key={idx} className="my-2 space-y-1.5">
              {block.items.map((item, i) => (
                <li
                  key={i}
                  className="flex gap-2.5 text-[14px] leading-6 text-[#161823]"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                  <span className="flex-1">{renderInline(item)}</span>
                </li>
              ))}
            </ul>
          );
        }

        // NUMBERED LIST
        if (block.type === "number") {
          return (
            <ol key={idx} className="my-2 space-y-1.5">
              {block.items.map((item, i) => (
                <li
                  key={i}
                  className="flex gap-2.5 text-[14px] leading-6 text-[#161823]"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                    {i + 1}
                  </span>
                  <span className="flex-1">{renderInline(item)}</span>
                </li>
              ))}
            </ol>
          );
        }

        // TEXT thường
        return <div key={idx}>{renderInline(block.content)}</div>;
      })}
    </div>
  );
}

// ==================================================
// INLINE PARSER
// Hỗ trợ: **bold**, *italic*, `code`, [text](url)
// ==================================================
function renderInline(text) {
  if (!text) return null;

  // Regex bắt: **bold** | `code` | *italic* | [text](url)
  const regex =
    /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Text trước match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `inline-${parts.length}`;

    // **bold**
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={key} className="font-bold text-[#161823]">
          {token.slice(2, -2)}
        </strong>
      );
    }
    // `code`
    else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={key}
          className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] font-semibold text-rose-600"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    // *italic*
    else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(
        <em key={key} className="italic text-slate-700">
          {token.slice(1, -1)}
        </em>
      );
    }
    // [text](url)
    else if (token.startsWith("[") && token.includes("](")) {
      const matchLink = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (matchLink) {
        const [, label, url] = matchLink;
        parts.push(
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#0068FF] underline decoration-[#0068FF]/40 underline-offset-2 hover:decoration-[#0068FF]"
          >
            {label}
          </a>
        );
      } else {
        parts.push(token);
      }
    }

    lastIndex = regex.lastIndex;
  }

  // Text còn lại
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
  }
