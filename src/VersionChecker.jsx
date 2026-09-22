import { useEffect, useRef, useState } from "react";

const CHECK_INTERVAL = 60 * 1000; // Check mỗi 60 giây
const STORAGE_KEY = "nxx315_app_version";

export default function VersionChecker() {
  const currentVersion = useRef(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // ========== 1. CHECK VERSION ==========
    const checkVersion = async () => {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (currentVersion.current === null) {
          currentVersion.current = data.version;
          localStorage.setItem(STORAGE_KEY, data.version);
        } else if (data.version !== currentVersion.current) {
          // ✅ Có version mới → HIỆN BANNER (không auto reload)
          console.log("[VersionChecker] New version detected:", data.version);
          setShowBanner(true);
        }
      } catch (err) {
        // Bỏ qua lỗi mạng
      }
    };

    // ========== 2. CHECK ON LOAD ==========
    const checkOnLoad = async () => {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, {
          cache: "no-store",
        });
        const data = await res.json();

        const storedVersion = localStorage.getItem(STORAGE_KEY);

        if (storedVersion && storedVersion !== data.version) {
          // ✅ LocalStorage cũ → hiện banner
          console.log("[VersionChecker] Old version detected");
          setShowBanner(true);
        }

        currentVersion.current = data.version;
        localStorage.setItem(STORAGE_KEY, data.version);
      } catch (err) {
        // Bỏ qua
      }
    };

    // ========== 3. START ==========
    checkOnLoad();

    const interval = setInterval(checkVersion, CHECK_INTERVAL);

    // Check khi user quay lại tab
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkVersion();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // ========== 4. HANDLERS ==========
  const handleReload = () => {
    // Xóa version cũ
    localStorage.removeItem(STORAGE_KEY);
    // Reload với cache bypass
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Cập nhật version để không hiện lại
    fetch(`/version.json?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        currentVersion.current = d.version;
        localStorage.setItem(STORAGE_KEY, d.version);
      })
      .catch(() => {});
  };

  // ========== 5. RENDER ==========
  if (!showBanner) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 999999,
        padding: 16,
        paddingBottom: "max(16px, env(safe-area-inset-bottom))",
        fontFamily: "system-ui, -apple-system, sans-serif",
        animation: "versionSlideUp 0.3s ease-out",
      }}
    >
      <div
        style={{
          maxWidth: 480,
          margin: "0 auto",
          background: "white",
          borderRadius: 20,
          padding: 20,
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.25)",
          border: "2px solid #FEE2E2",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              flexShrink: 0,
              borderRadius: 14,
              background: "#FEE2E2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#DC2626"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontSize: 15,
                fontWeight: 900,
                color: "#991B1B",
                margin: 0,
                marginBottom: 4,
              }}
            >
               Có lỗi xảy ra!
            </h3>
            <p
              style={{
                fontSize: 13,
                color: "#64748B",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Ứng dụng đã có phiên bản mới. Vui lòng tải lại trang để tiếp tục sử dụng.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 16,
          }}
        >
          <button
            type="button"
            onClick={handleDismiss}
            style={{
              flex: 1,
              padding: "12px 16px",
              fontSize: 13,
              fontWeight: 700,
              color: "#64748B",
              background: "#F1F5F9",
              border: "none",
              borderRadius: 12,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseDown={(e) => (e.currentTarget.style.background = "#E2E8F0")}
            onMouseUp={(e) => (e.currentTarget.style.background = "#F1F5F9")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#F1F5F9")}
          >
            Để sau
          </button>

          <button
            type="button"
            onClick={handleReload}
            style={{
              flex: 2,
              padding: "12px 16px",
              fontSize: 13,
              fontWeight: 900,
              color: "white",
              background: "linear-gradient(135deg, #DC2626, #B91C1C)",
              border: "none",
              borderRadius: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              boxShadow: "0 4px 16px rgba(220, 38, 38, 0.35)",
              transition: "transform 0.15s",
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.97)")
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
             Tải lại trang
          </button>
        </div>
      </div>

      {/* Animation */}
      <style>{`
        @keyframes versionSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
          }
