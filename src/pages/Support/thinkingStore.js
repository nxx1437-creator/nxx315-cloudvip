// Giữ các bước "suy nghĩ" của lượt trả lời hiện tại để gắn vào tin nhắn AI khi nó xuất hiện.
let pending = null;
const taken = new Map(); // messageId -> { lines, seconds }
const MAX_AGE_MS = 3 * 60 * 1000;

export function beginThinking(statusId) {
  if (pending && pending.id === statusId) return;
  pending = { id: statusId, startedAt: Date.now(), lines: [] };
}

export function pushThinkingLine(text) {
  if (!pending) pending = { id: null, startedAt: Date.now(), lines: [] };
  if (pending.lines[pending.lines.length - 1] !== text) pending.lines.push(text);
}

export function takeThinking(messageId) {
  if (taken.has(messageId)) return taken.get(messageId);
  if (!pending || Date.now() - pending.startedAt > MAX_AGE_MS) {
    pending = null;
    return null;
  }
  const result = {
    lines: pending.lines.slice(),
    seconds: Math.max(1, Math.round((Date.now() - pending.startedAt) / 1000)),
  };
  pending = null;
  taken.set(messageId, result);
  return result;
}
