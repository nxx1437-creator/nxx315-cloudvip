// src/components/VerifiedBadge.jsx — tích xanh xác minh
// Chỉ hiện khi profiles.is_verified = true. Cột này chỉ cấp được bằng SQL (đã có trigger chặn người dùng tự đổi).
import React from "react";

export default function VerifiedBadge({ size = 18, className = "" }) {
  return (
    <span
      className={`inline-flex shrink-0 ${className}`}
      role="img"
      aria-label="Tài khoản đã xác minh"
      title="Tài khoản đã xác minh"
    >
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="11" fill="#22c55e" />
        <path
          d="M7 12.5l3.2 3.2L17 9"
          fill="none"
          stroke="#fff"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
