import { useEffect, useRef, useState } from 'react';

const CHECK_INTERVAL = 30 * 1000; // Check mỗi 30s
const STORAGE_KEY = 'nxx315_app_version';
const COUNTDOWN_SECONDS = 5; // Đếm ngược 5 giây trước khi reload

export default function VersionChecker() {
  const currentVersion = useRef(null);
  const hasTriggered = useRef(false);
  const reloadTimer = useRef(null);

  const [showBanner, setShowBanner] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  // ========== TRIGGER UPDATE ==========
  const triggerUpdate = (newVersion) => {
    if (hasTriggered.current) return;
    hasTriggered.current = true;

    console.log(`[VersionChecker] New version detected: ${newVersion}`);
    console.log(`[VersionChecker] Auto reload in ${COUNTDOWN_SECONDS}s...`);

    // Lưu version mới
    localStorage.setItem(STORAGE_KEY, newVersion);

    // Hiện banner
    setShowBanner(true);
    setCountdown(COUNTDOWN_SECONDS);

    // Đếm ngược
    let remaining = COUNTDOWN_SECONDS;
    const countdownInterval = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);

      if (remaining <= 0) {
        clearInterval(countdownInterval);
        performReload();
      }
    }, 1000);

    reloadTimer.current = countdownInterval;
  };

  const performReload = () => {
    if (reloadTimer.current) clearInterval(reloadTimer.current);
    console.log('[VersionChecker] Reloading now...');
    window.location.reload();
  };

  // ========== CHECK VERSION ==========
  const checkVersion = async () => {
    // Đã trigger rồi → không check nữa
    if (hasTriggered.current) return;

    try {
      const res = await fetch(`/version.json?t=${Date.now()}`, {
        cache: 'no-store',
      });
      const data = await res.json();

      if (currentVersion.current === null) {
        currentVersion.current = data.version;
        localStorage.setItem(STORAGE_KEY, data.version);
        return;
      }

      if (data.version !== currentVersion.current) {
        triggerUpdate(data.version);
      }
    } catch (err) {
      // Bỏ qua lỗi mạng
    }
  };

  // ========== CHECK ON LOAD ==========
  const checkOnLoad = async () => {
    try {
      const res = await fetch(`/version.json?t=${Date.now()}`, {
        cache: 'no-store',
      });
      const data = await res.json();

      const storedVersion = localStorage.getItem(STORAGE_KEY);

      // Version localStorage khác version server → trigger update
      if (storedVersion && storedVersion !== data.version) {
        triggerUpdate(data.version);
        return;
      }

      currentVersion.current = data.version;
      localStorage.setItem(STORAGE_KEY, data.version);
    } catch (err) {
      // Bỏ qua
    }
  };

  // ========== EFFECTS ==========
  useEffect(() => {
    checkOnLoad();

    const interval = setInterval(checkVersion, CHECK_INTERVAL);

    // Check khi quay lại tab
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };

    // Check khi focus window
    const handleFocus = () => {
      checkVersion();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);

    // Listen custom event để force reload từ bất kỳ đâu
    const handleForceReload = () => {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    };
    window.addEventListener('nxx315:force-reload', handleForceReload);

    return () => {
      clearInterval(interval);
      if (reloadTimer.current) clearInterval(reloadTimer.current);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('nxx315:force-reload', handleForceReload);
    };
  }, []);

  // ========== RENDER ==========
  if (!showBanner) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 380,
          width: '100%',
          background: 'white',
          borderRadius: 20,
          padding: 28,
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
          animation: 'versionPop 0.3s ease-out',
        }}
      >
        {/* Icon */}
        <div
          style={{
            fontSize: 56,
            marginBottom: 16,
            animation: 'versionSpin 2s linear infinite',
            display: 'inline-block',
          }}
        >
          🔄
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: '#0f172a',
            margin: 0,
            marginBottom: 8,
          }}
        >
          Có bản cập nhật mới!
        </h2>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 14,
            color: '#64748b',
            margin: 0,
            marginBottom: 20,
            lineHeight: 1.5,
          }}
        >
          Ứng dụng sẽ tự động tải lại để cập nhật phiên bản mới nhất.
        </p>

        {/* Countdown */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #EAF2FE 0%, #D9E7FD 100%)',
            borderRadius: 12,
            marginBottom: 20,
          }}
        >
          <span
            style={{
              fontSize: 14,
              color: '#3478F6',
              fontWeight: 600,
            }}
          >
            Tự động tải lại sau
          </span>
          <span
            style={{
              fontSize: 24,
              fontWeight: 900,
              color: '#3478F6',
              minWidth: 32,
              display: 'inline-block',
            }}
          >
            {countdown}
          </span>
          <span
            style={{
              fontSize: 14,
              color: '#3478F6',
              fontWeight: 600,
            }}
          >
            giây
          </span>
        </div>

        {/* Button */}
        <button
          onClick={performReload}
          style={{
            width: '100%',
            padding: '14px 20px',
            fontSize: 15,
            fontWeight: 700,
            color: 'white',
            background: 'linear-gradient(135deg, #3478F6 0%, #0878C9 100%)',
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(52, 120, 246, 0.35)',
            transition: 'transform 0.15s ease-out',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          🚀 Tải lại ngay
        </button>

        {/* Hint */}
        <p
          style={{
            fontSize: 11.5,
            color: '#94a3b8',
            marginTop: 16,
            margin: 0,
            marginTop: 16,
            lineHeight: 1.5,
          }}
        >
          💡 Nếu bạn đang nhập thông tin, hãy lưu lại trước khi tải lại.
        </p>
      </div>

      {/* Global animation */}
      <style>{`
        @keyframes versionPop {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes versionSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
        }
