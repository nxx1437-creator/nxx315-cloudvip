import { useEffect, useRef } from "react";

const CHECK_INTERVAL = 30 * 1000; // 30 giây
const STORAGE_KEY = "nxx315_version";
const RELOAD_KEY = "nxx315_last_reload";
const RELOAD_COOLDOWN = 5 * 60 * 1000; // 5 phút

export default function VersionChecker() {
  const reloadingRef = useRef(false);

  useEffect(() => {
    // ✅ Check 1: Nếu vừa reload trong 5 phút qua → BỎ QUA HOÀN TOÀN
    const lastReload = sessionStorage.getItem(RELOAD_KEY);
    if (lastReload) {
      const timeSince = Date.now() - parseInt(lastReload);
      if (timeSince < RELOAD_COOLDOWN) {
        console.log(
          `[VersionChecker] Vừa reload ${Math.floor(timeSince / 1000)}s trước, bỏ qua`
        );
        return; // ⛔ Thoát luôn, không setup interval
      }
    }

    const checkVersion = async () => {
      // ✅ Nếu đang trong quá trình reload → bỏ qua
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

        // ✅ Lần đầu vào → lưu version, không reload
        if (!localVersion) {
          localStorage.setItem(STORAGE_KEY, serverVersion);
          console.log(`[VersionChecker] Lần đầu: lưu version ${serverVersion}`);
          return;
        }

        // ✅ Version giống nhau → không làm gì
        if (localVersion === serverVersion) return;

        // ✅ Version khác → reload 1 lần duy nhất
        console.log(
          `[VersionChecker] Version mới: ${serverVersion} (cũ: ${localVersion})`
        );

        // ⚠️ QUAN TRỌNG: Set flag TRƯỚC để chặn double-reload
        reloadingRef.current = true;

        // ⚠️ QUAN TRỌNG: Lưu localStorage TRƯỚC KHI reload
        //    (để chắc chắn flush xong mới reload)
        localStorage.setItem(STORAGE_KEY, serverVersion);
        sessionStorage.setItem(RELOAD_KEY, Date.now().toString());

        // ✅ Delay nhỏ để đảm bảo storage flush
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } catch (err) {
        console.warn("[VersionChecker] Lỗi:", err.message);
      }
    };

    // ✅ Delay lần check đầu 3s cho app load xong
    const initialTimeout = setTimeout(checkVersion, 3000);

    // ✅ Check định kỳ
    const interval = setInterval(checkVersion, CHECK_INTERVAL);

    // ✅ Check khi user quay lại tab (giới hạn 1 lần/10s)
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
