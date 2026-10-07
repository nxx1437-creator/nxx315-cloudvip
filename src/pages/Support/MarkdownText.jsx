import React from "react";

/**
 * Parser markdown đơn giản — không cần thư viện
 * Hỗ trợ:
 * - **bold** → chữ đậm
 * - `code` → chữ trong nền xám
 * - > text → khối thông tin viền xanh
 * - * italic *
 * - Xuống dòng
 */
export default function MarkdownText({ text }) {
  if (!text) return null;

  // Tách theo dòng để xử lý khối > quote
  const lines = text.split("\n");
  const blocks = [];
  let currentQuote = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Nếu dòng bắt đầu bằng > → thuộc khối quote
    if (trimmed.startsWith(">")) {
      currentQuote.push(trimmed.replace(/^>\s?/, ""));
    } else {
      // Nếu đang có quote → đóng quote trước
      if (currentQuote.length > 0) {
        blocks.push({ type: "quote", lines: [...currentQuote] });
        currentQuote = [];
      }
      blocks.push({ type: "text", content: line });
    }
  });

  // Đóng quote cuối cùng nếu còn
  if (currentQuote.length > 0) {
    blocks.push({ type: "quote", lines: currentQuote });
  }

  return (
    <div className="whitespace-pre-wrap break-words text-[14px] leading-6 text-[#161823]">
      {blocks.map((block, idx) => {
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
        // Dòng text bình thường
        if (block.content === "") {
          return <div key={idx} className="h-2" />;
        }
        return (
          <div key={idx}>
            {renderInline(block.content)}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Render inline: **bold**, `code`, *italic*
 */
function renderInline(text) {
  if (!text) return null;

  // Regex bắt: **bold**, `code`, *italic*
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Text trước match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];

    // **bold**
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={parts.length} className="font-bold text-[#161823]">
          {token.slice(2, -2)}
        </strong>
      );
    }
    // `code`
    else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={parts.length}
          className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] font-semibold text-slate-800"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    // *italic*
    else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(
        <em key={parts.length} className="italic text-slate-700">
          {token.slice(1, -1)}
        </em>
      );
    }

    lastIndex = regex.lastIndex;
  }

  // Text còn lại sau match cuối
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
                   }
