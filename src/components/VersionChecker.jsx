import { useEffect, useRef } from "react";

// 🔥 VERSION NÀY PHẢI KHỚP version.json
const CURRENT_VERSION = "2.0.0";

const CHECK_INTERVAL = 15 * 1000; // 15 giây
const RELOAD_KEY = "nxx315_last_reload";

export default function VersionChecker() {
  const reloadingRef = useRef(false);

  useEffect(() => {
    const checkVersion = async () => {
      if (reloadingRef.current) return;

      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!res.ok) return;

        const data = await res.json();
        const serverVersion = data?.version;
        if (!serverVersion) return;

        console.log(
          `[VersionChecker] app=${CURRENT_VERSION} server=${serverVersion}`
        );

        // ✅ Nếu version server KHÁC version app đang chạy → reload
        if (serverVersion !== CURRENT_VERSION) {
          console.log(`[VersionChecker] 🔥 Có bản mới, reload!`);

          reloadingRef.current = true;
          sessionStorage.setItem(RELOAD_KEY, Date.now().toString());

          // Delay 100ms để storage flush
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }
      } catch (err) {
        console.warn("[VersionChecker] Lỗi:", err.message);
      }
    };

    // Check ngay lập tức (không delay)
    checkVersion();

    // Check định kỳ 15 giây
    const interval = setInterval(checkVersion, CHECK_INTERVAL);

    // Check khi quay lại tab
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

  return null;
}
