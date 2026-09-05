import { useEffect, useState, useRef } from 'react';

const CHECK_INTERVAL = 60000; // 60s, chỉnh tùy ý

export default function VersionChecker() {
  const [hasNewVersion, setHasNewVersion] = useState(false);
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
          setHasNewVersion(true);
        }
      } catch (err) {
        // im lặng bỏ qua, không làm phiền user vì lỗi mạng tạm thời
      }
    };

    checkVersion();
    const interval = setInterval(checkVersion, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  if (!hasNewVersion) return null;

  return (
    <div style={overlayStyle}>
      <div style={cardStyle}>
        <div style={iconStyle}>⚠️</div>
        <p style={labelStyle}>APPLICATION UPDATE</p>
        <h2 style={titleStyle}>Đã có bản cập nhật mới</h2>
        <p style={descStyle}>
          Trang web vừa được cập nhật. Vui lòng tải lại để dùng phiên bản mới nhất.
        </p>
        <button style={btnStyle} onClick={() => window.location.reload()}>
          ↻ Tải lại ngay
        </button>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 9999, padding: 20,
};

const cardStyle = {
  background: '#fff', borderRadius: 16, padding: '40px 28px',
  maxWidth: 340, width: '100%', textAlign: 'center',
  borderTop: '6px solid #d4ff3f', fontFamily: 'system-ui, sans-serif',
};

const iconStyle = {
  width: 56, height: 56, background: '#e8ff4d', border: '2px solid #111',
  borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
  margin: '0 auto 20px', fontSize: 26,
};

const labelStyle = { fontSize: 11, letterSpacing: 2, color: '#888', margin: 0 };
const titleStyle = { fontSize: 22, margin: '10px 0' };
const descStyle = { color: '#666', fontSize: 14, marginBottom: 24 };

const btnStyle = {
  background: '#111', color: '#fff', border: 'none', borderRadius: 999,
  padding: '14px 28px', fontSize: 15, cursor: 'pointer', width: '100%',
};
