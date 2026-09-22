import { useState } from "react";
import useSession from "../hooks/useSession.js";
import useDeviceFingerprint from "../hooks/useDeviceFingerprint.js";
import { ShieldAlert, Headphones } from "lucide-react";

export default function DeviceChecker() {
  const { session } = useSession();
  const user = session?.user;
  const [blocked, setBlocked] = useState(null);

  useDeviceFingerprint(user?.id, (reason) => {
    setBlocked({ reason });
  });

  if (!blocked) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999998,
        background: "rgba(15, 23, 42, 0.9)",
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
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            margin: "0 auto",
            borderRadius: "50%",
            background: "#FEE2E2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ShieldAlert size={36} color="#DC2626" strokeWidth={2.2} />
        </div>

        <h2
          style={{
            fontSize: 20,
            fontWeight: 900,
            color: "#991B1B",
            marginTop: 16,
            marginBottom: 8,
          }}
        >
           Thiết bị không hợp lệ
        </h2>

        <p
          style={{
            fontSize: 13.5,
            lineHeight: 1.6,
            color: "#B91C1C",
            marginBottom: 20,
          }}
        >
          {blocked.reason}
        </p>

        <a
          href="https://zalo.me/0865245988"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "14px 20px",
            background: "linear-gradient(135deg, #0EA5E9, #2563EB)",
            color: "white",
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 900,
            textDecoration: "none",
            boxShadow: "0 4px 16px rgba(14, 165, 233, 0.35)",
          }}
        >
          <Headphones size={16} strokeWidth={2.6} />
          Chat Zalo 0865245988
        </a>

        <p
          style={{
            fontSize: 11.5,
            color: "#94A3B8",
            marginTop: 16,
            lineHeight: 1.5,
          }}
        >
           Nếu bạn cho rằng đây là nhầm lẫn, hãy liên hệ Zalo để được gỡ.
        </p>
      </div>
    </div>
  );
          }
