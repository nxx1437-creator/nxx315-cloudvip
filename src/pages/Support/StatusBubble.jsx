// src/pages/Support/StatusBubble.jsx
// Dòng trạng thái do backend ghi (sender_type = "status"), hiện bằng "Thinking text".
// Mỗi lần backend đổi chữ (đang đọc câu hỏi, đang tra đơn, đang soạn trả lời...), thành một bước mới.
import React, { useEffect, useState } from "react";
import ThinkingBlock from "./ThinkingBlock.jsx";
import { beginThinking, pushThinkingLine } from "./thinkingStore.js";

// Chỉ bỏ dòng chung chung "Đang suy nghĩ..." (khối đã tự hiện chữ này khi chưa có bước nào)
const SKIP = /^đang suy nghĩ/i;

export default function StatusBubble({ message }) {
  const [lines, setLines] = useState([]);

  useEffect(() => {
    beginThinking(message.id);
  }, [message.id]);

  useEffect(() => {
    const t = String(message.message || "").trim().replace(/\.{3}$/, "…");
    if (!t || SKIP.test(t)) return;
    pushThinkingLine(t);
    setLines((prev) => (prev[prev.length - 1] === t ? prev : [...prev, t]));
  }, [message.message]);

  return (
    <div className="nxx-fade py-1">
      <ThinkingBlock lines={lines} done={false} />
    </div>
  );
}
