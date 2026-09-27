import React from "react";

/**
 * Fallback cho <Suspense> — không bao giờ để màn hình trắng.
 * Nền xám nhạt + spinner xanh, khớp theme #3478F6.
 */
export default function PageLoader() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
        zIndex: 50,
      }}
    >
      <div className="app-spinner" />
    </div>
  );
}
