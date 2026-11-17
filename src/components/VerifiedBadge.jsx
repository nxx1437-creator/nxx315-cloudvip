import React from "react";

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
      }}
    >
      {seal ? (
        // ĐÂY LÀ ĐIỂM KHÁC BIỆT: Không dùng clipPath, vẽ thẳng SVG patch-check-fill
        <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            fill="#1DA1F2"
            d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01zm.287 5.984-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708.708"
          />
        </svg>
      ) : (
        <span
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: "linear-gradient(180deg, #4ade80 0%, #16a34a 100%)",
            boxShadow: "0 1px 2px rgba(22, 163, 74, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
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
        </span>
      )}
    </span>
  );
}
