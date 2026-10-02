import React from "react";

export default function PageLoader() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
        <span style={{ color: "#0f172a" }}>NXX315</span>{" "}
        <span style={{ color: "#38bdf8" }}>Studio</span>
      </div>
      <div
        style={{
          marginTop: 22,
          width: 28,
          height: 28,
          border: "3px solid #e2e8f0",
          borderTopColor: "#0068FF",
          borderRadius: "50%",
          animation: "pl-spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes pl-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
