import React from "react";

/**
 * Markdown parser + filter code tool
 * - Xoá suggest_action({...}), lookup_order({...}) v.v.
 * - Parse markdown đầy đủ
 * - GIỮ LẠI text path "/store/roblox" để MessageBubble parse thành nút
 */
export default function MarkdownText({ text }) {
  if (!text) return null;

  // ==================================================
  // BƯỚC 1: XOÁ CODE TOOL (không xoá path)
  // ==================================================
  let cleaned = text;

  const TOOL_NAMES = [
    "suggest_action",
    "lookup_order",
    "list_recent_orders",
    "send_guide_image",
  ];

  for (const toolName of TOOL_NAMES) {
    const regex = new RegExp(
      `${toolName}\\s*\\([\\s\\S]*?\\)\\s*(?=\\n|$)`,
      "gi"
    );
    cleaned = cleaned.replace(regex, "");
  }

  // Xoá dòng chứa tên tool
  cleaned = cleaned
    .split("\n")
    .filter((line) => {
      if (
        /suggest_action|lookup_order|list_recent_orders|send_guide_image/i.test(
          line
        )
      ) {
        return false;
      }
      return true;
    })
    .join("\n");

  // Xoá dòng trống liên tiếp
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n").trim();

  if (!cleaned) return null;

  // ==================================================
  // BƯỚC 2: PARSE MARKDOWN
  // ==================================================
  const lines = cleaned.split("\n");
  const blocks = [];
  let currentQuote = [];
  let currentList = null;

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

    if (/^-{3,}$/.test(trimmed)) {
      flushAll();
      blocks.push({ type: "hr" });
      return;
    }

    if (trimmed.startsWith(">")) {
      flushList();
      currentQuote.push(trimmed.replace(/^>\s?/, ""));
      return;
    }

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

    flushAll();

    if (trimmed === "") {
      blocks.push({ type: "br" });
    } else {
      blocks.push({ type: "text", content: line });
    }
  });

  flushAll();

  // ==================================================
  // BƯỚC 3: RENDER
  // ==================================================
  return (
    <div className="whitespace-pre-wrap break-words text-[14px] leading-6 text-[#161823]">
      {blocks.map((block, idx) => {
        if (block.type === "br") {
          return <div key={idx} className="h-1.5" />;
        }

        if (block.type === "hr") {
          return (
            <hr
              key={idx}
              className="my-3 border-0 border-t border-slate-200"
            />
          );
        }

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

        return <div key={idx}>{renderInline(block.content)}</div>;
      })}
    </div>
  );
}

// ==================================================
// INLINE PARSER
// ==================================================
function renderInline(text) {
  if (!text) return null;

  // ✅ Ẩn dòng dạng "Label → /path" (vì MessageBubble sẽ render thành nút)
  const pathOnlyRegex =
    /^(.*?)\s*(?:→|->|>)\s*(\/[a-z0-9\-\/]+|https?:\/\/[^\s]+)$/i;
  const pathMatch = text.trim().match(pathOnlyRegex);
  if (pathMatch) {
    // Chỉ trả về label, ẩn path
    return <span>{pathMatch[1].trim()}</span>;
  }

  // Nếu dòng chỉ có path đơn lẻ → ẩn hoàn toàn
  if (/^\/[a-z0-9\-\/]+$/i.test(text.trim())) {
    return null;
  }

  // Nếu dòng chỉ có URL Zalo → ẩn
  if (/^https?:\/\/zalo\.me\/\d+$/i.test(text.trim())) {
    return null;
  }

  const regex =
    /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;

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
        <strong key={key} className="font-bold text-[#161823]">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={key}
          className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] font-semibold text-rose-600"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(
        <em key={key} className="italic text-slate-700">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith("[") && token.includes("](")) {
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

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
        }
