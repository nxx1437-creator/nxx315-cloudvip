// src/components/VerifiedBadge.jsx — tích xanh xác minh (style TikTok)
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
        {/* Vòng tròn gợn sóng kiểu TikTok */}
        <path
          fill="#20D5EC"
          d="M12 0.5l2.09 2.06 2.88-.6.8 2.83 2.83.8-.6 2.88L22.06 10.5 20 12l2.06 1.5-.6 2.88 2.83.8-.8 2.83-2.88-.6L19.41 21.5 17 20.5l-1.5 2.06L13 22l-1-2.5-2.5 1.5-2.06-2.06-2.88.6-.8-2.83-2.83-.8.6-2.88L-.06 12 2 10.5.06 9l.6-2.88L3.5 5.32l.8-2.83 2.88.6L9.24 1.03 12 .5z"
        />
        {/* Tick trắng */}
        <path
          d="M7.2 12.3l3.1 3.1 6.5-6.5"
          fill="none"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
