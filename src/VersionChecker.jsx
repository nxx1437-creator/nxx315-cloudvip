import { useEffect, useState, useRef } from 'react';

const CHECK_INTERVAL = 60000; // 60 giây

export default function VersionChecker() {
  const [outdated, setOutdated] = useState(false);
  const currentVersion = useRef(null);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, {
          cache: 'no-store',
        });
        const data = await res.json();

        if (currentVersion.current === null) {
          currentVersion.current = data.version;
        } else if (data.version !== currentVersion.current) {
          setOutdated(true);
        }
      } catch (err) {
        // bỏ qua lỗi mạng tạm thời
      }
    };

    checkVersion();
    const interval = setInterval(checkVersion, CHECK_INTERVAL);

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

  if (!outdated) return null;

  return (
    <div style={overlayStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Có phiên bản mới!</h1>
        <p style={textStyle}>
          Vui lòng tải lại trang để cập nhật phiên bản mới nhất trước khi tiếp tục sử dụng.
        </p>
        <button style={buttonStyle} onClick={() => window.location.reload()}>
          Tải lại trang
        </button>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed', inset: 0, zIndex: 99999,
  background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexDirection: 'column', textAlign: 'center', padding: 24,
  fontFamily: 'system-ui, sans-serif',
};
const cardStyle = { maxWidth: 320 };
const titleStyle = { fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 };
const textStyle = { fontSize: 14, color: '#64748b', marginTop: 8 };
const buttonStyle = {
  marginTop: 24, background: 'linear-gradient(to right, #38bdf8, #2563eb)',
  color: '#fff', border: 'none', borderRadius: 12, padding: '12px 24px',
  fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
};
