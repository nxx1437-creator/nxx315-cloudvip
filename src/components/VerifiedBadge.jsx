// src/components/VerifiedBadge.jsx — tích xanh xác minh
// Chỉ hiện khi profiles.is_verified = true. Cột này chỉ cấp được bằng SQL (đã có trigger chặn người dùng tự đổi).
// variant="circle" (mặc định, giống MoMo) hoặc variant="seal" (huy hiệu răng cưa kiểu Facebook/Instagram)
import React from "react";

const SEAL_CLIP =
  "polygon(50.0% 0.0%, 66.3% 10.7%, 85.4% 14.6%, 89.3% 33.7%, 100.0% 50.0%, 89.3% 66.3%, 85.4% 85.4%, 66.3% 89.3%, 50.0% 100.0%, 33.7% 89.3%, 14.6% 85.4%, 10.7% 66.3%, 0.0% 50.0%, 10.7% 33.7%, 14.6% 14.6%, 33.7% 10.7%)";

export default function VerifiedBadge({ size = 18, variant = "circle", className = "" }) {
  const seal = variant === "seal";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center align-middle ${className}`}
      role="img"
      aria-label="Tài khoản đã xác minh"
      title="Tài khoản đã xác minh"
      style={{
        width: size,
        height: size,
        borderRadius: seal ? 0 : "50%",
        clipPath: seal ? SEAL_CLIP : undefined,
        background: "linear-gradient(180deg, #4ade80 0%, #16a34a 100%)",
        boxShadow: seal ? undefined : "0 1px 2px rgba(22, 163, 74, 0.35)",
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d={seal ? "M7 12.4l3.4 3.4 6.6-6.9" : "M6.4 12.4l3.9 3.9 7.3-7.6"}
          fill="none"
          stroke="#fff"
          strokeWidth={seal ? 2.9 : 3.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
