import { useEffect, useRef } from "react";

const CHECK_INTERVAL = 30 * 1000; // 30 giây
const STORAGE_KEY = "nxx315_version";
const RELOAD_KEY = "nxx315_last_reload";
const RELOAD_COOLDOWN = 5 * 60 * 1000; // 5 phút

export default function VersionChecker() {
  const reloadingRef = useRef(false);

  useEffect(() => {
    // ✅ Nếu vừa reload trong 5 phút qua → BỎ QUA HOÀN TOÀN
    const lastReload = sessionStorage.getItem(RELOAD_KEY);
    if (lastReload) {
      const timeSince = Date.now() - parseInt(lastReload);
      if (timeSince < RELOAD_COOLDOWN) {
        console.log(
          `[VersionChecker] Vừa reload ${Math.floor(timeSince / 1000)}s trước, bỏ qua`
        );
        return;
      }
    }

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

        const localVersion = localStorage.getItem(STORAGE_KEY);

        // Lần đầu → lưu version, không reload
        if (!localVersion) {
          localStorage.setItem(STORAGE_KEY, serverVersion);
          return;
        }

        // Version giống → không làm gì
        if (localVersion === serverVersion) return;

        // Version khác → reload 1 lần duy nhất
        console.log(
          `[VersionChecker] Version mới: ${serverVersion} (cũ: ${localVersion})`
        );

        reloadingRef.current = true;
        localStorage.setItem(STORAGE_KEY, serverVersion);
        sessionStorage.setItem(RELOAD_KEY, Date.now().toString());

        // ✅ Delay 100ms để storage flush xong
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } catch (err) {
        console.warn("[VersionChecker] Lỗi:", err.message);
      }
    };

    // Delay 3s cho app load xong
    const initialTimeout = setTimeout(checkVersion, 3000);

    // Check định kỳ
    const interval = setInterval(checkVersion, CHECK_INTERVAL);

    // Check khi quay lại tab — giới hạn 1 lần/10s
    let lastVisibilityCheck = 0;
    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return;
      const now = Date.now();
      if (now - lastVisibilityCheck < 10 * 1000) return;
      lastVisibilityCheck = now;
      checkVersion();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return null;
}
