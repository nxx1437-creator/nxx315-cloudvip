// src/pages/Support/ChatBits.jsx — mảnh nhỏ dùng chung: trích dẫn, chấm đang gõ, mốc thời gian
import React from "react";

const pad2 = (n) => String(n).padStart(2, "0");

const isValidDate = (d) => d instanceof Date && !Number.isNaN(d.getTime());

export const fmtTime = (iso) => {
  const d = iso ? new Date(iso) : new Date();
  if (!isValidDate(d)) return "--:--";
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

// "> trích dẫn\n\nnội dung" -> { quote, body }
export function splitQuote(text) {
  // Chuẩn hoá CRLF -> LF, bỏ \r còn sót
  const normalized = String(text ?? "").replace(/\r\n?/g, "\n");
  const lines = normalized.split("\n");
  const q = [];

  while (lines.length && lines[0].startsWith("> ")) {
    q.push(lines.shift().slice(2).replace(/\s+$/, ""));
  }
  while (lines.length && lines[0].trim() === "") lines.shift();

  return { quote: q.join("\n"), body: lines.join("\n") };
}

export function QuotedText({ text }) {
  const { quote, body } = splitQuote(text);
  return (
    <>
      {quote && (
        <div className="nxx-quote" role="note" aria-label="Trích dẫn">
          <b>Trích dẫn</b>
          <span className="line-clamp-3">{quote}</span>
        </div>
      )}
      {body && (
        <p className="whitespace-pre-wrap break-words text-[16px] leading-[1.55]">
          {body}
        </p>
      )}
    </>
  );
}

export function TypingDots() {
  return (
    <div
      className="nxx-rise nxx-typing"
      role="status"
      aria-live="polite"
      aria-label="Đang trả lời"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="nxx-dot"
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </div>
  );
}

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export function DaySeparator({ iso }) {
  const d = iso ? new Date(iso) : new Date();
  if (!isValidDate(d)) return null;

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  let label;
  if (isSameDay(d, now)) label = "Hôm nay";
  else if (isSameDay(d, yesterday)) label = "Hôm qua";
  else
    label = `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}${
      d.getFullYear() !== now.getFullYear() ? `/${d.getFullYear()}` : ""
    }`;

  return (
    <div className="nxx-daysep">
      {label} {fmtTime(iso)}
    </div>
  );
          }
