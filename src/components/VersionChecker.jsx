import { useEffect, useRef } from "react";

const CHECK_INTERVAL = 30 * 1000; // 30 giây
const STORAGE_KEY = "nxx315_version";

export default function VersionChecker() {
  const reloadedRef = useRef(false);

  useEffect(() => {
    // ✅ Check nếu đã reload trong 5 phút qua → không reload nữa (tránh loop)
    const lastReload = sessionStorage.getItem("nxx315_last_reload");
    if (lastReload) {
      const timeSince = Date.now() - parseInt(lastReload);
      if (timeSince < 5 * 60 * 1000) {
        console.log("[VersionChecker] Đã reload gần đây, bỏ qua");
        return;
      }
    }

    const checkVersion = async () => {
      if (reloadedRef.current) return;

      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, {
          cache: "no-store",
        });
        const data = await res.json();

        const serverVersion = data?.version;
        if (!serverVersion) return;

        const localVersion = localStorage.getItem(STORAGE_KEY);

        // ✅ Lần đầu vào → lưu version
        if (!localVersion) {
          localStorage.setItem(STORAGE_KEY, serverVersion);
          return;
        }

        // ✅ Version khác → reload
        if (localVersion !== serverVersion) {
          console.log(
            `[VersionChecker] Version mới: ${serverVersion} (cũ: ${localVersion})`
          );

          reloadedRef.current = true;
          localStorage.setItem(STORAGE_KEY, serverVersion);
          sessionStorage.setItem("nxx315_last_reload", Date.now().toString());

          // ✅ Force reload — bỏ qua cache
          window.location.reload(true);
        }
      } catch (err) {
        console.warn("[VersionChecker] Lỗi check version:", err.message);
      }
    };

    // Check ngay lần đầu
    checkVersion();

    // Check định kỳ
    const interval = setInterval(checkVersion, CHECK_INTERVAL);

    // ✅ Check khi user quay lại tab
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
