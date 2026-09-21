import { useEffect, useRef } from 'react';

const CHECK_INTERVAL = 60 * 1000; // 60 giây
const IDLE_DELAY = 30 * 1000; // Chờ 30 giây user không tương tác
const IDLE_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart', 'input'];

export default function VersionChecker() {
  const currentVersion = useRef(null);
  const pendingReload = useRef(false); // Có version mới → chờ reload
  const lastActivity = useRef(Date.now()); // Lần cuối user tương tác
  const reloadTimer = useRef(null);

  useEffect(() => {
    // ========== 1. TRACK USER ACTIVITY ==========
    const handleActivity = () => {
      lastActivity.current = Date.now();

      // Nếu đang chờ reload → check ngay xem user có rảnh không
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

      // Xóa timer cũ
      if (reloadTimer.current) {
        clearTimeout(reloadTimer.current);
      }

      // Kiểm tra user có đang tương tác không
      const idleTime = Date.now() - lastActivity.current;
      const waitTime = Math.max(0, IDLE_DELAY - idleTime);

      reloadTimer.current = setTimeout(() => {
        // Check lại lần cuối — user vẫn rảnh?
        const finalIdleTime = Date.now() - lastActivity.current;

        if (finalIdleTime >= IDLE_DELAY) {
          // ✅ User rảnh 30s → reload ngầm
          performSilentReload();
        } else {
          // ❌ User lại tương tác → đợi tiếp
          scheduleReload();
        }
      }, waitTime);
    };

    // ========== 3. SILENT RELOAD ==========
    const performSilentReload = () => {
      console.log('[VersionChecker] Silent reload to new version');

      // Xóa sessionStorage/cache nếu cần
      try {
        // Reload với cache bypass
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
          // Lần đầu → lưu version
          currentVersion.current = data.version;
        } else if (data.version !== currentVersion.current) {
          // Có version mới
          console.log('[VersionChecker] New version detected:', data.version);
          pendingReload.current = true;
          scheduleReload();
        }
      } catch (err) {
        // Bỏ qua lỗi mạng
      }
    };

    // ========== 5. START ==========
    checkVersion();

    const interval = setInterval(checkVersion, CHECK_INTERVAL);

    // Check khi user quay lại tab
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        lastActivity.current = Date.now();
        checkVersion();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // ========== 6. CLEANUP ==========
    return () => {
      clearInterval(interval);
      if (reloadTimer.current) clearTimeout(reloadTimer.current);
      IDLE_EVENTS.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Không render gì cả — silent
  return null;
}
