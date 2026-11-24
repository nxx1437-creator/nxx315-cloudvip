// src/pages/Support/splitReply.js — tách câu trả lời của AI thành vài tin ngắn liên tiếp, như người thật nhắn
const LIST_RE = /^\s*([-*•]|\d+[.)])\s+/;
const PATH_RE = /^\s*(?:.*?(?:→|->)\s*)?(?:\/[a-z0-9\-\/]+|https?:\/\/\S+)\s*$/i;

// Tách theo dòng trống. Danh sách, dòng đường dẫn, trích dẫn, đoạn đứng sau dấu ":" hoặc đoạn quá ngắn thì dính vào đoạn trước.
// Tối đa maxParts tin; ngắn hơn minLen ký tự thì không tách.
export function splitReply(text, { maxParts = 3, minLen = 80 } = {}) {
  const src = String(text || "").trim();
  if (src.length < minLen) return [src];
  const raw = src.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  if (raw.length < 2) return [src];
  const parts = [];
  for (const chunk of raw) {
    const prev = parts[parts.length - 1];
    const glue =
      prev !== undefined &&
      (LIST_RE.test(chunk) || PATH_RE.test(chunk) || chunk.startsWith(">") || /[:：]$/.test(prev) || chunk.length < 14);
    if (glue) parts[parts.length - 1] = prev + "\n\n" + chunk;
    else parts.push(chunk);
  }
  if (parts.length < 2) return [src];
  if (parts.length > maxParts) {
    const head = parts.slice(0, maxParts - 1);
    return [...head, parts.slice(maxParts - 1).join("\n\n")];
  }
  return parts;
}
