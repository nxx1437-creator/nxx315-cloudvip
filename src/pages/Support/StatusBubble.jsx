// src/pages/Support/StatusBubble.jsx
// Dòng trạng thái do backend ghi (sender_type = "status").
// Khi backend UPDATE nội dung dòng này, chữ mới sẽ hiện dần từ trái sang phải.

import React from "react";
import ThinkingIndicator from "./ThinkingIndicator.jsx";

export default function StatusBubble({ message }) {
  return <ThinkingIndicator text={message.message} />;
}

