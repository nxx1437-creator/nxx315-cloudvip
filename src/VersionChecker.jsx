import { useEffect, useState, useRef } from 'react';

const CHECK_INTERVAL = 60000; // 60s
const AUTO_RELOAD_DELAY = 3000; // chờ 3s rồi tự reload

export default function VersionChecker() {
  const [updating, setUpdating] = useState(false);
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
          setUpdating(true);
          setTimeout(() => {
            window.location.reload();
          }, AUTO_RELOAD_DELAY);
        }
      } catch (err) {
        // bỏ qua lỗi mạng tạm thời
      }
    };

    checkVersion();
    const interval = setInterval(checkVersion, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  if (!updating) return null;

  return (
    <div style={toastStyle}>
      <span style={dotStyle} />
      Đang cập nhật phiên bản mới...
    </div>
  );
}

const toastStyle = {
  position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
  background: '#111', color: '#fff', padding: '12px 20px', borderRadius: 999,
  fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
  zIndex: 9999, fontFamily: 'system-ui, sans-serif', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
};

const dotStyle = {
  width: 8, height: 8, borderRadius: '50%', background: '#4ade80',
  animation: 'pulse 1s infinite',
};
