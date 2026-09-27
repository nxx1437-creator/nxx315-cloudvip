import { useEffect, useRef } from "react";

// 🔥 Dòng này SCRIPT sẽ tự update mỗi lần build
const CURRENT_VERSION = "0";

const CHECK_INTERVAL = 15 * 1000;

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

        if (serverVersion !== CURRENT_VERSION) {
          console.log("[VersionChecker] 🔥 Có bản mới, reload!");

          reloadingRef.current = true;
          sessionStorage.setItem("nxx315_last_reload", Date.now().toString());

          setTimeout(() => window.location.reload(), 100);
        }
      } catch (err) {
        console.warn("[VersionChecker] Lỗi:", err.message);
      }
    };

    checkVersion();

    const interval = setInterval(checkVersion, CHECK_INTERVAL);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") checkVersion();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return null;
}
