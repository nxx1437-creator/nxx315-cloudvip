// src/pages/Support/ChatBits.jsx — mảnh nhỏ dùng chung: trích dẫn, chấm đang gõ, mốc thời gian
import React from "react";

export const fmtTime = (iso) => {
  const d = iso ? new Date(iso) : new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

// "> trích dẫn\n\nnội dung" -> { quote, body }
export function splitQuote(text) {
  const lines = String(text || "").split("\n");
  const q = [];
  while (lines.length && lines[0].startsWith("> ")) q.push(lines.shift().slice(2));
  while (lines.length && lines[0].trim() === "") lines.shift();
  return { quote: q.join(" "), body: lines.join("\n") };
}

export function QuotedText({ text }) {
  const { quote, body } = splitQuote(text);
  return (
    <>
      {quote && <div className="nxx-quote"><b>Trích dẫn</b><span className="line-clamp-3">{quote}</span></div>}
      {body && <p className="whitespace-pre-wrap break-words text-[16px] leading-[1.55]">{body}</p>}
    </>
  );
}

export function TypingDots() {
  return (
    <div className="nxx-rise nxx-typing" role="status" aria-label="Đang trả lời">
      {[0, 1, 2].map((i) => <span key={i} className="nxx-dot" style={{ animationDelay: `${i * 0.18}s` }} />)}
    </div>
  );
}

export function DaySeparator({ iso }) {
  const d = new Date(iso);
  const now = new Date();
  const same = d.toDateString() === now.toDateString();
  const label = same ? "Hôm nay" : `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  return <div className="nxx-daysep">{label} {fmtTime(iso)}</div>;
}
