// src/components/VerifiedBadge.jsx — tích xanh xác minh
// Chỉ hiện khi profiles.is_verified = true. Cột này chỉ cấp được bằng SQL (đã có trigger chặn người dùng tự đổi).
// variant="circle" (mặc định, giống MoMo) hoặc variant="seal" (huy hiệu răng cưa kiểu Bootstrap/Facebook/Instagram)
import React from "react";

// Đường dẫn SVG chuẩn của Bootstrap Icons "patch-check-fill" (8 cánh bo tròn)
const SEAL_SVG_PATH =
  "M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01zm.287 5.984-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708.708";

export default function VerifiedBadge({ size = 16, variant = "circle", className = "" }) {
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
        // Nếu là seal, dùng SVG để tự vẽ nền, không dùng clip-path background nữa
        background: seal ? "transparent" : "linear-gradient(180deg, #4ade80 0%, #16a34a 100%)",
        boxShadow: seal ? undefined : "0 1px 2px rgba(22, 163, 74, 0.35)",
      }}
    >
      {seal ? (
        // Icon chuẩn Bootstrap Icons (đã gộp nền và tick vào 1 path fill)
        <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path fill="#1DA1F2" d={SEAL_SVG_PATH} />
        </svg>
      ) : (
        // Icon tròn cơ bản
        <svg width="100%" height="100%" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M6.4 12.4l3.9 3.9 7.3-7.6"
            fill="none"
            stroke="#fff"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}
