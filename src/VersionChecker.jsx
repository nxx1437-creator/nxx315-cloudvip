import { useEffect, useRef } from 'react';

const CHECK_INTERVAL = 60 * 1000; // 60 giây
const IDLE_DELAY = 30 * 1000; // Chờ 30 giây user không tương tác
const IDLE_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart', 'input'];

export default function VersionChecker() {
  const currentVersion = useRef(null);
  const pendingReload = useRef(false);
  const lastActivity = useRef(Date.now());
  const reloadTimer = useRef(null);

  useEffect(() => {
    // ========== 1. TRACK USER ACTIVITY ==========
    const handleActivity = () => {
      lastActivity.current = Date.now();

      if (pendingReload.current) {
        scheduleReload();
      }
    };

    IDLE_EVENTS.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // ========== 2. SCHEDULE RELOAD ==========
    const scheduleReload = () => {
      if (!pendingReload.current) return;

      if (reloadTimer.current) {
        clearTimeout(reloadTimer.current);
      }

      const idleTime = Date.now() - lastActivity.current;
      const waitTime = Math.max(0, IDLE_DELAY - idleTime);

      reloadTimer.current = setTimeout(() => {
        const finalIdleTime = Date.now() - lastActivity.current;

        if (finalIdleTime >= IDLE_DELAY) {
          performSilentReload();
        } else {
          scheduleReload();
        }
      }, waitTime);
    };

    // ========== 3. SILENT RELOAD ==========
    const performSilentReload = () => {
      console.log('[VersionChecker] Silent reload to new version');
      try {
        window.location.reload();
      } catch (err) {
        console.error('[VersionChecker] Reload error:', err);
      }
    };

    // ========== 4. CHECK VERSION ==========
    const checkVersion = async () => {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, {
          cache: 'no-store',
        });
        const data = await res.json();

        if (currentVersion.current === null) {
          currentVersion.current = data.version;
        } else if (data.version !== currentVersion.current) {
          console.log('[VersionChecker] New version detected:', data.version);
          pendingReload.current = true;
          scheduleReload();
        }
      } catch (err) {
        // Bỏ qua lỗi mạng
      }
    };

    // ========== 5. CHECK KHI QUAY LẠI TAB / MỞ LẠI APP ==========
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        lastActivity.current = Date.now();

        // ✅ QUAN TRỌNG: khi user quay lại tab
        // → force check version NGAY + reload nếu có version mới
        forceCheckAndReload();
      }
    };

    // ✅ Force check + reload (không đợi idle)
    const forceCheckAndReload = async () => {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, {
          cache: 'no-store',
        });
        const data = await res.json();

        if (
          currentVersion.current !== null &&
          data.version !== currentVersion.current
        ) {
          // Có version mới → reload ngay (không đợi 30s)
          console.log('[VersionChecker] Force reload on tab return');
          window.location.reload();
        } else if (currentVersion.current === null) {
          currentVersion.current = data.version;
        }
      } catch (err) {
        // Bỏ qua lỗi mạng
      }
    };

    // ========== 6. CHECK KHI PAGE LOAD LẠI ==========
    const checkOnLoad = async () => {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, {
          cache: 'no-store',
        });
        const data = await res.json();

        // Lưu version hiện tại ngay lần đầu
        if (currentVersion.current === null) {
          currentVersion.current = data.version;

          // ✅ Check xem localStorage có version cũ không
          const storedVersion = localStorage.getItem('nxx315_app_version');
          if (storedVersion && storedVersion !== data.version) {
            // Version cũ → force reload để lấy version mới
            console.log('[VersionChecker] Old version detected on load');
            localStorage.setItem('nxx315_app_version', data.version);
            window.location.reload();
            return;
          }

          // Lưu version mới
          localStorage.setItem('nxx315_app_version', data.version);
        }
      } catch (err) {
        // Bỏ qua lỗi mạng
      }
    };

    // ========== 7. START ==========
    checkOnLoad();

    const interval = setInterval(checkVersion, CHECK_INTERVAL);

    document.addEventListener('visibilitychange', handleVisibility);

    // ✅ Listen custom event để reload từ bất kỳ đâu
    const handleForceReload = () => {
      console.log('[VersionChecker] Force reload triggered');
      window.location.reload();
    };
    window.addEventListener('nxx315:force-reload', handleForceReload);

    // ========== 8. CLEANUP ==========
    return () => {
      clearInterval(interval);
      if (reloadTimer.current) clearTimeout(reloadTimer.current);
      IDLE_EVENTS.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('nxx315:force-reload', handleForceReload);
    };
  }, []);

  return null;
}
