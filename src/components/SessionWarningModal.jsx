import React from "react";
import { LogOut, Clock } from "lucide-react";

export default function SessionWarningModal({
  secondsLeft,
  onContinue,
  onLogout,
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "rgba(15, 23, 42, 0.85)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 400,
          width: "100%",
          background: "white",
          borderRadius: 20,
          padding: 28,
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
          animation: "sessionPop 0.3s ease-out",
        }}
      >
        <style>{`
          @keyframes sessionPop {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes pulseRing {
            0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); }
            50% { box-shadow: 0 0 0 12px rgba(239, 68, 68, 0); }
          }
        `}</style>

        {/* Icon */}
        <div
          style={{
            width: 72,
            height: 72,
            margin: "0 auto 16px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #FEF3C7, #FDE68A)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "pulseRing 1.5s ease-in-out infinite",
          }}
        >
          <Clock size={36} color="#D97706" strokeWidth={2.2} />
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: 20,
            fontWeight: 900,
            color: "#1E293B",
            marginBottom: 8,
          }}
        >
          Phiên sắp hết hạn
        </h2>

        {/* Description */}
        <p
          style={{
            fontSize: 13.5,
            lineHeight: 1.6,
            color: "#64748B",
            marginBottom: 20,
          }}
        >
          Bạn đã không hoạt động trong một thời gian. Phiên làm việc sẽ tự động
          kết thúc sau:
        </p>

        {/* Countdown */}
        <div
          style={{
            background: "linear-gradient(135deg, #FEE2E2, #FECACA)",
            borderRadius: 16,
            padding: "16px 20px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 42,
              fontWeight: 900,
              color: "#DC2626",
              lineHeight: 1,
              letterSpacing: -1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {secondsLeft}
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 2,
              color: "#B91C1C",
              marginTop: 4,
            }}
          >
            Giây
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onLogout}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "14px 16px",
              background: "#F1F5F9",
              color: "#475569",
              border: "none",
              borderRadius: 12,
              fontSize: 13.5,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <LogOut size={15} />
            Đăng xuất
          </button>

          <button
            onClick={onContinue}
            style={{
              flex: 1.4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "14px 16px",
              background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
              color: "white",
              border: "none",
              borderRadius: 12,
              fontSize: 13.5,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 4px 16px rgba(37, 99, 235, 0.35)",
            }}
          >
            Tiếp tục làm việc
          </button>
        </div>

        <p
          style={{
            fontSize: 11,
            color: "#94A3B8",
            marginTop: 16,
            lineHeight: 1.5,
          }}
        >
          Bấm "Tiếp tục làm việc" để gia hạn phiên thêm 30 phút.
        </p>
      </div>
    </div>
  );
        }
